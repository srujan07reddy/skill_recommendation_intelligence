"""
SSIP File Ingestion Parser
DATA_FLOW_ARCHITECTURE.md §4.2, VALIDATION_RULES.md §7
Parses Excel (.xlsx, .xls) and CSV (.csv) files into standardized raw tabular records.
"""
import io
import csv
from typing import Any, Dict, List, Sequence, Tuple
from fastapi import UploadFile
import openpyxl
import xlrd

from app.core.config import settings
from app.core.exceptions import ValidationException


async def parse_uploaded_file(file: UploadFile) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Parses an uploaded file into raw dictionary records.
    Enforces format, magic-byte signatures, and configurable file size limits.
    """
    filename = file.filename or "uploaded_dataset"
    ext = filename.split(".")[-1].lower() if "." in filename else ""

    allowed_exts = [e.strip().lower() for e in settings.ALLOWED_UPLOAD_EXTENSIONS.split(",")]
    if ext not in allowed_exts:
        raise ValidationException(
            f"Unsupported file format '.{ext}'. Supported formats are: {', '.join(allowed_exts)}"
        )

    content = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise ValidationException(
            f"File size ({len(content)/(1024*1024):.1f}MB) exceeds configured maximum limit of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    if len(content) == 0:
        raise ValidationException("Uploaded file is empty.")

    # Validate file magic bytes signature (§7.2, SECURITY_ARCHITECTURE.md)
    if content.startswith(b"MZ") or content.startswith(b"\x7fELF"):
        raise ValidationException("Executable binaries and scripts are strictly forbidden.")

    if ext == "xlsx":
        if not content.startswith(b"PK\x03\x04"):
            raise ValidationException("Corrupted or invalid Excel file format (invalid ZIP signature).")
        records = _parse_excel_xlsx(content)
    elif ext == "xls":
        if not content.startswith(b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"):
            raise ValidationException("Corrupted or invalid legacy Excel (.xls) file signature.")
        records = _parse_excel_xls(content)
    elif ext == "csv":
        if content.startswith(b"PK\x03\x04"):
            raise ValidationException("Binary Excel archive uploaded with .csv extension. Please upload as .xlsx.")
        records = _parse_csv(content)
    else:
        records = []

    if not records:
        raise ValidationException("Workbook or CSV file contains no data rows.")

    return filename, records


def _format_cell(val: Any) -> str:
    """Convert cell value to trimmed string, normalizing whole floats like 85.0 -> '85'."""
    if val is None:
        return ""
    if isinstance(val, float) and val.is_integer():
        return str(int(val))
    return str(val).strip()


def _rows_to_dicts(rows: Sequence[Sequence[Any]]) -> List[Dict[str, Any]]:
    """Convert raw header + data rows into row-indexed dictionaries."""
    if not rows or len(rows) < 2:
        return []

    headers = [
        str(cell).strip() if cell is not None and str(cell).strip() != "" else f"col_{i}"
        for i, cell in enumerate(rows[0])
    ]
    data_rows: List[Dict[str, Any]] = []

    for row_idx, row in enumerate(rows[1:], start=2):
        if not any(cell is not None and str(cell).strip() != "" for cell in row):
            continue

        row_dict: Dict[str, Any] = {"_row_num": row_idx}
        for i, val in enumerate(row):
            col_name = headers[i] if i < len(headers) else f"col_{i}"
            row_dict[col_name] = _format_cell(val)
        data_rows.append(row_dict)

    return data_rows


def _parse_excel_xlsx(content: bytes) -> List[Dict[str, Any]]:
    """Parse .xlsx using openpyxl in data_only mode (protects against formula injection)."""
    try:
        workbook = openpyxl.load_workbook(io.BytesIO(content), data_only=True, read_only=True)
    except Exception as e:
        raise ValidationException(f"Failed to read Excel (.xlsx) file: {str(e)}")

    try:
        sheet = workbook.active
        if not sheet:
            raise ValidationException("No active worksheet found in Excel file.")
        rows = list(sheet.iter_rows(values_only=True))
        return _rows_to_dicts(rows)
    finally:
        workbook.close()


def _parse_excel_xls(content: bytes) -> List[Dict[str, Any]]:
    """Parse legacy .xls Excel 97-2003 files using xlrd."""
    try:
        workbook = xlrd.open_workbook(file_contents=content)
    except Exception as e:
        raise ValidationException(f"Failed to read legacy Excel (.xls) file: {str(e)}")

    if workbook.nsheets == 0:
        raise ValidationException("No worksheets found in legacy Excel (.xls) file.")

    sheet = workbook.sheet_by_index(0)
    rows = [sheet.row_values(r) for r in range(sheet.nrows)]
    return _rows_to_dicts(rows)


def _parse_csv(content: bytes) -> List[Dict[str, Any]]:
    """Parse .csv with encoding and delimiter fallback."""
    text_content = ""
    for encoding in ("utf-8-sig", "utf-8", "latin-1"):
        try:
            text_content = content.decode(encoding)
            break
        except UnicodeDecodeError:
            continue

    if not text_content:
        raise ValidationException("Unable to decode CSV file with supported encodings (UTF-8, Latin-1).")

    sample = text_content[:2048]
    delimiter = ","
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=",\t;|")
        delimiter = dialect.delimiter
    except Exception:
        pass

    reader = csv.reader(io.StringIO(text_content), delimiter=delimiter)
    all_rows = list(reader)
    return _rows_to_dicts(all_rows)

