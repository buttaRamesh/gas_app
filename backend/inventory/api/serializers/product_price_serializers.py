from rest_framework import serializers
from inventory.models import ProductPrice
from django.db.models import Q
from datetime import date


class ProductPriceSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = ProductPrice
        fields = [
            "id",
            "product",
            "product_name",
            "price",
            "effective_date",
            "remarks",
            "is_active",
            "created_at",
        ]

    def validate(self, attrs):
        product = attrs.get("product")
        effective_date = attrs.get("effective_date")

        # Updating existing instance?
        instance = getattr(self, "instance", None)

        # Basic check (for future rule extensions)
        if effective_date > date.today():
            raise serializers.ValidationError("Effective date cannot be in the future.")

        # Prevent duplicate entries with same effective_date
        qs = ProductPrice.objects.filter(product=product, effective_date=effective_date)

        if instance:
            qs = qs.exclude(id=instance.id)

        if qs.exists():
            raise serializers.ValidationError(
                f"A price for {effective_date} already exists for this product."
            )

        return attrs
