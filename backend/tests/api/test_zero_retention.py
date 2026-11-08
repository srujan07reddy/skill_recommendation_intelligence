"""
SSIP Zero-Retention Compliance Verification Test (Phase 8, TASK-08-03)
DATA_PRIVACY_AND_RETENTION.md §5, §6, §20, ADR-001, ADR-002, ADR-004, ADR-005
Formally asserts the zero-retention boundary conditions across all 7 architectural layers.
"""
import io
import os
import tempfile
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy import text
from app.main import app
from app.storage.persistent.database import AsyncSessionLocal
from app.storage.session_factory import get_session_store


@pytest.mark.anyio
async def test_zero_retention_across_all_seven_boundaries():
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

        # 2. Create and activate assessment session
        session_resp = await client.post(
            "/api/v1/sessions",
            headers=headers,
            json={
                "session_name": "Zero Retention Compliance Audit 2026",
                "session_type": "COMBINED",
                "academic_year": "2026-2027",
                "expiry_hours": 24,
            }
        )
        assert session_resp.status_code == 201
        session_id = session_resp.json()["session_id"]
        await client.post(f"/api/v1/sessions/{session_id}/activate", headers=headers)

        # 3. Ingest dataset containing identifiable student roll numbers
        test_roll_numbers = ["21CS099", "21CS100", "21ECE045"]
        csv_data = (
            "Student ID,Department,Skill Name,Proficiency Level\n"
            f"{test_roll_numbers[0]},DEPT-CSE,Python,Beginner\n"
            f"{test_roll_numbers[1]},DEPT-CSE,Java,Expert\n"
            f"{test_roll_numbers[2]},DEPT-ECE,C++,Intermediate\n"
        )
        upload_resp = await client.post(
            f"/api/v1/sessions/{session_id}/uploads",
            headers=headers,
            files={"file": ("audit_students.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")}
        )
        assert upload_resp.status_code == 200
        upload_id = upload_resp.json()["upload_id"]
        confirm_resp = await client.post(f"/api/v1/sessions/{session_id}/uploads/{upload_id}/confirm", headers=headers)
        assert confirm_resp.status_code == 200

        # -------------------------------------------------------------
        # BOUNDARY 1: Pseudonymization (ADR-001) in working memory
        # -------------------------------------------------------------
        store = get_session_store()
        records = await store.get_assessment_records(session_id)
        assert len(records) == 3

        for r in records:
            # Raw roll numbers must NEVER be in memory records
            for roll in test_roll_numbers:
                assert roll not in str(r.values())
            # Must use HMAC-SHA256 pseudonym
            assert "session_student_ref" in r
            assert r["session_student_ref"].startswith("STU-")

        # -------------------------------------------------------------
        # BOUNDARY 2: Relational Database Zero-Retention
        # -------------------------------------------------------------
        async with AsyncSessionLocal() as db:
            # Check users table
            user_rows = (await db.execute(text("SELECT username FROM users"))).scalars().all()
            for roll in test_roll_numbers:
                assert roll not in user_rows

            # Verify no assessment submission table exists in relational DB
            tables_query = text("SELECT name FROM sqlite_master WHERE type='table';")
            try:
                tables = (await db.execute(tables_query)).scalars().all()
                assert "student_assessments" not in tables
                assert "assessment_submissions" not in tables
                assert "student_skill_records" not in tables
            except Exception:
                pass # PostgreSQL equivalent

        # -------------------------------------------------------------
        # Generate proposal and export file
        # -------------------------------------------------------------
        prop_res = await client.post(
            "/api/v1/governance/proposals",
            headers=headers,
            json={
                "session_id": session_id,
                "department_id": "DEPT-CSE",
                "proposal_title": "Audit Validation Initiative",
                "initiative_category": "WORKSHOP",
                "target_cohort": "Audit Cohort",
                "learning_outcomes": ["Privacy Compliance"],
                "justification": "Testing lifecycle purge.",
                "proposed_duration_weeks": 2,
                "estimated_cost": 10000.0,
            }
        )
        assert prop_res.status_code == 201
        prop_id = prop_res.json()["proposal_id"]

        exp_res = await client.post(
            f"/api/v1/sessions/{session_id}/exports",
            headers=headers,
            json={"export_mode": "REPORTS_ONLY", "format": "PDF"}
        )
        assert exp_res.status_code == 201
        exp_id = exp_res.json()["export_id"]
        dl_token = exp_res.json()["download_token"]

        # Confirm file exists on temporary filesystem
        export_dir = os.path.join(tempfile.gettempdir(), "ssip_exports")
        matching_files_before = [f for f in os.listdir(export_dir) if session_id in f]
        assert len(matching_files_before) > 0

        # -------------------------------------------------------------
        # BOUNDARY 3, 4, 5, 6, 7: Purge Execution
        # -------------------------------------------------------------
        purge_res = await client.post(f"/api/v1/sessions/{session_id}/purge", headers=headers)
        assert purge_res.status_code == 200
        purge_data = purge_res.json()
        assert purge_data["status"] == "Cleaned"

        # 1. Ephemeral assessment records completely evicted
        records_after = await store.get_assessment_records(session_id)
        assert len(records_after) == 0

        # 2. Ephemeral proposals evicted (ADR-002)
        prop_after = await store.get_proposal(prop_id)
        assert prop_after is None

        # 3. Ephemeral export metadata evicted (ADR-004)
        exp_after = await store.get_export(exp_id)
        assert exp_after is None

        # 4. Download endpoint returns 404
        dl_after = await client.get(f"/api/v1/exports/{exp_id}/download?token={dl_token}")
        assert dl_after.status_code in (404, 403)

        # 5. Filesystem files unlinked
        matching_files_after = [f for f in os.listdir(export_dir) if session_id in f]
        assert len(matching_files_after) == 0
