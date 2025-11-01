# File: consumers/views.py
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.http import HttpResponse
import csv
import io
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet

from core.pagination import CustomPageNumberPagination
from .models import Consumer
from .serializers import (
    ConsumerListSerializer,
    ConsumerDetailSerializer,
    ConsumerCreateUpdateSerializer,
    ConsumersByRouteSerializer
)


class ConsumerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Consumer operations.

    Provides:
    - list: Get all consumers with pagination and filtering
    - retrieve: Get single consumer with full details
    - create: Create new consumer
    - update: Update consumer (PUT)
    - partial_update: Partial update consumer (PATCH)
    - destroy: Delete consumer

    Custom actions:
    - kyc_pending: Get consumers with pending KYC
    - by_route: Get consumers by route code
    - search: Advanced search
    """

    queryset = Consumer.objects.select_related(
        'category',
        'consumer_type',
        'bpl_type',
        'dct_type',
        'scheme'
    ).prefetch_related(
        'addresses',
        'contacts'
    ).all()

    pagination_class = CustomPageNumberPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'consumer_type', 'opting_status', 'is_kyc_done', 'scheme']
    search_fields = ['consumer_number', 'consumer_name', 'ration_card_num', 'lpg_id']
    ordering_fields = ['consumer_number', 'consumer_name', 'id']
    ordering = ['consumer_number']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return ConsumerListSerializer
        elif self.action == 'retrieve':
            return ConsumerDetailSerializer
        else:  # create, update, partial_update
            return ConsumerCreateUpdateSerializer
    
    def get_queryset(self):
        """
        Optionally restricts the returned consumers,
        by filtering against query parameters in the URL.
        """
        queryset = super().get_queryset()
        
        # Example: Filter by KYC status from query params
        kyc_status = self.request.query_params.get('kyc_status', None)
        if kyc_status is not None:
            if kyc_status.lower() == 'true':
                queryset = queryset.filter(is_kyc_done=True)
            elif kyc_status.lower() == 'false':
                queryset = queryset.filter(is_kyc_done=False)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def kyc_pending(self, request):
        """
        Get all consumers with pending KYC.
        
        GET /api/consumers/kyc_pending/
        """
        queryset = self.get_queryset().filter(is_kyc_done=False)
        
        # Apply pagination
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = ConsumerListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = ConsumerListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_route(self, request):
        """
        Get consumers by route code or route ID with detailed information.

        GET /api/consumers/by_route/?route_code=R001
        GET /api/consumers/by_route/?route_id=1
        GET /api/consumers/by_route/?route_id=1&search=john

        Returns paginated list with consumer details including:
        - consumer_id, consumer_number, consumer_name
        - mobile, address, route_code
        - category, consumer_type, cylinders count

        Supports search parameter to filter by consumer_number or consumer_name
        """
        route_code = request.query_params.get('route_code', None)
        route_id = request.query_params.get('route_id', None)
        search = request.query_params.get('search', None)

        if not route_code and not route_id:
            return Response(
                {'error': 'Either route_code or route_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get queryset with optimized queries to avoid N+1 issues
        queryset = Consumer.objects.select_related(
            'category',
            'consumer_type',
            'route_assignment__route'
        ).prefetch_related(
            'contacts',
            'addresses',
            'connections'
        )

        if route_id:
            queryset = queryset.filter(route_assignment__route_id=route_id)
        else:
            queryset = queryset.filter(route_assignment__route__area_code=route_code)

        # Apply search filter if provided
        if search:
            queryset = queryset.filter(
                Q(consumer_number__icontains=search) |
                Q(consumer_name__icontains=search)
            )

        # Always use pagination for this endpoint
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = ConsumersByRouteSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = ConsumersByRouteSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def route(self, request, pk=None):
        """
        Get route assignment for a specific consumer.
        
        GET /api/consumers/{id}/route/
        """
        consumer = self.get_object()
        
        try:
            assignment = consumer.route_assignment
            return Response({
                'route_id': assignment.route.id,
                'route_code': assignment.route.area_code,
                'route_description': assignment.route.area_code_description
            })
        except:
            return Response(
                {'message': 'No route assigned to this consumer'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['patch'])
    def update_kyc_status(self, request, pk=None):
        """
        Update only the KYC status of a consumer.
        
        PATCH /api/consumers/{id}/update_kyc_status/
        Body: { "is_kyc_done": true }
        """
        consumer = self.get_object()
        is_kyc_done = request.data.get('is_kyc_done')
        
        if is_kyc_done is None:
            return Response(
                {'error': 'is_kyc_done field is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        consumer.is_kyc_done = is_kyc_done
        consumer.save()
        
        serializer = ConsumerDetailSerializer(consumer)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get consumer statistics.
        
        GET /api/consumers/statistics/
        """
        total = self.get_queryset().count()
        kyc_done = self.get_queryset().filter(is_kyc_done=True).count()
        kyc_pending = total - kyc_done
        
        by_status = {}
        for status_choice in Consumer.OptingStatus.choices:
            count = self.get_queryset().filter(opting_status=status_choice[0]).count()
            by_status[status_choice[1]] = count
        
        return Response({
            'total_consumers': total,
            'kyc_done': kyc_done,
            'kyc_pending': kyc_pending,
            'by_opting_status': by_status,
        })

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """
        Export consumers to CSV file.

        GET /api/consumers/export_csv/?search=john&ordering=consumer_number&is_kyc_done=true
        """
        # Get filtered queryset
        queryset = self.filter_queryset(self.get_queryset())

        # Create CSV response
        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="consumers_export.csv"'

        # Add BOM for Excel UTF-8 compatibility
        response.write('\ufeff')

        writer = csv.writer(response)

        # Write header
        writer.writerow([
            'Consumer Number',
            'Consumer Name',
            'Category',
            'Type',
            'Opting Status',
            'KYC Done',
            'Mobile',
            'Ration Card',
            'LPG ID',
        ])

        # Write data
        for consumer in queryset:
            contact = consumer.contacts.first()
            writer.writerow([
                consumer.consumer_number,
                consumer.consumer_name,
                consumer.category.name if consumer.category else '',
                consumer.consumer_type.name if consumer.consumer_type else '',
                consumer.get_opting_status_display(),
                'Yes' if consumer.is_kyc_done else 'No',
                contact.mobile_number if contact else '',
                consumer.ration_card_num or '',
                consumer.lpg_id or '',
            ])

        return response

    @action(detail=False, methods=['get'])
    def export_excel(self, request):
        """
        Export consumers to Excel file.

        GET /api/consumers/export_excel/?search=john&ordering=consumer_number&is_kyc_done=true
        """
        # Get filtered queryset
        queryset = self.filter_queryset(self.get_queryset())

        # Create workbook
        wb = Workbook()
        ws = wb.active
        ws.title = "Consumers"

        # Define header style
        header_fill = PatternFill(start_color="366092", end_color="366092", fill_type="solid")
        header_font = Font(color="FFFFFF", bold=True)
        header_alignment = Alignment(horizontal="center", vertical="center")

        # Write header
        headers = [
            'Consumer Number',
            'Consumer Name',
            'Category',
            'Type',
            'Opting Status',
            'KYC Done',
            'Mobile',
            'Ration Card',
            'LPG ID',
        ]

        for col_num, header in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col_num, value=header)
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = header_alignment

        # Write data
        for row_num, consumer in enumerate(queryset, 2):
            contact = consumer.contacts.first()
            ws.cell(row=row_num, column=1, value=consumer.consumer_number)
            ws.cell(row=row_num, column=2, value=consumer.consumer_name)
            ws.cell(row=row_num, column=3, value=consumer.category.name if consumer.category else '')
            ws.cell(row=row_num, column=4, value=consumer.consumer_type.name if consumer.consumer_type else '')
            ws.cell(row=row_num, column=5, value=consumer.get_opting_status_display())
            ws.cell(row=row_num, column=6, value='Yes' if consumer.is_kyc_done else 'No')
            ws.cell(row=row_num, column=7, value=contact.mobile_number if contact else '')
            ws.cell(row=row_num, column=8, value=consumer.ration_card_num or '')
            ws.cell(row=row_num, column=9, value=consumer.lpg_id or '')

        # Adjust column widths
        for col in ws.columns:
            max_length = 0
            column = col[0].column_letter
            for cell in col:
                try:
                    if len(str(cell.value)) > max_length:
                        max_length = len(str(cell.value))
                except:
                    pass
            adjusted_width = min(max_length + 2, 50)
            ws.column_dimensions[column].width = adjusted_width

        # Save to response
        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="consumers_export.xlsx"'
        wb.save(response)

        return response

    @action(detail=False, methods=['get'])
    def export_pdf(self, request):
        """
        Export consumers to PDF file.

        GET /api/consumers/export_pdf/?search=john&ordering=consumer_number&is_kyc_done=true
        """
        # Get filtered queryset
        queryset = self.filter_queryset(self.get_queryset())

        # Create PDF response
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="consumers_export.pdf"'

        # Create PDF document
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []

        # Add title
        styles = getSampleStyleSheet()
        title = Paragraph("<b>Consumers Export</b>", styles['Title'])
        elements.append(title)

        # Prepare table data
        data = [[
            'Consumer #',
            'Name',
            'Category',
            'Type',
            'Status',
            'KYC',
            'Mobile',
        ]]

        for consumer in queryset:
            contact = consumer.contacts.first()
            data.append([
                consumer.consumer_number,
                consumer.consumer_name[:30],  # Truncate long names
                consumer.category.name if consumer.category else '',
                consumer.consumer_type.name if consumer.consumer_type else '',
                consumer.get_opting_status_display()[:10],  # Truncate
                'Yes' if consumer.is_kyc_done else 'No',
                contact.mobile_number if contact else '',
            ])

        # Create table
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#366092')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
        ]))

        elements.append(table)

        # Build PDF
        doc.build(elements)

        # Get PDF from buffer
        pdf = buffer.getvalue()
        buffer.close()
        response.write(pdf)

        return response