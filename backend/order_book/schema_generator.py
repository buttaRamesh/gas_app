"""
Auto-generate MAPPING_SCHEMA from Django model

This module introspects the OrderBook model and automatically generates
the MAPPING_SCHEMA without any hardcoding.
"""

from django.db import models
from django.db.models.fields.related import ForeignKey


def get_field_type(field):
    """Determine the field type for schema"""
    if isinstance(field, models.ForeignKey):
        return "ForeignKey"
    elif isinstance(field, models.DateTimeField):
        return "DateTimeField"
    elif isinstance(field, models.DateField):
        return "DateField"
    elif isinstance(field, models.CharField):
        return "CharField"
    elif isinstance(field, models.TextField):
        return "TextField"
    elif isinstance(field, models.IntegerField):
        return "IntegerField"
    elif isinstance(field, models.DecimalField):
        return "DecimalField"
    elif isinstance(field, models.BooleanField):
        return "BooleanField"
    else:
        return "Unknown"


def generate_label_from_field_name(field_name):
    """Convert field name to human-readable label"""
    # Split by underscore and capitalize each word
    words = field_name.split('_')
    return ' '.join(word.capitalize() for word in words)


def auto_generate_mapping_schema():
    """
    Auto-generate MAPPING_SCHEMA by introspecting OrderBook model

    Returns a schema dictionary with PENDING and DELIVERY field configurations
    """
    from order_book.models import OrderBook, PaymentInfo

    # Define which fields to include for each upload type
    # Key = model field name, Value = configuration
    PENDING_FIELDS_CONFIG = {
        "consumer": {"required": True, "lookup_field": "consumer_number"},
        "order_no": {"required": True},
        "book_date": {"required": True},
        "product": {"required": False},
        "refill_type": {"required": False, "lookup_field": "name"},
        "delivery_flag": {"required": False, "lookup_field": "name"},
        "last_delivery_date": {"required": False},
        "payment_option": {"required": False, "lookup_field": "name", "related_model": "PaymentInfo"},
    }

    DELIVERY_FIELDS_CONFIG = {
        "consumer": {"required": True, "lookup_field": "consumer_number"},
        "order_no": {"required": True},
        "book_date": {"required": True},
        "delivery_date": {"required": False},
        "product": {"required": False},
        "refill_type": {"required": False, "lookup_field": "name"},
        "delivery_flag": {"required": False, "lookup_field": "name"},
        "delivery_person": {"required": False, "lookup_field": "name"},
        # These come from PaymentInfo model
        "cash_memo_no": {"required": False, "related_model": "PaymentInfo"},
        "payment_option": {"required": False, "lookup_field": "name", "related_model": "PaymentInfo"},
    }

    schema = {
        "PENDING": {"fields": []},
        "DELIVERY": {"fields": []}
    }

    # Generate PENDING fields
    for field_name, config in PENDING_FIELDS_CONFIG.items():
        try:
            # Check if field is in related model
            if config.get("related_model") == "PaymentInfo":
                field = PaymentInfo._meta.get_field(field_name)
            else:
                field = OrderBook._meta.get_field(field_name)

            field_def = {
                "key": field_name,  # Actual model field name
                "label": generate_label_from_field_name(field_name),
                "required": config.get("required", False),
                "description": field.help_text or f"{generate_label_from_field_name(field_name)} field",
                "field_type": get_field_type(field),
            }

            # Add lookup_field for ForeignKey fields
            if isinstance(field, ForeignKey) and "lookup_field" in config:
                field_def["lookup_field"] = config["lookup_field"]

            # Mark if from related model
            if "related_model" in config:
                field_def["related_model"] = config["related_model"]

            schema["PENDING"]["fields"].append(field_def)

        except Exception as e:
            # Field not found, skip
            continue

    # Generate DELIVERY fields
    for field_name, config in DELIVERY_FIELDS_CONFIG.items():
        try:
            # Check if field is in related model
            if config.get("related_model") == "PaymentInfo":
                field = PaymentInfo._meta.get_field(field_name)
            else:
                field = OrderBook._meta.get_field(field_name)

            field_def = {
                "key": field_name,  # Actual model field name
                "label": generate_label_from_field_name(field_name),
                "required": config.get("required", False),
                "description": field.help_text or f"{generate_label_from_field_name(field_name)} field",
                "field_type": get_field_type(field),
            }

            # Add lookup_field for ForeignKey fields
            if isinstance(field, ForeignKey) and "lookup_field" in config:
                field_def["lookup_field"] = config["lookup_field"]

            # Mark if from related model
            if "related_model" in config:
                field_def["related_model"] = config["related_model"]

            schema["DELIVERY"]["fields"].append(field_def)

        except Exception as e:
            # Field not found, skip
            continue

    return schema
