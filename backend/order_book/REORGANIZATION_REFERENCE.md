# Order_Book Reorganization Reference

## What Was Done
The monolithic files were split into organized structure on 2025-12-01.

## Original File Locations (DELETED)
- `models.py` → Split into `models/` folder
- `serializers.py` → Split into `serializers/` folder  
- `views.py` → Split into `views/` folder

## Code Distribution Map

### Models (models.py → models/)
- **lookups.py**: RefillType, DeliveryFlag, PaymentOption
- **mappings.py**: FieldConfiguration, ColumnMapping, UPLOAD_TYPE_CHOICES, FILE_FORMAT_CHOICES
- **order.py**: OrderBook (main model)
- **payment.py**: PaymentInfo
- **upload_config.py**: BulkUploadHistory

### Serializers (serializers.py → serializers/)
- **lookups_serializers.py**: RefillTypeSerializer, DeliveryFlagSerializer, PaymentOptionSerializer
- **mapping_serializers.py**: FieldConfigurationSerializer, ColumnMappingSerializer
- **payment_serializers.py**: PaymentInfoSerializer
- **order_serializers.py**: OrderBookListSerializer, OrderBookDetailSerializer, OrderBookWriteSerializer, MarkDeliveredSerializer
- **upload_serializers.py**: BulkUploadSerializer, BulkUploadHistoryCreateSerializer, BulkUploadHistorySerializer

### Views (views.py → views/)
- **lookups_viewset.py**: RefillTypeViewSet, DeliveryFlagViewSet, PaymentOptionViewSet
- **mapping_viewset.py**: ColumnMappingViewSet, FieldConfigurationViewSet
- **order_viewset.py**: OrderBookViewSet (the large 1500+ line viewset with all custom actions)

## How to Find Code Now

### Looking for a Model?
1. Check `models/__init__.py` for exports
2. Models are in `models/` folder by category:
   - Lookups → `lookups.py`
   - Configuration → `mappings.py`
   - Core → `order.py`
   - Related → `payment.py`, `upload_config.py`

### Looking for a Serializer?
1. Check `serializers/__init__.py` for exports
2. Serializers follow their model names:
   - RefillType → `lookups_serializers.py`
   - OrderBook → `order_serializers.py`
   - PaymentInfo → `payment_serializers.py`
   - etc.

### Looking for a ViewSet?
1. Check `views/__init__.py` for exports
2. ViewSets follow their model names:
   - RefillType → `lookups_viewset.py`
   - OrderBook → `order_viewset.py`
   - etc.

## Import Updates Made
- `from consumers.models import Person` → `from commons.models import Person`
- `from address.models import Contact` → `from commons.models import Contact`

## Verification
All imports tested and working:
```bash
cd backend && python -c "import os; os.environ['DJANGO_SETTINGS_MODULE']='core.settings.dev'; import django; django.setup(); from order_book import urls; print('SUCCESS')"
```

## Emergency Recovery
If you need the original monolithic code:
1. Check git history: `git log --all -- order_book/models.py`
2. Restore from git: `git show <commit>:order_book/models.py`
3. Or reconstruct by combining files from organized folders

## Structure Comparison

### Before:
```
order_book/
├── models.py (369 lines - ALL models)
├── serializers.py (442 lines - ALL serializers)
├── views.py (1590 lines - ALL views)
└── urls.py
```

### After:
```
order_book/
├── models/
│   ├── __init__.py
│   ├── lookups.py
│   ├── mappings.py
│   ├── order.py
│   ├── payment.py
│   └── upload_config.py
├── serializers/
│   ├── __init__.py
│   ├── lookups_serializers.py
│   ├── mapping_serializers.py
│   ├── order_serializers.py
│   ├── payment_serializers.py
│   └── upload_serializers.py
├── views/
│   ├── __init__.py
│   ├── lookups_viewset.py
│   ├── mapping_viewset.py
│   └── order_viewset.py
└── urls.py
```
