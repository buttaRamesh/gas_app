from django.db import models

# -----------------------------
# LOOKUP: Cylinder Category
# -----------------------------
class CylinderCategory(models.Model):
    """
    Logical cylinder classification used for billing / OMC mapping:
    e.g., S-DOM, NS-DOM, BCAP, COM, BMCG, FTL, DPR, etc.
    """
    code = models.CharField(max_length=50, unique=True,
                            help_text="Short code, e.g. 'S-DOM', 'NS-DOM', 'BCAP'")
    name = models.CharField(max_length=200,
                            help_text="Human readable name, e.g. 'Subsidized Domestic'")
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Cylinder Category"
        verbose_name_plural = "Cylinder Categories"
        ordering = ["code"]

    def __str__(self):
        return f"{self.code} — {self.name}"
