"""
SSIP Multi-Stage Validation & Normalization Engine
VALIDATION_RULES.md §4, §6, §7, ADR-001, ADR-006, ADR-007
Supports both Long Format (row per skill) and Wide Format (row per student with skill columns),
section-wise tracking, and numeric mark/percentage normalization.
"""
from datetime import datetime, timezone
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


def parse_proficiency_and_score(raw_val: str) -> Tuple[Optional[str], Optional[float]]:
    """
    ADR-007: Normalizes labels ('Beginner', 'Intermediate', 'Expert'), tiers (1, 2, 3),
    and percentage/mark scores (0-100) into the strict 3-tier classification.
    Returns (normalized_tier_or_none, numeric_mark_or_none).
    """
    val = raw_val.strip().lower()
    if not val:
        return None, None

    if val in ("beginner", "beg", "basic", "1", "1.0", "introductory", "low", "novice"):
        return "BEGINNER", None
    if val in ("intermediate", "inter", "medium", "med", "2", "2.0", "average", "avg"):
        return "INTERMEDIATE", None
    if val in ("expert", "advanced", "adv", "3", "3.0", "high", "proficient"):
        return "EXPERT", None

    # Check percentage / numeric mark (e.g. '85', '85%', '62.5', '0')
    is_pct = val.endswith("%")
    num_str = val[:-1].strip() if is_pct else val
    try:
        score = float(num_str)
    except ValueError:
        return None, None

    if score < 0.0 or score > 100.0:
        return None, None

    # Treat explicit percentages or marks > 3 (plus 0) as 0-100 scale
    if is_pct or score == 0.0 or score > 3.0:
        if score < 50.0:
            return "BEGINNER", round(score, 2)
        if score < 75.0:
            return "INTERMEDIATE", round(score, 2)
        return "EXPERT", round(score, 2)

    return None, None


def normalize_proficiency(raw_val: str) -> Optional[str]:
    """
    ADR-007: Enforces strict 3-tier classification (BEGINNER, INTERMEDIATE, EXPERT).
    Returns normalized uppercase string or None if invalid.
    """
    tier, _ = parse_proficiency_and_score(raw_val)
    return tier


class TaxonomyLookupCache:
    """In-memory taxonomy dictionary for high-performance batch validation."""
    def __init__(
        self,
        departments: Dict[str, str],  # dept_code/name -> dept_code
        skills: Dict[str, Tuple[str, str]],  # canonical_name_lower -> (skill_id, skill_name)
        aliases: Dict[str, Tuple[str, str]]  # normalized_alias -> (skill_id, skill_name)
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
    mapping: Dict[str, str] = {}
    for h in headers:
        clean = re.sub(r'[^a-zA-Z0-9]', '', h).lower()
        if any(k in clean for k in ("studentid", "studentref", "rollno", "rollnumber", "regno", "registrationno", "register")):
            mapping["student_identifier"] = h
        elif clean in ("section", "sec", "batch", "division", "class", "classroom", "classsection", "studentsection") or clean.startswith("section"):
            mapping["section"] = h
        elif any(k in clean for k in ("department", "dept", "branch")):
            mapping["department"] = h
        elif any(k in clean for k in ("skillname", "technicalskill", "skill", "competency")):
            mapping["skill_name"] = h
        elif any(k in clean for k in ("proficiency", "level", "skilllevel")):
            mapping["proficiency_level"] = h
        elif any(k in clean for k in ("program", "programme", "course", "degree")):
            mapping["program"] = h
    return mapping


def resolve_wide_skill_columns(
    headers: List[str],
    taxonomy: TaxonomyLookupCache,
    col_map: Dict[str, str],
) -> List[Tuple[str, str, str]]:
    """
    Identifies columns representing skills in Wide Format spreadsheets (1 row per student).
    Supports header suffixes like 'Python (Marks)', 'SQL Score', or 'Git %'.
    Returns list of (original_header, skill_id, canonical_skill_name).
    """
    reserved = set(col_map.values())
    wide_cols: List[Tuple[str, str, str]] = []
    for h in headers:
        if h in reserved:
            continue
        match = taxonomy.resolve_skill(h)
        if not match:
            stripped = re.sub(r'\s*(\(.*?\)|marks|score|level|%|grade)\s*$', '', h, flags=re.IGNORECASE).strip()
            if stripped:
                match = taxonomy.resolve_skill(stripped)
        if match:
            wide_cols.append((h, match[0], match[1]))
    return wide_cols


class ValidationService:
    @staticmethod
    def _validate_student_and_department(
        row: Dict[str, Any],
        row_num: int,
        col_map: Dict[str, str],
        taxonomy: TaxonomyLookupCache,
        default_department_code: Optional[str],
        restrict_to_department_code: Optional[str],
        errors: List[RowValidationError],
    ) -> Tuple[Optional[str], Optional[str], bool]:
        """Validates student identifier and department, enforcing scoping rules."""
        row_has_error = False
        id_col = col_map["student_identifier"]
        raw_id = row.get(id_col, "").strip()

        if not raw_id:
            errors.append(RowValidationError(
                row_index=row_num,
                column=id_col,
                value="",
                severity="ERROR",
                message="Student reference / roll number cannot be empty."
            ))
            row_has_error = True
        elif len(raw_id) > 60:
            errors.append(RowValidationError(
                row_index=row_num,
                column=id_col,
                value=raw_id,
                severity="ERROR",
                message="Student reference exceeds maximum allowable length of 60 characters."
            ))
            row_has_error = True

        dept_col = col_map.get("department")
        raw_dept = row.get(dept_col, "").strip() if dept_col else ""

        if not raw_dept and default_department_code:
            dept_code = default_department_code
        elif not raw_dept:
            errors.append(RowValidationError(
                row_index=row_num,
                column=dept_col or "Department",
                value="",
                severity="ERROR",
                message="Department cannot be empty."
            ))
            dept_code = None
            row_has_error = True
        else:
            dept_code = taxonomy.resolve_department(raw_dept)
            if not dept_code:
                errors.append(RowValidationError(
                    row_index=row_num,
                    column=dept_col or "Department",
                    value=raw_dept,
                    severity="ERROR",
                    message=f"Unrecognized department '{raw_dept}'. Must match approved Jeppiaar academic departments."
                ))
                row_has_error = True
            elif restrict_to_department_code and dept_code.upper() != restrict_to_department_code.upper():
                errors.append(RowValidationError(
                    row_index=row_num,
                    column=dept_col or "Department",
                    value=raw_dept,
                    severity="ERROR",
                    message=f"Department mismatch: HOD account is scoped to '{restrict_to_department_code}', cannot upload '{dept_code}'."
                ))
                row_has_error = True

        return raw_id, dept_code, row_has_error

    @staticmethod
    def _build_and_dedup_record(
        row_num: int,
        student_ref: str,
        dept_code: str,
        section_val: str,
        raw_prog: str,
        skill_id: str,
        canonical_skill_name: str,
        skill_col_name: str,
        normalized_prof: str,
        raw_score: Optional[float],
        now_iso: str,
        student_skill_map: Dict[Tuple[str, str], Dict[str, Any]],
        errors: List[RowValidationError],
        warning_rows: Set[int],
    ) -> None:
        """Records normalized assessment entry with ADR-006 duplicate handling."""
        dedup_key = (student_ref, skill_id)
        if dedup_key in student_skill_map:
            prev_row = student_skill_map[dedup_key]["_row_num"]
            errors.append(RowValidationError(
                row_index=row_num,
                column=skill_col_name,
                value=canonical_skill_name,
                severity="WARNING",
                message=f"Duplicate entry for student reference and skill '{canonical_skill_name}'. Overwriting previous entry from row {prev_row}."
            ))
            warning_rows.add(row_num)

        numeric_val = 1.0 if normalized_prof == "BEGINNER" else (2.0 if normalized_prof == "INTERMEDIATE" else 3.0)
        record: Dict[str, Any] = {
            "_row_num": row_num,
            "session_student_ref": student_ref,  # ADR-001
            "department_code": dept_code,
            "section": section_val,
            "program_code": raw_prog or None,
            "skill_id": skill_id,
            "skill_name": canonical_skill_name,
            "proficiency_level": normalized_prof,  # ADR-007
            "numeric_proficiency": numeric_val,
            "submitted_at": now_iso,
        }
        if raw_score is not None:
            record["raw_score"] = raw_score
        student_skill_map[dedup_key] = record

    @classmethod
    def validate_batch(
        cls,
        raw_rows: List[Dict[str, Any]],
        taxonomy: TaxonomyLookupCache,
        session_hmac_secret: str,
        default_department_code: Optional[str] = None,
        default_section: Optional[str] = None,
        restrict_to_department_code: Optional[str] = None,
    ) -> Tuple[List[Dict[str, Any]], List[RowValidationError], int, int]:
        """
        Validates raw uploaded spreadsheet rows in either Long or Wide format.
        Applies ADR-001 (pseudonymization), ADR-006 (duplicate handling), ADR-007 (3-tier proficiency).
        Returns: (valid_normalized_records, errors_list, error_rows_count, warning_rows_count)
        """
        if not raw_rows:
            return [], [], 0, 0

        first_row_keys = [k for k in raw_rows[0].keys() if k != "_row_num"]
        col_map = resolve_column_mappings(first_row_keys)

        is_long_format = "skill_name" in col_map and "proficiency_level" in col_map
        wide_skill_cols = (
            []
            if is_long_format
            else resolve_wide_skill_columns(first_row_keys, taxonomy, col_map)
        )
        is_wide_format = not is_long_format and "student_identifier" in col_map and len(wide_skill_cols) > 0

        errors: List[RowValidationError] = []
        student_skill_map: Dict[Tuple[str, str], Dict[str, Any]] = {}
        error_rows: Set[int] = set()
        warning_rows: Set[int] = set()

        # Check mandatory columns depending on detected layout
        if not is_long_format and not is_wide_format:
            mandatory_keys = ["student_identifier", "skill_name", "proficiency_level"]
            if not default_department_code:
                mandatory_keys.append("department")
            missing_headers = [k for k in mandatory_keys if k not in col_map]
            errors.append(RowValidationError(
                row_index=1,
                column="Headers",
                value=None,
                severity="ERROR",
                message=(
                    f"Missing required logical columns: {', '.join(missing_headers)}. "
                    f"Upload either a Long sheet (Student ID, Section, Skill Name, Proficiency Level) "
                    f"or a Wide sheet (Student ID, Section, plus skill columns like Python, SQL). "
                    f"Detected headers: {', '.join(first_row_keys)}"
                )
            ))
            return [], errors, len(raw_rows), 0

        if is_long_format and "department" not in col_map and not default_department_code:
            errors.append(RowValidationError(
                row_index=1,
                column="Headers",
                value=None,
                severity="ERROR",
                message=f"Missing required logical columns: department. Detected headers: {', '.join(first_row_keys)}"
            ))
            return [], errors, len(raw_rows), 0

        now_iso = datetime.now(timezone.utc).isoformat()
        clean_default_sec = (default_section or "General").strip()

        for row in raw_rows:
            row_num = row.get("_row_num", 0)
            raw_id, dept_code, row_has_error = cls._validate_student_and_department(
                row=row,
                row_num=row_num,
                col_map=col_map,
                taxonomy=taxonomy,
                default_department_code=default_department_code,
                restrict_to_department_code=restrict_to_department_code,
                errors=errors,
            )

            sec_col = col_map.get("section")
            raw_sec = row.get(sec_col, "").strip() if sec_col else ""
            section_val = raw_sec if raw_sec else clean_default_sec
            raw_prog = row.get(col_map.get("program", ""), "").strip() if "program" in col_map else ""

            if is_long_format:
                raw_skill = row.get(col_map["skill_name"], "").strip()
                raw_prof = row.get(col_map["proficiency_level"], "").strip()

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

                normalized_prof, raw_score = parse_proficiency_and_score(raw_prof)
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
                        message=f"Invalid proficiency '{raw_prof}'. Permitted values: Beginner, Intermediate, Expert, 1-3, or marks 0-100."
                    ))
                    row_has_error = True

                if row_has_error or not raw_id or not dept_code or not skill_match or not normalized_prof:
                    error_rows.add(row_num)
                    continue

                student_ref = generate_student_pseudonym(raw_id, session_hmac_secret)
                skill_id, canonical_skill_name = skill_match
                cls._build_and_dedup_record(
                    row_num=row_num,
                    student_ref=student_ref,
                    dept_code=dept_code,
                    section_val=section_val,
                    raw_prog=raw_prog,
                    skill_id=skill_id,
                    canonical_skill_name=canonical_skill_name,
                    skill_col_name=col_map["skill_name"],
                    normalized_prof=normalized_prof,
                    raw_score=raw_score,
                    now_iso=now_iso,
                    student_skill_map=student_skill_map,
                    errors=errors,
                    warning_rows=warning_rows,
                )
            else:
                # Wide Format: unpivot each skill column for this student row
                if row_has_error or not raw_id or not dept_code:
                    error_rows.add(row_num)
                    continue

                student_ref = generate_student_pseudonym(raw_id, session_hmac_secret)
                student_had_col_error = False
                for col_header, skill_id, canonical_skill_name in wide_skill_cols:
                    cell_val = row.get(col_header, "").strip()
                    if not cell_val or cell_val.lower() in ("-", "na", "n/a", "none", "absent", "ab"):
                        continue

                    normalized_prof, raw_score = parse_proficiency_and_score(cell_val)
                    if not normalized_prof:
                        errors.append(RowValidationError(
                            row_index=row_num,
                            column=col_header,
                            value=cell_val,
                            severity="ERROR",
                            message=f"Invalid score/level '{cell_val}' in skill column '{col_header}'. Use Beginner/Intermediate/Expert or 0-100 marks."
                        ))
                        student_had_col_error = True
                        continue

                    cls._build_and_dedup_record(
                        row_num=row_num,
                        student_ref=student_ref,
                        dept_code=dept_code,
                        section_val=section_val,
                        raw_prog=raw_prog,
                        skill_id=skill_id,
                        canonical_skill_name=canonical_skill_name,
                        skill_col_name=col_header,
                        normalized_prof=normalized_prof,
                        raw_score=raw_score,
                        now_iso=now_iso,
                        student_skill_map=student_skill_map,
                        errors=errors,
                        warning_rows=warning_rows,
                    )

                if student_had_col_error:
                    error_rows.add(row_num)

        valid_records = list(student_skill_map.values())
        return valid_records, errors, len(error_rows), len(warning_rows)

