
import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from apps.content.models import Article


def _article_payload(response):
    return response.data.get("data", response.data)


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
