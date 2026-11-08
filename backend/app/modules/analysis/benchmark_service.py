"""
SSIP Curriculum Benchmark Service
DEPARTMENT_SKILL_MAPPING.md §4, DATABASE_DESIGN.md §6.5, ADR-008
Manages institutional curriculum targets and explicit Dean approval workflows.
"""
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundException, ValidationException
from app.storage.persistent.models.academic import Department
from app.storage.persistent.models.taxonomy import DepartmentSkillMapping, Skill


class BenchmarkService:
    @staticmethod
    async def list_benchmarks(
        db: AsyncSession,
        department_id: Optional[str] = None,
        school_id: Optional[str] = None,
        status: Optional[str] = None,
    ) -> List[DepartmentSkillMapping]:
        """
        Retrieves curriculum benchmarks, optionally filtered by department, school, and status.
        """
        stmt = (
            select(DepartmentSkillMapping)
            .options(
                selectinload(DepartmentSkillMapping.skill),
                selectinload(DepartmentSkillMapping.department),
            )
            .order_by(DepartmentSkillMapping.created_at)
        )

        if department_id:
            try:
                dept_uuid = uuid.UUID(department_id)
                stmt = stmt.where(DepartmentSkillMapping.department_id == dept_uuid)
            except (ValueError, TypeError):
                # Search by department_code
                sub = select(Department.department_id).where(Department.department_code == department_id)
                stmt = stmt.where(DepartmentSkillMapping.department_id.in_(sub))

        if school_id:
            try:
                sch_uuid = uuid.UUID(school_id)
                sub_sch = select(Department.department_id).where(Department.school_id == sch_uuid)
                stmt = stmt.where(DepartmentSkillMapping.department_id.in_(sub_sch))
            except (ValueError, TypeError):
                sub_sch = select(Department.department_id).join(Department.school).where(School.school_code == school_id)
                stmt = stmt.where(DepartmentSkillMapping.department_id.in_(sub_sch))

        if status:
            stmt = stmt.where(DepartmentSkillMapping.status == status.upper())

        res = await db.execute(stmt)
        return list(res.scalars().all())

    @staticmethod
    async def approve_benchmark(
        db: AsyncSession,
        mapping_id: str,
        approved_by_id: uuid.UUID,
        justification: Optional[str] = None,
    ) -> DepartmentSkillMapping:
        """
        ADR-008: Formally approves a candidate curriculum benchmark.
        Transitions status from DRAFT to APPROVED.
        """
        try:
            m_uuid = uuid.UUID(mapping_id)
        except (ValueError, TypeError):
            raise ValidationException("Invalid mapping UUID.")

        stmt = select(DepartmentSkillMapping).where(DepartmentSkillMapping.mapping_id == m_uuid)
        res = await db.execute(stmt)
        mapping = res.scalar_one_or_none()

        if not mapping:
            raise NotFoundException(f"Curriculum benchmark mapping '{mapping_id}' not found.")

        mapping.status = "APPROVED"
        mapping.approved_by = approved_by_id
        mapping.approved_at = datetime.now(timezone.utc)
        if justification:
            mapping.justification = justification

        await db.commit()
        await db.refresh(mapping)
        return mapping

    @staticmethod
    async def bulk_approve_department_benchmarks(
        db: AsyncSession,
        department_id: str,
        approved_by_id: uuid.UUID,
        justification: Optional[str] = "Bulk approved by Dean for institutional skill gap evaluation.",
    ) -> int:
        """
        ADR-008: Bulk approves all DRAFT benchmarks for an academic department.
        """
        try:
            dept_uuid = uuid.UUID(department_id)
        except (ValueError, TypeError):
            sub = select(Department.department_id).where(Department.department_code == department_id)
            dept_res = await db.execute(sub)
            dept_uuid = dept_res.scalar_one_or_none()
            if not dept_uuid:
                raise NotFoundException(f"Department '{department_id}' not found.")

        stmt = select(DepartmentSkillMapping).where(
            DepartmentSkillMapping.department_id == dept_uuid,
            DepartmentSkillMapping.status == "DRAFT"
        )
        res = await db.execute(stmt)
        drafts = res.scalars().all()

        now = datetime.now(timezone.utc)
        count = 0
        for m in drafts:
            m.status = "APPROVED"
            m.approved_by = approved_by_id
            m.approved_at = now
            m.justification = justification
            count += 1

        await db.commit()
        return count

