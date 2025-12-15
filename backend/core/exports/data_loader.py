"""
Data Loader Module - Centralized bulk data loading for all exporters.

Provides a single interface for loading export data using either ORM or Raw SQL,
eliminating code duplication across CSV, Excel, and PDF exporters.
"""
import time


def load_export_data(queryset, visible_fields, use_raw_sql=True):
    """
    Load export data using optimized bulk loading.

    Automatically chooses between ORM and Raw SQL implementations based on the flag.
    Includes timing logs and performance metrics.

    Args:
        queryset: Django queryset to export
        visible_fields: List of field names to include
        use_raw_sql: If True, uses Raw SQL; if False, uses ORM (default: True)

    Returns:
        List of dictionaries with requested fields
    """
    print(f"  📊 Loading data using {'RAW SQL' if use_raw_sql else 'ORM'}...")
    t_start = time.time()

    if use_raw_sql:
        data = _load_with_raw_sql(queryset, visible_fields)
    else:
        data = _load_with_orm(queryset, visible_fields)

    elapsed = time.time() - t_start
    print(f"  ⏱️  Data load complete: {elapsed:.2f}s ({len(data)} rows)")

    return data


def _load_with_raw_sql(queryset, visible_fields):
    """Load data using Raw SQL for maximum performance."""
    from core.exports.bulk_loaders_raw_sql import bulk_load_consumer_export_data_raw_sql
    return bulk_load_consumer_export_data_raw_sql(queryset, visible_fields)


def _load_with_orm(queryset, visible_fields):
    """Load data using Django ORM with optimized prefetching."""
    from core.exports.bulk_loaders import bulk_load_consumer_export_data
    return bulk_load_consumer_export_data(queryset, visible_fields)
