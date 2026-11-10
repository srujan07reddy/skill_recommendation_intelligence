"""
SSIP roadmap.sh Integration Tests
Verifies:
1. /api/v1/roadmaps/catalog provides curated roadmap.sh career & skill paths.
2. Recommendation engine responses include matched roadmap.sh URL, role track, prerequisites & milestones.
3. Section & Student evaluations include direct roadmap.sh study URLs & milestone topics.
4. /api/v1/roadmaps/session/{session_id}/analysis overlays cohort/section skill gaps onto roadmap.sh tracks.
"""
import io
import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app


@pytest.mark.anyio
async def test_roadmap_sh_catalog_and_session_overlay():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. HOD login
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"username": "hod_cse", "password": "HodCsePassword123!"},
        )
        assert login_resp.status_code == 200
        headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

        # 2. Fetch catalog
        cat_resp = await client.get("/api/v1/roadmaps/catalog", headers=headers)
        assert cat_resp.status_code == 200
        cat = cat_resp.json()
        assert cat["provider"] == "roadmap.sh"
        assert any(t["slug"] == "backend" for t in cat["role_tracks"])
        assert any(s["roadmap_url"] == "https://roadmap.sh/python" for s in cat["skill_tracks"])

        # 3. Direct bulk upload for Section A
        wide_csv = (
            "Student ID,Section,Python,SQL,Git\n"
            "24CSE301,Section A,Expert,Beginner,Intermediate\n"
            "24CSE302,Section A,Beginner,Beginner,Beginner\n"
        )
        up = await client.post(
            "/api/v1/uploads/direct",
            headers=headers,
            data={"section": "Section A", "session_id": "NEW"},
            files={"file": ("roadmap_sec_a.csv", io.BytesIO(wide_csv.encode("utf-8")), "text/csv")},
        )
        assert up.status_code == 200
        sid = up.json()["session_id"]
        conf = await client.post(
            f"/api/v1/sessions/{sid}/uploads/{up.json()['upload_id']}/confirm",
            headers=headers,
        )
        assert conf.status_code == 200

        # 4. Recommendations include roadmap_sh metadata
        rec_resp = await client.get(
            f"/api/v1/recommendations/{sid}/departments/DEPT-CSE",
            params={"include_draft": True},
            headers=headers,
        )
        assert rec_resp.status_code == 200
        recs = rec_resp.json()["recommendations"]
        assert len(recs) > 0
        for rec in recs:
            assert rec["roadmap_sh"] is not None
            assert rec["roadmap_sh"]["roadmap_url"].startswith("https://roadmap.sh/")
            assert len(rec["roadmap_sh"]["milestones"]) > 0

        # 5. Section evaluation what_to_study items include roadmap.sh study guide links
        eval_resp = await client.get(
            f"/api/v1/analysis/{sid}/departments/DEPT-CSE/section-evaluation",
            params={"section": "Section A", "include_draft": True},
            headers=headers,
        )
        assert eval_resp.status_code == 200
        students = eval_resp.json()["student_evaluations"]
        assert len(students) == 2
        assert any(
            item.get("roadmap_url", "").startswith("https://roadmap.sh/")
            for stu in students
            for item in stu["what_to_study"]
        )

        # 6. Career Role Roadmap Overlay Analysis
        rm_resp = await client.get(
            f"/api/v1/roadmaps/session/{sid}/analysis",
            params={"section": "Section A", "include_draft": True},
            headers=headers,
        )
        assert rm_resp.status_code == 200
        rm_data = rm_resp.json()
        assert rm_data["section"] == "Section A"
        backend_track = next(t for t in rm_data["role_tracks"] if t["slug"] == "backend")
        assert backend_track["roadmap_url"] == "https://roadmap.sh/backend"
        assert backend_track["readiness_percentage"] > 0
        py_node = next(n for n in backend_track["nodes"] if n["skill_name"] == "Python")
        assert py_node["roadmap_url"] == "https://roadmap.sh/python"
        assert py_node["student_count"] == 2

