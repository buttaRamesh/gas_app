from django.urls import path, include
from rest_framework.routers import DefaultRouter

from inventory.api.views import (
    ProductViewSet,
    ProductCategoryViewSet,
    UnitViewSet,
    InvoiceViewSet,
    InventoryTransactionViewSet,
    InventoryStockSummaryViewSet,
    ProductMovementViewSet,
    BucketMovementViewSet,
    MonthlyClosingViewSet,
    InventoryDashboardViewSet,
    DeliveryReconcileViewSet,
    DSRViewSet,
    ProductPriceViewSet
)

router = DefaultRouter()

# Master
router.register("products", ProductViewSet, basename="products")
router.register("categories", ProductCategoryViewSet, basename="inventory-categories")
router.register("units", UnitViewSet, basename="inventory-units")
router.register("prices", ProductPriceViewSet, basename="inventory-prices")

# Transactions / Ledger
router.register("ledger", InventoryTransactionViewSet, basename="inventory-ledger")

# Summary
router.register("summary", InventoryStockSummaryViewSet, basename="inventory-summary")

# DSR Report
router.register("dsr", DSRViewSet, basename="inventory-dsr")

# Movement reports
router.register("movement", ProductMovementViewSet, basename="inventory-movement")
router.register("bucket-movement", BucketMovementViewSet, basename="inventory-bucket-movement")

# Monthly closing
router.register("monthly-closing", MonthlyClosingViewSet, basename="inventory-monthly-closing")

# Dashboard
router.register("dashboard", InventoryDashboardViewSet, basename="inventory-dashboard")

# Reconciliation
router.register("reconcile", DeliveryReconcileViewSet, basename="inventory-reconcile")


urlpatterns = [
    path("", include(router.urls)),
]
