from django.db import models

from apps.files.models import File
from shared.models import CommonBaseModel


class Career(CommonBaseModel):
    name = models.CharField(max_length=150)
    app_icon_name = models.CharField(max_length=50, null=True)
    is_hot = models.BooleanField(default=False)
    icon = models.OneToOneField(File, on_delete=models.SET_NULL, null=True)

    class Meta:
        db_table = "project_common_career"

    def __str__(self):
        return self.name


