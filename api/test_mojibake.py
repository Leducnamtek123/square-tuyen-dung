import sys
import json
import re

sys.stdout.reconfigure(encoding="utf-8")

def _fix_mojibake(text: str) -> str:
    if not text:
        return text
    try:
        if any(c in text for c in ("Ã", "Â", "áº", "áº¥", "á»", "Ä", "Ã\xad", "Ã\xa0", "Ã´")):
            return text.encode("latin1").decode("utf-8")
    except Exception:
        pass
    return text

def _clean_notebooklm_answer(answer_text: str) -> str:
    if not answer_text:
        return ""
    answer_text = _fix_mojibake(answer_text)
    disclaimer_pattern = r"^\[AI-GENERATED via Gemini 2\.5 \(NotebookLM\)[^\]]*\]\s*"
    answer_text = re.sub(disclaimer_pattern, "", answer_text, flags=re.IGNORECASE).strip()
    if answer_text.startswith("Thoughts\n"):
        answer_text = answer_text[len("Thoughts\n"):].strip()
    elif "\nThoughts\n" in answer_text:
        answer_text = answer_text.split("\nThoughts\n", 1)[1].strip()
    return _fix_mojibake(answer_text.strip())

sample_garbled = 'HÃ£y trÃ\xadch xuáº¥t tiÃªu chuáº©n tuyá»\x83n dá»¥ng vÃ\xa0 5 nhiá»\x87m vá»¥ quan trá»\x8dng nháº¥t cá»§a vá»\x8b trÃ\xad Quáº£n lÃ½ Dá»± Ã¡n (PM) theo bá»\x99 chuáº©n cÃ´ng ty'
print("Fixed Garbled:", _fix_mojibake(sample_garbled))

sample_answer = '[AI-GENERATED via Gemini 2.5 (NotebookLM) — answer synthesized]\n\nThoughts\nQuáº£n lÃ½ Dá»± Ã¡n (Project Manager - PM) lÃ\xa0 ngÆ°á»\x9di cá»§a cÃ´ng ty...'
print("Cleaned Answer:\n", _clean_notebooklm_answer(sample_answer))
