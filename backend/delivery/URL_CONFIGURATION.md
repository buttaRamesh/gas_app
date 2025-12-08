# Delivery App URL Configuration

## Structure

The delivery app uses a two-level URL configuration:

```
delivery/
├── urls.py                 # Main entry point (delegates to api/urls.py)
└── api/
    └── urls.py            # Actual route definitions
```

## How It Works

### 1. Project-Level Integration (core/urls.py)
```python
path('api/', include('delivery.urls'))
```

### 2. App-Level Delegation (delivery/urls.py)
```python
urlpatterns = [
    path('', include('delivery.api.urls')),
]
```

### 3. API-Level Routes (delivery/api/urls.py)
Defines all actual viewset registrations and custom endpoints.

## Available Endpoints

### Standard CRUD Endpoints (via Router)

**Delivery Person:**
- `GET    /api/delivery-person/` - List all delivery persons
- `POST   /api/delivery-person/` - Create new delivery person
- `GET    /api/delivery-person/{id}/` - Get delivery person details
- `PUT    /api/delivery-person/{id}/` - Update delivery person (full)
- `PATCH  /api/delivery-person/{id}/` - Update delivery person (partial)
- `DELETE /api/delivery-person/{id}/` - Delete delivery person

**Delivery Run:**
- `GET    /api/delivery-run/` - List all delivery runs
- `POST   /api/delivery-run/` - Create new delivery run
- `GET    /api/delivery-run/{id}/` - Get delivery run details
- `PUT    /api/delivery-run/{id}/` - Update delivery run (full)
- `PATCH  /api/delivery-run/{id}/` - Update delivery run (partial)
- `DELETE /api/delivery-run/{id}/` - Delete delivery run

**Delivery Record:**
- `GET    /api/delivery-record/` - List all delivery records
- `POST   /api/delivery-record/` - Create new delivery record
- `GET    /api/delivery-record/{id}/` - Get delivery record details
- `PUT    /api/delivery-record/{id}/` - Update delivery record (full)
- `PATCH  /api/delivery-record/{id}/` - Update delivery record (partial)
- `DELETE /api/delivery-record/{id}/` - Delete delivery record

### Custom Endpoints

**Delivery Load (Nested):**
- `GET    /api/delivery-run/{run_id}/load/` - List loads for a specific run
- `POST   /api/delivery-run/{run_id}/load/` - Create load for a specific run

**Delivery Reconcile:**
- `GET    /api/delivery-reconcile/` - Get reconciliation data

**Delivery Summary:**
- `GET    /api/delivery-summary/` - Get delivery summary

## Registered ViewSets

1. **DeliveryPersonViewSet** → `/api/delivery-person/`
2. **DeliveryRunViewSet** → `/api/delivery-run/`
3. **DeliveryRecordViewSet** → `/api/delivery-record/`
4. **DeliveryLoadViewSet** → Custom nested endpoint
5. **DeliveryReconcileViewSet** → Custom endpoint
6. **DeliverySummaryViewSet** → Custom endpoint

## File Updates Made

### 1. delivery/api/views/__init__.py
Updated to properly export all 6 viewsets:
```python
from .delivery_person_viewset import DeliveryPersonViewSet
from .load_viewset import DeliveryLoadViewSet
from .reconcile_viewset import DeliveryReconcileViewSet
from .record_viewset import DeliveryRecordViewSet
from .run_viewset import DeliveryRunViewSet
from .summary_viewset import DeliverySummaryViewSet
```

### 2. delivery/api/urls.py
Updated to:
- Import all viewsets from `delivery.api.views`
- Register 3 main viewsets with router
- Define 3 custom endpoint patterns

### 3. delivery/urls.py
Simplified to delegate to `delivery.api.urls`:
```python
urlpatterns = [
    path('', include('delivery.api.urls')),
]
```

## Testing

All imports verified:
```bash
cd backend && python -c "import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.dev'); import django; django.setup(); from delivery import urls; print('SUCCESS')"
```

Routes verified:
- 3 viewsets registered with router
- 3 custom URL patterns defined
- All imports working correctly
