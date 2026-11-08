"""
Unit & API tests for Ephemeral Governance Proposals (Phase 7, ADR-002)
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.security import create_access_token


@pytest.fixture
def dean_headers():
    token = create_access_token(
        user_id="dean_user_id",
        username="dean",
        full_name="Dean of Academic Affairs",
        roles=["Dean"],
        department_id=None,
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def hod_cse_headers():
    token = create_access_token(
        user_id="hod_cse_user_id",
        username="hod_cse",
        full_name="HOD Computer Science",
        roles=["HOD"],
        department_id="DEPT-CSE",
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def hod_ece_headers():
    token = create_access_token(
        user_id="hod_ece_user_id",
        username="hod_ece",
        full_name="HOD Electronics",
        roles=["HOD"],
        department_id="DEPT-ECE",
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.anyio
async def test_governance_proposal_lifecycle_and_rbac(dean_headers, hod_cse_headers, hod_ece_headers):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Create session
        create_res = await client.post(
            "/api/v1/sessions",
            json={
                "session_name": "Governance Test Session 2026",
                "session_type": "Continuous",
                "academic_year": "2025-2026",
                "expiry_hours": 24,
            },
            headers=dean_headers,
        )
        assert create_res.status_code == 201
        session_id = create_res.json()["session_id"]

        # 2. HOD CSE creates a proposal for CSE
        prop_payload = {
            "session_id": session_id,
            "department_id": "DEPT-CSE",
            "proposal_title": "AI & Advanced Python Hands-on Bootcamp",
            "initiative_category": "BOOTCAMP",
            "target_cohort": "CSE 3rd & 4th Year Students",
            "learning_outcomes": [
                "Implement neural networks with PyTorch",
                "Deploy FastAPI ML microservices",
            ],
            "justification": "Identified critical deficit in Python and Deep Learning benchmarks.",
            "proposed_duration_weeks": 2,
            "estimated_cost": 45000.0,
        }
        res_create = await client.post("/api/v1/governance/proposals", json=prop_payload, headers=hod_cse_headers)
        assert res_create.status_code == 201
        prop_data = res_create.json()
        prop_id = prop_data["proposal_id"]
        assert prop_data["status"] == "DRAFT"
        assert prop_data["department_code"] == "DEPT-CSE"
        assert prop_data["submitted_by"] == "hod_cse"

        # 3. HOD ECE tries to edit or submit CSE's proposal -> 403 Forbidden
        res_cross = await client.patch(
            f"/api/v1/governance/proposals/{prop_id}",
            json={"proposal_title": "Hijacked Title"},
            headers=hod_ece_headers,
        )
        assert res_cross.status_code == 403

        # 4. HOD CSE updates proposal
        res_update = await client.patch(
            f"/api/v1/governance/proposals/{prop_id}",
            json={"proposed_duration_weeks": 3},
            headers=hod_cse_headers,
        )
        assert res_update.status_code == 200
        assert res_update.json()["proposed_duration_weeks"] == 3

        # 5. HOD CSE submits proposal to Dean
        res_submit = await client.post(
            f"/api/v1/governance/proposals/{prop_id}/submit",
            headers=hod_cse_headers,
        )
        assert res_submit.status_code == 200
        assert res_submit.json()["status"] == "SUBMITTED"

        # 6. HOD tries to decide on own proposal -> 403 Forbidden (Only Dean/Admin)
        res_hod_decide = await client.post(
            f"/api/v1/governance/proposals/{prop_id}/decision",
            json={"decision": "APPROVED", "remarks": "Self-approved"},
            headers=hod_cse_headers,
        )
        assert res_hod_decide.status_code == 403

        # 7. Dean approves proposal
        res_dean_decide = await client.post(
            f"/api/v1/governance/proposals/{prop_id}/decision",
            json={"decision": "APPROVED", "remarks": "Institutional budget allocated for CSE."},
            headers=dean_headers,
        )
        assert res_dean_decide.status_code == 200
        approved_data = res_dean_decide.json()
        assert approved_data["status"] == "APPROVED"
        assert approved_data["reviewed_by"] == "dean"
        assert approved_data["decision_remarks"] == "Institutional budget allocated for CSE."

        # 8. List proposals
        # Dean sees proposal
        res_dean_list = await client.get("/api/v1/governance/proposals", headers=dean_headers)
        assert res_dean_list.status_code == 200
        assert any(p["proposal_id"] == prop_id for p in res_dean_list.json())

        # HOD ECE does not see CSE proposal
        res_ece_list = await client.get("/api/v1/governance/proposals", headers=hod_ece_headers)
        assert res_ece_list.status_code == 200
        assert not any(p["proposal_id"] == prop_id for p in res_ece_list.json())
