from django.urls import path
from rest_framework.routers import DefaultRouter
from delivery.api.views import (
    DeliveryPersonViewSet,
    DeliveryRunViewSet,
    DeliveryLoadViewSet,
    DeliveryRecordViewSet,
    DeliveryReconcileViewSet,
    DeliverySummaryViewSet,
)

router = DefaultRouter()
router.register("delivery-persons", DeliveryPersonViewSet, basename="delivery-person")
router.register("delivery-run", DeliveryRunViewSet, basename="delivery-run")
router.register("delivery-record", DeliveryRecordViewSet, basename="delivery-record")

# Nested custom endpoint for loads
delivery_load_view = DeliveryLoadViewSet.as_view({
    "get": "list",
    "post": "create",
})

# ViewSet endpoints for reconcile and summary
delivery_reconcile_view = DeliveryReconcileViewSet.as_view({
    "get": "list",
    "post": "create",
})

delivery_summary_view = DeliverySummaryViewSet.as_view({
    "get": "list",
    "post": "create",
})

urlpatterns = [
    path("delivery-run/<int:run_id>/load/", delivery_load_view, name="delivery-run-load"),
    path("delivery-reconcile/", delivery_reconcile_view, name="delivery-reconcile"),
    path("delivery-summary/", delivery_summary_view, name="delivery-summary"),
]

urlpatterns += router.urls


"""
================================================================================
DELIVERY APP API ENDPOINTS DOCUMENTATION
================================================================================

BASE URL: /api/
All endpoints are prefixed with /api/ at the project level.

================================================================================
1. DELIVERY PERSON ENDPOINTS
================================================================================

Resource: Delivery Person
URL Prefix: /api/delivery-person/
ViewSet: DeliveryPersonViewSet
Type: ModelViewSet (Full CRUD)

Standard CRUD Operations:
--------------------------
GET    /api/delivery-person/           List all delivery persons
                                        - Supports pagination (global settings)
                                        - Supports search: ?search=<name>
                                        - Supports ordering: ?ordering=id,-person__full_name
                                        - Serializer: DeliveryPersonListSerializer

POST   /api/delivery-person/           Create new delivery person
                                        - Serializer: DeliveryPersonCreateUpdateSerializer
                                        - Required fields: person details

GET    /api/delivery-person/{id}/      Get delivery person details
                                        - Serializer: DeliveryPersonDetailSerializer
                                        - Includes: person info, contacts, addresses, routes

PUT    /api/delivery-person/{id}/      Update delivery person (full)
                                        - Serializer: DeliveryPersonCreateUpdateSerializer
                                        - All fields required

PATCH  /api/delivery-person/{id}/      Update delivery person (partial)
                                        - Serializer: DeliveryPersonCreateUpdateSerializer
                                        - Only changed fields required

DELETE /api/delivery-person/{id}/      Delete delivery person
                                        - Returns: 204 No Content


================================================================================
2. DELIVERY RUN ENDPOINTS
================================================================================

Resource: Delivery Run
URL Prefix: /api/delivery-run/
ViewSet: DeliveryRunViewSet
Type: ModelViewSet (Full CRUD)

Standard CRUD Operations:
--------------------------
GET    /api/delivery-run/              List all delivery runs
                                        - Ordered by: -run_date, -id
                                        - Serializer: DeliveryRunSerializer

POST   /api/delivery-run/              Create new delivery run
                                        - Serializer: DeliveryRunCreateSerializer
                                        - Business logic: Auto-assigns routes
                                        - Response includes: run_id, delivery_person,
                                          run_date, status, auto_routes_added

GET    /api/delivery-run/{id}/         Get delivery run details
                                        - Serializer: DeliveryRunSerializer

PUT    /api/delivery-run/{id}/         Update delivery run (full)
                                        - Serializer: DeliveryRunSerializer

PATCH  /api/delivery-run/{id}/         Update delivery run (partial)
                                        - Serializer: DeliveryRunSerializer

DELETE /api/delivery-run/{id}/         Delete delivery run
                                        - Returns: 204 No Content


================================================================================
3. DELIVERY RECORD ENDPOINTS
================================================================================

Resource: Delivery Record
URL Prefix: /api/delivery-record/
ViewSet: DeliveryRecordViewSet
Type: ModelViewSet (Full CRUD)

Standard CRUD Operations:
--------------------------
GET    /api/delivery-record/           List all delivery records
                                        - Ordered by: -created_at
                                        - Serializer: DeliveryRecordReadSerializer

POST   /api/delivery-record/           Create new delivery record
                                        - Serializer: DeliveryRecordCreateSerializer
                                        - Requires: run context (if nested)
                                        - Response includes: record_id, run_id, status

GET    /api/delivery-record/{id}/      Get delivery record details
                                        - Serializer: DeliveryRecordReadSerializer

PUT    /api/delivery-record/{id}/      Update delivery record (full)
                                        - Serializer: DeliveryRecordCreateSerializer

PATCH  /api/delivery-record/{id}/      Update delivery record (partial)
                                        - Serializer: DeliveryRecordCreateSerializer

DELETE /api/delivery-record/{id}/      Delete delivery record
                                        - Returns: 204 No Content


================================================================================
4. DELIVERY LOAD ENDPOINTS (Nested Resource)
================================================================================

Resource: Delivery Load (nested under Delivery Run)
URL Pattern: /api/delivery-run/<run_id>/load/
ViewSet: DeliveryLoadViewSet
Type: GenericViewSet (List, Create only)

Operations:
-----------
GET    /api/delivery-run/<run_id>/load/    List loads for specific run
                                            - Ordered by: load_number
                                            - Serializer: DeliveryLoadCreateSerializer
                                            - Filters by run_id automatically

POST   /api/delivery-run/<run_id>/load/    Create load for specific run
                                            - Serializer: DeliveryLoadCreateSerializer
                                            - Business logic: Auto-assigns load number
                                            - Response includes: run_id, load_id,
                                              load_number, product_id, quantity

Example Usage:
--------------
GET  /api/delivery-run/5/load/             # List all loads for run #5
POST /api/delivery-run/5/load/             # Create new load for run #5
{
    "product": 1,
    "quantity": 100
}


================================================================================
5. DELIVERY RECONCILE ENDPOINTS
================================================================================

Resource: Delivery Reconciliation
URL Pattern: /api/delivery-reconcile/
ViewSet: DeliveryReconcileViewSet
Type: ViewSet (Custom actions only)

Operations:
-----------
GET    /api/delivery-reconcile/            Get reconciliation data
                                            - Action: get_reconciliation_data
                                            - Shows variances between expected and actual
                                            - Serializer: ReconcileResponseSerializer
                                            - Does NOT auto-adjust inventory

Note: This endpoint is typically accessed via a nested route like:
      /api/delivery-run/<run_id>/reconcile/ (configured at project level if needed)


================================================================================
6. DELIVERY SUMMARY ENDPOINTS
================================================================================

Resource: Delivery Summary
URL Pattern: /api/delivery-summary/
ViewSet: DeliverySummaryViewSet
Type: ViewSet (Custom actions only)

Operations:
-----------
GET    /api/delivery-summary/              Get delivery summary
                                            - Action: get_summary
                                            - Returns empty list if no summary exists
                                            - Serializer: DeliverySummaryReadSerializer

POST   /api/delivery-summary/              Create delivery summary
                                            - Serializer: DeliverySummaryCreateSerializer
                                            - Business logic: Aggregates delivery data

Note: This endpoint is typically accessed via a nested route like:
      /api/delivery-run/<run_id>/summary/ (configured at project level if needed)


================================================================================
FILTERING, SEARCH & ORDERING
================================================================================

Delivery Person:
----------------
Search:     ?search=<name>
            Searches in: person__full_name, person__first_name, person__last_name

Ordering:   ?ordering=<field>
            Available fields: id, person__full_name
            Default: id (ascending)
            Example: ?ordering=-person__full_name (descending)

Pagination: Handled globally via REST_FRAMEWORK settings


================================================================================
PERMISSIONS
================================================================================

All endpoints require:
- IsAuthenticated: User must be logged in
- HasResourcePermission: User must have permission for 'delivery' resource


================================================================================
RESPONSE FORMATS
================================================================================

Success Responses:
------------------
200 OK              - Successful GET request
201 Created         - Successful POST request (creation)
204 No Content      - Successful DELETE request

Error Responses:
----------------
400 Bad Request     - Invalid request data
401 Unauthorized    - User not authenticated
403 Forbidden       - User lacks permission
404 Not Found       - Resource not found
500 Server Error    - Internal server error


================================================================================
EXAMPLE WORKFLOWS
================================================================================

1. Create Delivery Run with Loads:
-----------------------------------
Step 1: Create delivery run
POST /api/delivery-run/
{
    "delivery_person": 1,
    "run_date": "2025-12-01"
}
Response: { "run_id": 5, ... }

Step 2: Add loads to run
POST /api/delivery-run/5/load/
{
    "product": 1,
    "quantity": 100
}

Step 3: View all loads
GET /api/delivery-run/5/load/


2. Reconcile Delivery Run:
---------------------------
Step 1: View variances
GET /api/delivery-reconcile/
(or /api/delivery-run/<run_id>/reconcile/)

Step 2: Review reconciliation data
Response shows expected vs actual quantities

Step 3: Create summary
POST /api/delivery-summary/
{
    "run": 5,
    "summary_data": {...}
}


================================================================================
NOTES
================================================================================

- All timestamps are in UTC
- All date fields use ISO 8601 format (YYYY-MM-DD)
- Business logic is encapsulated in serializers and services
- ViewSets contain minimal logic (presentation layer only)
- Nested resources (load, reconcile, summary) require run_id context

================================================================================
"""
