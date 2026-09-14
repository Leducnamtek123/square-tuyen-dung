from __future__ import annotations

import re
import logging
from datetime import date
from django.conf import settings

import fitz

from apps.accounts.models import User
from apps.profiles.models import Resume, JobSeekerProfile
from shared.helpers.cloudinary_service import CloudinaryService

logger = logging.getLogger(__name__)


def parse_cv_text_content(text: str) -> dict:
    if not text:
        return {}

    data = {}
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    # 1. Trích xuất Email thực tế, loại trừ email proxy hệ thống
    emails = re.findall(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    valid_emails = [
        e.strip()
        for e in emails
        if not ("nhanluc" in e.lower() or "imported.infohr" in e.lower())
    ]
    if valid_emails:
        data["email"] = valid_emails[0]

    # 2. Trích xuất Số điện thoại Việt Nam
    phone_pattern = r"(?:(?:\+84|0)[35789](?:[\s.-]*\d){8})"
    phone_candidates = [re.sub(r"[\s.-]", "", m) for m in re.findall(phone_pattern, text)]
    if phone_candidates:
        data["phone"] = phone_candidates[0]
    else:
        p_match = re.search(r"(?:^|[^\d])(0[35789]\d[\s.-]?\d{3}[\s.-]?\d{4})(?:[^\d]|$)", text)
        if p_match:
            data["phone"] = re.sub(r"[\s.-]", "", p_match.group(1))

    # 3. Trích xuất Ngày sinh
    bday_match = re.search(r"(?:^|[^\d])(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})(?:[^\d]|$)", text)
    if bday_match:
        d, m, y = int(bday_match.group(1)), int(bday_match.group(2)), int(bday_match.group(3))
        if 1950 <= y <= 2015 and 1 <= m <= 12 and 1 <= d <= 31:
            try:
                data["birthday"] = date(y, m, d)
            except Exception:
                pass

    # 4. Trích xuất Giới tính
    g_match = re.search(r"(?:giới tính|gioi tinh|gender)\s*[:\-]?\s*(nam|nữ|nu|male|female)", text, re.IGNORECASE)
    if g_match:
        g = g_match.group(1).lower()
        data["gender"] = "M" if g in ["nam", "male"] else "F"
    else:
        for l in lines[:15]:
            l_clean = l.lower().strip()
            if l_clean in ["nam", "male"]:
                data["gender"] = "M"
                break
            elif l_clean in ["nữ", "nu", "female"]:
                data["gender"] = "F"
                break

    # 5. Trích xuất Chức danh công việc
    if len(lines) > 1:
        for l in lines[1:6]:
            if (
                not re.search(r"[@\d]|facebook|zalo|http|mục tiêu|kinh nghiệm|kỹ năng|học vấn|thông tin", l, re.IGNORECASE)
                and 3 < len(l) < 60
            ):
                data["title"] = l
                break

    # 6. Trích xuất Địa chỉ liên hệ
    addr_match = re.search(r"(?:địa chỉ|dia chi|address|nơi ở|noi o|thường trú|thuong tru)\s*[:\-]?\s*([^\n\r]+)", text, re.IGNORECASE)
    if addr_match:
        data["address"] = addr_match.group(1).strip()
    else:
        for l in lines:
            if re.search(r"(?:phường|phuong|quận|quan|đường|duong|huyện|huyen|thành phố|thanh pho|tp\.|tỉnh|tinh)\b", l, re.IGNORECASE) and len(l) > 10:
                data["address"] = l.strip(" \t")
                break

    return data


def extract_and_apply_pdf_info(
    resume: Resume,
    job_seeker_profile: JobSeekerProfile | None = None,
    user: User | None = None,
) -> dict:
    if not resume.file or not resume.file.public_id:
        return {}

    user = user or resume.user
    job_seeker_profile = job_seeker_profile or resume.job_seeker_profile

    client = CloudinaryService._get_client()
    bucket = getattr(settings, "MINIO_BUCKET", "square")

    try:
        resp = client.get_object(bucket, resume.file.public_id)
        file_bytes = resp.read()
    except Exception as err:
        logger.warning(f"Không thể đọc file PDF từ MinIO cho Resume {resume.id}: {err}")
        return {}

    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text_content = "\n".join([page.get_text() for page in doc])
    except Exception as err:
        logger.warning(f"Lỗi phân tích cú pháp PDF cho Resume {resume.id}: {err}")
        return {}

    parsed = parse_cv_text_content(text_content)
    if not parsed:
        return {}

    # Cập nhật Email thực tế cho User nếu an toàn
    if parsed.get("email") and user:
        real_email = parsed["email"]
        has_collision = User.objects.filter(email=real_email).exclude(id=user.id).exists()
        if not has_collision:
            user.email = real_email
            user.save(update_fields=["email", "update_at"])

    # Cập nhật JobSeekerProfile
    if job_seeker_profile:
        profile_fields = ["update_at"]
        if parsed.get("phone"):
            job_seeker_profile.phone = parsed["phone"]
            profile_fields.append("phone")
        if parsed.get("birthday"):
            job_seeker_profile.birthday = parsed["birthday"]
            profile_fields.append("birthday")
        if parsed.get("gender"):
            job_seeker_profile.gender = parsed["gender"]
            profile_fields.append("gender")
        if parsed.get("address"):
            job_seeker_profile.contact_address = parsed["address"]
            profile_fields.append("contact_address")
        job_seeker_profile.save(update_fields=profile_fields)

    # Cập nhật Resume
    resume_fields = ["update_at"]
    if parsed.get("title"):
        resume.title = parsed["title"]
        resume_fields.append("title")

    source_payload = resume.source_payload or {}
    source_payload["extracted_from_pdf"] = {
        k: (v.isoformat() if isinstance(v, date) else v)
        for k, v in parsed.items()
    }
    resume.source_payload = source_payload
    resume_fields.append("source_payload")
    resume.save(update_fields=resume_fields)

    return parsed
