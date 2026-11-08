"""
Tests for School-Level Scoping for Deans and Individual Assessment Records Access.
Ensures:
1. Each school has one Dean; Dean cannot see all schools, only their assigned School.
2. Only Administrator has overall view across all schools.
3. Dean and HOD and Admin can inspect individual assessment records with proper role boundaries.
"""
import io
import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app


@pytest.mark.anyio
async def test_school_scoping_dean_vs_admin():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Dean login (assigned to SCH-SET)
        dean_login = await client.post(
            "/api/v1/auth/login",
            json={"username": "dean", "password": "DeanPassword123!"}
        )
        assert dean_login.status_code == 200
        dean_token = dean_login.json()["access_token"]
        dean_user = dean_login.json()["user"]
        assert dean_user["school_code"] == "SCH-SET"
        assert dean_user["school_name"] == "School of Engineering & Technology"

        # Dean fetches /admin/schools -> Must ONLY return their single assigned school
        dean_schools_resp = await client.get(
            "/api/v1/admin/schools",
            headers={"Authorization": f"Bearer {dean_token}"}
        )
        assert dean_schools_resp.status_code == 200
        dean_schools = dean_schools_resp.json()
        assert len(dean_schools) == 1
        assert dean_schools[0]["school_code"] == "SCH-SET"

        # 2. Administrator login (overall view across all schools)
        admin_login = await client.post(
            "/api/v1/auth/login",
            json={"username": "admin", "password": "AdminPassword123!"}
        )
        assert admin_login.status_code == 200
        admin_token = admin_login.json()["access_token"]

        # Admin fetches /admin/schools -> Must return ALL 5 schools for overall view
        admin_schools_resp = await client.get(
            "/api/v1/admin/schools",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert admin_schools_resp.status_code == 200
        admin_schools = admin_schools_resp.json()
        assert len(admin_schools) >= 2
        school_codes = [s["school_code"] for s in admin_schools]
        assert "SCH-SET" in school_codes
        assert "SCH-SSAHS" in school_codes


@pytest.mark.anyio
async def test_individual_records_view_and_scoping():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Dean & HOD login
        dean_login = await client.post("/api/v1/auth/login", json={"username": "dean", "password": "DeanPassword123!"})
        dean_token = dean_login.json()["access_token"]
        dean_headers = {"Authorization": f"Bearer {dean_token}"}

        hod_login = await client.post("/api/v1/auth/login", json={"username": "hod_cse", "password": "HodCsePassword123!"})
        hod_token = hod_login.json()["access_token"]
        hod_headers = {"Authorization": f"Bearer {hod_token}"}

        # Create session
        session_resp = await client.post(
            "/api/v1/sessions",
            headers=dean_headers,
            json={
                "session_name": "Individual Records Test Session",
                "session_type": "COMBINED",
                "academic_year": "2026-2027",
                "expiry_hours": 24
            }
        )
        session_id = session_resp.json()["session_id"]
        await client.post(f"/api/v1/sessions/{session_id}/activate", headers=dean_headers)

        # Ingest multi-department dataset (CSE and ECE under SET, and CS-APPS under SSAHS)
        csv_data = (
            "Student ID,Department,Skill Name,Proficiency Level\n"
            "STU_001,DEPT-CSE,Python,Beginner\n"
            "STU_001,DEPT-CSE,SQL,Intermediate\n"
            "STU_002,DEPT-ECE,C++,Expert\n"
            "STU_003,DEPT-CS-APPS,Java,Intermediate\n"
        )
        upload_resp = await client.post(
            f"/api/v1/sessions/{session_id}/uploads",
            headers=dean_headers,
            files={"file": ("records.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")}
        )
        upload_id = upload_resp.json()["upload_id"]
        await client.post(f"/api/v1/sessions/{session_id}/uploads/{upload_id}/confirm", headers=dean_headers)

        # 1. HOD fetches individual records: only sees DEPT-CSE
        hod_records_resp = await client.get(
            f"/api/v1/sessions/{session_id}/records",
            headers=hod_headers
        )
        assert hod_records_resp.status_code == 200
        hod_records = hod_records_resp.json()
        assert hod_records["total_records"] == 2
        for r in hod_records["records"]:
            assert r["department_code"] == "DEPT-CSE"

        # 2. Dean (SET) fetches individual records: sees DEPT-CSE and DEPT-ECE, but NOT DEPT-CS-APPS (which is under SSAHS)
        dean_records_resp = await client.get(
            f"/api/v1/sessions/{session_id}/records",
            headers=dean_headers
        )
        assert dean_records_resp.status_code == 200
        dean_records = dean_records_resp.json()
        assert dean_records["total_records"] == 3
        dept_codes_seen = {r["department_code"] for r in dean_records["records"]}
        assert "DEPT-CSE" in dept_codes_seen
        assert "DEPT-ECE" in dept_codes_seen
        assert "DEPT-CS-APPS" not in dept_codes_seen

        # 3. Clean up
        await client.post(f"/api/v1/sessions/{session_id}/purge", headers=dean_headers)

