"""
SSIP Academic Structure Models
DATABASE_DESIGN.md §5.6, DEPARTMENT_SKILL_MAPPING.md §4, §5
"""
import uuid
from typing import List, Optional
from sqlalchemy import String, Text, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.storage.persistent.base import Base, TimestampMixin, PortableUUID


class School(Base, TimestampMixin):
    """
    Jeppiaar University Academic Schools (SCH-SET, SCH-SSAHS, SCH-SAHM, SCH-AVI, SCH-SPESS)
    DEPARTMENT_SKILL_MAPPING.md §4
    """
    __tablename__ = "schools"

    school_id: Mapped[uuid.UUID] = mapped_column(
        PortableUUID, primary_key=True, default=uuid.uuid4
    )
    school_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    school_name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    departments: Mapped[List["Department"]] = relationship("Department", back_populates="school", cascade="all, delete-orphan")


class Department(Base, TimestampMixin):
    """
    Academic Department within a School
    DATABASE_DESIGN.md §5.6
    """
    __tablename__ = "departments"

    department_id: Mapped[uuid.UUID] = mapped_column(
        PortableUUID, primary_key=True, default=uuid.uuid4
    )
    school_id: Mapped[uuid.UUID] = mapped_column(PortableUUID, ForeignKey("schools.school_id", ondelete="CASCADE"), nullable=False)
    department_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    department_name: Mapped[str] = mapped_column(String(200), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    school: Mapped["School"] = relationship("School", back_populates="departments", lazy="joined")
    programs: Mapped[List["Program"]] = relationship("Program", back_populates="department", cascade="all, delete-orphan")


class Program(Base, TimestampMixin):
    """
    Academic Degree Programme (e.g. B.Tech Computer Science and Engineering)
    DEPARTMENT_SKILL_MAPPING.md §5
    """
    __tablename__ = "programs"

    program_id: Mapped[uuid.UUID] = mapped_column(
        PortableUUID, primary_key=True, default=uuid.uuid4
    )
    department_id: Mapped[uuid.UUID] = mapped_column(PortableUUID, ForeignKey("departments.department_id", ondelete="CASCADE"), nullable=False)
    program_code: Mapped[str] = mapped_column(String(60), unique=True, index=True, nullable=False)
    program_name: Mapped[str] = mapped_column(String(200), nullable=False)
    qualification: Mapped[str] = mapped_column(String(50), nullable=False) # B.Tech, B.Sc, BCA, M.Tech, Ph.D
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    department: Mapped["Department"] = relationship("Department", back_populates="programs", lazy="joined")

