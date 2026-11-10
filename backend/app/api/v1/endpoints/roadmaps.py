"""
SSIP roadmap.sh Learning Path & Career-Track Analysis Endpoints
Maps ephemeral cohort assessment data and benchmark gaps onto roadmap.sh career & skill paths
for intuitive gap visualization and structured remediation planning.
"""
from typing import Any, Dict, List, Optional
import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.core.permissions import require_roles
from app.storage.persistent.database import get_db
from app.storage.persistent.models.academic import Department
from app.storage.session_factory import get_session_store
from app.storage.interfaces.session_store import AbstractSessionStore
from app.modules.analysis.analysis_engine import SkillAnalysisEngine
from app.modules.analysis.gap_engine import SkillGapEngine
from app.modules.analysis.benchmark_service import BenchmarkService
from app.modules.recommendations.roadmap_catalog import (
    ROLE_TRACKS,
    ROADMAP_SKILL_CATALOG,
    resolve_roadmap_for_skill,
)
from app.api.v1.endpoints.analysis import _load_taxonomy_details

router = APIRouter(prefix="/roadmaps", tags=["Learning Roadmaps (roadmap.sh)"])


@router.get("/catalog", summary="Get roadmap.sh Career Role Paths & Skill Catalog")
async def get_roadmap_catalog(
    current_token: Dict[str, Any] = Depends(require_roles(["Dean", "Administrator", "HOD", "Faculty"])),
):
    """Returns curated roadmap.sh career role tracks and individual skill progression guides."""
    return {
        "provider": "roadmap.sh",
        "base_url": "https://roadmap.sh",
        "role_tracks": ROLE_TRACKS,
        "skill_tracks": [
            {
                "skill_key": k,
                "slug": v["slug"],
                "title": v["title"],
                "roadmap_url": v["roadmap_url"],
                "role_track": v["role_track"],
                "prerequisites": v["prerequisites"],
                "milestones": v["milestones"],
            }
            for k, v in ROADMAP_SKILL_CATALOG.items()
        ],
    }


@router.get(
    "/session/{session_id}/analysis",
    summary="Analyze Session Cohort Readiness Across roadmap.sh Career Role Tracks",
)
async def get_session_roadmap_analysis(
    session_id: str,
    department_id: Optional[str] = Query(None, description="Department UUID or code"),
    section: Optional[str] = Query(None, description="Optional student section filter"),
    include_draft: bool = Query(True, description="Include DRAFT benchmarks (ADR-008)"),
    current_token: Dict[str, Any] = Depends(require_roles(["Dean", "Administrator", "HOD", "Faculty"])),
    session_store: AbstractSessionStore = Depends(get_session_store),
    db: AsyncSession = Depends(get_db),
):
    """
    Overlays active session cohort metrics and curriculum benchmark gaps onto
    roadmap.sh Career Role Paths (Backend, Frontend, AI & Data Scientist, DevOps, Security, DSA).
    """
    session = await session_store.get_session(session_id)
    if not session:
        raise NotFoundException(f"Assessment session '{session_id}' not found or expired.")

    user_roles = [r.lower() for r in current_token.get("roles", [])]
    user_dept_id = current_token.get("department_id")
    user_school_id = current_token.get("school_id")

    all_records = await session_store.get_assessment_records(session_id)

    # Determine target department(s) in scope
    target_dept: Optional[Department] = None
    if "hod" in user_roles and "dean" not in user_roles and "administrator" not in user_roles and user_dept_id:
        res = await db.execute(select(Department).where(Department.department_id == uuid.UUID(str(user_dept_id))))
        target_dept = res.scalar_one_or_none()
    elif department_id:
        try:
            d_uuid = uuid.UUID(department_id)
            res = await db.execute(select(Department).where(Department.department_id == d_uuid))
            target_dept = res.scalar_one_or_none()
        except (ValueError, TypeError):
            res = await db.execute(select(Department).where(Department.department_code == department_id))
            target_dept = res.scalar_one_or_none()

    # Filter records by scope (Department, School for Dean, or Section)
    scoped_records = all_records
    if target_dept:
        scoped_records = [r for r in scoped_records if r.get("department_code") == target_dept.department_code]
    elif "dean" in user_roles and "administrator" not in user_roles and user_school_id:
        d_res = await db.execute(
            select(Department.department_code).where(Department.school_id == uuid.UUID(str(user_school_id)))
        )
        allowed_codes = {row[0] for row in d_res.fetchall()}
        scoped_records = [r for r in scoped_records if r.get("department_code") in allowed_codes]

    available_sections = sorted({
        str(r.get("section")).strip()
        for r in scoped_records
        if r.get("section") and str(r.get("section")).strip()
    })

    if section and section.strip() and section.strip().upper() != "ALL":
        target_sec = section.strip().lower()
        scoped_records = [
            r for r in scoped_records
            if str(r.get("section") or "General").strip().lower() == target_sec
        ]

    taxonomy_details = await _load_taxonomy_details(db)
    # Build observed skill lookup across scoped records
    dept_analytics = SkillAnalysisEngine.analyze_department_skills(
        session_id=session_id,
        department_id=str(target_dept.department_id) if target_dept else "INSTITUTIONAL",
        department_code=target_dept.department_code if target_dept else "ALL",
        department_name=target_dept.department_name if target_dept else "Institutional Scope",
        records=scoped_records if target_dept else [
            {**r, "department_code": "ALL"} for r in scoped_records
        ],
        total_eligible_students=250,
        taxonomy_details=taxonomy_details,
        section=section,
    )

    observed_by_name = {s.skill_name.lower().strip(): s for s in dept_analytics.skills}

    # Load benchmark targets if department selected
    gap_by_name: Dict[str, Any] = {}
    if target_dept:
        benchmarks = await BenchmarkService.list_benchmarks(db, department_id=str(target_dept.department_id))
        gap_report = SkillGapEngine.evaluate_department_gaps(
            session_id=session_id,
            department_id=str(target_dept.department_id),
            department_code=target_dept.department_code,
            department_name=target_dept.department_name,
            benchmarks=benchmarks,
            department_analytics=dept_analytics,
            include_draft=include_draft,
        )
        gap_by_name = {g.skill_name.lower().strip(): g for g in gap_report.gaps}

    # Assemble Role Track Progress Cards
    role_analyses: List[Dict[str, Any]] = []
    for track in ROLE_TRACKS:
        nodes_out = []
        strong_cnt = 0
        developing_cnt = 0
        missing_cnt = 0
        score_sum = 0.0

        for sk_name in track["skills"]:
            obs = observed_by_name.get(sk_name.lower().strip())
            gap = gap_by_name.get(sk_name.lower().strip())

            actual_prof = obs.average_numeric_proficiency if obs else 0.0
            actual_cov = obs.coverage_percentage if obs else 0.0
            student_cnt = obs.student_count if obs else 0
            target_prof = gap.target_proficiency if gap else 2.0

            if not obs:
                node_status = "MISSING"
                missing_cnt += 1
                readiness_contrib = 0.0
            elif (gap and gap.gap_severity in ("CRITICAL", "MODERATE")) or actual_prof < target_prof:
                node_status = "DEVELOPING"
                developing_cnt += 1
                readiness_contrib = min(1.0, actual_prof / max(target_prof, 1.0)) * 0.75
            else:
                node_status = "MASTERED"
                strong_cnt += 1
                readiness_contrib = 1.0

            score_sum += readiness_contrib
            rm = resolve_roadmap_for_skill(sk_name, current_proficiency=actual_prof, target_proficiency=target_prof)

            nodes_out.append({
                "skill_name": sk_name,
                "status": node_status,
                "student_count": student_cnt,
                "coverage_percentage": actual_cov,
                "actual_proficiency": actual_prof,
                "target_proficiency": target_prof,
                "gap_severity": gap.gap_severity if gap else ("MISSING" if not obs else "OBSERVED"),
                "roadmap_slug": rm["slug"],
                "roadmap_url": rm["roadmap_url"],
                "prerequisites": rm["prerequisites"],
                "recommended_milestones": rm["milestones"],
            })

        total_nodes = len(track["skills"])
        readiness_pct = round((score_sum / total_nodes) * 100.0, 1) if total_nodes > 0 else 0.0

        role_analyses.append({
            "role_track": track["role_track"],
            "slug": track["slug"],
            "roadmap_url": track["url"],
            "description": track["description"],
            "readiness_percentage": readiness_pct,
            "total_nodes": total_nodes,
            "mastered_count": strong_cnt,
            "developing_count": developing_cnt,
            "missing_count": missing_cnt,
            "nodes": nodes_out,
        })

    # Sort tracks so tracks with highest active engagement or clearest action priority appear nicely
    role_analyses.sort(key=lambda t: (t["mastered_count"] + t["developing_count"], t["readiness_percentage"]), reverse=True)

    return {
        "session_id": session_id,
        "department_code": target_dept.department_code if target_dept else "ALL",
        "department_name": target_dept.department_name if target_dept else "University Scope",
        "section": section if (section and section.upper() != "ALL") else None,
        "available_sections": available_sections,
        "participating_students": dept_analytics.participating_students,
        "role_tracks": role_analyses,
    }

