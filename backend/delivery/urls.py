# File: delivery/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DeliveryPersonViewSet, DeliveryRouteAssignmentViewSet

router = DefaultRouter()
router.register(r'delivery-persons', DeliveryPersonViewSet, basename='deliveryperson')
router.register(r'delivery-route-assignments', DeliveryRouteAssignmentViewSet, basename='deliveryrouteassignment')

urlpatterns = [
    path('', include(router.urls)),
]

"""
This creates the following endpoints:

DELIVERY PERSONS - Standard CRUD:
- GET    /api/delivery-persons/              - List all delivery persons
- POST   /api/delivery-persons/              - Create new delivery person
- GET    /api/delivery-persons/{id}/         - Get delivery person details
- PUT    /api/delivery-persons/{id}/         - Update delivery person (full)
- PATCH  /api/delivery-persons/{id}/         - Update delivery person (partial)
- DELETE /api/delivery-persons/{id}/         - Delete delivery person

DELIVERY PERSONS - Custom Actions:
- GET    /api/delivery-persons/{id}/assigned_routes/ - Get routes assigned to person
- GET    /api/delivery-persons/{id}/consumers/       - Get all consumers in person's routes
- GET    /api/delivery-persons/unassigned/           - Get persons without routes
- GET    /api/delivery-persons/statistics/           - Get delivery statistics

ROUTE ASSIGNMENTS - Standard CRUD:
- GET    /api/delivery-route-assignments/    - List all assignments
- POST   /api/delivery-route-assignments/    - Create new assignment
- GET    /api/delivery-route-assignments/{route_id}/ - Get assignment details
- PUT    /api/delivery-route-assignments/{route_id}/ - Update assignment
- PATCH  /api/delivery-route-assignments/{route_id}/ - Partial update
- DELETE /api/delivery-route-assignments/{route_id}/ - Delete assignment

ROUTE ASSIGNMENTS - Custom Actions:
- POST   /api/delivery-route-assignments/bulk_assign/   - Assign multiple routes at once
- POST   /api/delivery-route-assignments/reassign/      - Reassign route to different person
- DELETE /api/delivery-route-assignments/unassign_route/ - Unassign route

Filtering & Search:
- GET /api/delivery-persons/?search=John              - Search by name/mobile
- GET /api/delivery-persons/?ordering=name            - Order by name
- GET /api/delivery-route-assignments/?delivery_person=1  - Filter by person
- GET /api/delivery-route-assignments/?route=1            - Filter by route

Example Usage:

# Create delivery person
POST /api/delivery-persons/
{
  "name": "Ramesh Kumar"
}

# Assign single route
POST /api/delivery-route-assignments/
{
  "route": 1,
  "delivery_person": 1
}

# Bulk assign routes
POST /api/delivery-route-assignments/bulk_assign/
{
  "delivery_person": 1,
  "routes": [1, 2, 3, 4, 5]
}

# Reassign route
POST /api/delivery-route-assignments/reassign/
{
  "route": 1,
  "new_delivery_person": 2
}

# Get all routes for a delivery person
GET /api/delivery-persons/1/assigned_routes/

# Get all consumers for a delivery person
GET /api/delivery-persons/1/consumers/

# Unassign a route
DELETE /api/delivery-route-assignments/unassign_route/?route=1

# Get statistics
GET /api/delivery-persons/statistics/
"""