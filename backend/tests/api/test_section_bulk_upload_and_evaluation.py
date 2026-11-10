"""
SSIP HOD Section-Wise Bulk Upload & Instant Skill/Gap/Study Evaluation Tests
Verifies:
1. Direct 1-step Bulk Upload endpoint (/api/v1/uploads/direct) for HOD without manual session setup.
2. Wide Format (1 row per student with skill columns & 0-100 marks) + Excel (.xlsx) ingestion.
3. Strict HOD department scoping enforcement during bulk upload.
4. Section-wise evaluation endpoint returning: what they have, gaps, and what they need to study.
"""
import io
import pytest
import openpyxl
from httpx import AsyncClient, ASGITransport

from app.main import app


def _build_xlsx_bytes(rows: list[list[object]]) -> bytes:
    wb = openpyxl.Workbook()
    ws = wb.active
    for r in rows:
        ws.append(r)
    buf = io.BytesIO()
    wb.save(buf)
    wb.close()
    return buf.getvalue()


@pytest.mark.anyio
async def test_hod_direct_wide_upload_and_section_evaluation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. HOD (CSE) login
        hod_login = await client.post(
            "/api/v1/auth/login",
            json={"username": "hod_cse", "password": "HodCsePassword123!"}
        )
        assert hod_login.status_code == 200
        hod_token = hod_login.json()["access_token"]
        headers = {"Authorization": f"Bearer {hod_token}"}

        # 2. Direct Bulk Upload (Wide Format CSV with marks & Section A, NO Department column needed!)
        wide_csv = (
            "Student ID,Section,Python,SQL,Git\n"
            "24CSE101,Section A,85,40,Beginner\n"
            "24CSE102,Section A,35,78,Intermediate\n"
        )
        upload_a = await client.post(
            "/api/v1/uploads/direct",
            headers=headers,
            data={"section": "Section A", "session_id": "NEW", "session_name": "CSE Section-Wise Batch"},
            files={"file": ("cse_sec_a.csv", io.BytesIO(wide_csv.encode("utf-8")), "text/csv")}
        )
        assert upload_a.status_code == 200
        report_a = upload_a.json()
        assert report_a["format_detected"] == "WIDE"
        assert report_a["sections_detected"] == ["Section A"]
        assert report_a["error_rows_count"] == 0
        # 2 students * 3 skills = 6 records
        assert report_a["valid_rows_count"] == 6
        session_id = report_a["session_id"]
        assert session_id

        # Confirm Section A import
        conf_a = await client.post(
            f"/api/v1/sessions/{session_id}/uploads/{report_a['upload_id']}/confirm",
            headers=headers
        )
        assert conf_a.status_code == 200
        assert conf_a.json()["committed_records_count"] == 6

        # 3. Upload Section B as real Excel (.xlsx) reusing the active session (without Section column in file)
        xlsx_bytes = _build_xlsx_bytes([
            ["Roll No", "Python", "SQL"],
            ["24CSE201", "Expert", 90],
        ])
        upload_b = await client.post(
            "/api/v1/uploads/direct",
            headers=headers,
            data={"section": "Section B", "session_id": session_id},
            files={
                "file": (
                    "cse_sec_b.xlsx",
                    io.BytesIO(xlsx_bytes),
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            }
        )
        assert upload_b.status_code == 200
        report_b = upload_b.json()
        assert report_b["format_detected"] == "WIDE"
        assert report_b["sections_detected"] == ["Section B"]
        assert report_b["valid_rows_count"] == 2

        conf_b = await client.post(
            f"/api/v1/sessions/{session_id}/uploads/{report_b['upload_id']}/confirm",
            headers=headers
        )
        assert conf_b.status_code == 200
        assert conf_b.json()["committed_records_count"] == 2

        # 4. Verify Section-Wise Evaluation ("What they have", "Gaps", "What they need to study")
        eval_all = await client.get(
            f"/api/v1/analysis/{session_id}/departments/DEPT-CSE/section-evaluation",
            headers=headers
        )
        assert eval_all.status_code == 200
        all_data = eval_all.json()
        assert all_data["available_sections"] == ["Section A", "Section B"]
        assert all_data["total_students"] == 3

        # Filter strictly to Section A
        eval_a = await client.get(
            f"/api/v1/analysis/{session_id}/departments/DEPT-CSE/section-evaluation",
            params={"section": "Section A"},
            headers=headers
        )
        assert eval_a.status_code == 200
        data_a = eval_a.json()
        assert data_a["selected_section"] == "Section A"
        assert data_a["total_students"] == 2
        assert len(data_a["what_they_have"]) >= 3
        for stu in data_a["student_evaluations"]:
            assert stu["section"] == "Section A"
            assert len(stu["skills_have"]) == 3
            assert len(stu["what_to_study"]) >= 1

        # Filter strictly to Section B
        eval_b = await client.get(
            f"/api/v1/analysis/{session_id}/departments/DEPT-CSE/section-evaluation",
            params={"section": "Section B"},
            headers=headers
        )
        assert eval_b.status_code == 200
        data_b = eval_b.json()
        assert data_b["selected_section"] == "Section B"
        assert data_b["total_students"] == 1
        assert data_b["student_evaluations"][0]["section"] == "Section B"

        # 5. Verify individual records endpoint supports section filtering
        rec_b = await client.get(
            f"/api/v1/sessions/{session_id}/records",
            params={"section": "Section B"},
            headers=headers
        )
        assert rec_b.status_code == 200
        assert rec_b.json()["total_students"] == 1
        assert rec_b.json()["available_sections"] == ["Section A", "Section B"]


@pytest.mark.anyio
async def test_hod_cannot_upload_other_department_rows():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        hod_login = await client.post(
            "/api/v1/auth/login",
            json={"username": "hod_cse", "password": "HodCsePassword123!"}
        )
        headers = {"Authorization": f"Bearer {hod_login.json()['access_token']}"}

        cross_dept_csv = (
            "Student ID,Department,Section,Skill Name,Proficiency Level\n"
            "24ECE001,DEPT-ECE,Section A,Python,Intermediate\n"
        )
        resp = await client.post(
            "/api/v1/uploads/direct",
            headers=headers,
            files={"file": ("wrong_dept.csv", io.BytesIO(cross_dept_csv.encode("utf-8")), "text/csv")}
        )
        assert resp.status_code == 200
        report = resp.json()
        assert report["validation_status"] == "INVALID"
        assert report["error_rows_count"] == 1
        assert any("Department mismatch" in e["message"] for e in report["errors"])
