"""
SSIP Multi-Stage Validation & Normalization Engine
VALIDATION_RULES.md §4, §6, §7, ADR-001, ADR-006, ADR-007
"""
import hmac
import hashlib
import re
from typing import Any, Dict, List, Optional, Set, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.storage.persistent.models.academic import Department
from app.storage.persistent.models.taxonomy import Skill, SkillAlias
from app.schemas.upload import RowValidationError


def generate_student_pseudonym(student_identifier: str, session_hmac_secret: str) -> str:
    """
    ADR-001: Computes a secure, session-scoped pseudonymous hash using a server-held secret key.
    Raw roll numbers are strictly discarded from ephemeral storage.
    """
    clean_id = student_identifier.strip().upper().encode("utf-8")
    secret_bytes = session_hmac_secret.encode("utf-8")
    # Returns 24-character hexadecimal session pseudonym
    return f"STU-{hmac.new(secret_bytes, clean_id, hashlib.sha256).hexdigest()[:20].upper()}"


def normalize_proficiency(raw_val: str) -> Optional[str]:
    """
    ADR-007: Enforces strict 3-tier classification (BEGINNER, INTERMEDIATE, EXPERT).
    Returns normalized uppercase string or None if invalid.
    """
    val = raw_val.strip().lower()
    if val in ("beginner", "beg", "basic", "1", "1.0", "introductory"):
        return "BEGINNER"
    elif val in ("intermediate", "inter", "medium", "med", "2", "2.0"):
        return "INTERMEDIATE"
    elif val in ("expert", "advanced", "adv", "3", "3.0"):
        return "EXPERT"
    return None


class TaxonomyLookupCache:
    """In-memory taxonomy dictionary for high-performance batch validation."""
    def __init__(
        self,
        departments: Dict[str, str], # dept_code/name -> dept_code
        skills: Dict[str, Tuple[str, str]], # canonical_name_lower -> (skill_id, skill_name)
        aliases: Dict[str, Tuple[str, str]] # normalized_alias -> (skill_id, skill_name)
    ):
        self.departments = departments
        self.skills = skills
        self.aliases = aliases

    @classmethod
    async def load_from_db(cls, db: AsyncSession) -> "TaxonomyLookupCache":
        # Load active departments
        dept_res = await db.execute(select(Department).where(Department.is_active == True))
        depts = {}
        for d in dept_res.scalars().all():
            depts[d.department_code.strip().upper()] = d.department_code
            depts[d.department_name.strip().lower()] = d.department_code

        # Load active skills with aliases
        skill_res = await db.execute(
            select(Skill).where(Skill.is_active == True).options(selectinload(Skill.aliases))
        )
        skills = {}
        aliases = {}
        for s in skill_res.scalars().all():
            skills[s.skill_name.strip().lower()] = (str(s.skill_id), s.skill_name)
            skills[s.skill_code.strip().lower()] = (str(s.skill_id), s.skill_name)
            for a in s.aliases:
                aliases[a.normalized_alias.strip().lower()] = (str(s.skill_id), s.skill_name)

        return cls(departments=depts, skills=skills, aliases=aliases)

    def resolve_department(self, raw_dept: str) -> Optional[str]:
        cleaned = raw_dept.strip()
        if cleaned.upper() in self.departments:
            return self.departments[cleaned.upper()]
        if cleaned.lower() in self.departments:
            return self.departments[cleaned.lower()]
        return None

    def resolve_skill(self, raw_skill: str) -> Optional[Tuple[str, str]]:
        cleaned = raw_skill.strip().lower()
        if cleaned in self.skills:
            return self.skills[cleaned]
        if cleaned in self.aliases:
            return self.aliases[cleaned]
        return None


def resolve_column_mappings(headers: List[str]) -> Dict[str, str]:
    """Resolves arbitrary user column names to standard logical keys."""
    mapping = {}
    for h in headers:
        clean = re.sub(r'[^a-zA-Z0-9]', '', h).lower()
        if any(k in clean for k in ("studentid", "studentref", "rollno", "rollnumber", "regno", "registrationno")):
            mapping["student_identifier"] = h
        elif any(k in clean for k in ("department", "dept", "branch")):
            mapping["department"] = h
        elif any(k in clean for k in ("skillname", "technicalskill", "skill", "competency")):
            mapping["skill_name"] = h
        elif any(k in clean for k in ("proficiency", "level", "skilllevel")):
            mapping["proficiency_level"] = h
        elif any(k in clean for k in ("program", "programme", "course", "degree")):
            mapping["program"] = h
    return mapping


class ValidationService:
    @staticmethod
    def validate_batch(
        raw_rows: List[Dict[str, Any]],
        taxonomy: TaxonomyLookupCache,
        session_hmac_secret: str,
    ) -> Tuple[List[Dict[str, Any]], List[RowValidationError], int, int]:
        """
        Validates raw uploaded spreadsheet rows.
        Applies ADR-001 (pseudonymization), ADR-006 (duplicate handling), ADR-007 (3-tier proficiency).
        Returns: (valid_normalized_records, errors_list, error_rows_count, warning_rows_count)
        """
        if not raw_rows:
            return [], [], 0, 0

        # Resolve header mappings
        first_row_keys = [k for k in raw_rows[0].keys() if k != "_row_num"]
        col_map = resolve_column_mappings(first_row_keys)

        errors: List[RowValidationError] = []
        # Track duplicate student-skill pairs: (student_ref, skill_id) -> record
        student_skill_map: Dict[Tuple[str, str], Dict[str, Any]] = {}
        error_rows: Set[int] = set()
        warning_rows: Set[int] = set()

        # Check for missing mandatory columns
        mandatory_keys = ["student_identifier", "department", "skill_name", "proficiency_level"]
        missing_headers = [k for k in mandatory_keys if k not in col_map]
        if missing_headers:
            errors.append(RowValidationError(
                row_index=1,
                column="Headers",
                value=None,
                severity="ERROR",
                message=f"Missing required logical columns: {', '.join(missing_headers)}. Detected headers: {', '.join(first_row_keys)}"
            ))
            return [], errors, len(raw_rows), 0

        # Validate rows
        for row in raw_rows:
            row_num = row.get("_row_num", 0)
            row_has_error = False

            raw_id = row.get(col_map["student_identifier"], "").strip()
            raw_dept = row.get(col_map["department"], "").strip()
            raw_skill = row.get(col_map["skill_name"], "").strip()
            raw_prof = row.get(col_map["proficiency_level"], "").strip()
            raw_prog = row.get(col_map.get("program", ""), "").strip() if "program" in col_map else ""

            # 1. Validate Student Identifier
            if not raw_id:
                errors.append(RowValidationError(
                    row_index=row_num,
                    column=col_map["student_identifier"],
                    value="",
                    severity="ERROR",
                    message="Student reference / roll number cannot be empty."
                ))
                row_has_error = True
            elif len(raw_id) > 60:
                errors.append(RowValidationError(
                    row_index=row_num,
                    column=col_map["student_identifier"],
                    value=raw_id,
                    severity="ERROR",
                    message="Student reference exceeds maximum allowable length of 60 characters."
                ))
                row_has_error = True

            # 2. Validate Department
            dept_code = taxonomy.resolve_department(raw_dept)
            if not raw_dept:
                errors.append(RowValidationError(
                    row_index=row_num,
                    column=col_map["department"],
                    value="",
                    severity="ERROR",
                    message="Department cannot be empty."
                ))
                row_has_error = True
            elif not dept_code:
                errors.append(RowValidationError(
                    row_index=row_num,
                    column=col_map["department"],
                    value=raw_dept,
                    severity="ERROR",
                    message=f"Unrecognized department '{raw_dept}'. Must match approved Jeppiaar academic departments."
                ))
                row_has_error = True

            # 3. Validate Skill & Alias Mapping
            skill_match = taxonomy.resolve_skill(raw_skill)
            if not raw_skill:
                errors.append(RowValidationError(
                    row_index=row_num,
                    column=col_map["skill_name"],
                    value="",
                    severity="ERROR",
                    message="Skill name cannot be empty."
                ))
                row_has_error = True
            elif not skill_match:
                errors.append(RowValidationError(
                    row_index=row_num,
                    column=col_map["skill_name"],
                    value=raw_skill,
                    severity="ERROR",
                    message=f"Unrecognized skill '{raw_skill}'. Skill must exist in approved taxonomy or registered aliases."
                ))
                row_has_error = True

            # 4. Validate Proficiency Level (3-Tier ADR-007)
            normalized_prof = normalize_proficiency(raw_prof)
            if not raw_prof:
                errors.append(RowValidationError(
                    row_index=row_num,
                    column=col_map["proficiency_level"],
                    value="",
                    severity="ERROR",
                    message="Proficiency level cannot be empty."
                ))
                row_has_error = True
            elif not normalized_prof:
                errors.append(RowValidationError(
                    row_index=row_num,
                    column=col_map["proficiency_level"],
                    value=raw_prof,
                    severity="ERROR",
                    message=f"Invalid proficiency '{raw_prof}'. Permitted values are: Beginner, Intermediate, Expert."
                ))
                row_has_error = True

            if row_has_error:
                error_rows.add(row_num)
                continue

            # Compute ADR-001 pseudonymized reference using server secret
            student_ref = generate_student_pseudonym(raw_id, session_hmac_secret)
            skill_id, canonical_skill_name = skill_match # type: ignore

            # ADR-006 Duplicate Check within batch
            dedup_key = (student_ref, skill_id)
            if dedup_key in student_skill_map:
                prev_row = student_skill_map[dedup_key]["_row_num"]
                errors.append(RowValidationError(
                    row_index=row_num,
                    column=col_map["skill_name"],
                    value=canonical_skill_name,
                    severity="WARNING",
                    message=f"Duplicate entry for student reference and skill '{canonical_skill_name}'. Overwriting previous entry from row {prev_row}."
                ))
                warning_rows.add(row_num)

            # Build normalized record (Zero raw roll number stored)
            normalized_record = {
                "_row_num": row_num,
                "session_student_ref": student_ref, # ADR-001
                "department_code": dept_code,
                "program_code": raw_prog or None,
                "skill_id": skill_id,
                "skill_name": canonical_skill_name,
                "proficiency_level": normalized_prof, # ADR-007
                "numeric_proficiency": 1.0 if normalized_prof == "BEGINNER" else (2.0 if normalized_prof == "INTERMEDIATE" else 3.0),
            }
            student_skill_map[dedup_key] = normalized_record

        valid_records = list(student_skill_map.values())
        return valid_records, errors, len(error_rows), len(warning_rows)

