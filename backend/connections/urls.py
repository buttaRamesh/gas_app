# File: connections/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from connections.api.views import ConnectionDetailsViewSet

router = DefaultRouter()
router.register(r'connections', ConnectionDetailsViewSet, basename='connection')

urlpatterns = [
    path('', include(router.urls)),
]

"""
This creates the following endpoints:

Standard CRUD:
- GET    /api/connections/              - List all connections (paginated)
- POST   /api/connections/              - Create new connection
- GET    /api/connections/{id}/         - Get connection details
- PUT    /api/connections/{id}/         - Update connection (full)
- PATCH  /api/connections/{id}/         - Update connection (partial)
- DELETE /api/connections/{id}/         - Delete connection

Custom Actions:
- GET    /api/connections/by-consumer/{consumer_id}/  - Get connections by consumer
- GET    /api/connections/by_connection_type/?connection_type=1 - Get by type
- GET    /api/connections/statistics/                 - Get connection statistics

Filtering & Search:
- GET /api/connections/?consumer=1                    - Filter by consumer
- GET /api/connections/?connection_type=2             - Filter by connection type
- GET /api/connections/?product=3                     - Filter by product
- GET /api/connections/?search=SV001                  - Search by service number/consumer
- GET /api/connections/?ordering=sv_date              - Order by date
- GET /api/connections/?page=2                        - Pagination

Combined:
- GET /api/connections/?consumer=1&connection_type=2&search=SV&page=1
"""
