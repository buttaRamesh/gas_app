"""
Base viewsets with common functionality
"""
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from authentication.permissions import HasResourcePermission
from .mixins import (
    BulkOperationsMixin,
    ExportMixin,
    SearchMixin,
    StatisticsMixin,
    AuditMixin
)
import logging

logger = logging.getLogger(__name__)


class BaseModelViewSet(viewsets.ModelViewSet):
    """
    Base viewset with common functionality for all model viewsets
    """
    permission_classes = [IsAuthenticated, HasResourcePermission]

    def handle_exception(self, exc):
        """
        Enhanced exception handling with logging
        """
        logger.error(f"Error in {self.__class__.__name__}: {str(exc)}", exc_info=True)
        return super().handle_exception(exc)

    def get_queryset(self):
        """
        Get queryset with optional filtering for active records only
        """
        queryset = super().get_queryset()

        # Filter out inactive records if the model has is_active field
        if hasattr(self.queryset.model, 'is_active'):
            # Check if user wants to see inactive records
            show_inactive = self.request.query_params.get('show_inactive', 'false').lower() == 'true'
            if not show_inactive:
                queryset = queryset.filter(is_active=True)

        return queryset

    def list(self, request, *args, **kwargs):
        """
        Enhanced list with logging
        """
        logger.info(f"{self.__class__.__name__}.list called by user {request.user.employee_id}")
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        """
        Enhanced create with logging
        """
        logger.info(f"{self.__class__.__name__}.create called by user {request.user.employee_id}")
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """
        Enhanced update with logging
        """
        logger.info(f"{self.__class__.__name__}.update called by user {request.user.employee_id}")
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """
        Enhanced destroy with logging
        """
        logger.info(f"{self.__class__.__name__}.destroy called by user {request.user.employee_id}")
        return super().destroy(request, *args, **kwargs)


class EnhancedModelViewSet(
    BulkOperationsMixin,
    ExportMixin,
    StatisticsMixin,
    AuditMixin,
    BaseModelViewSet
):
    """
    Fully featured viewset with all common operations:
    - CRUD operations
    - Bulk create/update/delete
    - Export functionality
    - Statistics
    - Audit tracking
    """
    pass


class ReadOnlyBaseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Base read-only viewset with common functionality
    """
    permission_classes = [IsAuthenticated, HasResourcePermission]

    def handle_exception(self, exc):
        """
        Enhanced exception handling with logging
        """
        logger.error(f"Error in {self.__class__.__name__}: {str(exc)}", exc_info=True)
        return super().handle_exception(exc)

    def get_queryset(self):
        """
        Get queryset with optional filtering for active records only
        """
        queryset = super().get_queryset()

        # Filter out inactive records if the model has is_active field
        if hasattr(self.queryset.model, 'is_active'):
            show_inactive = self.request.query_params.get('show_inactive', 'false').lower() == 'true'
            if not show_inactive:
                queryset = queryset.filter(is_active=True)

        return queryset
