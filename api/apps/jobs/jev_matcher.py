from __future__ import annotations

import logging
import re
import unicodedata
from dataclasses import dataclass, field
from typing import Any

logger = logging.getLogger(__name__)


def strip_accents(value: str) -> str:
    """Loại bỏ dấu tiếng Việt để phục vụ so khớp từ khóa."""
    normalized = unicodedata.normalize("NFKD", value or "")
    stripped = "".join(ch for ch in normalized if not unicodedata.combining(ch))
    return stripped.replace("đ", "d").replace("Đ", "D")


def normalize_skill_text(value: str) -> str:
    """
    Chuẩn hóa tên kỹ năng công nghệ, giữ nguyên các ký hiệu cốt lõi (c++, c#, .net, ci/cd).
    """
    text = (value or "").lower()
    text = text.replace("c++", "cpp").replace("c#", "csharp").replace(".net", "dotnet")
    text = text.replace("ci/cd", "cicd").replace("ci-cd", "cicd")
    stripped = strip_accents(text)
    cleaned = re.sub(r"[^a-z0-9\s]+", " ", stripped)
    return re.sub(r"\s+", " ", cleaned).strip()


@dataclass
class JevMatchVerdict:
    """
    Kết quả đánh giá độ phù hợp của ứng viên với vị trí tuyển dụng (Jev System 1 Matcher).
    """

    match_score: float  # Điểm tương thích tổng hợp (0.0 - 100.0)
    pass_hard_requirements: bool  # Vượt qua các tiêu chí bắt buộc (kỹ năng cốt lõi, kinh nghiệm tối thiểu)
    matched_skills: list[str] = field(default_factory=list)
    missing_skills: list[str] = field(default_factory=list)
    experience_alignment: str = "INSUFFICIENT"  # 'EXCEEDS', 'MEETS', 'PARTIAL', 'INSUFFICIENT'
    confidence: float = 0.0  # Độ tin cậy hiệu chuẩn (0.0 - 1.0)
    reasoning: str = ""


class JevCandidateMatcher:
    """
    Fast, deterministic CV-to-Job matching engine.
    Đánh giá độ tương thích giữa ứng viên và yêu cầu công việc dựa trên 4 trụ cột:
    1. Kỹ năng chuyên môn (Skill overlap & Tech Synonyms) - Trọng số 45%
    2. Số năm kinh nghiệm (Experience alignment) - Trọng số 30%
    3. Trình độ học vấn & Bằng cấp (Education level) - Trọng số 15%
    4. Mức lương kỳ vọng vs Ngân sách (Salary alignment) - Trọng số 10%
    """

    # Danh mục từ đồng nghĩa công nghệ (Tech Synonyms Groups)
    SYNONYM_GROUPS: list[set[str]] = [
        {"javascript", "js", "ecmascript"},
        {"typescript", "ts"},
        {"python", "py"},
        {"golang", "go"},
        {"csharp", "c#", ".net", "dotnet", "asp.net", "aspnet"},
        {"cpp", "c++"},
        {"react", "reactjs", "react.js"},
        {"nextjs", "next.js", "next"},
        {"vue", "vuejs", "vue.js"},
        {"angular", "angularjs"},
        {"nodejs", "node.js", "node"},
        {"django", "drf", "django rest framework"},
        {"fastapi"},
        {"flask"},
        {"postgresql", "postgres", "pgsql"},
        {"mysql"},
        {"mongodb", "mongo"},
        {"redis"},
        {"elasticsearch", "elastic search", "es"},
        {"docker", "containerization", "container"},
        {"kubernetes", "k8s"},
        {"cicd", "ci/cd", "ci-cd", "continuous integration"},
        {"git", "github", "gitlab"},
        {"aws", "amazon web services"},
        {"gcp", "google cloud", "google cloud platform"},
        {"azure", "microsoft azure"},
        {"microservices", "microservice", "kien truc vi dich vu"},
        {"restful", "rest api", "rest", "restful api"},
        {"graphql"},
        {"webrtc", "rtc"},
        {"websocket", "websockets"},
        {"rabbitmq", "rabbit mq"},
        {"kafka", "apache kafka"},
        {"celery"},
        {"qa", "qc", "tester", "testing", "kiem thu"},
        {"frontend", "front-end", "front end"},
        {"backend", "back-end", "back end"},
        {"fullstack", "full-stack", "full stack"},
        {"devops", "sre", "site reliability engineering"},
        {"machine learning", "ml", "deep learning", "ai", "tri tue nhan tao"},
        {"nlp", "natural language processing", "xu ly ngon ngu tu nhien"},
        {"computer vision", "thi giac may tinh", "cv"},
    ]

    # Bảng phân cấp học vấn
    EDUCATION_HIERARCHY: dict[str, int] = {
        "khong yeu cau": 0,
        "bat ky": 0,
        "thpt": 1,
        "cap 3": 1,
        "trung hoc pho thong": 1,
        "high school": 1,
        "trung cap": 2,
        "nghe": 2,
        "vocational": 2,
        "cao dang": 3,
        "college": 3,
        "associate": 3,
        "dai hoc": 4,
        "cu nhan": 4,
        "ky su": 4,
        "bachelor": 4,
        "university": 4,
        "thac si": 5,
        "master": 5,
        "tien si": 6,
        "phd": 6,
        "doctorate": 6,
    }

    @classmethod
    def _get_synonyms(cls, skill: str) -> set[str]:
        """Lấy tất cả các biến thể từ đồng nghĩa đã chuẩn hóa của một kỹ năng."""
        norm = normalize_skill_text(skill)
        synonyms = {norm}
        for group in cls.SYNONYM_GROUPS:
            norm_group = {normalize_skill_text(item) for item in group}
            if norm in norm_group:
                synonyms.update(norm_group)
        return synonyms

    @classmethod
    def _parse_education_level(cls, text: str) -> int:
        """Chuyển đổi chuỗi học vấn thành cấp bậc số nguyên (0-6)."""
        norm = normalize_skill_text(text)
        max_level = 0
        for edu_key, level in cls.EDUCATION_HIERARCHY.items():
            if edu_key in norm:
                max_level = max(max_level, level)
        return max_level

    @classmethod
    def _extract_float(cls, value: Any) -> float | None:
        if value is None:
            return None
        if isinstance(value, (int, float)):
            return float(value)
        try:
            return float(str(value).strip().replace(",", "."))
        except (ValueError, TypeError):
            m = re.search(r"(\d+(?:[.,]\d+)?)", str(value))
            if m:
                try:
                    return float(m.group(1).replace(",", "."))
                except ValueError:
                    return None
        return None

    @classmethod
    def _extract_skills_list(cls, val: Any) -> list[str]:
        if not val:
            return []
        if isinstance(val, list):
            res: list[str] = []
            for item in val:
                if isinstance(item, dict):
                    name = item.get("name") or item.get("skill_name") or ""
                    if name:
                        res.append(str(name).strip())
                elif item:
                    res.append(str(item).strip())
            return res
        if isinstance(val, str):
            return [s.strip() for s in re.split(r"[,;\n\r/]+", val) if s.strip()]
        return []

    @classmethod
    def _parse_cv_input(cls, cv_text_or_data: dict[str, Any] | str) -> dict[str, Any]:
        """Chuẩn hóa dữ liệu CV đầu vào từ dict hoặc chuỗi văn bản."""
        if isinstance(cv_text_or_data, dict):
            skills = cls._extract_skills_list(cv_text_or_data.get("skills") or cv_text_or_data.get("skill_list"))
            exp = cls._extract_float(
                cv_text_or_data.get("experience")
                or cv_text_or_data.get("experience_years")
                or cv_text_or_data.get("years_of_experience")
            )
            edu_raw = str(
                cv_text_or_data.get("academic_level")
                or cv_text_or_data.get("education")
                or cv_text_or_data.get("degree")
                or ""
            )
            sal_min = cls._extract_float(cv_text_or_data.get("salary_min") or cv_text_or_data.get("expected_salary"))
            sal_max = cls._extract_float(cv_text_or_data.get("salary_max"))

            full_text = " ".join(
                [
                    str(cv_text_or_data.get("title") or ""),
                    str(cv_text_or_data.get("summary") or ""),
                    str(cv_text_or_data.get("raw_text") or cv_text_or_data.get("text") or ""),
                    " ".join(skills),
                    edu_raw,
                ]
            )

            # Nếu trong dict chưa có exp, thử quét thêm từ full_text
            if exp is None:
                exp_match = re.search(r"(\d+(?:[.,]\d+)?)\s*(?:năm|nam|years?|yrs?)", full_text, re.IGNORECASE)
                if exp_match:
                    exp = cls._extract_float(exp_match.group(1))

            return {
                "skills": skills,
                "experience": exp,
                "education_raw": edu_raw,
                "salary_min": sal_min,
                "salary_max": sal_max,
                "full_text": full_text,
            }

        # Nếu là raw string (CV text)
        raw_text = str(cv_text_or_data or "")

        # Quét số năm kinh nghiệm
        exp_val: float | None = None
        exp_m = re.search(
            r"(?:kinh nghiem|kn|experience|exp)[\s:]*(\d+(?:[.,]\d+)?)\s*(?:nam|năm|years?|yrs?)",
            strip_accents(raw_text),
            re.IGNORECASE,
        )
        if not exp_m:
            exp_m = re.search(
                r"(\d+(?:[.,]\d+)?)\s*(?:nam|năm|years?|yrs?)\s*(?:kinh nghiem|experience)",
                strip_accents(raw_text),
                re.IGNORECASE,
            )
        if not exp_m:
            exp_m = re.search(r"(\d+(?:[.,]\d+)?)\s*\+\s*(?:nam|năm|years?)", strip_accents(raw_text), re.IGNORECASE)
        if not exp_m:
            exp_m = re.search(r"(\d+(?:[.,]\d+)?)\s*(?:nam|năm|years?|yrs?)", strip_accents(raw_text), re.IGNORECASE)

        if exp_m:
            exp_val = cls._extract_float(exp_m.group(1))

        # Quét lương
        sal_min: float | None = None
        sal_max: float | None = None
        sal_m = re.search(
            r"(\d+(?:[.,]\d+)?)\s*[-–]\s*(\d+(?:[.,]\d+)?)\s*(?:trieu|tr|m|vnd|usd)",
            strip_accents(raw_text),
            re.IGNORECASE,
        )
        if sal_m:
            sal_min = cls._extract_float(sal_m.group(1))
            sal_max = cls._extract_float(sal_m.group(2))

        return {
            "skills": [],
            "experience": exp_val,
            "education_raw": raw_text,
            "salary_min": sal_min,
            "salary_max": sal_max,
            "full_text": raw_text,
        }

    @classmethod
    def evaluate_match(
        cls,
        cv_text_or_data: dict[str, Any] | str,
        job_requirements: dict[str, Any],
    ) -> JevMatchVerdict:
        """
        Đánh giá độ tương thích chi tiết của ứng viên đối với yêu cầu tuyển dụng.
        """
        cand = cls._parse_cv_input(cv_text_or_data)
        job = job_requirements or {}

        # 1. Trích xuất yêu cầu công việc
        required_skills = cls._extract_skills_list(
            job.get("skills") or job.get("required_skills") or job.get("must_have_skills")
        )
        optional_skills = cls._extract_skills_list(job.get("optional_skills") or job.get("nice_to_have_skills"))
        min_exp = cls._extract_float(
            job.get("min_experience_years") or job.get("experience") or job.get("experience_years")
        )
        job_edu_raw = str(job.get("education_level") or job.get("education") or job.get("academic_level") or "")
        job_sal_min = cls._extract_float(job.get("salary_min"))
        job_sal_max = cls._extract_float(job.get("salary_max") or job.get("budget"))

        # Chuẩn hóa văn bản ứng viên phục vụ tìm kiếm
        norm_cand_full_text = normalize_skill_text(cand["full_text"])
        cand_skills_normalized = {normalize_skill_text(s) for s in cand["skills"]}

        # -----------------------------------------------------------------
        # A. ĐÁNH GIÁ KỸ NĂNG (Trọng số 45%)
        # -----------------------------------------------------------------
        matched_skills: list[str] = []
        missing_skills: list[str] = []

        if required_skills:
            for skill in required_skills:
                synonyms = cls._get_synonyms(skill)
                # Kiểm tra xem có từ đồng nghĩa nào xuất hiện trong danh sách kỹ năng hoặc văn bản CV không
                is_matched = False
                for syn in synonyms:
                    if syn in cand_skills_normalized:
                        is_matched = True
                        break
                    # So khớp trong full text với ranh giới từ
                    if f" {syn} " in f" {norm_cand_full_text} " or syn in norm_cand_full_text:
                        is_matched = True
                        break

                if is_matched:
                    matched_skills.append(skill)
                else:
                    missing_skills.append(skill)

            skill_ratio = len(matched_skills) / len(required_skills)
            skill_score = skill_ratio * 100.0
        else:
            skill_score = 90.0

        # Thưởng kỹ năng bổ trợ (tối đa +10 điểm kỹ năng)
        matched_opt_count = 0
        if optional_skills:
            for opt_skill in optional_skills:
                synonyms = cls._get_synonyms(opt_skill)
                if any(syn in cand_skills_normalized or f" {syn} " in f" {norm_cand_full_text} " for syn in synonyms):
                    matched_opt_count += 1
            if len(optional_skills) > 0:
                skill_score = min(100.0, skill_score + (matched_opt_count / len(optional_skills)) * 10.0)

        # -----------------------------------------------------------------
        # B. ĐÁNH GIÁ KINH NGHIỆM (Trọng số 30%)
        # -----------------------------------------------------------------
        cand_exp = cand["experience"]
        if min_exp is not None and min_exp > 0:
            if cand_exp is None or cand_exp == 0:
                exp_score = 20.0
                experience_alignment = "INSUFFICIENT"
            elif cand_exp >= min_exp + 2:
                exp_score = 100.0
                experience_alignment = "EXCEEDS"
            elif cand_exp >= min_exp:
                exp_score = 95.0
                experience_alignment = "MEETS"
            elif cand_exp >= min_exp * 0.7:
                exp_score = 70.0
                experience_alignment = "PARTIAL"
            elif cand_exp >= min_exp * 0.4:
                exp_score = 40.0
                experience_alignment = "PARTIAL"
            else:
                exp_score = 15.0
                experience_alignment = "INSUFFICIENT"
        else:
            exp_score = 95.0
            experience_alignment = "MEETS"

        # -----------------------------------------------------------------
        # C. ĐÁNH GIÁ HỌC VẤN (Trọng số 15%)
        # -----------------------------------------------------------------
        job_edu_level = cls._parse_education_level(job_edu_raw)
        cand_edu_level = cls._parse_education_level(f"{cand['education_raw']} {cand['full_text']}")

        if job_edu_level > 0:
            if cand_edu_level >= job_edu_level:
                edu_score = 100.0
            elif cand_edu_level == job_edu_level - 1:
                edu_score = 75.0
            else:
                edu_score = 40.0
        else:
            edu_score = 100.0

        # -----------------------------------------------------------------
        # D. ĐÁNH GIÁ MỨC LƯƠNG VS NGÂN SÁCH (Trọng số 10%)
        # -----------------------------------------------------------------
        cand_sal_min = cand["salary_min"]
        salary_score = 100.0
        salary_status = "Phù hợp hoặc thỏa thuận"

        if job_sal_max and job_sal_max > 0 and cand_sal_min and cand_sal_min > 0:
            if cand_sal_min <= job_sal_max:
                salary_score = 100.0
                salary_status = "Nằm trong dải ngân sách tuyển dụng"
            else:
                ratio = cand_sal_min / job_sal_max
                if ratio <= 1.15:
                    salary_score = 75.0
                    salary_status = f"Vượt nhẹ ngân sách (+{int((ratio - 1) * 100)}%), có thể thương lượng"
                elif ratio <= 1.30:
                    salary_score = 45.0
                    salary_status = f"Vượt ngân sách (+{int((ratio - 1) * 100)}%)"
                else:
                    salary_score = 15.0
                    salary_status = f"Vượt xa ngân sách vị trí (+{int((ratio - 1) * 100)}%)"

        # -----------------------------------------------------------------
        # E. KIỂM TRA TIÊU CHÍ BẮT BUỘC (HARD REQUIREMENTS)
        # -----------------------------------------------------------------
        pass_hard_req = True
        fail_reasons: list[str] = []

        # 1. Kỹ năng bắt buộc hoàn toàn không có (nếu JD có từ 2 kỹ năng trở lên mà match 0)
        if required_skills and len(matched_skills) == 0:
            pass_hard_req = False
            fail_reasons.append("Không đáp ứng bất kỳ kỹ năng bắt buộc nào.")
        elif required_skills and len(required_skills) >= 3 and (len(matched_skills) / len(required_skills)) < 0.30:
            pass_hard_req = False
            fail_reasons.append(f"Tỷ lệ kỹ năng bắt buộc quá thấp ({len(matched_skills)}/{len(required_skills)}).")

        # 2. Kinh nghiệm thiếu hụt nghiêm trọng (vị trí yêu cầu >= 2 năm mà có < 40%)
        if min_exp and min_exp >= 2.0:
            actual_exp = cand_exp or 0.0
            if actual_exp < min_exp * 0.4:
                pass_hard_req = False
                fail_reasons.append(f"Kinh nghiệm ({actual_exp:g} năm) chưa đạt ngưỡng tối thiểu {min_exp:g} năm.")

        # 3. Lương vượt quá 50% ngân sách tối đa
        if job_sal_max and cand_sal_min and (cand_sal_min / job_sal_max) > 1.50:
            pass_hard_req = False
            fail_reasons.append("Mức lương kỳ vọng vượt trên 50% ngân sách tối đa của vị trí.")

        # -----------------------------------------------------------------
        # F. TÍNH ĐIỂM TỔNG HỢP VÀ CALIBRATED CONFIDENCE
        # -----------------------------------------------------------------
        match_score = round(
            skill_score * 0.45 + exp_score * 0.30 + edu_score * 0.15 + salary_score * 0.10,
            1,
        )

        # Nếu không vượt qua tiêu chí cứng, chặn điểm ở mức tối đa 49.0 (Fail)
        if not pass_hard_req:
            match_score = min(49.0, match_score)

        # Calibrated Confidence
        conf = 0.70
        if required_skills and (matched_skills or missing_skills):
            conf += 0.10
        if cand_exp is not None and min_exp is not None:
            conf += 0.08
        if job_edu_level > 0 and cand_edu_level > 0:
            conf += 0.05
        if cand_sal_min is not None and job_sal_max is not None:
            conf += 0.04
        confidence = round(min(0.96, conf), 2)

        # Reasoning
        exp_desc = f"{cand_exp:g} năm" if cand_exp is not None else "chưa rõ"
        min_exp_desc = f"{min_exp:g} năm" if min_exp else "không bắt buộc"
        status_text = "ĐẠT YÊU CẦU CỐT LÕI" if pass_hard_req else "CHƯA ĐẠT TIÊU CHÍ CỨNG"

        reasoning_parts = [
            f"Trạng thái: {status_text} ({match_score}/100 điểm).",
            f"Kỹ năng: Khớp {len(matched_skills)}/{len(required_skills)} yêu cầu ({', '.join(matched_skills[:4]) if matched_skills else 'không'}).",
        ]
        if missing_skills:
            reasoning_parts.append(f"Còn thiếu: {', '.join(missing_skills[:4])}.")
        reasoning_parts.append(f"Kinh nghiệm: {experience_alignment} ({exp_desc} so với yêu cầu {min_exp_desc}).")
        reasoning_parts.append(f"Đãi ngộ: {salary_status}.")
        if fail_reasons:
            reasoning_parts.append(f"Lý do chưa đạt: {' '.join(fail_reasons)}")

        reasoning = " ".join(reasoning_parts)

        return JevMatchVerdict(
            match_score=match_score,
            pass_hard_requirements=pass_hard_req,
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            experience_alignment=experience_alignment,
            confidence=confidence,
            reasoning=reasoning,
        )
