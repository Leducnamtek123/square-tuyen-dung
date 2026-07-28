import json
from typing import Any, Dict, Mapping

from django.conf import settings
from django.core.cache import cache
from django.db.utils import DatabaseError, OperationalError, ProgrammingError

from .models import SystemSetting


DEFAULT_EMPLOYER_GREETING = (
    "Chào bạn! Tôi là InfoHR AI, trợ lý tuyển dụng của bạn. Tôi có thể giúp gì cho bạn?\n\n"
    "**Bạn có thể hỏi tôi về:**\n"
    "- Tìm kiếm ứng viên tiềm năng\n"
    "- Soạn tin nhắn mời phỏng vấn\n"
    "- Gợi ý mô tả công việc\n"
    "- Thống kê thị trường tuyển dụng"
)

DEFAULT_JOBSEEKER_GREETING = (
    "Chào bạn! Tôi là InfoHR AI, trợ lý tư vấn nghề nghiệp của bạn. Tôi có thể giúp gì cho bạn?\n\n"
    "**Bạn có thể hỏi tôi về:**\n"
    "- Tìm kiếm việc làm phù hợp\n"
    "- Soạn và tối ưu hóa CV\n"
    "- Mẹo trả lời phỏng vấn ấn tượng\n"
    "- Thông tin mức lương thị trường"
)

DEFAULT_EMPLOYER_SUGGESTIONS = json.dumps([
    "Tìm ứng viên cho vị trí thiết kế",
    "Soạn tin mời phỏng vấn",
    "Mức lương thị trường hiện nay"
], ensure_ascii=False)

DEFAULT_JOBSEEKER_SUGGESTIONS = json.dumps([
    "Tìm việc làm vị trí Frontend",
    "Tải mẫu CV tiếng Anh",
    "Cách trả lời phỏng vấn về mức lương"
], ensure_ascii=False)

SYSTEM_SETTING_DEFAULTS: Dict[str, Any] = {
    "maintenanceMode": getattr(settings, "MAINTENANCE_MODE", False),
    "autoApproveJobs": getattr(settings, "AUTO_APPROVE_JOBS", False),
    "emailNotifications": getattr(settings, "EMAIL_NOTIFICATIONS", True),
    "googleApiKey": getattr(settings, "GOOGLE_API_KEY", ""),
    "supportEmail": getattr(settings, "SUPPORT_CONTACT_EMAIL", ""),
    "ttsSpeed": "0.92",
    "interviewQuestionGapSeconds": "2.0",
    "interviewMinimumSilenceSeconds": "1.2",
    "chatbotTitle": "InfoHR AI",
    "chatbotSubtitle": "Trợ lý tuyển dụng thông minh",
    "chatbotEmployerGreeting": DEFAULT_EMPLOYER_GREETING,
    "chatbotJobSeekerGreeting": DEFAULT_JOBSEEKER_GREETING,
    "chatbotEmployerSuggestions": DEFAULT_EMPLOYER_SUGGESTIONS,
    "chatbotJobSeekerSuggestions": DEFAULT_JOBSEEKER_SUGGESTIONS,
    "vieclam24hSharedUsername": getattr(settings, "VIECLAM24H_SHARED_USERNAME", ""),
    "vieclam24hSharedPassword": getattr(settings, "VIECLAM24H_SHARED_PASSWORD", ""),
    "vieclam24hAutoIngestEnabled": True,
    "vieclam24hAutoIngestIntervalHours": "6",
}

BOOLEAN_SYSTEM_SETTINGS = {
    key for key, value in SYSTEM_SETTING_DEFAULTS.items() if isinstance(value, bool)
}


def coerce_setting_value(key: str, value: Any) -> Any:
    default = SYSTEM_SETTING_DEFAULTS[key]
    if isinstance(default, bool):
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            return value.strip().lower() in {"1", "true", "yes", "on"}
        return bool(value)
    if value is None:
        return ""
    return str(value)


def decode_setting_value(key: str, raw_value: Any) -> Any:
    try:
        decoded = json.loads(raw_value)
    except (TypeError, json.JSONDecodeError):
        decoded = raw_value
    return coerce_setting_value(key, decoded)


def load_system_settings() -> Dict[str, Any]:
    data = dict(SYSTEM_SETTING_DEFAULTS)
    try:
        rows = SystemSetting.objects.filter(key__in=SYSTEM_SETTING_DEFAULTS.keys())
        for row in rows:
            data[row.key] = decode_setting_value(row.key, row.value)
    except (DatabaseError, OperationalError, ProgrammingError):
        return data
    return data


def update_system_settings(payload: Mapping[str, Any]) -> Dict[str, Any]:
    for key in SYSTEM_SETTING_DEFAULTS:
        if key not in payload:
            continue
        value = coerce_setting_value(key, payload.get(key))
        SystemSetting.objects.update_or_create(
            key=key,
            defaults={
                "value": json.dumps(value),
                "description": "Admin system setting",
            },
        )

    cache.delete("common_all_config")
    return load_system_settings()


def get_system_setting(key: str, default: Any = None) -> Any:
    if key not in SYSTEM_SETTING_DEFAULTS:
        return default
    return load_system_settings().get(key, default)


def maintenance_mode_enabled() -> bool:
    return bool(get_system_setting("maintenanceMode", False))


def auto_approve_jobs_enabled() -> bool:
    return bool(get_system_setting("autoApproveJobs", False))


def email_notifications_enabled() -> bool:
    return bool(get_system_setting("emailNotifications", True))


def get_support_email() -> str:
    return str(get_system_setting("supportEmail", getattr(settings, "SUPPORT_CONTACT_EMAIL", "")))

def get_interview_question_gap_seconds(default: float = 2.0) -> float:
    try:
        return max(0.0, float(get_system_setting("interviewQuestionGapSeconds", default)))
    except (TypeError, ValueError):
        return default

def get_interview_minimum_silence_seconds(default: float = 1.2) -> float:
    try:
        return max(0.0, float(get_system_setting("interviewMinimumSilenceSeconds", default)))
    except (TypeError, ValueError):
        return default

def get_tts_speed(default: float = 0.92) -> float:
    try:
        return max(0.5, min(2.0, float(get_system_setting("ttsSpeed", default))))
    except (TypeError, ValueError):
        return default
