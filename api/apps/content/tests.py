
import base64
import io
from pathlib import Path

import pytest
from django.db.models import Max
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from PIL import Image
from rest_framework.test import APIClient

from apps.content.models import Article, Banner, BannerType, ContactMessage, Feedback
from apps.files.models import File
from shared.helpers.cloudinary_service import CloudinaryService


ONE_PIXEL_PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4//8/AAX+Av4N70a4AAAAAElFTkSuQmCC"
)


def _article_payload(response):
    return response.data.get("data", response.data)


@pytest.mark.django_db
class TestFeedbackAPI:
    def test_feedback_serializers_reject_rating_outside_star_range(self):
        from apps.content.serializers import AdminFeedbackSerializer, FeedbackSerializer

        public_feedback = FeedbackSerializer(
            data={
                "rating": 6,
                "content": "Rating is out of range",
            }
        )
        admin_feedback = AdminFeedbackSerializer(
            data={"rating": 0},
            partial=True,
        )

        assert public_feedback.is_valid() is False
        assert "rating" in public_feedback.errors
        assert admin_feedback.is_valid() is False
        assert "rating" in admin_feedback.errors

    def test_create_feedback_accepts_evidence_image_and_admin_can_view_it(
        self,
        monkeypatch,
        job_seeker_user,
        admin_user,
    ):
        def fake_upload_image(file_obj, folder, public_id=None, options={}):
            assert folder == "feedback-evidence"
            assert file_obj.name == "proof.png"
            return {
                "public_id": "feedback-evidence/proof.webp",
                "version": "1",
                "format": "webp",
                "resource_type": "image",
                "created_at": timezone.now().isoformat(),
                "bytes": len(ONE_PIXEL_PNG),
            }

        monkeypatch.setattr(
            CloudinaryService,
            "upload_image",
            staticmethod(fake_upload_image),
        )

        client = APIClient()
        client.force_authenticate(user=job_seeker_user)
        image_file = SimpleUploadedFile(
            "proof.png",
            ONE_PIXEL_PNG,
            content_type="image/png",
        )

        response = client.post(
            "/api/content/web/feedbacks/",
            {
                "rating": 4,
                "content": "Can admin review this issue?",
                "evidenceImageFile": image_file,
            },
            format="multipart",
        )

        assert response.status_code == 201
        payload = _article_payload(response)
        assert payload["evidenceImageUrl"]

        feedback = Feedback.objects.get(content="Can admin review this issue?")
        assert feedback.evidence_image is not None
        assert feedback.evidence_image.public_id == "feedback-evidence/proof.webp"

        admin_client = APIClient()
        admin_client.force_authenticate(user=admin_user)
        admin_response = admin_client.get("/api/content/web/admin/feedbacks/")

        assert admin_response.status_code == 200
        admin_payload = _article_payload(admin_response)
        admin_feedback = next(
            item for item in admin_payload["results"] if item["id"] == feedback.id
        )
        assert admin_feedback["evidenceImageUrl"]

    def test_admin_feedback_list_filters_by_user_status_and_evidence(
        self,
        admin_user,
        job_seeker_user,
    ):
        other_user = job_seeker_user.__class__.objects.create_user_with_role_name(
            email="feedback-filter@test.com",
            full_name="Filter Target",
            role_name="JOB_SEEKER",
            password="testpass123",
            is_active=True,
            is_verify_email=True,
        )
        evidence_file = File.objects.create(
            public_id="feedback-evidence/filter-proof.webp",
            format="webp",
            resource_type="image",
            file_type=File.OTHER_TYPE,
            uploaded_at=timezone.now(),
        )
        target_feedback = Feedback.objects.create(
            content="This should match the filtered list",
            rating=4,
            is_active=True,
            user=job_seeker_user,
            evidence_image=evidence_file,
        )
        Feedback.objects.create(
            content="No evidence here",
            rating=4,
            is_active=True,
            user=job_seeker_user,
        )
        Feedback.objects.create(
            content="Different user",
            rating=4,
            is_active=True,
            user=other_user,
            evidence_image=evidence_file,
        )

        client = APIClient()
        client.force_authenticate(user=admin_user)

        response = client.get(
            "/api/content/web/admin/feedbacks/",
            {
                "user": str(job_seeker_user.id),
                "is_active": "true",
                "hasEvidence": "true",
                "search": "filtered list",
            },
        )

        assert response.status_code == 200
        payload = _article_payload(response)
        assert payload["count"] == 1
        assert [item["id"] for item in payload["results"]] == [target_feedback.id]

    def test_admin_feedback_can_create_update_and_delete_feedback(
        self,
        admin_user,
        job_seeker_user,
    ):
        client = APIClient()
        client.force_authenticate(user=admin_user)

        create_response = client.post(
            "/api/content/web/admin/feedbacks/",
            {
                "content": "Admin created feedback",
                "rating": 5,
                "isActive": True,
                "userId": job_seeker_user.id,
            },
            format="json",
        )

        assert create_response.status_code in (200, 201)
        create_payload = _article_payload(create_response)
        feedback_id = create_payload["id"]
        assert create_payload["content"] == "Admin created feedback"
        assert create_payload["rating"] == 5
        assert create_payload["isActive"] is True
        assert create_payload["userId"] == job_seeker_user.id

        update_response = client.patch(
            f"/api/content/web/admin/feedbacks/{feedback_id}/",
            {
                "content": "Admin updated feedback",
                "rating": 4,
                "isActive": False,
            },
            format="json",
        )

        assert update_response.status_code in (200, 201)
        update_payload = _article_payload(update_response)
        assert update_payload["content"] == "Admin updated feedback"
        assert update_payload["rating"] == 4
        assert update_payload["isActive"] is False

        delete_response = client.delete(f"/api/content/web/admin/feedbacks/{feedback_id}/")
        assert delete_response.status_code in (200, 204)
        assert not Feedback.objects.filter(id=feedback_id).exists()


@pytest.mark.django_db
class TestContactMessageAPI:
    def test_public_contact_message_list_is_not_exposed(self):
        response = APIClient().get("/api/content/web/contact-messages/")

        assert response.status_code == 405

    def test_public_contact_message_accepts_bug_report_fields(self):
        client = APIClient()

        response = client.post(
            "/api/content/web/contact-messages/",
            {
                "category": "bug_report",
                "subject": "Login page error",
                "pageUrl": "https://example.com/login",
                "name": "Test User",
                "email": "tester@example.com",
                "phone": "0900000000",
                "content": "The login button does not respond.",
            },
            format="json",
        )

        assert response.status_code in (200, 201)
        payload = _article_payload(response)
        assert payload["category"] == "bug_report"
        assert payload["subject"] == "Login page error"
        assert payload["pageUrl"] == "https://example.com/login"

        saved = ContactMessage.objects.get(id=payload["id"])
        assert saved.category == "bug_report"
        assert saved.subject == "Login page error"
        assert saved.page_url == "https://example.com/login"

    def test_admin_contact_message_filters_by_category_and_read_status(
        self,
        admin_user,
    ):
        ContactMessage.objects.create(
            category=ContactMessage.CATEGORY_BUG_REPORT,
            subject="Bug",
            page_url="https://example.com/jobs",
            name="Reporter",
            email="reporter@example.com",
            phone="0900000001",
            content="A bug happened on the jobs page.",
            is_read=False,
        )
        ContactMessage.objects.create(
            category=ContactMessage.CATEGORY_SUPPORT,
            subject="Help",
            page_url="https://example.com/contact",
            name="Support User",
            email="support@example.com",
            phone="0900000002",
            content="Need support for account access.",
            is_read=True,
        )

        client = APIClient()
        client.force_authenticate(user=admin_user)

        response = client.get(
            "/api/content/web/admin/contact-messages/",
            {
                "category": "bug_report",
                "is_read": "false",
                "search": "jobs page",
            },
        )

        assert response.status_code == 200
        payload = _article_payload(response)
        assert payload["count"] == 1
        assert payload["results"][0]["category"] == "bug_report"
        assert payload["results"][0]["subject"] == "Bug"


@pytest.mark.django_db(transaction=True)
class TestBannerPublicAPI:
    def test_web_banner_response_includes_mobile_image_url(self, settings):
        settings.MINIO_USE_PRESIGNED = False
        web_file = File.objects.create(
            public_id="banners/web/home.webp",
            format="webp",
            resource_type="image",
            file_type=File.WEB_BANNER_TYPE,
            uploaded_at=timezone.now(),
        )
        mobile_file = File.objects.create(
            public_id="banners/mobile/home.webp",
            format="webp",
            resource_type="image",
            file_type=File.MOBILE_BANNER_TYPE,
            uploaded_at=timezone.now(),
        )
        Banner.objects.create(
            image=web_file,
            image_mobile=mobile_file,
            is_active=True,
            platform="WEB",
            description="Responsive home banner",
        )

        response = APIClient().get("/api/content/web/banner/")

        assert response.status_code == 200
        payload = _article_payload(response)
        assert payload[0]["imageUrl"]
        assert payload[0]["imageMobileUrl"]
        assert "banners/mobile/home.webp" in payload[0]["imageMobileUrl"]


@pytest.mark.django_db
class TestBannerImageProcessing:
    def test_seed_web_banner_sources_are_retina_ready(self):
        banner_root = Path(__file__).resolve().parents[2] / "data" / "seed_images" / "banners"
        web_banner_files = sorted(banner_root.glob("*_web.jpg"))

        assert web_banner_files

        for banner_file in web_banner_files:
            with Image.open(banner_file) as image:
                assert image.width >= 2400, f"{banner_file.name} is only {image.width}px wide"
                assert image.height >= 750, f"{banner_file.name} is only {image.height}px tall"

    def test_banner_upload_options_preserve_large_desktop_banner_width(self, monkeypatch, settings):
        settings.MINIO_BUCKET = "square"
        settings.MINIO_PUBLIC_URL = "https://s3.example.test"
        settings.MINIO_USE_PRESIGNED = False

        source = io.BytesIO()
        Image.new("RGB", (1600, 500), color=(34, 92, 147)).save(source, format="JPEG")
        image_file = SimpleUploadedFile(
            "home-banner.jpg",
            source.getvalue(),
            content_type="image/jpeg",
        )

        captured = {}

        class FakeMinioClient:
            def put_object(self, bucket, object_name, file_obj, length, content_type):
                captured["bucket"] = bucket
                captured["object_name"] = object_name
                captured["content"] = file_obj.read()
                captured["content_type"] = content_type

        monkeypatch.setattr(
            CloudinaryService,
            "_get_client",
            staticmethod(lambda endpoint_override=None: FakeMinioClient()),
        )
        monkeypatch.setattr(
            CloudinaryService,
            "_ensure_bucket",
            staticmethod(lambda client, bucket: None),
        )

        result = CloudinaryService.upload_image(
            image_file,
            "banners/web",
            public_id="square_home_web",
            options={"max_size": (2400, 2400), "quality": 92},
        )

        output = Image.open(io.BytesIO(captured["content"]))

        assert result["public_id"] == "banners/web/square_home_web.webp"
        assert captured["bucket"] == "square"
        assert captured["content_type"] == "image/webp"
        assert output.size == (1600, 500)


@pytest.mark.django_db
class TestBannerAdminValidation:
    def test_banner_model_default_platform_matches_platform_choices(self):
        if not BannerType.objects.filter(is_active=True).exists():
            next_value = (BannerType.objects.aggregate(max_value=Max("value"))["max_value"] or 0) + 1
            BannerType.objects.create(
                code="HOME_TEST",
                name="Trang chủ",
                value=next_value,
                is_active=True,
            )
        banner_type = BannerType.objects.filter(is_active=True).order_by("value").first()

        banner = Banner.objects.create(type=banner_type.value)

        assert banner.platform == "WEB"

    def test_admin_banner_serializer_rejects_type_outside_active_banner_types(self):
        from apps.content.serializers import AdminBannerSerializer

        if not BannerType.objects.filter(is_active=True).exists():
            next_value = (BannerType.objects.aggregate(max_value=Max("value"))["max_value"] or 0) + 1
            BannerType.objects.create(
                code="HOME_TEST",
                name="Trang chủ",
                value=next_value,
                is_active=True,
            )
        invalid_type = (BannerType.objects.aggregate(max_value=Max("value"))["max_value"] or 0) + 1000

        serializer = AdminBannerSerializer(
            data={"type": invalid_type},
            partial=True,
        )

        assert serializer.is_valid() is False
        assert "type" in serializer.errors

    def test_admin_banner_serializer_rejects_invalid_button_link(self):
        from apps.content.serializers import AdminBannerSerializer

        serializer = AdminBannerSerializer(
            data={"button_link": "not-a-url"},
            partial=True,
        )

        assert serializer.is_valid() is False
        assert "button_link" in serializer.errors

    def test_admin_banner_type_ordering_ignores_invalid_fields_and_keeps_valid_sort(self, admin_user):
        BannerType.objects.all().delete()
        BannerType.objects.create(
            code="ALPHA",
            name="Alpha banner",
            value=10,
            is_active=True,
        )
        BannerType.objects.create(
            code="OMEGA",
            name="Omega banner",
            value=20,
            is_active=True,
        )

        client = APIClient()
        client.force_authenticate(user=admin_user)

        invalid_response = client.get("/api/content/web/admin/banner-types/?ordering=not_a_model_field")
        valid_response = client.get("/api/content/web/admin/banner-types/?ordering=-name")

        assert invalid_response.status_code == 200
        assert valid_response.status_code == 200
        valid_payload = _article_payload(valid_response)
        assert [item["name"] for item in valid_payload["results"][:2]] == [
            "Omega banner",
            "Alpha banner",
        ]


@pytest.mark.django_db
class TestArticleValidation:
    def test_admin_article_serializer_allows_missing_slug_for_auto_generation(self):
        from apps.content.serializers import AdminArticleSerializer

        serializer = AdminArticleSerializer(
            data={
                "title": "Auto generated slug",
                "content": "<p>Article content</p>",
                "category": Article.CATEGORY_NEWS,
                "status": Article.STATUS_DRAFT,
            },
        )

        assert serializer.is_valid() is True

    def test_article_serializers_reject_html_without_text_content(self):
        from apps.content.serializers import AdminArticleSerializer, EmployerArticleSerializer

        admin_article = AdminArticleSerializer(
            data={
                "title": "Empty article",
                "content": "<p><br></p>",
                "category": Article.CATEGORY_NEWS,
                "status": Article.STATUS_DRAFT,
            },
        )
        employer_article = EmployerArticleSerializer(
            data={
                "title": "Empty employer blog",
                "content": "<p>&nbsp;</p>",
            },
        )

        assert admin_article.is_valid() is False
        assert "content" in admin_article.errors
        assert employer_article.is_valid() is False
        assert "content" in employer_article.errors


@pytest.mark.django_db
class TestArticlePublicAPI:
    def test_public_list_includes_news_and_blog_without_category_filter(self, employer_user):
        now = timezone.now()
        news = Article.objects.create(
            title="Tin tức thị trường tuyển dụng",
            excerpt="Bản tin dành cho ứng viên",
            content="<p>Nội dung tin tức</p>",
            category=Article.CATEGORY_NEWS,
            status=Article.STATUS_PUBLISHED,
            author=employer_user,
            published_at=now,
        )
        blog = Article.objects.create(
            title="Blog tuyển dụng cho nhà tuyển dụng",
            excerpt="Kinh nghiệm tuyển dụng",
            content="<p>Nội dung blog</p>",
            category=Article.CATEGORY_BLOG,
            status=Article.STATUS_PUBLISHED,
            author=employer_user,
            published_at=now,
        )

        response = APIClient().get("/api/content/web/articles/")

        assert response.status_code == 200
        payload = _article_payload(response)
        ids = {item["id"] for item in payload["results"]}
        assert {news.id, blog.id}.issubset(ids)

    def test_public_category_filter_keeps_blog_separate(self, employer_user):
        Article.objects.create(
            title="Tin tức tuyển dụng",
            content="<p>Tin tức</p>",
            category=Article.CATEGORY_NEWS,
            status=Article.STATUS_PUBLISHED,
            author=employer_user,
            published_at=timezone.now(),
        )
        blog = Article.objects.create(
            title="Blog tuyển dụng",
            content="<p>Blog</p>",
            category=Article.CATEGORY_BLOG,
            status=Article.STATUS_PUBLISHED,
            author=employer_user,
            published_at=timezone.now(),
        )

        response = APIClient().get("/api/content/web/articles/", {"category": "blog"})

        assert response.status_code == 200
        payload = _article_payload(response)
        assert [item["id"] for item in payload["results"]] == [blog.id]

    def test_search_requires_all_phrase_tokens_and_searches_content_tags(self, employer_user):
        matching = Article.objects.create(
            title="Cách xây hồ sơ nghề nghiệp",
            excerpt="Hướng dẫn cho ứng viên ngành thiết kế",
            content="<p>Portfolio kiến trúc nên trình bày bài toán, concept và vai trò trong dự án.</p>",
            tags="kiến trúc,portfolio,ứng viên",
            category=Article.CATEGORY_BLOG,
            status=Article.STATUS_PUBLISHED,
            author=employer_user,
            published_at=timezone.now(),
        )
        Article.objects.create(
            title="Portfolio cá nhân cho ứng viên",
            excerpt="Chỉ nhắc đến portfolio, không có ngành thiết kế cụ thể",
            content="<p>Portfolio tốt cần rõ kết quả công việc.</p>",
            tags="portfolio",
            category=Article.CATEGORY_BLOG,
            status=Article.STATUS_PUBLISHED,
            author=employer_user,
            published_at=timezone.now(),
        )

        response = APIClient().get(
            "/api/content/web/articles/",
            {"search": "portfolio kiến trúc"},
        )

        assert response.status_code == 200
        payload = _article_payload(response)
        assert [item["id"] for item in payload["results"]] == [matching.id]


@pytest.mark.django_db
class TestEmployerArticleAPI:
    def test_job_seeker_cannot_create_employer_article(self, job_seeker_user):
        client = APIClient()
        client.force_authenticate(user=job_seeker_user)

        response = client.post(
            "/api/content/web/employer/articles/",
            {
                "title": "Bai viet tu ung vien",
                "excerpt": "Khong phai nha tuyen dung",
                "content": "<p>content</p>",
                "tags": "candidate",
            },
            format="json",
        )

        assert response.status_code == 403

    def test_employer_blog_search_covers_content_and_tags(self, employer_user):
        client = APIClient()
        client.force_authenticate(user=employer_user)
        matching = Article.objects.create(
            title="Quy trình phỏng vấn",
            excerpt="Nội dung nội bộ",
            content="<p>Nhà tuyển dụng cấp cao cần chuẩn hóa tiêu chí đánh giá.</p>",
            tags="phỏng vấn,tuyển dụng cấp cao",
            category=Article.CATEGORY_BLOG,
            status=Article.STATUS_PENDING,
            author=employer_user,
        )
        Article.objects.create(
            title="Quản lý thương hiệu tuyển dụng",
            excerpt="Không trùng truy vấn",
            content="<p>Chia sẻ kinh nghiệm viết bài tuyển dụng.</p>",
            tags="thương hiệu",
            category=Article.CATEGORY_BLOG,
            status=Article.STATUS_PENDING,
            author=employer_user,
        )

        response = client.get(
            "/api/content/web/employer/articles/",
            {"search": "tuyển dụng cấp cao"},
        )

        assert response.status_code == 200
        payload = _article_payload(response)
        assert [item["id"] for item in payload["results"]] == [matching.id]
