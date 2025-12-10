"""
Export View Mixin - reusable mixin for adding export functionality to ViewSets.
"""
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .csv_exporter import CSVExporter
from .excel_exporter import ExcelExporter
from .pdf_exporter import PDFExporter


class ExportViewMixin:
    """
    Mixin to add export functionality to any ViewSet.

    IMPORTANT: This mixin must be placed BEFORE GenericViewSet in the inheritance chain.

    Usage:
        from core.exports import ExportViewMixin

        class MyViewSet(ExportViewMixin, viewsets.ModelViewSet):
            export_serializer_class = MySerializer  # Optional, uses default serializer if not set
            export_filename_prefix = 'my_data'      # Optional, defaults to model name

    Adds endpoint: /api/my-endpoint/export/?export_format=csv&visible_fields=field1,field2

    Query Parameters:
        - export_format (required): csv, excel, or pdf (Note: uses 'export_format' not 'format' to avoid DRF conflict)
        - visible_fields (required): comma-separated list of field names to export
        - All other filter/search/ordering params from the main list endpoint

    Example:
        GET /api/consumers/export/?export_format=excel&visible_fields=id,name,mobile&search=john&ordering=name
    """

    export_serializer_class = None  # Override in subclass if needed
    export_filename_prefix = None   # Override in subclass, defaults to model name

    EXPORTER_MAP = {
        'csv': CSVExporter,
        'excel': ExcelExporter,
        'pdf': PDFExporter,
    }

    @action(detail=False, methods=['get'], url_path='export')
    def export(self, request):
        """
        Export filtered data in specified format.

        Returns:
            File download response (CSV/Excel/PDF)
        """
        # Validate export_format parameter (using export_format instead of format to avoid DRF conflict)
        export_format = request.query_params.get('export_format', '').lower()
        if not export_format:
            return Response(
                {'error': 'Missing required parameter: export_format (csv, excel, or pdf)'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if export_format not in self.EXPORTER_MAP:
            return Response(
                {'error': f'Invalid export_format: {export_format}. Must be csv, excel, or pdf'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get visible fields parameter
        visible_fields_param = request.query_params.get('visible_fields', '')
        if not visible_fields_param:
            return Response(
                {'error': 'Missing required parameter: visible_fields (comma-separated field names)'},
                status=status.HTTP_400_BAD_REQUEST
            )

        visible_fields = [field.strip() for field in visible_fields_param.split(',') if field.strip()]
        if not visible_fields:
            return Response(
                {'error': 'visible_fields cannot be empty'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get queryset with all filters applied (uses filterset_class, search, ordering)
        queryset = self.filter_queryset(self.get_queryset())

        # Get serializer class
        serializer_class = self.export_serializer_class or self.get_serializer_class()

        # Get filename prefix
        if self.export_filename_prefix:
            filename_prefix = self.export_filename_prefix
        else:
            # Default to model name
            model_name = queryset.model._meta.model_name
            filename_prefix = model_name

        # Select and instantiate exporter
        exporter_class = self.EXPORTER_MAP[export_format]
        exporter = exporter_class(
            queryset=queryset,
            visible_fields=visible_fields,
            filename_prefix=filename_prefix,
            serializer_class=serializer_class
        )

        # Generate and return export file
        return exporter.generate()
