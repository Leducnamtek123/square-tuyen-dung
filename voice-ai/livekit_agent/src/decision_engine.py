from __future__ import annotations

import math
import re
import time
import unicodedata
from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class TurnIntent(str, Enum):
    HOSTILE_ABUSE = "HOSTILE_ABUSE"
    REFUSAL_OR_SKIP = "REFUSAL_OR_SKIP"
    NEED_CLARIFICATION_OR_HESITATION = "NEED_CLARIFICATION_OR_HESITATION"
    SUBSTANTIVE_ANSWER = "SUBSTANTIVE_ANSWER"
    SHALLOW_ANSWER = "SHALLOW_ANSWER"
    QUESTION_FOR_INTERVIEWER = "QUESTION_FOR_INTERVIEWER"
    END_INTERVIEW = "END_INTERVIEW"
    GREETING_READY = "GREETING_READY"
    PROCTORING_ACKNOWLEDGMENT = "PROCTORING_ACKNOWLEDGMENT"
    WHISPER_HALLUCINATION = "WHISPER_HALLUCINATION"
    UNKNOWN = "UNKNOWN"


@dataclass
class DecisionVerdict:
    intent: TurnIntent
    confidence: float
    reasoning: str
    metadata: dict[str, Any] = field(default_factory=dict)


def _strip_accents(value: str) -> str:
    normalized = unicodedata.normalize("NFD", value)
    return "".join(char for char in normalized if unicodedata.category(char) != "Mn")


def _normalize_text(value: str) -> str:
    return " ".join((value or "").split()).strip()


# Whisper hallucination patterns (YouTube outro phrases, silence artifacts)
_WHISPER_HALLUCINATIONS = (
    "ghien mi go",
    "ghiền mì gõ",
    "subscribe",
    "subcribe",
    "dang ky kenh",
    "đăng ký kênh",
    "like va share",
    "like và share",
    "like va sub",
    "like và sub",
    "cam on cac ban da theo doi",
    "cảm ơn các bạn đã theo dõi",
    "cam on cac ban da xem",
    "cảm ơn các bạn đã xem",
    "hen gap lai cac ban",
    "hẹn gặp lại các bạn",
    "chuc cac ban mot ngay",
    "chúc các bạn một ngày",
    "bam chuong thong bao",
    "bấm chuông thông báo",
    "chia se video",
    "chia sẻ video",
    "video hap dan",
    "video hấp dẫn",
    "khong bo lo",
    "không bỏ lỡ",
    "nhung video tiep theo",
    "những video tiếp theo",
)

# Regex patterns for fast, high-confidence matching
_HOSTILE_EXACT_ACRONYMS = re.compile(
    r"\b("
    r"đm|đcm|đmm|đcmm|đkm|dm|dcm|dmm|dcmm|dkm|"
    r"vcl|vkl|vl|clmm|cl|đéo|địt|đụ|cút|lồn|cặc|buồi|"
    r"fuck|fucking|bitch|asshole|shit|bullshit|bastard"
    r")\b",
    re.IGNORECASE,
)

_HOSTILE_PHRASES = (
    "cút đi",
    "cut di",
    "cút mẹ",
    "cut me",
    "biến đi",
    "bien di",
    "biến mẹ",
    "bien me",
    "biến luôn",
    "bien luon",
    "biến ngay",
    "bien ngay",
    "đụ má",
    "du ma",
    "đụ mẹ",
    "du me",
    "địt mẹ",
    "dit me",
    "má mày",
    "ma may",
    "mẹ mày",
    "me may",
    "bà mẹ mày",
    "ba me may",
    "mẹ kiếp",
    "me kiep",
    "mất dạy",
    "mat day",
    "vô học",
    "vo hoc",
    "vô văn hóa",
    "vo van hoa",
    "đồ ngu",
    "do ngu",
    "thằng ngu",
    "thang ngu",
    "con ngu",
    "con ngu lol",
    "óc chó",
    "oc cho",
    "óc bò",
    "oc bo",
    "bại não",
    "bai nao",
    "ngu vãi",
    "ngu vai",
    "ngu vcl",
    "ngu vl",
    "ngu như chó",
    "ngu nhu cho",
    "ngu như bò",
    "ngu nhu bo",
    "thằng chó",
    "thang cho",
    "đồ chó",
    "do cho",
    "chó chết",
    "cho chet",
    "thằng khùng",
    "thang khung",
    "con điên",
    "con dien",
    "đồ điên",
    "do dien",
    "bị điên",
    "bi dien",
    "bị khùng",
    "bi khung",
    "hãm lol",
    "ham lol",
    "hãm l",
    "ham l",
    "rác rưởi",
    "rac ruoi",
    "đồ rác",
    "do rac",
    "con cặc",
    "con cac",
    "ăn cặc",
    "an cac",
    "đầu buồi",
    "dau buoi",
    "con lồn",
    "con lon",
    "mặt lồn",
    "mat lon",
    "nói ngu",
    "noi ngu",
    "hỏi ngu",
    "hoi ngu",
    "hỏi ngáo",
    "hoi ngao",
    "hỏi nhảm",
    "hoi nham",
    "nói nhảm",
    "noi nham",
    "lảm nhảm",
    "lam nham",
    "nhảm nhí",
    "nham nhi",
    "con bot ngu",
    "bot ngu",
    "ai ngu",
    "ai rác",
    "ai rac",
    "bot dở hơi",
    "bot do hoi",
    "kệ mẹ tao",
    "ke me tao",
    "kệ mẹ mày",
    "ke me may",
    "kệ cha mày",
    "ke cha may",
    "bố mày",
    "bo may",
    "fuck you",
    "shut up",
    "get lost",
)

_REFUSAL_OR_SKIP_PHRASES = (
    "bỏ qua",
    "bo qua",
    "bỏ câu",
    "bo cau",
    "chuyển câu",
    "chuyen cau",
    "qua câu",
    "qua cau",
    "câu khác",
    "cau khac",
    "đổi câu",
    "doi cau",
    "next đi",
    "next di",
    "next câu",
    "next cau",
    "next",
    "skip đi",
    "skip di",
    "skip câu",
    "skip",
    "không biết",
    "khong biet",
    "chịu thôi",
    "chiu thoi",
    "không rõ",
    "khong ro",
    "không rành",
    "khong ranh",
    "không trả lời",
    "khong tra loi",
    "không muốn trả lời",
    "khong muon tra loi",
    "không thèm trả lời",
    "khong them tra loi",
    "miễn trả lời",
    "mien tra loi",
    "miễn bình luận",
    "mien binh luan",
    "không có gì để nói",
    "khong co gi de noi",
    "chưa tìm hiểu",
    "chua tim hieu",
    "chưa rõ phần này",
    "chua ro phan nay",
    "chưa chuẩn bị câu này",
    "chua chuan bi cau nay",
    "chưa có kinh nghiệm phần này",
    "chua co kinh nghiem phan nay",
    "chưa nắm rõ",
    "chua nam ro",
    "hết rồi",
    "het roi",
    "hết ý rồi",
    "het y roi",
    "chỉ vậy thôi",
    "chi vay thoi",
    "có vậy thôi",
    "co vay thoi",
    "vậy thôi",
    "vay thoi",
)

_END_INTERVIEW_PHRASES = (
    "chấm dứt phỏng vấn",
    "cham dut phong van",
    "dừng phỏng vấn",
    "dung phong van",
    "ngừng phỏng vấn",
    "ngung phong van",
    "kết thúc phỏng vấn",
    "ket thuc phong van",
    "không muốn phỏng vấn nữa",
    "khong muon phong van nua",
    "không phỏng vấn nữa",
    "khong phong van nua",
    "dừng tại đây",
    "dung tai day",
    "dừng ở đây",
    "dung o day",
    "kết thúc tại đây",
    "ket thuc tai day",
    "kết thúc ở đây",
    "ket thuc o day",
    "chấm dứt tại đây",
    "cham dut tai day",
    "chấm dứt ở đây",
    "cham dut o day",
    "chấm dứt cuộc phỏng vấn",
    "cham dut cuoc phong van",
    "kết thúc buổi phỏng vấn",
    "ket thuc buoi phong van",
    "mình muốn dừng",
    "minh muon dung",
    "tôi muốn dừng",
    "toi muon dung",
    "em muốn dừng",
    "em muon dung",
    "mình muốn kết thúc",
    "minh muon ket thuc",
    "em muốn kết thúc",
    "em muon ket thuc",
    "tôi muốn kết thúc",
    "toi muon ket thuc",
    "cho mình dừng",
    "cho minh dung",
    "cho em dừng",
    "cho em dung",
    "xin phép dừng",
    "xin phep dung",
    "xin dừng",
    "xin dung",
    "thôi mình nghỉ",
    "thoi minh nghi",
    "thôi dẹp",
    "thoi dep",
    "khỏi phỏng vấn",
    "khoi phong van",
    "chấm dứt",
    "cham dut",
    "hết câu hỏi rồi",
    "het cau hoi roi",
)

_QUESTION_FOR_INTERVIEWER_PREFIXES = (
    "cho em hỏi",
    "cho em hoi",
    "cho mình hỏi",
    "cho minh hoi",
    "cho tôi hỏi",
    "cho toi hoi",
    "anh cho em hỏi",
    "anh cho em hoi",
    "chị cho em hỏi",
    "chi cho em hoi",
    "em muốn hỏi",
    "em muon hoi",
    "mình muốn hỏi",
    "minh muon hoi",
    "tôi muốn hỏi",
    "toi muon hoi",
    "em có một câu hỏi",
    "em co mot cau hoi",
    "mình có câu hỏi",
    "minh co cau hoi",
    "cho hỏi",
    "cho hoi",
)

_QUESTION_FOR_INTERVIEWER_TOPICS = (
    "chế độ",
    "che do",
    "đãi ngộ",
    "dai ngo",
    "lương thưởng",
    "luong thuong",
    "mức lương",
    "muc luong",
    "lương",
    "luong",
    "bảo hiểm",
    "bao hiem",
    "phúc lợi",
    "phuc loi",
    "thưởng",
    "thuong",
    "quy trình tuyển dụng",
    "quy trinh tuyen dung",
    "lộ trình thăng tiến",
    "lo trinh thang tien",
    "văn hóa công ty",
    "van hoa cong ty",
    "môi trường làm việc",
    "moi truong lam viec",
    "thời gian thử việc",
    "thoi gian thu viec",
    "thử việc",
    "thu viec",
    "kết quả phỏng vấn",
    "ket qua phong van",
    "khi nào có kết quả",
    "khi nao co ket qua",
    "bao giờ có kết quả",
    "bao gio co ket qua",
    "bao lâu thì có kết quả",
    "bao lau thi co ket qua",
    "công ty có",
    "cong ty co",
    "dự án sắp tới",
    "du an sap toi",
    "tech stack",
    "công nghệ sử dụng",
    "cong nghe su dung",
    "team size",
    "quy mô đội ngũ",
    "quy mo doi ngu",
    "làm từ xa",
    "lam tu xa",
    "remote",
    "onsite",
    "hybrid",
    "ot",
    "overtime",
)

_CLARIFICATION_HESITATION_PHRASES = (
    "chưa nghe rõ",
    "chua nghe ro",
    "chưa nghe kịp",
    "chua nghe kip",
    "nghe chưa rõ",
    "nghe chua ro",
    "nhắc lại câu hỏi",
    "nhac lai cau hoi",
    "đọc lại câu hỏi",
    "doc lai cau hoi",
    "nói lại câu hỏi",
    "noi lai cau hoi",
    "hỏi lại được không",
    "hoi lai duoc khong",
    "nhắc lại được không",
    "nhac lai duoc khong",
    "nói lại được không",
    "noi lai duoc khong",
    "cho em xin câu hỏi",
    "cho em xin cau hoi",
    "câu hỏi là gì",
    "cau hoi la gi",
    "ý bạn là sao",
    "y ban la sao",
    "ý bạn là gì",
    "y ban la gi",
    "cho em suy nghĩ",
    "cho em suy nghi",
    "cho mình suy nghĩ",
    "cho minh suy nghi",
    "cho em một chút thời gian",
    "cho em mot chut thoi gian",
    "cho em một phút",
    "cho em mot phut",
    "chờ em một chút",
    "cho em mot chut",
    "đợi em một chút",
    "doi em mot chut",
    "đợi em một tí",
    "doi em mot ti",
    "để em nhớ lại",
    "de em nho lai",
    "để mình nhớ lại",
    "de minh nho lai",
    "để em nghĩ xem",
    "de em nghi xem",
    "hơi khó một chút",
    "hoi kho mot chut",
    "khó quá nhỉ",
    "kho qua nhi",
    "suy nghĩ một chút",
    "suy nghi mot chut",
    "suy nghĩ một tí",
    "suy nghi mot ti",
    "suy nghĩ tí",
    "suy nghi ti",
    "xin phép suy nghĩ",
    "xin phep suy nghi",
    "xin thêm thời gian",
    "xin them thoi gian",
)

_GREETING_READY_PHRASES = (
    "xin chào",
    "xin chao",
    "chào bạn",
    "chao ban",
    "chào anh",
    "chao anh",
    "chào chị",
    "chao chi",
    "sẵn sàng",
    "san sang",
    "bắt đầu được",
    "bat dau duoc",
    "bắt đầu đi",
    "bat dau di",
    "bắt đầu thôi",
    "bat dau thoi",
    "bắt đầu",
    "bat dau",
    "nghe rõ",
    "nghe ro",
    "nghe được",
    "nghe duoc",
    "nghe thấy",
    "nghe thay",
    "có nghe",
    "co nghe",
    "tín hiệu rõ",
    "tin hieu ro",
    "tín hiệu tốt",
    "tin hieu tot",
    "tương hiệu rõ",
    "tuong hieu ro",
    "tín hiệu",
    "tin hieu",
    "rõ rồi",
    "ro roi",
    "rõ ạ",
    "ro a",
    "dạ rõ",
    "da ro",
    "vâng rõ",
    "vang ro",
    "có rõ",
    "co ro",
    "rất rõ",
    "rat ro",
    "được rồi",
    "duoc roi",
    "tốt rồi",
    "tot roi",
)

_GREETING_READY_WORDS = {
    "hi",
    "hello",
    "chào",
    "chao",
    "alo",
    "ready",
    "ok",
    "okay",
}

_PROCTORING_ACKNOWLEDGMENT_PHRASES = (
    "em xin lỗi",
    "em xin loi",
    "dạ em xin lỗi",
    "da em xin loi",
    "em xin lỗi ạ",
    "em xin loi a",
    "dạ em xin lỗi ạ",
    "da em xin loi a",
    "xin lỗi bạn",
    "xin loi ban",
    "xin lỗi chị",
    "xin loi chi",
    "xin lỗi anh",
    "xin loi anh",
    "em lỡ tay",
    "em lo tay",
    "em bấm nhầm",
    "em bam nham",
    "bấm nhầm",
    "bam nham",
    "ấn nhầm",
    "an nham",
    "em bị lag",
    "em bi lag",
    "máy em bị lag",
    "may em bi lag",
    "mạng bị lag",
    "mang bi lag",
    "bị mất mạng",
    "bi mat mang",
    "mất kết nối",
    "mat ket noi",
    "mất tín hiệu",
    "mat tin hieu",
    "em quay lại rồi",
    "em quay lai roi",
    "em vừa quay lại",
    "em vua quay lai",
    "em đây rồi",
    "em day roi",
    "em vào lại rồi",
    "em vao lai roi",
    "dạ vâng em quay lại rồi",
    "da vang em quay lai roi",
    "dạ em đây rồi",
    "da em day roi",
    "em đây rồi",
    "em day roi",
    "dạ em hiểu rồi",
    "da em hieu roi",
    "em hiểu rồi ạ",
    "em hieu roi a",
    "vâng em hiểu rồi",
    "vang em hieu roi",
    "vâng em biết rồi",
    "vang em biet roi",
    "em sẽ chú ý",
    "em se chu y",
    "dạ em sẽ chú ý",
    "da em se chu y",
    "em rút kinh nghiệm",
    "em rut kinh nghiem",
    "em xin lỗi em vừa có việc",
    "em xin loi em vua co viec",
    "em xin lỗi em vừa bị mất tập trung",
    "em xin loi em vua bi mat tap trung",
    "em sơ ý quá",
    "em so y qua",
    "sorry",
    "em sorry",
)

_SUBSTANTIVE_KEYWORDS = {
    "kinh nghiệm",
    "kinh nghiem",
    "dự án",
    "du an",
    "công nghệ",
    "cong nghe",
    "phát triển",
    "phat trien",
    "xử lý",
    "xu ly",
    "kỹ năng",
    "ky nang",
    "triển khai",
    "trien khai",
    "quản lý",
    "quan ly",
    "tối ưu",
    "toi uu",
    "hệ thống",
    "he thong",
    "khách hàng",
    "khach hang",
    "thực hiện",
    "thuc hien",
    "phối hợp",
    "phoi hop",
    "kết quả",
    "ket qua",
    "giải pháp",
    "giai phap",
    "chức năng",
    "chuc nang",
    "tham gia",
    "đã từng",
    "da tung",
    "trách nhiệm",
    "trach nhiem",
    "chịu trách nhiệm",
    "chiu trach nhiem",
    "vận hành",
    "van hanh",
    "kiểm thử",
    "kiem thu",
    "tích hợp",
    "tich hop",
    "mô hình",
    "mo hinh",
    "kiến trúc",
    "kien truc",
    "cơ sở dữ liệu",
    "co so du lieu",
    "database",
    "backend",
    "frontend",
    "api",
    "microservices",
    "ci/cd",
    "docker",
    "react",
    "django",
    "python",
}


class VoiceDecisionEngine:
    """High-speed single-pass non-autoregressive decision engine (System 1 Flow Controller)

    calibrated for recruitment voice conversations under openJev-verdict-2.0 principles.
    Execution latency is strictly < 1ms on standard CPU.
    """

    def __init__(self, temperature: float = 1.2) -> None:
        self._temperature = max(0.1, float(temperature))

    def classify_turn(
        self,
        text: str | None,
        context: dict[str, Any] | None = None,
    ) -> DecisionVerdict:
        del context
        t_start = time.perf_counter()

        if not text:
            return DecisionVerdict(
                intent=TurnIntent.UNKNOWN,
                confidence=1.0,
                reasoning="Empty input text.",
                metadata={"latency_ms": (time.perf_counter() - t_start) * 1000},
            )

        raw_clean = _normalize_text(text)
        if not raw_clean:
            return DecisionVerdict(
                intent=TurnIntent.UNKNOWN,
                confidence=1.0,
                reasoning="Whitespace-only input text.",
                metadata={"latency_ms": (time.perf_counter() - t_start) * 1000},
            )

        lowered = raw_clean.lower()
        stripped = _strip_accents(lowered)

        # Early-exit: Detect Whisper silence/outro hallucinations
        for phrase in _WHISPER_HALLUCINATIONS:
            if phrase in lowered or phrase in stripped:
                return DecisionVerdict(
                    intent=TurnIntent.WHISPER_HALLUCINATION,
                    confidence=1.0,
                    reasoning=f"Matched Whisper hallucination pattern: '{phrase}'",
                    metadata={"latency_ms": (time.perf_counter() - t_start) * 1000},
                )

        clean_words_text = re.sub(r"[^\wÀ-ỹ\s]", " ", lowered)
        clean_words = clean_words_text.split()
        num_words = len(clean_words)
        char_count = len(lowered)

        # -------------------------------------------------------------
        # Single-Pass Non-Autoregressive Scorer with Logit Accumulation
        # -------------------------------------------------------------
        logits: dict[TurnIntent, float] = {
            TurnIntent.HOSTILE_ABUSE: 0.0,
            TurnIntent.REFUSAL_OR_SKIP: 0.0,
            TurnIntent.NEED_CLARIFICATION_OR_HESITATION: 0.0,
            TurnIntent.END_INTERVIEW: 0.0,
            TurnIntent.QUESTION_FOR_INTERVIEWER: 0.0,
            TurnIntent.GREETING_READY: 0.0,
            TurnIntent.PROCTORING_ACKNOWLEDGMENT: 0.0,
            TurnIntent.SUBSTANTIVE_ANSWER: 0.0,
            TurnIntent.SHALLOW_ANSWER: 0.0,
            TurnIntent.UNKNOWN: 0.0,
        }
        reasons: dict[TurnIntent, list[str]] = {intent: [] for intent in TurnIntent}

        # 1. HOSTILE_ABUSE Detection
        # Check acronyms/regex
        acronym_match = _HOSTILE_EXACT_ACRONYMS.search(lowered) or _HOSTILE_EXACT_ACRONYMS.search(stripped)
        if acronym_match:
            matched_word = acronym_match.group(0)
            logits[TurnIntent.HOSTILE_ABUSE] += 7.5
            reasons[TurnIntent.HOSTILE_ABUSE].append(f"Matched abusive acronym/slang '{matched_word}'")

        # Check abusive phrases
        for phrase in _HOSTILE_PHRASES:
            if phrase in lowered or phrase in stripped:
                logits[TurnIntent.HOSTILE_ABUSE] += 8.0
                reasons[TurnIntent.HOSTILE_ABUSE].append(f"Matched abusive phrase '{phrase}'")
                break

        # 2. END_INTERVIEW Detection
        for phrase in _END_INTERVIEW_PHRASES:
            if phrase in lowered or phrase in stripped:
                logits[TurnIntent.END_INTERVIEW] += 7.0
                reasons[TurnIntent.END_INTERVIEW].append(f"Matched end-interview marker '{phrase}'")
                break

        if num_words <= 4 and any(
            p in lowered or p in stripped
            for p in ("chấm dứt", "cham dut", "kết thúc", "ket thuc", "dừng lại", "dung lai", "xin dừng", "xin dung")
        ):
            logits[TurnIntent.END_INTERVIEW] += 6.5
            reasons[TurnIntent.END_INTERVIEW].append("Short explicit termination request")

        # 3. REFUSAL_OR_SKIP Detection
        if num_words <= 2 and clean_words:
            if clean_words[0] in {"skip", "next", "chịu", "chiu"}:
                logits[TurnIntent.REFUSAL_OR_SKIP] += 7.0
                reasons[TurnIntent.REFUSAL_OR_SKIP].append(f"Single-word skip trigger '{clean_words[0]}'")

        for phrase in _REFUSAL_OR_SKIP_PHRASES:
            if phrase in lowered or phrase in stripped:
                logits[TurnIntent.REFUSAL_OR_SKIP] += 6.5
                reasons[TurnIntent.REFUSAL_OR_SKIP].append(f"Matched skip/refusal phrase '{phrase}'")
                break

        # 4. NEED_CLARIFICATION_OR_HESITATION Detection
        for phrase in _CLARIFICATION_HESITATION_PHRASES:
            if phrase in lowered or phrase in stripped:
                logits[TurnIntent.NEED_CLARIFICATION_OR_HESITATION] += 7.5
                reasons[TurnIntent.NEED_CLARIFICATION_OR_HESITATION].append(
                    f"Matched clarification/hesitation marker '{phrase}'"
                )
                break

        # 5. QUESTION_FOR_INTERVIEWER Detection
        has_question_prefix = any(pfx in lowered or pfx in stripped for pfx in _QUESTION_FOR_INTERVIEWER_PREFIXES)
        has_question_topic = any(top in lowered or top in stripped for top in _QUESTION_FOR_INTERVIEWER_TOPICS)
        has_interrogative_mark = "?" in raw_clean or any(
            lowered.endswith(suffix)
            for suffix in ("không ạ?", "không ạ", "như thế nào?", "như thế nào", "ra sao?", "ra sao", "bao giờ?", "bao giờ", "được không?", "được không")
        )

        if has_question_prefix and (has_question_topic or has_interrogative_mark):
            logits[TurnIntent.QUESTION_FOR_INTERVIEWER] += 8.0
            reasons[TurnIntent.QUESTION_FOR_INTERVIEWER].append("Explicit question directed to employer with relevant topic/mark")
        elif has_question_prefix:
            logits[TurnIntent.QUESTION_FOR_INTERVIEWER] += 6.0
            reasons[TurnIntent.QUESTION_FOR_INTERVIEWER].append("Candidate question prefix detected")
        elif has_question_topic and has_interrogative_mark:
            logits[TurnIntent.QUESTION_FOR_INTERVIEWER] += 6.5
            reasons[TurnIntent.QUESTION_FOR_INTERVIEWER].append("Candidate inquiring about employment terms or process")

        # 5. GREETING_READY Detection
        if num_words <= 8 and char_count <= 60:
            matched_phrase = any(p in lowered or p in stripped for p in _GREETING_READY_PHRASES)
            matched_words = set(clean_words) & _GREETING_READY_WORDS
            if (matched_phrase or matched_words) and not has_question_prefix and logits[TurnIntent.HOSTILE_ABUSE] == 0:
                logits[TurnIntent.GREETING_READY] += 7.5
                reasons[TurnIntent.GREETING_READY].append(
                    "Matched greeting/readiness phrase or tokens"
                )

        # 6. PROCTORING_ACKNOWLEDGMENT Detection
        if num_words <= 15:
            for phrase in _PROCTORING_ACKNOWLEDGMENT_PHRASES:
                if phrase in lowered or phrase in stripped:
                    logits[TurnIntent.PROCTORING_ACKNOWLEDGMENT] += 7.5
                    reasons[TurnIntent.PROCTORING_ACKNOWLEDGMENT].append(
                        f"Matched proctoring acknowledgment/apology '{phrase}'"
                    )
                    break

        # 7. SUBSTANTIVE_ANSWER vs SHALLOW_ANSWER Evaluation
        # Only evaluate substantive vs shallow if no control/dialogue management intents dominate
        control_max_logit = max(
            logits[TurnIntent.HOSTILE_ABUSE],
            logits[TurnIntent.REFUSAL_OR_SKIP],
            logits[TurnIntent.NEED_CLARIFICATION_OR_HESITATION],
            logits[TurnIntent.END_INTERVIEW],
            logits[TurnIntent.QUESTION_FOR_INTERVIEWER],
            logits[TurnIntent.GREETING_READY],
            logits[TurnIntent.PROCTORING_ACKNOWLEDGMENT],
        )

        if control_max_logit == 0.0:
            # Count domain keywords
            kw_hits = [kw for kw in _SUBSTANTIVE_KEYWORDS if kw in lowered or kw in stripped]

            # Substantive heuristics
            if num_words >= 8 or char_count >= 30 or len(kw_hits) >= 2:
                sub_score = 6.5
                if num_words >= 12:
                    sub_score += 1.5
                if char_count >= 50:
                    sub_score += 1.0
                if kw_hits:
                    sub_score += min(2.0, len(kw_hits) * 0.5)
                logits[TurnIntent.SUBSTANTIVE_ANSWER] = sub_score
                reasons[TurnIntent.SUBSTANTIVE_ANSWER].append(
                    f"Substantive answer ({num_words} words, {char_count} chars, keywords: {kw_hits[:3]})"
                )
            elif num_words >= 1:
                # Brief / shallow response
                logits[TurnIntent.SHALLOW_ANSWER] = 6.5
                reasons[TurnIntent.SHALLOW_ANSWER].append(
                    f"Brief/shallow answer without elaboration ({num_words} words, {char_count} chars)"
                )

        # -------------------------------------------------------------
        # Calibrated Temperature Softmax & Verdict Generation
        # -------------------------------------------------------------
        # Determine dominant intent
        top_intent = max(logits, key=lambda k: logits[k])
        max_logit = logits[top_intent]

        if max_logit == 0.0:
            top_intent = TurnIntent.UNKNOWN
            calibrated_confidence = 0.5
            reasoning = "No recognizable conversational intent matched."
        else:
            # Apply temperature scaling across candidate intents
            exp_sum = sum(math.exp(v / self._temperature) for v in logits.values() if v > 0)
            if exp_sum > 0:
                top_prob = math.exp(max_logit / self._temperature) / (
                    exp_sum + math.exp(0.0)
                )
                # Calibrate confidence to range [0.80, 0.99] for strong hits
                calibrated_confidence = round(min(0.99, max(0.50, top_prob)), 4)
            else:
                calibrated_confidence = 0.85

            reasoning = "; ".join(reasons[top_intent]) or f"Classified as {top_intent.value}"

        elapsed_ms = (time.perf_counter() - t_start) * 1000

        return DecisionVerdict(
            intent=top_intent,
            confidence=calibrated_confidence,
            reasoning=reasoning,
            metadata={
                "latency_ms": round(elapsed_ms, 3),
                "num_words": num_words,
                "char_count": char_count,
                "raw_logits": {k.value: round(v, 2) for k, v in logits.items() if v > 0},
            },
        )


_default_engine = VoiceDecisionEngine()


def evaluate_candidate_turn(text: str) -> DecisionVerdict:
    """Module-level helper to evaluate candidate turn intent using the default VoiceDecisionEngine."""
    return _default_engine.classify_turn(text)
