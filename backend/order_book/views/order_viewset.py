from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils import timezone
from django.db import transaction
from django.db import models
from django.http import HttpResponse
from datetime import datetime
import csv
import io
import json
import pandas as pd
from consumers.models import Consumer
from delivery.models import DeliveryPerson
from commons.models import Contact
from order_book.models import (
    OrderBook,
    RefillType,
    DeliveryFlag,
    PaymentOption,
    PaymentInfo,
    BulkUploadHistory,
    ColumnMapping,
    FieldConfiguration,
)
from order_book.serializers import (
    OrderBookListSerializer,
    OrderBookDetailSerializer,
    OrderBookWriteSerializer,
    MarkDeliveredSerializer,
    BulkUploadSerializer,
    BulkUploadHistoryCreateSerializer,
    BulkUploadHistorySerializer,
)
from order_book.utils import (
    get_orderbook_field_definitions,
    get_csv_field_mapping,
    validate_column_mapping,
    compare_column_mappings,
)

class OrderBookViewSet(viewsets.ModelViewSet):
    """ViewSet for OrderBook CRUD operations"""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = [
        'book_date',
        'order_no',
        'consumer__consumer_number',
        'consumer__person__person_name',
        'product',
        'last_delivery_date',
        'delivery_date',
        'delivery_flag__name',
        'refill_type__name',
        'delivery_person__person__person_name',
    ]
    ordering = ['book_date', 'order_no']  # Default ordering: ascending booking date and order number
    search_fields = [
        'order_no',
        'consumer__consumer_number',
        'consumer__person__person_name',
        'product',
    ]

    # MAPPING_SCHEMA is AUTO-GENERATED from Django model
    # No hardcoding! It introspects OrderBook model at runtime
    # To customize which fields appear, edit schema_generator.py
    @property
    def MAPPING_SCHEMA(self):
        """Auto-generate schema from OrderBook model - NO HARDCODING!"""
        from order_book.schema_generator import auto_generate_mapping_schema
        return auto_generate_mapping_schema()

    def get_queryset(self):
        from django.db.models import Prefetch
        from commons.models import Contact

        queryset = OrderBook.objects.select_related(
            "consumer",
            "consumer__person",
            "refill_type",
            "delivery_flag",
            "delivery_person",
            "updated_by"
        ).prefetch_related(
            Prefetch(
                'consumer__person__contacts',
                queryset=Contact.objects.all()
            ),
            'payment_info',
            'payment_info__payment_option'
        ).all()

        # Filter by pending status if requested
        is_pending = self.request.query_params.get("is_pending")
        if is_pending is not None:
            if is_pending.lower() == "true":
                # Filter for pending orders (null delivery_date or before book_date)
                from django.db.models import Q
                queryset = queryset.filter(
                    Q(delivery_date__isnull=True) |
                    Q(delivery_date__lt=models.F('book_date'))
                )
            elif is_pending.lower() == "false":
                # Filter for delivered orders
                queryset = queryset.filter(
                    delivery_date__isnull=False,
                    delivery_date__gte=models.F('book_date')
                )

        # Search functionality
        search = self.request.query_params.get("search")
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(order_no__icontains=search) |
                Q(consumer__person__person_name__icontains=search) |
                Q(consumer__person__contacts__mobile_number__icontains=search) |
                Q(consumer__consumer_number__icontains=search) |
                Q(product__icontains=search)
            ).distinct()

        return queryset

    def get_serializer_class(self):
        if self.action == "list":
            return OrderBookListSerializer
        elif self.action == "retrieve":
            return OrderBookDetailSerializer
        elif self.action in ["create", "update", "partial_update"]:
            return OrderBookWriteSerializer
        return OrderBookListSerializer

    @action(detail=True, methods=["post"], parser_classes=[JSONParser])
    def mark_delivered(self, request, pk=None):
        """Mark an order as delivered with payment info"""
        order = self.get_object()
        serializer = MarkDeliveredSerializer(data=request.data)

        if serializer.is_valid():
            delivery_date = serializer.validated_data["delivery_date"]
            delivery_person_id = serializer.validated_data["delivery_person"]
            payment_option_name = serializer.validated_data["payment_option"]
            cash_memo_no = serializer.validated_data.get("cash_memo_no", "")
            payment_date = serializer.validated_data["payment_date"]
            amount = serializer.validated_data["amount"]
            payment_status = serializer.validated_data["payment_status"]
            transaction_id = serializer.validated_data.get("transaction_id")
            notes = serializer.validated_data.get("notes")

            # Validate delivery_date >= book_date
            if delivery_date < order.book_date:
                return Response(
                    {"delivery_date": f"Delivery date ({delivery_date}) cannot be before booking date ({order.book_date})."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if order is pending
            if not order.is_pending:
                return Response(
                    {"error": "Order is already marked as delivered."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get delivery person (already validated in serializer)
            delivery_person = DeliveryPerson.objects.get(id=delivery_person_id)

            # Get or create "Delivery Done" delivery flag
            delivered_flag, _ = DeliveryFlag.objects.get_or_create(name="Delivery Done")

            # Get or create payment option
            payment_option, _ = PaymentOption.objects.get_or_create(name=payment_option_name)

            # Update order
            order.delivery_date = delivery_date
            order.delivery_person = delivery_person
            order.delivery_flag = delivered_flag
            order.updated_by = request.user
            order.updated_type = OrderBook.UpdateType.MANUAL
            order.save()

            # Create or update payment info
            PaymentInfo.objects.update_or_create(
                order=order,
                defaults={
                    'payment_option': payment_option,
                    'cash_memo_no': cash_memo_no,
                    'payment_date': payment_date,
                    'amount': amount,
                    'payment_status': payment_status,
                    'transaction_id': transaction_id,
                    'notes': notes,
                }
            )

            return Response(
                OrderBookDetailSerializer(order).data,
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["post"], parser_classes=[MultiPartParser, FormParser])
    def upload_pending(self, request):
        """Upload pending orders from CSV or Excel file"""
        serializer = BulkUploadSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        uploaded_file = serializer.validated_data["file"]
        file_name = uploaded_file.name

        try:
            # Upload type for pending orders
            upload_type = 'PENDING'

            # Read file (CSV or Excel) with expected column count from FieldConfiguration
            df = self._read_file(uploaded_file, upload_type)

            # Determine file format
            file_format = 'EXCEL' if file_name.endswith('.xlsx') else 'CSV'

            # Get active mapping for this upload type and file format
            mapping = ColumnMapping.objects.filter(
                upload_type=upload_type,
                file_format=file_format,
                is_active=True
            ).first()
            if not mapping:
                return Response({
                    "success": False,
                    "message": f"No active column mapping found for {upload_type} - {file_format}. Please configure mappings first."
                }, status=status.HTTP_400_BAD_REQUEST)

            mappings = mapping.mappings

            success_count = 0
            skipped_count = 0
            error_count = 0
            errors = []
            skipped_rows = []

            with transaction.atomic():
                for idx, row in df.iterrows():
                    try:
                        result = self._process_pending_row(row, request.user, mappings, file_name)
                        if result["success"]:
                            success_count += 1
                        elif result.get("skipped"):
                            skipped_count += 1
                            # Track which row was skipped
                            row_num = int(idx) + 2 if isinstance(idx, (int, float)) else 2
                            # Extract reason from errors field
                            reason = result.get("errors", ["Unknown reason"])[0] if result.get("errors") else "Unknown reason"
                            skipped_rows.append({
                                "row": row_num,
                                "reason": reason
                            })
                        else:
                            error_count += 1
                            # Convert idx to int and add 2 (for header row + 1-indexing)
                            row_num = int(idx) + 2 if isinstance(idx, (int, float)) else 2
                            errors.append({
                                "row": row_num,
                                "errors": result["errors"]
                            })
                    except Exception as e:
                        error_count += 1
                        # Convert idx to int and add 2 (for header row + 1-indexing)
                        row_num = int(idx) + 2 if isinstance(idx, (int, float)) else 2
                        errors.append({
                            "row": row_num,
                            "errors": [str(e)]
                        })

            # Create upload history record
            row_count = len(df)
            error_summary = json.dumps(errors[:100]) if errors else None
            self._create_upload_history(
                uploaded_file=uploaded_file,
                upload_type=upload_type,
                row_count=row_count,
                success_count=success_count,
                error_count=error_count,
                skipped_count=skipped_count,
                error_summary=error_summary
            )

            return Response({
                "success": True,
                "message": f"Upload completed. {success_count} orders created, {skipped_count} skipped, {error_count} errors.",
                "success_count": success_count,
                "skipped_count": skipped_count,
                "skipped_rows": skipped_rows,
                "error_count": error_count,
                "errors": errors[:100]
            }, status=status.HTTP_201_CREATED if success_count > 0 else status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            # Create upload history record for failed upload
            try:
                row_count = len(df) if 'df' in locals() else 0
                error_summary = str(e)
                self._create_upload_history(
                    uploaded_file=uploaded_file,
                    upload_type='PENDING',
                    row_count=row_count,
                    success_count=0,
                    error_count=row_count,
                    error_summary=error_summary
                )
            except:
                pass  # Don't let history tracking failure block the error response

            return Response({
                "success": False,
                "message": f"Failed to process file: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["post"], parser_classes=[MultiPartParser, FormParser])
    def upload_deliveries(self, request):
        """Mark orders as delivered from CSV or Excel file"""
        serializer = BulkUploadSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        uploaded_file = serializer.validated_data["file"]
        file_name = uploaded_file.name

        try:
            # Upload type for delivery marking
            upload_type = 'DELIVERY'

            # Read file (CSV or Excel) with expected column count from FieldConfiguration
            df = self._read_file(uploaded_file, upload_type)

            # Determine file format
            file_format = 'EXCEL' if file_name.endswith('.xlsx') else 'CSV'

            # Get active mapping for this upload type and file format
            mapping = ColumnMapping.objects.filter(
                upload_type=upload_type,
                file_format=file_format,
                is_active=True
            ).first()
            if not mapping:
                return Response({
                    "success": False,
                    "message": f"No active column mapping found for {upload_type} - {file_format}. Please configure mappings first."
                }, status=status.HTTP_400_BAD_REQUEST)

            mappings = mapping.mappings

            success_count = 0
            updated_count = 0
            created_count = 0
            skipped_count = 0
            error_count = 0
            errors = []
            skipped_rows = []

            with transaction.atomic():
                for idx, row in df.iterrows():
                    try:
                        result = self._process_delivery_row(row, request.user, mappings)
                        if result["success"]:
                            success_count += 1
                            if result.get("created"):
                                created_count += 1
                            else:
                                updated_count += 1
                        elif result.get("skipped"):
                            skipped_count += 1
                            # Track which row was skipped
                            row_num = int(idx) + 2 if isinstance(idx, (int, float)) else 2
                            # Extract reason from errors field
                            reason = result.get("errors", ["Unknown reason"])[0] if result.get("errors") else "Unknown reason"
                            skipped_rows.append({
                                "row": row_num,
                                "reason": reason
                            })
                        else:
                            error_count += 1
                            # Convert idx to int and add 2 (for header row + 1-indexing)
                            row_num = int(idx) + 2 if isinstance(idx, (int, float)) else 2
                            errors.append({
                                "row": row_num,
                                "errors": result["errors"]
                            })
                    except Exception as e:
                        error_count += 1
                        # Convert idx to int and add 2 (for header row + 1-indexing)
                        row_num = int(idx) + 2 if isinstance(idx, (int, float)) else 2
                        errors.append({
                            "row": row_num,
                            "errors": [str(e)]
                        })

            # Create upload history record
            row_count = len(df)
            error_summary = json.dumps(errors[:100]) if errors else None
            self._create_upload_history(
                uploaded_file=uploaded_file,
                upload_type=upload_type,
                row_count=row_count,
                success_count=success_count,
                error_count=error_count,
                skipped_count=skipped_count,
                error_summary=error_summary
            )

            return Response({
                "success": True,
                "message": f"Upload completed. {updated_count} orders updated, {created_count} orders created, {skipped_count} skipped, {error_count} errors.",
                "success_count": success_count,
                "updated_count": updated_count,
                "created_count": created_count,
                "skipped_count": skipped_count,
                "skipped_rows": skipped_rows,
                "error_count": error_count,
                "errors": errors[:100]
            }, status=status.HTTP_200_OK if success_count > 0 else status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            # Create upload history record for failed upload
            try:
                row_count = len(df) if 'df' in locals() else 0
                error_summary = str(e)
                self._create_upload_history(
                    uploaded_file=uploaded_file,
                    upload_type='DELIVERY',
                    row_count=row_count,
                    success_count=0,
                    error_count=row_count,
                    error_summary=error_summary
                )
            except:
                pass  # Don't let history tracking failure block the error response

            return Response({
                "success": False,
                "message": f"Failed to process file: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["post"], parser_classes=[MultiPartParser, FormParser])
    def detect_headers(self, request):
        """Detect headers from uploaded CSV or Excel file"""
        file = request.FILES.get('file')
        if not file:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Use the existing _read_file method to support both CSV and Excel
            df = self._read_file(file)
            headers = df.columns.tolist()

            return Response({"headers": headers}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def upload_history(self, request):
        """Get bulk upload history with pagination and filtering"""
        histories = BulkUploadHistory.objects.all()

        # Filter by upload_type if provided
        upload_type = request.query_params.get('upload_type')
        if upload_type:
            histories = histories.filter(upload_type=upload_type)

        # Filter by status if provided
        status_filter = request.query_params.get('status')
        if status_filter:
            histories = histories.filter(status=status_filter)

        # Pagination
        page = self.paginate_queryset(histories)
        if page is not None:
            serializer = BulkUploadHistorySerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = BulkUploadHistorySerializer(histories, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["post"])
    def clear_data(self, request):
        """Clear all OrderBook and PaymentInfo records"""
        import logging
        logger = logging.getLogger(__name__)

        try:
            with transaction.atomic():
                # Count records before deletion
                orderbook_count = OrderBook.objects.count()
                payment_info_count = PaymentInfo.objects.count()

                if orderbook_count == 0 and payment_info_count == 0:
                    return Response({
                        'success': True,
                        'message': 'No records to delete. Database is already clean!',
                        'deleted': {
                            'orderbook': 0,
                            'payment_info': 0,
                            'total': 0
                        }
                    })

                # Delete PaymentInfo first (has FK to OrderBook)
                payment_deleted = PaymentInfo.objects.all().delete()[0]
                logger.info(f"Deleted {payment_deleted} PaymentInfo records")

                # Delete OrderBook records
                orderbook_deleted = OrderBook.objects.all().delete()[0]
                logger.info(f"Deleted {orderbook_deleted} OrderBook records")

                total_deleted = orderbook_deleted + payment_deleted

                return Response({
                    'success': True,
                    'message': f'Successfully deleted {total_deleted} total records',
                    'deleted': {
                        'orderbook': orderbook_deleted,
                        'payment_info': payment_deleted,
                        'total': total_deleted
                    }
                }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error clearing OrderBook data: {str(e)}")
            return Response({
                'success': False,
                'message': f'Error during deletion: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=["get"])
    def export_csv(self, request):
        """Export order book data to CSV"""
        # Get filtered queryset
        queryset = self.filter_queryset(self.get_queryset())

        # Create HTTP response with CSV content type
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="orderbook_{timezone.now().strftime("%Y%m%d_%H%M%S")}.csv"'

        writer = csv.writer(response)

        # Write CSV header
        writer.writerow([
            'Order Number',
            'Consumer Number',
            'Consumer Name',
            'Mobile Number',
            'Book Date',
            'Product',
            'Refill Type',
            'Delivery Flag',
            'Delivery Date',
            'Delivery Person',
            'Payment Option',
            'Cash Memo No',
            'Status',
        ])

        # Write data rows
        for order in queryset:
            # Get payment info if available
            payment_option = ''
            cash_memo_no = ''
            if hasattr(order, 'payment_info') and order.payment_info:
                payment_option = order.payment_info.payment_option.name if order.payment_info.payment_option else ''
                cash_memo_no = order.payment_info.cash_memo_no or ''

            writer.writerow([
                order.order_no,
                order.consumer.consumer_number if order.consumer else '',
                order.consumer.person.person_name if order.consumer and order.consumer.person else '',
                order.consumer.person.contacts.first().mobile if order.consumer and order.consumer.person and order.consumer.person.contacts.exists() else '',
                order.book_date.strftime('%Y-%m-%d') if order.book_date else '',
                order.product or '',
                order.refill_type.name if order.refill_type else '',
                order.delivery_flag.name if order.delivery_flag else '',
                order.delivery_date.strftime('%Y-%m-%d') if order.delivery_date else '',
                order.delivery_person.name if order.delivery_person else '',
                payment_option,
                cash_memo_no,
                'Delivered' if order.delivery_date and order.delivery_date >= order.book_date else 'Pending',
            ])

        return response

    @action(detail=False, methods=["get"])
    def valid_mapping_keys(self, request):
        """
        Get valid mapping keys for each upload type.
        Frontend can use this to populate dropdowns for column mapping.

        Returns the MAPPING_SCHEMA which is the SINGLE SOURCE OF TRUTH
        for all valid mapping keys.
        """
        try:
            return Response({
                'success': True,
                'mapping_schema': self.MAPPING_SCHEMA
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': str(e),
                'success': False
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=["get"])
    def field_definitions(self, request):
        """
        Get OrderBook model field definitions for column mapping

        Query Parameters:
            - upload_type (optional): Filter fields for specific upload type
              (e.g., PENDING, DELIVERY)
            - for_mapping (optional): If 'true', return only fields configured in FieldSettings
              If 'false' or not provided, return all available fields

        Returns:
            - fields: List of field metadata extracted from OrderBook model
            - default_mapping: Suggested CSV column names for each backend field
            - success: Boolean indicating success
        """
        try:
            # Get upload_type from query parameters
            upload_type = request.query_params.get('upload_type', None)
            for_mapping = request.query_params.get('for_mapping', 'false').lower() == 'true'

            # Get field definitions (filtered by upload_type if provided)
            fields = get_orderbook_field_definitions(upload_type=upload_type, for_mapping=for_mapping)
            default_mapping = get_csv_field_mapping()

            return Response({
                'fields': fields,
                'default_mapping': default_mapping,
                'upload_type': upload_type,
                'success': True
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': str(e),
                'success': False
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _read_file(self, uploaded_file, upload_type=None):
        """Read CSV or Excel file and return pandas DataFrame

        Args:
            uploaded_file: The uploaded file object
            upload_type: Type of upload (PENDING/DELIVERY) to get expected column count
        """
        import logging
        logger = logging.getLogger(__name__)

        file_name = uploaded_file.name

        # Get expected column count from FieldConfiguration if upload_type is provided
        expected_column_count = None
        if upload_type:
            expected_column_count = FieldConfiguration.objects.filter(
                upload_type=upload_type,
                is_included=True
            ).count()
            logger.info(f"Expected column count for {upload_type}: {expected_column_count}")

        if file_name.endswith('.csv'):
            # Detect header row intelligently for CSV
            header_row = self._detect_csv_header_row(uploaded_file, expected_column_count)
            print(f"[CSV UPLOAD] Detected header row: {header_row}")
            logger.info(f"Detected header row: {header_row}")

            # Reset file pointer
            uploaded_file.seek(0)

            # Skip rows before header and read with header=0
            # This avoids pandas trying to parse inconsistent rows before the header
            skiprows = list(range(0, header_row)) if header_row > 0 else None

            # Try reading with detected header
            try:
                # Skip all rows before header, then read header as row 0
                df = pd.read_csv(
                    uploaded_file,
                    encoding='utf-8-sig',
                    skiprows=skiprows,
                    header=0
                )
                print(f"[CSV UPLOAD] Read CSV with header at row {header_row} (skipped {header_row} rows), shape: {df.shape}")
                print(f"[CSV UPLOAD] Columns: {df.columns.tolist()}")
                logger.info(f"Successfully read CSV with header at row {header_row}, shape: {df.shape}")
                logger.info(f"CSV Columns: {df.columns.tolist()}")

                if len(df) > 0:
                    print(f"[CSV UPLOAD] First row data: {df.iloc[0].to_dict()}")
                    logger.info(f"First row data: {df.iloc[0].to_dict()}")

                # If only 1 column, the delimiter is probably wrong
                if df.shape[1] == 1:
                    column_name = df.columns[0]
                    first_value = df.iloc[0][column_name] if len(df) > 0 else ""

                    print(f"[CSV UPLOAD] ⚠️ Only 1 column detected!")
                    print(f"[CSV UPLOAD]   Column name: '{column_name}'")
                    print(f"[CSV UPLOAD]   First value: '{first_value}'")
                    print(f"[CSV UPLOAD]   This usually means wrong delimiter or wrong header row")
                    logger.warning(f"Only 1 column detected! Column name: '{column_name}', First value: '{first_value}'")
                    logger.warning("This usually means wrong delimiter or wrong header row")

                    # Try different delimiters
                    for delimiter in ['\t', ';', '|', ',']:
                        uploaded_file.seek(0)
                        print(f"[CSV UPLOAD] Trying delimiter: '{delimiter}'")
                        logger.info(f"Trying delimiter: '{delimiter}'")
                        try:
                            test_df = pd.read_csv(
                                uploaded_file,
                                encoding='utf-8-sig',
                                skiprows=skiprows,
                                header=0,
                                sep=delimiter
                            )
                            print(f"[CSV UPLOAD]   Result: shape={test_df.shape}, columns={test_df.columns.tolist()[:5]}")
                            logger.info(f"With delimiter '{delimiter}': shape={test_df.shape}, columns={test_df.columns.tolist()[:5]}")

                            # If we get more columns, use this
                            if test_df.shape[1] > 1:
                                df = test_df
                                print(f"[CSV UPLOAD] ✅ SUCCESS! Using delimiter '{delimiter}', shape: {df.shape}")
                                logger.info(f"SUCCESS! Using delimiter '{delimiter}', shape: {df.shape}")
                                break
                        except Exception as e:
                            print(f"[CSV UPLOAD]   Failed: {e}")
                            logger.warning(f"Failed with delimiter '{delimiter}': {e}")
                            continue

                # Final validation
                if df.shape[1] == 1:
                    print(f"[CSV UPLOAD] ❌ ERROR: Still only 1 column after trying all delimiters")
                    print(f"[CSV UPLOAD]   Columns: {df.columns.tolist()}")
                    print(f"[CSV UPLOAD]   Shape: {df.shape}")
                    print(f"[CSV UPLOAD]   First 3 rows:\n{df.head(3)}")
                    logger.error(f"Still only 1 column after trying all delimiters. DataFrame info:")
                    logger.error(f"  Columns: {df.columns.tolist()}")
                    logger.error(f"  Shape: {df.shape}")
                    logger.error(f"  First 3 rows:\n{df.head(3)}")
                    raise ValueError(f"CSV file has only 1 column. Check file format and delimiter. Column: '{df.columns[0]}'")

                # Additional validation: check if we have enough columns
                if expected_column_count and df.shape[1] < expected_column_count:
                    print(f"[CSV UPLOAD] ⚠️ Warning: Expected {expected_column_count} columns but got {df.shape[1]}")
                    print(f"[CSV UPLOAD]   Columns: {df.columns.tolist()}")
                    print(f"[CSV UPLOAD]   Header row might be incorrect")
                    logger.warning(f"Expected {expected_column_count} columns but got {df.shape[1]}")
                    logger.warning(f"Columns: {df.columns.tolist()}")
                    logger.warning("Header row might be incorrect. Current columns suggest wrong row was detected as header.")

                print(f"[CSV UPLOAD] ✅ Final DataFrame - shape: {df.shape}, columns: {df.columns.tolist()}")
                logger.info(f"Final DataFrame shape: {df.shape}, columns: {df.columns.tolist()}")
                return df
            except Exception as e:
                logger.error(f"Failed to read CSV with header={header_row}: {e}")

                # Retry with different header rows and delimiters
                for retry_header in [0, 1, 2, 3, 4, 5]:
                    if retry_header == header_row:
                        continue  # Already tried this

                    # Calculate skiprows for retry
                    retry_skiprows = list(range(0, retry_header)) if retry_header > 0 else None

                    # Try comma delimiter
                    uploaded_file.seek(0)
                    try:
                        logger.info(f"Retrying with header={retry_header}")
                        df = pd.read_csv(
                            uploaded_file,
                            encoding='utf-8-sig',
                            skiprows=retry_skiprows,
                            header=0
                        )

                        # If only 1 column, try tab delimiter
                        if df.shape[1] == 1:
                            uploaded_file.seek(0)
                            df = pd.read_csv(
                                uploaded_file,
                                encoding='utf-8-sig',
                                skiprows=retry_skiprows,
                                header=0,
                                sep='\t'
                            )

                        logger.info(f"SUCCESS with header={retry_header}, shape: {df.shape}")
                        logger.info(f"Columns: {df.columns.tolist()}")
                        return df
                    except Exception as retry_error:
                        logger.warning(f"Failed with header={retry_header}: {retry_error}")
                        continue

                # If all retries failed, raise the original error
                raise e
        elif file_name.endswith('.xlsx'):
            # Detect header row intelligently
            header_row = self._detect_excel_header_row(uploaded_file, expected_column_count)
            print(f"[EXCEL UPLOAD] Detected header row: {header_row}")
            logger.info(f"Detected header row: {header_row}")

            # Reset file pointer
            uploaded_file.seek(0)

            # Try reading with detected header
            try:
                df = pd.read_excel(uploaded_file, engine='openpyxl', header=header_row)
                print(f"[EXCEL UPLOAD] Read Excel with header at row {header_row}, shape: {df.shape}")
                print(f"[EXCEL UPLOAD] Raw columns: {df.columns.tolist()}")
                logger.info(f"Successfully read Excel with header at row {header_row}, shape: {df.shape}")
                logger.info(f"Excel Raw Columns: {df.columns.tolist()}")

                # Clean up Excel columns
                # 1. Remove "Unnamed: X" columns (empty columns from Excel formatting)
                unnamed_cols = [col for col in df.columns if str(col).startswith('Unnamed:')]
                if unnamed_cols:
                    print(f"[EXCEL UPLOAD] Removing {len(unnamed_cols)} unnamed columns: {unnamed_cols}")
                    logger.info(f"Removing {len(unnamed_cols)} unnamed columns")
                    df = df.drop(columns=unnamed_cols)

                # 2. Strip whitespace and newlines from column names
                df.columns = [str(col).strip().replace('\n', ' ').replace('\r', ' ') for col in df.columns]
                print(f"[EXCEL UPLOAD] Cleaned columns: {df.columns.tolist()}")
                logger.info(f"Cleaned columns: {df.columns.tolist()}")

                # Log first row for debugging
                if len(df) > 0:
                    print(f"[EXCEL UPLOAD] First row data: {df.iloc[0].to_dict()}")
                    logger.info(f"First row data: {df.iloc[0].to_dict()}")

                # Additional validation: check if we have enough columns
                if expected_column_count and df.shape[1] < expected_column_count:
                    print(f"[EXCEL UPLOAD] ⚠️ Warning: Expected {expected_column_count} columns but got {df.shape[1]}")
                    print(f"[EXCEL UPLOAD]   Columns: {df.columns.tolist()}")
                    print(f"[EXCEL UPLOAD]   Header row might be incorrect")
                    logger.warning(f"Expected {expected_column_count} columns but got {df.shape[1]}")
                    logger.warning(f"Columns: {df.columns.tolist()}")
                    logger.warning("Header row might be incorrect. Current columns suggest wrong row was detected as header.")

                print(f"[EXCEL UPLOAD] ✅ Final DataFrame - shape: {df.shape}, columns: {df.columns.tolist()}")
                logger.info(f"Final DataFrame shape: {df.shape}, columns: {df.columns.tolist()}")
                return df
            except Exception as e:
                logger.error(f"Failed to read Excel with header={header_row}: {e}")

                # Retry with different header rows
                for retry_header in [0, 1, 2, 3, 4, 5]:
                    if retry_header == header_row:
                        continue

                    uploaded_file.seek(0)
                    try:
                        logger.info(f"Retrying with header={retry_header}")
                        df = pd.read_excel(uploaded_file, engine='openpyxl', header=retry_header)
                        logger.info(f"SUCCESS with header={retry_header}, shape: {df.shape}")
                        return df
                    except Exception as retry_error:
                        logger.warning(f"Failed with header={retry_header}: {retry_error}")
                        continue

                # If all retries failed, raise the original error
                raise e
        else:
            raise ValueError("Unsupported file format. Only CSV and Excel (.xlsx) are supported.")

    def _detect_excel_header_row(self, uploaded_file, expected_column_count=None):
        """
        Detect which row contains the actual column headers in Excel file
        Uses column count consistency to find where data actually starts

        Args:
            uploaded_file: The uploaded file object
            expected_column_count: Expected number of columns from FieldConfiguration
        """
        try:
            # Read first 30 rows to get good sample
            df_preview = pd.read_excel(uploaded_file, engine='openpyxl', header=None, nrows=30)

            # Analyze column counts for each row
            row_data = []
            for idx, row in df_preview.iterrows():
                # Count non-empty cells
                non_empty_count = sum(1 for cell in row if pd.notna(cell) and str(cell).strip())

                if non_empty_count == 0:
                    # Skip completely empty rows
                    continue

                # Check if row is mostly text (potential header)
                text_count = 0
                numeric_count = 0
                for cell in row:
                    if pd.notna(cell) and str(cell).strip():
                        if isinstance(cell, (int, float)):
                            numeric_count += 1
                        else:
                            text_count += 1

                row_data.append({
                    'index': idx,
                    'column_count': non_empty_count,
                    'text_count': text_count,
                    'numeric_count': numeric_count,
                    'is_mostly_text': text_count > numeric_count
                })

            if not row_data:
                return 0

            # BEST APPROACH: If we know the expected column count from FieldConfiguration,
            # find the first row with AT LEAST that many columns
            if expected_column_count and expected_column_count > 0:
                import logging
                logger = logging.getLogger(__name__)
                logger.info(f"Looking for header with at least {expected_column_count} columns")
                logger.info(f"Row data: {[(r['index'], r['column_count'], r['is_mostly_text']) for r in row_data]}")

                # First try: Find row with AT LEAST expected count that is mostly text
                for row_info in row_data:
                    if (row_info['column_count'] >= expected_column_count and
                        row_info['is_mostly_text']):
                        logger.info(f"Found header at row {row_info['index']} with {row_info['column_count']} columns (>= {expected_column_count}, mostly text)")
                        return row_info['index']

                # Second try: Just find row with AT LEAST expected count (even if not mostly text)
                for row_info in row_data:
                    if row_info['column_count'] >= expected_column_count:
                        logger.info(f"Found header at row {row_info['index']} with {row_info['column_count']} columns (>= {expected_column_count})")
                        return row_info['index']

                logger.warning(f"No row found with >= {expected_column_count} columns, falling back to dynamic detection")

            # Find column counts that repeat (indicating data structure, not metadata)
            from collections import Counter
            column_counts = [r['column_count'] for r in row_data]
            count_frequency = Counter(column_counts)
            print(f"[HEADER DETECTION] Column count frequency: {dict(count_frequency)}")

            # SMART FIX: Dynamically determine threshold based on actual data
            # Find the maximum column count in the file
            max_column_count = max(column_counts) if column_counts else 0
            print(f"[HEADER DETECTION] Max column count: {max_column_count}")

            # Filter out rows with significantly fewer columns than the max
            # Use 50% of max as threshold (e.g., if max is 16, ignore rows with < 8 columns)
            # This handles both large files (16 cols) and small files (2-3 cols)
            threshold = max(1, max_column_count // 2)  # At least 1
            print(f"[HEADER DETECTION] Threshold (50% of max): {threshold}")

            filtered_counts = {count: freq for count, freq in count_frequency.items() if count >= threshold}
            print(f"[HEADER DETECTION] Filtered counts (>= {threshold}): {filtered_counts}")

            if not filtered_counts:
                # If filtering removed everything, use the original data
                filtered_counts = count_frequency
                print(f"[HEADER DETECTION] Filtering removed everything, using original")

            # Filter to counts that appear at least 2 times (indicates repeating data)
            # AND prioritize higher column counts (actual data usually has more columns than metadata)
            repeating_counts = [(count, freq) for count, freq in filtered_counts.items() if freq >= 2]
            print(f"[HEADER DETECTION] Repeating counts (freq >= 2): {repeating_counts}")

            if repeating_counts:
                # Sort by: 1) column count (descending), 2) frequency (descending)
                # This prioritizes rows with MORE columns that also repeat
                repeating_counts.sort(key=lambda x: (x[0], x[1]), reverse=True)
                most_common_count = repeating_counts[0][0]
                print(f"[HEADER DETECTION] Selected most_common_count (from repeating): {most_common_count}")
            else:
                # Fallback: prioritize higher column counts even if they appear only once
                # Data rows typically have more columns than metadata rows
                all_counts = [(count, freq) for count, freq in filtered_counts.items()]
                all_counts.sort(key=lambda x: (x[0], x[1]), reverse=True)
                most_common_count = all_counts[0][0]
                print(f"[HEADER DETECTION] Selected most_common_count (fallback, highest): {most_common_count}")

            print(f"[HEADER DETECTION] Looking for first row with {most_common_count} columns that is mostly text...")

            # Find first row with the consistent column count that is mostly text
            # This is likely the header row
            for row_info in row_data:
                if row_info['column_count'] == most_common_count:
                    # Header should be mostly text, not numeric
                    if row_info['is_mostly_text']:
                        print(f"[HEADER DETECTION] ✅ Found header at row {row_info['index']} ({most_common_count} cols, mostly text)")
                        return row_info['index']
                    # If first consistent row is numeric, it might be data
                    # Check if previous row exists and is text (could be header)
                    elif row_info['index'] > 0:
                        for prev_row in row_data:
                            if prev_row['index'] == row_info['index'] - 1:
                                if prev_row['is_mostly_text'] and prev_row['column_count'] == most_common_count:
                                    print(f"[HEADER DETECTION] ✅ Found header at row {prev_row['index']} (previous row, mostly text)")
                                    return prev_row['index']
                        # No text row before, assume current is header anyway
                        print(f"[HEADER DETECTION] ✅ Using row {row_info['index']} (first with {most_common_count} cols, mostly numeric)")
                        return row_info['index']
                    else:
                        # First row with consistent count, use it
                        print(f"[HEADER DETECTION] ✅ Using row {row_info['index']} (first row with {most_common_count} cols)")
                        return row_info['index']

            # Fallback: return first row with most common count
            for row_info in row_data:
                if row_info['column_count'] == most_common_count:
                    return row_info['index']

            # Final fallback
            return 0

        except Exception as e:
            # If detection fails, default to first row
            return 0

    def _detect_csv_header_row(self, uploaded_file, expected_column_count=None):
        """
        Detect which row contains the actual column headers in CSV file
        Uses letter detection to find header row (based on dhp.py approach)

        Args:
            uploaded_file: The uploaded file object
            expected_column_count: Expected number of columns from FieldConfiguration
        """
        import re

        # Read file with error handling for encoding issues
        uploaded_file.seek(0)
        try:
            content = uploaded_file.read()
            if isinstance(content, bytes):
                # Try UTF-8 first, fall back to replace errors
                try:
                    text = content.decode('utf-8-sig')
                except UnicodeDecodeError:
                    text = content.decode('utf-8', errors='replace')
            else:
                text = content
        except Exception:
            uploaded_file.seek(0)
            return 0

        uploaded_file.seek(0)

        # Split into lines
        lines = text.splitlines()
        if not lines:
            return 0

        # Try different delimiters to find the best one
        delimiters = [',', '\t', ';', '|']
        best_delimiter = ','
        max_cols = 0

        for delimiter in delimiters:
            for line in lines[:10]:  # Check first 10 lines
                cols = len(line.split(delimiter))
                if cols > max_cols:
                    max_cols = cols
                    best_delimiter = delimiter

        print(f"[HEADER DETECTION] Best delimiter: '{best_delimiter}', max columns: {max_cols}")

        # Split rows by delimiter and normalize column count
        split_rows = [line.strip().split(best_delimiter) for line in lines]
        max_cols = max(len(r) for r in split_rows) if split_rows else 0

        # Detect header row
        for i, row in enumerate(split_rows):
            # Normalize to same length
            row = row + [""] * (max_cols - len(row))

            # Skip blank rows
            if all(not cell.strip() for cell in row):
                continue

            # Strip cells
            row = [cell.strip() for cell in row]

            # Count features
            has_letters = sum(1 for cell in row if re.search(r'[A-Za-z]', cell))
            numeric_only = sum(1 for cell in row if re.fullmatch(r'\d+(\.\d+)?', cell))

            # Calculate percentages for logging
            total_non_empty = sum(1 for cell in row if cell)
            letter_pct = (has_letters / total_non_empty * 100) if total_non_empty > 0 else 0

            print(f"[HEADER DETECTION] Row {i}: {total_non_empty} fields, {has_letters} with letters, {numeric_only} numeric-only, letter%={letter_pct:.1f}%, first_fields={row[:3]}")

            # Header must have more text than numbers
            # Condition: at least 2 fields with letters AND more letter fields than numeric-only fields
            if has_letters >= max(2, numeric_only + 1):
                print(f"[HEADER DETECTION] ✅ Selected row {i} as header (has {has_letters} letter fields, {numeric_only} numeric-only)")
                return i

        # Fallback
        print(f"[HEADER DETECTION] ⚠️ No good header found, defaulting to row 0")
        return 0

    def _create_upload_history(self, uploaded_file, upload_type, row_count,
                               success_count, error_count, skipped_count=0,
                               error_summary=None):
        """Create bulk upload history record using serializer"""
        import logging
        logger = logging.getLogger(__name__)

        # Determine file type
        file_type = 'XLSX' if uploaded_file.name.endswith('.xlsx') else 'CSV'

        # Determine status
        if error_count == 0:
            status = 'SUCCESS'
        elif success_count > 0:
            status = 'PARTIAL'
        else:
            status = 'FAILED'

        # Use serializer to create record
        serializer = BulkUploadHistoryCreateSerializer(data={
            'file_name': uploaded_file.name,
            'file_type': file_type,
            'file_size': uploaded_file.size,
            'upload_type': upload_type,
            'row_count': row_count,
            'success_count': success_count,
            'error_count': error_count,
            'skipped_count': skipped_count,
            'status': status,
            'uploaded_by': self.request.user.id,
            'error_summary': error_summary[:5000] if error_summary else None
        })

        if serializer.is_valid():
            serializer.save()
        else:
            # Log validation errors (shouldn't happen with correct data)
            logger.error(f"Failed to create upload history: {serializer.errors}")

    def _get_value_from_mapping(self, row, mappings, mapped_key):
        """Get value from row using column mappings, handling pandas Series"""
        column_name = mappings.get(mapped_key)

        # If mapping doesn't exist, return empty string
        if not column_name:
            return ""

        # Try to get value from row
        if column_name in row.index:
            value = row[column_name]
        else:
            # Try case-insensitive match
            for col in row.index:
                if col.lower() == column_name.lower():
                    value = row[col]
                    break
            else:
                return ""

        # Handle pandas NaN values
        if pd.isna(value):
            return ""

        # Convert to string and strip
        return str(value).strip()

    def _process_pending_row(self, row, user, mappings, source_file):
        """Process a single row for pending orders upload - CREATE ONLY

        Uses MAPPING_SCHEMA to dynamically extract values - NO HARDCODED KEYS!
        """
        errors = []

        try:
            # Extract ALL values dynamically from MAPPING_SCHEMA
            data = {}
            for field in self.MAPPING_SCHEMA["PENDING"]["fields"]:
                key = field["key"]
                data[key] = self._get_value_from_mapping(row, mappings, key)

            # Assign to variables for convenience (but data comes from schema!)
            consumer_value = data.get("consumer")  # Value to lookup consumer by
            order_no = data.get("order_no")
            book_date_str = data.get("book_date")
            product = data.get("product")
            refill_type_name = data.get("refill_type")
            delivery_flag_name = data.get("delivery_flag")
            last_delivery_date_str = data.get("last_delivery_date")
            payment_option_name = data.get("payment_option")  # NEW: for PaymentInfo

            # Validate required fields (check against schema)
            missing = []
            missing_mappings = []
            for field in self.MAPPING_SCHEMA["PENDING"]["fields"]:
                if field["required"]:
                    if field["key"] not in mappings or not mappings.get(field["key"]):
                        # Mapping doesn't exist for this required field
                        missing_mappings.append(field["label"])
                    elif not data.get(field["key"]):
                        # Mapping exists but value is empty
                        missing.append(field["label"])

            if missing_mappings:
                errors.append(f"Column mappings not configured for required fields: {', '.join(missing_mappings)}. Please configure Column Mappings for PENDING upload type.")
                return {"success": False, "errors": errors}

            if missing:
                errors.append(f"Missing required fields: {', '.join(missing)}")
                return {"success": False, "errors": errors}

            # Parse book date
            try:
                book_date = self._parse_date(book_date_str)
            except ValueError:
                errors.append(f"Invalid BookDate format: {book_date_str}")
                return {"success": False, "errors": errors}

            # Parse last delivery date if provided
            last_delivery_date = None
            if last_delivery_date_str:
                try:
                    last_delivery_date = self._parse_date(last_delivery_date_str)
                    # Convert to datetime for DateTimeField
                    last_delivery_date = timezone.make_aware(
                        datetime.combine(last_delivery_date, datetime.min.time())
                    )
                except ValueError:
                    errors.append(f"Invalid last delivery date format: {last_delivery_date_str}")

            # Get consumer (using lookup_field from schema)
            try:
                consumer = Consumer.objects.get(consumer_number=consumer_value)
            except Consumer.DoesNotExist:
                errors.append(f"Consumer not found: {consumer_value}")
                return {"success": False, "errors": errors}

            # Get or create lookup values
            refill_type, _ = RefillType.objects.get_or_create(name=refill_type_name) if refill_type_name else (None, None)
            delivery_flag, _ = DeliveryFlag.objects.get_or_create(name=delivery_flag_name) if delivery_flag_name else (None, None)

            # Check if order already exists
            if OrderBook.objects.filter(consumer=consumer, order_no=order_no, book_date=book_date).exists():
                errors.append(f"Order already exists: {order_no}")
                return {"success": False, "errors": errors}

            # Create new order
            order = OrderBook.objects.create(
                consumer=consumer,
                order_no=order_no,
                book_date=book_date,
                product=product,
                refill_type=refill_type,
                delivery_flag=delivery_flag or DeliveryFlag.objects.get_or_create(name="Booked Not Printed")[0],
                delivery_person=None,  # Pending orders don't have delivery person
                last_delivery_date=last_delivery_date,
                source_file=source_file,
                updated_by=user,
                updated_type=OrderBook.UpdateType.BULK,
            )

            # Create PaymentInfo if payment_option provided
            if payment_option_name:
                payment_option, _ = PaymentOption.objects.get_or_create(name=payment_option_name)
                PaymentInfo.objects.create(
                    order=order,
                    payment_option=payment_option,
                    payment_status='PENDING',
                )

            return {"success": True}

        except Exception as e:
            errors.append(str(e))
            return {"success": False, "errors": errors}

    def _process_delivery_row(self, row, user, mappings):
        """Process a single row for delivery marking - UPDATE ONLY, SKIP if not found

        Uses MAPPING_SCHEMA to dynamically extract values - NO HARDCODED KEYS!
        """
        errors = []

        try:
            # Extract ALL values dynamically from MAPPING_SCHEMA
            data = {}
            for field in self.MAPPING_SCHEMA["DELIVERY"]["fields"]:
                key = field["key"]
                data[key] = self._get_value_from_mapping(row, mappings, key)

            # Assign to variables for convenience (but data comes from schema!)
            consumer_value = data.get("consumer")  # Value to lookup consumer by
            order_no = data.get("order_no")
            book_date_str = data.get("book_date")
            delivery_date_str = data.get("delivery_date")
            cash_memo_no = data.get("cash_memo_no")
            payment_option_name = data.get("payment_option")
            # New fields for creating orders
            product = data.get("product")
            refill_type_name = data.get("refill_type")
            delivery_flag_name = data.get("delivery_flag")
            delivery_person_name = data.get("delivery_person")  # Delivery person name from CSV

            # Validate required fields (check against schema)
            missing = []
            missing_mappings = []
            for field in self.MAPPING_SCHEMA["DELIVERY"]["fields"]:
                if field["required"]:
                    if field["key"] not in mappings or not mappings.get(field["key"]):
                        # Mapping doesn't exist for this required field
                        missing_mappings.append(field["label"])
                    elif not data.get(field["key"]):
                        # Mapping exists but value is empty
                        missing.append(field["label"])

            if missing_mappings:
                errors.append(f"Column mappings not configured for required fields: {', '.join(missing_mappings)}. Please configure Column Mappings for DELIVERY upload type.")
                return {"success": False, "errors": errors}

            if missing:
                errors.append(f"Missing required fields: {', '.join(missing)}")
                return {"success": False, "errors": errors}

            # Parse dates
            try:
                book_date = self._parse_date(book_date_str)
            except ValueError:
                errors.append(f"Invalid BookDate format: {book_date_str}")
                return {"success": False, "errors": errors}

            delivery_date = None
            if delivery_date_str:
                try:
                    delivery_date = self._parse_date(delivery_date_str)
                except ValueError:
                    errors.append(f"Invalid DeliveryDate format: {delivery_date_str}")
                    return {"success": False, "errors": errors}

            # Fallback to today if delivery_date not provided
            if not delivery_date:
                delivery_date = timezone.now().date()

            # Get consumer (using lookup_field from schema)
            try:
                consumer = Consumer.objects.get(consumer_number=consumer_value)
            except Consumer.DoesNotExist:
                # Skip if consumer not found
                return {"success": False, "skipped": True, "errors": [f"Consumer not found: {consumer_value}"]}

            # Get or create refill_type and delivery_flag objects (needed for both create and update)
            refill_type = None
            if refill_type_name:
                refill_type, _ = RefillType.objects.get_or_create(name=refill_type_name)

            delivery_flag = None
            if delivery_flag_name:
                delivery_flag, _ = DeliveryFlag.objects.get_or_create(name=delivery_flag_name)
            else:
                # Default to "Delivered" if not specified in file
                delivery_flag, _ = DeliveryFlag.objects.get_or_create(name="Delivered")

            # Get delivery person by name from CSV (if provided)
            delivery_person = None
            if delivery_person_name:
                try:
                    delivery_person = DeliveryPerson.objects.get(name=delivery_person_name)
                except DeliveryPerson.DoesNotExist:
                    # Delivery person not found, leave as None
                    pass

            # Find existing order or create new one
            try:
                order = OrderBook.objects.get(
                    consumer=consumer,
                    order_no=order_no,
                    book_date=book_date
                )
                created = False  # Existing order
            except OrderBook.DoesNotExist:
                # Order NOT found → CREATE new order with delivery info
                order = OrderBook.objects.create(
                    consumer=consumer,
                    order_no=order_no,
                    book_date=book_date,
                    product=product,
                    refill_type=refill_type,
                    delivery_flag=delivery_flag,
                    delivery_date=delivery_date,
                    delivery_person=delivery_person,
                    updated_by=user,
                    updated_type=OrderBook.UpdateType.BULK,
                )
                created = True  # New order created

            # Update order delivery information (for existing orders only)
            if not created:
                order.delivery_date = delivery_date
                order.delivery_flag = delivery_flag
                if delivery_person:
                    order.delivery_person = delivery_person
                order.updated_by = user
                order.updated_type = OrderBook.UpdateType.BULK
                order.save()

            # Create or update payment info if provided
            if cash_memo_no or payment_option_name:
                payment_option = None
                if payment_option_name:
                    payment_option, _ = PaymentOption.objects.get_or_create(name=payment_option_name)

                PaymentInfo.objects.update_or_create(
                    order=order,
                    defaults={
                        'payment_option': payment_option,
                        'cash_memo_no': cash_memo_no,
                        'payment_date': delivery_date,
                        'payment_status': 'COMPLETED' if delivery_date else 'PENDING',
                    }
                )

            return {"success": True, "created": created}

        except Exception as e:
            errors.append(str(e))
            return {"success": False, "errors": errors}

    def _parse_date(self, date_str):
        """Parse date from multiple formats"""
        # If it's already a datetime/date object (from Excel Timestamp), convert to date
        if isinstance(date_str, datetime):
            return date_str.date()
        if isinstance(date_str, pd.Timestamp):
            return date_str.date()

        # Convert to string for parsing
        date_str = str(date_str).strip()

        date_formats = [
            "%Y-%m-%d %H:%M:%S",   # 2025-11-02 17:55:00 (Excel format)
            "%b %d, %Y %H:%M:%S",  # Nov 02, 2025 21:57:00 (CSV format)
            "%d-%m-%Y",      # 12-11-2025
            "%d-%b-%y",      # 11-Nov-25
            "%d-%b-%Y",      # 11-Nov-2025
            "%d %b %Y",      # 11 Nov 2025
            "%d %b %y",      # 11 Nov 25
            "%Y-%m-%d",      # 2025-11-12
            "%m/%d/%Y",      # 11/12/2025
            "%d/%m/%Y",      # 12/11/2025
        ]

        for fmt in date_formats:
            try:
                return datetime.strptime(date_str, fmt).date()
            except ValueError:
                continue

        raise ValueError(f"Unable to parse date: {date_str}")
