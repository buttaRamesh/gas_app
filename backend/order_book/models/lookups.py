from django.db import models


class RefillType(models.Model):
    """Lookup table for refill types (BharatgasMApps, PayNBook Apps, JIO IVRS, etc.)"""
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Refill Type"
        verbose_name_plural = "Refill Types"
        ordering = ["name"]


class DeliveryFlag(models.Model):
    """Lookup table for delivery flags (Booked Not Printed, Delivered, etc.)"""
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Delivery Flag"
        verbose_name_plural = "Delivery Flags"
        ordering = ["name"]


class PaymentOption(models.Model):
    """Lookup table for payment options (COD, Online Payment, etc.)"""
    name = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Payment Option"
        verbose_name_plural = "Payment Options"
        ordering = ["name"]
