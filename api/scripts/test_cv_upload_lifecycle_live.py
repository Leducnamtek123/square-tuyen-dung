#!/usr/bin/env python
"""
Live Verification Suite for Job Seeker CV Upload, Storage, Persistence & Reload Lifecycle.
Validates:
1. Uploading PDF CV with real multipart file to POST /api/v1/info/web/private-resumes/
2. Querying GET /api/v1/info/web/job-seeker-profiles/{id}/resumes/ to simulate page reload & ensuring uploaded CV persists.
3. Updating Resume title via PUT /api/v1/info/web/private-resumes/{slug}/
4. Retrieving Resume detail via GET /api/v1/info/web/private-resumes/{slug}/
5. Deleting Resume via DELETE /api/v1/info/web/private-resumes/{slug}/
"""
import os
import sys
import io
import uuid

# Configure UTF-8 encoding for Windows terminals
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

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

from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.profiles.models import JobSeekerProfile, Resume
from shared.helpers.cloudinary_service import CloudinaryService

# Mock Cloudinary / Storage for test environment
def mock_upload_file(file_obj, directory, public_id=None, **kwargs):
    return {
        "url": f"https://res.cloudinary.com/test/{directory}/{public_id or uuid.uuid4().hex}.pdf",
        "secure_url": f"https://res.cloudinary.com/test/{directory}/{public_id or uuid.uuid4().hex}.pdf",
        "public_id": f"{directory}/{public_id or uuid.uuid4().hex}",
        "resource_type": "raw",
        "format": "pdf",
        "bytes": getattr(file_obj, "size", 1024),
    }

CloudinaryService.upload_file = staticmethod(mock_upload_file)


def run_tests():
    print("=" * 70)
    print("🚀 BẮT ĐẦU KIỂM THỬ THỰC TẾ: CV UPLOAD & PERSISTENCE LIFECYCLE")
    print("=" * 70)

    # 1. Setup Candidate User & Profile
    email = f"candidate_cv_test_{uuid.uuid4().hex[:6]}@example.com"
    user = User.objects.create_user(
        email=email,
        password="TestPassword123!",
        role_name="JOB_SEEKER",
        full_name="Nguyễn Văn Test CV"
    )
    profile, _ = JobSeekerProfile.objects.get_or_create(user=user)

    client = APIClient()
    client.force_authenticate(user=user)

    # Test 1: Upload CV via API
    print("\n[TEST 1] Upload PDF CV qua POST /api/v1/info/web/private-resumes/ ...")
    dummy_pdf_content = b"%PDF-1.4 ... test cv content ..."
    uploaded_pdf = SimpleUploadedFile("Bao_Cao_Cong_Tac_Thi_Cong.pdf", dummy_pdf_content, content_type="application/pdf")

    payload = {
        "title": "BÁO CÁO CÔNG TÁC THI CÔNG",
        "file": uploaded_pdf,
    }
    response = client.post("/api/v1/info/web/private-resumes/", data=payload, format="multipart")
    assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.data}"
    
    cv_data = response.data.get("data") or response.data
    resume_id = cv_data.get("id")
    resume_slug = cv_data.get("slug")
    assert resume_id is not None, "Resume ID must not be None"
    assert resume_slug is not None, "Resume Slug must not be None"
    assert cv_data.get("title") == "BÁO CÁO CÔNG TÁC THI CÔNG", "Title mismatch"
    assert cv_data.get("fileUrl") is not None, "FileUrl must be returned"
    print(f"  ✅ Upload thành công! Resume ID: {resume_id}, Slug: {resume_slug}, FileUrl: {cv_data.get('fileUrl')}")

    # Test 2: Simulate Page Reload (GET /api/v1/info/web/job-seeker-profiles/{id}/resumes/)
    print("\n[TEST 2] Giả lập F5 / Reload trang: Gọi GET /api/v1/info/web/job-seeker-profiles/{id}/resumes/ ...")
    reload_resp = client.get(f"/api/v1/info/web/job-seeker-profiles/{profile.id}/resumes/")
    assert reload_resp.status_code == 200, f"Expected 200, got {reload_resp.status_code}: {reload_resp.data}"
    
    resumes_list = reload_resp.data.get("data")
    assert isinstance(resumes_list, list), f"Expected list, got {type(resumes_list)}"
    assert len(resumes_list) >= 1, f"Expected at least 1 resume after reload, got {len(resumes_list)}"
    
    found_cv = next((r for r in resumes_list if r.get("id") == resume_id or r.get("slug") == resume_slug), None)
    assert found_cv is not None, f"Uploaded CV was LOST on reload! List: {resumes_list}"
    assert found_cv.get("title") == "BÁO CÁO CÔNG TÁC THI CÔNG", "Persisted title mismatch"
    assert found_cv.get("fileUrl") is not None, "Persisted fileUrl must not be None"
    print(f"  ✅ Tồn tại vĩnh viễn trong Database! Reload trang thấy ngay: {found_cv.get('title')} ({found_cv.get('fileUrl')})")

    # Test 3: Edit Resume Title via API
    print("\n[TEST 3] Chỉnh sửa tên tiêu đề CV qua PUT /api/v1/info/web/private-resumes/{slug}/ ...")
    update_payload = {"title": "Kỹ Sư Xây Dựng - Hồ Sơ Cập Nhật"}
    update_resp = client.put(f"/api/v1/info/web/private-resumes/{resume_slug}/", data=update_payload, format="json")
    assert update_resp.status_code == 200, f"Expected 200, got {update_resp.status_code}: {update_resp.data}"
    updated_data = update_resp.data.get("data") or update_resp.data
    assert updated_data.get("title") == "Kỹ Sư Xây Dựng - Hồ Sơ Cập Nhật", "Updated title mismatch"
    print(f"  ✅ Đã cập nhật tiêu đề thành: {updated_data.get('title')}")

    # Test 4: Verify Reload After Edit Title
    print("\n[TEST 4] Kiểm tra lại sau khi sửa tên (Reload check) ...")
    reload_resp2 = client.get(f"/api/v1/info/web/job-seeker-profiles/{profile.id}/resumes/")
    resumes_list2 = reload_resp2.data.get("data")
    updated_found = next((r for r in resumes_list2 if r.get("id") == resume_id), None)
    assert updated_found is not None, "CV must still exist"
    assert updated_found.get("title") == "Kỹ Sư Xây Dựng - Hồ Sơ Cập Nhật", "Title must reflect update"
    print("  ✅ Tên CV mới được lưu chuẩn xác trên DB.")

    # Test 5: Delete Resume via API
    print("\n[TEST 5] Xóa CV qua DELETE /api/v1/info/web/private-resumes/{slug}/ ...")
    del_resp = client.delete(f"/api/v1/info/web/private-resumes/{resume_slug}/")
    assert del_resp.status_code in [200, 204], f"Expected 200 or 204, got {del_resp.status_code}"
    
    # Verify DB & Reload after delete
    reload_resp3 = client.get(f"/api/v1/info/web/job-seeker-profiles/{profile.id}/resumes/")
    resumes_list3 = reload_resp3.data.get("data")
    deleted_found = next((r for r in resumes_list3 if r.get("id") == resume_id), None)
    assert deleted_found is None, "CV must be deleted from DB"
    print("  ✅ CV đã được xóa sạch hoàn toàn khỏi DB.")

    print("\n" + "=" * 70)
    print("🎉 TẤT CẢ 5/5 BƯỚC KIỂM THỬ CV UPLOAD & PERSISTENCE THÀNH CÔNG 100%!")
    print("=" * 70)


if __name__ == "__main__":
    run_tests()
