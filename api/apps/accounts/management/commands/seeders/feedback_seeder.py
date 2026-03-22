"""
Feedback Seeder
Tạo dữ liệu đánh giá mẫu từ các ứng viên (Job Seeker) ngành Xây dựng & Thiết kế.
"""
import random

from apps.accounts.models import User
from apps.content.models import Feedback
from shared.configs import variable_system as var_sys


FEEDBACK_CONTENTS = [
    "Tìm được việc kỹ sư xây dựng phù hợp chỉ trong 1 tuần. Nền tảng rất tốt!",
    "Tin tuyển dụng ngành xây dựng rất đa dạng, từ kỹ sư đến kiến trúc sư đều có.",
    "Tôi là kiến trúc sư và đã nhận được 3 lời mời phỏng vấn sau khi đăng hồ sơ.",
    "Hệ thống lọc việc theo chuyên ngành M&E rất tiện, tiết kiệm nhiều thời gian!",
    "Thông tin công ty xây dựng hiển thị rõ ràng: dự án, quy mô, văn hóa công ty.",
    "Nhận thông báo việc làm kỹ sư cầu đường đúng ngành mình muốn. Rất hài lòng!",
    "Chức năng ứng tuyển nhanh rất tiện, chỉ vài bước là gửi được hồ sơ ngay.",
    "Theo dõi trạng thái ứng tuyển rõ ràng, không cần gọi điện hỏi thêm.",
    "Công ty Square Construction & Design của tôi đã tìm được 5 kỹ sư giỏi qua đây.",
    "Giao diện đẹp, dễ sử dụng. Lọc việc theo location và kinh nghiệm rất chính xác.",
    "Tôi tìm được vị trí BIM Coordinator trong 2 tuần. Tuyệt vời!",
    "Nền tảng tuyển dụng chuyên ngành xây dựng, không bị loãng bởi các ngành khác.",
    "Ứng tuyển vị trí thiết kế nội thất senior và được phản hồi rất nhanh.",
    "Hơi ít tin tuyển dụng ở tỉnh, mong có thêm cơ hội cho kỹ sư ngoài TP.HCM.",
    "Dịch vụ hỗ trợ phản hồi tốt, giải đáp thắc mắc rất nhanh. Cảm ơn đội ngũ!",
]

RATINGS = [5, 5, 5, 4, 5, 4, 5, 4, 5, 4, 5, 5, 4, 3, 4]


def seed_feedbacks():
    """Seed dữ liệu Feedback ngành xây dựng & thiết kế từ Job Seekers hiện có."""
    print("Bắt đầu nạp dữ liệu Feedback (xây dựng & thiết kế)...")

    job_seekers = list(
        User.objects.filter(role_name=var_sys.JOB_SEEKER, is_active=True)
    )

    if not job_seekers:
        print("  ⚠  Không có Job Seeker nào. Hãy chạy seed accounts trước.")
        return

    created_count = 0
    skipped_count = 0

    for i, content in enumerate(FEEDBACK_CONTENTS):
        user = job_seekers[i % len(job_seekers)]
        rating = RATINGS[i]

        already_exists = Feedback.objects.filter(user=user, content=content).exists()
        if already_exists:
            skipped_count += 1
            continue

        # 12 feedback đầu hiển thị, 3 cuối chờ duyệt
        is_active = i < 12

        Feedback.objects.create(
            user=user,
            content=content,
            rating=rating,
            is_active=is_active,
        )
        created_count += 1

    print(
        f"Thành công! Đã tạo {created_count} feedback mới"
        + (f", bỏ qua {skipped_count} feedback đã có." if skipped_count else ".")
    )
