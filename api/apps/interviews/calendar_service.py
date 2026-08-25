"""
iCalendar (.ics) Service for Interview Sessions
Generates RFC 5545 compliant iCalendar files to easily sync interview events into
Google Calendar, Microsoft Outlook, Apple Calendar, and mobile calendar apps.
"""

import uuid
from datetime import datetime, timedelta
from typing import Optional
from django.utils import timezone


def format_ics_datetime(dt: datetime) -> str:
    """Format datetime in UTC for iCalendar: YYYYMMDDTHHMMSSZ."""
    utc_dt = dt.astimezone(timezone.utc) if dt.tzinfo else dt
    return utc_dt.strftime("%Y%m%dT%H%M%SZ")


def generate_interview_ics(
    session_id: int,
    candidate_name: str,
    candidate_email: str,
    job_title: str,
    company_name: str,
    scheduled_at: datetime,
    duration_minutes: int = 45,
    room_url: Optional[str] = None,
    interviewer_name: Optional[str] = None,
    interviewer_email: Optional[str] = None,
) -> str:
    """
    Generate an iCalendar (.ics) format string for an interview session.
    """
    end_at = scheduled_at + timedelta(minutes=duration_minutes)
    created_at = format_ics_datetime(timezone.now())
    start_str = format_ics_datetime(scheduled_at)
    end_str = format_ics_datetime(end_at)
    uid = f"square-interview-{session_id}-{uuid.uuid4().hex[:8]}@square.vn"

    summary = f"Phỏng vấn vị trí {job_title} - {company_name}"
    description = (
        f"Kính gửi {candidate_name},\\n\\n"
        f"Bạn có lịch phỏng vấn trực tuyến với {company_name} cho vị trí {job_title}.\\n"
        f"Thời gian: {scheduled_at.strftime('%H:%M %d/%m/%Y')}\\n"
        f"Thời lượng: {duration_minutes} phút\\n"
    )
    if room_url:
        description += f"Link phòng phỏng vấn: {room_url}\\n"
    if interviewer_name:
        description += f"Người phỏng vấn: {interviewer_name}\\n"
    description += "\\nTrân trọng,\\nĐội ngũ Tuyển dụng Square"

    location = room_url or "Square AI LiveKit Interview Room"

    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Square Recruitment Platform//AI Interview Calendar//VI",
        "CALSCALE:GREGORIAN",
        "METHOD:REQUEST",
        "BEGIN:VEVENT",
        f"UID:{uid}",
        f"DTSTAMP:{created_at}",
        f"DTSTART:{start_str}",
        f"DTEND:{end_str}",
        f"SUMMARY:{summary}",
        f"DESCRIPTION:{description}",
        f"LOCATION:{location}",
        "STATUS:CONFIRMED",
        "SEQUENCE:0",
    ]

    if interviewer_name and interviewer_email:
        lines.append(f"ORGANIZER;CN={interviewer_name}:mailto:{interviewer_email}")
    elif company_name:
        lines.append(f"ORGANIZER;CN={company_name}:mailto:no-reply@square.vn")

    if candidate_name and candidate_email:
        lines.append(f"ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;CN={candidate_name}:mailto:{candidate_email}")

    lines.extend([
        "BEGIN:VALARM",
        "TRIGGER:-PT15M",
        "ACTION:DISPLAY",
        f"DESCRIPTION:Nhắc nhở: Buổi phỏng vấn {job_title} sắp diễn ra trong 15 phút.",
        "END:VALARM",
        "END:VEVENT",
        "END:VCALENDAR",
    ])

    return "\r\n".join(lines) + "\r\n"
