"""
Unit & API tests for Export Engine and Distribution (Phase 7, ADR-004, ADR-005)
"""
import io
import zipfile
import hashlib
import openpyxl
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.modules.exports.excel_generator import sanitize_cell_value


@pytest.mark.anyio
async def test_formula_injection_defense():
    """Verify EXPORT_ARCHITECTURE.md §22.5 formula injection escaping."""
    assert sanitize_cell_value("=1+1") == "'=1+1"
    assert sanitize_cell_value("+SUM(A1:B1)") == "'+SUM(A1:B1)"
    assert sanitize_cell_value("-100") == "'-100"
    assert sanitize_cell_value("@calc") == "'@calc"
    assert sanitize_cell_value("\tcmd") == "'\tcmd"
    assert sanitize_cell_value("Regular Skill") == "Regular Skill"
    assert sanitize_cell_value(123) == 123


@pytest.mark.anyio
async def test_exports_lifecycle_pdf_excel_csv_and_zip_package():
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
                "session_name": "Phase 7 Export Test Session",
                "session_type": "COMBINED",
                "academic_year": "2026-2027",
                "expiry_hours": 24,
            }
        )
        assert session_resp.status_code == 201
        session_id = session_resp.json()["session_id"]
        await client.post(f"/api/v1/sessions/{session_id}/activate", headers=headers)

        # 3. Ingest sample assessment records
        csv_data = (
            "Student ID,Department,Skill Name,Proficiency Level\n"
            "STU_EXP_01,DEPT-CSE,Python,Beginner\n"
            "STU_EXP_02,DEPT-CSE,Python,Intermediate\n"
            "STU_EXP_03,DEPT-CSE,Git,Intermediate\n"
            "STU_EXP_04,DEPT-ECE,C Programming,Expert\n"
        )
        preview_resp = await client.post(
            f"/api/v1/sessions/{session_id}/uploads",
            headers=headers,
            files={"file": ("test_export_data.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")}
        )
        assert preview_resp.status_code == 200
        upload_id = preview_resp.json()["upload_id"]
        confirm_resp = await client.post(f"/api/v1/sessions/{session_id}/uploads/{upload_id}/confirm", headers=headers)
        assert confirm_resp.status_code == 200

        # 4. Generate PDF Report
        res_pdf = await client.post(
            f"/api/v1/sessions/{session_id}/exports",
            headers=headers,
            json={"export_mode": "REPORTS_ONLY", "format": "PDF"}
        )
        assert res_pdf.status_code == 201
        pdf_meta = res_pdf.json()
        assert pdf_meta["format"] == "PDF"
        assert pdf_meta["filename"].endswith(".pdf")
        assert "download_token" in pdf_meta

        # Download PDF with token
        res_dl_pdf = await client.get(pdf_meta["download_url"])
        assert res_dl_pdf.status_code == 200
        assert res_dl_pdf.content.startswith(b"%PDF")

        # 5. Generate Excel Report (XLSX)
        res_xlsx = await client.post(
            f"/api/v1/sessions/{session_id}/exports",
            headers=headers,
            json={"export_mode": "REPORTS_ONLY", "format": "XLSX"}
        )
        assert res_xlsx.status_code == 201
        xlsx_meta = res_xlsx.json()
        assert xlsx_meta["format"] == "XLSX"

        # Download Excel with token
        res_dl_xlsx = await client.get(xlsx_meta["download_url"])
        assert res_dl_xlsx.status_code == 200
        wb = openpyxl.load_workbook(io.BytesIO(res_dl_xlsx.content))
        sheet_names = wb.sheetnames
        assert "Executive Summary" in sheet_names
        assert "Department Intelligence" in sheet_names
        assert "Curriculum Benchmark Gaps" in sheet_names
        assert "Recommended Interventions" in sheet_names

        # 6. Generate CSV Report
        res_csv = await client.post(
            f"/api/v1/sessions/{session_id}/exports",
            headers=headers,
            json={"export_mode": "REPORTS_ONLY", "format": "CSV"}
        )
        assert res_csv.status_code == 201
        csv_meta = res_csv.json()
        res_dl_csv = await client.get(csv_meta["download_url"])
        assert res_dl_csv.status_code == 200
        csv_text = res_dl_csv.content.decode("utf-8")
        assert "department_code" in csv_text
        assert "skill_name" in csv_text

        # 7. Generate Complete Analysis Package (ZIP with ADR-005 SHA-256 Manifest)
        res_zip = await client.post(
            f"/api/v1/sessions/{session_id}/exports",
            headers=headers,
            json={
                "export_mode": "COMPLETE_ANALYSIS",
                "format": "ZIP",
                "include_original_upload": False,
            }
        )
        assert res_zip.status_code == 201
        zip_meta = res_zip.json()
        assert zip_meta["format"] == "ZIP"

        # Download Complete ZIP package
        res_dl_zip = await client.get(zip_meta["download_url"])
        assert res_dl_zip.status_code == 200

        zf = zipfile.ZipFile(io.BytesIO(res_dl_zip.content))
        namelist = zf.namelist()
        assert "manifest.json" in namelist
        assert "analysis_summary.json" in namelist
        assert "department_analysis.csv" in namelist
        assert "skill_gaps.csv" in namelist
        assert "recommendations.csv" in namelist
        assert "skills_report.xlsx" in namelist
        assert "executive_report.pdf" in namelist

        # Verify Manifest SHA-256 Integrity (ADR-005)
        import json
        manifest = json.loads(zf.read("manifest.json").decode("utf-8"))
        assert manifest["archive_type"] == "COMPLETE_ANALYSIS_PACKAGE"
        assert manifest["original_uploads_included"] is False

        for f_entry in manifest["files"]:
            file_data = zf.read(f_entry["filename"])
            calculated_hash = hashlib.sha256(file_data).hexdigest()
            assert calculated_hash == f_entry["sha256"], f"Hash mismatch for {f_entry['filename']}"

        # 8. Test invalid token download -> 403 Forbidden
        bad_dl = await client.get(f"/api/v1/exports/{zip_meta['export_id']}/download?token=wrong_token")
        assert bad_dl.status_code == 403
