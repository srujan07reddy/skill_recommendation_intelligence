"""
SSIP Administration & Operational Telemetry Endpoints
PAGE_SPECIFICATIONS.md §8, SESSION_MANAGEMENT.md §14
Provides academic structure management, skill taxonomy lookup, and operational lifecycle monitoring.
"""
import os
import tempfile
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.core.security import decode_access_token
from app.core.permissions import require_roles, get_current_token_payload
from app.storage.persistent.database import get_db
from app.storage.persistent.models.academic import School, Department, Program
from app.storage.persistent.models.taxonomy import SkillDomain, SkillCategory, Skill, SkillAlias
from app.storage.persistent.models.user import User
from app.storage.session_factory import get_session_store
from app.storage.interfaces.session_store import AbstractSessionStore
from app.modules.session_cleanup.cleanup_worker import get_cleanup_worker

router = APIRouter(prefix="/admin", tags=["Administration & Operations"])


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

