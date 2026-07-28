import logging

from apps.accounts.models import User
from apps.content.models import Feedback
from shared.configs import variable_system as var_sys

logger = logging.getLogger(__name__)

FEEDBACK_CONTENTS = [
    "Tìm được việc kỹ sư xây dựng phù hợp chỉ trong 1 tuần. Nền tảng rất tốt!",
    "Tin tuyển dụng ngành xây dựng rất đa dạng, từ kỹ sư đến kiến trúc sư đều có.",
    "Tôi là kiến trúc sư và đã nhận được 3 lời mời phỏng vấn sau khi đăng hồ sơ.",
    "Hệ thống lọc việc theo chuyên ngành M&E rất tiện, tiết kiệm nhiều thời gian.",
    "Thông tin công ty xây dựng hiển thị rõ ràng: dự án, quy mô và văn hóa công ty.",
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

SQUARE_FEEDBACK_CONTENTS = [
    "Square hỗ trợ rất nhanh, tôi được kết nối đúng vị trí thiết kế nội thất chỉ sau vài ngày.",
    "Các tin tuyển dụng xây dựng của Square rất rõ ràng, mô tả công việc và quyền lợi đều minh bạch.",
    "Tôi đánh giá cao quy trình ứng tuyển của Square, không rườm rà và phản hồi rất nhanh.",
    "Nền tảng Square hiển thị đúng các vị trí gấp lẫn vị trí thường, giúp tôi chọn được việc phù hợp.",
    "Công ty Square Construction & Design làm việc chuyên nghiệp, nội dung tuyển dụng rất sát thực tế.",
]


def seed_feedbacks(square_only: bool = False):
    """Seed feedback data for Square demo."""
    logger.info("Start seeding feedback data...")

    job_seekers = list(
        User.objects.filter(role_name=var_sys.JOB_SEEKER, is_active=True)
    )

    if not job_seekers:
        logger.warning("No job seekers found. Please run account seeding first.")
        return

    created_count = 0
    skipped_count = 0

    if not square_only:
        for i, content in enumerate(FEEDBACK_CONTENTS):
            user = job_seekers[i % len(job_seekers)]
            rating = RATINGS[i]

            if Feedback.objects.filter(user=user, content=content).exists():
                skipped_count += 1
                continue

            Feedback.objects.create(
                user=user,
                content=content,
                rating=rating,
                is_active=i < 12,
            )
            created_count += 1

    for i, content in enumerate(SQUARE_FEEDBACK_CONTENTS):
        user = job_seekers[(i + len(FEEDBACK_CONTENTS)) % len(job_seekers)]

        if Feedback.objects.filter(user=user, content=content).exists():
            skipped_count += 1
            continue

        Feedback.objects.create(
            user=user,
            content=content,
            rating=5,
            is_active=True,
        )
        created_count += 1

    logger.info(
        f"Seeded {created_count} feedback records"
        + (f", skipped {skipped_count} existing items." if skipped_count else ".")
    )
