
import base64

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from rest_framework.test import APIClient

from apps.content.models import Article, Feedback
from shared.helpers.cloudinary_service import CloudinaryService


ONE_PIXEL_PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4//8/AAX+Av4N70a4AAAAAElFTkSuQmCC"
)


def _article_payload(response):
    return response.data.get("data", response.data)


@pytest.mark.django_db
class TestFeedbackAPI:
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
