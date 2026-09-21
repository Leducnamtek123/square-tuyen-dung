# Bản Chuẩn Hóa Ý Định: Luồng Phỏng Vấn AI End-to-End (InfoHR AILA)

> **Ngày phê duyệt**: 21/09/2026  
> **Trạng thái**: Đã thống nhất & Khóa ý định (Approved Intent)  
> **Phạm vi**: Toàn bộ chu trình phỏng vấn AI từ cấu hình kịch bản, tiếp nhận ứng viên, phòng đàm thoại LiveKit, đến xuất báo cáo chấm điểm và giám sát.

---

## 1. Tuyên Bố Ý Định Cốt Lõi (Statement of Intent)

- **Outcome**: Chuẩn hóa và hoàn thiện trọn vẹn vòng đời phỏng vấn AI End-to-End: Kích hoạt Hybrid theo Tin tuyển dụng $\rightarrow$ Vào phòng 1-Click Magic Link & kiểm tra Preflight $\rightarrow$ Đàm thoại phòng LiveKit thuần giọng nói 100% (Pure Voice) với AI thấu hiểu và Barge-in phân tầng $\rightarrow$ Tự động chấm điểm Rubric, lưu trữ Media S3 kèm Timeline Highlights và phân tầng báo cáo theo loại phiên.
- **User**:
  - *Ứng viên*: Tham gia phỏng vấn tự nhiên như trò chuyện điện thoại với chuyên gia tuyển dụng, không gặp rào cản tài khoản/mật khẩu, không lo bị cắt lời khi suy nghĩ.
  - *Nhà tuyển dụng / HR*: Tự động hóa sàng lọc ứng viên hàng loạt, kiểm soát khung câu hỏi cốt lõi, thẩm định nhanh ứng viên qua Timeline Highlights từng câu mà không cần nghe hết 30 phút video.
- **Why now**: Đưa phân hệ Voice AI (AILA) của Square Tuyển Dụng / InfoHR lên tầm cao thương mại, khắc phục triệt để các điểm yếu thường gặp ở phỏng vấn AI (bị máy móc hóa, cướp lời ứng viên, rớt mạng mất dữ liệu, hoặc HR mất quá nhiều thời gian thẩm định lại).
- **Success**:
  - Ứng viên hoàn thành toàn bộ buổi phỏng vấn mà không cần chạm tay vào màn hình hay bấm nút chuyển câu.
  - AI nhận diện chính xác khoảng ngập ngừng suy nghĩ (không cướp lời), chủ động hỏi thăm nhẹ nhàng khi ứng viên im lặng $> 10$s.
  - Tự động khôi phục phiên trong Grace Period (10–15 phút) tại đúng câu hỏi đang dang dở khi gặp sự cố mạng.
  - Sau khi kết thúc, HR nhận ngay báo cáo radar chart, đề xuất tuyển dụng và có thể click nghe lại đúng đoạn âm thanh/video của từng câu hỏi trên MinIO S3.
- **Constraint**:
  - Mô hình Pure Voice đòi hỏi Voice Decision Engine kết hợp VAD phải cực kỳ nhạy bén trong việc phân tầng ngắt lời (khóa Barge-in khi AI đọc câu hỏi chính, mở Barge-in khi đối thoại phụ).
  - Đồng bộ mốc thời gian (Timeline Highlights) giữa WebRTC live recording và các câu hỏi phải chính xác từng giây.
- **Out of scope**:
  - Không bắt buộc ứng viên phải tạo tài khoản / ghi nhớ mật khẩu để vào phỏng vấn.
  - Không công khai báo cáo điểm số chi tiết hay đề xuất tuyển dụng cho ứng viên ở phiên phỏng vấn ứng tuyển chính thức (chỉ mở $100\%$ đối với phiên phỏng vấn thử).
  - Không bắt ứng viên bấm nút "Hoàn thành câu trả lời" trên HUD trong phòng live.

---

## 2. Chi Tiết 4 Trụ Cột Nghiệp Vụ

### Trụ cột 1: Khởi tạo & Kích hoạt (Triggering & Scripting)
- **Cơ chế Hybrid**:
  - *Tự động*: Cấu hình theo từng Tin tuyển dụng (Job Post). Khi bật, ứng viên nộp CV (đạt ngưỡng AI match $\ge X\%$) sẽ tự động nhận link phỏng vấn.
  - *Thủ công*: HR sàng lọc trên Kanban hồ sơ, chọn ứng viên và bấm "Mời phỏng vấn AI".
- **Kịch bản Bán cấu trúc (Semi-structured)**:
  - Khung chuẩn hóa 4–6 câu hỏi cốt lõi từ ngân hàng câu hỏi hoặc HR tự soạn.
  - Voice AI được cấp quyền hỏi thêm tối đa 1 câu follow-up đào sâu dựa trên dữ liệu CV ứng viên hoặc câu trả lời trước đó.

### Trụ cột 2: Tiếp nhận & Kiểm tra trước phòng (Candidate Gateway & Preflight)
- **Truy cập 1-Click**:
  - Đường dẫn Magic Link (`/phong-van/[token]` hoặc `/interview/[id]?token=[token]`) gửi qua Email/SMS.
  - Không yêu cầu đăng nhập mật khẩu.
- **Phòng kiểm tra Preflight**:
  - Micro: Bắt buộc $100\%$ (kiểm tra âm lượng, độ nhạy giọng nói).
  - Camera: Cấu hình linh hoạt theo Tin tuyển dụng (mặc định khuyến nghị bật; HR có thể bật bắt buộc để ghi hình chống gian lận).

### Trụ cột 3: Phòng Phỏng Vấn Trực Tiếp (LiveKit WebRTC & Voice AI Execution)
- **Đàm thoại Thuần giọng nói (Pure Voice 100%)**:
  - AI lắng nghe, phát hiện khi ứng viên trả lời trọn vẹn và tự chuyển câu hỏi mà không cần bấm nút trên màn hình.
- **Hỗ trợ tâm lý & Hỏi thăm chủ động**:
  - Khi im lặng kéo dài $> 10$s, AI chủ động hỏi thăm nhẹ nhàng: *"Bạn có cần mình nhắc lại câu hỏi hoặc thêm chút thời gian suy nghĩ không?"*.
  - Chỉ khi ứng viên xác nhận muốn qua câu thì AI mới chuyển tiếp.
- **Barge-in phân tầng (Tiered Interruption)**:
  - Khi AI đọc câu hỏi chính: `allow_interruptions=False` để ứng viên nghe trọn vẹn đề bài mà không bị tạp âm/tiếng thở làm ngắt quãng.
  - Khi AI đối thoại phụ, chào hỏi, giải thích hoặc hỏi thăm: `allow_interruptions=True` để hội thoại mượt mà tự nhiên.
- **Khôi phục sự cố mạng (Grace Period 10–15 phút)**:
  - Khi rớt mạng/tắt trình duyệt, phiên chuyển sang `interrupted`.
  - Nếu vào lại trong 10–15 phút: Tiếp tục đúng câu hỏi đang dang dở (`question_cursor`), AI chào mừng trở lại.
  - Quá 15 phút: Phiên khóa, cần HR cấp quyền làm lại.

### Trụ cột 4: Hậu phỏng vấn, Đánh giá & Bằng chứng (Post-interview Evaluation & Proctoring)
- **Phân tầng hiển thị báo cáo**:
  - *Phỏng vấn thử (Mock)*: Ứng viên xem $100\%$ chi tiết: Radar chart, điểm từng câu, điểm mạnh/yếu, transcript, gợi ý cải thiện.
  - *Phỏng vấn ứng tuyển (Official)*: Báo cáo chuyên sâu + Đề xuất tuyển dụng (Strong Hire / Hire / Reconsider / Reject) gửi riêng cho HR Dashboard & Email. Ứng viên nhận thư cảm ơn và thông báo chờ kết quả.
- **Giám sát & Media Playback S3**:
  - Ghi âm/ghi hình đầy đủ lưu trữ trên MinIO S3.
  - Đồng bộ `timeline_highlights` theo từng câu hỏi: HR có thể click vào bất kỳ câu hỏi nào để nghe/xem lại ngay đoạn ứng viên trả lời câu đó.
  - Cảnh báo Proctoring: Ghi nhận sự kiện rời tab trình duyệt (Tab switching).
