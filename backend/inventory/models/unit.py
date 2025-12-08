from django.db import models

# -----------------------------
# LOOKUP: Unit
# -----------------------------
class Unit(models.Model):
    """
    Unit of measurement (cyl, pcs, set, nos, kg, etc.)
    Keeps units data-driven.
    """
    short_name = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=200, blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Unit"
        verbose_name_plural = "Units"
        ordering = ["short_name"]

    def __str__(self):
        return self.short_name