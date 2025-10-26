# ==============================================================================
# FILE: route/urls.py
# STEP 4: RouteArea URLs Configuration
# ==============================================================================

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RouteViewSet, RouteAreaViewSet

# Create router
router = DefaultRouter()

# Register viewsets
router.register(r'routes', RouteViewSet, basename='route')
router.register(r'route-areas', RouteAreaViewSet, basename='routearea')

urlpatterns = [
    path('', include(router.urls)),
]


# ==============================================================================
# COMPLETE API ENDPOINTS AVAILABLE:
# ==============================================================================

"""
ROUTE AREAS - STANDARD CRUD:
-----------------------------
GET    /api/route-areas/                  - List all areas
POST   /api/route-areas/                  - Create new area
GET    /api/route-areas/{id}/             - Get area details
PUT    /api/route-areas/{id}/             - Update area (full)
PATCH  /api/route-areas/{id}/             - Update area (partial)
DELETE /api/route-areas/{id}/             - Delete area


ROUTE AREAS - FILTERING (on list endpoint):
--------------------------------------------
GET /api/route-areas/                     - All areas (default)
GET /api/route-areas/?assigned=true       - Only assigned areas
GET /api/route-areas/?assigned=false      - Only unassigned areas
GET /api/route-areas/?route=1             - Areas for specific route
GET /api/route-areas/?search=jagtial      - Search by area name


ROUTE AREAS - CUSTOM ACTIONS:
------------------------------
POST   /api/route-areas/bulk_create/              - Create multiple areas
DELETE /api/route-areas/bulk_delete/              - Delete multiple areas
POST   /api/route-areas/{id}/assign_to_route/     - Assign area to route
POST   /api/route-areas/{id}/unassign_from_route/ - Unassign area from route
GET    /api/route-areas/statistics/               - Get area statistics


USAGE EXAMPLES:
===============

1. Get all areas (assigned + unassigned):
   GET /api/route-areas/

2. Get only assigned areas:
   GET /api/route-areas/?assigned=true

3. Get only unassigned areas:
   GET /api/route-areas/?assigned=false

4. Get areas for specific route:
   GET /api/route-areas/?route=1

5. Search areas by name:
   GET /api/route-areas/?search=jagtial

6. Create single area with route:
   POST /api/route-areas/
   {
     "area_name": "Jagtial",
     "route": 1
   }

7. Create single area without route (unassigned):
   POST /api/route-areas/
   {
     "area_name": "New Area"
   }

8. Bulk create multiple areas:
   POST /api/route-areas/bulk_create/
   {
     "route": 1,
     "area_names": ["Area 1", "Area 2", "Area 3"]
   }

9. Update area (assign to different route):
   PATCH /api/route-areas/5/
   {
     "route": 2
   }

10. Update area (make unassigned):
    PATCH /api/route-areas/5/
    {
      "route": null
    }

11. Assign unassigned area to route:
    POST /api/route-areas/5/assign_to_route/
    {
      "route": 1
    }

12. Unassign area from route:
    POST /api/route-areas/5/unassign_from_route/

13. Bulk delete areas:
    DELETE /api/route-areas/bulk_delete/
    {
      "area_ids": [1, 2, 3, 4]
    }

14. Get statistics:
    GET /api/route-areas/statistics/
"""