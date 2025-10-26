from django.db import models
from django.conf import settings
from decimal import Decimal


class Unit(models.Model):
    """Unit of measurement for products (kg, pcs, L, etc.)"""
    short_name = models.CharField(
        "Unit name (e.g., kg, pcs)", 
        max_length=50, 
        unique=True
    )
    description = models.CharField(
        "Description of the unit", 
        max_length=100, 
        blank=True, 
        null=True
    )

    def __str__(self):
        return self.short_name

    class Meta:
        verbose_name = "Unit of Measurement"
        verbose_name_plural = "Units of Measurement"


class Product(models.Model):
    """Product category (e.g., LPG Gas Cylinder, Gas Stove)"""
    name = models.CharField("Product category name", max_length=100, unique=True)
    description = models.TextField("Category description", blank=True, null=True)

    def __str__(self):
        return self.name


class ProductVariant(models.Model):
    """Specific variant of a product with pricing"""
    
    class VariantType(models.TextChoices):
        DOMESTIC = 'DOMESTIC', 'Domestic'
        COMMERCIAL = 'COMMERCIAL', 'Commercial'
        INDUSTRIAL = 'INDUSTRIAL', 'Industrial'
        OTHER = 'OTHER', 'Other'

    # --- Core Details ---
    product_code = models.CharField("Product code / SKU", max_length=50, unique=True)
    name = models.CharField("Variant name", max_length=200)
    
    # --- Relationships ---
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name='variants',
        verbose_name="Parent product category"
    )
    unit = models.ForeignKey(
        Unit,
        on_delete=models.PROTECT,
        verbose_name="Unit of measurement"
    )
    
    # --- Specific Attributes ---
    size = models.DecimalField(
        "Size (e.g., weight or volume)",
        max_digits=10,
        decimal_places=2,
        help_text="The numeric size, like 14.2 or 19.0"
    )
    variant_type = models.CharField(
        max_length=20,
        choices=VariantType.choices,
        default=VariantType.OTHER
    )
    
    # --- Pricing ---
    price = models.DecimalField(
        "Current selling price",
        max_digits=10,
        decimal_places=2,
        help_text="Current price for this variant"
    )
    
    def __str__(self):
        return f"{self.name} - ₹{self.price}"
    
    def get_price_history(self):
        """Get price change history for this variant"""
        return self.price_history.all().order_by('-effective_date')
    
    def get_latest_price_change(self):
        """Get the most recent price change"""
        return self.price_history.first()
    
    class Meta:
        unique_together = ('product', 'name')
        indexes = [
            models.Index(fields=['product', 'variant_type']),
            models.Index(fields=['variant_type']),
            models.Index(fields=['price']),  # For price-based queries
        ]


class ProductVariantPriceHistory(models.Model):
    """Track price changes for product variants"""
    
    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.CASCADE,
        related_name='price_history',
        verbose_name="Product variant"
    )
    old_price = models.DecimalField(
        "Previous price",
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Price before the change"
    )
    new_price = models.DecimalField(
        "New price",
        max_digits=10,
        decimal_places=2,
        help_text="Price after the change"
    )
    price_change = models.DecimalField(
        "Price change amount",
        max_digits=10,
        decimal_places=2,
        help_text="Difference (new - old)"
    )
    price_change_percentage = models.DecimalField(
        "Price change %",
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Percentage change"
    )
    effective_date = models.DateTimeField(
        "Effective date",
        auto_now_add=True,
        help_text="When this price became effective"
    )
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='price_changes',
        verbose_name="Changed by"
    )
    reason = models.CharField(
        "Reason for change",
        max_length=200,
        blank=True,
        help_text="Optional reason for price change"
    )
    notes = models.TextField(
        "Additional notes",
        blank=True,
        help_text="Any additional information"
    )
    
    def __str__(self):
        change_sign = "+" if self.price_change >= 0 else ""
        return f"{self.variant.name}: ₹{self.old_price} → ₹{self.new_price} ({change_sign}₹{self.price_change})"
    
    def save(self, *args, **kwargs):
        """Calculate price change and percentage automatically"""
        if self.old_price and self.new_price:
            self.price_change = self.new_price - self.old_price
            if self.old_price > 0:
                self.price_change_percentage = (
                    (self.new_price - self.old_price) / self.old_price * 100
                )
        super().save(*args, **kwargs)
    
    class Meta:
        verbose_name = "Product Variant Price History"
        verbose_name_plural = "Product Variant Price History"
        ordering = ['-effective_date']
        indexes = [
            models.Index(fields=['-effective_date']),
            models.Index(fields=['variant', '-effective_date']),
        ]