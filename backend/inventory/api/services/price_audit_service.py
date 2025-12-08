from inventory.models import ProductPriceLog


class ProductPriceAuditService:

    @staticmethod
    def log_create(price_obj, user=None):
        ProductPriceLog.objects.create(
            product=price_obj.product,
            price=price_obj.price,
            new_effective_date=price_obj.effective_date,
            action_type=ProductPriceLog.ActionType.CREATED,
            changed_by=user,
        )

    @staticmethod
    def log_update(old_obj, new_obj, user=None):
        ProductPriceLog.objects.create(
            product=new_obj.product,
            price=new_obj.price,
            old_effective_date=old_obj.effective_date,
            new_effective_date=new_obj.effective_date,
            action_type=ProductPriceLog.ActionType.UPDATED,
            changed_by=user,
        )

    @staticmethod
    def log_delete(old_obj, user=None):
        ProductPriceLog.objects.create(
            product=old_obj.product,
            price=old_obj.price,
            old_effective_date=old_obj.effective_date,
            action_type=ProductPriceLog.ActionType.DELETED,
            changed_by=user,
        )
