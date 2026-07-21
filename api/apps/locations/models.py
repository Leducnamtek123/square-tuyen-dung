from django.db import models

from shared.models import CommonBaseModel


class City(CommonBaseModel):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=20, unique=True, null=True, blank=True)

    class Meta:
        db_table = "project_common_city"
        verbose_name_plural = "Cities"

    def __str__(self):
        return self.name


class District(CommonBaseModel):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=20, unique=True, null=True, blank=True)
    city = models.ForeignKey("City", on_delete=models.CASCADE, related_name="districts")

    class Meta:
        db_table = "project_common_district"

    def __str__(self):
        return self.name


class Ward(CommonBaseModel):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=20, unique=True, null=True, blank=True)
    district = models.ForeignKey("District", on_delete=models.CASCADE, related_name="wards")

    class Meta:
        db_table = "project_common_ward"

    def __str__(self):
        return self.name


class Location(CommonBaseModel):
    city = models.ForeignKey(City, on_delete=models.SET_NULL, null=True, related_name="locations")
    district = models.ForeignKey(District, on_delete=models.SET_NULL, null=True, related_name="locations")
    ward = models.ForeignKey(Ward, on_delete=models.SET_NULL, null=True, related_name="locations")
    address = models.CharField(max_length=255, blank=True, null=True)
    lat = models.FloatField(null=True, blank=True)
    lng = models.FloatField(null=True, blank=True)

    class Meta:
        db_table = "project_common_location"

    def __str__(self):
        return (
            f"City: {self.city.name if self.city else '---'} / "
            f"District: {self.district.name if self.district else '---'} / "
            f"Ward: {self.ward.name if self.ward else '---'} / "
            f"Address: {self.address} / "
            f"Location: ({self.lat}:{self.lng})"
        )


