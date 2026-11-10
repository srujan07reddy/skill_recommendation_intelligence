"""
Institutional Hierarchy & Account Provisioning Integration Tests
Verifies:
1. Administrator creates Schools and Departments under Schools.
2. Administrator provisions Dean email & credentials per School (enforcing One Dean per School).
3. Newly provisioned Dean logs in via email ID and only sees their assigned School.
4. Dean adds HOD email ID & login credentials for departments within their assigned School.
5. Cross-school boundary: Dean is blocked (403) from creating or modifying HODs in other Schools.
6. Newly provisioned HOD logs in via their email ID & credentials with exact department scope.
"""
import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy import delete

from app.main import app
from app.storage.persistent.database import AsyncSessionLocal
from app.storage.persistent.models.academic import School, Department
from app.storage.persistent.models.user import User


@pytest.mark.anyio
async def test_admin_and_dean_provisioning_hierarchy_and_login():
    suffix = uuid.uuid4().hex[:6].upper()
    school_code = f"SCH-TST-{suffix}"
    dept_code = f"DEPT-TST-{suffix}"
    dean_email = f"dean.{suffix.lower()}@jeppiaaruniversity.ac.in"
    dean_password = "DeanSecretPassword123!"
    hod_email = f"hod.{suffix.lower()}@jeppiaaruniversity.ac.in"
    hod_password = "HodSecretPassword123!"

    created_school_id = None
    created_dean_id = None
    created_hod_id = None

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # 1. Admin login
            admin_login = await client.post(
                "/api/v1/auth/login",
                json={"username": "admin", "password": "AdminPassword123!"},
            )
            assert admin_login.status_code == 200
            admin_headers = {"Authorization": f"Bearer {admin_login.json()['access_token']}"}

            # 2. Admin creates a new School
            sch_resp = await client.post(
                "/api/v1/admin/schools",
                headers=admin_headers,
                json={
                    "school_code": school_code,
                    "school_name": f"School of Emerging Tech {suffix}",
                    "description": "Integration test school",
                },
            )
            assert sch_resp.status_code == 201
            school_data = sch_resp.json()
            created_school_id = school_data["school_id"]

            # 3. Admin adds a Department under that School
            dept_resp = await client.post(
                "/api/v1/admin/departments",
                headers=admin_headers,
                json={
                    "school_id": created_school_id,
                    "department_code": dept_code,
                    "department_name": f"Quantum Computing {suffix}",
                    "program_code": f"PRG-{suffix}",
                    "program_name": "Quantum Engineering",
                    "qualification": "B.Tech",
                },
            )
            assert dept_resp.status_code == 201
            dept_data = dept_resp.json()
            created_dept_id = dept_data["department_id"]
            assert dept_data["school_id"] == created_school_id

            # 4. Admin creates Dean credentials for that School
            dean_resp = await client.post(
                "/api/v1/admin/deans",
                headers=admin_headers,
                json={
                    "school_id": created_school_id,
                    "full_name": f"Dr. Test Dean {suffix}",
                    "email": dean_email,
                    "password": dean_password,
                },
            )
            assert dean_resp.status_code == 201
            dean_info = dean_resp.json()
            created_dean_id = dean_info["user_id"]
            assert dean_info["email"] == dean_email
            assert dean_info["school_code"] == school_code

            # Enforce One Dean per School (attempting a second without replace_existing -> 409)
            dup_dean = await client.post(
                "/api/v1/admin/deans",
                headers=admin_headers,
                json={
                    "school_id": created_school_id,
                    "full_name": "Second Dean",
                    "email": f"dean2.{suffix.lower()}@jeppiaaruniversity.ac.in",
                    "password": dean_password,
                },
            )
            assert dup_dean.status_code == 409

            # 5. New Dean logs in via their EMAIL (testing case-insensitivity too)
            new_dean_login = await client.post(
                "/api/v1/auth/login",
                json={"username": dean_email.upper(), "password": dean_password},
            )
            assert new_dean_login.status_code == 200
            new_dean_data = new_dean_login.json()
            assert new_dean_data["user"]["school_code"] == school_code
            new_dean_headers = {"Authorization": f"Bearer {new_dean_data['access_token']}"}

            # Dean only sees their single School and its Department
            dean_schools = await client.get("/api/v1/admin/schools", headers=new_dean_headers)
            assert dean_schools.status_code == 200
            assert len(dean_schools.json()) == 1
            assert dean_schools.json()[0]["school_code"] == school_code

            # 6. Cross-School Guard: Dean CANNOT create HOD for a department in another school (DEPT-CSE)
            cross_hod = await client.post(
                "/api/v1/admin/hods",
                headers=new_dean_headers,
                json={
                    "department_id": "DEPT-CSE",
                    "full_name": "Unauthorized Cross HOD",
                    "email": f"cross.{suffix.lower()}@jeppiaaruniversity.ac.in",
                    "password": hod_password,
                },
            )
            assert cross_hod.status_code == 403

            # 7. Dean adds HOD email ID & credentials for the Department under their School
            hod_resp = await client.post(
                "/api/v1/admin/hods",
                headers=new_dean_headers,
                json={
                    "department_id": created_dept_id,
                    "full_name": f"Dr. Test HOD {suffix}",
                    "email": hod_email,
                    "password": hod_password,
                },
            )
            assert hod_resp.status_code == 201
            hod_info = hod_resp.json()
            created_hod_id = hod_info["user_id"]
            assert hod_info["email"] == hod_email
            assert hod_info["department_code"] == dept_code

            # Dean lists HODs -> sees only their school's newly created HOD
            hods_list = await client.get("/api/v1/admin/hods", headers=new_dean_headers)
            assert hods_list.status_code == 200
            assert len(hods_list.json()) == 1
            assert hods_list.json()[0]["email"] == hod_email

            # 8. Newly provisioned HOD logs in using their EMAIL ID & Password
            hod_login = await client.post(
                "/api/v1/auth/login",
                json={"username": hod_email, "password": hod_password},
            )
            assert hod_login.status_code == 200
            hod_login_data = hod_login.json()
            assert hod_login_data["user"]["email"] == hod_email
            assert hod_login_data["user"]["department_name"] == f"Quantum Computing {suffix}"
            assert hod_login_data["user"]["must_change_password"] is False
            assert "HOD" in hod_login_data["user"]["roles"]

            # 9. Dean can reset password of their own school's HOD
            new_pw = "UpdatedHodPass#2026"
            reset_resp = await client.post(
                f"/api/v1/admin/users/{created_hod_id}/reset-password",
                headers=new_dean_headers,
                json={"new_password": new_pw},
            )
            assert reset_resp.status_code == 200
            hod_relogin = await client.post(
                "/api/v1/auth/login",
                json={"username": hod_email, "password": new_pw},
            )
            assert hod_relogin.status_code == 200

            # 10. Edit Details in Deans Directory (Administrator) & HOD Credentials (Dean + Admin)
            updated_dean_email = f"dean.edited.{suffix.lower()}@jeppiaaruniversity.ac.in"
            edit_dean = await client.patch(
                f"/api/v1/admin/deans/{created_dean_id}",
                headers=admin_headers,
                json={
                    "full_name": f"Prof. Edited Dean {suffix}",
                    "email": updated_dean_email,
                },
            )
            assert edit_dean.status_code == 200
            assert edit_dean.json()["full_name"] == f"Prof. Edited Dean {suffix}"
            assert edit_dean.json()["email"] == updated_dean_email

            # Verify edited Dean logs in with new email
            edited_dean_login = await client.post(
                "/api/v1/auth/login",
                json={"username": updated_dean_email, "password": dean_password},
            )
            assert edited_dean_login.status_code == 200

            # Dean edits their School's HOD details
            updated_hod_email = f"hod.edited.{suffix.lower()}@jeppiaaruniversity.ac.in"
            edit_hod = await client.patch(
                f"/api/v1/admin/hods/{created_hod_id}",
                headers=new_dean_headers,
                json={
                    "full_name": f"Dr. Edited HOD {suffix}",
                    "email": updated_hod_email,
                },
            )
            assert edit_hod.status_code == 200
            assert edit_hod.json()["full_name"] == f"Dr. Edited HOD {suffix}"
            assert edit_hod.json()["email"] == updated_hod_email

            # Dean CANNOT reassign HOD to a department in another School (DEPT-CSE)
            cross_edit_hod = await client.patch(
                f"/api/v1/admin/hods/{created_hod_id}",
                headers=new_dean_headers,
                json={"department_id": "DEPT-CSE"},
            )
            assert cross_edit_hod.status_code == 403

            # Admin CAN edit any HOD across university
            admin_edit_hod = await client.patch(
                f"/api/v1/admin/hods/{created_hod_id}",
                headers=admin_headers,
                json={"full_name": f"Dr. Admin Verified HOD {suffix}"},
            )
            assert admin_edit_hod.status_code == 200
            assert admin_edit_hod.json()["full_name"] == f"Dr. Admin Verified HOD {suffix}"
    finally:
        # Clean up synthetic test records from persistent DB
        async with AsyncSessionLocal() as db:
            if created_hod_id:
                await db.execute(delete(User).where(User.user_id == uuid.UUID(created_hod_id)))
            if created_dean_id:
                await db.execute(delete(User).where(User.user_id == uuid.UUID(created_dean_id)))
            if created_school_id:
                await db.execute(delete(Department).where(Department.school_id == uuid.UUID(created_school_id)))
                await db.execute(delete(School).where(School.school_id == uuid.UUID(created_school_id)))
            await db.commit()

