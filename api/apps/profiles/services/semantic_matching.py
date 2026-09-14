# -*- coding: utf-8 -*-
from __future__ import annotations

import re
import math
import logging
from collections import Counter
from typing import Any

import fitz

logger = logging.getLogger(__name__)

STOP_WORDS_VI = {
    "và", "của", "các", "có", "được", "trong", "cho", "với", "là", "để", "tại", "những",
    "người", "khi", "từ", "này", "về", "một", "theo", "đã", "sẽ", "như", "nhiều", "cũng",
    "đến", "hay", "hoặc", "ra", "lại", "nào", "bởi", "thực", "hiện", "yêu", "cầu", "vị",
    "trí", "công", "việc", "quy", "định", "sau", "trước", "năm", "tháng", "ngày", "làm",
    "bạn", "họ", "chúng", "tôi", "anh", "chị", "em", "nơi", "nếu", "đang", "qua", "lên",
}


def _clean_tokenize(text: str) -> list[str]:
    if not text:
        return []
    cleaned = re.sub(r"[^\w\s\.\+\#\-]", " ", text.lower())
    tokens = cleaned.split()
    return [t for t in tokens if len(t) > 1 and t not in STOP_WORDS_VI]


def _extract_ngrams(tokens: list[str], n: int = 2) -> list[str]:
    if len(tokens) < n:
        return []
    return [" ".join(tokens[i : i + n]) for i in range(len(tokens) - n + 1)]


def extract_resume_full_text(resume: Any) -> str:
    parts: list[str] = []

    if getattr(resume, "title", None):
        parts.append(str(resume.title))
    if getattr(resume, "description", None):
        parts.append(str(resume.description))

    # Experience
    if hasattr(resume, "experiences"):
        for exp in resume.experiences.all():
            exp_text = f"{getattr(exp, 'position', '')} {getattr(exp, 'company_name', '')} {getattr(exp, 'description', '')}"
            parts.append(exp_text)

    # Education
    if hasattr(resume, "educations"):
        for edu in resume.educations.all():
            edu_text = f"{getattr(edu, 'school_name', '')} {getattr(edu, 'major', '')} {getattr(edu, 'degree', '')}"
            parts.append(edu_text)

    # Certificates
    if hasattr(resume, "certificates"):
        for cert in resume.certificates.all():
            parts.append(f"{getattr(cert, 'name', '')} {getattr(cert, 'training_place_name', '')}")

    # Skills
    if hasattr(resume, "advanced_skills"):
        for sk in resume.advanced_skills.all():
            parts.append(getattr(sk, "name", ""))

    # Language
    if hasattr(resume, "language_skills"):
        for lang in resume.language_skills.all():
            parts.append(f"{getattr(lang, 'language', '')} {getattr(lang, 'level', '')}")

    # Extract text from attached PDF if available
    file_obj = getattr(resume, "file", None)
    if file_obj:
        try:
            file_path = getattr(file_obj, "file", None)
            if file_path and hasattr(file_path, "path"):
                doc = fitz.open(file_path.path)
                pdf_text = " ".join(page.get_text() for page in doc)
                if pdf_text.strip():
                    parts.append(pdf_text)
                doc.close()
        except Exception as e:
            logger.warning("Could not parse PDF text from resume %s: %s", getattr(resume, "id", None), e)

    return " ".join(parts)


def extract_job_post_full_text(job_post: Any) -> str:
    parts: list[str] = []
    if getattr(job_post, "job_name", None):
        parts.append(str(job_post.job_name))
    if getattr(job_post, "job_description", None):
        parts.append(str(job_post.job_description))
    if getattr(job_post, "job_requirement", None):
        parts.append(str(job_post.job_requirement))
    if getattr(job_post, "benefits_enjoyed", None):
        parts.append(str(job_post.benefits_enjoyed))
    if getattr(job_post, "career", None):
        parts.append(getattr(job_post.career, "name", ""))
    if getattr(job_post, "position", None):
        parts.append(getattr(job_post.position, "name", ""))

    return " ".join(parts)


def calculate_semantic_similarity(text1: str, text2: str) -> tuple[float, list[str], list[str]]:
    tokens1 = _clean_tokenize(text1)
    tokens2 = _clean_tokenize(text2)

    if not tokens1 or not tokens2:
        return 0.0, [], []

    # Unigrams + Bigrams
    terms1 = tokens1 + _extract_ngrams(tokens1, 2)
    terms2 = tokens2 + _extract_ngrams(tokens2, 2)

    counter1 = Counter(terms1)
    counter2 = Counter(terms2)

    # Cosine similarity
    all_words = set(counter1.keys()).union(set(counter2.keys()))
    dot_product = sum(counter1[w] * counter2[w] for w in all_words)
    mag1 = math.sqrt(sum(val * val for val in counter1.values()))
    mag2 = math.sqrt(sum(val * val for val in counter2.values()))

    if mag1 == 0 or mag2 == 0:
        cosine = 0.0
    else:
        cosine = dot_product / (mag1 * mag2)

    # Jaccard overlap on unique terms
    set1 = set(terms1)
    set2 = set(terms2)
    intersection = set1.intersection(set2)
    union = set1.union(set2)
    jaccard = len(intersection) / len(union) if union else 0.0

    # Combined score
    score = (cosine * 0.7 + jaccard * 0.3) * 100.0
    score = min(100.0, max(0.0, score))

    matched_key_terms = sorted(list(intersection), key=lambda x: len(x), reverse=True)[:15]

    jd_top_terms = [w for w, _ in counter2.most_common(25) if " " in w or len(w) >= 4]
    missing_terms = [w for w in jd_top_terms if w not in set1][:8]

    return score, matched_key_terms, missing_terms


def evaluate_cv_jd_semantic_match(resume: Any, job_post: Any, manual_job_text: str = "") -> dict:
    resume_text = extract_resume_full_text(resume) if resume else ""
    job_text = extract_job_post_full_text(job_post) if job_post else manual_job_text

    raw_similarity, matched_skills, missing_skills = calculate_semantic_similarity(resume_text, job_text)

    # Multi-dimensional heuristics
    skills_score = min(100.0, raw_similarity * 1.6 + 20.0)

    exp_score = 75.0
    if job_post and resume:
        job_exp = getattr(job_post, "experience", None)
        res_exp = getattr(resume, "experience", None)
        if job_exp is not None and res_exp is not None:
            if res_exp >= job_exp:
                exp_score = 95.0
            else:
                diff = job_exp - res_exp
                exp_score = max(40.0, 90.0 - diff * 20.0)

    domain_score = 70.0
    if job_post and resume:
        job_career = getattr(job_post, "career_id", None)
        res_career = getattr(resume, "career_id", None)
        if job_career and res_career:
            domain_score = 95.0 if job_career == res_career else 50.0

    edu_score = 80.0
    if resume and hasattr(resume, "educations") and resume.educations.exists():
        edu_score = 90.0

    # Final weighted semantic score
    overall_score = (
        skills_score * 0.45 +
        exp_score * 0.25 +
        domain_score * 0.15 +
        edu_score * 0.15
    )
    overall_score = round(min(98.0, max(15.0, overall_score)), 1)

    if overall_score >= 85:
        fit_level = "Xuất sắc"
        recommendation = "Hồ sơ ứng viên có độ tương thích cao vượt trội về kỹ năng và kinh nghiệm so với mô tả công việc, nên ưu tiên phỏng vấn ngay."
    elif overall_score >= 70:
        fit_level = "Rất phù hợp"
        recommendation = "Hồ sơ ứng viên đáp ứng đầy đủ các tiêu chuẩn trọng tâm của vị trí tuyển dụng, tiềm năng phát triển tốt trong môi trường công ty."
    elif overall_score >= 55:
        fit_level = "Tương thích khá"
        recommendation = "Ứng viên đáp ứng phần lớn kỹ năng cơ bản nhưng cần đánh giá thêm một số kỹ năng chuyên sâu qua vòng phỏng vấn nghiệp vụ."
    else:
        fit_level = "Cần xem xét thêm"
        recommendation = "Hồ sơ còn thiếu một số kỹ năng then chốt của vị trí tuyển dụng, cần kiểm tra kỹ năng thực hành và định hướng công việc."

    return {
        "semantic_score": overall_score,
        "fit_level": fit_level,
        "matched_skills": matched_skills[:10],
        "missing_skills": missing_skills[:6],
        "dimension_scores": {
            "skills_overlap": round(skills_score, 1),
            "experience_fit": round(exp_score, 1),
            "domain_relevance": round(domain_score, 1),
            "education_fit": round(edu_score, 1),
        },
        "ai_recommendation": recommendation,
        "resume_id": getattr(resume, "id", None),
        "job_post_id": getattr(job_post, "id", None),
    }

