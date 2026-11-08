"""
Complete End-to-End Lifecycle & Integration Test (TASK-09-03)
Traces:
Session Creation -> Ephemeral Ingestion -> Skill Analysis -> Benchmark Approval ->
Gap Computation -> Event Recommendations -> HOD Proposal -> Dean Approval ->
Export Package Generation -> Full Session Purge.
"""
import io
import os
import zipfile
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy import text

from app.main import app
from app.storage.persistent.database import AsyncSessionLocal


@pytest.mark.anyio
async def test_full_platform_e2e_lifecycle():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Dean Authentication
        dean_login = await client.post(
            "/api/v1/auth/login",
            json={"username": "dean", "password": "DeanPassword123!"}
        )
        assert dean_login.status_code == 200
        dean_token = dean_login.json()["access_token"]
        dean_headers = {"Authorization": f"Bearer {dean_token}"}

        # 2. HOD CSE Authentication
        hod_login = await client.post(
            "/api/v1/auth/login",
            json={"username": "hod_cse", "password": "HodCsePassword123!"}
        )
        assert hod_login.status_code == 200
        hod_token = hod_login.json()["access_token"]
        hod_headers = {"Authorization": f"Bearer {hod_token}"}

        # 3. Session Initialization
        session_create_resp = await client.post(
            "/api/v1/sessions",
            headers=dean_headers,
            json={
                "session_name": "E2E Institutional Assessment 2026",
                "session_type": "COMBINED",
                "academic_year": "2026-2027",
                "expiry_hours": 24
            }
        )
        assert session_create_resp.status_code == 201
        session_data = session_create_resp.json()
        session_id = session_data["session_id"]
        assert session_data["status"] == "Created"

        # Activate session
        act_resp = await client.post(
            f"/api/v1/sessions/{session_id}/activate",
            headers=dean_headers
        )
        assert act_resp.status_code == 200
        assert act_resp.json()["status"] == "Active"

        # 4. Ingestion via Bulk CSV Upload
        csv_content = (
            "Student ID,Department,Skill Name,Proficiency Level\n"
            "2026CSE001,DEPT-CSE,Python,Beginner\n"
            "2026CSE001,DEPT-CSE,SQL,Intermediate\n"
            "2026CSE002,DEPT-CSE,Python,Intermediate\n"
            "2026CSE002,DEPT-CSE,Java,Beginner\n"
            "2026CSE003,DEPT-CSE,Python,Beginner\n"
            "2026CSE003,DEPT-CSE,TypeScript,Beginner\n"
        )
        upload_resp = await client.post(
            f"/api/v1/sessions/{session_id}/uploads",
            headers=dean_headers,
            files={"file": ("e2e_dataset.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
        )
        assert upload_resp.status_code == 200
        upload_report = upload_resp.json()
        assert upload_report["validation_status"] in ("VALID", "WARNINGS")
        assert upload_report["valid_rows_count"] == 6
        upload_id = upload_report["upload_id"]

        # Confirm Upload into ephemeral session buffer
        confirm_resp = await client.post(
            f"/api/v1/sessions/{session_id}/uploads/{upload_id}/confirm",
            headers=dean_headers
        )
        assert confirm_resp.status_code == 200
        assert confirm_resp.json()["committed_records_count"] == 6

        # Ingestion via Student Self-Assessment Web Form
        form_resp = await client.post(
            f"/api/v1/sessions/{session_id}/assessments/submit",
            json={
                "student_identifier": "2026CSE004",
                "department_code": "DEPT-CSE",
                "skills": [
                    {"skill_name": "Python", "proficiency_level": "Expert"},
                    {"skill_name": "Docker", "proficiency_level": "Beginner"}
                ]
            }
        )
        assert form_resp.status_code == 201
        form_data = form_resp.json()
        assert form_data["session_student_ref"].startswith("STU-")

        # 5. Skill Analysis Engine
        # Institutional analysis
        inst_analysis = await client.get(
            f"/api/v1/analysis/{session_id}/distribution",
            headers=dean_headers
        )
        assert inst_analysis.status_code == 200
        inst_data = inst_analysis.json()
        assert inst_data["total_participating_students"] == 4
        assert inst_data["distinct_skills_evaluated"] >= 3

        # Department analysis for CSE
        dept_analysis = await client.get(
            f"/api/v1/analysis/{session_id}/departments/DEPT-CSE",
            headers=hod_headers
        )
        assert dept_analysis.status_code == 200
        dept_data = dept_analysis.json()
        assert dept_data["department_code"] == "DEPT-CSE"
        assert dept_data["participating_students"] == 4

        # 6. Curriculum Benchmark Management (ADR-008)
        # Bulk approve department benchmarks
        approve_resp = await client.post(
            "/api/v1/benchmarks/departments/DEPT-CSE/approve-all",
            headers=dean_headers,
            json={"justification": "Institutional Board Approval 2026"}
        )
        assert approve_resp.status_code == 200
        assert approve_resp.json()["status"] == "APPROVED"

        # 7. Skill Gap Computation Engine
        gap_resp = await client.get(
            f"/api/v1/analysis/{session_id}/gaps?department_id=DEPT-CSE",
            headers=hod_headers
        )
        assert gap_resp.status_code == 200
        gap_data = gap_resp.json()
        assert "gaps" in gap_data
        assert gap_data["benchmarks_evaluated"] > 0

        # 8. Event Recommendations Engine
        rec_resp = await client.get(
            f"/api/v1/recommendations/{session_id}/departments/DEPT-CSE?include_draft=true",
            headers=hod_headers
        )
        assert rec_resp.status_code == 200
        rec_data = rec_resp.json()
        assert rec_data["total_recommendations"] > 0
        assert len(rec_data["recommendations"]) > 0

        # 9. Governance Workflow (ADR-002)
        # HOD submits a training proposal
        proposal_create_resp = await client.post(
            "/api/v1/governance/proposals",
            headers=hod_headers,
            json={
                "session_id": session_id,
                "department_id": "DEPT-CSE",
                "proposal_title": "Spring 2026 Python & Cloud Core Bootcamp",
                "initiative_category": "BOOTCAMP",
                "target_cohort": "CSE Batch 2026",
                "learning_outcomes": ["Master Python data structures", "Deploy containerized services"],
                "justification": "Mitigate critical beginner proficiency deficit in CSE first-year cohort.",
                "proposed_duration_weeks": 2,
                "estimated_cost": 50000.0
            }
        )
        assert proposal_create_resp.status_code == 201
        proposal = proposal_create_resp.json()
        proposal_id = proposal["proposal_id"]
        assert proposal["status"] == "DRAFT"

        # HOD submits proposal to Dean
        submit_resp = await client.post(
            f"/api/v1/governance/proposals/{proposal_id}/submit",
            headers=hod_headers
        )
        assert submit_resp.status_code == 200
        assert submit_resp.json()["status"] == "SUBMITTED"

        # Dean reviews and approves proposal
        decision_resp = await client.post(
            f"/api/v1/governance/proposals/{proposal_id}/decision",
            headers=dean_headers,
            json={
                "decision": "APPROVED",
                "comments": "Approved. Excellent targeted intervention."
            }
        )
        assert decision_resp.status_code == 200
        assert decision_resp.json()["status"] == "APPROVED"

        # 10. Complete Export Package Generation (ADR-005)
        export_pkg_resp = await client.post(
            f"/api/v1/sessions/{session_id}/exports",
            headers=dean_headers,
            json={
                "export_mode": "COMPLETE_ANALYSIS",
                "format": "ZIP",
                "include_original_upload": False
            }
        )
        assert export_pkg_resp.status_code == 201
        pkg_data = export_pkg_resp.json()
        assert pkg_data["format"] == "ZIP"
        assert "download_url" in pkg_data

        # Download ZIP artifact
        dl_resp = await client.get(pkg_data["download_url"])
        assert dl_resp.status_code == 200
        assert dl_resp.headers["content-type"] == "application/zip"

        # Inspect ZIP contents
        zip_buf = io.BytesIO(dl_resp.content)
        with zipfile.ZipFile(zip_buf, "r") as zf:
            file_names = zf.namelist()
            assert "manifest.json" in file_names
            # Assert raw uploaded student files are strictly excluded (ADR-005)
            assert not any("e2e_dataset.csv" in fn for fn in file_names)

        # 11. Explicit Session Purge (ADR-004)
        purge_resp = await client.post(
            f"/api/v1/sessions/{session_id}/purge",
            headers=dean_headers
        )
        assert purge_resp.status_code == 200
        assert purge_resp.json()["status"] in ("Cleaned", "PURGED")

        # Verify session is no longer accessible
        get_purged = await client.get(f"/api/v1/sessions/{session_id}", headers=dean_headers)
        assert get_purged.status_code == 404

        # 12. Zero-Retention Database Verification (Boundary 2)
        async with AsyncSessionLocal() as session:
            stu_tables = await session.execute(
                text("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%student%'")
            )
            found_tables = [row[0] for row in stu_tables.fetchall()]
            assert len(found_tables) == 0, f"Found unexpected student table: {found_tables}"
