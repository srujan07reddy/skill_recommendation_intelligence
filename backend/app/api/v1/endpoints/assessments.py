"""
SSIP Student Web Assessment Form Endpoints
API_DOCUMENTATION.md §11, VALIDATION_RULES.md §6, ADR-001, ADR-006, ADR-007
"""
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundException, ValidationException, ConflictException
from app.storage.persistent.database import get_db
from app.storage.persistent.models.academic import Department
from app.storage.persistent.models.taxonomy import Skill, SkillCategory
from app.storage.session_factory import get_session_store
from app.storage.interfaces.session_store import AbstractSessionStore
from app.schemas.assessment import (
    StudentAssessmentSubmission,
    StudentAssessmentResponse,
    TaxonomyFormResponse,
)
from app.modules.validation.validation_service import (
    TaxonomyLookupCache,
    generate_student_pseudonym,
    normalize_proficiency,
)

router = APIRouter(prefix="/sessions/{session_id}/assessments", tags=["Assessments"])


@router.get("/form", response_model=TaxonomyFormResponse)
async def get_assessment_form_metadata(
    session_id: str,
    session_store: AbstractSessionStore = Depends(get_session_store),
    db: AsyncSession = Depends(get_db)
):
    """
    Public endpoint for student assessment form: provides active taxonomy and session metadata.
    """
    session = await session_store.get_session(session_id)
    if not session:
        raise NotFoundException(f"Assessment session '{session_id}' not found or has expired.")

    if session["status"] != "Active":
        raise ValidationException(
            f"Assessment session is currently '{session['status']}'. Submissions are only accepted while Active."
        )

    # Fetch active departments
    dept_res = await db.execute(
        select(Department).where(Department.is_active == True).order_by(Department.department_name)
    )
    departments = [
        {
            "department_code": d.department_code,
            "department_name": d.department_name,
        }
        for d in dept_res.scalars().all()
    ]

    # Fetch active skills with category
    skill_res = await db.execute(
        select(Skill)
        .where(Skill.is_active == True)
        .options(selectinload(Skill.category))
        .order_by(Skill.skill_name)
    )
    skills = [
        {
            "skill_id": str(s.skill_id),
            "skill_code": s.skill_code,
            "skill_name": s.skill_name,
            "category_name": s.category.category_name if s.category else "General",
        }
        for s in skill_res.scalars().all()
    ]

    return TaxonomyFormResponse(
        session_id=session_id,
        session_name=session["session_name"],
        allowed_proficiency_levels=["BEGINNER", "INTERMEDIATE", "EXPERT"], # ADR-007
        departments=departments,
        available_skills=skills
    )


@router.post("/submit", response_model=StudentAssessmentResponse, status_code=status.HTTP_201_CREATED)
async def submit_student_assessment(
    session_id: str,
    submission: StudentAssessmentSubmission,
    session_store: AbstractSessionStore = Depends(get_session_store),
    db: AsyncSession = Depends(get_db)
):
    """
    Student submits self-assessment.
    Immediately applies ADR-001 pseudonymization using server-held secret key.
    Enforces ADR-006 one-submission constraint and ADR-007 3-tier proficiency model.
    """
    session = await session_store.get_session(session_id)
    if not session:
        raise NotFoundException(f"Assessment session '{session_id}' not found or has expired.")

    if session["status"] != "Active":
        raise ValidationException(
            f"Assessment session is currently '{session['status']}'. Submissions are closed."
        )

    session_hmac_secret = session.get("session_hmac_secret")
    if not session_hmac_secret:
        raise ValidationException("Session missing cryptographic HMAC secret.")

    # ADR-001: Pseudonymize student identifier immediately
    student_ref = generate_student_pseudonym(submission.student_identifier, session_hmac_secret)

    # ADR-006: Check if student has already submitted for this session
    has_submitted = await session_store.check_student_submitted(session_id, student_ref)
    if has_submitted:
        raise ConflictException(
            "An assessment submission for this student identifier has already been recorded in this active session. Duplicate submissions are not permitted."
        )

    # Load taxonomy cache for validation
    taxonomy_cache = await TaxonomyLookupCache.load_from_db(db)

    # Validate department
    dept_code = taxonomy_cache.resolve_department(submission.department_code)
    if not dept_code:
        raise ValidationException(f"Unrecognized department code '{submission.department_code}'.")

    # Validate skills and proficiency
    normalized_records = []
    seen_skills = set()
    now_iso = datetime.now(timezone.utc).isoformat()

    for item in submission.skills:
        skill_match = taxonomy_cache.resolve_skill(item.skill_name)
        if not skill_match:
            raise ValidationException(f"Skill '{item.skill_name}' is not recognized in the approved taxonomy.")

        skill_id, canonical_name = skill_match
        if skill_id in seen_skills:
            # Skip or ignore duplicate skills within the same form submission
            continue
        seen_skills.add(skill_id)

        normalized_prof = normalize_proficiency(item.proficiency_level)
        if not normalized_prof:
            raise ValidationException(
                f"Invalid proficiency '{item.proficiency_level}' for skill '{canonical_name}'. Must be Beginner, Intermediate, or Expert."
            )

        numeric_val = 1.0 if normalized_prof == "BEGINNER" else (2.0 if normalized_prof == "INTERMEDIATE" else 3.0)

        normalized_records.append({
            "session_student_ref": student_ref, # ADR-001
            "department_code": dept_code,
            "program_code": submission.program_code,
            "skill_id": skill_id,
            "skill_name": canonical_name,
            "proficiency_level": normalized_prof, # ADR-007
            "numeric_proficiency": numeric_val,
            "experience_type": item.experience_type or [],
            "evidence_description": item.evidence_description,
            "submitted_at": now_iso
        })

    if not normalized_records:
        raise ValidationException("At least one valid skill assessment must be included.")

    # Record into ephemeral session store
    await session_store.add_assessment_records(session_id, normalized_records)

    return StudentAssessmentResponse(
        submission_id=str(uuid.uuid4()),
        session_id=session_id,
        session_student_ref=student_ref,
        recorded_skills_count=len(normalized_records),
        submitted_at=now_iso,
        status="SUBMITTED",
        message="Assessment successfully recorded into active session buffer."
    )

