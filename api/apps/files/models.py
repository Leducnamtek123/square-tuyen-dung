from django.db import models

from shared.models import CommonBaseModel


class File(CommonBaseModel):
    AVATAR_TYPE = "AVATAR"
    CV_TYPE = "CV"
    LOGO_TYPE = "LOGO"
    COVER_IMAGE_TYPE = "COVER_IMAGE"
    COMPANY_IMAGE_TYPE = "COMPANY_IMAGE"
    CAREER_IMAGE_TYPE = "CAREER_IMAGE"
    WEB_BANNER_TYPE = "WEB_BANNER"
    MOBILE_BANNER_TYPE = "MOBILE_BANNER"
    SYSTEM_TYPE = "SYSTEM"
    OTHER_TYPE = "OTHER"

    FILE_TYPES = [
        (AVATAR_TYPE, "Avatar"),
        (CV_TYPE, "CV"),
        (LOGO_TYPE, "Logo"),
        (COVER_IMAGE_TYPE, "Cover Image"),
        (COMPANY_IMAGE_TYPE, "Company Image"),
        (CAREER_IMAGE_TYPE, "Career Image"),
        (WEB_BANNER_TYPE, "Web Banner"),
        (MOBILE_BANNER_TYPE, "Mobile Banner"),
        (SYSTEM_TYPE, "System"),
        (OTHER_TYPE, "Other"),
    ]

    RESOURCE_TYPES = [
        ("image", "Image"),
        ("video", "Video"),
        ("raw", "Raw File"),
    ]

    public_id = models.CharField(max_length=255)
    version = models.CharField(max_length=20, null=True, blank=True)
    format = models.CharField(max_length=50)
    resource_type = models.CharField(max_length=50, choices=RESOURCE_TYPES)
    file_type = models.CharField(max_length=50, choices=FILE_TYPES, default=OTHER_TYPE)
    uploaded_at = models.DateTimeField(null=False, blank=False)
    metadata = models.JSONField(blank=True, null=True)

    def get_full_url(self):
        from shared.helpers.cloudinary_service import CloudinaryService

        url, _ = CloudinaryService.get_url_from_public_id(
            self.public_id,
            {
                "version": self.version,
                "format": self.format,
                "resource_type": self.resource_type,
            },
        )

        return url

    @staticmethod
    def update_or_create_file_with_cloudinary(
        file,
        cloudinary_upload_result,
        file_type: str = OTHER_TYPE,
    ):
        file_data = {
            "public_id": cloudinary_upload_result.get("public_id"),
            "version": cloudinary_upload_result.get("version"),
            "format": cloudinary_upload_result.get("format"),
            "resource_type": cloudinary_upload_result.get("resource_type"),
            "uploaded_at": cloudinary_upload_result.get("created_at"),
            "metadata": cloudinary_upload_result,
            "file_type": file_type,
        }

        if file:
            for key, value in file_data.items():
                setattr(file, key, value)
            file.save()
        else:
            file = File.objects.create(**file_data)

        return file

    class Meta:
        db_table = "project_files"
        ordering = ["-create_at"]


