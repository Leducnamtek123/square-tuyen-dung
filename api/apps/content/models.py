
from shared.configs import variable_system as var_sys

from django.db import models
from django.utils import timezone
import unicodedata
import re

from apps.accounts.models import User

from apps.files.models import File


class ProjectBaseModel(models.Model):

    class Meta:

        abstract = True

    create_at = models.DateTimeField(auto_now_add=True)

    update_at = models.DateTimeField(auto_now=True)


def slugify_vi(value):
    """Convert a Vietnamese string to a URL-friendly slug."""
    vi_chars = {
        'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
        'ă': 'a', 'ắ': 'a', 'ặ': 'a', 'ằ': 'a', 'ẳ': 'a', 'ẵ': 'a',
        'â': 'a', 'ấ': 'a', 'ậ': 'a', 'ầ': 'a', 'ẩ': 'a', 'ẫ': 'a',
        'đ': 'd',
        'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
        'ê': 'e', 'ế': 'e', 'ệ': 'e', 'ề': 'e', 'ể': 'e', 'ễ': 'e',
        'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
        'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
        'ô': 'o', 'ố': 'o', 'ộ': 'o', 'ồ': 'o', 'ổ': 'o', 'ỗ': 'o',
        'ơ': 'o', 'ớ': 'o', 'ợ': 'o', 'ờ': 'o', 'ở': 'o', 'ỡ': 'o',
        'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
        'ư': 'u', 'ứ': 'u', 'ự': 'u', 'ừ': 'u', 'ử': 'u', 'ữ': 'u',
        'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    }
    value = str(value).lower()
    for vi, en in vi_chars.items():
        value = value.replace(vi, en)
    value = re.sub(r'[^a-z0-9\s-]', '', value)
    value = re.sub(r'[\s_]+', '-', value)
    value = re.sub(r'-+', '-', value).strip('-')
    return value


class Feedback(ProjectBaseModel):

    content = models.CharField(max_length=500)

    rating = models.SmallIntegerField(default=5)

    is_active = models.BooleanField(default=False)

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="feedbacks")

    class Meta:

        db_table = "project_project_feedback"

    def __str__(self):

        return self.content


class Banner(ProjectBaseModel):

    button_text = models.TextField(max_length=20, null=True, blank=True)

    description = models.TextField(max_length=100, null=True, blank=True)

    button_link = models.URLField(null=True, blank=True)

    is_show_button = models.BooleanField(default=False)

    description_location = models.IntegerField(choices=var_sys.DESCRIPTION_LOCATION,

                                               default=var_sys.DescriptionLocation.BOTTOM_LEFT)

    platform = models.CharField(max_length=3, choices=var_sys.PLATFORM_CHOICES,

                                default=var_sys.DescriptionLocation.TOP_LEFT)

    type = models.IntegerField(default=var_sys.BannerType.HOME, db_index=True)

    is_active = models.BooleanField(default=False)

    image = models.OneToOneField(File, on_delete=models.SET_NULL, null=True, related_name="banner_image")

    image_mobile = models.OneToOneField(File, on_delete=models.SET_NULL, null=True, related_name="banner_image_mobile")

    class Meta:

        db_table = "project_project_banner"

    def __str__(self):

        return str(self.id)


class BannerType(ProjectBaseModel):
    code = models.CharField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=100)
    value = models.PositiveIntegerField(unique=True)
    web_aspect_ratio = models.CharField(max_length=20, blank=True, default='')
    mobile_aspect_ratio = models.CharField(max_length=20, blank=True, default='')
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "project_project_banner_type"
        ordering = ["value"]

    def __str__(self):
        return f"{self.code} ({self.value})"


class SystemSetting(models.Model):
    """Key-value store for system-wide settings."""
    key = models.CharField(max_length=100, unique=True, db_index=True)
    value = models.TextField(default='')
    description = models.CharField(max_length=255, blank=True, default='')

    class Meta:
        db_table = "project_project_system_setting"
        verbose_name_plural = "System settings"

    def __str__(self):
        return f"{self.key} = {self.value}"


class Article(ProjectBaseModel):
    """
    Content article — used for both admin-written news (category='news')
    and employer-written recruitment blog posts (category='blog').
    """

    CATEGORY_NEWS = 'news'
    CATEGORY_BLOG = 'blog'
    CATEGORY_CHOICES = [
        (CATEGORY_NEWS, 'Tin tức'),
        (CATEGORY_BLOG, 'Blog tuyển dụng'),
    ]

    STATUS_DRAFT = 'draft'
    STATUS_PENDING = 'pending'       # employer submitted, waiting admin approval
    STATUS_PUBLISHED = 'published'
    STATUS_ARCHIVED = 'archived'
    STATUS_CHOICES = [
        (STATUS_DRAFT, 'Bản nháp'),
        (STATUS_PENDING, 'Chờ duyệt'),
        (STATUS_PUBLISHED, 'Đã đăng'),
        (STATUS_ARCHIVED, 'Lưu trữ'),
    ]

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True, db_index=True, allow_unicode=True)
    excerpt = models.TextField(max_length=500, blank=True, default='')
    content = models.TextField(default='')
    thumbnail = models.ForeignKey(
        File, null=True, blank=True, on_delete=models.SET_NULL,
        related_name='article_thumbnail'
    )
    category = models.CharField(
        max_length=10, choices=CATEGORY_CHOICES,
        default=CATEGORY_NEWS, db_index=True
    )
    status = models.CharField(
        max_length=15, choices=STATUS_CHOICES,
        default=STATUS_DRAFT, db_index=True
    )
    author = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL,
        related_name='articles'
    )
    view_count = models.PositiveIntegerField(default=0)
    published_at = models.DateTimeField(null=True, blank=True, db_index=True)
    tags = models.CharField(max_length=500, blank=True, default='')

    class Meta:
        db_table = 'project_content_article'
        ordering = ['-published_at', '-create_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # Auto-generate slug from title if not set
        if not self.slug:
            base_slug = slugify_vi(self.title)
            slug = base_slug
            counter = 1
            while Article.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        # Auto-set published_at when status changes to published
        if self.status == self.STATUS_PUBLISHED and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)
