#!/usr/bin/env python
"""
======================================================================
Hardcore Recruitment & Interview Adversarial QA Test Suite
Module Focus: apps/accounts, apps/jobs, apps/interviews, apps/cv_builder
======================================================================
"""

import os
import sys
import io
import uuid
import datetime
from decimal import Decimal

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings_test")

import django
django.setup()

from django.conf import settings
settings.ALLOWED_HOSTS = ["*", "testserver", "localhost", "127.0.0.1"]

try:
    from django_elasticsearch_dsl.registries import registry
    registry.update = lambda *a, **kw: None
    registry.delete = lambda *a, **kw: None
except ImportError:
    pass

from django.core.management import call_command
call_command("migrate", verbosity=0)

from django.utils import timezone
from django.core.files.uploadedfile import SimpleUploadedFile
import jwt
from rest_framework.test import APIClient
from oauth2_provider.models import AccessToken, Application

from apps.accounts.models import User
from apps.profiles.models import Company, CompanyRole, CompanyMember, Resume, JobSeekerProfile
from apps.jobs.models import JobPost, JobPostActivity
from apps.interviews.models import Question, QuestionGroup, InterviewSession, InterviewEvaluation
from apps.cv_builder.models import CVTemplate, CandidateCV
from shared.configs import variable_system as var_sys

GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"


def print_banner(text):
    print(f"\n{CYAN}{'='*70}\n{text}\n{'='*70}{RESET}")


def run_audit():
    client = APIClient()
    total_passed = 0
    total_failed = 0
    test_num = 1

    def report(name, passed, detail=""):
        nonlocal total_passed, total_failed, test_num
        status_str = f"{GREEN}[PASS]{RESET}" if passed else f"{RED}[FAIL]{RESET}"
        print(f"  {status_str} #{test_num:02d}: {BOLD}{name}{RESET}")
        if detail:
            color = GREEN if passed else RED
            print(f"         {color}-> {detail}{RESET}")
        if passed:
            total_passed += 1
        else:
            total_failed += 1
        test_num += 1

    print_banner("BAT DAU KIEM THU BIEN & TAN CONG ADVERSARIAL QA")

    # =========================================================================
    # MODULE 1: apps/accounts
    # =========================================================================
    print(f"\n{YELLOW}=== [MODULE 1: APPS/ACCOUNTS] ==={RESET}")

    # Setup accounts
    email_uid = uuid.uuid4().hex[:8]
    user_seeker = User.objects.create_user_with_role_name(
        email=f"candidate_{email_uid}@test.com",
        full_name="Candidate Tester",
        role_name=var_sys.JOB_SEEKER,
        password="ValidPassword123!",
        is_active=True,
    )
    user_employer = User.objects.create_user_with_role_name(
        email=f"employer_{email_uid}@test.com",
        full_name="Employer Tester",
        role_name=var_sys.EMPLOYER,
        password="ValidPassword123!",
        is_active=True,
        has_company=True,
    )

    # Setup OAuth application
    oauth_app, _ = Application.objects.get_or_create(
        name="AdversarialTestApp",
        defaults={
            "client_type": Application.CLIENT_CONFIDENTIAL,
            "authorization_grant_type": Application.GRANT_PASSWORD,
            "user": user_seeker,
        }
    )

    # 1.1 Token / JWT het han
    expired_token = AccessToken.objects.create(
        user=user_seeker,
        application=oauth_app,
        token=f"expired_{uuid.uuid4().hex}",
        expires=timezone.now() - datetime.timedelta(hours=2),
        scope="read write",
    )
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {expired_token.token}")
    resp = client.get("/api/v1/auth/users/")
    report(
        "Token het han bi tu choi voi HTTP 401",
        resp.status_code == 401,
        f"Status: {resp.status_code} (Expected 401)"
    )

    # 1.2 Token gia mao (tampered / forged token)
    tampered_token = f"tampered_forged_bearer_token_{uuid.uuid4().hex}"
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {tampered_token}")
    resp = client.get("/api/v1/auth/users/")
    report(
        "Token gia mao (tampered / forged signature) bi tu choi voi HTTP 401",
        resp.status_code == 401,
        f"Status: {resp.status_code} (Expected 401)"
    )

    # 1.3 SQL Injection trong login / auth
    client.credentials()  # Clear auth
    sqli_payloads = [
        ("admin' OR '1'='1", "' OR '1'='1"),
        ("candidate'--", "anything"),
        ("'; DROP TABLE project_account_user;--", "pass"),
    ]
    sqli_blocked = True
    for sqli_user, sqli_pass in sqli_payloads:
        resp = client.post("/api/v1/auth/check-creds/", data={
            "email": sqli_user,
            "roleName": var_sys.JOB_SEEKER,
        }, format="json")
        # Must fail cleanly with 400 (validation error on email) or exists=False, never 500
        if resp.status_code == 500:
            sqli_blocked = False
            break

        # Also test oauth token endpoint
        resp_tok = client.post("/api/v1/auth/token/", data={
            "grant_type": "password",
            "username": sqli_user,
            "password": sqli_pass,
            "client_id": oauth_app.client_id,
            "client_secret": oauth_app.client_secret,
        })
        if resp_tok.status_code == 500:
            sqli_blocked = False
            break

    report(
        "Tan cong SQL Injection trong login/auth bi chan triet de (khong gay loi DB 500)",
        sqli_blocked,
        "Cac payload SQLi deu duoc xu ly an toan, khong lam sap database"
    )

    # 1.4 Leo thang dac quyen role trai phep
    client.force_authenticate(user=user_seeker)
    escalate_resp = client.patch(
        f"/api/v1/auth/users/{user_seeker.id}/",
        data={"role_name": "ADMIN", "roleName": "ADMIN", "is_staff": True, "is_superuser": True},
        format="json"
    )
    user_seeker.refresh_from_db()
    report(
        "Ngan chan leo thang dac quyen role trai phep (JobSeeker khong the tu phong lam ADMIN)",
        user_seeker.role_name != var_sys.ADMIN and not user_seeker.is_staff and not user_seeker.is_superuser,
        f"Current role: {user_seeker.role_name}, is_staff: {user_seeker.is_staff}"
    )

    # =========================================================================
    # MODULE 2: apps/jobs
    # =========================================================================
    print(f"\n{YELLOW}=== [MODULE 2: APPS/JOBS] ==={RESET}")

    # Setup company, job, resume
    company = Company.objects.create(
        company_name=f"Tech Corp {email_uid}",
        company_email=f"corp_{email_uid}@test.com",
        company_phone="0911223344",
        tax_code=f"TAX{email_uid.upper()}",
        user=user_employer,
        is_verified=True,
    )

    seeker_profile = JobSeekerProfile.objects.create(
        user=user_seeker,
        phone="0987654321",
    )
    valid_resume = Resume.objects.create(
        user=user_seeker,
        title="Valid CV",
        job_seeker_profile=seeker_profile,
        is_active=True,
    )

    user_other_seeker = User.objects.create_user_with_role_name(
        email=f"victim_{email_uid}@test.com",
        full_name="Victim Candidate",
        role_name=var_sys.JOB_SEEKER,
        password="ValidPassword123!",
        is_active=True,
    )
    victim_profile = JobSeekerProfile.objects.create(
        user=user_other_seeker,
        phone="0912345678",
    )
    victim_resume = Resume.objects.create(
        user=user_other_seeker,
        title="Victim CV",
        job_seeker_profile=victim_profile,
        is_active=True,
    )

    active_job = JobPost.objects.create(
        job_name="Senior Python Backend Engineer",
        deadline=timezone.localdate() + datetime.timedelta(days=30),
        quantity=3,
        job_description="<p>Job Description</p>",
        position=4,
        type_of_workplace=1,
        experience=2,
        academic_level=2,
        job_type=1,
        salary_min=20000000,
        salary_max=40000000,
        contact_person_name="HR Tech Corp",
        contact_person_phone="0911223344",
        contact_person_email=f"corp_{email_uid}@test.com",
        user=user_employer,
        company=company,
        status=var_sys.JobPostStatus.APPROVED,
    )

    expired_job = JobPost.objects.create(
        job_name="Expired Job Post",
        deadline=timezone.localdate() - datetime.timedelta(days=5),
        quantity=1,
        job_description="<p>Expired</p>",
        position=4,
        type_of_workplace=1,
        experience=1,
        academic_level=1,
        job_type=1,
        salary_min=10000000,
        salary_max=15000000,
        contact_person_name="HR",
        contact_person_phone="0911223344",
        contact_person_email="hr@test.com",
        user=user_employer,
        company=company,
        status=var_sys.JobPostStatus.APPROVED,
    )

    inactive_job = JobPost.objects.create(
        job_name="Pending Approval Job Post",
        deadline=timezone.localdate() + datetime.timedelta(days=30),
        quantity=1,
        job_description="<p>Pending</p>",
        position=4,
        type_of_workplace=1,
        experience=1,
        academic_level=1,
        job_type=1,
        salary_min=10000000,
        salary_max=15000000,
        contact_person_name="HR",
        contact_person_phone="0911223344",
        contact_person_email="hr@test.com",
        user=user_employer,
        company=company,
        status=var_sys.JobPostStatus.PENDING,
    )

    # 2.1 Ứng viên nộp đơn bằng Resume ID của ứng viên khác (IDOR)
    client.force_authenticate(user=user_seeker)
    resp = client.post(
        "/api/v1/job/web/job-seeker-job-posts-activity/",
        data={
            "jobPost": active_job.id,
            "resumeId": victim_resume.id,
            "fullName": "Attacker Candidate",
            "email": user_seeker.email,
            "phone": "0987654321",
        },
        format="json"
    )
    report(
        "IDOR: Ứng viên dung Resume ID cua ung vien khac bi chan (HTTP 400)",
        resp.status_code == 400,
        f"Status: {resp.status_code}, Error: {resp.data}"
    )

    # 2.2 Nộp đơn với mức lương âm
    resp = client.post(
        "/api/v1/job/web/job-seeker-job-posts-activity/",
        data={
            "jobPost": active_job.id,
            "resumeId": valid_resume.id,
            "fullName": "Candidate Tester",
            "email": user_seeker.email,
            "phone": "0987654321",
            "expectedSalary": -5000000,
        },
        format="json"
    )
    report(
        "Nop don voi muc luong am bi tu choi (HTTP 400)",
        resp.status_code == 400,
        f"Status: {resp.status_code}, Error: {resp.data}"
    )

    # 2.3 Nộp đơn vào tin đã hết hạn
    resp = client.post(
        "/api/v1/job/web/job-seeker-job-posts-activity/",
        data={
            "jobPost": expired_job.id,
            "resumeId": valid_resume.id,
            "fullName": "Candidate Tester",
            "email": user_seeker.email,
            "phone": "0987654321",
        },
        format="json"
    )
    report(
        "Nop don vao tin tuyen dung da het han bi chan (HTTP 400)",
        resp.status_code == 400,
        f"Status: {resp.status_code}, Error: {resp.data}"
    )

    # 2.4 Nộp đơn vào tin chưa kích hoạt (pending)
    resp = client.post(
        "/api/v1/job/web/job-seeker-job-posts-activity/",
        data={
            "jobPost": inactive_job.id,
            "resumeId": valid_resume.id,
            "fullName": "Candidate Tester",
            "email": user_seeker.email,
            "phone": "0987654321",
        },
        format="json"
    )
    report(
        "Nop don vao tin tuyen dung chua kich hoat bi chan (HTTP 400)",
        resp.status_code == 400,
        f"Status: {resp.status_code}, Error: {resp.data}"
    )

    # 2.5 NTD tự nộp đơn vào tin tuyển dụng của công ty mình
    client.force_authenticate(user=user_employer)
    resp = client.post(
        "/api/v1/job/web/job-seeker-job-posts-activity/",
        data={
            "jobPost": active_job.id,
            "resumeId": valid_resume.id,
            "fullName": "Employer Self",
            "email": user_employer.email,
            "phone": "0911223344",
        },
        format="json"
    )
    # Employer gets 403 (IsJobSeekerUser permission) or 400 (validation)
    report(
        "NTD tu nop don vao tin tuyen dung cua cong ty minh bi tu choi (HTTP 400/403)",
        resp.status_code in (400, 403),
        f"Status: {resp.status_code}, Error: {getattr(resp, 'data', None)}"
    )

    # 2.6 Ứng tuyển lặp lại (double-apply race condition / duplicate application)
    client.force_authenticate(user=user_seeker)
    resp1 = client.post(
        "/api/v1/job/web/job-seeker-job-posts-activity/",
        data={
            "jobPost": active_job.id,
            "resumeId": valid_resume.id,
            "fullName": "Candidate Tester",
            "email": user_seeker.email,
            "phone": "0987654321",
        },
        format="json"
    )
    # Attempt 2nd identical apply
    resp2 = client.post(
        "/api/v1/job/web/job-seeker-job-posts-activity/",
        data={
            "jobPost": active_job.id,
            "resumeId": valid_resume.id,
            "fullName": "Candidate Tester",
            "email": user_seeker.email,
            "phone": "0987654321",
        },
        format="json"
    )
    # Either existing is returned idempotently without duplicates, or returns 400
    app_count = JobPostActivity.objects.filter(user=user_seeker, job_post=active_job, is_deleted=False).count()
    report(
        "Ngan chan double-apply (khong tao 2 ban ghi ung tuyen trung lap)",
        app_count == 1 and (resp2.status_code in (200, 201, 400)),
        f"Status: {resp2.status_code}, Total records in DB: {app_count}"
    )

    # =========================================================================
    # MODULE 3: apps/interviews
    # =========================================================================
    print(f"\n{YELLOW}=== [MODULE 3: APPS/INTERVIEWS] ==={RESET}")

    # Setup other company for IDOR test
    user_other_emp = User.objects.create_user_with_role_name(
        email=f"other_emp_{email_uid}@test.com",
        full_name="Other Employer",
        role_name=var_sys.EMPLOYER,
        password="ValidPassword123!",
        is_active=True,
        has_company=True,
    )
    other_company = Company.objects.create(
        company_name=f"Other Corp {email_uid}",
        company_email=f"other_corp_{email_uid}@test.com",
        company_phone="0999888777",
        tax_code=f"TAXOTH{email_uid.upper()}",
        user=user_other_emp,
        is_verified=True,
    )

    private_question = Question.objects.create(
        text="Cau hoi bi mat ve quy trinh noi bo cua Other Corp",
        company=other_company,
        author=user_other_emp,
        answer_structure="Bi mat doanh nghiep",
        interviewer_intent="Kiem tra bao mat",
    )
    public_question = Question.objects.create(
        text="Cau hoi cong khai toan san ve Python",
        answer_structure="Tra loi tong quan",
        interviewer_intent="Danh gia kien thuc co ban",
    )

    # 3.1 IDOR Ngân hàng câu hỏi: Anonymous / Candidate không xem được câu hỏi công ty khác trong /hints/
    client.credentials()  # Unauthenticated
    resp = client.get(f"/api/v1/interview/questions/{private_question.id}/hints/")
    report(
        "IDOR Question Bank: Anonymous bi chan xem hints cau hoi rieng tu cua doanh nghiep (HTTP 403/404)",
        resp.status_code in (403, 404),
        f"Status: {resp.status_code}"
    )

    # Candidate also blocked from private hints
    client.force_authenticate(user=user_seeker)
    resp = client.get(f"/api/v1/interview/questions/{private_question.id}/hints/")
    report(
        "IDOR Question Bank: Ung vien bi chan xem hints cau hoi rieng tu cua doanh nghiep (HTTP 403/404)",
        resp.status_code in (403, 404),
        f"Status: {resp.status_code}"
    )

    # 3.2 QuestionBankListView: Không lộ câu hỏi riêng tư của doanh nghiệp khác
    resp = client.get("/api/v1/interview/questions/bank/")
    returned_ids = [item.get("id") for item in resp.data.get("results", resp.data if isinstance(resp.data, list) else [])]
    report(
        "Question Bank List khong de lo cau hoi rieng tu cua doanh nghiep khac",
        private_question.id not in returned_ids and public_question.id in returned_ids,
        f"Returned IDs contains private: {private_question.id in returned_ids}"
    )

    # 3.3 IDOR Token enumeration bypass: dùng ID số để lấy token phỏng vấn qua invite/
    session = InterviewSession.objects.create(
        candidate=user_seeker,
        job_post=active_job,
        created_by=user_employer,
        status="scheduled",
        scheduled_at=timezone.now() + datetime.timedelta(days=2),
    )
    # Attacker tries accessing via pk instead of secret invite_token
    client.credentials()
    resp = client.get(f"/api/v1/interview/web/sessions/invite/{session.id}/")
    report(
        "IDOR Invite Token: Truy cap bang integer ID bi tu choi (HTTP 404)",
        resp.status_code == 404,
        f"Status: {resp.status_code}"
    )

    resp_lk = client.get(f"/api/v1/interview/web/sessions/invite/{session.id}/livekit-token/")
    report(
        "IDOR LiveKit Token: Lay token phong bang integer ID bi tu choi (HTTP 404)",
        resp_lk.status_code == 404,
        f"Status: {resp_lk.status_code}"
    )

    # But with authentic secret invite_token it succeeds
    resp_valid = client.get(f"/api/v1/interview/web/sessions/invite/{session.invite_token}/")
    report(
        "Invite Token hop le truy cap thanh cong thong tin phong",
        resp_valid.status_code == 200,
        f"Status: {resp_valid.status_code}"
    )

    # 3.4 Phân quyền LiveKit: Ứng viên không thể chiếm quyền Interviewer / HR Token
    client.force_authenticate(user=user_seeker)
    resp = client.post(f"/api/v1/interview/web/sessions/{session.id}/hr-token/")
    report(
        "Ung vien chiem quyen HR / Observer Token bi tu choi (HTTP 403)",
        resp.status_code == 403,
        f"Status: {resp.status_code}"
    )

    # 3.5 Đặt lịch trùng giờ (Candidate overlapping schedule)
    client.force_authenticate(user=user_employer)
    target_time = timezone.now() + datetime.timedelta(days=5)
    # Session 1 for candidate
    InterviewSession.objects.create(
        candidate=user_seeker,
        job_post=active_job,
        created_by=user_employer,
        scheduled_at=target_time,
        status="scheduled",
    )
    # Try booking Session 2 for the same candidate within 10 minutes
    resp = client.post(
        "/api/v1/interview/web/sessions/",
        data={
            "candidate": user_seeker.id,
            "job_post": active_job.id,
            "scheduled_at": (target_time + datetime.timedelta(minutes=10)).isoformat(),
            "type": "technical",
        },
        format="json"
    )
    report(
        "Dat lich trung gio: Ngan chan tao 2 buoi phong van trung gio cho cung 1 ung vien (HTTP 400)",
        resp.status_code == 400,
        f"Status: {resp.status_code}, Error: {getattr(resp, 'data', None)}"
    )

    # 3.6 Chấm điểm phỏng vấn ngoài thang điểm (< 1 hoặc > 10)
    eval_session = InterviewSession.objects.create(
        candidate=user_seeker,
        job_post=active_job,
        created_by=user_employer,
        status="completed",
    )
    # Score = 0 (< 1)
    resp_zero = client.post(
        "/api/v1/interview/web/evaluations/",
        data={
            "interview": eval_session.id,
            "attitude_score": 0,
            "professional_score": 5,
            "result": "passed",
        },
        format="json"
    )
    # Score = 15 (> 10)
    resp_over = client.post(
        "/api/v1/interview/web/evaluations/",
        data={
            "interview": eval_session.id,
            "attitude_score": 15,
            "professional_score": 8,
            "result": "passed",
        },
        format="json"
    )
    report(
        "Cham diem phong van ngoai thang diem (< 1 hoac > 10) bi tu choi (HTTP 400)",
        resp_zero.status_code == 400 and resp_over.status_code == 400,
        f"Score 0 status: {resp_zero.status_code}, Score 15 status: {resp_over.status_code}"
    )

    # =========================================================================
    # MODULE 4: apps/cv_builder
    # =========================================================================
    print(f"\n{YELLOW}=== [MODULE 4: APPS/CV_BUILDER] ==={RESET}")

    template = CVTemplate.objects.first()
    if not template:
        template = CVTemplate.objects.create(
            code="test-template",
            name="Template Test",
            category="modern",
        )
    cv_record = CandidateCV.objects.create(
        user=user_seeker,
        template=template,
        title="Candidate CV Test",
    )

    client.force_authenticate(user=user_seeker)

    # 4.1 Tải lên file 0-byte
    empty_file = SimpleUploadedFile("empty.pdf", b"", content_type="application/pdf")
    resp = client.post(
        f"/api/v1/cv/candidate-cvs/{cv_record.id}/upload-pdf/",
        data={"file": empty_file},
        format="multipart"
    )
    report(
        "Tai len file CV 0-byte bi tu choi (HTTP 400)",
        resp.status_code == 400,
        f"Status: {resp.status_code}, Error: {getattr(resp, 'data', None)}"
    )

    # 4.2 File bị hỏng (corrupted magic bytes)
    corrupted_file = SimpleUploadedFile("corrupted.pdf", b"NOT_A_PDF_CORRUPTED_BYTES", content_type="application/pdf")
    resp = client.post(
        f"/api/v1/cv/candidate-cvs/{cv_record.id}/upload-pdf/",
        data={"file": corrupted_file},
        format="multipart"
    )
    report(
        "Tai len file CV bi hong / sai magic bytes bi tu choi (HTTP 400)",
        resp.status_code == 400,
        f"Status: {resp.status_code}, Error: {getattr(resp, 'data', None)}"
    )

    # 4.3 File vượt dung lượng cho phép (> 10MB)
    # Use a mock stream of 11MB
    big_data = b"%PDF-1.4\n" + (b"A" * (11 * 1024 * 1024))
    big_file = SimpleUploadedFile("huge.pdf", big_data, content_type="application/pdf")
    resp = client.post(
        f"/api/v1/cv/candidate-cvs/{cv_record.id}/upload-pdf/",
        data={"file": big_file},
        format="multipart"
    )
    report(
        "Tai len file CV vuot qua 10MB bi tu choi (HTTP 400)",
        resp.status_code == 400,
        f"Status: {resp.status_code}, Error: {getattr(resp, 'data', None)}"
    )

    # 4.4 Filename injection / Path traversal
    valid_pdf_content = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
    traversal_filenames = [
        "../../etc/passwd.pdf",
        "..\\..\\windows\\system32\\cmd.pdf",
        "evil<script>alert(1)</script>.pdf",
        "bad;rm -rf /;.pdf",
        "bad|pipe.pdf",
        "bad\x00file.pdf",
    ]
    traversal_blocked = True
    for bad_name in traversal_filenames:
        traversal_file = SimpleUploadedFile("temp.pdf", valid_pdf_content, content_type="application/pdf")
        traversal_file._name = bad_name
        resp = client.post(
            f"/api/v1/cv/candidate-cvs/{cv_record.id}/upload-pdf/",
            data={"file": traversal_file, "filename": bad_name},
            format="multipart"
        )
        if resp.status_code != 400:
            print(f"FAILED ON: {repr(bad_name)} -> {resp.status_code}, data: {getattr(resp, 'data', None)}")
            traversal_blocked = False
            break
    report(
        "Tan cong Filename Injection & Path Traversal bi chan triet de (HTTP 400)",
        traversal_blocked,
        f"Tat ca cac ten file nguy hiem deu bi tu choi validation an toan"
    )

    # 4.5 Tải lên file hợp lệ thành công
    valid_file = SimpleUploadedFile("my_resume.pdf", valid_pdf_content, content_type="application/pdf")
    resp = client.post(
        f"/api/v1/cv/candidate-cvs/{cv_record.id}/upload-pdf/",
        data={"file": valid_file},
        format="multipart"
    )
    report(
        "Tai len file CV PDF hop le thanh cong (HTTP 200)",
        resp.status_code == 200,
        f"Status: {resp.status_code}"
    )

    # =========================================================================
    # SUMMARY
    # =========================================================================
    total_tests = total_passed + total_failed
    print_banner(f"KET QUA KIEM THU: {total_passed}/{total_tests} PASSED")
    if total_failed == 0:
        print(f"{GREEN}{BOLD}>>> TAT CA CAC BAI TEST BIEN & ADVERSARIAL QA DEU DAT 100%! <<<{RESET}\n")
    else:
        print(f"{RED}{BOLD}>>> CO {total_failed} BAI TEST THAT BAI! VUI LONG KIEM TRA LAI! <<<{RESET}\n")

    return total_failed == 0


if __name__ == "__main__":
    success = run_audit()
    sys.exit(0 if success else 1)
