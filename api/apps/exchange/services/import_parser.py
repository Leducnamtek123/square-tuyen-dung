import csv
import io
import logging
from typing import Dict, List, Optional, Tuple
import openpyxl
from apps.exchange.base import ErrorCodes, ValidationIssue

logger = logging.getLogger(__name__)


class ParsedSheet:
    def __init__(
        self,
        headers: List[str],
        rows: List[dict],
        issues: Optional[List[ValidationIssue]] = None,
    ):
        self.headers = headers
        self.rows = rows  # List of dicts, each has "_row_number"
        self.issues = issues or []


class ImportParser:
    @staticmethod
    def parse_file(file_obj, filename: str) -> ParsedSheet:
        """Parse an uploaded file (XLSX or CSV) and extract raw rows."""
        name_lower = filename.lower()
        try:
            if name_lower.endswith(".csv"):
                return ImportParser._parse_csv(file_obj)
            elif name_lower.endswith(".xlsx") or name_lower.endswith(".xls"):
                return ImportParser._parse_xlsx(file_obj)
            else:
                return ParsedSheet(
                    headers=[],
                    rows=[],
                    issues=[
                        ValidationIssue(
                            field="file",
                            code=ErrorCodes.IMPORT_INVALID_FILE,
                            message="Chỉ hỗ trợ file định dạng Excel (.xlsx) hoặc CSV (.csv).",
                        )
                    ],
                )
        except Exception as exc:
            logger.warning("Failed to parse file %s: %s", filename, exc)
            return ParsedSheet(
                headers=[],
                rows=[],
                issues=[
                    ValidationIssue(
                        field="file",
                        code=ErrorCodes.IMPORT_INVALID_FILE,
                        message=f"Không thể đọc file: {str(exc)}",
                    )
                ],
            )

    @staticmethod
    def _parse_csv(file_obj) -> ParsedSheet:
        content = file_obj.read()
        if isinstance(content, bytes):
            # Try utf-8-sig first to strip BOM, then fallback to utf-8, latin-1
            try:
                text = content.decode("utf-8-sig")
            except UnicodeDecodeError:
                try:
                    text = content.decode("utf-8")
                except UnicodeDecodeError:
                    text = content.decode("latin-1")
        else:
            text = str(content)

        text_stream = io.StringIO(text.strip())
        reader = csv.reader(text_stream)

        rows_data = list(reader)
        if not rows_data or len(rows_data) < 1:
            return ParsedSheet(
                headers=[],
                rows=[],
                issues=[
                    ValidationIssue(
                        field="file",
                        code=ErrorCodes.IMPORT_EMPTY_FILE,
                        message="File không có dữ liệu.",
                    )
                ],
            )

        raw_headers = [str(h).strip() for h in rows_data[0]]
        headers = [h for h in raw_headers if h]

        rows = []
        for idx, row in enumerate(rows_data[1:], start=2):
            if not any(str(c).strip() for c in row):
                continue  # Skip completely empty lines
            row_dict = {"_row_number": idx}
            for h_idx, h in enumerate(headers):
                val = row[h_idx].strip() if h_idx < len(row) else ""
                row_dict[h] = val
            rows.append(row_dict)

        return ParsedSheet(headers=headers, rows=rows)

    @staticmethod
    def _parse_xlsx(file_obj) -> ParsedSheet:
        try:
            wb = openpyxl.load_workbook(file_obj, data_only=True, read_only=True)
        except Exception as e:
            return ParsedSheet(
                headers=[],
                rows=[],
                issues=[
                    ValidationIssue(
                        field="file",
                        code=ErrorCodes.IMPORT_INVALID_FILE,
                        message=f"File Excel bị lỗi hoặc không đúng định dạng: {str(e)}",
                    )
                ],
            )

        ws = wb.active
        if ws is None:
            return ParsedSheet(
                headers=[],
                rows=[],
                issues=[
                    ValidationIssue(
                        field="file",
                        code=ErrorCodes.IMPORT_EMPTY_FILE,
                        message="File Excel không có sheet nào.",
                    )
                ],
            )

        row_iterator = ws.iter_rows(values_only=True)
        try:
            first_row = next(row_iterator)
        except StopIteration:
            return ParsedSheet(
                headers=[],
                rows=[],
                issues=[
                    ValidationIssue(
                        field="file",
                        code=ErrorCodes.IMPORT_EMPTY_FILE,
                        message="File Excel trống rỗng.",
                    )
                ],
            )

        raw_headers = [str(cell).strip() if cell is not None else "" for cell in first_row]
        headers = [h for h in raw_headers if h]

        if not headers:
            return ParsedSheet(
                headers=[],
                rows=[],
                issues=[
                    ValidationIssue(
                        field="file",
                        code=ErrorCodes.IMPORT_EMPTY_FILE,
                        message="Không tìm thấy tiêu đề cột ở dòng đầu tiên.",
                    )
                ],
            )

        rows = []
        row_idx = 1
        for row in row_iterator:
            row_idx += 1
            if not any(cell is not None and str(cell).strip() != "" for cell in row):
                continue  # Skip empty rows
            row_dict = {"_row_number": row_idx}
            for col_idx, h in enumerate(headers):
                cell_val = row[col_idx] if col_idx < len(row) else None
                if cell_val is not None and not isinstance(cell_val, (int, float)):
                    cell_val = str(cell_val).strip()
                row_dict[h] = cell_val if cell_val is not None else ""
            rows.append(row_dict)

        return ParsedSheet(headers=headers, rows=rows)
