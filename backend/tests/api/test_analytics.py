"""
SSIP Skill Analysis & Curriculum Gap Integration Tests
Verifies Institutional Distributions, Department Scoping, Benchmark Approvals (ADR-008),
and Gap Score Calculations.
"""
import io
import os
import sys
import pytest
from httpx import AsyncClient, ASGITransport

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))
from app.main import app


@pytest.mark.anyio
async def test_analysis_distribution_and_department_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Dean login
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"username": "dean", "password": "DeanPassword123!"}
        )
        assert login_resp.status_code == 200
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Create active session
        session_resp = await client.post(
            "/api/v1/sessions",
            headers=headers,
            json={
                "session_name": "Phase 4 Analytics Test Session",
                "session_type": "COMBINED",
                "department_id": "DEPT-CSE",
                "academic_year": "2026-2027",
                "expiry_hours": 24
            }
        )
        assert session_resp.status_code == 201
        session_id = session_resp.json()["session_id"]
        await client.post(f"/api/v1/sessions/{session_id}/activate", headers=headers)

        # 3. Upload & confirm dataset with Python, SQL, and Git
        csv_data = (
            "Student ID,Department,Skill Name,Proficiency Level\n"
            "STU_CSE_01,DEPT-CSE,Python,Beginner\n"
            "STU_CSE_02,DEPT-CSE,Python,Intermediate\n"
            "STU_CSE_03,DEPT-CSE,Python,Expert\n"
            "STU_CSE_01,DEPT-CSE,SQL,Intermediate\n"
            "STU_CSE_02,DEPT-CSE,SQL,Intermediate\n"
        )
        upload_resp = await client.post(
            f"/api/v1/sessions/{session_id}/uploads",
            headers=headers,
            files={"file": ("cse_skills.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")}
        )
        assert upload_resp.status_code == 200
        upload_id = upload_resp.json()["upload_id"]

        # Confirm upload
        confirm_resp = await client.post(
            f"/api/v1/sessions/{session_id}/uploads/{upload_id}/confirm",
            headers=headers
        )
        assert confirm_resp.status_code == 200

        # 4. Institutional Distribution API
        dist_resp = await client.get(
            f"/api/v1/analysis/{session_id}/distribution",
            headers=headers
        )
        assert dist_resp.status_code == 200
        dist_data = dist_resp.json()
        assert dist_data["total_participating_students"] == 3
        assert dist_data["distinct_skills_evaluated"] == 2 # Python and SQL
        assert len(dist_data["top_skills"]) == 2

        # Check Python metrics: 3 students, avg proficiency = (1.0 + 2.0 + 3.0)/3 = 2.0
        python_skill = next(s for s in dist_data["top_skills"] if s["skill_name"] == "Python")
        assert python_skill["student_count"] == 3
        assert python_skill["coverage_percentage"] == 100.0
        assert python_skill["average_numeric_proficiency"] == 2.0
        assert python_skill["proficiency_distribution"]["beginner_count"] == 1
        assert python_skill["proficiency_distribution"]["intermediate_count"] == 1
        assert python_skill["proficiency_distribution"]["expert_count"] == 1

        # 5. Department Analytics API
        dept_resp = await client.get(
            f"/api/v1/analysis/{session_id}/departments/DEPT-CSE",
            headers=headers
        )
        assert dept_resp.status_code == 200
        dept_data = dept_resp.json()
        assert dept_data["department_code"] == "DEPT-CSE"
        assert dept_data["participating_students"] == 3
        assert dept_data["skills_count"] == 2


@pytest.mark.anyio
async def test_benchmarks_and_gap_computation_adr008():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Dean login
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"username": "dean", "password": "DeanPassword123!"}
        )
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create active session with limited student data
        session_resp = await client.post(
            "/api/v1/sessions",
            headers=headers,
            json={
                "session_name": "Phase 4 Gap Analysis Test Session",
                "session_type": "COMBINED",
                "department_id": "DEPT-CSE",
                "academic_year": "2026-2027",
                "expiry_hours": 24
            }
        )
        session_id = session_resp.json()["session_id"]
        await client.post(f"/api/v1/sessions/{session_id}/activate", headers=headers)

        # Upload 1 record: Python Beginner
        csv_data = "Student ID,Department,Skill Name,Proficiency Level\nSTU_1,DEPT-CSE,Python,Beginner\n"
        upload_resp = await client.post(
            f"/api/v1/sessions/{session_id}/uploads",
            headers=headers,
            files={"file": ("test.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")}
        )
        upload_id = upload_resp.json()["upload_id"]
        await client.post(f"/api/v1/sessions/{session_id}/uploads/{upload_id}/confirm", headers=headers)

        # 1. Fetch benchmarks: check candidate benchmarks exist
        bms_resp = await client.get("/api/v1/benchmarks?department_id=DEPT-CSE", headers=headers)
        assert bms_resp.status_code == 200
        bms = bms_resp.json()
        assert len(bms) > 0

        # 2. In strict mode (include_draft=false), gaps evaluated should be 0 if all are DRAFT
        # (or only previously approved benchmarks)
        draft_gap_resp = await client.get(
            f"/api/v1/analysis/{session_id}/gaps?department_id=DEPT-CSE&include_draft=false",
            headers=headers
        )
        assert draft_gap_resp.status_code == 200

        # 3. Simulation mode (include_draft=true) evaluates candidate benchmarks
        sim_gap_resp = await client.get(
            f"/api/v1/analysis/{session_id}/gaps?department_id=DEPT-CSE&include_draft=true",
            headers=headers
        )
        assert sim_gap_resp.status_code == 200
        sim_data = sim_gap_resp.json()
        assert sim_data["benchmarks_evaluated"] > 0
        assert (sim_data["draft_benchmarks_count"] > 0 or sim_data["approved_benchmarks_count"] > 0)

        # 4. Dean bulk approves candidate benchmarks for DEPT-CSE (ADR-008)
        approve_resp = await client.post(
            "/api/v1/benchmarks/departments/DEPT-CSE/approve-all",
            headers=headers,
            json={"justification": "Officially approved CSE benchmarks by Academic Council."}
        )
        assert approve_resp.status_code == 200
        assert approve_resp.json()["status"] == "APPROVED"

        # 5. Now strict mode (include_draft=false) evaluates the approved benchmarks
        strict_gap_resp = await client.get(
            f"/api/v1/analysis/{session_id}/gaps?department_id=DEPT-CSE&include_draft=false",
            headers=headers
        )
        assert strict_gap_resp.status_code == 200
        gap_report = strict_gap_resp.json()
        assert gap_report["benchmarks_evaluated"] > 0
        assert gap_report["approved_benchmarks_count"] > 0

        # Verify gap metrics for Python:
        # Target = 2.0 (Intermediate), Actual = 1.0 (Beginner), Priority = 1.5
        # Prof Gap = 1.0, Gap Score = 1.5 (Critical)
        py_gap = next((g for g in gap_report["gaps"] if g["skill_name"] == "Python"), None)
        assert py_gap is not None
        assert py_gap["target_proficiency"] == 2.0
        assert py_gap["actual_average_proficiency"] == 1.0
        assert py_gap["proficiency_gap"] == 1.0
        assert py_gap["gap_score"] == 1.5
        assert py_gap["gap_severity"] == "CRITICAL"


@pytest.mark.anyio
async def test_hod_department_scope_restriction():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Dean creates session
        dean_login = await client.post(
            "/api/v1/auth/login",
            json={"username": "dean", "password": "DeanPassword123!"}
        )
        dean_token = dean_login.json()["access_token"]
        session_resp = await client.post(
            "/api/v1/sessions",
            headers={"Authorization": f"Bearer {dean_token}"},
            json={
                "session_name": "Scope Restriction Session",
                "session_type": "COMBINED",
                "academic_year": "2026-2027",
                "expiry_hours": 24
            }
        )
        session_id = session_resp.json()["session_id"]

        # 2. HOD CSE logs in
        hod_login = await client.post(
            "/api/v1/auth/login",
            json={"username": "hod_cse", "password": "HodCsePassword123!"}
        )
        hod_token = hod_login.json()["access_token"]
        hod_headers = {"Authorization": f"Bearer {hod_token}"}

        # HOD CSE can access DEPT-CSE
        allowed_resp = await client.get(
            f"/api/v1/analysis/{session_id}/departments/DEPT-CSE",
            headers=hod_headers
        )
        assert allowed_resp.status_code == 200

        # HOD CSE cannot access another department (e.g. DEPT-MECH or DEPT-ECE)
        denied_resp = await client.get(
            f"/api/v1/analysis/{session_id}/departments/DEPT-ECE",
            headers=hod_headers
        )
        assert denied_resp.status_code == 403
        assert denied_resp.json()["error"]["code"] == "FORBIDDEN_ACCESS"
