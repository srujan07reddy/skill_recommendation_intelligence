"""
SSIP Session Management & Ingestion Pipeline Integration Tests
Verifies Session Lifecycle, ADR-001 Pseudonymization, ADR-006 Duplicate Enforcement,
ADR-007 3-Tier Proficiency, and Upload Preview & Confirmation.
"""
import io
import os
import sys
import pytest
from httpx import AsyncClient, ASGITransport

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))
from app.main import app


@pytest.mark.anyio
async def test_session_lifecycle_and_rbac():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Dean login
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"username": "dean", "password": "DeanPassword123!"}
        )
        assert login_resp.status_code == 200
        dean_token = login_resp.json()["access_token"]
        auth_headers = {"Authorization": f"Bearer {dean_token}"}

        # 1. Create a new session
        create_resp = await client.post(
            "/api/v1/sessions",
            headers=auth_headers,
            json={
                "session_name": "Test Engineering Assessment 2026",
                "session_type": "COMBINED",
                "department_id": "DEPT-CSE",
                "academic_year": "2026-2027",
                "expiry_hours": 24
            }
        )
        assert create_resp.status_code == 201
        session_data = create_resp.json()
        session_id = session_data["session_id"]
        assert session_data["status"] == "Created"
        assert session_data["session_name"] == "Test Engineering Assessment 2026"
        # ADR-001: Cryptographic secret must NEVER be leaked in API response
        assert "session_hmac_secret" not in session_data

        # 2. List sessions
        list_resp = await client.get("/api/v1/sessions", headers=auth_headers)
        assert list_resp.status_code == 200
        sessions = list_resp.json()
        assert any(s["session_id"] == session_id for s in sessions)

        # 3. Activate session
        activate_resp = await client.post(f"/api/v1/sessions/{session_id}/activate", headers=auth_headers)
        assert activate_resp.status_code == 200
        assert activate_resp.json()["status"] == "Active"


@pytest.mark.anyio
async def test_student_assessment_form_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Dean login & session creation
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"username": "dean", "password": "DeanPassword123!"}
        )
        token = login_resp.json()["access_token"]
        auth_headers = {"Authorization": f"Bearer {token}"}

        session_resp = await client.post(
            "/api/v1/sessions",
            headers=auth_headers,
            json={
                "session_name": "Student Assessment Verification Session",
                "session_type": "FORM_COLLECTION",
                "department_id": "DEPT-CSE",
                "academic_year": "2026-2027",
                "expiry_hours": 12
            }
        )
        session_id = session_resp.json()["session_id"]
        await client.post(f"/api/v1/sessions/{session_id}/activate", headers=auth_headers)

        # 1. Fetch public assessment form metadata
        form_resp = await client.get(f"/api/v1/sessions/{session_id}/assessments/form")
        assert form_resp.status_code == 200
        form_data = form_resp.json()
        assert form_data["session_id"] == session_id
        # ADR-007: 3-tier proficiency strictly enforced
        assert form_data["allowed_proficiency_levels"] == ["BEGINNER", "INTERMEDIATE", "EXPERT"]
        assert len(form_data["available_skills"]) > 0

        # Pick a valid skill from taxonomy
        first_skill_name = form_data["available_skills"][0]["skill_name"]

        # 2. Submit student self-assessment
        sub_resp = await client.post(
            f"/api/v1/sessions/{session_id}/assessments/submit",
            json={
                "student_identifier": "JEP2026CSE001",
                "department_code": "DEPT-CSE",
                "skills": [
                    {
                        "skill_name": first_skill_name,
                        "proficiency_level": "Intermediate",
                        "experience_type": ["Coursework", "Project"],
                        "evidence_description": "Built semester course project using Python"
                    }
                ]
            }
        )
        assert sub_resp.status_code == 201
        sub_data = sub_resp.json()
        assert sub_data["status"] == "SUBMITTED"
        assert sub_data["recorded_skills_count"] == 1
        # ADR-001: Verified pseudonymized hash format (raw roll number not stored)
        assert sub_data["session_student_ref"].startswith("STU-")
        assert "JEP2026CSE001" not in sub_data["session_student_ref"]

        # 3. ADR-006: Duplicate submission rejection
        dup_resp = await client.post(
            f"/api/v1/sessions/{session_id}/assessments/submit",
            json={
                "student_identifier": "JEP2026CSE001",
                "department_code": "DEPT-CSE",
                "skills": [
                    {
                        "skill_name": first_skill_name,
                        "proficiency_level": "Expert"
                    }
                ]
            }
        )
        assert dup_resp.status_code == 409
        dup_err = dup_resp.json()
        assert dup_err["error"]["code"] == "RESOURCE_CONFLICT"

        # 4. Check invalid proficiency rejected
        bad_prof_resp = await client.post(
            f"/api/v1/sessions/{session_id}/assessments/submit",
            json={
                "student_identifier": "JEP2026CSE002",
                "department_code": "DEPT-CSE",
                "skills": [
                    {
                        "skill_name": first_skill_name,
                        "proficiency_level": "Master" # Non 3-tier
                    }
                ]
            }
        )
        assert bad_prof_resp.status_code == 422


@pytest.mark.anyio
async def test_bulk_dataset_upload_preview_and_confirm():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Dean login & session creation
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"username": "dean", "password": "DeanPassword123!"}
        )
        token = login_resp.json()["access_token"]
        auth_headers = {"Authorization": f"Bearer {token}"}

        session_resp = await client.post(
            "/api/v1/sessions",
            headers=auth_headers,
            json={
                "session_name": "Bulk Dataset Upload Test Session",
                "session_type": "BULK_UPLOAD",
                "department_id": "DEPT-CSE",
                "academic_year": "2026-2027",
                "expiry_hours": 24
            }
        )
        session_id = session_resp.json()["session_id"]
        await client.post(f"/api/v1/sessions/{session_id}/activate", headers=auth_headers)

        # Prepare CSV dataset with:
        # 2 valid rows for different students
        # 1 duplicate row for student 1 (triggers ADR-006 warning & overwrite)
        csv_data = (
            "Student ID,Department,Skill Name,Proficiency Level\n"
            "STU_001,DEPT-CSE,Python,Beginner\n"
            "STU_002,DEPT-CSE,SQL,Intermediate\n"
            "STU_001,DEPT-CSE,Python,Expert\n"
        )
        files = {
            "file": ("test_students.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")
        }

        # 1. Upload for validation
        upload_resp = await client.post(
            f"/api/v1/sessions/{session_id}/uploads",
            headers=auth_headers,
            files=files
        )
        assert upload_resp.status_code == 200
        val_report = upload_resp.json()
        assert val_report["filename"] == "test_students.csv"
        assert val_report["total_rows"] == 3
        # 2 unique student-skill records after overwrite
        assert val_report["valid_rows_count"] == 2
        assert val_report["error_rows_count"] == 0
        assert val_report["warning_rows_count"] == 1
        assert val_report["validation_status"] == "WARNINGS"
        upload_id = val_report["upload_id"]

        # 2. Get upload preview
        preview_resp = await client.get(
            f"/api/v1/sessions/{session_id}/uploads/{upload_id}/preview",
            headers=auth_headers
        )
        assert preview_resp.status_code == 200
        assert preview_resp.json()["upload_id"] == upload_id

        # 3. Confirm import
        confirm_resp = await client.post(
            f"/api/v1/sessions/{session_id}/uploads/{upload_id}/confirm",
            headers=auth_headers
        )
        assert confirm_resp.status_code == 200
        confirm_data = confirm_resp.json()
        assert confirm_data["status"] == "COMMITTED"
        assert confirm_data["committed_records_count"] == 2

        # 4. Preview buffer should now be purged
        purged_preview = await client.get(
            f"/api/v1/sessions/{session_id}/uploads/{upload_id}/preview",
            headers=auth_headers
        )
        assert purged_preview.status_code == 404

        # 5. Check session status has accurate counts
        status_resp = await client.get(f"/api/v1/sessions/{session_id}/status")
        assert status_resp.status_code == 200
        status_data = status_resp.json()
        assert status_data["record_count"] == 2
        assert status_data["student_count"] == 2


@pytest.mark.anyio
async def test_session_close_and_purge():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"username": "dean", "password": "DeanPassword123!"}
        )
        auth_headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

        session_resp = await client.post(
            "/api/v1/sessions",
            headers=auth_headers,
            json={
                "session_name": "Session To Close and Purge",
                "session_type": "COMBINED",
                "academic_year": "2026-2027",
                "expiry_hours": 1
            }
        )
        session_id = session_resp.json()["session_id"]

        # Close session
        close_resp = await client.post(f"/api/v1/sessions/{session_id}/close", headers=auth_headers)
        assert close_resp.status_code == 200
        assert close_resp.json()["status"] == "Closed"

        # Attempting upload to closed session must fail
        csv_data = "Student ID,Department,Skill Name,Proficiency Level\nSTU_1,DEPT-CSE,Python,Beginner\n"
        upload_resp = await client.post(
            f"/api/v1/sessions/{session_id}/uploads",
            headers=auth_headers,
            files={"file": ("test.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")}
        )
        assert upload_resp.status_code == 422

        # Purge session
        purge_resp = await client.delete(f"/api/v1/sessions/{session_id}", headers=auth_headers)
        assert purge_resp.status_code == 200
        assert purge_resp.json()["status"] in ("Cleaned", "PURGED")

        # Verification: session no longer exists
        get_purged = await client.get(f"/api/v1/sessions/{session_id}", headers=auth_headers)
        assert get_purged.status_code == 404

