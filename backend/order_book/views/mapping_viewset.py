from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from order_book.models import ColumnMapping, FieldConfiguration, UPLOAD_TYPE_CHOICES
from order_book.serializers import ColumnMappingSerializer, FieldConfigurationSerializer

class ColumnMappingViewSet(viewsets.ModelViewSet):
    """ViewSet for managing column mapping configurations"""
    queryset = ColumnMapping.objects.all()
    serializer_class = ColumnMappingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['upload_type', 'file_format', 'is_active']

    def get_queryset(self):
        """Filter by upload_type and file_format if provided"""
        queryset = super().get_queryset()
        upload_type = self.request.query_params.get('upload_type', None)
        file_format = self.request.query_params.get('file_format', None)

        if upload_type:
            queryset = queryset.filter(upload_type=upload_type)
        if file_format:
            queryset = queryset.filter(file_format=file_format)

        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save()


class FieldConfigurationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing field configuration (which fields to show per upload type)"""
    queryset = FieldConfiguration.objects.all()
    serializer_class = FieldConfigurationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['upload_type', 'is_included']

    def get_queryset(self):
        """Filter by upload_type if provided"""
        queryset = super().get_queryset()
        upload_type = self.request.query_params.get('upload_type', None)
        if upload_type:
            queryset = queryset.filter(upload_type=upload_type)
        return queryset

    @action(detail=False, methods=['delete'], url_path='delete-by-upload-type')
    def delete_by_upload_type(self, request):
        """Delete all field configurations and column mappings for a specific upload type"""
        import logging
        logger = logging.getLogger(__name__)

        upload_type = request.query_params.get('upload_type')

        if not upload_type:
            return Response(
                {'success': False, 'error': 'upload_type parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate upload_type
        valid_types = [choice[0] for choice in UPLOAD_TYPE_CHOICES]
        if upload_type not in valid_types:
            return Response(
                {'success': False, 'error': f'Invalid upload_type. Must be one of: {", ".join(valid_types)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                # Delete field configurations
                field_configs_deleted = FieldConfiguration.objects.filter(upload_type=upload_type).delete()[0]
                logger.info(f"Deleted {field_configs_deleted} field configurations for {upload_type}")

                # Delete related column mappings
                column_mappings_deleted = ColumnMapping.objects.filter(upload_type=upload_type).delete()[0]
                logger.info(f"Deleted {column_mappings_deleted} column mappings for {upload_type}")

                upload_type_label = dict(UPLOAD_TYPE_CHOICES).get(upload_type, upload_type)

                return Response({
                    'success': True,
                    'message': f'Successfully deleted all settings for {upload_type_label}',
                    'deleted': {
                        'field_configurations': field_configs_deleted,
                        'column_mappings': column_mappings_deleted,
                        'total': field_configs_deleted + column_mappings_deleted
                    }
                }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error deleting field settings for {upload_type}: {str(e)}")
            return Response({
                'success': False,
                'error': f'Failed to delete settings: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
