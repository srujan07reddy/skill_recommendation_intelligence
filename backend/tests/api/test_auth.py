"""
Authentication & RBAC Permission Integration Tests
Verifies login, token generation, user profiles, password rotation, and role/scope guards.
ACCESS_CONTROL.md §5, §7, ADR-003
"""
import os
import sys
import pytest
from httpx import AsyncClient, ASGITransport
from fastapi import APIRouter, Depends
from sqlalchemy import select

# Ensure backend directory is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))
from app.main import app
from app.core.permissions import require_roles, check_department_scope, ForbiddenException

# Add a test-only route to verify RBAC enforcement
test_router = APIRouter(prefix="/api/v1/test-rbac")

@test_router.get("/dean-only", dependencies=[Depends(require_roles(["Dean"]))])
async def dean_only_endpoint():
    return {"status": "authorized for dean"}

@test_router.get("/admin-only", dependencies=[Depends(require_roles(["Administrator"]))])
async def admin_only_endpoint():
    return {"status": "authorized for admin"}

app.include_router(test_router)


@pytest.mark.anyio
async def test_dean_login_success():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/login",
            json={"username": "dean", "password": "DeanPassword123!"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "Dean" in data["user"]["roles"]
        assert data["user"]["must_change_password"] is True


@pytest.mark.anyio
async def test_login_invalid_password():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/login",
            json={"username": "dean", "password": "WrongPassword!"}
        )
        assert response.status_code == 401
        data = response.json()
        assert data["error"]["code"] == "AUTHENTICATION_FAILED"


@pytest.mark.anyio
async def test_get_current_user_me():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"username": "hod_cse", "password": "HodCsePassword123!"}
        )
        assert login_resp.status_code == 200
        token = login_resp.json()["access_token"]

        me_resp = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert me_resp.status_code == 200
        user_data = me_resp.json()
        assert user_data["username"] == "hod_cse"
        assert "HOD" in user_data["roles"]
        assert user_data["department_name"] == "Computer Science & Engineering"


@pytest.mark.anyio
async def test_rbac_role_guard_enforcement():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Login as HOD
        hod_login = await client.post(
            "/api/v1/auth/login",
            json={"username": "hod_cse", "password": "HodCsePassword123!"}
        )
        hod_token = hod_login.json()["access_token"]

        # Login as Dean
        dean_login = await client.post(
            "/api/v1/auth/login",
            json={"username": "dean", "password": "DeanPassword123!"}
        )
        dean_token = dean_login.json()["access_token"]

        # 1. Dean accesses /dean-only -> 200 OK
        resp1 = await client.get(
            "/api/v1/test-rbac/dean-only",
            headers={"Authorization": f"Bearer {dean_token}"}
        )
        assert resp1.status_code == 200

        # 2. HOD accesses /dean-only -> 403 Forbidden
        resp2 = await client.get(
            "/api/v1/test-rbac/dean-only",
            headers={"Authorization": f"Bearer {hod_token}"}
        )
        assert resp2.status_code == 403
        assert resp2.json()["error"]["code"] == "FORBIDDEN_ACCESS"

        # 3. Dean accesses /admin-only -> 403 Forbidden
        resp3 = await client.get(
            "/api/v1/test-rbac/admin-only",
            headers={"Authorization": f"Bearer {dean_token}"}
        )
        assert resp3.status_code == 403


@pytest.mark.anyio
async def test_password_change_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Login admin
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"username": "admin", "password": "AdminPassword123!"}
        )
        assert login_resp.status_code == 200
        token = login_resp.json()["access_token"]

        # Change password
        ch_resp = await client.post(
            "/api/v1/auth/change-password",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "current_password": "AdminPassword123!",
                "new_password": "NewAdminPassword2026!"
            }
        )
        assert ch_resp.status_code == 200
        assert ch_resp.json()["success"] is True

        # Verify old password fails
        fail_resp = await client.post(
            "/api/v1/auth/login",
            json={"username": "admin", "password": "AdminPassword123!"}
        )
        assert fail_resp.status_code == 401

        # Verify new password succeeds
        new_login = await client.post(
            "/api/v1/auth/login",
            json={"username": "admin", "password": "NewAdminPassword2026!"}
        )
        assert new_login.status_code == 200
        assert new_login.json()["user"]["must_change_password"] is False

        # Reset back for clean state
        re_token = new_login.json()["access_token"]
        await client.post(
            "/api/v1/auth/change-password",
            headers={"Authorization": f"Bearer {re_token}"},
            json={
                "current_password": "NewAdminPassword2026!",
                "new_password": "AdminPassword123!"
            }
        )
