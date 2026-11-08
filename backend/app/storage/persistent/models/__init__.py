"""
SSIP Persistent Models Package
"""
from app.storage.persistent.base import Base, TimestampMixin, PortableUUID
from app.storage.persistent.models.user import (
    User,
    Role,
    Permission,
    RolePermission,
    UserRole,
)
from app.storage.persistent.models.academic import (
    School,
    Department,
    Program,
)
from app.storage.persistent.models.taxonomy import (
    TaxonomyVersion,
    SkillDomain,
    SkillCategory,
    Skill,
    SkillAlias,
    DepartmentSkillMapping,
)

__all__ = [
    "Base",
    "TimestampMixin",
    "PortableUUID",
    "User",
    "Role",
    "Permission",
    "RolePermission",
    "UserRole",
    "School",
    "Department",
    "Program",
    "TaxonomyVersion",
    "SkillDomain",
    "SkillCategory",
    "Skill",
    "SkillAlias",
    "DepartmentSkillMapping",
]

