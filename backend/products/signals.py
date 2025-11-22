from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import ProductVariant, ProductVariantPriceHistory


@receiver(pre_save, sender=ProductVariant)
def track_price_change(sender, instance, **kwargs):
    """
    Automatically create price history record when price changes.
    This runs BEFORE the ProductVariant is saved.
    """
    if instance.pk:  # Only for updates, not new creations
        try:
            # Get the old instance from database
            old_instance = ProductVariant.objects.get(pk=instance.pk)
            old_price = old_instance.price
            new_price = instance.price
            
            # Check if price has changed
            if old_price != new_price:
                # Store the old price temporarily for use in post_save
                instance._old_price = old_price
                instance._price_changed = True
            else:
                instance._price_changed = False
        except ProductVariant.DoesNotExist:
            instance._price_changed = False
    else:
        # For new instances, mark that this is initial price
        instance._is_new = True


@receiver(post_save, sender=ProductVariant)
def create_price_history(sender, instance, created, **kwargs):
    """
    Create price history record after ProductVariant is saved.
    This runs AFTER the ProductVariant is saved.
    """
    # For newly created variants, create initial price record
    if created:
        ProductVariantPriceHistory.objects.create(
            variant=instance,
            old_price=None,  # No old price for new variant
            new_price=instance.price,
            price_change=instance.price,  # Initial price
            price_change_percentage=None,
            reason="Initial price",
            notes="Product variant created"
        )
    
    # For price updates, create change record
    elif hasattr(instance, '_price_changed') and instance._price_changed:
        old_price = instance._old_price
        new_price = instance.price
        
        ProductVariantPriceHistory.objects.create(
            variant=instance,
            old_price=old_price,
            new_price=new_price,
            price_change=new_price - old_price,
            # Percentage will be calculated in model's save method
        )
        
        # Clean up temporary attributes
        del instance._price_changed
        del instance._old_price
        