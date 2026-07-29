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
    "Bất động sản",
    "Xây dựng",
    "Nội thất",
    "Kiến trúc",
    "Thiết kế / Kiến trúc",
    "Điện / Điện tử",
    "Cơ khí",
]

_CAREER_KEYWORDS = {
    "Bất động sản": [
        "bất động sản", "bđs", "real estate", "môi giới", "đất đai", "nhà đất", "dự án",
        "leasing", "property", "cho thuê", "mặt bằng", "chuyên viên bđs", "tư vấn bđs"
    ],
    "Xây dựng": [
        "xây dựng", "construction", "civil", "site", "qs", "kết cấu", "giám sát",
        "project", "safety", "chỉ huy trưởng", "cht", "pm", "project manager",
        "qa", "qc", "qa/qc", "bóc tách", "khối lượng", "dự toán", "điều phối",
        "thu mua", "procurement", "đấu thầu", "tender", "sales admin", "c&c"
    ],
    "Nội thất": [
        "nội thất", "interior", "decor", "đồ gỗ", "thi công nội thất", "xưởng nội thất",
        "giám sát nội thất", "trang trí nội thất", "interior design"
    ],
    "Kiến trúc": [
        "kiến trúc", "architecture", "architect", "thiết kế kiến trúc", "họa viên kiến trúc",
        "diễn họa", "quy hoạch"
    ],
    "Thiết kế / Kiến trúc": [
        "thiết kế", "kiến trúc", "architecture", "interior", "design", "cad", "bim",
        "decor", "gs id", "giám sát nội thất", "nội thất", "diễn họa", "2d", "3d", "họa viên"
    ],
    "Điện / Điện tử": [
        "điện", "electrical", "me", "mep", "hvac", "elv", "automation", "electronics",
        "maintenance", "gs mep", "giám sát mep", "cơ điện"
    ],
    "Cơ khí": [
        "cơ khí", "mechanical", "machinery", "manufacturing", "production", "industrial", "welding"
    ],
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
    return None


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
    if email and "@" in email and not email.startswith("e***"):
        return email
    phone = (candidate.get("phone") or "").strip().replace(" ", "").replace("-", "")
    if phone:
        return f"v24h_{phone}@imported.infohr.vn"
    ref = (candidate.get("source_ref") or candidate.get("seeker_id") or "").strip()
    if ref:
        return f"v24h_{ref}@imported.infohr.vn"
    name_slug = slugify(candidate.get("full_name") or "")
    if name_slug:
        return f"v24h_{name_slug}@imported.infohr.vn"
    return ""

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


import re

def _map_gender(value: object) -> str | None:
    if not value:
        return None
    if isinstance(value, str):
        val_str = value.strip().upper()
        if val_str in {"M", "F", "O"}:
            return val_str
        if "NAM" in val_str or "MALE" in val_str:
            return "M"
        if "NỮ" in val_str or "NU" in val_str or "FEMALE" in val_str:
            return "F"
        if "KHÁC" in val_str or "OTHER" in val_str:
            return "O"
    s_val = str(value).strip()
    if s_val == "1":
        return "M"
    if s_val in {"2", "3"}:
        return "F"
    if s_val == "4":
        return "O"
    return None


def _map_marital_status(value: object) -> str | None:
    if not value:
        return None
    if isinstance(value, str):
        val_str = value.strip().upper()
        if val_str in {"S", "M"}:
            return val_str
        if "ĐỘC THÂN" in val_str or "DOC THAN" in val_str or "SINGLE" in val_str:
            return var_sys.MaritalStatus.SINGLE
        if "KẾT HÔN" in val_str or "KET HON" in val_str or "MARRIED" in val_str:
            return var_sys.MaritalStatus.MARRIED
    s_val = str(value).strip()
    if s_val in {"1", "2"}:
        return var_sys.MaritalStatus.SINGLE
    if s_val == "3":
        return var_sys.MaritalStatus.MARRIED
    return None


def _parse_birthday(value: object) -> date | None:
    if not value:
        return None
    if isinstance(value, date):
        return value
    val_str = str(value).strip()
    if not val_str:
        return None
    if len(val_str) == 4 and val_str.isdigit():
        try:
            year = int(val_str)
            if 1950 <= year <= 2025:
                return date(year, 1, 1)
        except ValueError:
            pass
    if val_str.isdigit() and len(val_str) > 4:
        try:
            ts = int(val_str)
            if ts > 1000000:
                return date.fromtimestamp(ts)
        except (ValueError, OSError, OverflowError):
            pass
    try:
        return date.fromisoformat(val_str)
    except ValueError:
        pass
    match = re.match(r"^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$", val_str)
    if match:
        day, month, year = map(int, match.groups())
        try:
            return date(year, month, day)
        except ValueError:
            pass
    return None


def _map_experience(value: object) -> int | None:
    if value is None:
        return None
    if isinstance(value, int) and 1 <= value <= 8:
        return value
    val_str = str(value).strip().lower()
    if not val_str:
        return None
    if val_str.isdigit():
        num = int(val_str)
        if 1 <= num <= 8:
            return num
        if num == 0:
            return 1
        if num >= 5:
            return 8
    if "chưa" in val_str or "no experience" in val_str or "mới tốt nghiệp" in val_str:
        return 1
    if "dưới 1" in val_str or "< 1" in val_str or "<1" in val_str:
        return 2
    if "1 năm" in val_str or "1 year" in val_str:
        return 3
    if "2 năm" in val_str or "2 years" in val_str:
        return 4
    if "3 năm" in val_str or "3 years" in val_str:
        return 5
    if "4 năm" in val_str or "4 years" in val_str:
        return 6
    if "5 năm" in val_str or "5 years" in val_str:
        return 7
    if "trên 5" in val_str or "> 5" in val_str or "over 5" in val_str or ">5" in val_str:
        return 8
    nums = re.findall(r"\d+", val_str)
    if nums:
        first_num = int(nums[0])
        if first_num == 0:
            return 1
        elif first_num == 1:
            return 3
        elif first_num == 2:
            return 4
        elif first_num == 3:
            return 5
        elif first_num == 4:
            return 6
        elif first_num == 5:
            return 7
        elif first_num > 5:
            return 8
    return None


def _map_position(value: object) -> int | None:
    if value is None:
        return None
    if isinstance(value, int) and 1 <= value <= 6:
        return value
    val_str = str(value).strip().lower()
    if not val_str:
        return None
    if val_str.isdigit():
        num = int(val_str)
        if 1 <= num <= 6:
            return num
    if "giám đốc" in val_str or "cấp cao" in val_str or "executive" in val_str or "director" in val_str:
        return 1
    if "trưởng phòng" in val_str or "quản lý" in val_str or "manager" in val_str:
        return 2
    if "trưởng nhóm" in val_str or "giám sát" in val_str or "leader" in val_str or "supervisor" in val_str:
        return 3
    if "chuyên gia" in val_str or "specialist" in val_str or "senior" in val_str:
        return 4
    if "nhân viên" in val_str or "staff" in val_str or "officer" in val_str or "kỹ sư" in val_str:
        return 5
    if "cộng tác viên" in val_str or "collaborator" in val_str or "thực tập" in val_str or "intern" in val_str:
        return 6
    return 5


def _map_salary(candidate: dict) -> tuple[int, int, int | None]:
    min_sal = candidate.get("min_expected_salary") or candidate.get("salary_min")
    max_sal = candidate.get("max_expected_salary") or candidate.get("salary_max")
    curr_sal = candidate.get("current_salary")

    def _to_int(val):
        if val is None:
            return 0
        try:
            parsed = int(val)
            if 0 < parsed < 1000:
                return parsed * 1_000_000
            return max(0, parsed)
        except (ValueError, TypeError):
            return 0

    salary_min = _to_int(min_sal)
    salary_max = _to_int(max_sal)
    salary_curr = _to_int(curr_sal)

    if salary_min == 0 and salary_max == 0:
        salary_range = str(candidate.get("salary_range") or "").lower()
        if salary_range:
            nums = re.findall(r"\d+(?:[\.,]\d+)?", salary_range)
            if len(nums) >= 2:
                n1 = float(nums[0].replace(",", "."))
                n2 = float(nums[1].replace(",", "."))
                mult = 1_000_000 if ("triệu" in salary_range or n2 < 1000) else 1
                salary_min = int(n1 * mult)
                salary_max = int(n2 * mult)
            elif len(nums) == 1:
                n1 = float(nums[0].replace(",", "."))
                mult = 1_000_000 if ("triệu" in salary_range or n1 < 1000) else 1
                salary_min = int(n1 * mult)
                salary_max = salary_min

    expected_salary = salary_max or salary_min or salary_curr or None
    return salary_min, salary_max, expected_salary


def _parse_cv_text_fallback(candidate: dict, resume: Resume, job_seeker_profile: JobSeekerProfile) -> None:
    source_payload = resume.source_payload or {}
    text_content = ""
    detail_page = source_payload.get("detail_page") or {}
    if isinstance(detail_page, dict):
        text_content += " " + (detail_page.get("bodyText") or "")
    if resume.description:
        text_content += " " + resume.description
    if resume.skills_summary:
        text_content += " " + resume.skills_summary

    if not text_content.strip():
        return

    profile_updated = False
    profile_update_fields = ["update_at"]
    resume_updated = False
    resume_update_fields = ["update_at"]

    if not job_seeker_profile.gender:
        if re.search(r"giới tính\s*:\s*nam|gender\s*:\s*male", text_content, re.IGNORECASE):
            job_seeker_profile.gender = "M"
            profile_updated = True
            profile_update_fields.append("gender")
        elif re.search(r"giới tính\s*:\s*nữ|gender\s*:\s*female", text_content, re.IGNORECASE):
            job_seeker_profile.gender = "F"
            profile_updated = True
            profile_update_fields.append("gender")

    if not job_seeker_profile.birthday:
        bday_match = re.search(r"(?:ngày sinh|ngày/tháng/năm sinh|năm sinh|dob)\s*[:\-]?\s*(\d{1,2}[/.-]\d{1,2}[/.-]\d{4}|\d{4})", text_content, re.IGNORECASE)
        if bday_match:
            parsed_bday = _parse_birthday(bday_match.group(1))
            if parsed_bday:
                job_seeker_profile.birthday = parsed_bday
                profile_updated = True
                profile_update_fields.append("birthday")

    if resume.experience is None:
        exp_match = re.search(r"(\d+)\s*năm\s*kinh\s*nghiệm", text_content, re.IGNORECASE)
        if exp_match:
            years = int(exp_match.group(1))
            mapped_exp = _map_experience(years)
            if mapped_exp:
                resume.experience = mapped_exp
                resume_updated = True
                resume_update_fields.append("experience")

    if resume.salary_min == 0 and resume.salary_max == 0:
        sal_match = re.search(r"lương\s*(?:mong muốn)?\s*[:\-]?\s*(\d+(?:[\.,]\d+)?)\s*(?:-|đến)\s*(\d+(?:[\.,]\d+)?)\s*triệu", text_content, re.IGNORECASE)
        if sal_match:
            try:
                min_v = int(float(sal_match.group(1).replace(",", ".")) * 1_000_000)
                max_v = int(float(sal_match.group(2).replace(",", ".")) * 1_000_000)
                resume.salary_min = min_v
                resume.salary_max = max_v
                resume.expected_salary = max_v
                resume_updated = True
                resume_update_fields.extend(["salary_min", "salary_max", "expected_salary"])
            except (ValueError, TypeError):
                pass

    if profile_updated:
        job_seeker_profile.save(update_fields=profile_update_fields)
    if resume_updated:
        resume.save(update_fields=resume_update_fields)


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
        if not career:
            result.skipped_count += 1
            continue

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

        source_ref = candidate.get("source_ref") or candidate_key
        existing_resume = Resume.objects.filter(source_platform="vieclam24h", source_ref=source_ref).first()

        user_defaults = {
            "full_name": full_name,
            "role_name": var_sys.JOB_SEEKER,
            "is_active": True,
            "is_verify_email": False,
        }

        if existing_resume:
            user = existing_resume.user
            job_seeker_profile = existing_resume.job_seeker_profile or JobSeekerProfile.objects.filter(user=user).first()
            if not job_seeker_profile:
                job_seeker_profile = JobSeekerProfile.objects.create(user=user, location=location)

            user_update_fields = []
            if full_name and user.full_name != full_name:
                user.full_name = full_name
                user_update_fields.append("full_name")

            # Update email if current email is synthetic or if a real unlocked email is provided
            if email and email != user.email:
                if "@imported.infohr.vn" in user.email or "@" in email and not email.endswith("@imported.infohr.vn"):
                    user.email = email
                    user_update_fields.append("email")
            if user_update_fields:
                user_update_fields.append("update_at")
                user.save(update_fields=user_update_fields)

            phone_val = (candidate.get("phone") or "").strip() or None
            if phone_val and job_seeker_profile.phone != phone_val:
                job_seeker_profile.phone = phone_val
                job_seeker_profile.save(update_fields=["phone", "update_at"])

            if location and job_seeker_profile.location != location:
                job_seeker_profile.location = location
                job_seeker_profile.save(update_fields=["location", "update_at"])

        else:
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

        sal_min, sal_max, exp_sal = _map_salary(candidate)
        exp_mapped = _map_experience(candidate.get("experience"))
        pos_mapped = _map_position(candidate.get("position") or candidate.get("level"))

        resume_defaults = {
            "title": (candidate.get("title") or full_name).strip() or full_name,
            "description": (candidate.get("description") or "").strip() or None,
            "skills_summary": (candidate.get("skills_summary") or "").strip() or None,
            "salary_min": sal_min,
            "salary_max": sal_max,
            "expected_salary": exp_sal,
            "position": pos_mapped,
            "experience": exp_mapped,
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
            "source_ref": source_ref,
            "source_payload": source_payload,
            "is_imported": True,
        }

        resume, created_resume = Resume.objects.update_or_create(
            source_platform="vieclam24h",
            source_ref=resume_defaults["source_ref"],
            defaults=resume_defaults,
        )

        _parse_cv_text_fallback(candidate, resume, job_seeker_profile)

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
    on_progress: Any = None,
) -> ImportResult:
    candidates = collect_vieclam24h_candidates(
        source_url,
        username,
        password,
        occupation_ids=list(occupation_ids or []),
        on_progress=on_progress,
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
