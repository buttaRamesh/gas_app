from rest_framework import serializers
from inventory.models import Product, ProductCategory, Unit


class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = ["id", "name", "description", "is_active"]


class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = ["id", "short_name", "description", "is_active"]


class ProductSerializer(serializers.ModelSerializer):
    category = ProductCategorySerializer(read_only=True)
    unit = UnitSerializer(read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "product_code",
            "category",
            "unit",
            "is_cylinder",
            "description",
            "is_active",
        ]


class ProductWriteSerializer(serializers.ModelSerializer):
    """
    Serializer used for create/update operations.
    """

    class Meta:
        model = Product
        fields = [
            "name",
            "product_code",
            "category",
            "unit",
            "is_cylinder",
            "description",
            "is_active",
        ]
