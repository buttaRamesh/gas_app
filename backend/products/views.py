# File: products/views.py
from rest_framework import filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Q, Avg, Min, Max

from authentication.permissions import HasResourcePermission
from core.viewsets import BaseModelViewSet, EnhancedModelViewSet
from core.utils import success_response, error_response
from core.decorators import log_execution_time
from .models import Unit, Product, ProductVariant, ProductVariantPriceHistory
from .serializers import (
    UnitSerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductCreateUpdateSerializer,
    ProductVariantListSerializer,
    ProductVariantDetailSerializer,
    ProductVariantCreateUpdateSerializer,
    ProductVariantPriceUpdateSerializer,
    ProductWithVariantsSerializer,
    VariantWithProductSerializer,
    PriceHistorySerializer,
)


# ==============================================================================
# UNIT VIEWSET
# ==============================================================================

class UnitViewSet(EnhancedModelViewSet):
    """
    ViewSet for Unit of Measurement operations.

    Provides:
    - Standard CRUD operations
    - Bulk operations (create, update, delete)
    - Export functionality (CSV, JSON, Excel)
    - Search and filtering
    - Statistics

    Custom actions:
    - statistics: Get unit usage statistics
    """

    queryset = Unit.objects.all()
    permission_classes = [IsAuthenticated, HasResourcePermission]
    resource_name = 'units'
    serializer_class = UnitSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['short_name', 'description']
    ordering_fields = ['short_name']
    ordering = ['short_name']

    def get_statistics_data(self):
        """
        Override to provide custom statistics for units.
        Called by the StatisticsMixin.
        """
        total_units = self.get_queryset().count()

        # Get units with their usage count
        units_with_usage = Unit.objects.annotate(
            usage_count=Count('productvariant')
        ).order_by('-usage_count')

        unit_stats = []
        for unit in units_with_usage:
            unit_stats.append({
                'id': unit.id,
                'short_name': unit.short_name,
                'description': unit.description,
                'usage_count': unit.usage_count,
            })

        return {
            'total_units': total_units,
            'units': unit_stats,
        }


# ==============================================================================
# PRODUCT VIEWSET
# ==============================================================================

class ProductViewSet(EnhancedModelViewSet):
    """
    ViewSet for Product operations.

    Provides:
    - Standard CRUD operations
    - Bulk operations (create, update, delete)
    - Export functionality (CSV, JSON, Excel)
    - Search and filtering
    - Statistics

    Custom actions:
    - variants: Get all variants for a product
    - add_variant: Add a new variant to product
    - catalog: Get complete product catalog
    - price_range: Get price range for product variants
    """

    queryset = Product.objects.prefetch_related('variants').all()
    permission_classes = [IsAuthenticated, HasResourcePermission]
    resource_name = 'products'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name']
    ordering = ['name']

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return ProductListSerializer
        elif self.action == 'retrieve':
            return ProductDetailSerializer
        elif self.action == 'catalog':
            return ProductWithVariantsSerializer
        else:  # create, update, partial_update
            return ProductCreateUpdateSerializer
    
    @action(detail=True, methods=['get'])
    def variants(self, request, pk=None):
        """
        Get all variants for a specific product.
        
        GET /api/products/products/{id}/variants/
        """
        product = self.get_object()
        variants = product.variants.select_related('unit').all()
        
        serializer = ProductVariantListSerializer(variants, many=True)
        return Response({
            'product_id': product.id,
            'product_name': product.name,
            'total_variants': variants.count(),
            'variants': serializer.data,
        })
    
    @action(detail=True, methods=['post'])
    def add_variant(self, request, pk=None):
        """
        Add a new variant to this product.

        POST /api/products/products/{id}/add_variant/
        Body: {
            "product_code": "LPG-14.2-DOM",
            "name": "14.2 kg Domestic",
            "unit": 1,
            "quantity": 14.2,
            "variant_type": "DOMESTIC",
            "price": 850.00
        }
        """
        product = self.get_object()

        # Add product to the data
        data = request.data.copy()
        data['product'] = product.id

        serializer = ProductVariantCreateUpdateSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return success_response(
                data=ProductVariantDetailSerializer(serializer.instance).data,
                message=f"Variant added successfully to {product.name}",
                status_code=status.HTTP_201_CREATED
            )
        return error_response(
            message="Failed to add variant",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=True, methods=['get'])
    def price_range(self, request, pk=None):
        """
        Get price range for all variants of this product.
        
        GET /api/products/products/{id}/price_range/
        """
        product = self.get_object()
        variants = product.variants.all()
        
        if not variants.exists():
            return Response({
                'product_id': product.id,
                'product_name': product.name,
                'message': 'No variants available'
            })
        
        price_stats = variants.aggregate(
            min_price=Min('price'),
            max_price=Max('price'),
            avg_price=Avg('price')
        )
        
        return Response({
            'product_id': product.id,
            'product_name': product.name,
            'total_variants': variants.count(),
            'min_price': str(price_stats['min_price']),
            'max_price': str(price_stats['max_price']),
            'avg_price': str(round(price_stats['avg_price'], 2)),
        })
    
    def get_statistics_data(self):
        """
        Override to provide custom statistics for products.
        Called by the StatisticsMixin.
        """
        total_products = self.get_queryset().count()
        total_variants = ProductVariant.objects.count()

        # Products with most variants
        products_with_variants = Product.objects.annotate(
            variant_count=Count('variants')
        ).order_by('-variant_count')[:5]

        top_products = []
        for product in products_with_variants:
            top_products.append({
                'id': product.id,
                'name': product.name,
                'variant_count': product.variant_count,
            })

        # Variants by type
        variants_by_type = {}
        for choice in ProductVariant.VariantType.choices:
            count = ProductVariant.objects.filter(variant_type=choice[0]).count()
            variants_by_type[choice[1]] = count

        # Overall price statistics
        price_stats = ProductVariant.objects.aggregate(
            min_price=Min('price'),
            max_price=Max('price'),
            avg_price=Avg('price')
        )

        return {
            'total_products': total_products,
            'total_variants': total_variants,
            'top_products_by_variants': top_products,
            'variants_by_type': variants_by_type,
            'price_statistics': {
                'min_price': str(price_stats['min_price']) if price_stats['min_price'] else None,
                'max_price': str(price_stats['max_price']) if price_stats['max_price'] else None,
                'avg_price': str(round(price_stats['avg_price'], 2)) if price_stats['avg_price'] else None,
            }
        }

    @action(detail=False, methods=['get'])
    def catalog(self, request):
        """
        Get complete product catalog with all variants and prices.

        GET /api/products/products/catalog/
        """
        products = self.get_queryset()
        serializer = ProductWithVariantsSerializer(products, many=True)

        return Response({
            'total_products': products.count(),
            'catalog': serializer.data,
        })


# ==============================================================================
# PRODUCT VARIANT VIEWSET
# ==============================================================================

class ProductVariantViewSet(EnhancedModelViewSet):
    """
    ViewSet for ProductVariant operations.

    Provides:
    - Standard CRUD operations
    - Bulk operations (create, update, delete)
    - Export functionality (CSV, JSON, Excel)
    - Search and filtering
    - Statistics

    Custom actions:
    - by_type: Get variants by type
    - by_product: Get variants for a specific product
    - search_by_quantity: Search variants by quantity range
    - search_by_price: Search variants by price range
    - update_price: Update variant price with history tracking
    - price_history: Get price history for a variant
    """

    queryset = ProductVariant.objects.select_related('product', 'unit').all()
    permission_classes = [IsAuthenticated, HasResourcePermission]
    resource_name = 'variants'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['product', 'variant_type', 'unit']
    search_fields = ['product_code', 'name', 'product__name']
    ordering_fields = ['product_code', 'name', 'quantity', 'price']
    ordering = ['product__name', 'quantity']

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return ProductVariantListSerializer
        elif self.action == 'retrieve':
            return ProductVariantDetailSerializer
        elif self.action in ['by_type', 'by_product', 'search_by_quantity', 'search_by_price']:
            return VariantWithProductSerializer
        elif self.action == 'update_price':
            return ProductVariantPriceUpdateSerializer
        else:  # create, update, partial_update
            return ProductVariantCreateUpdateSerializer
    
    @action(detail=True, methods=['patch'])
    def update_price(self, request, pk=None):
        """
        Update variant price with reason tracking.

        PATCH /api/products/variants/{id}/update_price/
        Body: {
            "price": 900.00,
            "reason": "Seasonal increase",
            "notes": "Optional notes"
        }
        """
        variant = self.get_object()
        serializer = ProductVariantPriceUpdateSerializer(data=request.data)

        if serializer.is_valid():
            new_price = serializer.validated_data['price']
            reason = serializer.validated_data.get('reason', '')
            notes = serializer.validated_data.get('notes', '')

            old_price = variant.price

            # Update price (signal will create history record)
            variant.price = new_price
            variant.save()

            # Update the latest history record with reason and notes if provided
            if reason or notes:
                latest_history = variant.get_latest_price_change()
                if latest_history:
                    if reason:
                        latest_history.reason = reason
                    if notes:
                        latest_history.notes = notes
                    latest_history.changed_by = request.user
                    latest_history.save()

            return success_response(
                data=ProductVariantDetailSerializer(variant).data,
                message=f"Price updated from ₹{old_price} to ₹{new_price}",
                status_code=status.HTTP_200_OK
            )

        return error_response(
            message="Invalid price data",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=True, methods=['get'])
    def price_history(self, request, pk=None):
        """
        Get complete price history for a variant.
        
        GET /api/products/variants/{id}/price_history/
        """
        variant = self.get_object()
        history = variant.price_history.all()
        
        serializer = PriceHistorySerializer(history, many=True)
        return Response({
            'variant_id': variant.id,
            'variant_name': variant.name,
            'current_price': str(variant.price),
            'total_changes': history.count(),
            'history': serializer.data,
        })
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """
        Get all variants of a specific type.
        
        GET /api/products/variants/by_type/?type=DOMESTIC
        """
        variant_type = request.query_params.get('type', None)
        
        if not variant_type:
            return Response(
                {'error': 'type parameter is required (DOMESTIC/COMMERCIAL/INDUSTRIAL/OTHER)'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if variant_type not in [choice[0] for choice in ProductVariant.VariantType.choices]:
            return Response(
                {'error': f'Invalid type. Must be one of: {[c[0] for c in ProductVariant.VariantType.choices]}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(variant_type=variant_type)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'variant_type': variant_type,
            'total_count': queryset.count(),
            'variants': serializer.data,
        })
    
    @action(detail=False, methods=['get'])
    def by_product(self, request):
        """
        Get all variants for a specific product.
        
        GET /api/products/variants/by_product/?product_id=1
        """
        product_id = request.query_params.get('product_id', None)
        
        if not product_id:
            return Response(
                {'error': 'product_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(product_id=product_id)
        
        if not queryset.exists():
            return Response(
                {'error': 'No variants found for this product'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(queryset, many=True)
        product_name = queryset.first().product.name if queryset.exists() else ''
        
        return Response({
            'product_id': product_id,
            'product_name': product_name,
            'total_count': queryset.count(),
            'variants': serializer.data,
        })
    
    @action(detail=False, methods=['get'])
    def search_by_quantity(self, request):
        """
        Search variants by quantity range.

        GET /api/products/variants/search_by_quantity/?min_quantity=10&max_quantity=20
        """
        min_quantity = request.query_params.get('min_quantity', None)
        max_quantity = request.query_params.get('max_quantity', None)

        queryset = self.get_queryset()

        if min_quantity:
            try:
                queryset = queryset.filter(quantity__gte=float(min_quantity))
            except ValueError:
                return Response(
                    {'error': 'min_quantity must be a valid number'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if max_quantity:
            try:
                queryset = queryset.filter(quantity__lte=float(max_quantity))
            except ValueError:
                return Response(
                    {'error': 'max_quantity must be a valid number'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'min_quantity': min_quantity,
            'max_quantity': max_quantity,
            'total_count': queryset.count(),
            'variants': serializer.data,
        })
    
    @action(detail=False, methods=['get'])
    def search_by_price(self, request):
        """
        Search variants by price range.
        
        GET /api/products/variants/search_by_price/?min_price=500&max_price=1000
        """
        min_price = request.query_params.get('min_price', None)
        max_price = request.query_params.get('max_price', None)
        
        queryset = self.get_queryset()
        
        if min_price:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except ValueError:
                return Response(
                    {'error': 'min_price must be a valid number'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if max_price:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except ValueError:
                return Response(
                    {'error': 'max_price must be a valid number'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'min_price': min_price,
            'max_price': max_price,
            'total_count': queryset.count(),
            'variants': serializer.data,
        })
    
    def get_statistics_data(self):
        """
        Override to provide custom statistics for product variants.
        Called by the StatisticsMixin.
        """
        total_variants = self.get_queryset().count()

        # Count by type
        by_type = {}
        for choice in ProductVariant.VariantType.choices:
            count = self.get_queryset().filter(variant_type=choice[0]).count()
            by_type[choice[1]] = count

        # Count by product
        by_product = []
        products = Product.objects.annotate(variant_count=Count('variants')).order_by('-variant_count')[:10]
        for product in products:
            by_product.append({
                'product_id': product.id,
                'product_name': product.name,
                'variant_count': product.variant_count,
            })

        # Count by unit
        by_unit = []
        units = Unit.objects.annotate(variant_count=Count('productvariant')).order_by('-variant_count')
        for unit in units:
            if unit.variant_count > 0:
                by_unit.append({
                    'unit': unit.short_name,
                    'variant_count': unit.variant_count,
                })

        # Price statistics
        price_stats = self.get_queryset().aggregate(
            min_price=Min('price'),
            max_price=Max('price'),
            avg_price=Avg('price')
        )

        # Price statistics by type
        price_by_type = {}
        for choice in ProductVariant.VariantType.choices:
            type_stats = self.get_queryset().filter(variant_type=choice[0]).aggregate(
                avg_price=Avg('price')
            )
            if type_stats['avg_price']:
                price_by_type[choice[1]] = str(round(type_stats['avg_price'], 2))

        return {
            'total_variants': total_variants,
            'by_type': by_type,
            'top_products': by_product,
            'by_unit': by_unit,
            'price_statistics': {
                'overall': {
                    'min_price': str(price_stats['min_price']) if price_stats['min_price'] else None,
                    'max_price': str(price_stats['max_price']) if price_stats['max_price'] else None,
                    'avg_price': str(round(price_stats['avg_price'], 2)) if price_stats['avg_price'] else None,
                },
                'by_type': price_by_type,
            }
        }


# ==============================================================================
# PRICE HISTORY VIEWSET
# ==============================================================================

class PriceHistoryViewSet(BaseModelViewSet):
    """
    ViewSet for viewing Price History.
    Read-only - price history is created automatically via signals.

    Provides:
    - list: Get all price history records
    - retrieve: Get single price history record

    Custom actions:
    - recent: Get recent price changes
    - by_variant: Get price history for specific variant
    """
    http_method_names = ['get', 'head', 'options']  # Read-only

    queryset = ProductVariantPriceHistory.objects.select_related(
        'variant', 'variant__product', 'variant__unit', 'changed_by'
    ).all()
    serializer_class = PriceHistorySerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['variant']
    ordering_fields = ['effective_date']
    ordering = ['-effective_date']
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """
        Get recent price changes (last 50).
        
        GET /api/products/price-history/recent/
        """
        recent_changes = self.get_queryset()[:50]
        serializer = self.get_serializer(recent_changes, many=True)
        
        return Response({
            'total_changes': self.get_queryset().count(),
            'recent_changes': serializer.data,
        })
    
    @action(detail=False, methods=['get'])
    def by_variant(self, request):
        """
        Get price history for a specific variant.
        
        GET /api/products/price-history/by_variant/?variant_id=1
        """
        variant_id = request.query_params.get('variant_id', None)
        
        if not variant_id:
            return Response(
                {'error': 'variant_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        history = self.get_queryset().filter(variant_id=variant_id)
        
        if not history.exists():
            return Response(
                {'error': 'No price history found for this variant'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(history, many=True)
        variant = history.first().variant
        
        return Response({
            'variant_id': variant.id,
            'variant_name': variant.name,
            'current_price': str(variant.price),
            'total_changes': history.count(),
            'history': serializer.data,
        })