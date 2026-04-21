
from shared.configs import variable_system as var_sys

from django.db import models

from apps.accounts.models import User

from apps.files.models import File

class ProjectBaseModel(models.Model):

    class Meta:

        abstract = True

    create_at = models.DateTimeField(auto_now_add=True)

    update_at = models.DateTimeField(auto_now=True)

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
