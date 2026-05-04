from datetime import timedelta
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.accounts.models import User
from apps.content.models import Article, slugify_vi
from apps.files.models import File
from shared.configs import variable_system as var_sys
from shared.helpers.cloudinary_service import CloudinaryService


ARTICLE_ROOT = Path(__file__).resolve().parents[4] / "data" / "seed_images" / "articles"
AUTHOR_EMAIL = "ceohub.hostmaster@gmail.com"


def _upload_thumbnail(image_path: Path, public_id: str) -> File | None:
    result = CloudinaryService.upload_image(str(image_path), "articles", public_id=public_id)
    if not result:
        return None

    thumbnail, _ = File.objects.update_or_create(
        public_id=result["public_id"],
        defaults={
            "version": result.get("version", ""),
            "format": result.get("format", "svg"),
            "resource_type": result.get("resource_type", "image"),
            "file_type": File.OTHER_TYPE,
            "uploaded_at": result.get("created_at") or timezone.now(),
            "metadata": result,
        },
    )
    return thumbnail


ARTICLE_SEEDS = [
    {
        "title": "10 xu hướng tuyển dụng bất động sản nổi bật trong 2026",
        "industry": "Bất động sản",
        "thumbnail": ARTICLE_ROOT / "real_estate.svg",
        "tags": "bất động sản,tuyển dụng,sales,dự án",
        "excerpt": "Thị trường bất động sản đang dịch chuyển sang mô hình tuyển dụng thiên về dữ liệu, tư vấn dự án và chăm sóc khách hàng chất lượng cao.",
        "content": """
            <p>Năm 2026, doanh nghiệp bất động sản không chỉ tìm người bán hàng giỏi, mà cần đội ngũ hiểu dự án, hiểu pháp lý và biết xây dựng niềm tin với khách hàng.</p>
            <p>Các vị trí nổi bật gồm chuyên viên tư vấn dự án, marketing dự án, telesales, chăm sóc khách hàng sau bán và quản lý sàn phân phối.</p>
            <p>Ứng viên có lợi thế thường sở hữu kỹ năng giao tiếp, hiểu quy trình bán hàng và biết khai thác công cụ số để theo dõi nguồn lead.</p>
        """,
    },
    {
        "title": "Bất động sản dự án: 5 kỹ năng nhà tuyển dụng ưu tiên nhất",
        "industry": "Bất động sản",
        "thumbnail": ARTICLE_ROOT / "real_estate.svg",
        "tags": "bất động sản,kỹ năng,pipeline,lead",
        "excerpt": "Nhà tuyển dụng đánh giá cao ứng viên có tư duy tư vấn, kỷ luật làm việc và khả năng chốt deal theo từng giai đoạn dự án.",
        "content": """
            <p>Đối với khối dự án, 5 kỹ năng quan trọng nhất là hiểu sản phẩm, lập kế hoạch chăm sóc khách, phân tích nhu cầu, theo đuổi cơ hội và chốt giao dịch.</p>
            <p>Ứng viên cần biết phối hợp với marketing, pháp lý và vận hành để tạo trải nghiệm liền mạch cho khách hàng.</p>
            <p>Những hồ sơ có số liệu hiệu quả bán hàng, kinh nghiệm dự án thực tế và khả năng xử lý phản đối thường được ưu tiên hơn.</p>
        """,
    },
    {
        "title": "Xây dựng công trình: checklist tuyển dụng cho vị trí hiện trường",
        "industry": "Xây dựng",
        "thumbnail": ARTICLE_ROOT / "construction.svg",
        "tags": "xây dựng,công trình,site,qa/qc",
        "excerpt": "Tuyển dụng ngành xây dựng cần nhìn vào kinh nghiệm hiện trường, kỷ luật an toàn và khả năng phối hợp nhiều bên trên công trình.",
        "content": """
            <p>Với vị trí hiện trường, nhà tuyển dụng thường kiểm tra kinh nghiệm giám sát tiến độ, quản lý thầu phụ, hồ sơ nghiệm thu và xử lý phát sinh tại công trường.</p>
            <p>Ứng viên mạnh không chỉ nắm chuyên môn kỹ thuật mà còn biết làm việc với chủ đầu tư, tư vấn giám sát và đội thi công.</p>
            <p>Bộ hồ sơ tốt nên thể hiện rõ công trình đã tham gia, vai trò cụ thể và các chỉ số như tiến độ, chất lượng, an toàn lao động.</p>
        """,
    },
    {
        "title": "Kỹ sư xây dựng cần chuẩn bị gì để vào dự án lớn?",
        "industry": "Xây dựng",
        "thumbnail": ARTICLE_ROOT / "construction.svg",
        "tags": "xây dựng,kỹ sư,công trình,bim",
        "excerpt": "Muốn vào dự án lớn, kỹ sư xây dựng cần vững hồ sơ, mạnh phối hợp và hiểu quy trình kiểm soát chất lượng từ đầu đến cuối.",
        "content": """
            <p>Dự án lớn thường yêu cầu kỹ sư có khả năng đọc bản vẽ, bóc tách khối lượng, kiểm soát vật tư và cập nhật tiến độ mỗi ngày.</p>
            <p>Ngoài kỹ năng chuyên môn, bạn cần rèn thói quen ghi chép hiện trường, báo cáo ngắn gọn và xử lý xung đột nhanh trong đội thi công.</p>
            <p>Nếu có thêm kinh nghiệm BIM hoặc phần mềm quản lý dự án, hồ sơ của bạn sẽ nổi bật hơn đáng kể.</p>
        """,
    },
    {
        "title": "Nội thất: 7 tiêu chí tuyển designer cho dự án nhà ở và thương mại",
        "industry": "Nội thất",
        "thumbnail": ARTICLE_ROOT / "interior.svg",
        "tags": "nội thất,designer,3d,render",
        "excerpt": "Tuyển designer nội thất không chỉ nhìn portfolio đẹp mà còn phải đánh giá tư duy công năng, vật liệu và khả năng triển khai thi công.",
        "content": """
            <p>Trong nội thất, nhà tuyển dụng quan tâm đến khả năng diễn giải concept, dựng layout, phối vật liệu và phối hợp với đội thi công để ra sản phẩm cuối cùng.</p>
            <p>Portfolio nên có cả bản vẽ concept, hình ảnh render, mặt bằng và ảnh công trình hoàn thiện để chứng minh năng lực triển khai thực tế.</p>
            <p>Ứng viên hiểu ngân sách, hiểu vật liệu và biết làm việc với khách hàng sẽ có lợi thế rõ rệt.</p>
        """,
    },
    {
        "title": "Cách chọn vật liệu nội thất phù hợp cho căn hộ và showroom",
        "industry": "Nội thất",
        "thumbnail": ARTICLE_ROOT / "interior.svg",
        "tags": "nội thất,vật liệu,showroom,căn hộ",
        "excerpt": "Mỗi không gian cần một bộ vật liệu khác nhau để tối ưu độ bền, chi phí và trải nghiệm thẩm mỹ.",
        "content": """
            <p>Căn hộ ưu tiên vật liệu dễ vệ sinh, bền màu và tối ưu diện tích; showroom lại cần vật liệu tạo cảm giác thương hiệu mạnh hơn.</p>
            <p>Khi tuyển ứng viên nội thất, doanh nghiệp thường hỏi cách họ cân bằng giữa đẹp, bền và chi phí thi công.</p>
            <p>Điểm cộng lớn là khả năng đề xuất phương án thay thế khi nguồn cung vật liệu thay đổi.</p>
        """,
    },
    {
        "title": "Kiến trúc: cách xây portfolio khiến nhà tuyển dụng chú ý ngay",
        "industry": "Kiến trúc",
        "thumbnail": ARTICLE_ROOT / "architecture.svg",
        "tags": "kiến trúc,portfolio,bim,concept",
        "excerpt": "Portfolio kiến trúc cần kể câu chuyện thiết kế rõ ràng, không chỉ là bộ ảnh render đẹp mắt.",
        "content": """
            <p>Nhà tuyển dụng kiến trúc đánh giá cao portfolio có logic: bài toán, concept, phát triển ý tưởng, mặt bằng, mặt đứng và hình ảnh công trình.</p>
            <p>Nên thể hiện rõ vai trò của bạn trong từng dự án, đặc biệt nếu bạn tham gia concept, triển khai kỹ thuật hay BIM.</p>
            <p>Một portfolio tốt giúp người xem hiểu bạn nghĩ như thế nào, không chỉ nhìn thấy sản phẩm cuối cùng.</p>
        """,
    },
    {
        "title": "Kiến trúc sư trẻ cần thành thạo gì trong giai đoạn 2026?",
        "industry": "Kiến trúc",
        "thumbnail": ARTICLE_ROOT / "architecture.svg",
        "tags": "kiến trúc,sinh viên,bim,phát triển nghề nghiệp",
        "excerpt": "Kiến trúc sư trẻ cần kết hợp tư duy thiết kế, khả năng triển khai và giao tiếp với các bên liên quan trong dự án.",
        "content": """
            <p>Ở giai đoạn 2026, kỹ năng quan trọng gồm tư duy concept, quản lý hồ sơ, BIM cơ bản và làm việc nhóm đa chuyên môn.</p>
            <p>Nhà tuyển dụng cũng đánh giá cao kiến trúc sư trẻ biết phản biện, biết điều chỉnh thiết kế theo hiện trạng và mục tiêu kinh doanh.</p>
            <p>Đây là thời điểm tốt để học thêm trình bày, thuyết phục và tổ chức ý tưởng thành bộ tài liệu rõ ràng.</p>
        """,
    },
    {
        "title": "Tuyển dụng liên ngành: khi bất động sản, xây dựng và nội thất phải đi cùng nhau",
        "industry": "Bất động sản",
        "thumbnail": ARTICLE_ROOT / "real_estate.svg",
        "tags": "liên ngành,bất động sản,xây dựng,nội thất",
        "excerpt": "Một dự án tốt cần phối hợp sớm giữa kinh doanh, thiết kế và thi công để giảm rủi ro và tăng tốc triển khai.",
        "content": """
            <p>Trong các dự án lớn, bộ phận kinh doanh, kỹ thuật và thiết kế cần ngồi cùng nhau ngay từ giai đoạn đầu để chốt phạm vi và kỳ vọng.</p>
            <p>Cách tuyển dụng liên ngành hiệu quả là tìm ứng viên có tư duy phối hợp, hiểu quy trình và giao tiếp rõ ràng giữa các phòng ban.</p>
            <p>Đây cũng là lý do Square tập trung vào 4 ngành trọng điểm: bất động sản, xây dựng, nội thất và kiến trúc.</p>
        """,
    },
    {
        "title": "Lộ trình nghề nghiệp cho designer nội thất muốn chuyển sang kiến trúc",
        "industry": "Nội thất",
        "thumbnail": ARTICLE_ROOT / "interior.svg",
        "tags": "nội thất,kiến trúc,lộ trình nghề nghiệp,portfolio",
        "excerpt": "Nhiều designer nội thất chuyển sang kiến trúc bằng cách nâng cấp kỹ năng concept, BIM và hiểu sâu quy trình dự án.",
        "content": """
            <p>Việc chuyển từ nội thất sang kiến trúc thường bắt đầu từ việc học lại tư duy tổng thể không gian, cấu trúc và hồ sơ kỹ thuật.</p>
            <p>Ứng viên nên xây portfolio thể hiện khả năng làm việc ở cả hai phía: concept thẩm mỹ và triển khai thực tế.</p>
            <p>Lộ trình sẽ thuận lợi hơn nếu bạn có mentor hoặc tham gia các dự án đa ngành.</p>
        """,
    },
]


class Command(BaseCommand):
    help = "Seed 10 blog articles with images for Square's 4 core industries"

    @transaction.atomic
    def handle(self, *args, **options):
        seed_articles(stdout=self.stdout, stderr=self.stderr)


@transaction.atomic
def seed_articles(stdout=None, stderr=None):
    def write(message):
        if stdout is not None:
            stdout.write(message)
        else:
            print(message)

    def write_error(message):
        if stderr is not None:
            stderr.write(message)
        else:
            print(message)

    author = (
        User.objects.filter(email=AUTHOR_EMAIL).first()
        or User.objects.filter(role_name=var_sys.EMPLOYER).order_by("id").first()
        or User.objects.filter(is_superuser=True).order_by("id").first()
    )

    if not author:
        write_error("Không tìm thấy tác giả phù hợp. Hãy chạy seed_accounts trước.")
        return

    Article.objects.filter(category=Article.CATEGORY_BLOG).delete()

    created = 0
    now = timezone.now()

    for index, item in enumerate(ARTICLE_SEEDS):
        thumbnail = _upload_thumbnail(
            item["thumbnail"],
            public_id=f"{slugify_vi(item['industry'])}-{index + 1}",
        )
        article = Article.objects.create(
            title=item["title"],
            excerpt=item["excerpt"],
            content=item["content"].strip(),
            category=Article.CATEGORY_BLOG,
            status=Article.STATUS_PUBLISHED,
            author=author,
            tags=item["tags"],
            thumbnail=thumbnail,
            published_at=now - timedelta(days=index * 2),
        )
        created += 1
        write(f"✓ {article.title}")

    write(f"Done! Seeded {created} blog articles with thumbnails.")
