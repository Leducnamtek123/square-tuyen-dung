from __future__ import annotations

import logging
import re
import time
import unicodedata
from dataclasses import dataclass, field
from typing import Any

logger = logging.getLogger(__name__)


@dataclass
class RouteVerdict:
    tool_name: str
    confidence: float
    arguments: dict[str, Any] = field(default_factory=dict)
    assistant_text: str = ""
    reasoning: str = ""


@dataclass
class TriageVerdict:
    decision: str  # 'FIT', 'BORDERLINE', 'UNFIT'
    score: float  # 0.0 - 100.0
    confidence: float  # 0.0 - 1.0
    matched_criteria: list[str] = field(default_factory=list)
    missing_criteria: list[str] = field(default_factory=list)
    summary: str = ""


@dataclass
class ComplianceVerdict:
    is_compliant: bool
    score: float  # 0.0 - 100.0
    confidence: float  # 0.0 - 1.0
    flags: list[str] = field(default_factory=list)
    suggestions: list[str] = field(default_factory=list)
    summary: str = ""
    recommendation: str = "AUTO_APPROVE"  # 'AUTO_APPROVE', 'FLAG_FOR_REVIEW', 'REJECT'


@dataclass
class TranscriptEvaluationVerdict:
    overall_score: float  # 1.0 - 10.0
    technical_score: float  # 1.0 - 10.0
    communication_score: float  # 1.0 - 10.0
    confidence: float  # 0.0 - 1.0
    summary: str = ""
    strengths: list[str] = field(default_factory=list)
    weaknesses: list[str] = field(default_factory=list)
    detailed_feedback: dict[str, Any] = field(default_factory=dict)



def strip_accents(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value or "")
    stripped = "".join(ch for ch in normalized if not unicodedata.combining(ch))
    return stripped.replace("đ", "d").replace("Đ", "D")


def normalize_text(value: str) -> str:
    normalized = strip_accents(value).lower()
    normalized = re.sub(r"[^a-z0-9]+", " ", normalized)
    return re.sub(r"\s+", " ", normalized).strip()


def _has_word(normalized: str, word: str) -> bool:
    return f" {word} " in f" {normalized} "


class AgentRouterEngine:
    """
    Non-autoregressive System 1 Router cho câu lệnh tuyển dụng tiếng Việt.
    Dựa trên nguyên lý openJev-verdict-2.0:
    - Phản hồi cực nhanh (< 10ms trên CPU) không cần gọi mô hình LLM.
    - Nhận diện chính xác intent điều hướng đến các tool tuyển dụng cốt lõi.
    - Trích xuất tham số cơ bản (query, limit, status, liveOnly, v.v.).
    - Trả về RouteVerdict với calibrated confidence.
    """

    GREETING_TOKENS = {
        "xin chao",
        "chao",
        "chao ban",
        "hello",
        "hi",
        "hey",
        "ban la ai",
        "ban lam duoc gi",
        "tro ly la gi",
        "cam on",
        "cam on ban",
        "thank you",
        "thanks",
        "tam biet",
        "bye",
        "goodbye",
        "ok cam on",
        "chuc mot ngay tot lanh",
    }

    AMBIGUITY_INDICATORS = [
        "tai sao",
        "vi sao",
        "nhu the nao",
        "lam sao",
        "phan tich",
        "so sanh",
        "y kien",
        "tu van",
        "chien luoc",
        "xu huong",
        "giai thich nguyen nhan",
        "giai thich cho",
        "giai thich giup",
        "nguyen nhan",
        "cai nay",
        "lam gi tiep",
        "viec gi can xu ly",
        "nen lam gi",
        "theo ban",
        "danh gia giup",
    ]

    @classmethod
    def route(
        cls,
        user_content: str,
        allowed_tools: set[str] | list[str] | None = None,
    ) -> RouteVerdict:
        raw_text = (user_content or "").strip()
        if not raw_text:
            return RouteVerdict(
                tool_name="respond",
                confidence=0.95,
                arguments={},
                assistant_text="Xin chào! Tôi có thể hỗ trợ gì cho bạn trong công tác tuyển dụng hôm nay?",
                reasoning="Nội dung trống, gửi phản hồi mặc định.",
            )

        norm = normalize_text(raw_text)
        tools = set(allowed_tools) if allowed_tools else None

        # 1. Kiểm tra chào hỏi hoặc tương tác xã giao cơ bản (respond)
        greeting_verdict = cls._match_greeting(raw_text, norm)
        if greeting_verdict and (not tools or greeting_verdict.tool_name in tools):
            return greeting_verdict

        # 2. Kiểm tra dấu hiệu câu hỏi phân tích / mơ hồ (cần fallback System 2 LLM)
        is_ambiguous = cls._check_ambiguity(norm)

        # 3. Intent: Phê duyệt / từ chối tin tuyển dụng (review_job_post - admin)
        if cls._is_review_job_post(norm):
            verdict = cls._build_review_job_post_verdict(raw_text, norm, is_ambiguous)
            if not tools or verdict.tool_name in tools:
                return verdict

        # 4. Intent: Chuyển / cập nhật trạng thái đơn ứng tuyển (update_application_status)
        if cls._is_update_application_status(norm):
            verdict = cls._build_update_application_status_verdict(raw_text, norm, is_ambiguous)
            if not tools or verdict.tool_name in tools:
                return verdict

        # 5. Intent: Xem danh sách đơn ứng tuyển (list_applications)
        if cls._is_list_applications(norm):
            verdict = cls._build_list_applications_verdict(raw_text, norm, is_ambiguous)
            if not tools or verdict.tool_name in tools:
                return verdict

        # 6. Intent: Sàng lọc / tìm kiếm ứng viên (search_candidates)
        if cls._is_search_candidates(norm):
            verdict = cls._build_search_candidates_verdict(raw_text, norm, is_ambiguous)
            if not tools or verdict.tool_name in tools:
                return verdict

        # 7. Intent: Xem danh sách tin tuyển dụng (list_job_posts)
        if cls._is_list_job_posts(norm):
            verdict = cls._build_list_job_posts_verdict(raw_text, norm, is_ambiguous)
            if not tools or verdict.tool_name in tools:
                return verdict

        # 8. Intent: Tra cứu danh sách công ty / doanh nghiệp (list_companies - admin)
        if cls._is_list_companies(norm):
            verdict = cls._build_list_companies_verdict(raw_text, norm, is_ambiguous)
            if not tools or verdict.tool_name in tools:
                return verdict

        # 9. Intent: Ngân hàng câu hỏi (create_question / list_question_groups / list_questions)
        qb_verdict = cls._match_question_bank(raw_text, norm, is_ambiguous, tools)
        if qb_verdict:
            return qb_verdict

        # 10. Intent: Lịch hoặc danh sách phỏng vấn (list_interviews)
        if cls._is_list_interviews(norm):
            verdict = cls._build_list_interviews_verdict(raw_text, norm, is_ambiguous)
            if not tools or verdict.tool_name in tools:
                return verdict

        # 11. Intent: Đánh giá CV với NotebookLM (evaluate_cv_with_notebook)
        if cls._is_evaluate_cv_with_notebook(norm):
            verdict = cls._build_evaluate_cv_with_notebook_verdict(raw_text, norm, is_ambiguous)
            if not tools or verdict.tool_name in tools:
                return verdict

        # 12. Intent: Tiêu chuẩn tuyển dụng, JD, quy định công ty (query_notebook_knowledge)
        if cls._is_notebook_knowledge(norm):
            verdict = cls._build_notebook_verdict(raw_text, norm, is_ambiguous)
            if not tools or verdict.tool_name in tools:
                return verdict


        # 8. Mặc định: Không khớp tool chuyên biệt nào -> Trả về respond với confidence thấp để fallback System 2 LLM
        return RouteVerdict(
            tool_name="respond",
            confidence=0.40 if is_ambiguous else 0.50,
            arguments={},
            assistant_text="",
            reasoning="Không tìm thấy mẫu câu lệnh xác thực chuyên biệt; chuyển giao sang System 2 LLM.",
        )

    @classmethod
    def _check_ambiguity(cls, norm: str) -> bool:
        return any(indicator in norm for indicator in cls.AMBIGUITY_INDICATORS)

    @classmethod
    def _extract_limit(cls, text: str) -> int | None:
        pattern = r"(?:top|lấy|lay|giới hạn|gioi han|khoảng|khoang)?\s*(\d+)\s*(?:ứng viên|ung vien|hồ sơ|ho so|tin|việc|viec|câu hỏi|cau hoi|buổi|buoi|item|kết quả|ket qua|người|nguoi)"
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            try:
                num = int(match.group(1))
                if 1 <= num <= 100:
                    return num
            except (ValueError, IndexError):
                pass
        limit_match = re.search(r"\blimit\s*[:=]?\s*(\d+)\b", text, flags=re.IGNORECASE)
        if limit_match:
            try:
                return int(limit_match.group(1))
            except ValueError:
                pass
        return None

    @classmethod
    def _match_greeting(cls, raw: str, norm: str) -> RouteVerdict | None:
        if norm in cls.GREETING_TOKENS or any(
            norm.startswith(f"{g} ") for g in ("xin chao", "chao ban", "hello", "hi")
        ):
            return RouteVerdict(
                tool_name="respond",
                confidence=0.96,
                arguments={},
                assistant_text="Xin chào! Tôi là trợ lý tuyển dụng AI InfoHR. Tôi có thể hỗ trợ bạn tìm kiếm ứng viên, xem tin tuyển dụng, ngân hàng câu hỏi, lịch phỏng vấn và tra cứu tiêu chuẩn nội bộ.",
                reasoning="Người dùng chào hỏi hoặc hỏi giới thiệu trợ lý.",
            )
        if any(token in norm for token in ("cam on", "thank you", "thanks")):
            return RouteVerdict(
                tool_name="respond",
                confidence=0.95,
                arguments={},
                assistant_text="Rất vui được hỗ trợ bạn! Nếu cần thêm bất kỳ trợ giúp nào về tuyển dụng, bạn cứ nhắn cho tôi nhé.",
                reasoning="Người dùng gửi lời cảm ơn.",
            )
        if any(token in norm for token in ("tam biet", "bye", "goodbye")):
            return RouteVerdict(
                tool_name="respond",
                confidence=0.95,
                arguments={},
                assistant_text="Tạm biệt bạn, chúc bạn một ngày làm việc hiệu quả và thành công!",
                reasoning="Người dùng gửi lời tạm biệt.",
            )
        return None

    @classmethod
    def _is_search_candidates(cls, norm: str) -> bool:
        # Loại trừ nếu là hành động tạo/thêm ứng viên vào danh sách ứng tuyển
        if any(k in norm for k in ("vao danh sach", "them", "dua", "add", "tao", "create", "nhap")):
            return False
        # Loại trừ nếu là tra cứu đơn/hồ sơ đã ứng tuyển vào tin cụ thể
        if any(k in norm for k in ("ung tuyen", "nop don", "da nop", "don ung tuyen", "apply", "don nop")):
            return False
        has_action = any(k in norm for k in ("tim", "loc", "search", "kiem", "xem"))
        has_cand_noun = any(k in norm for k in ("ung vien", "candidate", "ho so", "cv", "resume"))
        is_list_query = "danh sach ung vien" in norm or "danh sach ho so" in norm

        if (has_action and has_cand_noun) or is_list_query:
            if "notebook" in norm or "danh gia cv" in norm or "tieu chuan" in norm:
                return False
            return True
        return False

    @classmethod
    def _build_search_candidates_verdict(cls, raw: str, norm: str, is_ambiguous: bool) -> RouteVerdict:
        confidence = 0.60 if is_ambiguous else 0.94
        arguments: dict[str, Any] = {}

        limit = cls._extract_limit(raw)
        if limit:
            arguments["limit"] = limit

        # Trích xuất keyword tìm kiếm
        query = ""
        patterns = [
            r"(?:ứng viên|ung vien|candidate|hồ sơ|ho so)\s+(?:có kinh nghiệm|kinh nghiệm|skill|kỹ năng|vi trí|vị trí)?\s*(?P<q>[^,.;:\n]+)",
            r"(?:tìm|lọc|search|kiếm)\s+(?:các|những)?\s*(?:ứng viên|ung vien|candidate)?\s*(?P<q>[^,.;:\n]+)",
        ]
        for pat in patterns:
            m = re.search(pat, raw, flags=re.IGNORECASE)
            if m:
                extracted = m.group("q").strip()
                # Làm sạch các từ thừa
                cleaned = re.sub(
                    r"^(?:ứng viên|ung vien|candidate|hồ sơ|ho so|mới nộp|mới|mới nhất)\s*",
                    "",
                    extracted,
                    flags=re.IGNORECASE,
                ).strip()
                if cleaned and len(cleaned) > 1:
                    query = cleaned
                    break

        if not query:
            # Kiểm tra trường hợp như "danh sách ứng viên mới nộp"
            if "moi nop" in norm:
                query = "mới nộp"
            elif "moi nhat" in norm:
                query = "mới nhất"

        if query:
            arguments["query"] = query

        return RouteVerdict(
            tool_name="search_candidates",
            confidence=confidence,
            arguments=arguments,
            assistant_text="Tôi đang tìm kiếm danh sách ứng viên phù hợp với yêu cầu của bạn.",
            reasoning="Phát hiện ý định tìm kiếm/lọc ứng viên (search_candidates).",
        )

    @classmethod
    def _is_list_job_posts(cls, norm: str) -> bool:
        has_job = any(k in norm for k in ("tin tuyen dung", "viec lam", "job post", "cong viec", "job"))
        has_action = any(
            k in norm
            for k in (
                "danh sach",
                "xem",
                "cac",
                "nhung",
                "active",
                "dang mo",
                "dang dang",
                "kiem tra",
                "liet ke",
                "hien co",
            )
        )
        if has_job and (has_action or "job post" in norm):
            return True
        return False

    @classmethod
    def _build_list_job_posts_verdict(cls, raw: str, norm: str, is_ambiguous: bool) -> RouteVerdict:
        confidence = 0.60 if is_ambiguous else 0.94
        arguments: dict[str, Any] = {}

        limit = cls._extract_limit(raw)
        if limit:
            arguments["limit"] = limit

        if any(k in norm for k in ("active", "dang mo", "dang dang", "dang tuyen", "hoat dong")):
            arguments["status"] = "active"
        elif any(k in norm for k in ("da dong", "dong", "closed", "het han")):
            arguments["status"] = "closed"

        # Trích xuất từ khóa vị trí nếu có
        pos_patterns = [
            r"(?:vị trí|vi tri|chức danh|chuc danh|ngành|nganh|về|ve)\s+(?P<q>[^,.;:\n]+)",
            r"(?:tin tuyển dụng|tin tuyen dung|việc làm|viec lam)\s+(?P<q>[^,.;:\n]+)",
        ]
        for pat in pos_patterns:
            m = re.search(pat, raw, flags=re.IGNORECASE)
            if m:
                cand_query = m.group("q").strip()
                cleaned = re.sub(
                    r"^(?:đang mở|active|đang đăng|nào|đang tuyển)\s*", "", cand_query, flags=re.IGNORECASE
                ).strip()
                if cleaned and len(cleaned) > 1:
                    arguments["query"] = cleaned
                    break

        return RouteVerdict(
            tool_name="list_job_posts",
            confidence=confidence,
            arguments=arguments,
            assistant_text="Tôi đang lấy danh sách tin tuyển dụng cho bạn.",
            reasoning="Phát hiện ý định tra cứu danh sách tin tuyển dụng (list_job_posts).",
        )

    @classmethod
    def _match_question_bank(
        cls,
        raw: str,
        norm: str,
        is_ambiguous: bool,
        tools: set[str] | None,
    ) -> RouteVerdict | None:
        has_group = any(k in norm for k in ("bo cau hoi", "nhom cau hoi", "question group", "bo cau hoi tuyen dung"))
        has_question = "cau hoi" in norm or "question" in norm

        if not has_question and not has_group:
            return None

        # 1. Xem danh sách bộ câu hỏi (list_question_groups)
        if has_group and any(k in norm for k in ("xem", "danh sach", "liet ke", "cac", "nhung", "tim", "tra cuu")):
            if not tools or "list_question_groups" in tools:
                arguments: dict[str, Any] = {}
                limit = cls._extract_limit(raw)
                if limit:
                    arguments["limit"] = limit
                return RouteVerdict(
                    tool_name="list_question_groups",
                    confidence=0.55 if is_ambiguous else 0.94,
                    arguments=arguments,
                    assistant_text="Tôi đang tải danh sách các bộ câu hỏi tuyển dụng.",
                    reasoning="Phát hiện ý định xem danh sách bộ câu hỏi (list_question_groups).",
                )

        # 2. Xem danh sách câu hỏi lẻ (list_questions)
        if (
            has_question
            and not has_group
            and any(k in norm for k in ("xem", "danh sach", "ngan hang", "kho cau hoi", "liet ke"))
        ):
            if not tools or "list_questions" in tools:
                arguments = {}
                limit = cls._extract_limit(raw)
                if limit:
                    arguments["limit"] = limit
                return RouteVerdict(
                    tool_name="list_questions",
                    confidence=0.55 if is_ambiguous else 0.91,
                    arguments=arguments,
                    assistant_text="Tôi đang tra cứu danh sách câu hỏi phỏng vấn trong ngân hàng câu hỏi.",
                    reasoning="Phát hiện ý định xem danh sách câu hỏi (list_questions).",
                )

        # 3. Tạo câu hỏi (create_question)
        if has_question and any(k in norm for k in ("tao", "them", "create", "viet")):
            if not tools or "create_question" in tools:
                m = re.search(
                    r"(?:câu hỏi|cau hoi|question)[^:\n]*[:\"“]\s*(?P<text>[^\"”\n]+)[\"”]?", raw, flags=re.IGNORECASE
                )
                if m and len(m.group("text").strip()) > 5:
                    q_text = m.group("text").strip()
                    arguments = {"text": q_text}
                    if any(k in norm for k in ("ky thuat", "technical", "chuyen mon")):
                        arguments["category"] = "technical"
                    elif any(k in norm for k in ("hanh vi", "behavioral")):
                        arguments["category"] = "behavioral"
                    elif any(k in norm for k in ("tinh huong", "situational")):
                        arguments["category"] = "situational"
                    elif any(k in norm for k in ("ky nang mem", "soft skills")):
                        arguments["category"] = "soft_skills"
                    else:
                        arguments["category"] = "general"

                    return RouteVerdict(
                        tool_name="create_question",
                        confidence=0.55 if is_ambiguous else 0.93,
                        arguments=arguments,
                        assistant_text="Tôi sẽ hỗ trợ bạn tạo câu hỏi phỏng vấn mới vào ngân hàng câu hỏi.",
                        reasoning="Phát hiện ý định tạo câu hỏi với nội dung cụ thể (create_question).",
                    )
                else:
                    return RouteVerdict(
                        tool_name="create_question",
                        confidence=0.50,
                        arguments={},
                        assistant_text="",
                        reasoning="Yêu cầu tạo câu hỏi cần LLM sinh nội dung câu hỏi; chuyển sang System 2.",
                    )

        # 4. Tạo nhóm câu hỏi (create_question_group)
        if has_group and any(k in norm for k in ("tao", "them", "create", "lap")):
            return RouteVerdict(
                tool_name="create_question_group",
                confidence=0.50,
                arguments={},
                assistant_text="",
                reasoning="Yêu cầu tạo bộ câu hỏi cần LLM tổng hợp các câu hỏi; chuyển sang System 2.",
            )

        return None

    @classmethod
    def _is_list_interviews(cls, norm: str) -> bool:
        has_interview = any(k in norm for k in ("phong van", "interview"))
        has_action = any(
            k in norm
            for k in ("danh sach", "xem", "lich", "live", "truc tiep", "hom nay", "dang dien ra", "sap toi", "cac buoi")
        )
        return has_interview and has_action

    @classmethod
    def _build_list_interviews_verdict(cls, raw: str, norm: str, is_ambiguous: bool) -> RouteVerdict:
        confidence = 0.60 if is_ambiguous else 0.94
        arguments: dict[str, Any] = {}

        limit = cls._extract_limit(raw)
        if limit:
            arguments["limit"] = limit

        if any(k in norm for k in ("live", "truc tiep", "dang dien ra")):
            arguments["liveOnly"] = True

        if "hom nay" in norm:
            arguments["query"] = "hôm nay"

        return RouteVerdict(
            tool_name="list_interviews",
            confidence=confidence,
            arguments=arguments,
            assistant_text="Tôi đang kiểm tra lịch và danh sách các buổi phỏng vấn cho bạn.",
            reasoning="Phát hiện ý định tra cứu lịch/danh sách phỏng vấn (list_interviews).",
        )

    @classmethod
    def _is_notebook_knowledge(cls, norm: str) -> bool:
        keywords = (
            "notebooklm",
            "notebook",
            "tieu chuan tuyen dung",
            "tieu chuan cong ty",
            "bo chuan cong ty",
            "quy dinh cong ty",
            "quy che tuyen dung",
            "mo ta cong viec",
            "mo ta vi tri",
            "chuan nhan su",
            "jd",
            "kpi tuyen dung",
            "tieu chi danh gia",
        )
        return any(k in norm for k in keywords)

    @classmethod
    def _build_notebook_verdict(cls, raw: str, norm: str, is_ambiguous: bool) -> RouteVerdict:
        # Đối với NotebookLM, các câu hỏi về chuẩn công ty / JD thường được ưu tiên query
        confidence = 0.92 if not is_ambiguous else 0.86
        return RouteVerdict(
            tool_name="query_notebook_knowledge",
            confidence=confidence,
            arguments={"query": raw},
            assistant_text="Tôi đang tra cứu tiêu chuẩn tuyển dụng và tài liệu trong kho tri thức NotebookLM.",
            reasoning="Phát hiện yêu cầu tra cứu tiêu chuẩn công ty/JD qua NotebookLM (query_notebook_knowledge).",
        )

    @classmethod
    def _is_review_job_post(cls, norm: str) -> bool:
        has_action = any(k in norm for k in ("duyet", "phe duyet", "tu choi", "khong duyet", "approve", "reject"))
        has_job = any(k in norm for k in ("tin tuyen dung", "tin", "job post", "bai dang"))
        has_id = bool(re.search(r"\b\d+\b", norm))
        return has_action and has_job and has_id

    @classmethod
    def _build_review_job_post_verdict(cls, raw: str, norm: str, is_ambiguous: bool) -> RouteVerdict:
        confidence = 0.60 if is_ambiguous else 0.95
        action = "approve" if any(k in norm for k in ("duyet", "phe duyet", "approve")) else "reject"

        job_id_match = re.search(r"(?:tin|job\s*post|id|bai)\s*[:#]?\s*(\d+)", raw, re.IGNORECASE)
        if not job_id_match:
            job_id_match = re.search(r"\b(\d+)\b", raw)

        job_post_id = int(job_id_match.group(1)) if job_id_match else None
        arguments: dict[str, Any] = {"action": action}
        if job_post_id:
            arguments["jobPostId"] = job_post_id

        text_action = "duyệt" if action == "approve" else "từ chối duyệt"
        return RouteVerdict(
            tool_name="review_job_post",
            confidence=confidence if job_post_id else 0.85,
            arguments=arguments,
            assistant_text=f"Tôi đang thực hiện {text_action} tin tuyển dụng #{job_post_id or ''} cho bạn.",
            reasoning="Phát hiện lệnh quản trị phê duyệt / từ chối tin tuyển dụng (review_job_post).",
        )

    @classmethod
    def _is_update_application_status(cls, norm: str) -> bool:
        has_status_action = any(
            k in norm for k in (
                "chuyen trang thai", "doi trang thai", "cap nhat trang thai",
                "danh dau ung vien", "danh rot", "tu choi ho so", "duyet phong van ho so",
                "danh dau trung tuyen", "danh dau phong van", "danh dau da lien he"
            )
        )
        has_id = bool(re.search(r"\b\d+\b", norm))
        return has_status_action and (has_id or any(k in norm for k in ("ung vien", "ho so", "don", "application")))

    @classmethod
    def _build_update_application_status_verdict(cls, raw: str, norm: str, is_ambiguous: bool) -> RouteVerdict:
        confidence = 0.60 if is_ambiguous else 0.94
        app_id_match = re.search(r"(?:ho\s*so|ung\s*vien|don|candidate|application|id)\s*[:#]?\s*(\d+)", raw, re.IGNORECASE)
        if not app_id_match:
            app_id_match = re.search(r"\b(\d+)\b", raw)
        application_id = int(app_id_match.group(1)) if app_id_match else None

        # Xác định trạng thái số (2=contacted, 3=tested, 4=interviewed, 5=hired, 6=not_selected)
        status = 4
        if any(k in norm for k in ("trung tuyen", "tuyen dung", "nhan viec", "hired", "pass", "trung")):
            status = 5
        elif any(k in norm for k in ("tu choi", "rot", "danh rot", "loai", "khong dat", "not selected", "fail")):
            status = 6
        elif any(k in norm for k in ("test", "kiem tra", "tested", "lam test")):
            status = 3
        elif any(k in norm for k in ("lien he", "da lien he", "contacted")):
            status = 2
        elif any(k in norm for k in ("phong van", "interviewed", "hen phong van")):
            status = 4

        arguments: dict[str, Any] = {"status": status}
        if application_id:
            arguments["applicationId"] = application_id

        return RouteVerdict(
            tool_name="update_application_status",
            confidence=confidence if application_id else 0.85,
            arguments=arguments,
            assistant_text=f"Tôi đang cập nhật trạng thái đơn ứng tuyển #{application_id or ''} sang trạng thái mới.",
            reasoning="Phát hiện lệnh chuyển trạng thái đơn ứng tuyển (update_application_status).",
        )

    @classmethod
    def _is_list_applications(cls, norm: str) -> bool:
        return any(
            k in norm for k in (
                "ung tuyen", "don ung tuyen", "ho so ung tuyen", "ho so nop", "da nop don",
                "apply", "don nop", "danh sach ung tuyen", "ho so apply", "danh sach nop", "ai nop"
            )
        )

    @classmethod
    def _build_list_applications_verdict(cls, raw: str, norm: str, is_ambiguous: bool) -> RouteVerdict:
        confidence = 0.60 if is_ambiguous else 0.94
        arguments: dict[str, Any] = {}

        limit = cls._extract_limit(raw)
        if limit:
            arguments["limit"] = limit

        job_match = re.search(r"(?:tin|job\s*post|vi\s*tri|id)\s*[:#]?\s*(\d+)", raw, re.IGNORECASE)
        if job_match:
            arguments["jobPostId"] = int(job_match.group(1))

        if any(k in norm for k in ("trung tuyen", "hired")):
            arguments["status"] = 5
        elif any(k in norm for k in ("phong van", "interview")):
            arguments["status"] = 4
        elif any(k in norm for k in ("tu choi", "rot", "not selected")):
            arguments["status"] = 6
        elif any(k in norm for k in ("lien he", "contacted")):
            arguments["status"] = 2
        elif any(k in norm for k in ("test",)):
            arguments["status"] = 3

        if "jobPostId" not in arguments:
            q_match = re.search(r"(?:tin\s+tuyển\s+dụng|tin\s+tuyen\s+dung|tin|vị\s+trí|vi\s+tri)\s+([^,.;:\n]+)", raw, re.IGNORECASE)
            if q_match:
                extracted_q = q_match.group(1).strip()
                if extracted_q:
                    arguments["query"] = extracted_q

        return RouteVerdict(
            tool_name="list_applications",
            confidence=confidence,
            arguments=arguments,
            assistant_text="Tôi đang tra cứu danh sách các hồ sơ ứng tuyển theo yêu cầu của bạn.",
            reasoning="Phát hiện ý định tra cứu danh sách đơn ứng tuyển (list_applications).",
        )

    @classmethod
    def _is_list_companies(cls, norm: str) -> bool:
        if any(k in norm for k in ("tieu chuan cong ty", "quy che cong ty", "quy dinh cong ty")):
            return False
        has_company = any(k in norm for k in ("cong ty", "doanh nghiep", "nha tuyen dung", "company", "companies"))
        has_action = any(
            k in norm for k in (
                "danh sach", "tim", "kiem", "tra cuu", "xem", "cho duyet",
                "chua xac minh", "da xac minh", "xac thuc", "cac"
            )
        )
        return has_company and has_action

    @classmethod
    def _build_list_companies_verdict(cls, raw: str, norm: str, is_ambiguous: bool) -> RouteVerdict:
        confidence = 0.60 if is_ambiguous else 0.93
        arguments: dict[str, Any] = {}

        limit = cls._extract_limit(raw)
        if limit:
            arguments["limit"] = limit

        if any(k in norm for k in ("chua xac minh", "cho duyet", "chua xac thuc")):
            arguments["verified"] = False
        elif any(k in norm for k in ("da xac minh", "da xac thuc", "verified")):
            arguments["verified"] = True

        pat = r"(?:công ty|doanh nghiệp|cong ty|doanh nghiep|company)\s+([A-Za-z0-9\s\.\-]+)"
        match = re.search(pat, raw, re.IGNORECASE)
        if match:
            candidate_q = match.group(1).strip()
            if candidate_q.lower() not in ("chờ duyệt", "chua xac minh", "da xac minh", "mới", "nào"):
                arguments["query"] = candidate_q

        return RouteVerdict(
            tool_name="list_companies",
            confidence=confidence,
            arguments=arguments,
            assistant_text="Tôi đang kiểm tra danh sách doanh nghiệp trong hệ thống cho bạn.",
            reasoning="Phát hiện ý định tra cứu thông tin doanh nghiệp (list_companies).",
        )

    @classmethod
    def _is_evaluate_cv_with_notebook(cls, norm: str) -> bool:
        has_cv = any(k in norm for k in ("cv", "ho so", "resume"))
        has_eval = any(k in norm for k in ("danh gia", "cham diem", "so khop", "kiem tra", "evaluate"))
        has_notebook = any(k in norm for k in ("notebook", "notebooklm", "kho tri thuc"))
        return has_cv and has_eval and has_notebook

    @classmethod
    def _build_evaluate_cv_with_notebook_verdict(cls, raw: str, norm: str, is_ambiguous: bool) -> RouteVerdict:
        return RouteVerdict(
            tool_name="evaluate_cv_with_notebook",
            confidence=0.92 if not is_ambiguous else 0.85,
            arguments={"cvContent": raw},
            assistant_text="Tôi đang tiến hành đối chiếu đánh giá hồ sơ CV theo tiêu chuẩn NotebookLM.",
            reasoning="Phát hiện yêu cầu đánh giá CV đối chiếu tiêu chuẩn NotebookLM (evaluate_cv_with_notebook).",
        )



class CvTriageEngine:
    """
    Sub-millisecond System 1 CV Triage Engine.
    Dựa trên nguyên lý openJev-verdict-2.0:
    - Phân tích đối sánh nhanh tóm tắt CV ứng viên với yêu cầu công việc (JD).
    - Trả về TriageVerdict với calibrated confidence.
    """

    @classmethod
    def triage(
        cls,
        candidate_summary: dict[str, Any],
        job_requirements: dict[str, Any],
    ) -> TriageVerdict:
        start_time = time.perf_counter()

        cand = candidate_summary or {}
        job = job_requirements or {}

        # 1. Trích xuất kỹ năng bắt buộc và kỹ năng bổ trợ từ JD
        required_skills = cls._extract_skill_list(job.get("required_skills") or job.get("skills"))
        optional_skills = cls._extract_skill_list(job.get("optional_skills"))
        min_exp = cls._extract_float(job.get("min_experience_years") or job.get("experience_years"))
        required_edu = cls._clean_text(job.get("education_level") or job.get("education"))
        job_title = cls._clean_text(job.get("job_title") or job.get("title"))

        # 2. Trích xuất thông tin từ CV ứng viên
        cand_skills = cls._extract_skill_list(cand.get("skills"))
        cand_exp = cls._extract_float(cand.get("experience_years"))
        cand_edu = cls._clean_text(cand.get("education"))
        cand_title = cls._clean_text(cand.get("title") or cand.get("current_role"))
        cand_full_text = " ".join(
            [
                cls._clean_text(cand.get("summary")),
                cls._clean_text(cand.get("raw_text")),
                " ".join(cand_skills),
                cand_title,
            ]
        ).lower()

        matched_criteria: list[str] = []
        missing_criteria: list[str] = []

        # --- A. Đánh giá kỹ năng bắt buộc (Tối đa 45 điểm) ---
        skill_score = 0.0
        matched_req: list[str] = []
        missing_req: list[str] = []

        if required_skills:
            for skill in required_skills:
                norm_skill = normalize_text(skill)
                if cls._skill_matches(norm_skill, cand_skills, cand_full_text):
                    matched_req.append(skill)
                else:
                    missing_req.append(skill)

            skill_score += (len(matched_req) / len(required_skills)) * 45.0
            if matched_req:
                matched_criteria.append(
                    f"Kỹ năng bắt buộc đáp ứng ({len(matched_req)}/{len(required_skills)}): {', '.join(matched_req)}"
                )
            if missing_req:
                missing_criteria.append(
                    f"Thiếu kỹ năng bắt buộc ({len(missing_req)}/{len(required_skills)}): {', '.join(missing_req)}"
                )
        else:
            # Không yêu cầu kỹ năng cụ thể
            skill_score += 45.0
            matched_criteria.append("Không có yêu cầu bắt buộc kỹ năng cụ thể.")

        # --- B. Đánh giá kỹ năng bổ trợ (Tối đa 15 điểm) ---
        opt_score = 0.0
        matched_opt: list[str] = []
        if optional_skills:
            for skill in optional_skills:
                norm_skill = normalize_text(skill)
                if cls._skill_matches(norm_skill, cand_skills, cand_full_text):
                    matched_opt.append(skill)
            opt_score = (len(matched_opt) / len(optional_skills)) * 15.0
            if matched_opt:
                matched_criteria.append(
                    f"Kỹ năng bổ trợ đáp ứng ({len(matched_opt)}/{len(optional_skills)}): {', '.join(matched_opt)}"
                )
        else:
            opt_score = 15.0

        # --- C. Đánh giá kinh nghiệm (Tối đa 30 điểm) ---
        exp_score = 0.0
        if min_exp is not None and min_exp > 0:
            if cand_exp is not None:
                if cand_exp >= min_exp:
                    exp_score = 30.0
                    matched_criteria.append(
                        f"Kinh nghiệm làm việc đạt yêu cầu: {cand_exp:g} năm (yêu cầu: {min_exp:g} năm)"
                    )
                elif cand_exp >= min_exp * 0.65:
                    exp_score = 20.0
                    missing_criteria.append(
                        f"Kinh nghiệm gần đạt: {cand_exp:g} năm (yêu cầu: {min_exp:g} năm, đạt {int(cand_exp / min_exp * 100)}%)"
                    )
                elif cand_exp >= min_exp * 0.4:
                    exp_score = 10.0
                    missing_criteria.append(f"Kinh nghiệm còn thiếu: {cand_exp:g} năm (yêu cầu: {min_exp:g} năm)")
                else:
                    exp_score = 0.0
                    missing_criteria.append(
                        f"Kinh nghiệm dưới mức tối thiểu: {cand_exp:g} năm so với {min_exp:g} năm yêu cầu"
                    )
            else:
                exp_score = 10.0
                missing_criteria.append(f"Không rõ số năm kinh nghiệm (yêu cầu: {min_exp:g} năm)")
        else:
            exp_score = 30.0
            if cand_exp is not None:
                matched_criteria.append(f"Kinh nghiệm ghi nhận: {cand_exp:g} năm (JD không yêu cầu tối thiểu)")

        # --- D. Đánh giá học vấn & Chức danh (Tối đa 10 điểm) ---
        edu_score = 0.0
        if required_edu:
            norm_req_edu = normalize_text(required_edu)
            if norm_req_edu in normalize_text(cand_edu) or norm_req_edu in cand_full_text:
                edu_score += 6.0
                matched_criteria.append(f"Trình độ học vấn phù hợp: {cand_edu or required_edu}")
            elif cand_edu:
                edu_score += 3.0
                missing_criteria.append(
                    f"Chưa đạt đúng chuẩn học vấn yêu cầu ({required_edu}), ứng viên có: {cand_edu}"
                )
            else:
                missing_criteria.append(f"Chưa có thông tin bằng cấp/học vấn yêu cầu: {required_edu}")
        else:
            edu_score += 6.0

        if job_title and cand_title:
            if normalize_text(job_title) in normalize_text(cand_title) or any(
                w in normalize_text(cand_title) for w in normalize_text(job_title).split() if len(w) > 3
            ):
                edu_score += 4.0
                matched_criteria.append(f"Chức danh liên quan vị trí ứng tuyển: {cand_title}")
            else:
                edu_score += 2.0
        else:
            edu_score += 4.0

        # Tổng điểm
        total_score = round(min(100.0, max(0.0, skill_score + opt_score + exp_score + edu_score)), 1)

        # Phân loại quyết định
        if total_score >= 75.0:
            decision = "FIT"
        elif total_score >= 50.0:
            decision = "BORDERLINE"
        else:
            decision = "UNFIT"

        # Hiệu chuẩn confidence
        confidence = cls._calibrate_confidence(required_skills, cand_skills, min_exp, cand_exp)

        # Tạo summary tiếng Việt
        position_name = job_title or "vị trí tuyển dụng"
        if decision == "FIT":
            summary = (
                f"Ứng viên đạt mức PHÙ HỢP (FIT) với {total_score}/100 điểm cho {position_name}. "
                f"Đáp ứng {len(matched_req)}/{len(required_skills)} kỹ năng cốt lõi và đạt chuẩn kinh nghiệm."
            )
        elif decision == "BORDERLINE":
            summary = (
                f"Ứng viên đạt mức TIỀM NĂNG (BORDERLINE) với {total_score}/100 điểm cho {position_name}. "
                f"Cần phỏng vấn thêm để kiểm tra các tiêu chí còn thiếu."
            )
        else:
            summary = (
                f"Ứng viên KHÔNG PHÙ HỢP (UNFIT) với {total_score}/100 điểm cho {position_name}. "
                f"Khoảng cách kỹ năng và kinh nghiệm vượt quá ngưỡng chấp nhận."
            )

        elapsed_ms = (time.perf_counter() - start_time) * 1000
        logger.debug("CvTriageEngine completed in %.2f ms with score %.1f (%s)", elapsed_ms, total_score, decision)

        return TriageVerdict(
            decision=decision,
            score=total_score,
            confidence=confidence,
            matched_criteria=matched_criteria,
            missing_criteria=missing_criteria,
            summary=summary,
        )

    @classmethod
    def _skill_matches(cls, norm_skill: str, cand_skills: list[str], full_text: str) -> bool:
        for cs in cand_skills:
            norm_cs = normalize_text(cs)
            if norm_skill in norm_cs or norm_cs in norm_skill:
                return True
        return norm_skill in full_text

    @classmethod
    def _calibrate_confidence(
        cls,
        req_skills: list[str],
        cand_skills: list[str],
        min_exp: float | None,
        cand_exp: float | None,
    ) -> float:
        conf = 0.96
        if not req_skills:
            conf -= 0.12
        if not cand_skills:
            conf -= 0.10
        if min_exp is None or cand_exp is None:
            conf -= 0.08
        return round(max(0.50, min(0.98, conf)), 2)

    @classmethod
    def _extract_skill_list(cls, value: Any) -> list[str]:
        if not value:
            return []
        if isinstance(value, (list, set, tuple)):
            return [str(v).strip() for v in value if str(v).strip()]
        if isinstance(value, str):
            return [part.strip() for part in re.split(r"[,;\n]+", value) if part.strip()]
        return []

    @classmethod
    def _extract_float(cls, value: Any) -> float | None:
        if value is None:
            return None
        try:
            return float(value)
        except (ValueError, TypeError):
            if isinstance(value, str):
                m = re.search(r"(\d+(?:\.\d+)?)", value)
                if m:
                    return float(m.group(1))
            return None

    @classmethod
    def _clean_text(cls, value: Any) -> str:
        if not value:
            return ""
        return str(value).strip()


class JobComplianceEngine:
    """
    Sub-millisecond System 1 Job Post Compliance & Anti-Scam Guardrail Engine.
    Dựa trên nguyên lý openJev-verdict-2.0:
    - Kiểm duyệt tuân thủ Bộ Luật Lao Động 2019 (chống phân biệt đối xử giới tính, tuổi tác, ngoại hình).
    - Phát hiện sớm hành vi lừa đảo/scam/đa cấp (yêu cầu đóng cọc, nạp tiền, like dạo, kéo về group ngầm).
    - Đánh giá chất lượng và độ hoàn thiện JD (tiêu đề, nhiệm vụ, yêu cầu, quyền lợi, lương).
    - Trả về ComplianceVerdict với latency < 1ms trên CPU.
    """

    DISCRIMINATORY_PATTERNS = [
        (
            r"\b(chỉ tuyển nam|chi tuyen nam|chỉ nhận nam|chi nhan nam|yêu cầu nam|yeu cau nam)\b",
            "Phân biệt giới tính: Yêu cầu bắt buộc tuyển nam không thuộc trường hợp đặc thù được pháp luật cho phép.",
        ),
        (
            r"\b(chỉ tuyển nữ|chi tuyen nu|chỉ nhận nữ|chi nhan nu|yêu cầu nữ|yeu cau nu)\b",
            "Phân biệt giới tính: Yêu cầu bắt buộc tuyển nữ không thuộc trường hợp đặc thù được pháp luật cho phép.",
        ),
        (
            r"\b(chưa lập gia đình|chua lap gia dinh|độc thân|doc than|không có con nhỏ|khong co con nho|không mang thai|khong mang thai)\b",
            "Phân biệt đối xử về tình trạng hôn nhân và gia đình theo Luật Lao động.",
        ),
        (
            r"\b(ngoại hình đẹp|ngoai hinh dep|cao trên 1m|cao tren 1m|da trắng|da trang|ưa nhìn|ua nhin)\b",
            "Yêu cầu về ngoại hình không phù hợp hoặc không cần thiết với vị trí chuyên môn.",
        ),
    ]

    SCAM_PATTERNS = [
        (
            r"\b(đặt cọc|dat coc|cọc tiền|coc tien|nạp tiền|nap tien|phí giữ chân|phi giu chan|phí đồng phục|phi dong phuc|đóng phí|dong phi)\b",
            "Cảnh báo lừa đảo: Yêu cầu ứng viên nộp phí/đặt cọc trước khi nhận việc.",
        ),
        (
            r"\b(việc nhẹ lương cao|viec nhe luong cao|like dạo|like dao|xem video kiếm tiền|xem video kiem tien|nhập captcha|nhap captcha|gõ văn bản 500k|go van ban 500k)\b",
            "Dấu hiệu gian lận/scam: Mẫu câu dụ dỗ việc nhẹ lương cao / làm nhiệm vụ trực tuyến.",
        ),
        (
            r"\b(inbox telegram|ib tele|add telegram|zalo kín|nhóm kín telegram|inbox zalo riêng)\b",
            "Cảnh báo chuyển hướng tuyển dụng sang kênh ngầm/kín (Telegram/Zalo không chính thống).",
        ),
    ]

    @classmethod
    def check_compliance(cls, job_data: dict[str, Any]) -> ComplianceVerdict:
        start_time = time.perf_counter()
        job = job_data or {}

        title = normalize_text(cls._clean(job.get("job_name") or job.get("title")))
        desc = normalize_text(cls._clean(job.get("description") or job.get("job_description")))
        reqs = normalize_text(cls._clean(job.get("requirements") or job.get("skills")))
        benefits = normalize_text(cls._clean(job.get("benefits")))

        full_content = f"{title} {desc} {reqs} {benefits}".strip()

        flags: list[str] = []
        suggestions: list[str] = []
        score = 100.0

        # 1. Kiểm tra lừa đảo/scam (Mức độ nghiêm trọng cao: trừ 40-80 điểm)
        is_scam = False
        for pattern, msg in cls.SCAM_PATTERNS:
            if re.search(pattern, full_content, re.IGNORECASE):
                flags.append(f"SCAM_ALERT: {msg}")
                score -= 40.0
                is_scam = True

        # 2. Kiểm tra phân biệt đối xử (Mức độ trung bình: trừ 25 điểm mỗi lỗi)
        for pattern, msg in cls.DISCRIMINATORY_PATTERNS:
            if re.search(pattern, full_content, re.IGNORECASE):
                flags.append(f"DISCRIMINATION: {msg}")
                score -= 25.0
                suggestions.append("Điều chỉnh tiêu chí tuyển dụng để tuân thủ Điều 8 Bộ Luật Lao Động 2019.")

        # 3. Đánh giá chất lượng và độ hoàn thiện JD
        word_count = len(full_content.split())
        if word_count < 30:
            flags.append("LOW_QUALITY_JD: Mô tả công việc quá ngắn, thiếu thông tin chi tiết.")
            score -= 20.0
            suggestions.append("Bổ sung thêm mô tả nhiệm vụ công việc, yêu cầu kỹ năng và quyền lợi cụ thể.")
        elif word_count < 70:
            score -= 10.0
            suggestions.append("Nên làm rõ thêm chi tiết về chế độ đãi ngộ và môi trường làm việc.")

        # Kiểm tra mức lương
        sal_min = job.get("salary_min")
        sal_max = job.get("salary_max")
        if (sal_min is None or sal_min == 0) and (sal_max is None or sal_max == 0):
            suggestions.append("Khuyến khích công khai dải lương minh bạch để tăng 40% tỷ lệ ứng tuyển chất lượng.")
        elif sal_min and sal_max and float(sal_min) > float(sal_max):
            flags.append("INVALID_SALARY: Mức lương tối thiểu lớn hơn mức lương tối đa.")
            score -= 15.0

        score = max(0.0, min(100.0, score))
        is_compliant = score >= 60.0 and not is_scam

        if score >= 85.0 and not flags:
            recommendation = "AUTO_APPROVE"
            summary = "Tin tuyển dụng tuân thủ pháp luật và đạt chuẩn chất lượng cao."
        elif score >= 60.0 and not is_scam:
            recommendation = "FLAG_FOR_REVIEW"
            summary = "Tin tuyển dụng cơ bản đạt yêu cầu nhưng có một số điểm cần lưu ý trước khi xuất bản."
        else:
            recommendation = "REJECT"
            summary = "Tin tuyển dụng vi phạm quy chuẩn tuân thủ pháp luật hoặc có dấu hiệu rủi ro cao."

        confidence = 0.98 if is_scam else (0.95 if score >= 85 else 0.88)
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        logger.debug("JobComplianceEngine completed in %.2f ms (score=%.1f, rec=%s)", elapsed_ms, score, recommendation)

        return ComplianceVerdict(
            is_compliant=is_compliant,
            score=round(score, 1),
            confidence=confidence,
            flags=flags,
            suggestions=suggestions,
            summary=summary,
            recommendation=recommendation,
        )

    @classmethod
    def _clean(cls, val: Any) -> str:
        return str(val or "").strip()


class TranscriptEvaluationEngine:
    """
    Sub-millisecond System 1 Interview Transcript Evaluation Engine.
    Dựa trên nguyên lý openJev-verdict-2.0:
    - Phân tích thống kê định lượng lượt hội thoại ứng viên (tổng từ, số câu thực chất, độ dài).
    - So khớp từ khóa kỹ thuật & chuyên môn đối chiếu với JD và rubric tiêu chí.
    - Cung cấp kết quả đánh giá dự phòng tin cậy và có cơ sở khoa học khi LLM gặp sự cố.
    - Thời gian phản hồi < 2ms trên CPU.
    """

    CORE_TECH_TERMS = {
        "python", "django", "fastapi", "flask", "react", "nextjs", "vue", "angular",
        "typescript", "javascript", "nodejs", "sql", "mysql", "postgresql", "mongodb",
        "redis", "elasticsearch", "docker", "kubernetes", "ci/cd", "git", "aws", "gcp",
        "azure", "linux", "rest", "graphql", "microservices", "unit test", "clean architecture",
        "solid", "oop", "agile", "scrum", "devops", "kafka", "rabbitmq", "celery",
    }

    SOFT_SKILL_INDICATORS = {
        "phối hợp", "giao tiếp", "lắng nghe", "giải quyết vấn đề", "làm việc nhóm",
        "chủ động", "trách nhiệm", "học hỏi", "thích nghi", "quản lý thời gian",
        "thuyết trình", "báo cáo", "chia sẻ", "thảo luận", "đề xuất",
    }

    @classmethod
    def evaluate(
        cls,
        transcripts: list[dict[str, Any]],
        job_context: dict[str, Any] | None = None,
    ) -> TranscriptEvaluationVerdict:
        start_time = time.perf_counter()
        context = job_context or {}

        # 1. Trích xuất câu trả lời của ứng viên
        cand_turns = [
            t for t in transcripts
            if (t.get("speaker_role") or "").lower() in ("candidate", "jobseeker", "user")
        ]

        if not cand_turns:
            return TranscriptEvaluationVerdict(
                overall_score=1.0,
                technical_score=1.0,
                communication_score=1.0,
                confidence=0.99,
                summary="Không có dữ liệu câu trả lời nào từ ứng viên trong phiên phỏng vấn.",
                strengths=[],
                weaknesses=["Ứng viên không phát biểu hoặc rời phòng phỏng vấn trước khi trả lời."],
                detailed_feedback={"question_performance": [], "soft_skills": {"confidence": 1, "clarity": 1, "tone": "chưa ghi nhận"}, "cultural_fit": "Chưa đủ dữ liệu đánh giá."},
            )

        # 2. Phân tích định lượng câu trả lời
        total_words = 0
        substantive_count = 0
        shallow_count = 0
        all_text_list = []
        turn_performances = []

        for idx, turn in enumerate(cand_turns):
            text = (turn.get("content") or "").strip()
            all_text_list.append(text)
            words = text.split()
            w_len = len(words)
            total_words += w_len

            norm_turn = normalize_text(text)
            is_shallow = w_len < 6 or any(
                p in norm_turn for p in ("khong biet", "chua ro", "bo qua", "khong ro", "chua tim hieu", "chua lam")
            )

            if is_shallow:
                shallow_count += 1
                turn_performances.append({
                    "question": f"Lượt phỏng vấn #{idx + 1}",
                    "feedback": "Câu trả lời ngắn hoặc chưa đi sâu vào chi tiết.",
                    "score": 4.0,
                })
            else:
                substantive_count += 1
                turn_performances.append({
                    "question": f"Lượt phỏng vấn #{idx + 1}",
                    "feedback": "Ứng viên diễn đạt rõ ràng, có dẫn chứng và nội dung thực chất.",
                    "score": 7.5,
                })

        avg_words_per_turn = total_words / max(1, len(cand_turns))
        full_cand_text = " ".join(all_text_list).lower()
        norm_full_cand = normalize_text(full_cand_text)

        # 3. Phân tích từ khóa kỹ thuật đối chiếu với JD
        job_skills = context.get("skills") or context.get("required_skills") or []
        if isinstance(job_skills, str):
            target_skills = {normalize_text(s) for s in re.split(r"[,;\n]+", job_skills) if s.strip()}
        else:
            target_skills = {normalize_text(str(s)) for s in job_skills if str(s).strip()}

        all_target_skills = target_skills | cls.CORE_TECH_TERMS
        matched_tech = [skill for skill in all_target_skills if f" {skill} " in f" {norm_full_cand} " or skill in norm_full_cand]

        # 4. Phân tích kỹ năng mềm
        matched_soft = [soft for soft in cls.SOFT_SKILL_INDICATORS if soft in norm_full_cand]

        # 5. Tính điểm chuẩn hóa (scale 1.0 - 10.0)
        comm_base = 5.0
        if avg_words_per_turn >= 25:
            comm_base += 2.0
        elif avg_words_per_turn >= 12:
            comm_base += 1.0
        else:
            comm_base -= 1.0

        substantive_ratio = substantive_count / max(1, len(cand_turns))
        comm_base += (substantive_ratio * 2.0)
        if matched_soft:
            comm_base += min(1.0, len(matched_soft) * 0.3)
        communication_score = round(max(1.0, min(10.0, comm_base)), 1)

        tech_base = 4.0
        if matched_tech:
            tech_base += min(4.5, len(matched_tech) * 0.7)
        if substantive_ratio >= 0.7:
            tech_base += 1.5
        elif substantive_ratio <= 0.3:
            tech_base -= 1.5
        technical_score = round(max(1.0, min(10.0, tech_base)), 1)

        overall_score = round(technical_score * 0.6 + communication_score * 0.4, 1)

        # 6. Tổng hợp điểm mạnh / điểm cần cải thiện
        strengths: list[str] = []
        if matched_tech:
            strengths.append(f"Thể hiện kiến thức về các công nghệ/chuyên môn: {', '.join(matched_tech[:5])}.")
        if substantive_ratio >= 0.7:
            strengths.append(f"Phản xạ đĩnh đạc, {substantive_count}/{len(cand_turns)} câu trả lời có chiều sâu chi tiết.")
        if matched_soft:
            strengths.append(f"Tư duy làm việc tích cực, thể hiện kỹ năng: {', '.join(matched_soft[:3])}.")

        weaknesses: list[str] = []
        if shallow_count > 0:
            weaknesses.append(f"Có {shallow_count} câu trả lời còn ngắn gọn hoặc cần đào sâu thêm ví dụ thực tế.")
        if not matched_tech:
            weaknesses.append("Chưa nhắc nhiều đến các từ khóa kỹ thuật chuyên sâu theo yêu cầu vị trí.")
        if avg_words_per_turn < 15:
            weaknesses.append("Độ dài trung bình các câu trả lời còn khiêm tốn, nên chủ động chia sẻ chi tiết hơn.")

        summary = (
            f"Ứng viên hoàn thành {len(cand_turns)} lượt trả lời ({total_words} từ). "
            f"Thể hiện năng lực chuyên môn đạt {technical_score}/10 và kỹ năng giao tiếp đạt {communication_score}/10."
        )

        elapsed_ms = (time.perf_counter() - start_time) * 1000
        logger.debug("TranscriptEvaluationEngine completed in %.2f ms (overall=%.1f)", elapsed_ms, overall_score)

        return TranscriptEvaluationVerdict(
            overall_score=overall_score,
            technical_score=technical_score,
            communication_score=communication_score,
            confidence=0.88,
            summary=summary,
            strengths=strengths,
            weaknesses=weaknesses,
            detailed_feedback={
                "question_performance": turn_performances[:10],
                "soft_skills": {
                    "confidence": int(round(communication_score)),
                    "clarity": int(round(communication_score)),
                    "tone": "Lịch sự, nghiêm túc" if communication_score >= 6 else "Còn rụt rè",
                },
                "cultural_fit": "Phù hợp môi trường làm việc chuyên nghiệp." if overall_score >= 6 else "Cần phỏng vấn vòng trực tiếp để đánh giá thêm mức độ phù hợp văn hóa.",
            },
        )

