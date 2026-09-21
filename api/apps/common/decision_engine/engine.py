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

        # 3. Intent: Sàng lọc / tìm kiếm ứng viên (search_candidates)
        if cls._is_search_candidates(norm):
            verdict = cls._build_search_candidates_verdict(raw_text, norm, is_ambiguous)
            if not tools or verdict.tool_name in tools:
                return verdict

        # 4. Intent: Xem danh sách tin tuyển dụng (list_job_posts)
        if cls._is_list_job_posts(norm):
            verdict = cls._build_list_job_posts_verdict(raw_text, norm, is_ambiguous)
            if not tools or verdict.tool_name in tools:
                return verdict

        # 5. Intent: Ngân hàng câu hỏi (create_question / list_question_groups / list_questions)
        qb_verdict = cls._match_question_bank(raw_text, norm, is_ambiguous, tools)
        if qb_verdict:
            return qb_verdict

        # 6. Intent: Lịch hoặc danh sách phỏng vấn (list_interviews)
        if cls._is_list_interviews(norm):
            verdict = cls._build_list_interviews_verdict(raw_text, norm, is_ambiguous)
            if not tools or verdict.tool_name in tools:
                return verdict

        # 7. Intent: Tiêu chuẩn tuyển dụng, JD, quy định công ty (query_notebook_knowledge)
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
