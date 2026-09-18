import os
import sys
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.utils import timezone
from rest_framework.test import APIRequestFactory, force_authenticate
from apps.accounts.models import User
from apps.profiles.models import Company, CompanyMember, CompanyVerification
from apps.files.models import File
from apps.locations.models import City, District, Location
from apps.accounts.views_onboarding import (
    EmployerStepSaveView,
    EmployerOnboardingView,
    GetOnboardingStatusView,
)
from apps.profiles.serializers_pkg import CompanySerializer, CompanyDetailSerializer
from apps.profiles.views.web_companies import CompanyViewSet
from apps.profiles.services import CompanyService

factory = APIRequestFactory()

print("=== STARTING LIVE EMPLOYER & COMPANY DOMAIN AUDIT TEST ===")

user_suffix = str(int(timezone.now().timestamp()))
city = City.objects.first()
district = District.objects.filter(city=city).first() if city else None

user_a = User.objects.create_user_with_role_name(
    email=f"test_emp_a_{user_suffix}@test.com",
    role_name="EMPLOYER",
    full_name="Test Recruiter A",
    password=None,
    phone_number=f"0901{user_suffix[-6:]}",
    is_active=True,
    is_verify_email=True,
)
user_b = User.objects.create_user_with_role_name(
    email=f"test_emp_b_{user_suffix}@test.com",
    role_name="EMPLOYER",
    full_name="Test Recruiter B",
    password=None,
    phone_number=f"0902{user_suffix[-6:]}",
    is_active=True,
    is_verify_email=True,
)
user_c = User.objects.create_user_with_role_name(
    email=f"test_emp_c_{user_suffix}@test.com",
    role_name="EMPLOYER",
    full_name="Test Recruiter C",
    password=None,
    phone_number=f"0903{user_suffix[-6:]}",
    is_active=True,
    is_verify_email=True,
)

loc_a = Location.objects.create(city=city, district=district, address="123 Test St")

comp_a = Company.objects.create(
    user=user_a,
    company_name=f"Company Alpha {user_suffix}",
    company_email=user_a.email,
    company_phone=user_a.phone_number,
    tax_code=f"TAX_A_{user_suffix}",
    location=loc_a,
)
comp_b = Company.objects.create(
    user=user_b,
    company_name=f"Company Beta {user_suffix}",
    company_email=user_b.email,
    company_phone=user_b.phone_number,
    tax_code=f"TAX_B_{user_suffix}",
    location=loc_a,
)

shared_logo = File.objects.create(
    public_id=f"logos/test_logo_{user_suffix}.png",
    format="png",
    resource_type="image",
    file_type=File.LOGO_TYPE,
    uploaded_at=timezone.now(),
    metadata={"name": "company_logo.png"},
)
shared_cover = File.objects.create(
    public_id=f"covers/test_cover_{user_suffix}.png",
    format="png",
    resource_type="image",
    file_type=File.COVER_IMAGE_TYPE,
    uploaded_at=timezone.now(),
    metadata={"name": "company_cover.png"},
)

print("[OK] Test fixtures created.")

# --- TEST 1: GetOnboardingStatusView with URL containing business_license ---
print("\n--- TEST 1: GetOnboardingStatusView File lookup (Task 1) ---")
gpkd_file = File.objects.create(
    public_id=f"business_licenses/gpkd_{user_suffix}.pdf",
    format="pdf",
    resource_type="raw",
    file_type=File.BUSINESS_LICENSE_TYPE,
    uploaded_at=timezone.now(),
    metadata={"name": "GPKD_Scan.pdf"},
)
verif = CompanyVerification.objects.create(
    company=comp_a,
    submitted_by=user_a,
    business_license=f"https://s3.infohr.vn/media/{gpkd_file.public_id}",
    status=CompanyVerification.STATUS_PENDING,
)
req = factory.get("/api/accounts/onboarding/status/")
force_authenticate(req, user=user_a)
view = GetOnboardingStatusView.as_view()
resp = view(req)
assert resp.status_code == 200, f"Status view failed: {resp.data}"
draft = resp.data.get("employerDraft") or {}
print(f"GetOnboardingStatusView returned draft gpkdFileId: {draft.get('gpkdFileId')}")
assert draft.get("gpkdFileId") == gpkd_file.id, f"Expected {gpkd_file.id}, got {draft.get('gpkdFileId')}"
assert "GPKD" in draft.get("gpkdFileName", ""), f"Unexpected file name: {draft.get('gpkdFileName')}"
print("[PASS] Task 1: No url__icontains FieldError, successfully matched File by public_id substring!")

# --- TEST 2 & 4: EmployerStepSaveView (POST & PATCH, camelCase & snake_case) ---
print("\n--- TEST 2 & 4: EmployerStepSaveView POST & PATCH, casing normalization ---")
comp_a.logo = shared_logo
comp_a.cover_image = shared_cover
comp_a.save()
assert comp_a.logo_id == shared_logo.id
assert comp_a.cover_image_id == shared_cover.id

# User B claims shared_logo and shared_cover via EmployerStepSaveView POST with camelCase
req = factory.post(
    "/api/accounts/onboarding/employer/step-save/",
    {
        "step": 2,
        "companyName": comp_b.company_name,
        "taxCode": comp_b.tax_code,
        "logoId": shared_logo.id,
        "coverImageId": shared_cover.id,
        "employeeSize": 3,
        "recruiterName": "Recruiter B Updated",
    },
    format="json",
)
force_authenticate(req, user=user_b)
resp = EmployerStepSaveView.as_view()(req)
assert resp.status_code == 200, f"Step save POST failed: {resp.data}"

# Check safe-unlink on Company A
comp_a.refresh_from_db()
comp_b.refresh_from_db()
assert comp_a.logo is None, f"Company A logo should be unlinked (None), but is {comp_a.logo}"
assert comp_a.cover_image is None, f"Company A cover should be unlinked (None), but is {comp_a.cover_image}"
assert comp_b.logo_id == shared_logo.id, f"Company B logo should be {shared_logo.id}, got {comp_b.logo_id}"
assert comp_b.cover_image_id == shared_cover.id, f"Company B cover should be {shared_cover.id}, got {comp_b.cover_image_id}"
assert comp_b.employee_size == 3
print("[PASS] EmployerStepSaveView POST (camelCase) + Safe-unlink works without IntegrityError!")

# User B updates via PATCH with snake_case
req = factory.patch(
    "/api/accounts/onboarding/employer/step-save/",
    {
        "step": 3,
        "field_operation": "Công nghệ thông tin",
        "recruiter_name": "Recruiter B Snake",
        "employee_size": 4,
    },
    format="json",
)
force_authenticate(req, user=user_b)
resp = EmployerStepSaveView.as_view()(req)
assert resp.status_code == 200, f"Step save PATCH failed: {resp.data}"
comp_b.refresh_from_db()
user_b.refresh_from_db()
assert comp_b.field_operation == "Công nghệ thông tin"
assert comp_b.employee_size == 4
assert user_b.full_name == "Recruiter B Snake"
print("[PASS] EmployerStepSaveView PATCH (snake_case) works successfully!")

# --- TEST 3: Safe-unlink in EmployerOnboardingView and CompanyViewSet / CompanyService ---
print("\n--- TEST 3: Safe-unlink in EmployerOnboardingView & CompanyService ---")
# User C completes onboarding and steals shared_logo
req = factory.post(
    "/api/accounts/onboarding/employer/",
    {
        "companyName": f"Company Gamma {user_suffix}",
        "taxCode": f"TAX_C_{user_suffix}",
        "recruiterName": "Recruiter C",
        "logoId": shared_logo.id,
        "employeeSize": 2,
    },
    format="json",
)
force_authenticate(req, user=user_c)
resp = EmployerOnboardingView.as_view()(req)
assert resp.status_code == 200, f"EmployerOnboardingView failed: {resp.data}"
comp_b.refresh_from_db()
comp_c = Company.objects.filter(tax_code=f"TAX_C_{user_suffix}").first()
assert comp_b.logo is None, f"Company B logo should be unlinked when Company C takes it, but is {comp_b.logo}"
assert comp_c.logo_id == shared_logo.id, f"Company C logo should be {shared_logo.id}"
print("[PASS] EmployerOnboardingView safe-unlink verified!")

# Test CompanyViewSet.safe_assign_logo and CompanyService.safe_set_logo
CompanyViewSet.safe_assign_logo(comp_a, shared_logo)
comp_c.refresh_from_db()
comp_a.refresh_from_db()
assert comp_c.logo is None, "comp_c logo should be unlinked"
assert comp_a.logo_id == shared_logo.id, "comp_a should now have shared_logo"

CompanyService.safe_set_cover_image(comp_a, shared_cover)
comp_b.refresh_from_db()
comp_a.refresh_from_db()
assert comp_b.cover_image is None, "comp_b cover should be unlinked"
assert comp_a.cover_image_id == shared_cover.id, "comp_a should now have shared_cover"
print("[PASS] CompanyViewSet and CompanyService safe unlink helpers verified!")

# --- TEST 4: Serializer fields (cityChooseData, districtChooseData, logoDict) ---
print("\n--- TEST 4: CompanySerializer & CompanyDetailSerializer fields ---")
for SCls in [CompanySerializer, CompanyDetailSerializer]:
    s = SCls(comp_a)
    data = s.data
    assert "cityChooseData" in data, f"cityChooseData missing in {SCls.__name__}"
    assert "districtChooseData" in data, f"districtChooseData missing in {SCls.__name__}"
    assert "logoDict" in data, f"logoDict missing in {SCls.__name__}"

    assert data["cityChooseData"] is not None and data["cityChooseData"]["id"] == city.id
    if district:
        assert data["districtChooseData"] is not None and data["districtChooseData"]["id"] == district.id
    assert data["logoDict"] is not None
    assert data["logoDict"]["id"] == shared_logo.id
    assert "url" in data["logoDict"]
    assert "name" in data["logoDict"]
    assert "cityChooseData" in SCls.Meta.fields
    assert "districtChooseData" in SCls.Meta.fields
    assert "logoDict" in SCls.Meta.fields
    print(f"[PASS] {SCls.__name__}: cityChooseData={data['cityChooseData']}, districtChooseData={data['districtChooseData']}, logoDict={data['logoDict']}")

# Clean up fixtures
print("\n--- CLEANUP FIXTURES ---")
CompanyVerification.objects.filter(id=verif.id).delete()
CompanyMember.objects.filter(company__in=[comp_a, comp_b, comp_c]).delete()
Company.objects.filter(id__in=[comp_a.id, comp_b.id, comp_c.id]).delete()
loc_a.delete()
shared_logo.delete()
shared_cover.delete()
gpkd_file.delete()
User.objects.filter(id__in=[user_a.id, user_b.id, user_c.id]).delete()
print("[OK] Cleanup completed.")
print("\n=== ALL AUDIT TESTS PASSED SUCCESSFULLY! ===")
