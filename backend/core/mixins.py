"""
Common mixins for Django REST Framework viewsets
"""
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from typing import Dict, Any, Optional


class BulkOperationsMixin:
    """
    Mixin to add bulk create, update, and delete operations to viewsets
    """

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """
        Create multiple objects at once.

        POST /api/<resource>/bulk_create/
        Body: {
            "objects": [
                {...},
                {...}
            ]
        }
        """
        objects_data = request.data.get('objects', [])

        if not objects_data:
            return Response(
                {'error': 'objects list is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        created_objects = []
        errors = []

        serializer_class = self.get_serializer_class()

        for idx, obj_data in enumerate(objects_data):
            serializer = serializer_class(data=obj_data)
            if serializer.is_valid():
                obj = serializer.save()
                created_objects.append(serializer.data)
            else:
                errors.append({
                    'index': idx,
                    'data': obj_data,
                    'errors': serializer.errors
                })

        return Response({
            'created_count': len(created_objects),
            'created_objects': created_objects,
            'errors': errors,
        }, status=status.HTTP_201_CREATED if created_objects else status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['patch'])
    def bulk_update(self, request):
        """
        Update multiple objects at once.

        PATCH /api/<resource>/bulk_update/
        Body: {
            "updates": [
                {"id": 1, "field": "value"},
                {"id": 2, "field": "value"}
            ]
        }
        """
        updates_data = request.data.get('updates', [])

        if not updates_data:
            return Response(
                {'error': 'updates list is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        updated_objects = []
        errors = []

        serializer_class = self.get_serializer_class()

        for idx, update_data in enumerate(updates_data):
            obj_id = update_data.get('id')
            if not obj_id:
                errors.append({
                    'index': idx,
                    'data': update_data,
                    'errors': {'id': 'This field is required'}
                })
                continue

            try:
                obj = self.get_queryset().get(pk=obj_id)
                serializer = serializer_class(obj, data=update_data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    updated_objects.append(serializer.data)
                else:
                    errors.append({
                        'index': idx,
                        'id': obj_id,
                        'errors': serializer.errors
                    })
            except self.queryset.model.DoesNotExist:
                errors.append({
                    'index': idx,
                    'id': obj_id,
                    'errors': {'id': 'Object not found'}
                })

        return Response({
            'updated_count': len(updated_objects),
            'updated_objects': updated_objects,
            'errors': errors,
        }, status=status.HTTP_200_OK if updated_objects else status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['delete'])
    def bulk_delete(self, request):
        """
        Delete multiple objects at once.

        DELETE /api/<resource>/bulk_delete/
        Body: {
            "ids": [1, 2, 3, 4]
        }
        """
        ids = request.data.get('ids', [])

        if not ids:
            return Response(
                {'error': 'ids list is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        deleted_count = 0
        errors = []

        for obj_id in ids:
            try:
                obj = self.get_queryset().get(pk=obj_id)
                obj.delete()
                deleted_count += 1
            except self.queryset.model.DoesNotExist:
                errors.append({
                    'id': obj_id,
                    'error': 'Object not found'
                })
            except Exception as e:
                errors.append({
                    'id': obj_id,
                    'error': str(e)
                })

        return Response({
            'deleted_count': deleted_count,
            'errors': errors,
        }, status=status.HTTP_200_OK)


class ExportMixin:
    """
    Mixin to add export functionality to viewsets
    """

    @action(detail=False, methods=['get'])
    def export(self, request):
        """
        Export data in various formats (CSV, JSON, Excel)

        GET /api/<resource>/export/?format=csv
        """
        export_format = request.query_params.get('format', 'json')

        queryset = self.filter_queryset(self.get_queryset())

        if export_format == 'json':
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)

        # For CSV and Excel, you would need to implement specific logic
        # This is a placeholder
        return Response({
            'error': f'Export format {export_format} not yet implemented'
        }, status=status.HTTP_400_BAD_REQUEST)


class SearchMixin:
    """
    Enhanced search functionality with multiple field support
    """

    def get_search_fields(self):
        """Get fields to search on"""
        return getattr(self, 'search_fields', [])

    def perform_search(self, queryset, search_query):
        """
        Perform search across multiple fields
        """
        if not search_query:
            return queryset

        search_fields = self.get_search_fields()
        if not search_fields:
            return queryset

        q_objects = Q()
        for field in search_fields:
            q_objects |= Q(**{f'{field}__icontains': search_query})

        return queryset.filter(q_objects)


class StatisticsMixin:
    """
    Common statistics methods for viewsets
    """

    def get_statistics_data(self) -> Dict[str, Any]:
        """
        Override this method to provide custom statistics
        """
        queryset = self.get_queryset()
        return {
            'total_count': queryset.count(),
        }

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get statistics for this resource

        GET /api/<resource>/statistics/
        """
        stats = self.get_statistics_data()
        return Response(stats)


class SoftDeleteMixin:
    """
    Mixin to add soft delete functionality
    """

    def perform_destroy(self, instance):
        """
        Soft delete by setting is_active=False instead of actual deletion
        """
        if hasattr(instance, 'is_active'):
            instance.is_active = False
            instance.save()
        else:
            instance.delete()

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """
        Restore a soft-deleted object

        POST /api/<resource>/{id}/restore/
        """
        instance = self.get_object()

        if hasattr(instance, 'is_active'):
            instance.is_active = True
            instance.save()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)

        return Response(
            {'error': 'This resource does not support soft delete'},
            status=status.HTTP_400_BAD_REQUEST
        )


class AuditMixin:
    """
    Mixin to automatically track created_by and updated_by fields
    """

    def perform_create(self, serializer):
        """Save with created_by field"""
        if hasattr(serializer.Meta.model, 'created_by'):
            serializer.save(created_by=self.request.user)
        else:
            serializer.save()

    def perform_update(self, serializer):
        """Save with updated_by field"""
        if hasattr(serializer.Meta.model, 'updated_by'):
            serializer.save(updated_by=self.request.user)
        else:
            serializer.save()
