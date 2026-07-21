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
    if not image_path.exists():
        return None

    result = CloudinaryService.upload_image(str(image_path), "articles", public_id=public_id)
    if not result:
        return None

    thumbnail, _ = File.objects.update_or_create(
        public_id=result["public_id"],
        defaults={
            "version": result.get("version", ""),
            "format": result.get("format", "webp"),
            "resource_type": result.get("resource_type", "image"),
            "file_type": File.OTHER_TYPE,
            "uploaded_at": result.get("created_at") or timezone.now(),
            "metadata": result,
        },
    )
    return thumbnail


ARTICLE_SEEDS = [
    {
        "title": "Tuyển tư vấn bất động sản: nhìn vào năng lực tư vấn thay vì chỉ KPI",
        "category": Article.CATEGORY_BLOG,
        "thumbnail": ARTICLE_ROOT / "real_estate.jpg",
        "tags": "square-editorial,tuyển dụng,bất động sản,sales,dự án",
        "excerpt": "Một khung đánh giá giúp nhà tuyển dụng chọn đúng tư vấn viên cho dự án, từ cách đọc nhu cầu đến xử lý phản đối.",
        "content": """
            <p>Thị trường bất động sản cần đội ngũ tư vấn viên biết đọc nhu cầu, hiểu sản phẩm và giữ nhịp chăm sóc khách hàng dài hơi. Một JD tốt nên nói rõ phân khúc dự án, nguồn lead, quy trình đào tạo và tiêu chí chốt giao dịch.</p>
            <h2>Những năng lực nên ưu tiên</h2>
            <p>Hãy đánh giá khả năng giao tiếp, kỷ luật follow-up, hiểu biết pháp lý cơ bản và tinh thần làm việc với dữ liệu CRM. Ứng viên mạnh thường có ví dụ cụ thể về cách xử lý phản đối, giữ lịch hẹn và phối hợp cùng marketing.</p>
            <h2>Cách phỏng vấn thực tế</h2>
            <p>Thay vì chỉ hỏi kinh nghiệm bán hàng, nhà tuyển dụng nên đưa một tình huống khách hàng thật: ngân sách, nhu cầu, khu vực và lý do còn lưỡng lự. Câu trả lời sẽ cho thấy tư duy tư vấn, không chỉ kỹ năng nói.</p>
        """,
    },
    {
        "title": "Checklist tuyển nhân sự công trường cho dự án xây dựng",
        "category": Article.CATEGORY_NEWS,
        "thumbnail": ARTICLE_ROOT / "construction.jpg",
        "tags": "square-editorial,xây dựng,tuyển dụng,công trường,dự án",
        "excerpt": "Từ an toàn, tiến độ đến phối hợp đội nhóm, đây là các tín hiệu nên kiểm tra trước khi nhận người vào dự án.",
        "content": """
            <p>Tuyển nhân sự công trường không chỉ là tìm người có chứng chỉ. Doanh nghiệp cần người giữ được an toàn, tiến độ và giao tiếp rõ với thiết kế, vật tư, nhà thầu phụ.</p>
            <h2>Đọc hồ sơ theo năng lực dự án</h2>
            <p>CV nên được nhìn qua loại công trình, quy mô đội nhóm, phạm vi phụ trách và các mốc bàn giao. Những chi tiết này quan trọng hơn một danh sách kỹ năng chung chung.</p>
            <h2>Phỏng vấn bằng case</h2>
            <p>Một case tốt có thể là thiếu vật tư sát ngày nghiệm thu, xung đột giữa thiết kế và hiện trường, hoặc yêu cầu thay đổi từ chủ đầu tư. Ứng viên tốt sẽ nêu được thứ tự ưu tiên và cách cập nhật rủi ro.</p>
        """,
    },
    {
        "title": "Đọc portfolio nội thất sao cho không tuyển nhầm người",
        "category": Article.CATEGORY_BLOG,
        "thumbnail": ARTICLE_ROOT / "interior.jpg",
        "tags": "square-editorial,nội thất,portfolio,kỹ năng,designer",
        "excerpt": "Portfolio đẹp cần đi kèm vai trò thật, quy trình làm việc và khả năng chuyển ý tưởng thành bản triển khai.",
        "content": """
            <p>Trong ngành nội thất, portfolio đẹp là điểm bắt đầu nhưng chưa đủ. Nhà tuyển dụng cần kiểm tra khả năng hiểu brief, phối hợp vật liệu, quản lý kỳ vọng khách hàng và chuyển giao cho đội thi công.</p>
            <h2>Tiêu chí xem portfolio</h2>
            <p>Hãy yêu cầu ứng viên giải thích vai trò của họ trong từng dự án: concept, bản vẽ, chọn vật liệu, làm việc với khách hàng hay giám sát thi công. Điều này giúp tránh đánh giá nhầm giữa thẩm mỹ và năng lực triển khai.</p>
            <h2>Điểm cộng khi tuyển</h2>
            <p>Ứng viên có thói quen ghi chú quyết định thiết kế, biết cân bằng ngân sách và có cách trình bày phương án rõ ràng sẽ phù hợp hơn với môi trường dự án thực tế.</p>
        """,
    },
    {
        "title": "Phỏng vấn kiến trúc sư trẻ: hỏi gì để thấy tư duy thiết kế",
        "category": Article.CATEGORY_BLOG,
        "thumbnail": ARTICLE_ROOT / "architecture.jpg",
        "tags": "square-editorial,kiến trúc,phỏng vấn,portfolio,thiết kế",
        "excerpt": "Một bộ câu hỏi ngắn giúp HR đánh giá cách ứng viên giải quyết ràng buộc, nhận phản hồi và bảo vệ phương án.",
        "content": """
            <p>Kiến trúc sư trẻ thường có nhiều đồ án học thuật, nhưng doanh nghiệp cần nhìn thêm cách họ chuyển ý tưởng thành hồ sơ có thể phối hợp với kỹ thuật, khách hàng và tiến độ dự án.</p>
            <h2>Câu hỏi nên dùng</h2>
            <p>Hãy chọn một dự án trong portfolio và hỏi: vấn đề thiết kế là gì, ràng buộc nào khó nhất, ứng viên đã thử các phương án nào và vì sao chọn phương án cuối cùng.</p>
            <h2>Dấu hiệu ứng viên phù hợp</h2>
            <p>Ứng viên tốt không chỉ bảo vệ ý tưởng, mà còn biết nói về giới hạn, phản hồi nhận được và cách họ cải thiện bản vẽ sau mỗi vòng góp ý.</p>
        """,
    },
    {
        "title": "Khi nào HR nên giữ quyền AI trong buổi phỏng vấn?",
        "category": Article.CATEGORY_NEWS,
        "thumbnail": ARTICLE_ROOT / "ai_interview.jpg",
        "tags": "square-editorial,tuyển dụng,phỏng vấn,AI,kỹ năng",
        "excerpt": "AI giúp hỏi nhất quán, còn HR tham gia trực tiếp khi cần đào sâu tín hiệu quan trọng từ ứng viên.",
        "content": """
            <p>AI interview giúp chuẩn hóa câu hỏi, ghi nhận transcript và hỗ trợ đánh giá nhanh hơn. Nhưng nhà tuyển dụng vẫn nên có quyền tham gia trực tiếp khi cần đào sâu hoặc kiểm chứng tín hiệu quan trọng.</p>
            <h2>Khi nào HR nên giữ quyền AI</h2>
            <p>Nên tham gia trực tiếp khi câu trả lời quá ngắn, ứng viên có kinh nghiệm nổi bật cần khai thác thêm, hoặc vị trí yêu cầu đánh giá giao tiếp với khách hàng.</p>
            <h2>Quy trình chuyên nghiệp</h2>
            <p>AI hỏi nền tảng, HR hỏi case, sau đó hệ thống lưu transcript và trạng thái ứng tuyển. Cách kết hợp này giúp phỏng vấn nhất quán mà vẫn giữ được sự tinh tế của người tuyển dụng.</p>
        """,
    },
    {
        "title": "Ứng viên ngành dự án nên trình bày kỹ năng thế nào?",
        "category": Article.CATEGORY_BLOG,
        "thumbnail": ARTICLE_ROOT / "candidate_skills.jpg",
        "tags": "square-editorial,kỹ năng,portfolio,ứng viên,dự án",
        "excerpt": "Cách biến kinh nghiệm, bản vẽ, case khách hàng và kết quả dự án thành một hồ sơ dễ được chọn phỏng vấn.",
        "content": """
            <p>Ứng viên trong nhóm ngành dự án nên trình bày năng lực bằng bằng chứng: portfolio, bản vẽ, ảnh công trình, case xử lý khách hàng hoặc kết quả vận hành.</p>
            <h2>Hồ sơ nên có gì</h2>
            <p>Một hồ sơ mạnh cần tóm tắt vai trò, công cụ sử dụng, phạm vi trách nhiệm và kết quả đo được. Với vị trí tư vấn, hãy thêm ví dụ về chăm sóc khách hàng. Với vị trí kỹ thuật, hãy thêm bối cảnh dự án.</p>
            <h2>Cách nổi bật hơn</h2>
            <p>Đừng chỉ liệt kê phần mềm hay kỹ năng mềm. Hãy kể một tình huống cụ thể, quyết định bạn đã đưa ra và tác động của quyết định đó với dự án hoặc khách hàng.</p>
        """,
    },
]


class Command(BaseCommand):
    help = "Seed Square public news and recruitment blog articles with realistic thumbnails."

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

    now = timezone.now()
    created = 0
    updated = 0

    for index, item in enumerate(ARTICLE_SEEDS):
        slug = slugify_vi(item["title"])
        thumbnail = _upload_thumbnail(
            item["thumbnail"],
            public_id=f"square-editorial/{slug}",
        )

        defaults = {
            "title": item["title"],
            "excerpt": item["excerpt"],
            "content": item["content"].strip(),
            "category": item["category"],
            "status": Article.STATUS_PUBLISHED,
            "author": author,
            "tags": item["tags"],
            "published_at": now - timedelta(days=index * 2),
        }
        if thumbnail:
            defaults["thumbnail"] = thumbnail

        article, was_created = Article.objects.update_or_create(
            slug=slug,
            defaults=defaults,
        )

        created += int(was_created)
        updated += int(not was_created)
        action = "created" if was_created else "updated"
        write(f"{action}: {article.title}")

    write(f"Done. Created {created}, updated {updated} public articles.")
