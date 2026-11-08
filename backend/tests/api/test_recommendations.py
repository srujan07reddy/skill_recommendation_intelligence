"""
SSIP Explainable Recommendation Integration Tests
Verifies Event Generation, Scoping, Explainability, and RBAC Authorization.
API_DOCUMENTATION.md §17, RECOMMENDATION_ENGINE.md §4, §8
"""
import io
import os
import sys
import pytest
from httpx import AsyncClient, ASGITransport

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))
from app.main import app


@pytest.mark.anyio
async def test_recommendations_generation_and_events_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Dean login
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"username": "dean", "password": "DeanPassword123!"}
        )
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Create and activate assessment session
        session_resp = await client.post(
            "/api/v1/sessions",
            headers=headers,
            json={
                "session_name": "Phase 5 Recommendations Test Session",
                "session_type": "COMBINED",
                "department_id": "DEPT-CSE",
                "academic_year": "2026-2027",
                "expiry_hours": 24
            }
        )
        session_id = session_resp.json()["session_id"]
        await client.post(f"/api/v1/sessions/{session_id}/activate", headers=headers)

        # 3. Upload dataset with beginner Python to ensure a clear gap exists
        csv_data = "Student ID,Department,Skill Name,Proficiency Level\nSTU_REC_01,DEPT-CSE,Python,Beginner\n"
        upload_resp = await client.post(
            f"/api/v1/sessions/{session_id}/uploads",
            headers=headers,
            files={"file": ("test.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")}
        )
        upload_id = upload_resp.json()["upload_id"]
        await client.post(f"/api/v1/sessions/{session_id}/uploads/{upload_id}/confirm", headers=headers)

        # 4. Fetch institutional event recommendations (with include_draft=true so candidate benchmarks trigger)
        events_resp = await client.get(
            f"/api/v1/recommendations/{session_id}/events?include_draft=true",
            headers=headers
        )
        assert events_resp.status_code == 200
        summary = events_resp.json()
        assert summary["total_recommendations"] > 0
        assert len(summary["recommendations"]) > 0

        # Check first recommendation has complete explainable fields
        first_rec = summary["recommendations"][0]
        assert "recommendation_id" in first_rec
        assert "recommendation_title" in first_rec
        assert "justification" in first_rec
        assert "target_cohort" in first_rec
        assert "learning_objectives" in first_rec
        assert len(first_rec["learning_objectives"]) > 0
        assert first_rec["priority"] in ("CRITICAL", "HIGH", "MEDIUM", "LOW")
        assert first_rec["initiative_category"] in ("BOOTCAMP", "WORKSHOP", "PRACTICAL_LAB", "CERTIFICATION_PREP")

        # 5. Department-scoped recommendations
        dept_resp = await client.get(
            f"/api/v1/recommendations/{session_id}/departments/DEPT-CSE?include_draft=true",
            headers=headers
        )
        assert dept_resp.status_code == 200
        dept_data = dept_resp.json()
        assert dept_data["department_code"] == "DEPT-CSE"
        assert dept_data["total_recommendations"] > 0

        # 6. Explicit generation endpoint (POST)
        post_gen_resp = await client.post(
            f"/api/v1/recommendations/{session_id}/generate",
            headers=headers,
            json={"include_draft_benchmarks": True, "target_department_id": "DEPT-CSE"}
        )
        assert post_gen_resp.status_code == 200
        assert post_gen_resp.json()["total_recommendations"] > 0


@pytest.mark.anyio
async def test_hod_recommendation_department_scoping():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Dean creates session
        dean_login = await client.post(
            "/api/v1/auth/login",
            json={"username": "dean", "password": "DeanPassword123!"}
        )
        dean_token = dean_login.json()["access_token"]
        session_resp = await client.post(
            "/api/v1/sessions",
            headers={"Authorization": f"Bearer {dean_token}"},
            json={
                "session_name": "HOD Scope Recommendations Session",
                "session_type": "COMBINED",
                "academic_year": "2026-2027",
                "expiry_hours": 24
            }
        )
        session_id = session_resp.json()["session_id"]

        # HOD CSE logs in
        hod_login = await client.post(
            "/api/v1/auth/login",
            json={"username": "hod_cse", "password": "HodCsePassword123!"}
        )
        hod_token = hod_login.json()["access_token"]
        hod_headers = {"Authorization": f"Bearer {hod_token}"}

        # Allowed for assigned department
        allowed_resp = await client.get(
            f"/api/v1/recommendations/{session_id}/departments/DEPT-CSE",
            headers=hod_headers
        )
        assert allowed_resp.status_code == 200

        # Forbidden for other department
        denied_resp = await client.get(
            f"/api/v1/recommendations/{session_id}/departments/DEPT-ECE",
            headers=hod_headers
        )
        assert denied_resp.status_code == 403

