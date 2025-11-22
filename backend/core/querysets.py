"""
Custom queryset and manager classes for optimized database queries
"""
from django.db import models
from django.db.models import Q, Prefetch
from typing import List, Optional


class ActiveQuerySet(models.QuerySet):
    """
    QuerySet that filters for active records by default
    """

    def active(self):
        """Get only active records"""
        return self.filter(is_active=True)

    def inactive(self):
        """Get only inactive records"""
        return self.filter(is_active=False)

    def toggle_active(self, is_active: bool):
        """Toggle active status for multiple records"""
        return self.update(is_active=is_active)


class SoftDeleteQuerySet(ActiveQuerySet):
    """
    QuerySet that implements soft delete functionality
    """

    def delete(self):
        """Soft delete by marking as inactive"""
        return self.update(is_active=False)

    def hard_delete(self):
        """Permanently delete records"""
        return super().delete()

    def restore(self):
        """Restore soft-deleted records"""
        return self.update(is_active=True)


class TimestampedQuerySet(models.QuerySet):
    """
    QuerySet for models with timestamp fields
    """

    def created_after(self, date):
        """Get records created after a specific date"""
        return self.filter(created_at__gte=date)

    def created_before(self, date):
        """Get records created before a specific date"""
        return self.filter(created_at__lte=date)

    def updated_after(self, date):
        """Get records updated after a specific date"""
        return self.filter(updated_at__gte=date)

    def updated_before(self, date):
        """Get records updated before a specific date"""
        return self.filter(updated_at__lte=date)

    def recent(self, days: int = 7):
        """Get recently created records"""
        from django.utils import timezone
        from datetime import timedelta
        date = timezone.now() - timedelta(days=days)
        return self.filter(created_at__gte=date)


class OptimizedQuerySet(models.QuerySet):
    """
    QuerySet with common optimization methods
    """

    def with_related(self, *fields):
        """
        Select related fields for foreign key optimization
        """
        return self.select_related(*fields)

    def with_prefetch(self, *fields):
        """
        Prefetch related fields for many-to-many and reverse FK optimization
        """
        return self.prefetch_related(*fields)

    def optimized(self):
        """
        Override this method in child classes to define default optimizations
        """
        return self


class SearchableQuerySet(models.QuerySet):
    """
    QuerySet with enhanced search capabilities
    """

    def search(self, query: str, fields: List[str]):
        """
        Search across multiple fields

        Args:
            query: Search query string
            fields: List of field names to search in

        Returns:
            Filtered queryset
        """
        if not query or not fields:
            return self

        q_objects = Q()
        for field in fields:
            q_objects |= Q(**{f'{field}__icontains': query})

        return self.filter(q_objects)

    def search_exact(self, query: str, fields: List[str]):
        """
        Exact search across multiple fields
        """
        if not query or not fields:
            return self

        q_objects = Q()
        for field in fields:
            q_objects |= Q(**{f'{field}__iexact': query})

        return self.filter(q_objects)


class BaseManager(models.Manager):
    """
    Base manager with common functionality
    """

    def get_queryset(self):
        """Return the base queryset"""
        return super().get_queryset()

    def active(self):
        """Get only active records"""
        return self.get_queryset().filter(is_active=True)

    def inactive(self):
        """Get only inactive records"""
        return self.get_queryset().filter(is_active=False)


class SoftDeleteManager(BaseManager):
    """
    Manager that implements soft delete functionality
    """

    def get_queryset(self):
        """Return only active (non-deleted) records by default"""
        return SoftDeleteQuerySet(self.model, using=self._db).filter(is_active=True)

    def all_with_deleted(self):
        """Get all records including soft-deleted ones"""
        return SoftDeleteQuerySet(self.model, using=self._db)

    def deleted_only(self):
        """Get only soft-deleted records"""
        return SoftDeleteQuerySet(self.model, using=self._db).filter(is_active=False)


class OptimizedManager(BaseManager):
    """
    Manager with query optimization helpers
    """

    def optimized(self):
        """
        Get optimized queryset with select_related and prefetch_related
        Override this method in model managers
        """
        return self.get_queryset()


# Utility functions for query optimization

def optimize_queryset(queryset, select_related: Optional[List[str]] = None,
                      prefetch_related: Optional[List[str]] = None):
    """
    Optimize queryset with select_related and prefetch_related

    Args:
        queryset: Django queryset
        select_related: List of foreign key fields to select
        prefetch_related: List of many-to-many or reverse FK fields to prefetch

    Returns:
        Optimized queryset
    """
    if select_related:
        queryset = queryset.select_related(*select_related)

    if prefetch_related:
        queryset = queryset.prefetch_related(*prefetch_related)

    return queryset


def bulk_create_with_return(model, objects: List, batch_size: int = 100):
    """
    Bulk create objects and return them with IDs

    Args:
        model: Django model class
        objects: List of model instances
        batch_size: Number of objects to create per batch

    Returns:
        List of created objects with IDs
    """
    return model.objects.bulk_create(objects, batch_size=batch_size)


def bulk_update_fields(queryset, updates: dict):
    """
    Bulk update specific fields for a queryset

    Args:
        queryset: Django queryset
        updates: Dictionary of field names and values to update

    Returns:
        Number of updated records
    """
    return queryset.update(**updates)


def exists_or_create(model, lookup_fields: dict, defaults: Optional[dict] = None):
    """
    Check if object exists, create if not

    Args:
        model: Django model class
        lookup_fields: Fields to use for lookup
        defaults: Additional fields to set if creating

    Returns:
        Tuple of (object, created)
    """
    defaults = defaults or {}
    return model.objects.get_or_create(**lookup_fields, defaults=defaults)


def get_or_none(model, **kwargs):
    """
    Get object or return None instead of raising exception

    Args:
        model: Django model class
        **kwargs: Lookup parameters

    Returns:
        Model instance or None
    """
    try:
        return model.objects.get(**kwargs)
    except model.DoesNotExist:
        return None


def filter_by_date_range(queryset, field_name: str, start_date, end_date):
    """
    Filter queryset by date range

    Args:
        queryset: Django queryset
        field_name: Name of the date field
        start_date: Start date
        end_date: End date

    Returns:
        Filtered queryset
    """
    filters = {}

    if start_date:
        filters[f'{field_name}__gte'] = start_date

    if end_date:
        filters[f'{field_name}__lte'] = end_date

    return queryset.filter(**filters) if filters else queryset
