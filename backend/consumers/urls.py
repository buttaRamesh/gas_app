# File: consumers/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConsumerViewSet

router = DefaultRouter()
router.register(r'consumers', ConsumerViewSet, basename='consumer')

urlpatterns = [
    path('', include(router.urls)),
]

"""
This creates the following endpoints:

Standard CRUD:
- GET    /api/consumers/              - List all consumers (paginated)
- POST   /api/consumers/              - Create new consumer
- GET    /api/consumers/{id}/         - Get consumer details
- PUT    /api/consumers/{id}/         - Update consumer (full)
- PATCH  /api/consumers/{id}/         - Update consumer (partial)
- DELETE /api/consumers/{id}/         - Delete consumer

Custom Actions:
- GET    /api/consumers/kyc_pending/              - Get KYC pending consumers
- GET    /api/consumers/by_route/?route_code=R001 - Get consumers by route
- GET    /api/consumers/{id}/route/               - Get consumer's route
- PATCH  /api/consumers/{id}/update_kyc_status/   - Update KYC status only
- GET    /api/consumers/statistics/               - Get consumer statistics

Filtering & Search:
- GET /api/consumers/?category=1                  - Filter by category
- GET /api/consumers/?consumer_type=2             - Filter by type
- GET /api/consumers/?opting_status=OPT_IN        - Filter by opting status
- GET /api/consumers/?is_kyc_done=true            - Filter by KYC status
- GET /api/consumers/?search=John                 - Search by name/number
- GET /api/consumers/?ordering=consumer_name      - Order by name
- GET /api/consumers/?page=2                      - Pagination

Combined:
- GET /api/consumers/?category=1&is_kyc_done=false&search=John&page=1
"""