import sys
import re

sys.stdout.reconfigure(encoding="utf-8")

def _clean_notebooklm_answer(answer_text: str) -> str:
    if not answer_text:
        return ""
    
    # 1. Fix Mojibake if present
    try:
        if any(c in answer_text for c in ("Ã", "Â", "áº", "áº¥", "á»", "Ä", "Ã\xad", "Ã\xa0", "Ã´")):
            answer_text = answer_text.encode("latin1").decode("utf-8")
    except Exception:
        pass

    # 2. Strip disclaimer prefix
    disclaimer_pattern = r"^\[AI-GENERATED via Gemini 2\.5 \(NotebookLM\)[^\]]*\]\s*"
    answer_text = re.sub(disclaimer_pattern, "", answer_text, flags=re.IGNORECASE).strip()

    # 3. Strip Thoughts section
    if answer_text.startswith("Thoughts\n"):
        answer_text = answer_text[len("Thoughts\n"):].strip()
    elif "\nThoughts\n" in answer_text:
        answer_text = answer_text.split("\nThoughts\n", 1)[1].strip()

    # 4. Strip citation brackets & orphan footnote digits
    answer_text = re.sub(r"\[\d+\]", "", answer_text)
    # Remove lines containing ONLY digits or digits with trailing dot/colon
    lines = answer_text.split("\n")
    cleaned_lines = []
    for line in lines:
        stripped = line.strip()
        if re.match(r"^\d+[\.\:\,]?$", stripped):
            continue
        cleaned_lines.append(line)
    answer_text = "\n".join(cleaned_lines)

    # 5. Fix numbered section headers (e.g. "1. Mục tiêu" -> "\n\n### 1. Mục tiêu")
    answer_text = re.sub(r"\n\s*(\d+\.\s+[^\n]+)", r"\n\n### \1", answer_text)

    # 6. Normalize multiple blank lines to double newlines
    answer_text = re.sub(r"\n{3,}", "\n\n", answer_text)

    return answer_text.strip()

sample_raw = """
Quản lý dự án (Project Manager - PM) là người chịu trách nhiệm toàn diện và cuối cùng trong việc quản lý, điều hành dự án từ khi tiếp nhận cho đến khi bàn giao
1
.

Dưới đây là các trách nhiệm và nhiệm vụ chi tiết của vị trí này:
1. Mục tiêu công việc cốt lõi
Chịu trách nhiệm cuối cùng về tiến độ, chi phí, chất lượng, sự hài lòng của khách hàng và hiệu quả chung của dự án
1
.

Đóng vai trò trung tâm điều phối, kết nối toàn bộ chuỗi vận hành
1
2

2. Phạm vi quản lý trực tiếp
PM chịu trách nhiệm kiểm soát toàn bộ 7 yếu tố cốt lõi sau
2
:
Phạm vi công việc (Scope)
2

Tiến độ nội bộ (Schedule)
2
"""

print("AFTER CLEANING:\n", _clean_notebooklm_answer(sample_raw))
