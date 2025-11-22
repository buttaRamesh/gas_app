from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import datetime

# The Scheme model remains unchanged and separate
class Scheme(models.Model):
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

# --- MODIFIED MODEL ---

class SubsidyDetails(models.Model):
    # The 'scheme' ForeignKey has been removed.
    
    year = models.PositiveIntegerField(
        "Applicable subsidy year",
        unique=True,  # Assuming only one subsidy record per year is allowed
        validators=[
            MinValueValidator(1990), 
            # The current year is 2025, so this will validate up to 2026
            MaxValueValidator(datetime.date.today().year + 1)
        ]
    )
    quota = models.PositiveIntegerField("Total quota allotted")
    delivered = models.PositiveIntegerField("Quota delivered so far", default=0)

    def __str__(self):
        return f"Subsidy for {self.year}"

    class Meta:
        # The unique_together constraint has been removed.
        verbose_name_plural = "Subsidy Details"