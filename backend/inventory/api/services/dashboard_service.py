from datetime import datetime, timedelta
from django.db.models import Sum, Q
from inventory.models import (
    Inventory,
    InventoryTransaction,
    Product,
    InventoryBucket,
    InventoryState,
)
from django.conf import settings


class InventoryDashboardService:
    """
    Returns a dict structure ready to be serialized by InventoryDashboardSerializer.
    """

    @staticmethod
    def get_date_from_query(date_str):
        if date_str:
            return datetime.strptime(date_str, "%Y-%m-%d").date()
        return datetime.today().date()

    @staticmethod
    def total_stock_by_product(limit_products=None):
        """
        Returns list of dicts: product_id, product_name, bucket, state, quantity
        (flattened Inventory table)
        """
        qs = Inventory.objects.select_related("product", "bucket", "state")
        if limit_products:
            qs = qs.filter(product__id__in=limit_products)

        rows = []
        for inv in qs:
            rows.append({
                "product_id": inv.product.id,
                "product_name": getattr(inv.product, "product_name", str(inv.product)),
                "bucket": inv.bucket.code if inv.bucket else None,
                "state": inv.state.code if inv.state else None,
                "quantity": inv.quantity or 0,
            })
        return rows

    @staticmethod
    def today_receipts(date):
        """
        Sum of INVOICE transactions to GODOWN (by state) for given date.
        Return total count and qty.
        """
        txns = InventoryTransaction.objects.filter(
            txn_type="INVOICE",
            created_at__date=date
        )
        qty_sum = txns.aggregate(total=Sum("quantity"))["total"] or 0
        count = txns.count()
        return {"count": count, "quantity": qty_sum}

    @staticmethod
    def today_loads_and_deliveries(date):
        """
        ASSIGN (loads assigned) and DELIVERY (delivered) summary for date.
        """
        assign_qs = InventoryTransaction.objects.filter(
            txn_type="ASSIGN",
            created_at__date=date
        )
        delivery_qs = InventoryTransaction.objects.filter(
            txn_type="DELIVERY",
            created_at__date=date
        )
        return {
            "loads_assigned_qty": assign_qs.aggregate(total=Sum("quantity"))["total"] or 0,
            "loads_assigned_count": assign_qs.count(),
            "delivered_qty": delivery_qs.aggregate(total=Sum("quantity"))["total"] or 0,
            "delivered_count": delivery_qs.count(),
        }

    @staticmethod
    def pending_empties():
        """
        Calculate pending empties:
        Strategy:
         - Sum qty_empty_not_collected from DeliveryRecord (pending empties)
         - Or compute difference between summary.empty_collected and record.empty_collected if needed.
        This assumes DeliveryRecord.qty_empty_not_collected field used for pending.
        """
        from delivery.models import DeliveryRecord
        ag = DeliveryRecord.objects.aggregate(total_pending=Sum("qty_empty_not_collected"))
        return ag["total_pending"] or 0

    @staticmethod
    def low_stock_products(threshold_map=None):
        """
        Return products where GODOWN/FULL quantity <= threshold.
        threshold_map can be dict {product_id: threshold} or a default threshold value.
        """
        DEFAULT_THRESHOLD = getattr(settings, "INVENTORY_LOW_STOCK_THRESHOLD", 50)
        # aggregate GODOWN + FULL
        state_full = InventoryState.objects.get(code="FULL")
        godown_bucket = InventoryBucket.objects.get(code="GODOWN")

        qs = Inventory.objects.filter(bucket=godown_bucket, state=state_full).select_related("product")
        low = []
        for inv in qs:
            threshold = DEFAULT_THRESHOLD
            if threshold_map and inv.product.id in threshold_map:
                threshold = threshold_map[inv.product.id]
            if inv.quantity <= threshold:
                low.append({
                    "product_id": inv.product.id,
                    "product_name": getattr(inv.product, "product_name", str(inv.product)),
                    "bucket": godown_bucket.code,
                    "state": state_full.code,
                    "quantity": inv.quantity or 0
                })
        return low

    @staticmethod
    def recent_transactions(limit=10):
        qs = InventoryTransaction.objects.select_related(
            "product", "from_bucket", "to_bucket", "from_state", "to_state"
        ).order_by("-created_at")[:limit]

        items = []
        for t in qs:
            items.append({
                "id": t.id,
                "product_id": t.product.id if t.product else None,
                "product_name": getattr(t.product, "product_name", str(t.product)),
                "quantity": t.quantity,
                "txn_type": t.txn_type,
                "reference_id": t.reference_id,
                "notes": t.notes,
                "created_at": t.created_at,
                "from_bucket": t.from_bucket.code if t.from_bucket else None,
                "to_bucket": t.to_bucket.code if t.to_bucket else None,
            })
        return items

    @staticmethod
    def top_movers(days=7, limit=5):
        """
        Top moved products by quantity in last `days` days.
        """
        since = datetime.today() - timedelta(days=days)
        qs = InventoryTransaction.objects.filter(created_at__gte=since).values("product__id", "product__product_name").annotate(total_qty=Sum("quantity")).order_by("-total_qty")[:limit]
        out = []
        for row in qs:
            out.append({
                "product_id": row["product__id"],
                "product_name": row["product__product_name"],
                "moved_qty": row["total_qty"] or 0
            })
        return out

    @staticmethod
    def generate_dashboard(date_str=None):
        date = InventoryDashboardService.get_date_from_query(date_str)

        # KPIs
        receipts = InventoryDashboardService.today_receipts(date)
        loads_deliveries = InventoryDashboardService.today_loads_and_deliveries(date)
        pending_empties = InventoryDashboardService.pending_empties()
        recent_txns = InventoryDashboardService.recent_transactions(limit=10)
        top_movers = InventoryDashboardService.top_movers(days=7, limit=5)
        stock_summary = InventoryDashboardService.total_stock_by_product()
        low_stock = InventoryDashboardService.low_stock_products()

        # KPI cards
        kpis = [
            {"key": "total_stock_items", "label": "Distinct Inventory Rows", "value": len(stock_summary)},
            {"key": "today_receipts_qty", "label": "Today Receipts (Qty)", "value": receipts["quantity"]},
            {"key": "today_loads_assigned", "label": "Loads Assigned (Qty)", "value": loads_deliveries["loads_assigned_qty"]},
            {"key": "today_delivered_qty", "label": "Today Delivered (Qty)", "value": loads_deliveries["delivered_qty"]},
            {"key": "pending_empties", "label": "Pending Empties", "value": pending_empties},
        ]

        return {
            "date": date,
            "kpis": kpis,
            "stock_summary": stock_summary,
            "low_stock": low_stock,
            "recent_txns": recent_txns,
            "top_movers": top_movers
        }
