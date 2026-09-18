import io
import pytest
import openpyxl
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient

from apps.exchange.base import ErrorCodes
from apps.exchange.models import ExportJob, ImportJob
from apps.exchange.registry import exchange_registry
from apps.hrm.models import Department, Employee
from apps.profiles.models import Company, EmployerCandidateProfile


@pytest.fixture
def auth_client():
    return APIClient()


@pytest.fixture
def other_company(db, location):
    from apps.accounts.models import User
    from shared.configs import variable_system as var_sys
    other_user = User.objects.create_user_with_role_name(
        email="other_employer@test.com",
        full_name="Other Employer",
        role_name=var_sys.EMPLOYER,
        password="testpass123",
        is_active=True,
        is_verify_email=True,
        has_company=True,
    )
    return Company.objects.create(
        company_name="Other Company",
        company_email="other@test.com",
        company_phone="0911223344",
        tax_code="9876543210",
        user=other_user,
        location=location,
    )


def test_registry_registration():
    """Verify core exchange definitions are registered in central registry."""
    definitions = exchange_registry.all()
    assert "candidate" in definitions
    assert "employee" in definitions
    assert "job_post" in definitions
    assert "department" in definitions
    assert "attendance_punch" in definitions
    assert "payroll" in definitions
    assert "audit_log" in definitions
    assert "question_bank" in definitions
    assert "interview" in definitions
    assert "leave_request" in definitions
    assert "user" in definitions
    assert "company" in definitions


def test_definitions_endpoint(auth_client, employer_user, company):
    """Verify /api/v1/exchange/definitions/ returns accessible definitions."""
    auth_client.force_authenticate(user=employer_user)
    response = auth_client.get("/api/v1/exchange/definitions/")
    assert response.status_code == 200
    data = response.data.get("data", response.data)
    entity_types = [d["entityType"] for d in data]
    assert "candidate" in entity_types
    assert "employee" in entity_types
    assert "job_post" in entity_types


def test_template_download_generates_valid_xlsx(auth_client, employer_user):
    """Verify /api/v1/exchange/templates/<entity>/ returns a valid styled spreadsheet."""
    auth_client.force_authenticate(user=employer_user)
    response = auth_client.get("/api/v1/exchange/templates/candidate/")
    assert response.status_code == 200
    assert "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" in response["Content-Type"]

    wb = openpyxl.load_workbook(io.BytesIO(response.content))
    assert "DuLieuNhap" in wb.sheetnames
    assert "HuongDan" in wb.sheetnames
    ws_data = wb["DuLieuNhap"]
    headers = [cell.value for cell in ws_data[1]]
    assert "Họ và tên *" in headers
    assert "Email *" in headers


def test_export_candidates_generates_file(auth_client, employer_user, company, city, career):
    """Test candidate export creates an ExportJob with proper spreadsheet."""
    EmployerCandidateProfile.objects.create(
        company=company,
        created_by=employer_user,
        full_name="Nguyễn Văn Xuất",
        email="xuat@example.com",
        title="Kỹ sư xây dựng",
        city=city,
        career=career,
    )

    auth_client.force_authenticate(user=employer_user)
    payload = {
        "entity": "candidate",
        "format": "xlsx",
        "fields": ["fullName", "email", "title", "cityName"],
        "async_job": False,
    }
    response = auth_client.post("/api/v1/exchange/exports/", payload, format="json")
    assert response.status_code == 200
    res_data = response.data.get("data", response.data)
    assert res_data["status"] == "completed"
    assert res_data["totalRows"] >= 1
    assert res_data["exportId"].startswith("EXP-")


def test_export_tenant_isolation(auth_client, employer_user, other_company):
    """Ensure user from Company A cannot retrieve or download Company B's export."""
    other_job = ExportJob.objects.create(
        company=other_company,
        created_by=other_company.user,
        entity_type="candidate",
        status=ExportJob.Status.COMPLETED,
    )

    auth_client.force_authenticate(user=employer_user)
    response = auth_client.get(f"/api/v1/exchange/exports/{other_job.public_id}/")
    assert response.status_code == 403

    dl_response = auth_client.get(f"/api/v1/exchange/exports/{other_job.public_id}/download/")
    assert dl_response.status_code == 403


def test_import_candidates_preview_and_validation(auth_client, employer_user, company):
    """Test 3-layer validation: required field checks, email format checks, and error aggregation."""
    auth_client.force_authenticate(user=employer_user)

    csv_content = (
        "Họ và tên,Email,Số điện thoại,Chức danh hồ sơ\n"
        "Nguyễn Văn A,nva@example.com,0912345678,Kỹ sư dân dụng\n"
        ",nvb@example.com,0987654321,Kỹ sư cầu đường\n"  # Missing fullName
        "Trần Văn C,invalid-email-address,0901122334,Kiến trúc sư\n"  # Invalid email
    )
    uploaded_file = SimpleUploadedFile(
        "candidates.csv", csv_content.encode("utf-8-sig"), content_type="text/csv"
    )

    response = auth_client.post(
        "/api/v1/exchange/imports/validate/",
        {
            "file": uploaded_file,
            "entity": "candidate",
            "mode": "create",
        },
        format="multipart",
    )
    assert response.status_code == 200
    data = response.data.get("data", response.data)
    assert data["totalRows"] == 3
    assert data["validRows"] == 1
    assert data["invalidRows"] == 2

    # Check error codes
    error_codes = [err["code"] for err in data["errorSummary"]]
    assert ErrorCodes.IMPORT_REQUIRED_FIELD in error_codes
    assert ErrorCodes.IMPORT_INVALID_EMAIL in error_codes


def test_import_candidates_modes_create_and_upsert(auth_client, employer_user, company):
    """Test import modes: create enforces uniqueness, update updates, upsert merges."""
    auth_client.force_authenticate(user=employer_user)

    EmployerCandidateProfile.objects.create(
        company=company,
        created_by=employer_user,
        full_name="Existing Candidate",
        email="existing@example.com",
        title="Old Title",
    )

    csv_content = (
        "Họ và tên,Email,Chức danh hồ sơ\n"
        "Updated Candidate,existing@example.com,Senior Engineer\n"
    )

    # 1. Mode: CREATE with existing record -> must fail validation
    file_create = SimpleUploadedFile("test.csv", csv_content.encode("utf-8-sig"), content_type="text/csv")
    res_create = auth_client.post(
        "/api/v1/exchange/imports/validate/",
        {"file": file_create, "entity": "candidate", "mode": "create"},
        format="multipart",
    )
    data_create = res_create.data.get("data", res_create.data)
    assert data_create["invalidRows"] == 1
    assert any(err["code"] == ErrorCodes.IMPORT_DUPLICATE_KEY for err in data_create["errorSummary"])

    # 2. Mode: UPSERT with existing record -> valid, action = 'update'
    file_upsert = SimpleUploadedFile("test.csv", csv_content.encode("utf-8-sig"), content_type="text/csv")
    res_upsert = auth_client.post(
        "/api/v1/exchange/imports/validate/",
        {"file": file_upsert, "entity": "candidate", "mode": "upsert"},
        format="multipart",
    )
    data_upsert = res_upsert.data.get("data", res_upsert.data)
    assert data_upsert["validRows"] == 1
    assert data_upsert["invalidRows"] == 0
    import_id = data_upsert["importId"]

    # Confirm and commit the upsert
    res_confirm = auth_client.post(f"/api/v1/exchange/imports/{import_id}/confirm/")
    assert res_confirm.status_code == 200
    cand = EmployerCandidateProfile.objects.get(company=company, email="existing@example.com")
    assert cand.full_name == "Updated Candidate"
    assert cand.title == "Senior Engineer"


def test_import_employee_hrm_relationship_resolution(auth_client, employer_user, company):
    """Test relationship resolution and deterministic failure on missing foreign entities."""
    dept = Department.objects.create(company=company, code="TECH", name="Kỹ thuật")
    auth_client.force_authenticate(user=employer_user)

    csv_content = (
        "Mã nhân viên,Tên,Họ đệm,Email công việc,Mã phòng ban\n"
        "EMP001,An,Nguyễn Văn,an@company.com,TECH\n"
        "EMP002,Bình,Lê Văn,binh@company.com,NONEXISTENT_DEPT\n"
    )
    file_obj = SimpleUploadedFile("employees.csv", csv_content.encode("utf-8-sig"), content_type="text/csv")

    response = auth_client.post(
        "/api/v1/exchange/imports/validate/",
        {"file": file_obj, "entity": "employee", "mode": "create"},
        format="multipart",
    )
    data = response.data.get("data", response.data)
    assert data["totalRows"] == 2
    assert data["validRows"] == 1
    assert data["invalidRows"] == 1

    # Row 2 must have relation not found error
    errors = [e for e in data["errorSummary"] if e["row"] == 3]
    assert any(e["code"] == ErrorCodes.IMPORT_RELATION_NOT_FOUND for e in errors)


def test_atomic_import_transaction_safety(auth_client, employer_user, company):
    """Verify atomic import rejects commit if there are invalid rows."""
    auth_client.force_authenticate(user=employer_user)
    job = ImportJob.objects.create(
        company=company,
        created_by=employer_user,
        entity_type="candidate",
        mode="create",
        status=ImportJob.Status.AWAITING_CONFIRMATION,
        total_rows=2,
        valid_rows=1,
        invalid_rows=1,
    )

    response = auth_client.post(f"/api/v1/exchange/imports/{job.public_id}/confirm/")
    job.refresh_from_db()
    assert job.status == ImportJob.Status.FAILED
    assert "Yêu cầu nhập toàn vẹn" in job.current_step
