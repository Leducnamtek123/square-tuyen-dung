"""
Feedback Seeder
Tạo dữ liệu đánh giá mẫu từ các user Job Seeker hiện có trong hệ thống.
"""
import random

from apps.accounts.models import User
from apps.content.models import Feedback
from shared.configs import variable_system as var_sys


FEEDBACK_CONTENTS = [
    "Trang web rất dễ sử dụng, tìm kiếm việc làm nhanh chóng và hiệu quả!",
    "Giao diện thân thiện, thông tin công việc đầy đủ và chi tiết. Rất hài lòng!",
    "Tôi đã tìm được việc làm mơ ước qua nền tảng này. Cảm ơn rất nhiều!",
    "Hệ thống gợi ý việc làm phù hợp với hồ sơ của tôi. Rất hữu ích!",
    "Chức năng lọc việc làm theo ngành nghề và vị trí rất tiện lợi.",
    "Thông báo việc làm mới gửi qua email rất kịp thời. Không bỏ lỡ cơ hội nào.",
    "Ứng tuyển chỉ vài bước đơn giản. Tiết kiệm rất nhiều thời gian!",
    "Hệ thống theo dõi trạng thái ứng tuyển rất rõ ràng và minh bạch.",
    "Thông tin công ty được hiển thị đầy đủ, giúp tôi nghiên cứu trước khi ứng tuyển.",
    "Tính năng tải CV trực tiếp lên hệ thống rất tiện. Không cần gửi email thủ công.",
    "Nền tảng có nhiều cơ hội việc làm hơn tôi nghĩ. Ấn tượng!",
    "Giao diện đẹp, hiện đại. Trải nghiệm tìm việc trở nên thú vị hơn.",
    "Tôi được nhà tuyển dụng liên hệ trong vòng 24 giờ sau khi đăng hồ sơ.",
    "Tính năng lưu tin tuyển dụng yêu thích rất hữu ích để xem lại sau.",
    "Dịch vụ hỗ trợ phản hồi nhanh và nhiệt tình. Cảm ơn đội ngũ Square!",
]

RATINGS = [5, 5, 5, 4, 4, 4, 5, 3, 4, 5, 4, 5, 5, 4, 3]


def seed_feedbacks():
    """Seed dữ liệu Feedback mẫu từ users Job Seeker hiện có."""
    print("Bắt đầu nạp dữ liệu Feedback...")

    job_seekers = list(
        User.objects.filter(role_name=var_sys.JOB_SEEKER, is_active=True)
    )

    if not job_seekers:
        print("  ⚠  Không có Job Seeker nào trong hệ thống. Hãy chạy seed accounts trước.")
        return

    created_count = 0
    skipped_count = 0

    for i, content in enumerate(FEEDBACK_CONTENTS):
        # Chọn user theo vòng nếu ít user hơn feedback
        user = job_seekers[i % len(job_seekers)]
        rating = RATINGS[i]

        # Không tạo trùng feedback của cùng 1 user với cùng nội dung
        already_exists = Feedback.objects.filter(user=user, content=content).exists()
        if already_exists:
            skipped_count += 1
            continue

        # 12 feedback đầu is_active=True, 3 cuối is_active=False (chờ duyệt)
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
