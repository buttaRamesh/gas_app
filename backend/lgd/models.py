from django.db import models

class LGDInfo(models.Model):
    district = models.IntegerField("LGD District Code")
    district_name = models.CharField("District Name", max_length=100)
    sub_district = models.IntegerField("LGD Sub-District Code")
    sub_district_name = models.CharField("Sub-District Name", max_length=100)
    village = models.IntegerField("LGD Village Code")
    village_name = models.CharField("Village Name", max_length=100)

    def __str__(self):
        return f"{self.village_name}, {self.sub_district_name}, {self.district_name}"

    class Meta:
        verbose_name = "LGD Information"
        verbose_name_plural = "LGD Information"
        indexes = [
            models.Index(fields=['district', 'sub_district', 'village']),  # Hierarchical lookup
            models.Index(fields=['district_name']),  # Name-based search
            models.Index(fields=['village_name']),  # Village search
        ]