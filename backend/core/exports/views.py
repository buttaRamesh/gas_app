"""
Universal Export View

Single endpoint for exporting data from all resources.
Refactored for better maintainability and reduced code duplication.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status as http_status
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
import time

from .csv_exporter import CSVExporter
from .excel_exporter import ExcelExporter
from .pdf_exporter import PDFExporter
from .validators import validate_resource, validate_export_format, validate_export_request
from .query_builder import build_export_queryset


class UniversalExportView(APIView):
    """
    Universal export endpoint for all resources

    POST /api/export/

    Request Body:
    {
        "resource": "consumers",
        "export_format": "csv",
        "visible_fields": ["id", "name", "mobile_number"],
        "filters": {
            "search": "john",
            "kyc_status": "pending",
            "ordering": "name"
        }
    }

    Response:
        File download (CSV/Excel/PDF)
    """
    authentication_classes = [SessionAuthentication, TokenAuthentication]

    EXPORTER_MAP = {
        'csv': CSVExporter,
        'excel': ExcelExporter,
        'pdf': PDFExporter,
    }

    def post(self, request):
        """Handle export request - refactored for clarity and maintainability"""
        start_time = time.time()
        self._log_export_start()

        # Extract and validate parameters
        params = self._extract_parameters(request.data)

        # Validate resource
        config, error = validate_resource(params['resource_name'])
        if error:
            return error

        # Validate export format
        error = validate_export_format(params['export_format'], self.EXPORTER_MAP.keys())
        if error:
            return error

        # Validate fields
        valid_fields, error = validate_export_request(request.data, config)
        if error:
            return error

        # Build queryset with filters and ordering
        try:
            queryset, row_count = build_export_queryset(request, config, params['filters'])
        except ValueError as e:
            return Response(
                {'error': 'Invalid filters', 'details': str(e)},
                status=http_status.HTTP_400_BAD_REQUEST
            )

        # Create and execute exporter
        exporter = self._create_exporter(
            params['export_format'],
            config,
            queryset,
            valid_fields,
            params['resource_name'],
            params['page_title']
        )

        # Generate file
        print(f"🔄 Starting file generation...")
        t_gen = time.time()
        result = exporter.generate()
        print(f"⏱️  Generate file: {(time.time() - t_gen):.2f}s")

        self._log_export_complete(start_time)
        return result

    def _extract_parameters(self, data):
        """Extract and normalize request parameters"""
        return {
            'resource_name': data.get('resource'),
            'export_format': data.get('export_format', 'csv').lower(),
            'filters': data.get('filters', {}),
            'page_title': data.get('page_title')
        }

    def _create_exporter(self, export_format, config, queryset, valid_fields, resource_name, page_title):
        """Create exporter instance with appropriate configuration"""
        t_start = time.time()

        exporter_class = self.EXPORTER_MAP[export_format]
        use_raw_values = config.get('use_raw_values', False)
        field_labels = config.get('field_labels', {})

        exporter = exporter_class(
            queryset=queryset,
            visible_fields=valid_fields,
            serializer_class=config['serializer_class'] if not use_raw_values else None,
            filename_prefix=resource_name,
            field_labels=field_labels,
            page_title=page_title
        )

        print(f"⏱️  Create exporter: {(time.time() - t_start):.2f}s")
        return exporter

    def _log_export_start(self):
        """Log export start"""
        print(f"\n{'='*60}")
        print(f"🚀 EXPORT STARTED at {time.strftime('%H:%M:%S')}")
        print(f"{'='*60}")

    def _log_export_complete(self, start_time):
        """Log export completion"""
        print(f"✅ TOTAL TIME: {(time.time() - start_time):.2f}s")
        print(f"{'='*60}\n")
