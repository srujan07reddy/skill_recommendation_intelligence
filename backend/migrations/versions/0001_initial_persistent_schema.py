"""0001_initial_persistent_schema

Revision ID: 0001_initial
Revises: 
Create Date: 2026-11-08 07:20:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from app.storage.persistent.base import PortableUUID

# revision identifiers, used by Alembic.
revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Identity & RBAC Tables
    op.create_table(
        "roles",
        sa.Column("role_id", PortableUUID(), nullable=False),
        sa.Column("role_name", sa.String(length=50), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_system_role", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("role_id"),
        sa.UniqueConstraint("role_name"),
    )

    op.create_table(
        "permissions",
        sa.Column("permission_id", PortableUUID(), nullable=False),
        sa.Column("permission_code", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("module_name", sa.String(length=80), nullable=False),
        sa.PrimaryKeyConstraint("permission_id"),
        sa.UniqueConstraint("permission_code"),
    )
    op.create_index("ix_permissions_code", "permissions", ["permission_code"])

    op.create_table(
        "role_permissions",
        sa.Column("role_permission_id", PortableUUID(), nullable=False),
        sa.Column("role_id", PortableUUID(), nullable=False),
        sa.Column("permission_id", PortableUUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["permission_id"], ["permissions.permission_id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["role_id"], ["roles.role_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("role_permission_id"),
        sa.UniqueConstraint("role_id", "permission_id", name="uq_role_permission"),
    )

    op.create_table(
        "users",
        sa.Column("user_id", PortableUUID(), nullable=False),
        sa.Column("username", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.Text(), nullable=False),
        sa.Column("full_name", sa.String(length=200), nullable=False),
        sa.Column("account_status", sa.String(length=30), nullable=False, server_default="Active"),
        sa.Column("auth_provider", sa.String(length=50), nullable=False, server_default="local"),
        sa.Column("must_change_password", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("user_id"),
        sa.UniqueConstraint("username"),
        sa.UniqueConstraint("email"),
    )
    op.create_index("ix_users_username", "users", ["username"])
    op.create_index("ix_users_email", "users", ["email"])

    # 2. Academic Hierarchy Tables
    op.create_table(
        "schools",
        sa.Column("school_id", PortableUUID(), nullable=False),
        sa.Column("school_code", sa.String(length=50), nullable=False),
        sa.Column("school_name", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("school_id"),
        sa.UniqueConstraint("school_code"),
    )
    op.create_index("ix_schools_code", "schools", ["school_code"])

    op.create_table(
        "departments",
        sa.Column("department_id", PortableUUID(), nullable=False),
        sa.Column("school_id", PortableUUID(), nullable=False),
        sa.Column("department_code", sa.String(length=50), nullable=False),
        sa.Column("department_name", sa.String(length=200), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["school_id"], ["schools.school_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("department_id"),
        sa.UniqueConstraint("department_code"),
    )
    op.create_index("ix_departments_code", "departments", ["department_code"])

    op.create_table(
        "programs",
        sa.Column("program_id", PortableUUID(), nullable=False),
        sa.Column("department_id", PortableUUID(), nullable=False),
        sa.Column("program_code", sa.String(length=60), nullable=False),
        sa.Column("program_name", sa.String(length=200), nullable=False),
        sa.Column("qualification", sa.String(length=50), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["department_id"], ["departments.department_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("program_id"),
        sa.UniqueConstraint("program_code"),
    )
    op.create_index("ix_programs_code", "programs", ["program_code"])

    op.create_table(
        "user_roles",
        sa.Column("user_role_id", PortableUUID(), nullable=False),
        sa.Column("user_id", PortableUUID(), nullable=False),
        sa.Column("role_id", PortableUUID(), nullable=False),
        sa.Column("department_id", PortableUUID(), nullable=True),
        sa.Column("assigned_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.ForeignKeyConstraint(["department_id"], ["departments.department_id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["role_id"], ["roles.role_id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.user_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_role_id"),
    )

    # 3. Taxonomy & Mapping Tables
    op.create_table(
        "taxonomy_versions",
        sa.Column("taxonomy_version_id", PortableUUID(), nullable=False),
        sa.Column("version_number", sa.String(length=30), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="Draft"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("activated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("taxonomy_version_id"),
        sa.UniqueConstraint("version_number"),
    )

    op.create_table(
        "skill_domains",
        sa.Column("domain_id", PortableUUID(), nullable=False),
        sa.Column("taxonomy_version_id", PortableUUID(), nullable=False),
        sa.Column("domain_code", sa.String(length=80), nullable=False),
        sa.Column("domain_name", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.ForeignKeyConstraint(["taxonomy_version_id"], ["taxonomy_versions.taxonomy_version_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("domain_id"),
        sa.UniqueConstraint("domain_code"),
    )
    op.create_index("ix_domains_code", "skill_domains", ["domain_code"])

    op.create_table(
        "skill_categories",
        sa.Column("category_id", PortableUUID(), nullable=False),
        sa.Column("domain_id", PortableUUID(), nullable=False),
        sa.Column("category_code", sa.String(length=80), nullable=False),
        sa.Column("category_name", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.ForeignKeyConstraint(["domain_id"], ["skill_domains.domain_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("category_id"),
        sa.UniqueConstraint("domain_id", "category_code", name="uq_domain_category_code"),
    )

    op.create_table(
        "skills",
        sa.Column("skill_id", PortableUUID(), nullable=False),
        sa.Column("category_id", PortableUUID(), nullable=False),
        sa.Column("skill_code", sa.String(length=100), nullable=False),
        sa.Column("skill_name", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["category_id"], ["skill_categories.category_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("skill_id"),
        sa.UniqueConstraint("skill_code"),
    )
    op.create_index("ix_skills_code", "skills", ["skill_code"])

    op.create_table(
        "skill_aliases",
        sa.Column("alias_id", PortableUUID(), nullable=False),
        sa.Column("skill_id", PortableUUID(), nullable=False),
        sa.Column("alias_name", sa.String(length=200), nullable=False),
        sa.Column("normalized_alias", sa.String(length=200), nullable=False),
        sa.ForeignKeyConstraint(["skill_id"], ["skills.skill_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("alias_id"),
    )
    op.create_index("ix_skill_aliases_normalized", "skill_aliases", ["normalized_alias"])

    op.create_table(
        "department_skill_mapping",
        sa.Column("mapping_id", PortableUUID(), nullable=False),
        sa.Column("department_id", PortableUUID(), nullable=False),
        sa.Column("program_id", PortableUUID(), nullable=True),
        sa.Column("skill_id", PortableUUID(), nullable=False),
        sa.Column("taxonomy_version_id", PortableUUID(), nullable=False),
        sa.Column("relevance_type", sa.String(length=30), nullable=False),
        sa.Column("target_proficiency", sa.Numeric(precision=3, scale=2), nullable=False, server_default="2.0"),
        sa.Column("minimum_coverage", sa.Numeric(precision=5, scale=2), nullable=False, server_default="60.0"),
        sa.Column("priority_weight", sa.Numeric(precision=3, scale=2), nullable=False, server_default="1.0"),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="DRAFT"),
        sa.Column("approved_by", PortableUUID(), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("justification", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["department_id"], ["departments.department_id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["program_id"], ["programs.program_id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["skill_id"], ["skills.skill_id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["taxonomy_version_id"], ["taxonomy_versions.taxonomy_version_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("mapping_id"),
        sa.UniqueConstraint("department_id", "skill_id", "taxonomy_version_id", name="uq_dept_skill_version"),
    )


def downgrade() -> None:
    op.drop_table("department_skill_mapping")
    op.drop_table("skill_aliases")
    op.drop_table("skills")
    op.drop_table("skill_categories")
    op.drop_table("skill_domains")
    op.drop_table("taxonomy_versions")
    op.drop_table("user_roles")
    op.drop_table("programs")
    op.drop_table("departments")
    op.drop_table("schools")
    op.drop_table("users")
    op.drop_table("role_permissions")
    op.drop_table("permissions")
    op.drop_table("roles")

