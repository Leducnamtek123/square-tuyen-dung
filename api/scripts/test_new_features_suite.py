"""
Live End-to-End Verification Test Suite for New Platform Features:
1. iCalendar (.ics) Calendar Sync
2. AI Interview Proctoring Events & Timeline Highlights
3. ATS Job Offer Letter Lifecycle & Candidate E-Signature
4. Vietnam HRM Payroll & 7-Bracket PIT Tax Engine + Monthly Payroll API

Usage:
    python scripts/test_new_features_suite.py
"""

import os
import sys
from decimal import Decimal
from datetime import date, timedelta
from django.utils import timezone

# Setup environment
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings_test")
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

import django
django.setup()

from django.conf import settings
settings.ALLOWED_HOSTS = ["*", "testserver", "localhost", "127.0.0.1"]

from django.core.management import call_command
# Run migrations silently
call_command("migrate", verbosity=0)

# Mock elasticsearch registry to prevent network errors in test environment
try:
    from django_elasticsearch_dsl.registries import registry
    registry.update = lambda *args, **kwargs: None
    registry.delete = lambda *args, **kwargs: None
except ImportError:
    pass

from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.profiles.models import Company, CompanyMember, CompanyRole
from apps.jobs.models import JobPost, JobPostActivity, JobOfferLetter
from apps.interviews.models import InterviewSession, InterviewProctoringEvent
from apps.hrm.models import Employee, EmploymentContract, Department, MonthlyPayrollRecord
from apps.hrm.payroll_engine import calculate_vietnam_payroll, calculate_pit_vietnam


def run_tests():
    print("=" * 80)
    print("🚀 RUNNING FULL TEST SUITE FOR NEW RECRUITMENT & HRM FEATURES")
    print("=" * 80)

    client = APIClient()

    # --- Setup Test Users and Company ---
    employer_user, _ = User.objects.get_or_create(
        email="epic_employer@test.com",
        defaults={"full_name": "Nguyen HR Manager", "role_name": "EMPLOYER", "is_active": True}
    )
    employer_user.set_password("pass12345")
    employer_user.save()

    candidate_user, _ = User.objects.get_or_create(
        email="epic_candidate@test.com",
        defaults={"full_name": "Tran Candidate Senior", "role_name": "JOB_SEEKER", "is_active": True}
    )
    candidate_user.set_password("pass12345")
    candidate_user.save()

    company, _ = Company.objects.get_or_create(
        user=employer_user,
        defaults={"company_name": "Tech Corp Vietnam", "slug": "tech-corp-vn", "field_operation": "IT"}
    )
    client.credentials(HTTP_X_ACTIVE_COMPANY_ID=str(company.id))

    job_post, _ = JobPost.objects.get_or_create(
        job_name="Senior Fullstack Python/React Engineer",
        company=company,
        user=employer_user,
        defaults={
            "status": 1,
            "deadline": date(2026, 12, 31),
            "quantity": 5,
            "position": 5,
            "type_of_workplace": 1,
            "experience": 4,
            "academic_level": 2,
            "job_type": 1,
            "job_description": "Awesome role",
            "salary_min": 30000000,
            "salary_max": 50000000,
            "contact_person_name": "Nguyen HR Manager",
            "contact_person_phone": "0987654321",
            "contact_person_email": "epic_employer@test.com",
        }
    )

    activity, _ = JobPostActivity.objects.get_or_create(
        job_post=job_post,
        user=candidate_user,
        defaults={
            "full_name": "Tran Candidate Senior",
            "email": "epic_candidate@test.com",
            "phone": "0987654321",
            "status": 1,
        }
    )

    # =========================================================================
    # 1. UNIT TESTING VIETNAM PAYROLL ENGINE
    # =========================================================================
    print("\n[TEST 1] Testing Vietnam Payroll & Tax (TNCN) Calculation Engine...")
    
    # Case A: Low income (Gross 10,000,000 VND - below personal deduction 11M)
    res_10m = calculate_vietnam_payroll(gross_salary=10_000_000, dependents_count=0)
    # BHXH 800k, BHYT 150k, BHTN 100k -> Total Insurance = 1,050,000
    # Income before PIT = 10m - 1.05m = 8.95m < 11m deduction -> PIT = 0
    # Net = 8,950,000
    assert res_10m["insurance_deductions"]["total_insurance"] == Decimal("1050000"), f"Wrong insurance: {res_10m}"
    assert res_10m["tax_deductions"]["personal_income_tax"] == Decimal("0"), f"Wrong PIT: {res_10m}"
    assert res_10m["net_salary"] == Decimal("8950000"), f"Wrong Net: {res_10m}"
    print("  ✅ Case A (Gross 10M -> Net 8.95M, 0 VND PIT): PASS")

    # Case B: Standard income (Gross 30,000,000 VND, 0 dependents)
    # BHXH = 2,400,000, BHYT = 450,000, BHTN = 300,000 -> Total Insurance = 3,150,000
    # Income before PIT = 30m - 3.15m = 26,850,000
    # Taxable Income = 26,850,000 - 11,000,000 = 15,850,000
    # PIT (Bracket 3: 10M to 18M) = 15,850,000 * 15% - 750,000 = 2,377,500 - 750,000 = 1,627,500
    # Net = 30m - 3.15m - 1,627,500 = 25,222,500
    res_30m = calculate_vietnam_payroll(gross_salary=30_000_000, dependents_count=0)
    assert res_30m["insurance_deductions"]["total_insurance"] == Decimal("3150000"), f"Wrong insurance: {res_30m}"
    assert res_30m["tax_deductions"]["taxable_income"] == Decimal("15850000"), f"Wrong taxable: {res_30m}"
    assert res_30m["tax_deductions"]["personal_income_tax"] == Decimal("1627500"), f"Wrong PIT: {res_30m}"
    assert res_30m["net_salary"] == Decimal("25222500"), f"Wrong Net: {res_30m}"
    print("  ✅ Case B (Gross 30M -> Net 25.222.500 VND, Progressive PIT): PASS")

    # Case C: High income with 2 dependents (Gross 60,000,000 VND, 2 dependents)
    # Total deduction = 11m + 2 * 4.4m = 19.8m
    res_60m = calculate_vietnam_payroll(gross_salary=60_000_000, dependents_count=2)
    assert res_60m["tax_deductions"]["total_family_deductions"] == Decimal("19800000"), f"Wrong deduction: {res_60m}"
    assert res_60m["net_salary"] > Decimal("45000000"), f"Unexpected Net: {res_60m}"
    print("  ✅ Case C (Gross 60M with 2 dependents deduction 19.8M): PASS")

    # =========================================================================
    # 2. TESTING HRM MONTHLY PAYROLL API
    # =========================================================================
    print("\n[TEST 2] Testing HRM Monthly Payroll API & Automated Calculations...")
    client.force_authenticate(user=employer_user)

    dept, _ = Department.objects.get_or_create(company=company, name="Engineering", defaults={"code": "ENG"})
    employee, _ = Employee.objects.get_or_create(
        company=company,
        user=candidate_user,
        defaults={
            "employee_code": "EMP001",
            "first_name": "Tran",
            "last_name": "Senior",
            "department": dept,
            "status": "ACTIVE",
            "join_date": date(2025, 1, 1),
        }
    )
    contract, _ = EmploymentContract.objects.get_or_create(
        employee=employee,
        defaults={
            "contract_number": "HDLD-001",
            "contract_type": "INDEFINITE",
            "base_salary": Decimal("30000000"),
            "allowance": Decimal("2000000"),
            "start_date": date(2025, 1, 1),
            "status": "ACTIVE",
        }
    )

    # Call calculate payroll API
    resp = client.post("/api/v1/native-hrm/payroll/calculate/", {
        "month": 8,
        "year": 2026,
        "standard_working_days": 22,
        "bonus": 5000000
    }, format="json")
    assert resp.status_code == 200, f"Failed calculating payroll: {resp.data}"
    payroll_data = resp.data["records"][0]
    assert payroll_data["gross_salary"] == "30000000"
    assert payroll_data["allowance"] == "2000000"
    assert payroll_data["bonus"] == "5000000"
    assert float(payroll_data["net_salary"]) > 28000000
    print(f"  ✅ Monthly Payroll Computed: Gross 30M + 2M Allow + 5M Bonus -> Net {float(payroll_data['net_salary']):,.0f} VND (PASS)")

    # =========================================================================
    # 3. TESTING ICALENDAR (.ICS) SYNC & PROCTORING & TIMELINE
    # =========================================================================
    print("\n[TEST 3] Testing iCalendar Export & AI Interview Proctoring...")
    session, _ = InterviewSession.objects.get_or_create(
        room_name="room-test-sync-101",
        defaults={
            "candidate": candidate_user,
            "job_post": job_post,
            "created_by": employer_user,
            "status": "scheduled",
            "scheduled_at": timezone.now() + timedelta(days=2),
            "duration": 3600,
        }
    )

    # A: Test iCalendar (.ics) export
    ics_resp = client.get(f"/api/v1/interview/web/sessions/{session.id}/calendar-ics/")
    assert ics_resp.status_code == 200, f"Failed getting ics: {ics_resp.status_code}"
    assert "text/calendar" in ics_resp["Content-Type"]
    ics_text = ics_resp.content.decode("utf-8")
    assert "BEGIN:VCALENDAR" in ics_text
    assert "BEGIN:VEVENT" in ics_text
    assert "Senior Fullstack Python/React Engineer" in ics_text
    assert "END:VCALENDAR" in ics_text
    print("  ✅ iCalendar (.ics) valid RFC 5545 generated and downloadable: PASS")

    # B: Test Proctoring event logging
    proc_resp = client.post(f"/api/v1/interview/web/sessions/{session.id}/proctoring-events/", {
        "eventType": "tab_switch",
        "durationSeconds": 5.2,
        "details": {"suspicious_tab": "stackoverflow.com"}
    }, format="json")
    assert proc_resp.status_code == 201, f"Failed posting proctoring event: {proc_resp.data}"
    assert proc_resp.data["data"]["event_type"] == "tab_switch"

    get_proc = client.get(f"/api/v1/interview/web/sessions/{session.id}/proctoring-events/")
    assert get_proc.status_code == 200
    assert len(get_proc.data["data"]) >= 1
    print("  ✅ AI Proctoring Event logged (tab_switch detected & retrieved): PASS")

    # C: Test Timeline Highlights
    time_resp = client.post(f"/api/v1/interview/web/sessions/{session.id}/timeline-highlights/", {
        "timelineHighlights": [
            {"time_seconds": 120, "label": "Candidate explains DB Indexing", "category": "technical"},
            {"time_seconds": 340, "label": "System Architecture discussion", "category": "architecture"}
        ]
    }, format="json")
    assert time_resp.status_code == 200, f"Failed posting timeline: {time_resp.data}"
    assert len(time_resp.data["data"]["timelineHighlights"]) == 2

    get_time = client.get(f"/api/v1/interview/web/sessions/{session.id}/timeline-highlights/")
    assert get_time.status_code == 200
    assert len(get_time.data["data"]["timelineHighlights"]) == 2
    print("  ✅ Video Timeline Key Moments saved & retrieved: PASS")

    # =========================================================================
    # 4. TESTING ATS JOB OFFER LETTER LIFECYCLE
    # =========================================================================
    print("\n[TEST 4] Testing ATS Job Offer Letter Lifecycle & E-Signature...")
    # A: Negative validation (Negative salary & Invalid dates)
    client.force_authenticate(user=employer_user)
    bad_resp = client.post(f"/api/v1/job/web/employer-job-posts-activity/{activity.id}/offer-letter/", {
        "salary_offered": -1000000,
        "start_date": "2026-09-01",
        "expiration_date": "2026-08-30",
    }, format="json")
    assert bad_resp.status_code == 400, f"Should reject negative salary: {bad_resp.data}"
    print("  ✅ Validation rejected negative salary & invalid expiration date: PASS")

    # B: Employer creates and sends offer letter
    create_offer_resp = client.post(f"/api/v1/job/web/employer-job-posts-activity/{activity.id}/offer-letter/", {
        "position_title": "Lead Software Architect",
        "salary_offered": 45000000,
        "allowance": 3000000,
        "start_date": "2026-09-15",
        "expiration_date": "2026-09-10",
        "work_location": "Landmark 81, Ho Chi Minh City",
        "benefits_note": "13th month salary, premium healthcare, MacBook Pro M3 Max",
        "terms_and_conditions": "Full-time contract with 2-month probation (85% salary).",
    }, format="json")
    assert create_offer_resp.status_code in [200, 201], f"Failed creating offer: {create_offer_resp.data}"
    offer_id = create_offer_resp.data["data"]["id"]
    assert create_offer_resp.data["data"]["status"] == "sent"
    assert create_offer_resp.data["data"]["position_title"] == "Lead Software Architect"
    print(f"  ✅ Employer sent Job Offer Letter #{offer_id} (45M VND + 3M Allowance): PASS")

    # C: Candidate views offer letter
    client.force_authenticate(user=candidate_user)
    cand_view_resp = client.get(f"/api/v1/job/web/job-seeker-job-posts-activity/{activity.id}/offer-letter/")
    assert cand_view_resp.status_code == 200, f"Candidate failed to view offer: {cand_view_resp.data}"
    assert cand_view_resp.data["data"]["id"] == offer_id
    assert cand_view_resp.data["data"]["companyName"] == "Tech Corp Vietnam"
    print("  ✅ Candidate retrieved pending Offer Letter details: PASS")

    # D: Candidate signs and accepts offer letter
    accept_resp = client.post(f"/api/v1/job/web/job-seeker-job-posts-activity/{activity.id}/offer-letter/", {
        "action": "accept",
        "feedback": "I am thrilled to accept this offer and look forward to joining Tech Corp!"
    }, format="json")
    assert accept_resp.status_code == 200, f"Failed accepting offer: {accept_resp.data}"
    assert accept_resp.data["data"]["status"] == "accepted"
    assert accept_resp.data["data"]["candidate_signed_at"] is not None
    print("  ✅ Candidate digitally accepted & signed Offer Letter: PASS")

    # E: Cannot double-respond
    double_resp = client.post(f"/api/v1/job/web/job-seeker-job-posts-activity/{activity.id}/offer-letter/", {
        "action": "decline",
        "feedback": "Trying to decline after accepted"
    }, format="json")
    assert double_resp.status_code == 400, f"Should prevent state change after acceptance: {double_resp.data}"
    print("  ✅ Idempotency & Immortality check: Cannot modify already accepted offer (PASS)")


    print("\n" + "=" * 80)
    print("🎉 ALL 4 NEW RECRUITMENT & HRM FEATURES FULLY VERIFIED & PASSED!")
    print("=" * 80)


if __name__ == "__main__":
    run_tests()
