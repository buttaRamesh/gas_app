"""
Query Builder Module - Constructs optimized querysets for exports.

Handles filtering, ordering, and queryset optimization to ensure
consistent behavior across all export operations.
"""
import time


def build_export_queryset(request, config, filters):
    """
    Build and optimize queryset for export.

    Applies filters and ordering, with timing metrics.

    Args:
        request: Django request object
        config: Resource configuration dictionary
        filters: Filter parameters from request

    Returns:
        Tuple of (queryset, row_count)
    """
    # Get base queryset
    t1 = time.time()
    queryset = config['queryset'](request)
    print(f"⏱️  Build queryset: {(time.time() - t1):.2f}s")

    # Apply filters
    t2 = time.time()
    queryset = apply_filters(queryset, config, filters, request)
    print(f"⏱️  Apply filters: {(time.time() - t2):.2f}s")

    # Apply ordering
    t3 = time.time()
    queryset = apply_ordering(queryset, config, filters)
    print(f"⏱️  Apply ordering: {(time.time() - t3):.2f}s")

    # Count rows
    t4 = time.time()
    row_count = queryset.count()
    print(f"⏱️  Count rows ({row_count}): {(time.time() - t4):.2f}s")

    return queryset, row_count


def apply_filters(queryset, config, filters, request):
    """
    Apply filterset to queryset.

    Args:
        queryset: Base queryset
        config: Resource configuration
        filters: Filter parameters
        request: Django request object

    Returns:
        Filtered queryset

    Raises:
        ValueError: If filters are invalid
    """
    filterset_class = config['filterset_class']
    filterset = filterset_class(filters, queryset=queryset, request=request)

    if not filterset.is_valid():
        raise ValueError(f"Invalid filters: {filterset.errors}")

    return filterset.qs


def apply_ordering(queryset, config, filters):
    """
    Apply ordering to queryset.

    Uses ordering from filters if provided, otherwise uses default from config.

    Args:
        queryset: Queryset to order
        config: Resource configuration
        filters: Filter parameters that may contain ordering

    Returns:
        Ordered queryset
    """
    ordering = filters.get('ordering')
    if not ordering:
        ordering = config.get('ordering')

    if ordering:
        # Handle comma-separated ordering (e.g., 'name,-created_at')
        if isinstance(ordering, str):
            ordering = ordering.split(',')
        queryset = queryset.order_by(*ordering)

    return queryset
