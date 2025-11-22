"""
Utility functions for order_book app
"""

from django.db import models
from order_book.models import OrderBook, FieldConfiguration, PaymentInfo


def get_orderbook_field_definitions(upload_type=None, for_mapping=False):
    """
    Extract field definitions from OrderBook model using Django introspection

    Args:
        upload_type: Filter fields for specific upload type (PENDING/DELIVERY)
        for_mapping: If True, return only configured fields (for Column Mappings)
                    If False, return all fields (for Field Settings)

    Returns:
        list: List of dictionaries containing field metadata:
            - field_name: Backend field name (e.g., 'consumer_number')
            - label: Human-readable label (e.g., 'Consumer Number')
            - required: Whether the field is required
            - field_type: Django field type (e.g., 'CharField', 'DateField')
            - max_length: Maximum length for character fields
            - help_text: Help text for the field
    """
    model = OrderBook
    fields = []

    # Fields to skip (auto-created or internal)
    skip_fields = ['id', 'created_at', 'updated_at', 'updated_by', 'updated_type']

    # Get all model fields
    for field in model._meta.get_fields():
        # Skip auto-created fields and reverse relations
        if field.auto_created or (field.is_relation and field.many_to_many):
            continue

        # Skip internal fields
        if field.name in skip_fields:
            continue

        # Determine if required
        # A field is required if it's not nullable, not blank, and has no default
        is_required = False
        if hasattr(field, 'null') and hasattr(field, 'blank'):
            has_default = field.default != models.NOT_PROVIDED
            is_required = not field.null and not field.blank and not has_default

        # Get verbose name or convert field name to readable label
        label = getattr(field, 'verbose_name', field.name)
        if label == field.name:
            # Convert snake_case to Title Case
            label = field.name.replace('_', ' ').title()
        else:
            label = str(label).title()

        # Get field type
        field_type = field.get_internal_type()

        # Build field definition
        field_def = {
            'field_name': field.name,
            'label': label,
            'required': is_required,
            'field_type': field_type,
            'max_length': getattr(field, 'max_length', None),
            'help_text': getattr(field, 'help_text', ''),
        }

        fields.append(field_def)

    # Add PaymentInfo fields based on upload type
    if upload_type == 'PENDING':
        payment_fields = ['payment_option']  # Only payment_option for PENDING
        for field_name in payment_fields:
            try:
                field = PaymentInfo._meta.get_field(field_name)

                # Determine if required
                is_required = False
                if hasattr(field, 'null') and hasattr(field, 'blank'):
                    has_default = field.default != models.NOT_PROVIDED
                    is_required = not field.null and not field.blank and not has_default

                # Get verbose name or convert field name to readable label
                label = getattr(field, 'verbose_name', field_name)
                if label == field_name:
                    label = field_name.replace('_', ' ').title()
                else:
                    label = str(label).title()

                # Get field type
                field_type = field.get_internal_type()

                # Build field definition
                field_def = {
                    'field_name': field_name,
                    'label': label,
                    'required': is_required,
                    'field_type': field_type,
                    'max_length': getattr(field, 'max_length', None),
                    'help_text': getattr(field, 'help_text', ''),
                    'related_model': 'PaymentInfo',  # Mark as coming from PaymentInfo
                }

                fields.append(field_def)
            except Exception as e:
                # Field not found, skip
                continue

    # Add PaymentInfo fields for DELIVERY upload type
    elif upload_type == 'DELIVERY':
        payment_fields = ['cash_memo_no', 'payment_option']
        for field_name in payment_fields:
            try:
                field = PaymentInfo._meta.get_field(field_name)

                # Determine if required
                is_required = False
                if hasattr(field, 'null') and hasattr(field, 'blank'):
                    has_default = field.default != models.NOT_PROVIDED
                    is_required = not field.null and not field.blank and not has_default

                # Get verbose name or convert field name to readable label
                label = getattr(field, 'verbose_name', field_name)
                if label == field_name:
                    label = field_name.replace('_', ' ').title()
                else:
                    label = str(label).title()

                # Get field type
                field_type = field.get_internal_type()

                # Build field definition
                field_def = {
                    'field_name': field_name,
                    'label': label,
                    'required': is_required,
                    'field_type': field_type,
                    'max_length': getattr(field, 'max_length', None),
                    'help_text': getattr(field, 'help_text', ''),
                    'related_model': 'PaymentInfo',  # Mark as coming from PaymentInfo
                }

                fields.append(field_def)
            except Exception as e:
                # Field not found, skip
                continue

    # Filter fields based on FieldConfiguration if upload_type provided
    if upload_type:
        # Get field configurations for this upload type
        field_configs = FieldConfiguration.objects.filter(
            upload_type=upload_type,
            is_included=True
        ).values('field_name', 'is_required', 'display_order')

        # Create lookup dict for quick access
        config_dict = {
            fc['field_name']: fc for fc in field_configs
        }

        if for_mapping:
            # FOR COLUMN MAPPINGS: Return ONLY configured fields (is_included=True)
            if config_dict:
                # Filter to only configured fields
                filtered_fields = []
                for field in fields:
                    if field['field_name'] in config_dict:
                        config = config_dict[field['field_name']]
                        # Override required status if configured
                        if config['is_required']:
                            field['required'] = True
                        # Add display order for sorting
                        field['display_order'] = config['display_order']
                        filtered_fields.append(field)

                fields = filtered_fields
                # Sort by display_order
                fields.sort(key=lambda x: (
                    x.get('display_order', 9999),
                    not x['required'],
                    x['label']
                ))
            else:
                # No FieldConfiguration exists - return empty for Column Mappings
                fields = []
        else:
            # FOR FIELD SETTINGS: Return ALL fields, apply overrides where they exist
            if config_dict:
                for field in fields:
                    if field['field_name'] in config_dict:
                        config = config_dict[field['field_name']]
                        # Override required status if configured
                        if config['is_required']:
                            field['required'] = True
                        # Add display order for sorting
                        field['display_order'] = config['display_order']
                        field['is_configured'] = True
                    else:
                        # New field without configuration - show at end
                        field['display_order'] = 9999
                        field['is_configured'] = False

                # Sort by display_order, then by required/label
                fields.sort(key=lambda x: (
                    x.get('display_order', 9999),
                    not x['required'],
                    x['label']
                ))
            else:
                # No configuration exists - return all fields sorted normally
                fields.sort(key=lambda x: (not x['required'], x['label']))
    else:
        # No upload_type provided - return all fields sorted normally
        fields.sort(key=lambda x: (not x['required'], x['label']))

    # Remove internal fields from output (used only for sorting/logic)
    for field in fields:
        field.pop('display_order', None)
        field.pop('is_configured', None)

    return fields


def get_csv_field_mapping():
    """
    Return empty mapping - no default suggestions.

    Mappings should either:
    1. Come from saved ColumnMapping records in database
    2. OR be manually configured by user from CSV column names

    Returns:
        dict: Empty dictionary (no default mappings)
    """
    return {}


def validate_column_mapping(mapping_data, csv_columns):
    """
    Validate column mapping data

    Args:
        mapping_data (dict): Mapping of backend fields to CSV columns
        csv_columns (list): List of available CSV column names

    Returns:
        tuple: (is_valid, errors) where errors is a list of error messages
    """
    errors = []

    # Get required fields
    field_defs = get_orderbook_field_definitions()
    required_fields = [f['field_name'] for f in field_defs if f['required']]

    # Check that all required fields are mapped
    for field in required_fields:
        if field not in mapping_data or not mapping_data[field]:
            errors.append(f"Required field '{field}' is not mapped")

    # Check that mapped CSV columns exist in the provided CSV
    for backend_field, csv_column in mapping_data.items():
        if csv_column and csv_column not in csv_columns:
            errors.append(f"CSV column '{csv_column}' not found in uploaded file")

    # Check for duplicate mappings (same CSV column mapped to multiple fields)
    csv_column_usage = {}
    for backend_field, csv_column in mapping_data.items():
        if csv_column:
            if csv_column in csv_column_usage:
                errors.append(
                    f"CSV column '{csv_column}' is mapped to multiple backend fields: "
                    f"{csv_column_usage[csv_column]} and {backend_field}"
                )
            else:
                csv_column_usage[csv_column] = backend_field

    is_valid = len(errors) == 0
    return is_valid, errors


def compare_column_mappings(csv_columns, saved_mapping):
    """
    Compare current CSV columns with previously saved mapping

    Args:
        csv_columns (list): List of column names from current CSV file
        saved_mapping (dict): Previously saved column mapping

    Returns:
        dict: Comparison result with:
            - has_changes: Boolean indicating if there are differences
            - missing_columns: Columns in saved mapping but not in current CSV
            - new_columns: Columns in current CSV but not in saved mapping
            - message: Human-readable message
    """
    # Get CSV columns from saved mapping
    saved_csv_columns = list(saved_mapping.values())

    # Find differences
    missing_columns = [col for col in saved_csv_columns if col and col not in csv_columns]
    new_columns = [col for col in csv_columns if col not in saved_csv_columns]

    has_changes = len(missing_columns) > 0 or len(new_columns) > 0

    # Build message
    message_parts = []
    if missing_columns:
        message_parts.append(f"Missing columns: {', '.join(missing_columns)}")
    if new_columns:
        message_parts.append(f"New columns: {', '.join(new_columns)}")

    message = '. '.join(message_parts) if message_parts else 'No changes detected'

    return {
        'has_changes': has_changes,
        'missing_columns': missing_columns,
        'new_columns': new_columns,
        'message': message
    }
