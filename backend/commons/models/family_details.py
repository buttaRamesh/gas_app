from django.db import models

class FamilyDetails(models.Model):
    
    father_name = models.CharField("Father's Name", max_length=200, blank=True, null=True)
    mother_name = models.CharField("Mother's Name", max_length=200, blank=True, null=True)
    spouse_name = models.CharField("Spouse Name", max_length=200, blank=True, null=True)

    def __str__(self):
        return self.person_name

    class Meta:
        verbose_name = "Family"
        verbose_name_plural = "Family"
        
