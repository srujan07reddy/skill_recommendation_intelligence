"""
SSIP Administration & Operational Telemetry Endpoints
PAGE_SPECIFICATIONS.md §8, SESSION_MANAGEMENT.md §14
Provides academic structure management, school/department onboarding, Dean & HOD credential
provisioning, skill taxonomy lookup, and operational lifecycle monitoring.
"""
import os
import re
import tempfile
import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload

from app.core.exceptions import (
    ConflictException,
    ForbiddenException,
    NotFoundException,
    ValidationException,
)
from app.core.security import decode_access_token, get_password_hash
from app.core.permissions import require_roles, get_current_token_payload
from app.storage.persistent.database import get_db
from app.storage.persistent.models.academic import School, Department, Program
from app.storage.persistent.models.taxonomy import SkillDomain, SkillCategory, Skill, SkillAlias
from app.storage.persistent.models.user import User, Role, UserRole
from app.storage.session_factory import get_session_store
from app.storage.interfaces.session_store import AbstractSessionStore
from app.modules.session_cleanup.cleanup_worker import get_cleanup_worker
from app.schemas.admin import (
    SchoolCreateRequest,
    DepartmentCreateRequest,
    DeanCreateRequest,
    HodCreateRequest,
    DeanUpdateRequest,
    HodUpdateRequest,
    StaffCredentialResponse,
    UserStatusUpdateRequest,
    ResetPasswordRequest,
)

router = APIRouter(prefix="/admin", tags=["Administration & Operations"])


async def _resolve_school(school_identifier: str, db: AsyncSession) -> School:
    """Resolve School by UUID or school_code."""
    school = None
    try:
        sch_uuid = uuid.UUID(str(school_identifier).strip())
        res = await db.execute(select(School).where(School.school_id == sch_uuid))
        school = res.scalar_one_or_none()
    except (ValueError, TypeError):
        res = await db.execute(
            select(School).where(func.upper(School.school_code) == school_identifier.strip().upper())
        )
        school = res.scalar_one_or_none()

    if not school:
        raise NotFoundException(f"School '{school_identifier}' not found.")
    return school


async def _resolve_department(dept_identifier: str, db: AsyncSession) -> Department:
    """Resolve Department by UUID or department_code."""
    dept = None
    try:
        dept_uuid = uuid.UUID(str(dept_identifier).strip())
        res = await db.execute(
            select(Department)
            .where(Department.department_id == dept_uuid)
            .options(selectinload(Department.school))
        )
        dept = res.scalar_one_or_none()
    except (ValueError, TypeError):
        res = await db.execute(
            select(Department)
            .where(func.upper(Department.department_code) == dept_identifier.strip().upper())
            .options(selectinload(Department.school))
        )
        dept = res.scalar_one_or_none()

    if not dept:
        raise NotFoundException(f"Department '{dept_identifier}' not found.")
    return dept


async def _derive_unique_username(preferred: Optional[str], email: str, db: AsyncSession) -> str:
    """Resolve explicit username or generate a unique clean username from email."""
    if preferred and preferred.strip():
        candidate = preferred.strip().lower()
        existing = await db.execute(
            select(User).where(func.lower(User.username) == candidate)
        )
        if existing.scalar_one_or_none():
            raise ConflictException(f"Username '{candidate}' is already taken.")
        return candidate

    base = re.sub(r'[^a-zA-Z0-9._-]', '_', email.split('@')[0]).lower()[:60]
    candidate = base or f"user_{uuid.uuid4().hex[:6]}"
    suffix = 1
    while True:
        existing = await db.execute(
            select(User).where(func.lower(User.username) == candidate)
        )
        if not existing.scalar_one_or_none():
            return candidate
        candidate = f"{base}_{suffix}"
        suffix += 1


async def _create_scoped_staff_account(
    *,
    role_name: str,
    full_name: str,
    email: str,
    username: Optional[str],
    password: str,
    must_change_password: bool,
    school: School,
    department: Optional[Department],
    db: AsyncSession,
) -> StaffCredentialResponse:
    """Shared transactional builder for creating a School-scoped Dean or Department-scoped HOD."""
    clean_email = email.strip().lower()
    dup_email = await db.execute(
        select(User).where(func.lower(User.email) == clean_email)
    )
    if dup_email.scalar_one_or_none():
        raise ConflictException(f"Email '{clean_email}' is already registered to another user.")

    final_username = await _derive_unique_username(username, clean_email, db)

    role_res = await db.execute(select(Role).where(Role.role_name == role_name))
    role_obj = role_res.scalar_one_or_none()
    if not role_obj:
        role_obj = Role(role_name=role_name, description=f"{role_name} role", is_system_role=True)
        db.add(role_obj)
        await db.flush()

    new_user = User(
        username=final_username,
        email=clean_email,
        password_hash=get_password_hash(password),
        full_name=full_name.strip(),
        account_status="Active",
        auth_provider="local",
        must_change_password=must_change_password,
    )
    db.add(new_user)
    await db.flush()

    user_role = UserRole(
        user_id=new_user.user_id,
        role_id=role_obj.role_id,
        school_id=school.school_id,
        department_id=department.department_id if department else None,
        is_active=True,
    )
    db.add(user_role)
    await db.commit()

    return StaffCredentialResponse(
        user_id=str(new_user.user_id),
        full_name=new_user.full_name,
        email=new_user.email,
        username=new_user.username,
        role=role_name,
        school_id=str(school.school_id),
        school_code=school.school_code,
        school_name=school.school_name,
        department_id=str(department.department_id) if department else None,
        department_code=department.department_code if department else None,
        department_name=department.department_name if department else None,
        account_status=new_user.account_status,
        must_change_password=new_user.must_change_password,
    )


async def _list_staff_accounts(
    role_name: str,
    db: AsyncSession,
    school_id_filter: Optional[uuid.UUID] = None,
) -> List[StaffCredentialResponse]:
    """List provisioned Dean or HOD accounts optionally filtered by School."""
    stmt = (
        select(UserRole)
        .join(Role, UserRole.role_id == Role.role_id)
        .join(User, UserRole.user_id == User.user_id)
        .where(Role.role_name == role_name, UserRole.is_active == True)
        .options(selectinload(UserRole.user), selectinload(UserRole.school))
        .order_by(User.full_name)
    )
    res = await db.execute(stmt)
    user_roles = res.scalars().all()

    # Pre-fetch departments lookup map for resolving department names/schools cleanly
    dept_res = await db.execute(select(Department).options(selectinload(Department.school)))
    dept_map = {d.department_id: d for d in dept_res.scalars().all()}

    items: List[StaffCredentialResponse] = []
    for ur in user_roles:
        dept = dept_map.get(ur.department_id) if ur.department_id else None
        sch = ur.school or (dept.school if dept else None)
        resolved_school_id = sch.school_id if sch else ur.school_id

        if school_id_filter and resolved_school_id != school_id_filter:
            continue

        u = ur.user
        items.append(
            StaffCredentialResponse(
                user_id=str(u.user_id),
                full_name=u.full_name,
                email=u.email,
                username=u.username,
                role=role_name,
                school_id=str(sch.school_id) if sch else None,
                school_code=sch.school_code if sch else None,
                school_name=sch.school_name if sch else None,
                department_id=str(dept.department_id) if dept else None,
                department_code=dept.department_code if dept else None,
                department_name=dept.department_name if dept else None,
                account_status=u.account_status,
                must_change_password=u.must_change_password,
            )
        )
    return items


@router.get(
    "/schools",
    summary="List Jeppiaar Schools, Departments, and Academic Programmes",
)
async def list_academic_structure(
    db: AsyncSession = Depends(get_db),
    current_token: Dict[str, Any] = Depends(require_roles(["Dean", "Administrator"])),
):
    """
    Returns hierarchical academic structure: School -> Department -> Program.
    Deans only see their assigned School; Administrators see all schools for overall view.
    """
    stmt = (
        select(School)
        .options(
            selectinload(School.departments).selectinload(Department.programs)
        )
        .order_by(School.school_name)
    )

    user_roles = [r.lower() for r in current_token.get("roles", [])]
    user_school_id = current_token.get("school_id")
    if "dean" in user_roles and "administrator" not in user_roles and user_school_id:
        import uuid
        try:
            target_uuid = uuid.UUID(str(user_school_id))
            stmt = stmt.where(School.school_id == target_uuid)
        except Exception:
            pass

    res = await db.execute(stmt)
    schools = res.scalars().all()

    result = []
    for s in schools:
        depts_data = []
        for d in s.departments:
            programs_data = [
                {
                    "program_id": str(p.program_id),
                    "program_code": p.program_code,
                    "program_name": p.program_name,
                    "qualification": p.qualification,
                    "is_active": p.is_active,
                }
                for p in d.programs
            ]
            depts_data.append({
                "department_id": str(d.department_id),
                "department_code": d.department_code,
                "department_name": d.department_name,
                "is_active": d.is_active,
                "programs": programs_data,
            })
        result.append({
            "school_id": str(s.school_id),
            "school_code": s.school_code,
            "school_name": s.school_name,
            "is_active": s.is_active,
            "departments": depts_data,
        })
    return result


@router.get(
    "/taxonomy",
    summary="List Skill Domains, Categories, Skills, and Aliases",
)
async def list_taxonomy_explorer(
    db: AsyncSession = Depends(get_db),
    current_token: Dict[str, Any] = Depends(require_roles(["Dean", "Administrator", "HOD"])),
):
    """
    Returns full canonical skill taxonomy hierarchy and alias resolution rules.
    """
    stmt = (
        select(SkillDomain)
        .options(
            selectinload(SkillDomain.categories)
            .selectinload(SkillCategory.skills)
            .selectinload(Skill.aliases)
        )
        .order_by(SkillDomain.domain_name)
    )
    res = await db.execute(stmt)
    domains = res.scalars().all()

    result = []
    for dom in domains:
        cats_data = []
        for cat in dom.categories:
            skills_data = [
                {
                    "skill_id": str(sk.skill_id),
                    "skill_code": sk.skill_code,
                    "skill_name": sk.skill_name,
                    "description": sk.description,
                    "aliases": [a.alias_name for a in sk.aliases],
                    "is_active": sk.is_active,
                }
                for sk in cat.skills
            ]
            cats_data.append({
                "category_id": str(cat.category_id),
                "category_code": cat.category_code,
                "category_name": cat.category_name,
                "skills": skills_data,
            })
        result.append({
            "domain_id": str(dom.domain_id),
            "domain_code": dom.domain_code,
            "domain_name": dom.domain_name,
            "categories": cats_data,
        })
    return result


@router.get(
    "/telemetry",
    summary="Operational Telemetry & Lifecycle Monitoring",
)
async def get_operational_telemetry(
    session_store: AbstractSessionStore = Depends(get_session_store),
    db: AsyncSession = Depends(get_db),
    current_token: Dict[str, Any] = Depends(require_roles(["Dean", "Administrator"])),
):
    """
    Provides real-time system telemetry, active session counts, and storage metrics (PAGE_SPECIFICATIONS.md §8.10).
    """
    # 1. Ephemeral session counts by lifecycle state
    sessions = await session_store.list_sessions()
    status_counts = {"Active": 0, "Created": 0, "Closed": 0, "Expired": 0, "Cleaning": 0, "Cleaned": 0}
    for s in sessions:
        st = s.get("status", "Unknown")
        status_counts[st] = status_counts.get(st, 0) + 1

    # 2. Database statistics
    user_count = (await db.execute(select(func.count(User.user_id)))).scalar() or 0
    dept_count = (await db.execute(select(func.count(Department.department_id)))).scalar() or 0
    skill_count = (await db.execute(select(func.count(Skill.skill_id)))).scalar() or 0

    # 3. Temporary storage directory metrics
    export_dir = os.path.join(tempfile.gettempdir(), "ssip_exports")
    temp_files_count = 0
    temp_files_bytes = 0
    if os.path.exists(export_dir):
        for f in os.listdir(export_dir):
            fp = os.path.join(export_dir, f)
            if os.path.isfile(fp):
                temp_files_count += 1
                temp_files_bytes += os.path.getsize(fp)

    return {
        "platform": "Student Skill Intelligence Platform (SSIP)",
        "version": "1.0",
        "institutional_scope": "Jeppiaar University",
        "privacy_enforcement": "Zero-Retention Ephemeral Privacy (7 Boundaries Verified)",
        "sessions_lifecycle": {
            "total_active_windows": len(sessions),
            "breakdown": status_counts,
        },
        "persistent_counts": {
            "active_users": user_count,
            "departments": dept_count,
            "approved_skills": skill_count,
        },
        "ephemeral_storage": {
            "session_buffer": "In-Memory TTL Store (Zero Student PII in DB)",
            "temp_export_files_count": temp_files_count,
            "temp_export_disk_bytes": temp_files_bytes,
        },
    }


@router.post(
    "/cleanup/sweep",
    summary="Trigger Authoritative Cleanup Sweep",
)
async def trigger_cleanup_sweep(
    session_store: AbstractSessionStore = Depends(get_session_store),
    current_token: Dict[str, Any] = Depends(require_roles(["Dean", "Administrator"])),
):
    """
    Manually invoke the background cleanup worker to sweep expired sessions and unlink temp disk files.
    """
    worker = get_cleanup_worker(session_store)
    report = await worker.sweep_once()
    return report


@router.post(
    "/schools",
    status_code=status.HTTP_201_CREATED,
    summary="Administrator Creates a New University School",
)
async def create_school(
    payload: SchoolCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_token: Dict[str, Any] = Depends(require_roles(["Administrator"])),
):
    """Create a constituent School under Jeppiaar University (Administrator only)."""
    clean_code = payload.school_code.strip().upper()
    dup = await db.execute(
        select(School).where(func.upper(School.school_code) == clean_code)
    )
    if dup.scalar_one_or_none():
        raise ConflictException(f"School code '{clean_code}' already exists.")

    school = School(
        school_code=clean_code,
        school_name=payload.school_name.strip(),
        description=payload.description.strip() if payload.description else None,
        is_active=True,
    )
    db.add(school)
    await db.commit()
    await db.refresh(school)

    return {
        "school_id": str(school.school_id),
        "school_code": school.school_code,
        "school_name": school.school_name,
        "description": school.description,
        "is_active": school.is_active,
        "departments": [],
    }


@router.post(
    "/departments",
    status_code=status.HTTP_201_CREATED,
    summary="Administrator Adds a Department Under a School",
)
async def create_department_for_school(
    payload: DepartmentCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_token: Dict[str, Any] = Depends(require_roles(["Administrator"])),
):
    """Add a new academic department (and optional degree programme) under a School (Administrator only)."""
    school = await _resolve_school(payload.school_id, db)

    clean_code = payload.department_code.strip().upper()
    dup = await db.execute(
        select(Department).where(func.upper(Department.department_code) == clean_code)
    )
    if dup.scalar_one_or_none():
        raise ConflictException(f"Department code '{clean_code}' already exists.")

    dept = Department(
        school_id=school.school_id,
        department_code=clean_code,
        department_name=payload.department_name.strip(),
        is_active=True,
    )
    db.add(dept)
    await db.flush()

    programs_out = []
    if payload.program_code and payload.program_name:
        prog_code = payload.program_code.strip().upper()
        dup_prog = await db.execute(
            select(Program).where(func.upper(Program.program_code) == prog_code)
        )
        if dup_prog.scalar_one_or_none():
            raise ConflictException(f"Programme code '{prog_code}' already exists.")

        prog = Program(
            department_id=dept.department_id,
            program_code=prog_code,
            program_name=payload.program_name.strip(),
            qualification=(payload.qualification or "B.Tech").strip(),
            is_active=True,
        )
        db.add(prog)
        await db.flush()
        programs_out.append({
            "program_id": str(prog.program_id),
            "program_code": prog.program_code,
            "program_name": prog.program_name,
            "qualification": prog.qualification,
            "is_active": prog.is_active,
        })

    await db.commit()
    return {
        "department_id": str(dept.department_id),
        "school_id": str(school.school_id),
        "school_code": school.school_code,
        "school_name": school.school_name,
        "department_code": dept.department_code,
        "department_name": dept.department_name,
        "is_active": dept.is_active,
        "programs": programs_out,
    }


@router.get(
    "/deans",
    response_model=List[StaffCredentialResponse],
    summary="List School Deans (Administrator Only)",
)
async def list_deans(
    school_id: Optional[str] = Query(None, description="Filter by School UUID or code"),
    db: AsyncSession = Depends(get_db),
    current_token: Dict[str, Any] = Depends(require_roles(["Administrator"])),
):
    """Administrator lists all provisioned Dean accounts across university schools."""
    school_uuid = None
    if school_id:
        sch = await _resolve_school(school_id, db)
        school_uuid = sch.school_id
    return await _list_staff_accounts("Dean", db, school_id_filter=school_uuid)


@router.post(
    "/deans",
    response_model=StaffCredentialResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Administrator Provisions Dean Credentials for a School",
)
async def create_dean_account(
    payload: DeanCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_token: Dict[str, Any] = Depends(require_roles(["Administrator"])),
):
    """
    Create Dean email & login credentials for a School.
    Enforces One Dean per School rule unless replace_existing=True.
    """
    school = await _resolve_school(payload.school_id, db)

    existing_dean_stmt = (
        select(UserRole)
        .join(Role, UserRole.role_id == Role.role_id)
        .where(
            Role.role_name == "Dean",
            UserRole.school_id == school.school_id,
            UserRole.is_active == True,
        )
        .options(selectinload(UserRole.user))
    )
    existing_deans = (await db.execute(existing_dean_stmt)).scalars().all()
    if existing_deans:
        if not payload.replace_existing:
            current = existing_deans[0].user
            raise ConflictException(
                f"{school.school_name} ({school.school_code}) already has an assigned Dean: "
                f"{current.full_name} ({current.email}). Disable or enable 'Replace existing Dean' to reassign."
            )
        for ur in existing_deans:
            ur.is_active = False

    return await _create_scoped_staff_account(
        role_name="Dean",
        full_name=payload.full_name,
        email=payload.email,
        username=payload.username,
        password=payload.password,
        must_change_password=payload.must_change_password,
        school=school,
        department=None,
        db=db,
    )


@router.get(
    "/hods",
    response_model=List[StaffCredentialResponse],
    summary="List HOD Accounts (Dean sees their School HODs; Admin sees all)",
)
async def list_hods(
    school_id: Optional[str] = Query(None, description="Optional School filter (Admin only)"),
    db: AsyncSession = Depends(get_db),
    current_token: Dict[str, Any] = Depends(require_roles(["Dean", "Administrator"])),
):
    """
    List HOD credentials.
    - Dean: Strictly scoped to departments under their assigned School.
    - Administrator: Views all HODs across schools (optionally filtered by school_id).
    """
    user_roles = [r.lower() for r in current_token.get("roles", [])]
    caller_school_id = current_token.get("school_id")

    target_school_uuid: Optional[uuid.UUID] = None
    if "dean" in user_roles and "administrator" not in user_roles:
        if not caller_school_id:
            raise ForbiddenException("Dean account is missing school scope assignment.")
        target_school_uuid = uuid.UUID(str(caller_school_id))
    elif school_id:
        sch = await _resolve_school(school_id, db)
        target_school_uuid = sch.school_id

    return await _list_staff_accounts("HOD", db, school_id_filter=target_school_uuid)


@router.post(
    "/hods",
    response_model=StaffCredentialResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Dean Adds HOD Email ID & Login Credentials for a Department Under Their School",
)
async def create_hod_account(
    payload: HodCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_token: Dict[str, Any] = Depends(require_roles(["Dean", "Administrator"])),
):
    """
    Creates an HOD user account with institutional email & login password for a department.
    Enforces strict school scoping: Deans can only add HODs to departments under their assigned School.
    """
    dept = await _resolve_department(payload.department_id, db)
    if not dept.school:
        raise ValidationException("Target department is missing parent school association.")

    user_roles = [r.lower() for r in current_token.get("roles", [])]
    caller_school_id = current_token.get("school_id")
    if "dean" in user_roles and "administrator" not in user_roles:
        if not caller_school_id or str(dept.school_id) != str(caller_school_id):
            raise ForbiddenException(
                f"Access denied. As Dean, you can only create HOD credentials for departments under your assigned school, "
                f"not '{dept.school.school_name}'."
            )

    return await _create_scoped_staff_account(
        role_name="HOD",
        full_name=payload.full_name,
        email=payload.email,
        username=payload.username,
        password=payload.password,
        must_change_password=payload.must_change_password,
        school=dept.school,
        department=dept,
        db=db,
    )


async def _authorize_target_user_management(
    target_user_id: str,
    current_token: Dict[str, Any],
    db: AsyncSession,
) -> User:
    """Resolve target user and enforce Dean school-scoped HOD management boundaries."""
    try:
        target_uuid = uuid.UUID(target_user_id)
    except (ValueError, TypeError):
        raise ValidationException("Invalid user_id format.")

    res = await db.execute(
        select(User)
        .where(User.user_id == target_uuid)
        .options(selectinload(User.user_roles))
    )
    target_user = res.scalar_one_or_none()
    if not target_user:
        raise NotFoundException(f"User '{target_user_id}' not found.")

    user_roles = [r.lower() for r in current_token.get("roles", [])]
    is_dean_only = "dean" in user_roles and "administrator" not in user_roles
    if is_dean_only:
        caller_school_id = current_token.get("school_id")
        target_roles = [ur for ur in target_user.user_roles if ur.is_active]
        is_target_hod_in_school = False
        for ur in target_roles:
            if not ur.role or ur.role.role_name.lower() != "hod":
                continue
            resolved_sch_id = ur.school_id
            if not resolved_sch_id and ur.department_id:
                d_res = await db.execute(
                    select(Department.school_id).where(Department.department_id == ur.department_id)
                )
                resolved_sch_id = d_res.scalar_one_or_none()
            if resolved_sch_id and str(resolved_sch_id) == str(caller_school_id):
                is_target_hod_in_school = True
                break
        if not is_target_hod_in_school:
            raise ForbiddenException(
                "Deans can only manage HOD accounts assigned to departments within their own school."
            )

    return target_user


async def _update_scoped_staff_account(
    *,
    target_user: User,
    role_name: str,
    full_name: Optional[str],
    email: Optional[str],
    username: Optional[str],
    password: Optional[str],
    account_status: Optional[str],
    must_change_password: Optional[bool],
    new_school: Optional[School],
    new_department: Optional[Department],
    db: AsyncSession,
) -> StaffCredentialResponse:
    """Shared transactional updater for Dean and HOD credentials & institutional assignments."""
    if full_name is not None:
        target_user.full_name = full_name.strip()

    if email is not None:
        clean_email = email.strip().lower()
        dup_email = await db.execute(
            select(User).where(
                func.lower(User.email) == clean_email,
                User.user_id != target_user.user_id,
            )
        )
        if dup_email.scalar_one_or_none():
            raise ConflictException(f"Email '{clean_email}' is already registered to another user.")
        target_user.email = clean_email

    if username is not None:
        clean_username = username.strip().lower()
        dup_user = await db.execute(
            select(User).where(
                func.lower(User.username) == clean_username,
                User.user_id != target_user.user_id,
            )
        )
        if dup_user.scalar_one_or_none():
            raise ConflictException(f"Username '{clean_username}' is already taken by another user.")
        target_user.username = clean_username

    if password is not None:
        target_user.password_hash = get_password_hash(password)

    if account_status is not None:
        target_user.account_status = account_status

    if must_change_password is not None:
        target_user.must_change_password = must_change_password

    active_ur = next(
        (ur for ur in target_user.user_roles if ur.is_active and ur.role and ur.role.role_name.lower() == role_name.lower()),
        None,
    )
    if not active_ur:
        raise NotFoundException(f"Active {role_name} role assignment not found for user.")

    if new_school is not None:
        active_ur.school_id = new_school.school_id
    if new_department is not None:
        active_ur.department_id = new_department.department_id
        if new_department.school_id:
            active_ur.school_id = new_department.school_id

    await db.commit()
    await db.refresh(target_user)
    await db.refresh(active_ur)

    # Assemble complete updated StaffCredentialResponse
    sch = new_school
    if not sch and active_ur.school_id:
        sch_res = await db.execute(select(School).where(School.school_id == active_ur.school_id))
        sch = sch_res.scalar_one_or_none()

    dept = new_department
    if not dept and active_ur.department_id:
        dept_res = await db.execute(select(Department).where(Department.department_id == active_ur.department_id))
        dept = dept_res.scalar_one_or_none()

    return StaffCredentialResponse(
        user_id=str(target_user.user_id),
        full_name=target_user.full_name,
        email=target_user.email,
        username=target_user.username,
        role=role_name,
        school_id=str(sch.school_id) if sch else None,
        school_code=sch.school_code if sch else None,
        school_name=sch.school_name if sch else None,
        department_id=str(dept.department_id) if dept else None,
        department_code=dept.department_code if dept else None,
        department_name=dept.department_name if dept else None,
        account_status=target_user.account_status,
        must_change_password=target_user.must_change_password,
    )


@router.patch(
    "/deans/{user_id}",
    response_model=StaffCredentialResponse,
    summary="Administrator Edits Dean Account Details or Assigned School",
)
async def update_dean_account(
    user_id: str,
    payload: DeanUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_token: Dict[str, Any] = Depends(require_roles(["Administrator"])),
):
    target_user = await _authorize_target_user_management(user_id, current_token, db)
    new_school: Optional[School] = None

    if payload.school_id is not None:
        new_school = await _resolve_school(payload.school_id, db)
        # Check One Dean per School constraint excluding the Dean being updated
        existing_dean_stmt = (
            select(UserRole)
            .join(Role, UserRole.role_id == Role.role_id)
            .where(
                Role.role_name == "Dean",
                UserRole.school_id == new_school.school_id,
                UserRole.user_id != target_user.user_id,
                UserRole.is_active == True,
            )
            .options(selectinload(UserRole.user))
        )
        others = (await db.execute(existing_dean_stmt)).scalars().all()
        if others:
            if not payload.replace_existing:
                raise ConflictException(
                    f"{new_school.school_name} ({new_school.school_code}) already has an assigned Dean: "
                    f"{others[0].user.full_name} ({others[0].user.email}). Enable 'Replace existing Dean' to reassign."
                )
            for ur in others:
                ur.is_active = False

    return await _update_scoped_staff_account(
        target_user=target_user,
        role_name="Dean",
        full_name=payload.full_name,
        email=payload.email,
        username=payload.username,
        password=payload.password,
        account_status=payload.account_status,
        must_change_password=payload.must_change_password,
        new_school=new_school,
        new_department=None,
        db=db,
    )


@router.patch(
    "/hods/{user_id}",
    response_model=StaffCredentialResponse,
    summary="Edit HOD Details, Email, or Department Assignment",
)
async def update_hod_account(
    user_id: str,
    payload: HodUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_token: Dict[str, Any] = Depends(require_roles(["Dean", "Administrator"])),
):
    target_user = await _authorize_target_user_management(user_id, current_token, db)
    new_dept: Optional[Department] = None

    if payload.department_id is not None:
        new_dept = await _resolve_department(payload.department_id, db)
        user_roles = [r.lower() for r in current_token.get("roles", [])]
        caller_school_id = current_token.get("school_id")
        if "dean" in user_roles and "administrator" not in user_roles:
            if not caller_school_id or str(new_dept.school_id) != str(caller_school_id):
                raise ForbiddenException(
                    "Access denied. Deans can only reassign HODs to departments within their assigned school."
                )

    return await _update_scoped_staff_account(
        target_user=target_user,
        role_name="HOD",
        full_name=payload.full_name,
        email=payload.email,
        username=payload.username,
        password=payload.password,
        account_status=payload.account_status,
        must_change_password=payload.must_change_password,
        new_school=new_dept.school if new_dept else None,
        new_department=new_dept,
        db=db,
    )


@router.patch(
    "/users/{user_id}/status",
    summary="Activate or Disable a Dean/HOD Account",
)
async def update_user_account_status(
    user_id: str,
    payload: UserStatusUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_token: Dict[str, Any] = Depends(require_roles(["Dean", "Administrator"])),
):
    target_user = await _authorize_target_user_management(user_id, current_token, db)
    target_user.account_status = payload.account_status
    await db.commit()
    return {
        "user_id": str(target_user.user_id),
        "username": target_user.username,
        "account_status": target_user.account_status,
        "message": f"Account status updated to '{payload.account_status}'.",
    }


@router.post(
    "/users/{user_id}/reset-password",
    summary="Reset Login Password for a Dean or HOD Account",
)
async def reset_user_password(
    user_id: str,
    payload: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
    current_token: Dict[str, Any] = Depends(require_roles(["Dean", "Administrator"])),
):
    target_user = await _authorize_target_user_management(user_id, current_token, db)
    target_user.password_hash = get_password_hash(payload.new_password)
    target_user.must_change_password = payload.must_change_password
    await db.commit()
    return {
        "user_id": str(target_user.user_id),
        "username": target_user.username,
        "email": target_user.email,
        "message": "Credentials password updated successfully.",
    }

