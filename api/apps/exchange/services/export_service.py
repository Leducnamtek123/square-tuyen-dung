import csv
import io
import logging
from typing import List, Optional
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
import openpyxl
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

from apps.common.models import AuditLog
from apps.common.views import record_audit_log
from apps.exchange.base import BaseExchangeDefinition
from apps.exchange.models import ExportJob
from apps.exchange.registry import exchange_registry
from apps.files.models import File
from shared.helpers.cloudinary_service import CloudinaryService

logger = logging.getLogger(__name__)


class ExportService:
    @staticmethod
    def run_export_job(job: ExportJob) -> ExportJob:
        """Execute the export job, query records, generate spreadsheet, and upload."""
        definition = exchange_registry.get(job.entity_type)
        if not definition:
            job.status = ExportJob.Status.FAILED
            job.error_message = f"Unknown entity type '{job.entity_type}'"
            job.save()
            return job

        job.status = ExportJob.Status.PROCESSING
        job.started_at = timezone.now()
        job.current_step = "Querying data..."
        job.progress = 10
        job.save()

        try:
            # 1. Fetch filtered tenant-isolated queryset
            queryset = definition.get_queryset(
                user=job.created_by,
                company=job.company,
                filters=job.filters or {},
            )
            total_count = queryset.count()
            job.total_rows = total_count
            job.current_step = f"Transforming {total_count} records..."
            job.progress = 30
            job.save()

            # 2. Selected field keys
            selected_keys = job.selected_fields
            if not selected_keys:
                selected_keys = [
                    k for k, f in definition.export_fields.items() if f.default_checked and not f.sensitive
                ]

            headers = [definition.export_fields[k].label for k in selected_keys if k in definition.export_fields]

            # 3. Stream / iterate through records
            rows: List[List] = []
            processed = 0
            for instance in queryset.iterator(chunk_size=500):
                data_dict = definition.transform_for_export(instance, selected_keys)
                row_vals = [data_dict.get(h, "") for h in headers]
                rows.append(row_vals)
                processed += 1
                if processed % 500 == 0 or processed == total_count:
                    job.processed_rows = processed
                    job.progress = min(90, 30 + int((processed / max(1, total_count)) * 50))
                    job.save()

            # 4. Generate file buffer
            job.current_step = f"Generating {job.format.upper()} file..."
            job.progress = 85
            job.save()

            if job.format.lower() == "csv":
                file_bytes, ext, mime_type = ExportService._generate_csv(headers, rows)
            else:
                file_bytes, ext, mime_type = ExportService._generate_xlsx(definition.label, headers, rows)

            # 5. Store file in storage (MinIO via CloudinaryService)
            job.current_step = "Saving export file..."
            job.progress = 95
            job.save()

            filename = f"{job.public_id}_{job.entity_type}.{ext}"
            from django.core.cache import cache
            cache.set(f"exchange:export_file:{job.public_id}", (file_bytes, mime_type, filename), timeout=86400)

            file_record = None
            file_url = f"/api/v1/exchange/exports/{job.public_id}/download/"
            try:
                uploaded_file = SimpleUploadedFile(
                    name=filename,
                    content=file_bytes,
                    content_type=mime_type,
                )
                upload_result = CloudinaryService.upload_file(uploaded_file, "exports")
                if upload_result:
                    file_record = File.update_or_create_file_with_cloudinary(
                        None,
                        upload_result,
                        file_type=File.SYSTEM_TYPE,
                    )
                    file_url = file_record.get_full_url() or file_url
            except Exception as up_exc:
                logger.warning("CloudinaryService upload skipped/failed: %s", up_exc)

            job.file = file_record
            job.file_url = file_url
            job.status = ExportJob.Status.COMPLETED
            job.progress = 100
            job.current_step = "Completed"
            job.completed_at = timezone.now()
            job.processed_rows = processed
            job.save()

            logger.info("ExportJob %s completed successfully with %d rows", job.public_id, processed)
            return job

        except Exception as exc:
            logger.exception("ExportJob %s failed: %s", job.public_id, exc)
            job.status = ExportJob.Status.FAILED
            job.error_message = str(exc)
            job.save()
            return job

    @staticmethod
    def _generate_csv(headers: List[str], rows: List[List]) -> tuple[bytes, str, str]:
        buffer = io.StringIO()
        # UTF-8 BOM so Microsoft Excel recognizes Vietnamese characters
        buffer.write("\ufeff")
        writer = csv.writer(buffer, quoting=csv.QUOTE_MINIMAL)
        writer.writerow(headers)
        for r in rows:
            writer.writerow(r)
        return buffer.getvalue().encode("utf-8-sig"), "csv", "text/csv; charset=utf-8"

    @staticmethod
    def _generate_xlsx(title: str, headers: List[str], rows: List[List]) -> tuple[bytes, str, str]:
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = (title[:30] if title else "Data").replace("/", "-")

        # Visual styling
        header_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
        header_font = Font(name="Arial", size=11, bold=True, color="FFFFFF")
        regular_font = Font(name="Arial", size=10)
        thin_border = Border(
            left=Side(style="thin", color="E2E8F0"),
            right=Side(style="thin", color="E2E8F0"),
            top=Side(style="thin", color="E2E8F0"),
            bottom=Side(style="thin", color="E2E8F0"),
        )
        zebra_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")

        # Write header
        ws.append(headers)
        for col_idx in range(1, len(headers) + 1):
            cell = ws.cell(row=1, column=col_idx)
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal="center", vertical="center")
            cell.border = thin_border
        ws.row_dimensions[1].height = 28

        # Write data rows
        for row_idx, row in enumerate(rows, start=2):
            ws.append(row)
            is_even = (row_idx % 2 == 0)
            for col_idx in range(1, len(row) + 1):
                cell = ws.cell(row=row_idx, column=col_idx)
                cell.font = regular_font
                cell.border = thin_border
                cell.alignment = Alignment(vertical="center")
                if is_even:
                    cell.fill = zebra_fill
            ws.row_dimensions[row_idx].height = 20

        # Auto-fit column widths cleanly
        for col in ws.columns:
            max_len = 0
            col_letter = get_column_letter(col[0].column)
            for cell in col:
                val_str = str(cell.value or "")
                max_len = max(max_len, len(val_str))
            ws.column_dimensions[col_letter].width = max(12, min(max_len + 4, 50))

        ws.freeze_panes = "A2"
        out = io.BytesIO()
        wb.save(out)
        out.seek(0)
        return out.getvalue(), "xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
