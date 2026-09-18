from datetime import date
from unittest.mock import MagicMock

import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.files.models import File
from apps.profiles.models import JobSeekerProfile, Resume
from apps.profiles.services.pdf_extraction import (
    extract_and_apply_pdf_info,
    parse_cv_text_content,
)
from shared.configs import variable_system as var_sys


# ============================================================================
# Section 1: Extraction of real data from PDF text strings
# ============================================================================

def test_parse_cv_text_extracts_real_email_and_vietnam_phone():
    sample_text = """
    NGUYEN VAN AN
    Ky su Giam sat Xay dung
    Email: an.nguyen.engineer@gmail.com
    Dien thoai: 0987654321
    Ngay sinh: 15/08/1992
    Gioi tinh: Nam
    Dia chi: 123 Duong Le Loi, Phuong Ben Nghe, Quan 1, TP Ho Chi Minh
    """
    data = parse_cv_text_content(sample_text)

    assert data.get("email") == "an.nguyen.engineer@gmail.com"
    assert data.get("phone") == "0987654321"
    assert data.get("birthday") == date(1992, 8, 15)
    assert data.get("gender") == "M"
    assert data.get("title") == "Ky su Giam sat Xay dung"
    assert "123 Duong Le Loi" in data.get("address", "")


def test_parse_cv_text_extracts_vietnam_phone_with_various_valid_formats():
    text_with_country_code = "Lien he: +84912345678 khi can phong van"
    assert parse_cv_text_content(text_with_country_code).get("phone") == "+84912345678"

    text_with_spaces = "Mobile: 034 567 8901 - lien he gio hanh chinh"
    assert parse_cv_text_content(text_with_spaces).get("phone") == "0345678901"

    text_with_dots = "Tel: 077.234.5678"
    assert parse_cv_text_content(text_with_dots).get("phone") == "0772345678"


def test_parse_cv_text_extracts_female_gender_and_date_variants():
    sample_text = """
    TRAN THI MAI
    Chuyen vien Nhan su Tuyen dung
    Email: tranmai.hr@outlook.com
    So dien thoai: 0903112233
    Ngay sinh: 05-12-1996
    Gioi tinh: Nu
    Address: So 456 Duong Nguyen Thi Minh Khai, Quan 3, TP Ho Chi Minh
    """
    data = parse_cv_text_content(sample_text)

    assert data.get("email") == "tranmai.hr@outlook.com"
    assert data.get("phone") == "0903112233"
    assert data.get("birthday") == date(1996, 12, 5)
    assert data.get("gender") == "F"
    assert data.get("title") == "Chuyen vien Nhan su Tuyen dung"
    assert "Quan 3" in data.get("address", "")


# ============================================================================
# Section 2: Exclusion of proxy emails
# ============================================================================

def test_parse_cv_text_excludes_proxy_emails_and_picks_real_email():
    text_with_proxy_and_real = """
    Ho so ung vien: candidate_8899.private.nhanlucsieuviet.com
    Email chuyen tiep: contact@imported.infohr.vn
    Email lien he truc tiep: leducanh.architect@gmail.com
    Dien thoai: 0918776655
    """
    data = parse_cv_text_content(text_with_proxy_and_real)

    assert data.get("email") == "leducanh.architect@gmail.com"


def test_parse_cv_text_returns_no_email_when_only_proxy_emails_present():
    text_only_proxies = """
    Ung vien ViecLam24h
    Hom thu he thong: seeker_554433.private.nhanlucsieuviet.com
    Chuyen tiep: notify@imported.infohr.vn
    Dien thoai: 0988112233
    """
    data = parse_cv_text_content(text_only_proxies)

    assert "email" not in data


# ============================================================================
# Section 3: Handling account email conflicts
# ============================================================================

@pytest.mark.django_db
def test_extract_and_apply_pdf_info_prevents_overwrite_on_email_collision(monkeypatch, resume, job_seeker_user):
    existing_other_user = User.objects.create_user_with_role_name(
        email="conflict_target@example.com",
        full_name="Target Person",
        role_name=var_sys.JOB_SEEKER,
        password="testpass123",
        is_active=True,
    )

    dummy_file = File.objects.create(
        public_id="mock_cv_collision.pdf",
        format="pdf",
        resource_type="raw",
        file_type=File.CV_TYPE,
        uploaded_at=timezone.now(),
    )
    resume.file = dummy_file
    resume.save(update_fields=["file", "update_at"])

    fake_parsed_data = {
        "email": existing_other_user.email,
        "phone": "0933445566",
        "birthday": date(1994, 3, 20),
        "gender": "M",
        "title": "Chi huy pho Cong trinh",
        "address": "Phuong Binh An, Thanh pho Thu Duc",
    }

    mock_client = MagicMock()
    mock_resp = MagicMock()
    mock_resp.read.return_value = b"%PDF-1.4 dummy"
    mock_client.get_object.return_value = mock_resp
    monkeypatch.setattr("apps.profiles.services.pdf_extraction.CloudinaryService._get_client", lambda: mock_client)
    monkeypatch.setattr("apps.profiles.services.pdf_extraction.fitz.open", MagicMock())
    monkeypatch.setattr("apps.profiles.services.pdf_extraction.parse_cv_text_content", lambda txt: fake_parsed_data)

    original_user_email = job_seeker_user.email
    extract_and_apply_pdf_info(resume=resume, user=job_seeker_user)

    job_seeker_user.refresh_from_db()
    assert job_seeker_user.email == original_user_email
    assert job_seeker_user.email != existing_other_user.email


# ============================================================================
# Section 4: Correct updates to User, JobSeekerProfile, and Resume
# ============================================================================

@pytest.mark.django_db
def test_extract_and_apply_pdf_info_updates_models_when_email_is_unique(monkeypatch, resume, job_seeker_user, job_seeker_profile):
    dummy_file = File.objects.create(
        public_id="mock_cv_valid.pdf",
        format="pdf",
        resource_type="raw",
        file_type=File.CV_TYPE,
        uploaded_at=timezone.now(),
    )
    resume.file = dummy_file
    resume.save(update_fields=["file", "update_at"])

    unique_email = "brand_new_engineer@domain.vn"
    fake_parsed_data = {
        "email": unique_email,
        "phone": "0977889900",
        "birthday": date(1993, 7, 21),
        "gender": "F",
        "title": "Ky su Cau duong",
        "address": "So 789 Duong Vo Van Tan, Phuong 6, Quan 3, TP Ho Chi Minh",
    }

    mock_client = MagicMock()
    mock_resp = MagicMock()
    mock_resp.read.return_value = b"%PDF-1.4 dummy"
    mock_client.get_object.return_value = mock_resp
    monkeypatch.setattr("apps.profiles.services.pdf_extraction.CloudinaryService._get_client", lambda: mock_client)
    monkeypatch.setattr("apps.profiles.services.pdf_extraction.fitz.open", MagicMock())
    monkeypatch.setattr("apps.profiles.services.pdf_extraction.parse_cv_text_content", lambda txt: fake_parsed_data)

    applied = extract_and_apply_pdf_info(
        resume=resume,
        job_seeker_profile=job_seeker_profile,
        user=job_seeker_user,
    )

    assert applied["email"] == unique_email

    job_seeker_user.refresh_from_db()
    assert job_seeker_user.email == unique_email

    job_seeker_profile.refresh_from_db()
    assert job_seeker_profile.phone == "0977889900"
    assert job_seeker_profile.birthday == date(1993, 7, 21)
    assert job_seeker_profile.gender == "F"
    assert job_seeker_profile.contact_address == "So 789 Duong Vo Van Tan, Phuong 6, Quan 3, TP Ho Chi Minh"

    resume.refresh_from_db()
    assert resume.title == "Ky su Cau duong"
    extracted_payload = resume.source_payload.get("extracted_from_pdf", {})
    assert extracted_payload.get("email") == unique_email
    assert extracted_payload.get("birthday") == "1993-07-21"
    assert extracted_payload.get("phone") == "0977889900"


@pytest.mark.django_db
def test_extract_and_apply_pdf_info_returns_empty_when_resume_file_missing(resume):
    resume.file = None
    resume.save(update_fields=["file", "update_at"])

    res = extract_and_apply_pdf_info(resume)
    assert res == {}


# ============================================================================
# Section 5: Candidate profile RBAC permissions check
# Between Employer, Candidate, and Guest
# ============================================================================

@pytest.mark.django_db
def test_candidate_profile_access_permissions_for_employer_candidate_guest(
    employer_user,
    company,
    job_seeker_user,
    job_seeker_profile,
    resume,
    location,
):
    client = APIClient()

    # ------------------------------------------------------------------------
    # Part A: Guest / Unauthenticated user access check
    # ------------------------------------------------------------------------
    client.logout()

    guest_list_res = client.get("/api/v1/info/web/resumes/")
    assert guest_list_res.status_code in (401, 403)

    guest_detail_res = client.get(f"/api/v1/info/web/resumes/{resume.slug}/")
    assert guest_detail_res.status_code in (401, 403)

    guest_owner_res = client.get(f"/api/v1/info/web/private-resumes/{resume.slug}/resume-owner/")
    assert guest_owner_res.status_code in (401, 403)

    guest_profile_res = client.get(f"/api/v1/info/web/job-seeker-profiles/{job_seeker_profile.id}/")
    assert guest_profile_res.status_code in (401, 403)

    # ------------------------------------------------------------------------
    # Part B: Candidate / Job Seeker user access check
    # ------------------------------------------------------------------------
    client.force_authenticate(user=job_seeker_user)

    candidate_list_res = client.get("/api/v1/info/web/resumes/")
    assert candidate_list_res.status_code == 403

    candidate_detail_res = client.get(f"/api/v1/info/web/resumes/{resume.slug}/")
    assert candidate_detail_res.status_code == 403

    candidate_owner_res = client.get(f"/api/v1/info/web/private-resumes/{resume.slug}/resume-owner/")
    assert candidate_owner_res.status_code == 200
    assert candidate_owner_res.json()["success"] is True

    candidate_own_profile = client.get(f"/api/v1/info/web/job-seeker-profiles/{job_seeker_profile.id}/")
    assert candidate_own_profile.status_code == 200

    other_user = User.objects.create_user_with_role_name(
        email="second_candidate@example.com",
        full_name="Second Candidate",
        role_name=var_sys.JOB_SEEKER,
        password="testpass123",
        is_active=True,
    )
    other_profile = JobSeekerProfile.objects.create(
        user=other_user,
        phone="0944556677",
        location=location,
    )
    forbidden_profile_res = client.get(f"/api/v1/info/web/job-seeker-profiles/{other_profile.id}/")
    assert forbidden_profile_res.status_code == 404

    # ------------------------------------------------------------------------
    # Part C: Employer user access check
    # ------------------------------------------------------------------------
    client.force_authenticate(user=employer_user)

    employer_list_res = client.get("/api/v1/info/web/resumes/")
    assert employer_list_res.status_code == 200
    assert employer_list_res.json()["success"] is True

    employer_detail_res = client.get(f"/api/v1/info/web/resumes/{resume.slug}/")
    assert employer_detail_res.status_code == 200
    assert employer_detail_res.json()["success"] is True