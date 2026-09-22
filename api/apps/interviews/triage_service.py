from __future__ import annotations

import logging
from typing import Any

from apps.common.decision_engine.engine import CvTriageEngine, TriageVerdict

logger = logging.getLogger(__name__)


def triage_candidate_application(
    candidate_summary: dict[str, Any],
    job_requirements: dict[str, Any],
) -> dict[str, Any]:
    """
    Sàng lọc nhanh hồ sơ ứng viên đối chiếu với yêu cầu công việc (JD).
    Sử dụng System 1 Decision Engine (CvTriageEngine) theo nguyên lý openJev-verdict-2.0.

    Args:
        candidate_summary: Dict chứa thông tin ứng viên (skills, experience_years, education, title, summary, raw_text).
        job_requirements: Dict chứa yêu cầu công việc (required_skills, optional_skills, min_experience_years, education_level, job_title).

    Returns:
        Dict chứa kết quả sàng lọc tức thì:
            - decision: 'FIT' | 'BORDERLINE' | 'UNFIT'
            - score: float (0.0 - 100.0)
            - confidence: float (0.0 - 1.0)
            - matched_criteria: list[str]
            - missing_criteria: list[str]
            - summary: str
    """
    try:
        verdict: TriageVerdict = CvTriageEngine.triage(
            candidate_summary=candidate_summary or {},
            job_requirements=job_requirements or {},
        )
        return {
            "decision": verdict.decision,
            "score": verdict.score,
            "confidence": verdict.confidence,
            "matched_criteria": verdict.matched_criteria,
            "missing_criteria": verdict.missing_criteria,
            "summary": verdict.summary,
        }
    except Exception as exc:
        logger.error("Lỗi khi thực hiện triage_candidate_application: %s", exc, exc_info=True)
        return {
            "decision": "BORDERLINE",
            "score": 50.0,
            "confidence": 0.50,
            "matched_criteria": [],
            "missing_criteria": ["Lỗi xử lý dữ liệu trong quá trình sàng lọc hồ sơ."],
            "summary": "Không thể hoàn tất sàng lọc tự động do lỗi cấu trúc dữ liệu đầu vào.",
        }
