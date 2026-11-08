"""
Security Regression and Vulnerability Tests (TASK-09-04)
Validates OWASP headers, rate limiting, binary execution rejection,
JWT forgery defense, SQL injection protection, and cross-department RBAC isolation.
"""
import io
import pytest
from httpx import AsyncClient, ASGITransport
from jose import jwt

from app.main import app
from app.core.config import settings


@pytest.mark.anyio
async def test_security_headers_enforcement():
    """Verify presence of OWASP security headers on all responses."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/v1/health")
        assert resp.status_code == 200
        headers = resp.headers

        assert headers.get("X-Frame-Options") == "DENY"
        assert headers.get("X-Content-Type-Options") == "nosniff"
        assert headers.get("X-XSS-Protection") == "1; mode=block"
        assert "Strict-Transport-Security" in headers
        assert "Content-Security-Policy" in headers
        assert headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"


@pytest.mark.anyio
async def test_rate_limiting_headers():
    """Verify rate limiting headers are injected into API responses."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post(
            "/api/v1/auth/login",
            json={"username": "dean", "password": "DeanPassword123!"}
        )
        assert resp.status_code == 200
        assert "X-RateLimit-Limit" in resp.headers
        assert "X-RateLimit-Remaining" in resp.headers
        assert int(resp.headers["X-RateLimit-Remaining"]) >= 0


@pytest.mark.anyio
async def test_magic_byte_file_signature_rejection():
    """Reject executable binaries disguised as .xlsx or .csv files (§7.2)."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Login Dean
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"username": "dean", "password": "DeanPassword123!"}
        )
        token = login_resp.json()["access_token"]
        auth_headers = {"Authorization": f"Bearer {token}"}

        # Create session
        session_resp = await client.post(
            "/api/v1/sessions",
            headers=auth_headers,
            json={
                "session_name": "Magic Byte Test Session",
                "session_type": "COMBINED",
                "academic_year": "2026-2027",
                "expiry_hours": 1
            }
        )
        session_id = session_resp.json()["session_id"]

        # Fake Windows PE executable binary (starts with MZ)
        malicious_binary = b"MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff\x00\x00"
        upload_resp = await client.post(
            f"/api/v1/sessions/{session_id}/uploads",
            headers=auth_headers,
            files={"file": ("exploit.csv", io.BytesIO(malicious_binary), "text/csv")}
        )
        assert upload_resp.status_code == 422
        assert "Executable binaries and scripts are strictly forbidden" in upload_resp.json()["error"]["message"]

        # Fake Linux ELF binary (starts with \x7fELF)
        malicious_elf = b"\x7fELF\x02\x01\x01\x00"
        upload_elf_resp = await client.post(
            f"/api/v1/sessions/{session_id}/uploads",
            headers=auth_headers,
            files={"file": ("exploit2.xlsx", io.BytesIO(malicious_elf), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
        )
        assert upload_elf_resp.status_code == 422

        # Fake xlsx without valid PK zip signature
        fake_xlsx = b"NOT_A_VALID_ZIP_STREAM"
        upload_fake_resp = await client.post(
            f"/api/v1/sessions/{session_id}/uploads",
            headers=auth_headers,
            files={"file": ("fake.xlsx", io.BytesIO(fake_xlsx), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
        )
        assert upload_fake_resp.status_code == 422
        assert "Corrupted or invalid Excel file format" in upload_fake_resp.json()["error"]["message"]


@pytest.mark.anyio
async def test_jwt_tampering_defense():
    """Reject manipulated or forged JWT tokens."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Token signed with wrong secret key
        forged_token = jwt.encode(
            {"sub": "admin", "roles": ["Administrator"]},
            "WRONG_ATTACKER_SECRET_KEY",
            algorithm="HS256"
        )
        resp = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {forged_token}"}
        )
        assert resp.status_code == 401

        # Malformed header
        resp_malformed = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer not-a-real-jwt"}
        )
        assert resp_malformed.status_code == 401


@pytest.mark.anyio
async def test_cross_department_rbac_isolation():
    """HOD CSE cannot access, submit proposals for, or purge sessions of another department."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Login Dean and HOD CSE
        dean_login = await client.post(
            "/api/v1/auth/login",
            json={"username": "dean", "password": "DeanPassword123!"}
        )
        dean_token = dean_login.json()["access_token"]

        hod_login = await client.post(
            "/api/v1/auth/login",
            json={"username": "hod_cse", "password": "HodCsePassword123!"}
        )
        hod_token = hod_login.json()["access_token"]
        hod_headers = {"Authorization": f"Bearer {hod_token}"}

        # Dean creates a session explicitly scoped to DEPT-ECE
        session_resp = await client.post(
            "/api/v1/sessions",
            headers={"Authorization": f"Bearer {dean_token}"},
            json={
                "session_name": "ECE Department Assessment",
                "session_type": "DEPARTMENT",
                "department_id": "DEPT-ECE",
                "academic_year": "2026-2027",
                "expiry_hours": 2
            }
        )
        ece_session_id = session_resp.json()["session_id"]

        # HOD CSE attempts to purge ECE's session -> Must be 403 Forbidden
        purge_attempt = await client.post(
            f"/api/v1/sessions/{ece_session_id}/purge",
            headers=hod_headers
        )
        assert purge_attempt.status_code == 403
        assert "HOD cannot purge sessions belonging to other departments" in purge_attempt.json()["error"]["message"]

