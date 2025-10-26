# File: products/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UnitViewSet,
    ProductViewSet,
    ProductVariantViewSet,
    PriceHistoryViewSet
)

# Create router
router = DefaultRouter()

# Register viewsets
router.register(r'units', UnitViewSet, basename='unit')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'variants', ProductVariantViewSet, basename='productvariant')
router.register(r'price-history', PriceHistoryViewSet, basename='pricehistory')

urlpatterns = [
    path('', include(router.urls)),
]


# ==============================================================================
# COMPLETE API ENDPOINTS DOCUMENTATION
# ==============================================================================

"""
UNITS - STANDARD CRUD:
----------------------
GET    /api/products/units/                  - List all units
POST   /api/products/units/                  - Create new unit
GET    /api/products/units/{id}/             - Get unit details
PUT    /api/products/units/{id}/             - Update unit (full)
PATCH  /api/products/units/{id}/             - Update unit (partial)
DELETE /api/products/units/{id}/             - Delete unit

UNITS - CUSTOM ACTIONS:
-----------------------
GET    /api/products/units/statistics/       - Get unit usage statistics


PRODUCTS - STANDARD CRUD:
-------------------------
GET    /api/products/products/               - List all products
POST   /api/products/products/               - Create new product
GET    /api/products/products/{id}/          - Get product details
PUT    /api/products/products/{id}/          - Update product (full)
PATCH  /api/products/products/{id}/          - Update product (partial)
DELETE /api/products/products/{id}/          - Delete product

PRODUCTS - CUSTOM ACTIONS:
--------------------------
GET    /api/products/products/{id}/variants/     - Get all variants for product
POST   /api/products/products/{id}/add_variant/  - Add new variant to product
GET    /api/products/products/{id}/price_range/  - Get price range for variants
GET    /api/products/products/statistics/        - Get product statistics
GET    /api/products/products/catalog/           - Get complete product catalog


PRODUCT VARIANTS - STANDARD CRUD:
---------------------------------
GET    /api/products/variants/               - List all variants
POST   /api/products/variants/               - Create new variant
GET    /api/products/variants/{id}/          - Get variant details
PUT    /api/products/variants/{id}/          - Update variant (full)
PATCH  /api/products/variants/{id}/          - Update variant (partial)
DELETE /api/products/variants/{id}/          - Delete variant

PRODUCT VARIANTS - PRICE MANAGEMENT:
------------------------------------
PATCH  /api/products/variants/{id}/update_price/  - Update price with reason
GET    /api/products/variants/{id}/price_history/ - Get price history for variant

PRODUCT VARIANTS - CUSTOM ACTIONS:
----------------------------------
GET    /api/products/variants/by_type/?type=DOMESTIC          - Get variants by type
GET    /api/products/variants/by_product/?product_id=1        - Get variants by product
GET    /api/products/variants/search_by_size/?min_size=10&max_size=20  - Search by size
GET    /api/products/variants/search_by_price/?min_price=500&max_price=1000  - Search by price
GET    /api/products/variants/statistics/                     - Get variant statistics
POST   /api/products/variants/bulk_create/                    - Bulk create variants


PRICE HISTORY - READ ONLY:
--------------------------
GET    /api/products/price-history/                    - List all price changes
GET    /api/products/price-history/{id}/              - Get price change details
GET    /api/products/price-history/recent/            - Get recent price changes
GET    /api/products/price-history/by_variant/?variant_id=1  - Get history for variant


==============================================================================
USAGE EXAMPLES
==============================================================================

1. CREATE A UNIT:
   POST /api/products/units/
   {
     "short_name": "kg",
     "description": "Kilogram"
   }

2. CREATE A PRODUCT:
   POST /api/products/products/
   {
     "name": "LPG Gas Cylinder",
     "description": "Liquefied Petroleum Gas cylinders for domestic and commercial use"
   }

3. CREATE A PRODUCT VARIANT WITH PRICE:
   POST /api/products/variants/
   {
     "product_code": "LPG-14.2-DOM",
     "name": "14.2 kg Domestic LPG",
     "product": 1,
     "unit": 1,
     "size": 14.2,
     "variant_type": "DOMESTIC",
     "price": 850.00
   }

4. UPDATE VARIANT PRICE WITH REASON:
   PATCH /api/products/variants/1/update_price/
   {
     "price": 900.00,
     "reason": "Seasonal price increase",
     "notes": "Increased due to high demand"
   }

5. GET PRICE HISTORY FOR VARIANT:
   GET /api/products/variants/1/price_history/

6. GET PRICE RANGE FOR PRODUCT:
   GET /api/products/products/1/price_range/

7. SEARCH VARIANTS BY PRICE:
   GET /api/products/variants/search_by_price/?min_price=500&max_price=1000

8. GET RECENT PRICE CHANGES:
   GET /api/products/price-history/recent/

9. GET PRODUCT CATALOG WITH PRICES:
   GET /api/products/products/catalog/

10. GET STATISTICS WITH PRICE ANALYSIS:
    GET /api/products/products/statistics/
    GET /api/products/variants/statistics/


==============================================================================
PRICE MANAGEMENT WORKFLOW
==============================================================================

SCENARIO 1: Create new variant with initial price
--------------------------------------------------
POST /api/products/variants/
{
  "product_code": "LPG-14.2-DOM",
  "name": "14.2 kg Domestic",
  "product": 1,
  "unit": 1,
  "size": 14.2,
  "variant_type": "DOMESTIC",
  "price": 850.00
}
→ Creates variant
→ Automatically creates price history record (reason: "Initial price")


SCENARIO 2: Update variant price
---------------------------------
PATCH /api/products/variants/1/update_price/
{
  "price": 900.00,
  "reason": "Seasonal increase"
}
→ Updates variant price
→ Automatically creates price history record with old and new prices
→ Calculates price change and percentage


SCENARIO 3: View price history
-------------------------------
GET /api/products/variants/1/price_history/
→ Returns all price changes for this variant
→ Includes old price, new price, change amount, percentage, date, reason


SCENARIO 4: Monitor recent price changes
-----------------------------------------
GET /api/products/price-history/recent/
→ Returns last 50 price changes across all variants


==============================================================================
RESPONSE EXAMPLES
==============================================================================

VARIANT WITH PRICE:
{
  "id": 1,
  "product_code": "LPG-14.2-DOM",
  "name": "14.2 kg Domestic LPG",
  "product": 1,
  "product_name": "LPG Gas Cylinder",
  "size": "14.20",
  "unit": 1,
  "unit_name": "kg",
  "variant_type": "DOMESTIC",
  "variant_type_display": "Domestic",
  "price": "850.00"
}

PRICE HISTORY:
{
  "variant_id": 1,
  "variant_name": "14.2 kg Domestic LPG",
  "current_price": "900.00",
  "total_changes": 3,
  "history": [
    {
      "id": 3,
      "old_price": "850.00",
      "new_price": "900.00",
      "price_change": "50.00",
      "price_change_percentage": "5.88",
      "effective_date": "2025-10-25T10:30:00Z",
      "reason": "Seasonal increase"
    },
    {
      "id": 2,
      "old_price": "800.00",
      "new_price": "850.00",
      "price_change": "50.00",
      "price_change_percentage": "6.25",
      "effective_date": "2025-09-15T09:00:00Z",
      "reason": "Regular price adjustment"
    },
    {
      "id": 1,
      "old_price": null,
      "new_price": "800.00",
      "price_change": "800.00",
      "price_change_percentage": null,
      "effective_date": "2025-08-01T08:00:00Z",
      "reason": "Initial price"
    }
  ]
}

PRICE RANGE:
{
  "product_id": 1,
  "product_name": "LPG Gas Cylinder",
  "total_variants": 4,
  "min_price": "450.00",
  "max_price": "3500.00",
  "avg_price": "1312.50"
}

STATISTICS WITH PRICE:
{
  "total_products": 5,
  "total_variants": 25,
  "variants_by_type": {
    "Domestic": 15,
    "Commercial": 8,
    "Industrial": 2
  },
  "price_statistics": {
    "overall": {
      "min_price": "450.00",
      "max_price": "3500.00",
      "avg_price": "1125.50"
    },
    "by_type": {
      "Domestic": "775.00",
      "Commercial": "1650.00",
      "Industrial": "3250.00"
    }
  }
}
"""