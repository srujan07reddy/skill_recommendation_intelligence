"""
SSIP Seed Script: Jeppiaar University Academic Hierarchy, Taxonomy & Initial Accounts
DEPARTMENT_SKILL_MAPPING.md §4, §5, SKILL_TAXONOMY.md, ADR-003, ADR-008
"""
import asyncio
import os
import sys
import uuid

# Ensure backend root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import select
from app.storage.persistent.database import AsyncSessionLocal
from app.storage.persistent.models.user import User, Role, Permission, RolePermission, UserRole
from app.storage.persistent.models.academic import School, Department, Program
from app.storage.persistent.models.taxonomy import (
    TaxonomyVersion,
    SkillDomain,
    SkillCategory,
    Skill,
    SkillAlias,
    DepartmentSkillMapping
)
from app.core.security import get_password_hash


async def seed_data():
    async with AsyncSessionLocal() as session:
        print("--- [1/5] Seeding System Roles & Permissions ---")
        role_names = ["Administrator", "Dean", "HOD", "Student"]
        roles = {}
        for r_name in role_names:
            stmt = select(Role).where(Role.role_name == r_name)
            res = await session.execute(stmt)
            existing = res.scalar_one_or_none()
            if not existing:
                role = Role(
                    role_id=uuid.uuid4(),
                    role_name=r_name,
                    description=f"System role for {r_name}",
                    is_system_role=True
                )
                session.add(role)
                roles[r_name] = role
            else:
                roles[r_name] = existing

        await session.flush()

        print("--- [2/5] Seeding Jeppiaar University Academic Structure ---")
        # 5 Validated Schools from DEPARTMENT_SKILL_MAPPING.md §4
        schools_data = [
            ("SCH-SET", "School of Engineering & Technology", "Engineering, Technology and Applied Sciences"),
            ("SCH-SSAHS", "School of Sciences & Allied Health Sciences", "Computing, Allied Health, and Pure Sciences"),
            ("SCH-SAHM", "School of Arts, Humanities & Management", "Management, Commerce, Humanities, and Arts"),
            ("SCH-AVI", "School of Aviation", "Aviation and Aerospace Training"),
            ("SCH-SPESS", "School of Physical Education & Sports Sciences", "Physical Education and Sports Science"),
        ]
        schools = {}
        for code, name, desc in schools_data:
            stmt = select(School).where(School.school_code == code)
            res = await session.execute(stmt)
            existing = res.scalar_one_or_none()
            if not existing:
                s = School(school_id=uuid.uuid4(), school_code=code, school_name=name, description=desc)
                session.add(s)
                schools[code] = s
            else:
                schools[code] = existing

        await session.flush()

        # Departments and Programmes from DEPARTMENT_SKILL_MAPPING.md §5
        dept_data = [
            ("DEPT-CSE", "Computer Science & Engineering", "SCH-SET", [
                ("PRG-SET-CSE", "Computer Science and Engineering", "B.Tech"),
                ("PRG-SET-AIML", "CSE (Artificial Intelligence & Machine Learning)", "B.Tech"),
                ("PRG-SET-AIDS", "CSE (Artificial Intelligence & Data Science)", "B.Tech"),
                ("PRG-SET-CYS", "CSE (Cyber Security)", "B.Tech"),
            ]),
            ("DEPT-ECE", "Electronics and Communication Engineering", "SCH-SET", [
                ("PRG-SET-ECE", "Electronics and Communication Engineering", "B.Tech"),
            ]),
            ("DEPT-BT", "Biotechnology", "SCH-SET", [
                ("PRG-SET-BT", "Biotechnology", "B.Tech"),
            ]),
            ("DEPT-CS-APPS", "Computing & Applications", "SCH-SSAHS", [
                ("PRG-SSAHS-BCA", "Bachelor of Computer Applications", "BCA"),
                ("PRG-SSAHS-BCS", "Computer Science", "B.Sc"),
                ("PRG-SSAHS-AI", "Artificial Intelligence", "B.Sc"),
            ]),
            ("DEPT-ALLIED-HEALTH", "Allied Health Sciences", "SCH-SSAHS", [
                ("PRG-SSAHS-MLT", "Medical Laboratory Technology", "B.Sc"),
                ("PRG-SSAHS-FS", "Forensic Science", "B.Sc"),
            ]),
        ]

        departments = {}
        programs = {}
        for dept_code, dept_name, school_code, prog_list in dept_data:
            stmt = select(Department).where(Department.department_code == dept_code)
            res = await session.execute(stmt)
            dept = res.scalar_one_or_none()
            if not dept:
                dept = Department(
                    department_id=uuid.uuid4(),
                    school_id=schools[school_code].school_id,
                    department_code=dept_code,
                    department_name=dept_name
                )
                session.add(dept)
            departments[dept_code] = dept

            await session.flush()

            for p_code, p_name, qual in prog_list:
                stmt_p = select(Program).where(Program.program_code == p_code)
                res_p = await session.execute(stmt_p)
                p = res_p.scalar_one_or_none()
                if not p:
                    p = Program(
                        program_id=uuid.uuid4(),
                        department_id=dept.department_id,
                        program_code=p_code,
                        program_name=p_name,
                        qualification=qual
                    )
                    session.add(p)
                programs[p_code] = p

        await session.flush()

        print("--- [3/5] Seeding Baseline Skill Taxonomy ---")
        stmt_tax = select(TaxonomyVersion).where(TaxonomyVersion.version_number == "v1.0.0")
        res_tax = await session.execute(stmt_tax)
        tax_version = res_tax.scalar_one_or_none()
        if not tax_version:
            tax_version = TaxonomyVersion(
                taxonomy_version_id=uuid.uuid4(),
                version_number="v1.0.0",
                description="Initial Baseline Taxonomy for Jeppiaar University",
                status="Active"
            )
            session.add(tax_version)
            await session.flush()

        # Taxonomy Hierarchy: Domain -> Category -> Skills -> Aliases
        domains_spec = [
            ("DOM-CS", "Computer Science & Software Development", [
                ("CAT-PROG", "Programming Languages", [
                    ("SKILL-PY", "Python", "High-level general programming language", ["py", "python3"]),
                    ("SKILL-JAVA", "Java", "Object-oriented application programming", ["core java", "java 17"]),
                    ("SKILL-CPP", "C++", "System and algorithmic performance language", ["cpp", "c plus plus"]),
                    ("SKILL-JS", "JavaScript", "Client and server scripting language", ["js", "es6"]),
                    ("SKILL-TS", "TypeScript", "Typed superset of JavaScript", ["ts"]),
                    ("SKILL-SQL", "SQL", "Structured query language for relational databases", ["ansi sql"]),
                ]),
                ("CAT-WEB", "Web Frameworks & Engineering", [
                    ("SKILL-REACT", "React", "Declarative UI component library", ["reactjs", "react.js"]),
                    ("SKILL-FASTAPI", "FastAPI", "High-performance Python web API framework", ["fast api"]),
                    ("SKILL-NODE", "Node.js", "Server-side JavaScript runtime", ["node", "nodejs"]),
                ]),
                ("CAT-DATA", "Databases & Data Engineering", [
                    ("SKILL-PG", "PostgreSQL", "Advanced open-source relational database", ["postgres", "pgsql"]),
                    ("SKILL-REDIS", "Redis", "In-memory key-value data store", ["redis cache"]),
                    ("SKILL-PANDAS", "Pandas", "Python data analysis and manipulation library", ["pydata"]),
                ]),
            ]),
            ("DOM-AI", "Artificial Intelligence & Data Science", [
                ("CAT-ML", "Machine Learning & Modeling", [
                    ("SKILL-SKLEARN", "Scikit-Learn", "Machine learning library in Python", ["sklearn"]),
                    ("SKILL-TF", "TensorFlow", "End-to-end open source platform for machine learning", ["tf"]),
                    ("SKILL-PYTORCH", "PyTorch", "Optimized tensor library for deep learning", ["torch"]),
                    ("SKILL-NLP", "Natural Language Processing", "Computational linguistics and text processing", ["nlp"]),
                ])
            ]),
            ("DOM-CLOUD", "Cloud, DevOps & Systems", [
                ("CAT-INFRA", "Cloud Infrastructure & Containerization", [
                    ("SKILL-DOCKER", "Docker", "Container virtualization platform", ["docker engine"]),
                    ("SKILL-K8S", "Kubernetes", "Container orchestration system", ["k8s"]),
                    ("SKILL-AWS", "Amazon Web Services", "Cloud computing platform", ["aws"]),
                    ("SKILL-LINUX", "Linux", "Open source Unix-like operating system", ["ubuntu", "rhel"]),
                    ("SKILL-GIT", "Git", "Distributed version control system", ["github", "gitlab"]),
                ])
            ]),
            ("DOM-SEC", "Cyber Security", [
                ("CAT-NETSEC", "Network & Systems Security", [
                    ("SKILL-NETSEC", "Network Security", "Security protocols, firewalls, and defenses", ["netsec"]),
                    ("SKILL-ETH-HACK", "Ethical Hacking", "Penetration testing and vulnerability assessment", ["pen testing"]),
                ])
            ])
        ]

        seeded_skills = {}
        for dom_code, dom_name, categories in domains_spec:
            stmt_d = select(SkillDomain).where(SkillDomain.domain_code == dom_code)
            res_d = await session.execute(stmt_d)
            dom = res_d.scalar_one_or_none()
            if not dom:
                dom = SkillDomain(
                    domain_id=uuid.uuid4(),
                    taxonomy_version_id=tax_version.taxonomy_version_id,
                    domain_code=dom_code,
                    domain_name=dom_name
                )
                session.add(dom)
                await session.flush()

            for cat_code, cat_name, skills_list in categories:
                stmt_c = select(SkillCategory).where(
                    SkillCategory.domain_id == dom.domain_id,
                    SkillCategory.category_code == cat_code
                )
                res_c = await session.execute(stmt_c)
                cat = res_c.scalar_one_or_none()
                if not cat:
                    cat = SkillCategory(
                        category_id=uuid.uuid4(),
                        domain_id=dom.domain_id,
                        category_code=cat_code,
                        category_name=cat_name
                    )
                    session.add(cat)
                    await session.flush()

                for s_code, s_name, s_desc, aliases in skills_list:
                    stmt_s = select(Skill).where(Skill.skill_code == s_code)
                    res_s = await session.execute(stmt_s)
                    sk = res_s.scalar_one_or_none()
                    if not sk:
                        sk = Skill(
                            skill_id=uuid.uuid4(),
                            category_id=cat.category_id,
                            skill_code=s_code,
                            skill_name=s_name,
                            description=s_desc
                        )
                        session.add(sk)
                        await session.flush()

                        for alias in aliases:
                            alias_obj = SkillAlias(
                                alias_id=uuid.uuid4(),
                                skill_id=sk.skill_id,
                                alias_name=alias,
                                normalized_alias=alias.lower().strip()
                            )
                            session.add(alias_obj)
                    seeded_skills[s_name] = sk

        await session.flush()

        print("--- [4/5] Seeding Candidate Department Benchmarks (Tagged DRAFT per ADR-008) ---")
        # Candidate benchmarks for CSE Department seeded with status 'DRAFT'
        cse_dept = departments["DEPT-CSE"]
        benchmark_specs = [
            ("Python", "Core", 2.0, 70.0, 1.5),
            ("SQL", "Core", 2.0, 65.0, 1.2),
            ("React", "Recommended", 2.0, 50.0, 1.0),
            ("Docker", "Recommended", 2.0, 50.0, 1.0),
            ("Git", "Core", 2.0, 80.0, 1.0),
        ]

        for s_name, rel_type, target_prof, min_cov, p_weight in benchmark_specs:
            sk = seeded_skills.get(s_name)
            if sk:
                stmt_m = select(DepartmentSkillMapping).where(
                    DepartmentSkillMapping.department_id == cse_dept.department_id,
                    DepartmentSkillMapping.skill_id == sk.skill_id,
                    DepartmentSkillMapping.taxonomy_version_id == tax_version.taxonomy_version_id
                )
                res_m = await session.execute(stmt_m)
                if not res_m.scalar_one_or_none():
                    mapping = DepartmentSkillMapping(
                        mapping_id=uuid.uuid4(),
                        department_id=cse_dept.department_id,
                        skill_id=sk.skill_id,
                        taxonomy_version_id=tax_version.taxonomy_version_id,
                        relevance_type=rel_type,
                        target_proficiency=target_prof,
                        minimum_coverage=min_cov,
                        priority_weight=p_weight,
                        status="DRAFT", # ADR-008: Seeded as DRAFT
                        justification="Baseline candidate curriculum benchmark derived from departmental mapping specification."
                    )
                    session.add(mapping)

        await session.flush()

        print("--- [5/5] Seeding Initial Accounts (with must_change_password=True per ADR-003) ---")
        accounts = [
            ("dean", "dean@jeppiaar.edu.in", "Dean of Engineering & Technology", "DeanPassword123!", "Dean", None, schools["SCH-SET"].school_id),
            ("dean_ssahs", "dean_ssahs@jeppiaar.edu.in", "Dean of Sciences & Allied Health", "DeanPassword123!", "Dean", None, schools["SCH-SSAHS"].school_id),
            ("hod_cse", "hod_cse@jeppiaar.edu.in", "Head of Department (CSE)", "HodCsePassword123!", "HOD", departments["DEPT-CSE"].department_id, schools["SCH-SET"].school_id),
            ("admin", "admin@jeppiaar.edu.in", "System Administrator", "AdminPassword123!", "Administrator", None, None),
        ]

        for uname, uemail, ufullname, upass, rname, udept_id, uschool_id in accounts:
            stmt_u = select(User).where(User.username == uname)
            res_u = await session.execute(stmt_u)
            u = res_u.scalar_one_or_none()
            if not u:
                u = User(
                    user_id=uuid.uuid4(),
                    username=uname,
                    email=uemail,
                    full_name=ufullname,
                    password_hash=get_password_hash(upass),
                    account_status="Active",
                    auth_provider="local",
                    must_change_password=True # ADR-003: Forced password rotation on initial login
                )
                session.add(u)
                await session.flush()

                ur = UserRole(
                    user_role_id=uuid.uuid4(),
                    user_id=u.user_id,
                    role_id=roles[rname].role_id,
                    department_id=udept_id,
                    school_id=uschool_id,
                    is_active=True
                )
                session.add(ur)
            else:
                # Update existing UserRole with school_id
                stmt_ur = select(UserRole).where(UserRole.user_id == u.user_id)
                res_ur = await session.execute(stmt_ur)
                existing_ur = res_ur.scalar_one_or_none()
                if existing_ur:
                    existing_ur.school_id = uschool_id
                    if udept_id:
                        existing_ur.department_id = udept_id
                u.full_name = ufullname

        await session.commit()
        print("\nSeed successfully completed!")
        print("Initial Accounts Provisioned (all have must_change_password=True):")
        print("  - Dean (SET):    username='dean'       password='DeanPassword123!' (School of Engineering & Technology)")
        print("  - Dean (SSAHS):  username='dean_ssahs' password='DeanPassword123!' (School of Sciences & Allied Health)")
        print("  - HOD (CSE):     username='hod_cse'    password='HodCsePassword123!'")
        print("  - Administrator: username='admin'      password='AdminPassword123!' (University-wide all schools)")


if __name__ == "__main__":
    asyncio.run(seed_data())

