from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from django.conf import settings
from typing import Iterable
from urllib.parse import urljoin

from django.db import transaction
from django.utils.text import slugify

from apps.accounts.models import User
from apps.files.models import File
from apps.locations.models import City, District, Location
from apps.profiles.models import JobSeekerProfile, Resume
from common.models import Career
from shared.configs import variable_system as var_sys
from shared.helpers.cloudinary_service import CloudinaryService

from .vieclam24h_import_browser import collect_vieclam24h_candidates

DEFAULT_VIECLAM24H_CAREER_NAMES = [
    "Xây dựng",
    "Thiết kế / Kiến trúc",
    "Điện / Điện tử",
    "Cơ khí",
]

_CAREER_KEYWORDS = {
    "Xây dựng": ["xây dựng", "construction", "civil", "site", "qs", "kết cấu", "giám sát", "project", "safety"],
    "Thiết kế / Kiến trúc": ["thiết kế", "kiến trúc", "architecture", "interior", "design", "cad", "bim", "decor"],
    "Điện / Điện tử": ["điện", "electrical", "me", "hvac", "elv", "automation", "electronics", "maintenance"],
    "Cơ khí": ["cơ khí", "mechanical", "machinery", "manufacturing", "production", "industrial", "welding"],
}


@dataclass
class ImportResult:
    created_count: int = 0
    updated_count: int = 0
    skipped_count: int = 0


def _normalize_career_name(value: str | None) -> str:
    return (value or "").strip().lower()


def _candidate_text(candidate: dict) -> str:
    return " ".join(
        str(part).strip().lower()
        for part in [
            candidate.get("career_name"),
            candidate.get("source_occupation_names"),
            candidate.get("title"),
            candidate.get("skills_summary"),
            candidate.get("description"),
            candidate.get("full_name"),
        ]
        if part
    )


def _score_candidate_for_career(candidate: dict, career: Career) -> int:
    text = _candidate_text(candidate)
    if not text:
        return 0

    score = 0
    career_name = _normalize_career_name(career.name)
    if career_name and career_name in text:
        score += 40

    for keyword in _CAREER_KEYWORDS.get(career.name, []):
        if keyword in text:
            score += 15

    if candidate.get("title"):
        score += 8
    if candidate.get("skills_summary"):
        score += 12
    if candidate.get("description"):
        score += 10
    if candidate.get("city_name"):
        score += 5

    return min(score, 100)


def _match_career(candidate: dict, career_names: Iterable[str]) -> Career | None:
    candidate_text = _candidate_text(candidate)
    careers = list(Career.objects.filter(name__in=list(career_names)))
    if not careers:
        careers = list(Career.objects.all())
    if not careers:
        return None

    for career in careers:
        career_name = _normalize_career_name(career.name)
        if career_name and career_name in candidate_text:
            return career
        for keyword in _CAREER_KEYWORDS.get(career.name, []):
            if keyword in candidate_text:
                return career
    return careers[0]


def _match_city(candidate: dict) -> City | None:
    city_id = candidate.get("city_id") or candidate.get("province_id")
    if city_id is not None:
        city = City.objects.filter(id=city_id).first()
        if city:
            return city

    city_name = (candidate.get("city_name") or "").strip()
    if city_name:
        city = City.objects.filter(name__iexact=city_name).first()
        if city:
            return city
    return City.objects.first()


def _resolve_import_location(target_city: City | None, target_district: District | None) -> Location | None:
    if not target_city and not target_district:
        return None

    city = target_city or (target_district.city if target_district else None)
    district = target_district
    if not city:
        return None
    if district and district.city_id != city.id:
        raise ValueError("Target district does not belong to the selected city.")

    location = Location.objects.filter(city=city, district=district).first()
    if location:
        return location

    return Location.objects.create(
        city=city,
        district=district,
        address=(district.name if district else city.name).strip(),
    )


def _match_location(candidate: dict) -> Location | None:
    city = _match_city(candidate)
    if not city:
        return Location.objects.first()

    location = Location.objects.filter(city=city).first()
    if location:
        return location

    return Location.objects.create(
        city=city,
        address=(candidate.get("city_name") or city.name).strip(),
    )


def _candidate_key(candidate: dict, source_url: str) -> str:
    for key in ("source_ref", "email", "phone"):
        value = (candidate.get(key) or "").strip()
        if value:
            return f"vieclam24h:{value.lower()}"
    return f"vieclam24h:{slugify(candidate.get('full_name') or source_url or 'candidate')}"


def _candidate_email(candidate: dict) -> str:
    email = (candidate.get("email") or "").strip().lower()
    return email

def _resolve_remote_url(value: object, source_url: str) -> str:
    if not isinstance(value, str):
        return ""
    text = value.strip()
    if not text:
        return ""
    if text.startswith("http://") or text.startswith("https://"):
        return text
    if text.startswith("/"):
        return urljoin(source_url.rstrip("/") + "/", text.lstrip("/"))
    return text

def _sync_remote_file(file_record: File | None, remote_url: str, folder_key: str, file_type: str) -> File | None:
    if not remote_url:
        return file_record

    folder = settings.CLOUDINARY_DIRECTORY.get(folder_key, folder_key)
    upload_result = CloudinaryService.upload_file(remote_url, folder)
    if not upload_result:
        return file_record
    return File.update_or_create_file_with_cloudinary(file_record, upload_result, file_type)

def _sync_remote_avatar(user: User, remote_url: str) -> None:
    if not remote_url:
        return

    folder = settings.CLOUDINARY_DIRECTORY.get("avatar", "avatars")
    upload_result = CloudinaryService.upload_image(remote_url, folder)
    if not upload_result:
        return
    user.avatar = File.update_or_create_file_with_cloudinary(user.avatar, upload_result, File.AVATAR_TYPE)
    user.save(update_fields=["avatar", "update_at"])


def _map_gender(value: object) -> str | None:
    if value in {"M", "F", "O"}:
        return str(value)
    if str(value) == "2":
        return "M"
    if str(value) == "3":
        return "F"
    if str(value) == "4":
        return "O"
    return None


def _map_marital_status(value: object) -> str | None:
    if value in {"S", "M"}:
        return str(value)
    if str(value) == "2":
        return var_sys.MaritalStatus.SINGLE
    if str(value) == "3":
        return var_sys.MaritalStatus.MARRIED
    return None


def _parse_birthday(value: object) -> date | None:
    if not value:
        return None
    if isinstance(value, date):
        return value
    try:
        return date.fromisoformat(str(value))
    except ValueError:
        return None


@transaction.atomic
def persist_vieclam24h_candidates(
    candidates: list[dict],
    source_url: str,
    source_account: str,
    career_names: Iterable[str] | None = None,
    target_career: Career | None = None,
    target_city: City | None = None,
    target_district: District | None = None,
    created_by: User | None = None,
) -> ImportResult:
    career_names = list(career_names or DEFAULT_VIECLAM24H_CAREER_NAMES)
    result = ImportResult()

    for candidate in candidates:
        full_name = (candidate.get("full_name") or "").strip()
        if not full_name:
            result.skipped_count += 1
            continue

        candidate_key = _candidate_key(candidate, source_url)
        email = _candidate_email(candidate)
        if not email:
            result.skipped_count += 1
            continue

        career = target_career or _match_career(candidate, career_names)
        target_location = _resolve_import_location(target_city, target_district)
        location = target_location or _match_location(candidate)
        city = location.city if location else _match_city(candidate)
        analysis_score = _score_candidate_for_career(candidate, career) if career else 0

        source_payload = dict(candidate.get("source_payload") or candidate)
        source_payload["analysis"] = {
            "targetCareerId": target_career.id if target_career else None,
            "targetCareerName": target_career.name if target_career else None,
            "score": analysis_score,
            "selectedOccupationIds": candidate.get("source_occupation_ids") or [],
            "selectedOccupationNames": candidate.get("source_occupation_names") or [],
            "targetCityId": target_city.id if target_city else None,
            "targetCityName": target_city.name if target_city else None,
            "targetDistrictId": target_district.id if target_district else None,
            "targetDistrictName": target_district.name if target_district else None,
        }
        remote_cv_url = _resolve_remote_url(
            candidate.get("cv_file_url")
            or (candidate.get("source_payload") or {}).get("detail_page", {}).get("cv_file_url"),
            source_url,
        )
        remote_avatar_url = _resolve_remote_url(
            candidate.get("avatar_url")
            or (candidate.get("source_payload") or {}).get("detail_page", {}).get("avatar_url"),
            source_url,
        )
        if remote_cv_url:
            source_payload["cvFileUrl"] = remote_cv_url
        if remote_avatar_url:
            source_payload["avatarUrl"] = remote_avatar_url

        user_defaults = {
            "full_name": full_name,
            "role_name": var_sys.JOB_SEEKER,
            "is_active": True,
            "is_verify_email": False,
        }
        user, created_user = User.objects.get_or_create(email=email, defaults=user_defaults)
        if not created_user:
            update_fields = []
            for field, value in user_defaults.items():
                if getattr(user, field) != value:
                    setattr(user, field, value)
                    update_fields.append(field)
            if update_fields:
                update_fields.append("update_at")
                user.save(update_fields=update_fields)

        profile_defaults = {
            "phone": (candidate.get("phone") or "").strip() or None,
            "location": location,
            "birthday": _parse_birthday(candidate.get("birthday")),
            "gender": _map_gender(candidate.get("gender")),
            "marital_status": _map_marital_status(candidate.get("marital_status")),
        }
        job_seeker_profile, created_profile = JobSeekerProfile.objects.get_or_create(
            user=user,
            defaults=profile_defaults,
        )
        if not created_profile:
            profile_update_fields = []
            for field, value in profile_defaults.items():
                if value is not None and getattr(job_seeker_profile, field) != value:
                    setattr(job_seeker_profile, field, value)
                    profile_update_fields.append(field)
            if profile_update_fields:
                profile_update_fields.append("update_at")
                job_seeker_profile.save(update_fields=profile_update_fields)

        resume_defaults = {
            "title": (candidate.get("title") or full_name).strip() or full_name,
            "description": (candidate.get("description") or "").strip() or None,
            "skills_summary": (candidate.get("skills_summary") or "").strip() or None,
            "salary_min": 0,
            "salary_max": 0,
            "expected_salary": None,
            "position": None,
            "experience": None,
            "academic_level": None,
            "type_of_workplace": None,
            "job_type": None,
            "city": city,
            "career": career,
            "job_seeker_profile": job_seeker_profile,
            "user": user,
            "type": var_sys.CV_WEBSITE,
            "is_active": True,
            "source_platform": "vieclam24h",
            "source_url": source_url,
            "source_account": source_account,
            "source_ref": candidate.get("source_ref") or candidate_key,
            "source_payload": source_payload,
            "is_imported": True,
        }

        resume, created_resume = Resume.objects.update_or_create(
            source_platform="vieclam24h",
            source_ref=resume_defaults["source_ref"],
            defaults=resume_defaults,
        )

        if remote_cv_url:
            resume.file = _sync_remote_file(resume.file, remote_cv_url, "cv", File.CV_TYPE)
            if resume.file:
                resume.save(update_fields=["file", "update_at"])

        if remote_avatar_url:
            _sync_remote_avatar(user, remote_avatar_url)

        if created_resume:
            result.created_count += 1
        else:
            result.updated_count += 1

    return result


def import_vieclam24h_candidates(
    source_url: str,
    username: str,
    password: str,
    occupation_ids: Iterable[int] | None = None,
    career_names: Iterable[str] | None = None,
    target_career: Career | None = None,
    target_city: City | None = None,
    target_district: District | None = None,
    created_by: User | None = None,
) -> ImportResult:
    candidates = collect_vieclam24h_candidates(
        source_url,
        username,
        password,
        occupation_ids=list(occupation_ids or []),
    )
    return persist_vieclam24h_candidates(
        candidates,
        source_url=source_url,
        source_account=username,
        career_names=career_names,
        target_career=target_career,
        target_city=target_city,
        target_district=target_district,
        created_by=created_by,
    )
