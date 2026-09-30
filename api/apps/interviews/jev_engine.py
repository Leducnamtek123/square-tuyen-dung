from __future__ import annotations

import logging
import re
import unicodedata
from dataclasses import dataclass, field
from typing import Any

logger = logging.getLogger(__name__)


def strip_accents(value: str) -> str:
    """Loại bỏ dấu tiếng Việt để chuẩn hóa chuỗi phục vụ so khớp từ khóa."""
    normalized = unicodedata.normalize("NFKD", value or "")
    stripped = "".join(ch for ch in normalized if not unicodedata.combining(ch))
    return stripped.replace("đ", "d").replace("Đ", "D")


def normalize_token_text(value: str) -> str:
    """
    Chuẩn hóa văn bản, bảo toàn các ký tự kỹ thuật phổ biến (c++, c#, .net, ci/cd).
    """
    text = (value or "").lower()
    # Chuyển đổi các ký tự kỹ thuật trước khi xóa ký tự đặc biệt
    text = text.replace("c++", "cpp").replace("c#", "csharp").replace(".net", "dotnet")
    text = text.replace("ci/cd", "cicd").replace("ci-cd", "cicd")
    stripped = strip_accents(text)
    cleaned = re.sub(r"[^a-z0-9\s]+", " ", stripped)
    return re.sub(r"\s+", " ", cleaned).strip()


@dataclass
class JevDecisionVerdict:
    """
    Kết quả phán định có cấu trúc theo chuẩn Jev System 1 Decision Architecture.
    Phản hồi ngay tức thì (< 5ms trên CPU), có độ tin cậy và căn cứ rõ ràng.
    """

    score: float  # Điểm số chuẩn hóa (1.0 - 10.0 cho interview)
    confidence: float  # Độ tin cậy được hiệu chuẩn (0.0 - 1.0)
    intent_or_verdict: str  # STRONG_PASS, PASS, BORDERLINE, NEEDS_REVIEW, REJECT
    reasons: list[str] = field(default_factory=list)
    rubrics: dict[str, float] = field(default_factory=dict)
    metadata: dict[str, Any] = field(default_factory=dict)


class JevRubricScorer:
    """
    Fast, deterministic rubric scoring engine that evaluates candidate interview transcripts
    on 4 core recruitment competencies:
    1. technical_depth: Tech terminology, concrete implementations, problem-solving keywords.
    2. communication: Coherence, connectors, sentence structure, polite markers.
    3. problem_solving: Structured thinking (STAR method: Situation, Task, Action, Result).
    4. relevance_and_clarity: Direct answering vs evasive/short answers.
    """

    CORE_TECH_KEYWORDS = {
        "python",
        "django",
        "fastapi",
        "flask",
        "drf",
        "react",
        "reactjs",
        "nextjs",
        "vue",
        "angular",
        "javascript",
        "typescript",
        "nodejs",
        "express",
        "nestjs",
        "java",
        "spring",
        "csharp",
        "dotnet",
        "golang",
        "rust",
        "php",
        "laravel",
        "sql",
        "mysql",
        "postgresql",
        "postgres",
        "mongodb",
        "redis",
        "elasticsearch",
        "kafka",
        "rabbitmq",
        "celery",
        "docker",
        "kubernetes",
        "k8s",
        "cicd",
        "git",
        "aws",
        "gcp",
        "azure",
        "linux",
        "microservices",
        "clean architecture",
        "oop",
        "solid",
        "design pattern",
        "unit test",
        "integration test",
        "rest",
        "graphql",
        "grpc",
        "websocket",
        "webrtc",
        "caching",
        "database",
        "indexing",
        "query optimization",
        "performance",
        "security",
        "jwt",
        "oauth",
        "concurrency",
        "async",
        "worker",
        "scalability",
        "load balancing",
    }

    CONCRETE_IMPLEMENTATION_KEYWORDS = {
        "vi du",
        "cu the",
        "trien khai",
        "toi uu",
        "cau hinh",
        "xu ly",
        "nguyen nhan",
        "kien truc",
        "do luong",
        "benchmark",
        "refactor",
        "monitoring",
        "co che",
        "luong du lieu",
        "thiet ke",
        "ap dung",
        "he thong",
        "thuc te",
        "truy van",
        "thu nghiem",
        "van hanh",
        "dieu phoi",
    }

    PROBLEM_SOLVING_TECH_KEYWORDS = {
        "debug",
        "troubleshoot",
        "khac phuc",
        "sua loi",
        "giai phap",
        "cai tien",
        "phan tich",
        "danh gia",
        "nguyen nhan goc re",
        "root cause",
        "bao mat",
        "tac nghen",
        "bottleneck",
        "phong ngua",
        "xung dot",
        "lo hong",
    }

    POLITE_MARKERS = {
        "da",
        "vang",
        "cam on",
        "xin chao",
        "thua",
        "kinh gui",
        "chao anh",
        "chao chi",
        "thua anh",
        "thua chi",
        "xin phep",
        "rat vui",
        "hy vong",
        "tran trong",
        "cam on anh",
        "cam on chi",
    }

    COHERENCE_CONNECTORS = {
        "do do",
        "boi vi",
        "vi vay",
        "ngoai ra",
        "hon nua",
        "tuy nhien",
        "mat khac",
        "dong thoi",
        "nhin chung",
        "dac biet",
        "thu nhat",
        "thu hai",
        "cuoi cung",
        "tom lai",
        "chang han",
        "theo em",
        "theo toi",
        "ben canh do",
        "chinh vi the",
    }

    # STAR Method keywords
    STAR_SITUATION = {
        "tinh huong",
        "boi canh",
        "khi do",
        "du an",
        "khach hang",
        "yeu cau",
        "bai toan",
        "van de dat ra",
        "thach thuc",
        "gap phai",
        "su co",
        "thoi diem",
    }
    STAR_TASK = {
        "nhiem vu",
        "muc tieu",
        "vai tro cua toi",
        "vai tro cua em",
        "can phai",
        "trach nhiem",
        "yeu cau can dat",
        "phai giai quyet",
        "deadline",
        "ke hoach",
    }
    STAR_ACTION = {
        "hanh dong",
        "giai phap",
        "toi da",
        "em da",
        "chung toi da",
        "tien hanh",
        "ap dung",
        "trien khai",
        "thuc hien",
        "phuong an",
        "xu ly bang cach",
        "thiet ke",
        "viet",
        "toi uu hoa",
        "chuyen doi",
        "xay dung",
        "cai dat",
    }
    STAR_RESULT = {
        "ket qua",
        "dat duoc",
        "thanh cong",
        "cai thien",
        "tang truong",
        "tiet kiem",
        "giam",
        "hoan thanh",
        "hieu suat",
        "bai hoc",
        "bai hoc kinh nghiem",
        "danh gia cao",
        "phan hoi tot",
        "nang cao",
        "on dinh",
    }

    EVASIVE_PHRASES = {
        "khong biet",
        "chua lam",
        "khong ro",
        "bo qua",
        "chua tim hieu",
        "chua tung",
        "khong co",
        "em khong nho",
        "quen mat",
        "chua ro",
        "khong nho",
    }

    @classmethod
    def _extract_candidate_turns(cls, transcripts: list[Any]) -> list[str]:
        turns: list[str] = []
        for t in transcripts:
            if isinstance(t, dict):
                role = (t.get("speaker_role") or t.get("role") or "").lower()
                content = t.get("content") or t.get("text") or ""
            else:
                role = getattr(t, "speaker_role", getattr(t, "role", "")).lower()
                content = getattr(t, "content", getattr(t, "text", ""))

            if role in ("candidate", "jobseeker", "user", "applicant"):
                text = str(content).strip()
                if text:
                    turns.append(text)
        return turns

    @classmethod
    def score_transcript(
        cls,
        transcripts: list[Any],
        job_context: dict[str, Any] | None = None,
    ) -> JevDecisionVerdict:
        """
        Đánh giá transcript phỏng vấn theo 4 nhóm năng lực tiêu chuẩn.
        Trả về JevDecisionVerdict gồm điểm tổng (1-10), rubrics, strengths, weaknesses, và confidence.
        """
        cand_turns = cls._extract_candidate_turns(transcripts)
        context = job_context or {}

        # Trường hợp không có câu trả lời nào từ ứng viên
        if not cand_turns:
            return JevDecisionVerdict(
                score=1.0,
                confidence=0.95,
                intent_or_verdict="REJECT",
                reasons=["Không ghi nhận câu trả lời nào từ ứng viên trong phiên phỏng vấn."],
                rubrics={
                    "technical_depth": 1.0,
                    "communication": 1.0,
                    "problem_solving": 1.0,
                    "relevance_and_clarity": 1.0,
                },
                metadata={"total_words": 0, "turn_count": 0, "substantive_turns": 0},
            )

        total_words = sum(len(turn.split()) for turn in cand_turns)
        avg_words_per_turn = total_words / max(1, len(cand_turns))
        full_text = " ".join(cand_turns)
        norm_full_text = normalize_token_text(full_text)

        # 1. TECHNICAL DEPTH SCORING (1.0 - 10.0)
        # Bổ sung từ khóa từ job_context nếu có
        job_skills = context.get("skills") or context.get("required_skills") or []
        if isinstance(job_skills, str):
            extra_skills = {normalize_token_text(s) for s in re.split(r"[,;\n]+", job_skills) if s.strip()}
        else:
            extra_skills = {normalize_token_text(str(s)) for s in job_skills if str(s).strip()}

        all_tech = cls.CORE_TECH_KEYWORDS | extra_skills
        matched_tech = [k for k in all_tech if f" {k} " in f" {norm_full_text} " or k in norm_full_text]
        matched_concrete = [k for k in cls.CONCRETE_IMPLEMENTATION_KEYWORDS if k in norm_full_text]
        matched_ps_tech = [k for k in cls.PROBLEM_SOLVING_TECH_KEYWORDS if k in norm_full_text]

        tech_base = 3.2
        tech_base += min(3.8, len(matched_tech) * 0.7)
        tech_base += min(1.8, len(matched_concrete) * 0.45)
        tech_base += min(1.2, len(matched_ps_tech) * 0.4)
        technical_depth = round(max(1.0, min(10.0, tech_base)), 1)

        # 2. COMMUNICATION SCORING (1.0 - 10.0)
        matched_polite = [k for k in cls.POLITE_MARKERS if f" {k} " in f" {norm_full_text} " or k in norm_full_text]
        matched_connectors = [k for k in cls.COHERENCE_CONNECTORS if k in norm_full_text]

        comm_base = 4.2
        comm_base += min(2.0, len(matched_polite) * 0.5)
        comm_base += min(2.0, len(matched_connectors) * 0.45)

        if avg_words_per_turn >= 25:
            comm_base += 1.8
        elif avg_words_per_turn >= 12:
            comm_base += 0.8
        elif avg_words_per_turn < 6:
            comm_base -= 1.8
        communication = round(max(1.0, min(10.0, comm_base)), 1)

        # 3. PROBLEM SOLVING SCORING (STAR Method) (1.0 - 10.0)
        star_s = any(k in norm_full_text for k in cls.STAR_SITUATION)
        star_t = any(k in norm_full_text for k in cls.STAR_TASK)
        star_a = any(k in norm_full_text for k in cls.STAR_ACTION)
        star_r = any(k in norm_full_text for k in cls.STAR_RESULT)

        star_count = sum([star_s, star_t, star_a, star_r])
        ps_base = 3.0
        if star_count == 4:
            ps_base += 4.0
        elif star_count == 3:
            ps_base += 2.8
        elif star_count == 2:
            ps_base += 1.6
        elif star_count == 1:
            ps_base += 0.8

        reasoning_keywords = {
            "nguyen nhan",
            "phan tich",
            "danh gia",
            "lua chon",
            "so sanh",
            "uu diem",
            "nhuoc diem",
            "trade off",
        }
        matched_reasoning = [k for k in reasoning_keywords if k in norm_full_text]
        ps_base += min(2.0, len(matched_reasoning) * 0.5)
        problem_solving = round(max(1.0, min(10.0, ps_base)), 1)

        # 4. RELEVANCE AND CLARITY (1.0 - 10.0)
        evasive_count = 0
        substantive_turns = 0
        for turn in cand_turns:
            w_count = len(turn.split())
            norm_turn = normalize_token_text(turn)
            has_evasive = any(p in norm_turn for p in cls.EVASIVE_PHRASES)
            if has_evasive:
                evasive_count += 1
            if w_count >= 6 and not has_evasive:
                substantive_turns += 1

        substantive_ratio = substantive_turns / max(1, len(cand_turns))
        rel_base = 3.0 + (substantive_ratio * 5.0)
        if evasive_count > 0:
            rel_base -= min(3.0, evasive_count * 0.9)
        if avg_words_per_turn >= 18:
            rel_base += 1.0
        relevance_and_clarity = round(max(1.0, min(10.0, rel_base)), 1)

        # OVERALL SCORE (WEIGHTED BLEND)
        overall_score = round(
            technical_depth * 0.35 + communication * 0.25 + problem_solving * 0.25 + relevance_and_clarity * 0.15,
            1,
        )
        overall_score = max(1.0, min(10.0, overall_score))

        # STRENGTHS & WEAKNESSES GENERATION
        strengths: list[str] = []
        if technical_depth >= 7.0:
            tech_sample = ", ".join(matched_tech[:4]) if matched_tech else "công nghệ yêu cầu"
            strengths.append(f"Nắm vững kiến thức chuyên môn kỹ thuật sâu ({tech_sample}).")
        if problem_solving >= 7.0 and star_count >= 2:
            strengths.append(
                "Tư duy giải quyết vấn đề có cấu trúc mạch lạc (theo phương pháp STAR: bối cảnh, giải pháp và kết quả)."
            )
        if communication >= 7.0:
            strengths.append("Giao tiếp tự tin, sử dụng văn phong lịch thiệp và mạch lạc trong diễn đạt.")
        if relevance_and_clarity >= 7.0 and substantive_ratio >= 0.7:
            strengths.append(
                f"Trả lời thẳng thắn, đúng trọng tâm ({substantive_turns}/{len(cand_turns)} lượt trả lời thực chất)."
            )

        weaknesses: list[str] = []
        if technical_depth < 6.0:
            weaknesses.append("Chưa đào sâu các thuật ngữ và kiến trúc kỹ thuật chuyên sâu của vị trí.")
        if problem_solving < 6.0 or star_count < 2:
            weaknesses.append(
                "Cần bổ sung dẫn chứng cụ thể khi giải quyết bài toán (nêu rõ giải pháp và kết quả đo lường được)."
            )
        if communication < 6.0 or avg_words_per_turn < 12:
            weaknesses.append("Câu trả lời còn ngắn gọn hoặc cần tăng tính kết nối, mạch lạc giữa các ý.")
        if evasive_count > 0 or relevance_and_clarity < 6.0:
            weaknesses.append(f"Còn {evasive_count} câu trả lời mang tính né tránh hoặc chưa làm rõ nội dung yêu cầu.")

        # CALIBRATED CONFIDENCE
        conf = 0.50
        if total_words >= 150:
            conf += 0.25
        elif total_words >= 60:
            conf += 0.18
        elif total_words >= 25:
            conf += 0.10
        else:
            conf += 0.03

        if len(cand_turns) >= 5:
            conf += 0.15
        elif len(cand_turns) >= 3:
            conf += 0.10
        else:
            conf += 0.05

        if substantive_ratio >= 0.7:
            conf += 0.05
        confidence = round(max(0.30, min(0.95, conf)), 2)

        # INTENT / VERDICT CLASSIFICATION
        if overall_score >= 8.0:
            intent_or_verdict = "STRONG_PASS"
        elif overall_score >= 6.5:
            intent_or_verdict = "PASS"
        elif overall_score >= 5.0:
            intent_or_verdict = "BORDERLINE"
        elif overall_score >= 3.5:
            intent_or_verdict = "NEEDS_REVIEW"
        else:
            intent_or_verdict = "REJECT"

        reasons = [
            f"Tổng số từ: {total_words}, số lượt trả lời: {len(cand_turns)}, lượt thực chất: {substantive_turns}.",
            f"Độ sâu kỹ thuật: {technical_depth}/10, Giao tiếp: {communication}/10, Giải quyết vấn đề: {problem_solving}/10, Trọng tâm: {relevance_and_clarity}/10.",
        ]

        return JevDecisionVerdict(
            score=overall_score,
            confidence=confidence,
            intent_or_verdict=intent_or_verdict,
            reasons=reasons,
            rubrics={
                "technical_depth": technical_depth,
                "communication": communication,
                "problem_solving": problem_solving,
                "relevance_and_clarity": relevance_and_clarity,
            },
            metadata={
                "total_words": total_words,
                "turn_count": len(cand_turns),
                "substantive_turns": substantive_turns,
                "evasive_count": evasive_count,
                "star_count": star_count,
                "strengths": strengths,
                "weaknesses": weaknesses,
            },
        )


class JevGatekeeper:
    """
    Kiểm soát việc gọi LLM và cung cấp đường truyền nhanh (fast-path) cho đánh giá phỏng vấn:
    1. should_invoke_llm: Đánh giá xem dữ liệu câu trả lời của ứng viên có đủ (> 15 từ, có câu thực chất)
       để tránh lãng phí chi phí và thời gian gọi LLM.
    2. generate_fast_evaluation: Tạo payload đánh giá chuẩn hóa ngay lập tức theo cấu trúc của
       api/apps/interviews/tasks.py (tương thích tuyệt đối với InterviewEvaluationSchema).
    """

    MIN_TOTAL_WORDS_FOR_LLM = 15
    MIN_SUBSTANTIVE_TURNS = 1

    @classmethod
    def should_invoke_llm(cls, transcripts: list[Any]) -> tuple[bool, str]:
        """
        Kiểm tra xem nội dung câu trả lời của ứng viên có đủ điều kiện để kích hoạt LLM hay không.
        Returns:
            (should_invoke: bool, reason: str)
        """
        candidate_turns = JevRubricScorer._extract_candidate_turns(transcripts)
        if not candidate_turns:
            return False, "Không có câu trả lời nào từ ứng viên trong phiên phỏng vấn."

        total_words = sum(len(turn.split()) for turn in candidate_turns)
        if total_words <= cls.MIN_TOTAL_WORDS_FOR_LLM:
            return (
                False,
                f"Nội dung câu trả lời quá ngắn ({total_words} từ, yêu cầu > {cls.MIN_TOTAL_WORDS_FOR_LLM} từ) để kích hoạt LLM.",
            )

        substantive_count = 0
        for turn in candidate_turns:
            words = turn.split()
            norm = normalize_token_text(turn)
            is_evasive = any(p in norm for p in JevRubricScorer.EVASIVE_PHRASES)
            if len(words) >= 6 and not is_evasive:
                substantive_count += 1

        if substantive_count < cls.MIN_SUBSTANTIVE_TURNS:
            return (
                False,
                "Ứng viên không có câu trả lời nào mang nội dung thực chất (chỉ chứa phản hồi cộc lốc hoặc không biết).",
            )

        return (
            True,
            f"Nội dung câu trả lời đầy đủ ({len(candidate_turns)} lượt, {total_words} từ, {substantive_count} lượt thực chất), đủ điều kiện kích hoạt LLM.",
        )

    @classmethod
    def generate_fast_evaluation(
        cls,
        transcripts: list[Any],
        job_post_title: str = "",
    ) -> dict[str, Any]:
        """
        Tạo báo cáo đánh giá nhanh, chuẩn xác dựa trên JevRubricScorer.
        Cấu trúc dict trả về tương thích 100% với InterviewEvaluationSchema trong tasks.py.
        """
        verdict = JevRubricScorer.score_transcript(
            transcripts,
            job_context={"job_title": job_post_title},
        )

        meta = verdict.metadata
        strengths = meta.get("strengths", [])
        weaknesses = meta.get("weaknesses", [])
        total_words = meta.get("total_words", 0)
        turn_count = meta.get("turn_count", 0)

        # Xây dựng question_performance từ các cặp câu hỏi AI - câu trả lời ứng viên
        question_performance: list[dict[str, Any]] = []
        last_question = f"Phỏng vấn năng lực vị trí {job_post_title or 'chuyên môn'}"

        for idx, t in enumerate(transcripts):
            if isinstance(t, dict):
                role = (t.get("speaker_role") or t.get("role") or "").lower()
                content = (t.get("content") or t.get("text") or "").strip()
            else:
                role = getattr(t, "speaker_role", getattr(t, "role", "")).lower()
                content = str(getattr(t, "content", getattr(t, "text", ""))).strip()

            if role in ("ai_agent", "interviewer", "assistant"):
                if content:
                    last_question = content
            elif role in ("candidate", "jobseeker", "user", "applicant"):
                words = content.split()
                norm = normalize_token_text(content)
                is_shallow = len(words) < 6 or any(p in norm for p in JevRubricScorer.EVASIVE_PHRASES)

                turn_score = 4 if is_shallow else (9 if len(words) >= 20 else 7)
                feedback = (
                    "Câu trả lời ngắn hoặc mang tính né tránh, chưa nêu được ví dụ cụ thể."
                    if is_shallow
                    else "Ứng viên trả lời rõ ràng, có nội dung thực chất và giải thích mạch lạc."
                )

                q_title = last_question if len(last_question) <= 120 else f"{last_question[:117]}..."
                question_performance.append(
                    {
                        "question": q_title,
                        "feedback": feedback,
                        "score": turn_score,
                    }
                )
                # Reset question cho lượt sau nếu có
                last_question = f"Câu hỏi chuyên môn #{len(question_performance) + 1}"

        if not question_performance:
            question_performance.append(
                {
                    "question": f"Đánh giá tổng quan vị trí {job_post_title or 'chuyên môn'}",
                    "feedback": "Chưa ghi nhận đủ dữ liệu câu trả lời chi tiết.",
                    "score": int(round(verdict.score)),
                }
            )

        # Soft skills feedback
        comm_score = verdict.rubrics.get("communication", 5.0)
        clarity_score = verdict.rubrics.get("relevance_and_clarity", 5.0)

        soft_skills_confidence = int(round(max(1.0, min(10.0, comm_score))))
        soft_skills_clarity = int(round(max(1.0, min(10.0, clarity_score))))

        if comm_score >= 7.0:
            tone = "Tự tin, chuyên nghiệp, lịch thiệp"
        elif comm_score >= 5.0:
            tone = "Hợp tác, đúng mực"
        else:
            tone = "Còn e ngại hoặc chưa tự tin"

        if verdict.score >= 7.0:
            cultural_fit = "Phù hợp tốt với môi trường làm việc chuyên nghiệp và văn hóa đề cao sự chủ động."
        elif verdict.score >= 5.0:
            cultural_fit = "Cơ bản phù hợp với văn hóa làm việc, nên phỏng vấn vòng tiếp theo để đánh giá sâu hơn."
        else:
            cultural_fit = "Cần cân nhắc thêm về mức độ hòa nhập văn hóa doanh nghiệp do dữ liệu thể hiện còn hạn chế."

        position_str = f" cho vị trí {job_post_title}" if job_post_title else ""
        summary = (
            f"Ứng viên hoàn tất {turn_count} lượt phản hồi ({total_words} từ){position_str}. "
            f"Điểm chuyên môn: {verdict.rubrics.get('technical_depth', 1.0)}/10, "
            f"Giao tiếp: {comm_score}/10, Tư duy giải quyết vấn đề: {verdict.rubrics.get('problem_solving', 1.0)}/10. "
            f"Xếp loại: {verdict.intent_or_verdict}."
        )

        return {
            "overall_score": verdict.score,
            "technical_score": verdict.rubrics.get("technical_depth", 1.0),
            "communication_score": comm_score,
            "summary": summary,
            "strengths": strengths if strengths else ["Ứng viên tham gia phản hồi đầy đủ các câu hỏi."],
            "weaknesses": weaknesses if weaknesses else ["Cần tiếp tục trau dồi và cập nhật thêm các công nghệ mới."],
            "detailed_feedback": {
                "question_performance": question_performance[:10],
                "soft_skills": {
                    "confidence": soft_skills_confidence,
                    "clarity": soft_skills_clarity,
                    "tone": tone,
                },
                "cultural_fit": cultural_fit,
            },
        }
