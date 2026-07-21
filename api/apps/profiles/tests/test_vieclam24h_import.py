import json
import sys
import types
from urllib.parse import parse_qs, urlparse

import pytest

from apps.accounts.models import User
from apps.files.models import File
from apps.locations.models import City, District, Location
from apps.profiles.models import Resume
from apps.profiles.services.vieclam24h_import import persist_vieclam24h_candidates
from apps.profiles.services.vieclam24h_import_browser import (
    _build_browser_headers,
    _extract_auth_token_from_browser_state,
    _login_vieclam24h,
)
from shared.configs import variable_system as var_sys


@pytest.mark.django_db
def test_persist_vieclam24h_candidates_creates_shared_resume_with_source_metadata(career, city, location):
    result = persist_vieclam24h_candidates(
        [
            {
                "full_name": "Nguyen Van A",
                "email": "a@example.com",
                "phone": "0909000111",
                "title": "Backend Developer",
                "career_name": "Sales",
                "city_name": city.name,
                "source_ref": "candidate-a",
                "birthday": "1995-04-02",
                "gender": "M",
                "marital_status": "S",
                "source_occupation_ids": [31, 4],
                "source_occupation_names": ["Xây dựng", "Kiến trúc - Thiết kế nội ngoại thất"],
                "source_payload": {
                    "source": {"search": {"id": "candidate-a"}},
                    "catalog": {"occupationNames": ["Xây dựng"]},
                },
            }
        ],
        source_url="https://ntd.vieclam24h.vn/employer/search/seeker",
        source_account="hr@example.com",
        target_career=career,
    )

    assert result.created_count == 1
    assert result.updated_count == 0

    resume = Resume.objects.get(source_platform="vieclam24h", source_ref="candidate-a")
    assert resume.is_imported is True
    assert resume.source_url == "https://ntd.vieclam24h.vn/employer/search/seeker"
    assert resume.source_account == "hr@example.com"
    assert resume.user.full_name == "Nguyen Van A"
    assert resume.user.role_name == var_sys.JOB_SEEKER
    assert resume.job_seeker_profile.phone == "0909000111"
    assert resume.job_seeker_profile.birthday.isoformat() == "1995-04-02"
    assert resume.job_seeker_profile.gender == "M"
    assert resume.job_seeker_profile.marital_status == var_sys.MaritalStatus.SINGLE
    assert resume.career.name == career.name
    assert resume.city.name == city.name
    assert User.objects.filter(email="a@example.com").exists()
    assert resume.source_payload["analysis"]["targetCareerName"] == career.name
    assert resume.source_payload["analysis"]["selectedOccupationIds"] == [31, 4]


@pytest.mark.django_db
def test_persist_vieclam24h_candidates_skips_entries_without_real_email(career):
    result = persist_vieclam24h_candidates(
        [
            {
                "full_name": "Nguyen Van B",
                "email": "",
                "phone": "0909000333",
                "title": "Backend Developer",
                "career_name": "Sales",
                "city_name": "Ha Noi",
                "source_ref": "candidate-no-email",
            }
        ],
        source_url="https://ntd.vieclam24h.vn/employer/search/seeker",
        source_account="hr@example.com",
        target_career=career,
    )

    assert result.created_count == 0
    assert result.updated_count == 0
    assert result.skipped_count == 1
    assert not Resume.objects.filter(source_platform="vieclam24h", source_ref="candidate-no-email").exists()
    assert not User.objects.filter(full_name="Nguyen Van B").exists()

@pytest.mark.django_db
def test_persist_vieclam24h_candidates_uses_selected_target_location(career, city):
    other_city = City.objects.create(name="Da Nang", code="DNG")
    target_district = District.objects.create(name="Quan Hai Chau", code="HC", city=city)

    result = persist_vieclam24h_candidates(
        [
            {
                "full_name": "Tran Thi B",
                "email": "b@example.com",
                "phone": "0909000222",
                "title": "Frontend Developer",
                "career_name": "Sales",
                "city_name": other_city.name,
                "source_ref": "candidate-b",
                "source_occupation_ids": [31],
                "source_occupation_names": ["Xay dung"],
            }
        ],
        source_url="https://ntd.vieclam24h.vn/employer/search/seeker",
        source_account="hr@example.com",
        target_career=career,
        target_city=city,
        target_district=target_district,
    )

    assert result.created_count == 1

    resume = Resume.objects.get(source_platform="vieclam24h", source_ref="candidate-b")
    assert resume.city_id == city.id
    assert resume.job_seeker_profile.location is not None
    assert resume.job_seeker_profile.location.city_id == city.id
    assert resume.job_seeker_profile.location.district_id == target_district.id
    assert Location.objects.filter(city=city, district=target_district).exists()
    assert resume.source_payload["analysis"]["targetCityId"] == city.id
    assert resume.source_payload["analysis"]["targetDistrictId"] == target_district.id

@pytest.mark.django_db
def test_persist_vieclam24h_candidates_syncs_remote_cv_and_avatar(career, city, monkeypatch):
    uploaded_files = []
    uploaded_images = []

    def fake_upload_file(file_obj, folder, public_id=None, options=None):
        uploaded_files.append((file_obj, folder, public_id))
        return {
            "public_id": "cv/imported/nguyen-thi-abc.pdf",
            "version": "1",
            "format": "pdf",
            "resource_type": "raw",
            "created_at": "2026-07-11T00:00:00+00:00",
            "bytes": 12345,
            "bucket": "square",
            "url": "https://cdn.test/cv/imported/nguyen-thi-abc.pdf",
        }

    def fake_upload_image(file_obj, folder, public_id=None, options=None):
        uploaded_images.append((file_obj, folder, public_id))
        return {
            "public_id": "avatars/nguyen-thi-abc.jpg",
            "version": "1",
            "format": "jpg",
            "resource_type": "image",
            "created_at": "2026-07-11T00:00:00+00:00",
            "bytes": 12345,
            "bucket": "square",
            "url": "https://cdn.test/avatars/nguyen-thi-abc.jpg",
        }

    monkeypatch.setattr("apps.profiles.services.vieclam24h_import.CloudinaryService.upload_file", fake_upload_file)
    monkeypatch.setattr("apps.profiles.services.vieclam24h_import.CloudinaryService.upload_image", fake_upload_image)

    result = persist_vieclam24h_candidates(
        [
            {
                "full_name": "Nguyen Thi A",
                "email": "a2@example.com",
                "phone": "0909000444",
                "title": "Project Engineer",
                "career_name": "Xay dung",
                "city_name": city.name,
                "province_id": city.id,
                "source_ref": "candidate-with-files",
                "cv_file_url": "https://cdn1.vieclam24h.vn/pdf/default/2026/07/06/nguyen_thi_a_cv.pdf",
                "avatar_url": "https://cdn1.vieclam24h.vn/avatar/default/2026/07/06/nguyen_thi_a.jpg",
            }
        ],
        source_url="https://ntd.vieclam24h.vn/employer/search/seeker",
        source_account="hr@example.com",
        target_career=career,
    )

    assert result.created_count == 1
    resume = Resume.objects.get(source_platform="vieclam24h", source_ref="candidate-with-files")
    resume.refresh_from_db()
    assert resume.file is not None
    assert resume.file.file_type == File.CV_TYPE
    assert resume.file.public_id == "cv/imported/nguyen-thi-abc.pdf"
    assert resume.city_id == city.id
    assert resume.user.avatar is not None
    assert resume.user.avatar.file_type == File.AVATAR_TYPE
    assert resume.user.avatar.public_id == "avatars/nguyen-thi-abc.jpg"
    assert uploaded_files
    assert uploaded_images


def test_build_browser_headers_omits_authorization_when_token_is_missing():
    headers = _build_browser_headers(None, "https://ntd.vieclam24h.vn")

    assert "Authorization" not in headers
    assert headers["Accept"] == "application/json"
    assert headers["Referer"] == "https://ntd.vieclam24h.vn/"

def test_build_search_url_uses_apiv2_origin_and_minimal_params():
    from apps.profiles.services.vieclam24h_import_browser import _build_search_url

    url = _build_search_url("https://ntd.vieclam24h.vn", page=1, per_page=20, occupation_ids=[31, 13])
    parsed = urlparse(url)
    params = parse_qs(parsed.query)

    assert parsed.scheme == "https"
    assert parsed.netloc == "apiv2.vieclam24h.vn"
    assert parsed.path == "/seeker/fe/api/v1/search/ai-resume"
    assert params["per_page"] == ["20"]
    assert params["includes"] == ["is_seen"]
    assert params["action"] == ["search"]
    assert params["order_by[relevance]"] == ["DESC"]
    assert params["occupation_ids[]"] == ["31", "13"]
    assert "activity" not in params
    assert "page" not in params


def test_login_vieclam24h_returns_none_when_token_capture_fails(monkeypatch):
    class _FakeLocator:
        def __init__(self):
            self.values = []

        def fill(self, value):
            self.values.append(value)
            return None

        def click(self):
            return None

    class _FakePage:
        def __init__(self):
            self.calls = []
            self._locator = _FakeLocator()

        def goto(self, url, wait_until=None, timeout=None):
            self.calls.append(("goto", url, wait_until, timeout))

        def locator(self, selector):
            self.calls.append(("locator", selector))
            return self._locator

        def wait_for_timeout(self, timeout):
            self.calls.append(("wait_for_timeout", timeout))

    fake_page = _FakePage()
    monkeypatch.setattr(
        "apps.profiles.services.vieclam24h_import_browser._capture_login_token",
        lambda page, search_url: (_ for _ in ()).throw(RuntimeError("no token")),
    )

    assert _login_vieclam24h(fake_page, "hr@example.com", "secret", "https://ntd.vieclam24h.vn/tim-kiem-ung-vien-nhanh") is None


def test_extract_auth_token_from_browser_state_prefers_storage_values():
    snapshot = {
        "localStorage": {
            "theme": "dark",
            "accessToken": "Bearer local-storage-token",
        },
        "sessionStorage": {
            "token": "session-token",
        },
        "cookies": "foo=bar; access_token=cookie-token",
    }

    assert _extract_auth_token_from_browser_state(snapshot) == "Bearer local-storage-token"


def test_login_vieclam24h_uses_browser_storage_token_when_request_capture_fails(monkeypatch):
    class _FakeLocator:
        def fill(self, _value):
            return None

        def click(self):
            return None

    class _FakePage:
        def goto(self, *_args, **_kwargs):
            return None

        def locator(self, *_args, **_kwargs):
            return _FakeLocator()

        def wait_for_timeout(self, *_args, **_kwargs):
            return None

        def evaluate(self, *_args, **_kwargs):
            return {
                "localStorage": {"accessToken": "Bearer storage-token"},
                "sessionStorage": {},
                "cookies": "",
            }

    monkeypatch.setattr(
        "apps.profiles.services.vieclam24h_import_browser._capture_login_token",
        lambda *args, **kwargs: (_ for _ in ()).throw(RuntimeError("no token")),
    )

    assert _login_vieclam24h(_FakePage(), "hr@example.com", "secret", "https://ntd.vieclam24h.vn/tim-kiem-ung-vien-nhanh") == "Bearer storage-token"

def test_collect_detail_page_snapshot_parses_contact_and_identity_fields():
    from apps.profiles.services.vieclam24h_import_browser import _collect_detail_page_snapshot

    html = """
    <html>
      <body>
        <div class="resume-wrapper">
          <div class="seeker-info-title">Th??ng tin c?? nh??n</div>
          <div class="grid md:grid-cols-3 my-2">
            <div class="mb-3 text-sm">
              <div class="text-neutral-48 text-12 font-medium mb-0.5">Email</div>
              <div class="text-14 text-[#1D1B21] break-words">phat.nguyenthien94@gmail.com</div>
            </div>
            <div class="mb-3 text-sm">
              <div class="text-neutral-48 text-12 font-medium mb-0.5">S??? ??i???n tho???i</div>
              <div class="text-14 text-[#1D1B21] break-words">0909066400</div>
            </div>
            <div class="mb-3 text-sm">
              <div class="text-neutral-48 text-12 font-medium mb-0.5">T???nh / Th??nh ph???</div>
              <div class="text-14 text-[#1D1B21] break-words">TP.HCM</div>
            </div>
            <div class="mb-3 text-sm">
              <div class="text-neutral-48 text-12 font-medium mb-0.5">Ng??y sinh &amp; Gi???i t??nh</div>
              <div class="text-14 text-[#1D1B21] break-words">1994, Nam</div>
            </div>
            <div class="mb-3 text-sm">
              <div class="text-neutral-48 text-12 font-medium mb-0.5">?????a ch???</div>
              <div class="text-14 text-[#1D1B21] break-words">S? 3/44 Th?nh Th?i, ph??ng 14, qu?n 10</div>
            </div>
          </div>
        </div>
      </body>
    </html>
    """

    class _FakePage:
        def __init__(self, html):
            self._html = html
            self.urls = []

        def goto(self, url, wait_until=None, timeout=None):
            self.urls.append(url)

        def wait_for_timeout(self, *_args, **_kwargs):
            return None

        def content(self):
            return self._html

    with pytest.raises(RuntimeError, match="missing seeker_id"):
        _collect_detail_page_snapshot(
            _FakePage(html),
            full_name="Nguy???n Thi???n Ph??t",
            resume_id=204400362,
            source_url="https://ntd.vieclam24h.vn/employer/search/seeker",
        )

@pytest.mark.django_db
def test_collect_detail_page_snapshot_uses_contact_api_when_email_is_hidden():
    from apps.profiles.services.vieclam24h_import_browser import _collect_detail_page_snapshot

    html = """
    <html>
      <body>
        <div class="resume-wrapper">
          <div class="seeker-info-title">Th????ng tin c???? nh????n</div>
          <div class="grid md:grid-cols-3 my-2">
            <div class="mb-3 text-sm">
              <div class="text-neutral-48 text-12 font-medium mb-0.5">Email</div>
              <div class="text-14 text-[#1D1B21] break-words">Th??ng tin ???? ???n</div>
            </div>
            <div class="mb-3 text-sm">
              <div class="text-neutral-48 text-12 font-medium mb-0.5">S??????? ?????i???????n tho??????i</div>
              <div class="text-14 text-[#1D1B21] break-words">Th??ng tin ???? ???n</div>
            </div>
          </div>
        </div>
      </body>
    </html>
    """
    contact_payload = {
        "code": 200,
        "msg": "Successfully",
        "data": {
            "email": "phat.nguyenthien94@gmail.com",
            "mobile": "0909066400",
            "birthday": 765651600,
            "gender": 2,
            "address": "S??? 3/44 Th??nh Th??i, ph?????ng 14, qu???n 10",
            "province_id": 122,
            "district_id": 722,
            "cv_file_url": "https://cdn1.vieclam24h.vn/pdf/default/2026/07/06/nguyen_thien_phat-cv2026_178331512838.pdf",
            "avatar_url": "https://cdn1.vieclam24h.vn/avatar/default/2026/07/06/nguyen_thien_phat.jpg",
        },
    }

    class _FakePage:
        def __init__(self, html):
            self._html = html
            self.urls = []

        def goto(self, url, wait_until=None, timeout=None):
            self.urls.append(url)

        def wait_for_timeout(self, *_args, **_kwargs):
            return None

        def content(self):
            return self._html

        def evaluate(self, _script, payload):
            if "employer-seen-resume/204400362" in payload["url"]:
                return {
                    "status": 200,
                    "url": payload["url"],
                    "contentType": "application/json; charset=UTF-8",
                    "body": json.dumps(
                        {
                            "code": 200,
                            "msg": "Successfully",
                            "data": {"id": "142553634", "resume_id": "204400362", "employer_id": "3919107"},
                        }
                    ),
                }
            if "check-view-seeker/204400362" in payload["url"]:
                return {
                    "status": 200,
                    "url": payload["url"],
                    "contentType": "application/json; charset=UTF-8",
                    "body": json.dumps(
                        {
                            "code": 200,
                            "msg": "Successfully",
                            "data": {"check_view_seeker_token": "view-seeker-token"},
                        }
                    ),
                }
            if "resume-hidden/204400362" in payload["url"]:
                return {
                    "status": 200,
                    "url": payload["url"],
                    "contentType": "application/json; charset=UTF-8",
                    "body": "",
                }
            if "seeker-contact/4410954" in payload["url"]:
                return {
                    "status": 200,
                    "url": payload["url"],
                    "contentType": "application/json; charset=UTF-8",
                    "body": json.dumps(contact_payload),
                }
            return {
                "status": 200,
                "url": payload["url"],
                "contentType": "application/json; charset=UTF-8",
                "body": json.dumps({"code": 0, "msg": "Unexpected", "data": []}),
            }

    result = _collect_detail_page_snapshot(
        _FakePage(html),
        full_name="Nguy???????n Thi???????n Ph????t",
        resume_id=204400362,
        source_url="https://ntd.vieclam24h.vn/employer/search/seeker",
        seeker_id=4410954,
    )

    assert result["email"] == "phat.nguyenthien94@gmail.com"
    assert result["phone"] == "0909066400"
    assert result["birthday"] == "1994"
    assert result["gender"] == "M"
    assert result["address"] == "S??? 3/44 Th??nh Th??i, ph?????ng 14, qu???n 10"
    assert result["province_id"] == 122
    assert result["district_id"] == 722
    assert result["cv_file_url"] == "https://cdn1.vieclam24h.vn/pdf/default/2026/07/06/nguyen_thien_phat-cv2026_178331512838.pdf"
    assert result["avatar_url"] == "https://cdn1.vieclam24h.vn/avatar/default/2026/07/06/nguyen_thien_phat.jpg"


def test_collect_detail_page_snapshot_unlocks_contact_detail_with_view_seeker_token():
    from apps.profiles.services.vieclam24h_import_browser import _collect_detail_page_snapshot

    seen_resume_payload = {
        "code": 200,
        "msg": "Successfully",
        "data": {"id": "142553634", "resume_id": "204400362", "employer_id": "3919107"},
    }
    check_view_payload = {
        "code": 200,
        "msg": "Successfully",
        "data": {"check_view_seeker_token": "view-seeker-token"},
    }
    contact_payload = {
        "code": 200,
        "msg": "Successfully",
        "data": {
            "email": "phat.nguyenthien94@gmail.com",
            "mobile": "0909066400",
            "birthday": 765651600,
            "gender": 2,
            "address": "Số 3/44 Thành Thái, phường 14, quận 10",
            "province_id": 122,
            "district_id": 722,
            "cv_file_url": "https://cdn1.vieclam24h.vn/pdf/default/2026/07/06/nguyen_thien_phat-cv2026_178331512838.pdf",
            "avatar": "https://cdn1.vieclam24h.vn/avatar/default/2026/07/06/nguyen_thien_phat.jpg",
        },
    }

    seen_resume_payload = {
        "code": 200,
        "msg": "Successfully",
        "data": {"id": "142553634", "resume_id": "204400362", "employer_id": "3919107"},
    }
    check_view_payload = {
        "code": 200,
        "msg": "Successfully",
        "data": {"check_view_seeker_token": "view-seeker-token"},
    }
    calls = []

    seen_resume_payload = {
        "code": 200,
        "msg": "Successfully",
        "data": {"id": "142553634", "resume_id": "204400362", "employer_id": "3919107"},
    }
    check_view_payload = {
        "code": 200,
        "msg": "Successfully",
        "data": {"check_view_seeker_token": "view-seeker-token"},
    }
    calls = []

    calls = []

    seen_resume_payload = {
        "code": 200,
        "msg": "Successfully",
        "data": {"id": "142553634", "resume_id": "204400362", "employer_id": "3919107"},
    }
    check_view_payload = {
        "code": 200,
        "msg": "Successfully",
        "data": {"check_view_seeker_token": "view-seeker-token"},
    }
    calls = []

    class _FakePage:
        def goto(self, url, wait_until=None, timeout=None):
            calls.append(("goto", url, wait_until, timeout))

        def wait_for_timeout(self, timeout):
            calls.append(("wait", timeout))

        def evaluate(self, _script, payload):
            calls.append((payload["method"], payload["url"], payload["body"]))
            if "/mix/fe/employer/employer-seen-resume/204400362" in payload["url"]:
                assert payload["method"] == "POST"
                assert payload["body"] == {"id": "204400362"}
                return {
                    "status": 200,
                    "url": payload["url"],
                    "contentType": "application/json; charset=UTF-8",
                    "body": json.dumps(seen_resume_payload),
                }
            if "/mix/fe/employer/check-view-seeker/204400362" in payload["url"]:
                assert payload["method"] == "POST"
                assert payload["body"] == {"id": "204400362"}
                return {
                    "status": 200,
                    "url": payload["url"],
                    "contentType": "application/json; charset=UTF-8",
                    "body": json.dumps(check_view_payload),
                }
            if "/seeker/fe/resume-hidden/204400362" in payload["url"]:
                assert payload["method"] == "GET"
                return {
                    "status": 200,
                    "url": payload["url"],
                    "contentType": "application/json; charset=UTF-8",
                    "body": "",
                }
            if "/seeker/fe/employer/seeker-contact/4410954" in payload["url"]:
                assert payload["method"] == "POST"
                assert payload["body"] == {"id": 4410954, "check_view_seeker_token": "view-seeker-token"}
                return {
                    "status": 200,
                    "url": payload["url"],
                    "contentType": "application/json; charset=UTF-8",
                    "body": json.dumps(contact_payload),
                }
            raise AssertionError(f"Unexpected request: {payload['method']} {payload['url']}")

    result = _collect_detail_page_snapshot(
        _FakePage(),
        full_name="Nguyễn Thiện Phát",
        resume_id=204400362,
        source_url="https://ntd.vieclam24h.vn/employer/search/seeker",
        seeker_id=4410954,
        auth_token="Bearer token",
    )

    assert result["email"] == "phat.nguyenthien94@gmail.com"
    assert result["phone"] == "0909066400"
    assert result["birthday"] == "1994"
    assert result["gender"] == "M"
    assert result["address"] == "Số 3/44 Thành Thái, phường 14, quận 10"
    assert result["province_id"] == 122
    assert result["district_id"] == 722
    assert result["cv_file_url"] == "https://cdn1.vieclam24h.vn/pdf/default/2026/07/06/nguyen_thien_phat-cv2026_178331512838.pdf"
    assert result["avatar_url"] == "https://cdn1.vieclam24h.vn/avatar/default/2026/07/06/nguyen_thien_phat.jpg"
    assert [call[0] for call in calls if call[0] in {"POST", "GET"}] == ["POST", "POST", "GET", "POST"]

@pytest.mark.django_db
def test_collect_vieclam24h_candidates_uses_search_api_results_when_available(monkeypatch, career, city):
    from apps.profiles.services.vieclam24h_import_browser import collect_vieclam24h_candidates

    class _FakePage:
        def wait_for_timeout(self, *_args, **_kwargs):
            return None

    class _FakeBrowser:
        def new_page(self, *args, **kwargs):
            return _FakePage()

        def close(self):
            return None

    class _FakePlaywright:
        def __enter__(self):
            class _Chromium:
                def launch(self, headless=True):
                    return _FakeBrowser()

            self.chromium = _Chromium()
            return self

        def __exit__(self, exc_type, exc, tb):
            return False

    fake_sync_api = types.SimpleNamespace(sync_playwright=lambda: _FakePlaywright())
    fake_playwright = types.SimpleNamespace(sync_api=fake_sync_api)
    monkeypatch.setitem(sys.modules, "playwright", fake_playwright)
    monkeypatch.setitem(sys.modules, "playwright.sync_api", fake_sync_api)
    monkeypatch.setattr(
        "apps.profiles.services.vieclam24h_import_browser.get_vieclam24h_catalog",
        lambda source_url=None: {
            "origin": "https://ntd.vieclam24h.vn",
            "occupations": [{"id": 31, "name": "Xây dựng", "isTop": True}],
            "topOccupations": [{"id": 31, "name": "Xây dựng", "isTop": True}],
            "provinces": [{"id": city.id, "name": city.name}],
            "provincesAll": [{"id": city.id, "name": city.name}],
            "recommendedOccupationIds": [31],
        },
    )
    monkeypatch.setattr(
        "apps.profiles.services.vieclam24h_import_browser._login_vieclam24h",
        lambda *args, **kwargs: None,
    )
    monkeypatch.setattr(
        "apps.profiles.services.vieclam24h_import_browser._collect_json_payloads",
        lambda *args, **kwargs: [],
    )
    monkeypatch.setattr(
        "apps.profiles.services.vieclam24h_import_browser._scrape_from_dom",
        lambda *args, **kwargs: [],
    )
    monkeypatch.setattr(
        "apps.profiles.services.vieclam24h_import_browser._collect_search_items",
        lambda *args, **kwargs: [
            {
                "id": 1001,
                "seeker_id": 2001,
                "title": "Backend Developer",
                "seeker_info": {"name": "Nguyen Van A"},
                "occupation_ids": [31],
                "province_ids": [city.id],
            }
        ],
    )

    result = collect_vieclam24h_candidates(
        source_url="https://ntd.vieclam24h.vn/employer/search/seeker",
        username="hr@example.com",
        password="secret",
        occupation_ids=[31],
    )

    assert len(result) == 1
    assert result[0]["full_name"] == "Nguyen Van A"


@pytest.mark.django_db
def test_collect_vieclam24h_candidates_falls_back_when_search_api_returns_html(monkeypatch, career, city):
    from apps.profiles.services.vieclam24h_import_browser import collect_vieclam24h_candidates

    class _FakePage:
        def wait_for_timeout(self, *_args, **_kwargs):
            return None

    class _FakeBrowser:
        def new_page(self, *args, **kwargs):
            return _FakePage()

        def close(self):
            return None

    class _FakePlaywright:
        def __enter__(self):
            class _Chromium:
                def launch(self, headless=True):
                    return _FakeBrowser()

            self.chromium = _Chromium()
            return self

        def __exit__(self, exc_type, exc, tb):
            return False

    fake_sync_api = types.SimpleNamespace(sync_playwright=lambda: _FakePlaywright())
    fake_playwright = types.SimpleNamespace(sync_api=fake_sync_api)
    monkeypatch.setitem(sys.modules, "playwright", fake_playwright)
    monkeypatch.setitem(sys.modules, "playwright.sync_api", fake_sync_api)
    monkeypatch.setattr(
        "apps.profiles.services.vieclam24h_import_browser.get_vieclam24h_catalog",
        lambda source_url=None: {
            "origin": "https://ntd.vieclam24h.vn",
            "occupations": [{"id": 31, "name": "Xây dựng", "isTop": True}],
            "topOccupations": [{"id": 31, "name": "Xây dựng", "isTop": True}],
            "provinces": [{"id": city.id, "name": city.name}],
            "provincesAll": [{"id": city.id, "name": city.name}],
            "recommendedOccupationIds": [31],
        },
    )
    monkeypatch.setattr(
        "apps.profiles.services.vieclam24h_import_browser._login_vieclam24h",
        lambda *args, **kwargs: None,
    )
    monkeypatch.setattr(
        "apps.profiles.services.vieclam24h_import_browser._collect_candidates_from_search_api",
        lambda *args, **kwargs: (_ for _ in ()).throw(RuntimeError("Unexpected HTML response")),
    )

    with pytest.raises(RuntimeError, match="Unexpected HTML response"):
        collect_vieclam24h_candidates(
            source_url="https://ntd.vieclam24h.vn/employer/search/seeker",
            username="hr@example.com",
            password="secret",
            occupation_ids=[31],
        )
