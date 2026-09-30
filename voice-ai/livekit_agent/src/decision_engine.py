from __future__ import annotations

import math
import re
import time
import unicodedata
from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class TurnIntent(str, Enum):
    """Mục đích (Intent) của lượt nói từ ứng viên trong phỏng vấn tuyển dụng AI."""

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
    """Kết quả phân loại lượt nói candidate kèm độ tin cậy và siêu dữ liệu kiểm định."""

    intent: TurnIntent
    confidence: float
    reasoning: str
    metadata: dict[str, Any] = field(default_factory=dict)


def _strip_accents(value: str) -> str:
    """Loại bỏ dấu tiếng Việt để đối sánh linh hoạt giữa chuỗi có dấu và không dấu."""
    normalized = unicodedata.normalize("NFD", value)
    return "".join(char for char in normalized if unicodedata.category(char) != "Mn")


def _normalize_text(value: str) -> str:
    """Chuẩn hóa khoảng trắng và cắt bỏ khoảng trắng thừa ở hai đầu."""
    return " ".join((value or "").split()).strip()


# =============================================================================
# 1. WHISPER HALLUCINATIONS & AUDIO ARTIFACTS
# (Ảo giác Whisper khi khoảng lặng kéo dài hoặc âm thanh nền YouTube)
# =============================================================================
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
    "hãy like và subscribe",
    "hay like va subscribe",
    "đừng quên like",
    "dung quen like",
    "đừng quên đăng ký",
    "dung quen dang ky",
    "nhấn chuông",
    "nhan chuong",
    "tạm biệt và hẹn gặp lại",
    "tam biet va hen gap lai",
    "hẹn gặp lại ở video sau",
    "hen gap lai o video sau",
    "xem video vui vẻ",
    "xem video vui ve",
    "cảm ơn bạn đã lắng nghe",
    "cam on ban da lang nghe",
)

_WHISPER_AUDIO_ARTIFACT_REGEX = re.compile(
    r"^[\[\(]\s*(?:âm nhạc|am nhac|tiếng cười|tieng cuoi|tiếng vỗ tay|tieng vo tay|"
    r"music|applause|laughter|silence|sound|background noise|tiếng ồn|tieng on)\s*[\]\)]$",
    re.IGNORECASE,
)


# =============================================================================
# 2. HOSTILE & ABUSIVE LANGUAGE PATTERNS
# (Từ ngữ thô tục, chửi thề, xúc phạm AI interviewer hoặc tổ chức)
# =============================================================================
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

# Regex tổng hợp đối sánh từ/cụm từ thô tục ở ranh giới từ (\b) để tránh false positives
# (ví dụ 'tài nguyên' không bị kích hoạt nhầm bởi 'ai ngu', 'học bổng' không bị kích hoạt bởi 'oc bo')
_HOSTILE_REGEX = re.compile(
    r"\b("
    r"đm|đcm|đmm|đcmm|đkm|dm|dcm|dmm|dcmm|dkm|"
    r"vcl|vkl|vl|clmm|cl|đéo|địt|đụ|cút|lồn|cặc|buồi|"
    r"fuck|fucking|bitch|asshole|shit|bullshit|bastard|"
    + "|".join(re.escape(p) for p in sorted(_HOSTILE_PHRASES, key=len, reverse=True))
    + r")\b",
    re.IGNORECASE,
)


# =============================================================================
# 3. REFUSAL OR SKIP PATTERNS
# (Ứng viên từ chối trả lời, xin đổi câu hỏi hoặc thừa nhận không nắm rõ)
# =============================================================================
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
    "pass đi",
    "pass di",
    "pass câu",
    "pass cau",
    "pass",
    "cho em pass",
    "cho em qua",
    "em xin bỏ qua",
    "em xin bo qua",
    "cho em bỏ qua",
    "cho em bo qua",
    "bỏ qua câu này",
    "bo qua cau nay",
    "không biết",
    "khong biet",
    "em không biết",
    "em khong biet",
    "chịu thôi",
    "chiu thoi",
    "em chịu",
    "em chiu",
    "không rõ",
    "khong ro",
    "em không rõ",
    "em khong ro",
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
    "chưa biết phần này",
    "chua biet phan nay",
    "không có câu trả lời",
    "khong co cau tra loi",
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


# =============================================================================
# 4. END INTERVIEW PATTERNS
# (Yêu cầu chấm dứt hoặc rút lui khỏi buổi phỏng vấn)
# =============================================================================
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
    "dừng buổi phỏng vấn",
    "dung buoi phong van",
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
    "em xin dừng",
    "em xin dung",
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
    "hủy phỏng vấn",
    "huy phong van",
)


# =============================================================================
# 5. QUESTION FOR INTERVIEWER PATTERNS
# (Ứng viên hỏi ngược lại nhà tuyển dụng về quyền lợi, công ty, quy trình)
# =============================================================================
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
    "thời gian làm việc",
    "thoi gian lam viec",
    "địa điểm làm việc",
    "dia diem lam viec",
)


# =============================================================================
# 6. NEED CLARIFICATION OR HESITATION PATTERNS
# (Yêu cầu nhắc lại câu hỏi hoặc xin thêm thời gian suy nghĩ)
# =============================================================================
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
    "cho em xin lại câu hỏi",
    "cho em xin lai cau hoi",
    "câu hỏi là gì",
    "cau hoi la gi",
    "ý bạn là sao",
    "y ban la sao",
    "ý bạn là gì",
    "y ban la gi",
    "nhắc lại giúp em",
    "nhac lai giup em",
    "chị nhắc lại giúp em",
    "chi nhac lai giup em",
    "anh nhắc lại giúp em",
    "anh nhac lai giup em",
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
    "chờ em tí",
    "cho em ti",
    "đợi em tí",
    "doi em ti",
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
    "em chưa load kịp",
    "em chua load kip",
)


# =============================================================================
# 7. GREETING & READY PATTERNS
# (Chào hỏi ban đầu, xác nhận tín hiệu âm thanh và sẵn sàng bắt đầu)
# =============================================================================
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


# =============================================================================
# 8. PROCTORING ACKNOWLEDGMENT PATTERNS
# (Xác nhận cảnh báo giám sát thi/phỏng vấn, mở camera, mic, tuân thủ quy định)
# =============================================================================
_PROCTORING_ACKNOWLEDGMENT_PHRASES = (
    # Lời xin lỗi hoặc sự cố kỹ thuật
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
    "sorry",
    "em sorry",
    "em sơ ý quá",
    "em so y qua",
    # Hiểu quy định và tiếp thu nhắc nhở
    "vâng em hiểu",
    "vang em hieu",
    "dạ em hiểu",
    "da em hieu",
    "em đã hiểu",
    "em da hieu",
    "em hiểu rồi",
    "em hieu roi",
    "em hiểu rồi ạ",
    "em hieu roi a",
    "dạ em hiểu rồi",
    "da em hieu roi",
    "dạ em hiểu rồi ạ",
    "da em hieu roi a",
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
    "em hiểu quy định",
    "em hieu quy dinh",
    "dạ em hiểu quy định",
    "da em hieu quy dinh",
    "vâng em hiểu quy định",
    "vang em hieu quy dinh",
    "em nắm rõ quy định",
    "em nam ro quy dinh",
    "em đã rõ quy định",
    "em da ro quy dinh",
    "tuân thủ quy định",
    "tuan thu quy dinh",
    "em tuân thủ quy định",
    "em tuan thu quy dinh",
    "theo đúng quy định",
    "theo dung quy dinh",
    # Sẵn sàng theo quy định
    "em đã sẵn sàng theo quy định",
    "em da san sang theo quy dinh",
    "sẵn sàng theo quy định",
    "san sang theo quy dinh",
    "sẵn sàng theo đúng quy định",
    "san sang theo dung quy dinh",
    "em sẵn sàng theo quy định",
    "em san sang theo quy dinh",
    "sẵn sàng tuân thủ quy định",
    "san sang tuan thu quy dinh",
    # Thiết bị: Camera, Microphone, Screen share, Môi trường phòng
    "em đã mở camera",
    "em da mo camera",
    "em đã bật camera",
    "em da bat camera",
    "em mở camera rồi",
    "em mo camera roi",
    "em bật camera rồi",
    "em bat camera roi",
    "em mở cam rồi",
    "em mo cam roi",
    "em bật cam rồi",
    "em bat cam roi",
    "đã mở camera",
    "da mo camera",
    "đã bật camera",
    "da bat camera",
    "đã mở cam",
    "da mo cam",
    "đã bật cam",
    "da bat cam",
    "mở camera rồi",
    "mo camera roi",
    "bật camera rồi",
    "bat camera roi",
    "bật lại camera",
    "bat lai camera",
    "mở lại camera",
    "mo lai camera",
    "em đã bật lại camera",
    "em da bat lai camera",
    "em đã mở lại camera",
    "em da mo lai camera",
    "em chỉnh lại camera",
    "em chinh lai camera",
    "em chỉnh góc quay",
    "em chinh goc quay",
    "chỉnh lại góc máy",
    "chinh lai goc may",
    "em đã mở mic",
    "em da mo mic",
    "em đã bật mic",
    "em da bat mic",
    "em mở mic rồi",
    "em mo mic roi",
    "em bật mic rồi",
    "em bat mic roi",
    "đã bật mic",
    "da bat mic",
    "đã mở mic",
    "da mo mic",
    "em đã chia sẻ màn hình",
    "em da chia se man hinh",
    "chia sẻ màn hình rồi",
    "chia se man hinh roi",
    "em share màn hình rồi",
    "em share man hinh roi",
    "đã chia sẻ màn hình",
    "da chia se man hinh",
    "em ngồi một mình",
    "em ngoi mot minh",
    "chỉ có một mình em",
    "chi co mot minh em",
    "không có ai trong phòng",
    "khong co ai trong phong",
    "xung quanh không có ai",
    "xung quanh khong co ai",
    "không có ai khác",
    "khong co ai khac",
    "em đã tắt tab",
    "em da tat tab",
    "đã tắt trình duyệt",
    "da tat trinh duyet",
    "đã đóng ứng dụng",
    "da dong ung dung",
    "nhìn thẳng vào camera",
    "nhin thang vao camera",
    "nhìn vào camera rồi",
    "nhin vao camera roi",
    "tập trung vào màn hình",
    "tap trung vao man hinh",
)


# =============================================================================
# 9. SUBSTANTIVE & STAR METHOD DOMAIN INDICATORS
# (Chỉ số phương pháp STAR: Tình huống, Nhiệm vụ, Giải pháp, Kết quả, Bài học, Số liệu %, Dự án)
# =============================================================================
_STAR_SITUATION_PHRASES = (
    "tình huống",
    "tinh huong",
    "bối cảnh",
    "boi canh",
    "hoàn cảnh",
    "hoan canh",
    "thời điểm đó",
    "thoi diem do",
    "khi đó",
    "khi do",
    "vấn đề gặp phải",
    "van de gap phai",
    "vấn đề là",
    "van de la",
    "thách thức",
    "thach thuc",
    "sự cố",
    "su co",
    "khó khăn gặp phải",
    "kho khan gap phai",
    "khó khăn lớn nhất",
    "kho khan lon nhat",
    "gặp khó khăn",
    "gap kho khan",
    "case study",
    "scenario",
    "hệ thống bị nghẽn",
    "he thong bi nghen",
    "bị quá tải",
    "bi qua tai",
    "bị lỗi",
    "bi loi",
    "phát sinh lỗi",
    "phat sinh loi",
)

_STAR_TASK_PHRASES = (
    "nhiệm vụ",
    "nhiem vu",
    "mục tiêu",
    "muc tieu",
    "trách nhiệm của em",
    "trach nhiem cua em",
    "trách nhiệm của tôi",
    "trach nhiem cua toi",
    "vai trò của em",
    "vai tro cua em",
    "vai trò của tôi",
    "vai tro cua toi",
    "yêu cầu đặt ra",
    "yeu cau dat ra",
    "được giao",
    "duoc giao",
    "phụ trách",
    "phu trach",
    "đảm nhận",
    "dam nhan",
    "được phân công",
    "duoc phan cong",
    "chỉ tiêu",
    "chi tieu",
    "target",
    "kpi",
    "deadline",
)

_STAR_ACTION_PHRASES = (
    "giải pháp",
    "giai phap",
    "phương án",
    "phuong an",
    "biện pháp",
    "bien phap",
    "hành động",
    "hanh dong",
    "tiến hành",
    "tien hanh",
    "triển khai",
    "trien khai",
    "áp dụng",
    "ap dung",
    "xử lý bằng cách",
    "xu ly bang cach",
    "khắc phục bằng",
    "khac phuc bang",
    "đề xuất",
    "de xuat",
    "thiết kế kiến trúc",
    "thiet ke kien truc",
    "tối ưu hóa",
    "toi uu hoa",
    "tối ưu",
    "toi uu",
    "refactor",
    "viết lại",
    "viet lai",
    "tái cấu trúc",
    "tai cau truc",
    "bắt tay vào",
    "bat tay vao",
    "xây dựng pipeline",
    "xay dung pipeline",
    "cấu hình",
    "cau hinh",
    "sử dụng redis",
    "su dung redis",
    "sử dụng kafka",
    "su dung kafka",
    "đưa ra giải pháp",
    "dua ra giai phap",
)

_STAR_RESULT_PHRASES = (
    "kết quả",
    "ket qua",
    "đạt được",
    "dat duoc",
    "mang lại",
    "mang lai",
    "thành công",
    "thanh cong",
    "giúp cho",
    "giup cho",
    "hoàn thành",
    "hoan thanh",
    "bàn giao",
    "ban giao",
    "outcome",
    "output",
    "nghiệm thu",
    "nghiem thu",
    "hiệu quả mang lại",
    "hieu qua mang lai",
)

_STAR_LESSON_PHRASES = (
    "bài học",
    "bai hoc",
    "rút ra bài học",
    "rut ra bai hoc",
    "kinh nghiệm rút ra",
    "kinh nghiem rut ra",
    "bài học kinh nghiệm",
    "bai hoc kinh nghiem",
    "sau lần đó",
    "sau lan do",
    "từ đó cải thiện",
    "tu do cai thien",
    "rút kinh nghiệm",
    "rut kinh nghiem",
    "nhận ra rằng",
    "nhan ra rang",
    "bài học đắt giá",
    "bai hoc dat gia",
)

_STAR_PROJECT_PHRASES = (
    "dự án",
    "du an",
    "project",
    "hệ thống",
    "he thong",
    "sản phẩm",
    "san pham",
    "platform",
    "nền tảng",
    "nen tang",
    "ứng dụng",
    "ung dung",
    "module",
    "microservice",
    "microservices",
    "database",
)

_STAR_METRICS_REGEX = re.compile(
    r"("
    r"\b\d+(?:[.,]\d+)?\s*%\b|"
    r"\b\d+(?:[.,]\d+)?\s*(?:phần trăm|phan tram)\b|"
    r"\b\d+x\b|"
    r"\b(?:gấp đôi|gap doi|gấp ba|gap ba|tăng gấp|tang gap)\b|"
    r"\b\d+\s*(?:ms|giây|s|phút|min|giờ|h)\b|"
    r"\b\d+\s*(?:tps|rps|qps|req/s|request/s)\b|"
    r"\b\d+(?:[.,]\d+)?\s*(?:k|triệu|trieu|m|b|tỷ|ty)\s*(?:user|người dùng|nguoi dung|request|lượt truy cập|doanh thu|đơn hàng|don hang)?\b"
    r")",
    re.IGNORECASE,
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


def _detect_star_indicators(lowered: str, stripped: str) -> dict[str, Any]:
    """Phát hiện các thành tố của phương pháp STAR (Situation, Task, Action, Result/Lesson)

    cùng các chỉ số đo lường số liệu (%) và bối cảnh dự án để tăng cường độ tin cậy cho SUBSTANTIVE_ANSWER.
    """
    has_situation = any(p in lowered or p in stripped for p in _STAR_SITUATION_PHRASES)
    has_task = any(p in lowered or p in stripped for p in _STAR_TASK_PHRASES)
    has_action = any(p in lowered or p in stripped for p in _STAR_ACTION_PHRASES)
    has_result = any(p in lowered or p in stripped for p in _STAR_RESULT_PHRASES)
    has_lesson = any(p in lowered or p in stripped for p in _STAR_LESSON_PHRASES)
    has_project = any(p in lowered or p in stripped for p in _STAR_PROJECT_PHRASES)

    metrics_matches = [m.group(0).strip() for m in _STAR_METRICS_REGEX.finditer(lowered)]
    has_metrics = len(metrics_matches) > 0

    star_dimensions: list[str] = []
    if has_situation:
        star_dimensions.append("Situation (Tình huống)")
    if has_task:
        star_dimensions.append("Task (Nhiệm vụ)")
    if has_action:
        star_dimensions.append("Action (Giải pháp)")
    if has_result or has_lesson or has_metrics:
        star_dimensions.append("Result/Lesson/Metrics (Kết quả/Bài học/Số liệu)")

    return {
        "star_dimensions": star_dimensions,
        "has_situation": has_situation,
        "has_task": has_task,
        "has_action": has_action,
        "has_result": has_result,
        "has_lesson": has_lesson,
        "has_project": has_project,
        "has_metrics": has_metrics,
        "metrics_matches": metrics_matches,
        "star_count": len(star_dimensions),
    }


# =============================================================================
# 10. VOICE DECISION ENGINE (SYSTEM 1 CONTROLLER)
# =============================================================================
class VoiceDecisionEngine:
    """Bộ máy phân loại lượt nói candidate thời gian thực (Jev System 1 Decision Engine).

    Được hiệu chuẩn cho hội thoại phỏng vấn tuyển dụng AI theo tiêu chuẩn openJev-verdict-2.0.
    Độ trễ xử lý cam kết nghiêm ngặt < 1ms trên CPU thông thường nhờ thuật toán
    tích lũy logit đơn lượt (single-pass non-autoregressive logit accumulation)
    kết hợp chuẩn hóa xác suất Softmax có hiệu chỉnh nhiệt độ (calibrated temperature softmax).
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

        # -------------------------------------------------------------
        # Early-exit 1: Whisper audio artifacts trong ngoặc đơn/vuông
        # -------------------------------------------------------------
        if _WHISPER_AUDIO_ARTIFACT_REGEX.match(raw_clean) or lowered in {
            "[âm nhạc]",
            "[am nhac]",
            "[tiếng cười]",
            "[tieng cuoi]",
            "[tiếng vỗ tay]",
            "[tieng vo tay]",
            "[music]",
            "[applause]",
            "[laughter]",
            "[silence]",
            "[sound]",
            "(âm nhạc)",
            "(am nhac)",
            "(tiếng vỗ tay)",
        }:
            return DecisionVerdict(
                intent=TurnIntent.WHISPER_HALLUCINATION,
                confidence=1.0,
                reasoning="Matched Whisper audio artifact pattern",
                metadata={"latency_ms": (time.perf_counter() - t_start) * 1000},
            )

        # -------------------------------------------------------------
        # Early-exit 2: Whisper YouTube outro hallucinations
        # -------------------------------------------------------------
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

        # Nếu không có từ nào (chỉ toàn dấu câu vô nghĩa e.g. "...???")
        if num_words == 0:
            return DecisionVerdict(
                intent=TurnIntent.UNKNOWN,
                confidence=0.5,
                reasoning="Punctuation-only or symbol-only input without words.",
                metadata={
                    "latency_ms": (time.perf_counter() - t_start) * 1000,
                    "num_words": 0,
                    "char_count": char_count,
                },
            )

        # -------------------------------------------------------------
        # Single-Pass Non-Autoregressive Scorer with Logit Accumulation
        # -------------------------------------------------------------
        logits: dict[TurnIntent, float] = {
            TurnIntent.HOSTILE_ABUSE: 0.0,
            TurnIntent.REFUSAL_OR_SKIP: 0.0,
            TurnIntent.NEED_CLARIFICATION_OR_HESITATION: 0.0,
            TurnIntent.END_INTERVIEW: 0.0,
            TurnIntent.QUESTION_FOR_INTERVIEWER: 0.0,
            TurnIntent.PROCTORING_ACKNOWLEDGMENT: 0.0,
            TurnIntent.GREETING_READY: 0.0,
            TurnIntent.SUBSTANTIVE_ANSWER: 0.0,
            TurnIntent.SHALLOW_ANSWER: 0.0,
            TurnIntent.UNKNOWN: 0.0,
        }
        reasons: dict[TurnIntent, list[str]] = {intent: [] for intent in TurnIntent}

        # 1. HOSTILE_ABUSE Detection (Word-boundary matching to prevent false positives)
        hostile_match = _HOSTILE_REGEX.search(lowered) or _HOSTILE_REGEX.search(stripped)
        if hostile_match:
            matched_term = hostile_match.group(0)
            logits[TurnIntent.HOSTILE_ABUSE] += 8.0
            reasons[TurnIntent.HOSTILE_ABUSE].append(f"Matched abusive word/phrase '{matched_term}'")

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
            if clean_words[0] in {"skip", "next", "chịu", "chiu", "pass"}:
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
            for suffix in (
                "không ạ?",
                "không ạ",
                "như thế nào?",
                "như thế nào",
                "ra sao?",
                "ra sao",
                "bao giờ?",
                "bao giờ",
                "được không?",
                "được không",
            )
        )

        if has_question_prefix and (has_question_topic or has_interrogative_mark):
            logits[TurnIntent.QUESTION_FOR_INTERVIEWER] += 8.0
            reasons[TurnIntent.QUESTION_FOR_INTERVIEWER].append(
                "Explicit question directed to employer with relevant topic/mark"
            )
        elif has_question_prefix:
            logits[TurnIntent.QUESTION_FOR_INTERVIEWER] += 6.0
            reasons[TurnIntent.QUESTION_FOR_INTERVIEWER].append("Candidate question prefix detected")
        elif has_question_topic and has_interrogative_mark:
            logits[TurnIntent.QUESTION_FOR_INTERVIEWER] += 6.5
            reasons[TurnIntent.QUESTION_FOR_INTERVIEWER].append("Candidate inquiring about employment terms or process")

        # 6. PROCTORING_ACKNOWLEDGMENT Detection
        # Nhận diện phản hồi quy định giám sát, bật camera, mic, chia sẻ màn hình, xin lỗi hoặc xác nhận hiểu quy định
        if num_words <= 25 and logits[TurnIntent.HOSTILE_ABUSE] == 0:
            for phrase in _PROCTORING_ACKNOWLEDGMENT_PHRASES:
                if phrase in lowered or phrase in stripped:
                    logits[TurnIntent.PROCTORING_ACKNOWLEDGMENT] += 8.5
                    reasons[TurnIntent.PROCTORING_ACKNOWLEDGMENT].append(
                        f"Matched proctoring acknowledgment marker '{phrase}'"
                    )
                    break

        # 7. GREETING_READY Detection
        # Chỉ kích hoạt nếu không phải proctoring acknowledgment và không phải câu hỏi
        if (
            num_words <= 8
            and char_count <= 60
            and logits[TurnIntent.PROCTORING_ACKNOWLEDGMENT] == 0
            and logits[TurnIntent.HOSTILE_ABUSE] == 0
            and not has_question_prefix
        ):
            matched_phrase = any(p in lowered or p in stripped for p in _GREETING_READY_PHRASES)
            matched_words = set(clean_words) & _GREETING_READY_WORDS
            if matched_phrase or matched_words:
                logits[TurnIntent.GREETING_READY] += 7.5
                reasons[TurnIntent.GREETING_READY].append(
                    "Matched greeting/readiness phrase or tokens"
                )

        # -------------------------------------------------------------
        # 8. SUBSTANTIVE_ANSWER vs SHALLOW_ANSWER Evaluation (STAR Boosted)
        # -------------------------------------------------------------
        star_info: dict[str, Any] = {}
        control_max_logit = max(
            logits[TurnIntent.HOSTILE_ABUSE],
            logits[TurnIntent.REFUSAL_OR_SKIP],
            logits[TurnIntent.NEED_CLARIFICATION_OR_HESITATION],
            logits[TurnIntent.END_INTERVIEW],
            logits[TurnIntent.QUESTION_FOR_INTERVIEWER],
            logits[TurnIntent.PROCTORING_ACKNOWLEDGMENT],
            logits[TurnIntent.GREETING_READY],
        )

        if control_max_logit == 0.0:
            # Phân tích phương pháp STAR & chỉ số số liệu
            star_info = _detect_star_indicators(lowered, stripped)
            star_count = star_info["star_count"]
            has_metrics = star_info["has_metrics"]
            has_project = star_info["has_project"]

            # Từ khóa miền kỹ thuật/nghiệp vụ
            kw_hits = [kw for kw in _SUBSTANTIVE_KEYWORDS if kw in lowered or kw in stripped]

            # Điểm cộng dồn STAR (tình huống, nhiệm vụ, giải pháp, kết quả/bài học, số liệu %, dự án)
            star_score = star_count * 1.5 + (1.0 if has_metrics else 0.0) + (0.5 if has_project else 0.0)

            if num_words < 5 and star_count == 0 and len(kw_hits) == 0:
                # Cộc lốc, ngắn gọn < 5 từ, thiếu chi tiết
                logits[TurnIntent.SHALLOW_ANSWER] = 7.5
                reasons[TurnIntent.SHALLOW_ANSWER].append(
                    f"Brief/shallow answer without elaboration ({num_words} words, {char_count} chars, lack of detail)"
                )
            elif (
                star_count >= 1
                or len(kw_hits) >= 2
                or num_words >= 8
                or (num_words >= 5 and (has_metrics or has_project))
            ):
                # Câu trả lời đầy đủ, chất lượng, có cấu trúc STAR hoặc kiến thức chuyên môn
                sub_score = 6.5
                if num_words >= 12:
                    sub_score += 1.0
                if num_words >= 20:
                    sub_score += 1.0
                if char_count >= 60:
                    sub_score += 0.5
                if kw_hits:
                    sub_score += min(2.5, len(kw_hits) * 0.5)
                if star_count > 0 or has_metrics:
                    sub_score += min(3.5, star_score)

                logits[TurnIntent.SUBSTANTIVE_ANSWER] = sub_score

                desc_parts = [f"Substantive answer ({num_words} words, {char_count} chars)"]
                if kw_hits:
                    desc_parts.append(f"keywords: {kw_hits[:3]}")
                if star_info["star_dimensions"]:
                    desc_parts.append(f"STAR: {', '.join(star_info['star_dimensions'])}")
                if has_metrics:
                    desc_parts.append(f"metrics: {star_info['metrics_matches'][:2]}")
                reasons[TurnIntent.SUBSTANTIVE_ANSWER].append("; ".join(desc_parts))
            elif num_words >= 1:
                # Câu trả lời ngắn 5-7 từ nhưng thiếu chi tiết chuyên môn hoặc cấu trúc STAR
                logits[TurnIntent.SHALLOW_ANSWER] = 6.5
                reasons[TurnIntent.SHALLOW_ANSWER].append(
                    f"Short answer lacking elaboration or STAR structure ({num_words} words, {char_count} chars)"
                )

        # -------------------------------------------------------------
        # Calibrated Temperature Softmax & Numerically Stable Verdict
        # -------------------------------------------------------------
        top_intent = max(logits, key=lambda k: logits[k])
        max_logit = logits[top_intent]

        if max_logit == 0.0:
            top_intent = TurnIntent.UNKNOWN
            calibrated_confidence = 0.5
            reasoning = "No recognizable conversational intent matched."
        else:
            # Softmax ổn định số học (subtracting max_logit ngăn tràn số floating point)
            exp_sum = sum(
                math.exp((v - max_logit) / self._temperature)
                for v in logits.values()
                if v > 0
            )
            # Thêm xác suất phân phối nền (null hypothesis)
            null_exp = math.exp(-max_logit / self._temperature)
            total_norm = exp_sum + null_exp

            if total_norm > 0:
                top_prob = 1.0 / total_norm
                calibrated_confidence = round(min(0.99, max(0.50, top_prob)), 4)
            else:
                calibrated_confidence = 0.85

            reasoning = "; ".join(reasons[top_intent]) or f"Classified as {top_intent.value}"

        elapsed_ms = (time.perf_counter() - t_start) * 1000

        metadata: dict[str, Any] = {
            "latency_ms": round(elapsed_ms, 3),
            "num_words": num_words,
            "char_count": char_count,
            "raw_logits": {k.value: round(v, 2) for k, v in logits.items() if v > 0},
        }
        if star_info and star_info.get("star_count", 0) > 0:
            metadata["star_analysis"] = star_info

        return DecisionVerdict(
            intent=top_intent,
            confidence=calibrated_confidence,
            reasoning=reasoning,
            metadata=metadata,
        )


_default_engine = VoiceDecisionEngine()


def evaluate_candidate_turn(text: str) -> DecisionVerdict:
    """Module-level helper to evaluate candidate turn intent using the default VoiceDecisionEngine.

    Maintains 100% backward compatibility with existing interview flow controllers.
    """
    return _default_engine.classify_turn(text)
