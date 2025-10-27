# File: address/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AddressViewSet, ContactViewSet, get_content_types

router = DefaultRouter()
router.register(r'addresses', AddressViewSet, basename='address')
router.register(r'contacts', ContactViewSet, basename='contact')

urlpatterns = [
    path('', include(router.urls)),
    path('content-types/', get_content_types, name='content-types'),
]

"""
This creates the following endpoints:

Address Endpoints:
- GET    /api/addresses/                      - List all addresses (paginated)
- POST   /api/addresses/                      - Create new address
- GET    /api/addresses/{id}/                 - Get address details
- PUT    /api/addresses/{id}/                 - Update address (full)
- PATCH  /api/addresses/{id}/                 - Update address (partial)
- DELETE /api/addresses/{id}/                 - Delete address
- GET    /api/addresses/statistics/           - Get address statistics

Contact Endpoints:
- GET    /api/contacts/                       - List all contacts (paginated)
- POST   /api/contacts/                       - Create new contact
- GET    /api/contacts/{id}/                  - Get contact details
- PUT    /api/contacts/{id}/                  - Update contact (full)
- PATCH  /api/contacts/{id}/                  - Update contact (partial)
- DELETE /api/contacts/{id}/                  - Delete contact
- GET    /api/contacts/statistics/            - Get contact statistics

Filtering & Search (Addresses):
- GET /api/addresses/?city_town_village=Mumbai           - Filter by city
- GET /api/addresses/?district=Mumbai                     - Filter by district
- GET /api/addresses/?pin_code=400001                     - Filter by pin code
- GET /api/addresses/?content_type=1                      - Filter by content type
- GET /api/addresses/?content_type_model=consumer         - Filter by content type model
- GET /api/addresses/?object_id=123                       - Filter by related object ID
- GET /api/addresses/?search=street                       - Search in address fields
- GET /api/addresses/?ordering=city_town_village          - Order by city
- GET /api/addresses/?page=2                              - Pagination

Filtering & Search (Contacts):
- GET /api/contacts/?content_type=1                       - Filter by content type
- GET /api/contacts/?content_type_model=consumer          - Filter by content type model
- GET /api/contacts/?object_id=123                        - Filter by related object ID
- GET /api/contacts/?search=email@example.com             - Search in contact fields
- GET /api/contacts/?ordering=email                       - Order by email
- GET /api/contacts/?page=2                               - Pagination

Combined:
- GET /api/addresses/?city_town_village=Mumbai&search=lane&page=1
- GET /api/contacts/?content_type_model=consumer&search=9876543210
"""
