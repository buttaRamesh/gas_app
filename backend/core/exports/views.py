"""
Universal Export View

Single endpoint for exporting data from all resources.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status as http_status
from rest_framework.authentication import SessionAuthentication, TokenAuthentication

from .resources import get_resource_config
from .csv_exporter import CSVExporter
from .excel_exporter import ExcelExporter
from .pdf_exporter import PDFExporter


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
        """Handle export request"""
        import time
        start_time = time.time()
        print(f"\n{'='*60}")
        print(f"🚀 EXPORT STARTED at {time.strftime('%H:%M:%S')}")
        print(f"{'='*60}")

        # Extract parameters from request body
        resource_name = request.data.get('resource')
        export_format = request.data.get('export_format', 'csv').lower()
        visible_fields = request.data.get('visible_fields', [])
        filters = request.data.get('filters', {})
        page_title = request.data.get('page_title')  # Custom title for Excel/PDF

        print(f"📋 Resource: {resource_name}, Format: {export_format}")
        print(f"📋 Fields requested: {len(visible_fields)}")

        # Validate resource
        if not resource_name:
            return Response(
                {'error': 'Missing required parameter: resource'},
                status=http_status.HTTP_400_BAD_REQUEST
            )

        try:
            config = get_resource_config(resource_name)
        except KeyError as e:
            return Response(
                {'error': str(e)},
                status=http_status.HTTP_404_NOT_FOUND
            )

        # Validate export format
        if export_format not in self.EXPORTER_MAP:
            return Response(
                {'error': f'Invalid export_format: {export_format}. Must be csv, excel, or pdf'},
                status=http_status.HTTP_400_BAD_REQUEST
            )

        # Check permissions (TODO: Re-enable after testing)
        # for perm_class in config['permission_classes']:
        #     permission = perm_class()
        #     self.action = 'export'
        #     if not permission.has_permission(request, self):
        #         return Response(
        #             {'error': 'Permission denied'},
        #             status=http_status.HTTP_403_FORBIDDEN
        #         )

        # Get base queryset
        t1 = time.time()
        queryset = config['queryset'](request)
        print(f"⏱️  Build queryset: {(time.time() - t1):.2f}s")

        # Apply filters using filterset_class
        t2 = time.time()
        filterset_class = config['filterset_class']
        filterset = filterset_class(filters, queryset=queryset, request=request)

        if not filterset.is_valid():
            return Response(
                {'error': 'Invalid filters', 'details': filterset.errors},
                status=http_status.HTTP_400_BAD_REQUEST
            )

        queryset = filterset.qs
        print(f"⏱️  Apply filters: {(time.time() - t2):.2f}s")

        # Apply ordering
        t3 = time.time()
        ordering = filters.get('ordering')
        if not ordering:
            ordering = config['ordering']

        if ordering:
            # Handle comma-separated ordering (e.g., 'name,-created_at')
            if isinstance(ordering, str):
                ordering = ordering.split(',')
            queryset = queryset.order_by(*ordering)
        print(f"⏱️  Apply ordering: {(time.time() - t3):.2f}s")

        # Validate visible fields
        allowed_fields = config['allowed_fields']
        valid_fields = [f for f in visible_fields if f in allowed_fields]

        if not valid_fields:
            return Response(
                {'error': 'No valid fields specified', 'allowed_fields': allowed_fields},
                status=http_status.HTTP_400_BAD_REQUEST
            )

        # Get exporter class
        exporter_class = self.EXPORTER_MAP[export_format]

        # Create exporter instance
        t4 = time.time()
        use_raw_values = config.get('use_raw_values', False)
        field_labels = config.get('field_labels', {})

        exporter = exporter_class(
            queryset=queryset,
            visible_fields=valid_fields,
            serializer_class=config['serializer_class'] if not use_raw_values else None,
            filename_prefix=resource_name,
            field_labels=field_labels,
            page_title=page_title  # Pass custom title to exporter
        )
        print(f"⏱️  Create exporter: {(time.time() - t4):.2f}s")

        # Count queryset (this will show if query is slow)
        t5 = time.time()
        row_count = queryset.count()
        print(f"⏱️  Count rows ({row_count}): {(time.time() - t5):.2f}s")

        # Generate and return export file
        print(f"🔄 Starting file generation...")
        t6 = time.time()
        result = exporter.generate()
        print(f"⏱️  Generate file: {(time.time() - t6):.2f}s")
        print(f"✅ TOTAL TIME: {(time.time() - start_time):.2f}s")
        print(f"{'='*60}\n")
        return result
