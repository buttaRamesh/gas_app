from django.db import models
from django.contrib.auth import get_user_model
from inventory.models import Product, ProductPrice


class ProductPriceLog(models.Model):
    class ActionType(models.TextChoices):
        CREATED = "CREATED"
        UPDATED = "UPDATED"
        DELETED = "DELETED"

    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    old_effective_from = models.DateField(null=True, blank=True)
    old_effective_to = models.DateField(null=True, blank=True)

    new_effective_from = models.DateField(null=True, blank=True)
    new_effective_to = models.DateField(null=True, blank=True)

    action_type = models.CharField(max_length=20, choices=ActionType.choices)

    changed_by = models.ForeignKey(
        get_user_model(),
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    changed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} - {self.action_type} @ {self.changed_at}"
