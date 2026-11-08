"""
SSIP Skill Taxonomy & Department Mapping Models
DATABASE_DESIGN.md §6, SKILL_TAXONOMY.md §3, ADR-008
"""
import uuid
from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy import String, Text, Boolean, DateTime, ForeignKey, UniqueConstraint, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.storage.persistent.base import Base, TimestampMixin, PortableUUID


class TaxonomyVersion(Base):
    """
    Taxonomy Version Traceability
    DATABASE_DESIGN.md §7.1
    """
    __tablename__ = "taxonomy_versions"

    taxonomy_version_id: Mapped[uuid.UUID] = mapped_column(
        PortableUUID, primary_key=True, default=uuid.uuid4
    )
    version_number: Mapped[str] = mapped_column(String(30), unique=True, nullable=False) # e.g. "v1.0.0"
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="Draft", nullable=False) # Draft, Active, Retired
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    activated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    domains: Mapped[List["SkillDomain"]] = relationship("SkillDomain", back_populates="taxonomy_version", cascade="all, delete-orphan")


class SkillDomain(Base):
    """
    Top-Level Taxonomy Domain (e.g. Computer Science, Cloud & DevOps)
    DATABASE_DESIGN.md §6.1, SKILL_TAXONOMY.md §3.1
    """
    __tablename__ = "skill_domains"

    domain_id: Mapped[uuid.UUID] = mapped_column(
        PortableUUID, primary_key=True, default=uuid.uuid4
    )
    taxonomy_version_id: Mapped[uuid.UUID] = mapped_column(PortableUUID, ForeignKey("taxonomy_versions.taxonomy_version_id", ondelete="CASCADE"), nullable=False)
    domain_code: Mapped[str] = mapped_column(String(80), unique=True, index=True, nullable=False)
    domain_name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    taxonomy_version: Mapped["TaxonomyVersion"] = relationship("TaxonomyVersion", back_populates="domains")
    categories: Mapped[List["SkillCategory"]] = relationship("SkillCategory", back_populates="domain", cascade="all, delete-orphan")


class SkillCategory(Base):
    """
    Category within a Domain (e.g. Programming Languages, Web Frameworks)
    DATABASE_DESIGN.md §6.2, SKILL_TAXONOMY.md §3.2
    """
    __tablename__ = "skill_categories"

    category_id: Mapped[uuid.UUID] = mapped_column(
        PortableUUID, primary_key=True, default=uuid.uuid4
    )
    domain_id: Mapped[uuid.UUID] = mapped_column(PortableUUID, ForeignKey("skill_domains.domain_id", ondelete="CASCADE"), nullable=False)
    category_code: Mapped[str] = mapped_column(String(80), nullable=False)
    category_name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    __table_args__ = (
        UniqueConstraint("domain_id", "category_code", name="uq_domain_category_code"),
    )

    domain: Mapped["SkillDomain"] = relationship("SkillDomain", back_populates="categories", lazy="joined")
    skills: Mapped[List["Skill"]] = relationship("Skill", back_populates="category", cascade="all, delete-orphan")


class Skill(Base, TimestampMixin):
    """
    Canonical Skill Entry
    DATABASE_DESIGN.md §6.3, SKILL_TAXONOMY.md §3.3
    """
    __tablename__ = "skills"

    skill_id: Mapped[uuid.UUID] = mapped_column(
        PortableUUID, primary_key=True, default=uuid.uuid4
    )
    category_id: Mapped[uuid.UUID] = mapped_column(PortableUUID, ForeignKey("skill_categories.category_id", ondelete="CASCADE"), nullable=False)
    skill_code: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    skill_name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    category: Mapped["SkillCategory"] = relationship("SkillCategory", back_populates="skills", lazy="joined")
    aliases: Mapped[List["SkillAlias"]] = relationship("SkillAlias", back_populates="skill", cascade="all, delete-orphan", lazy="selectin")


class SkillAlias(Base):
    """
    Synonym / Alternative Name mapping for normalization
    DATABASE_DESIGN.md §6.4
    """
    __tablename__ = "skill_aliases"

    alias_id: Mapped[uuid.UUID] = mapped_column(
        PortableUUID, primary_key=True, default=uuid.uuid4
    )
    skill_id: Mapped[uuid.UUID] = mapped_column(PortableUUID, ForeignKey("skills.skill_id", ondelete="CASCADE"), nullable=False)
    alias_name: Mapped[str] = mapped_column(String(200), nullable=False) # e.g. "JS"
    normalized_alias: Mapped[str] = mapped_column(String(200), index=True, nullable=False) # lowercase stripped e.g. "js"

    skill: Mapped["Skill"] = relationship("Skill", back_populates="aliases")


class DepartmentSkillMapping(Base, TimestampMixin):
    """
    Department Curriculum Skill Mapping & Benchmarking
    DATABASE_DESIGN.md §6.5, DEPARTMENT_SKILL_MAPPING.md §2, ADR-008
    """
    __tablename__ = "department_skill_mapping"

    mapping_id: Mapped[uuid.UUID] = mapped_column(
        PortableUUID, primary_key=True, default=uuid.uuid4
    )
    department_id: Mapped[uuid.UUID] = mapped_column(PortableUUID, ForeignKey("departments.department_id", ondelete="CASCADE"), nullable=False)
    program_id: Mapped[Optional[uuid.UUID]] = mapped_column(PortableUUID, ForeignKey("programs.program_id", ondelete="CASCADE"), nullable=True)
    skill_id: Mapped[uuid.UUID] = mapped_column(PortableUUID, ForeignKey("skills.skill_id", ondelete="CASCADE"), nullable=False)
    taxonomy_version_id: Mapped[uuid.UUID] = mapped_column(PortableUUID, ForeignKey("taxonomy_versions.taxonomy_version_id", ondelete="CASCADE"), nullable=False)
    
    relevance_type: Mapped[str] = mapped_column(String(30), nullable=False) # Core, Recommended, Specialized, Optional
    target_proficiency: Mapped[float] = mapped_column(Numeric(3, 2), default=2.0, nullable=False) # 1.0 (Beginner), 2.0 (Intermediate), 3.0 (Expert)
    minimum_coverage: Mapped[float] = mapped_column(Numeric(5, 2), default=60.0, nullable=False) # Minimum percentage e.g. 60.0%
    priority_weight: Mapped[float] = mapped_column(Numeric(3, 2), default=1.0, nullable=False) # 1.0 - 3.0 weighting factor
    
    # ADR-008: Seeded as DRAFT; must be explicitly APPROVED by Dean / Academic Council before gap engine usage
    status: Mapped[str] = mapped_column(String(30), default="DRAFT", nullable=False) # DRAFT, APPROVED, ARCHIVED
    approved_by: Mapped[Optional[uuid.UUID]] = mapped_column(PortableUUID, nullable=True)
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    justification: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    skill: Mapped["Skill"] = relationship("Skill", lazy="joined")
    department: Mapped["Department"] = relationship("Department", lazy="joined")

    __table_args__ = (
        UniqueConstraint("department_id", "skill_id", "taxonomy_version_id", name="uq_dept_skill_version"),
    )

