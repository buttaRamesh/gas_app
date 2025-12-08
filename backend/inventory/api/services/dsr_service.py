from datetime import timedelta
from django.db.models import Sum

from inventory.models import (
    Inventory,
    InventoryTransaction,
    InventoryBucket,
    InventoryState,
    Product
)


class DSRService:

    @staticmethod
    def get_opening_stock(day):
        """
        Opening stock = Inventory quantities at start of the day.
        Inventory table ALWAYS represents real-time stock.
        """
        return Inventory.objects.select_related("product", "bucket", "state")

    @staticmethod
    def get_closing_stock():
        """Closing stock = Current data in Inventory table."""
        return Inventory.objects.select_related("product", "bucket", "state")

    @staticmethod
    def get_movements_for_day(day):
        """All InventoryTransaction entries for the given date."""
        return InventoryTransaction.objects.filter(
            created_at__date=day
        ).select_related("product", "from_bucket", "to_bucket", "from_state", "to_state")

    @staticmethod
    def generate_dsr(day):
        previous_day = day - timedelta(days=1)

        # Prepare dict: product_id -> metrics
        dsr = {}

        # Load products
        products = Product.objects.all()

        # Prepare empty baseline
        for p in products:
            dsr[p.id] = {
                "product_id": p.id,
                "product_name": p.product_name,

                "opening_full": 0,
                "opening_empty": 0,
                "opening_defective": 0,

                "received_full": 0,
                "received_empty": 0,
                "received_defective": 0,

                "load_assigned": 0,
                "delivered_full": 0,
                "empty_collected": 0,
                "unsold_full": 0,
                "defective_returned": 0,

                "closing_full": 0,
                "closing_empty": 0,
                "closing_defective": 0,
            }

        # -------------------------------------------
        # 1) Opening Stock = inventory state at start of day
        # -------------------------------------------
        opening = Inventory.objects.filter().select_related(
            "product", "bucket", "state"
        )
        for inv in opening:
            row = dsr[inv.product.id]
            if inv.state.code == "FULL" and inv.bucket.code == "GODOWN":
                row["opening_full"] += inv.quantity
            if inv.state.code == "EMPTY" and inv.bucket.code == "GODOWN":
                row["opening_empty"] += inv.quantity
            if inv.state.code == "DEFECTIVE":
                row["opening_defective"] += inv.quantity

        # -------------------------------------------
        # 2) Movements for the day (ledger)
        # -------------------------------------------
        movements = InventoryTransaction.objects.filter(
            created_at__date=day
        ).select_related(
            "product", "from_bucket", "to_bucket", "from_state", "to_state"
        )

        for m in movements:
            row = dsr[m.product.id]

            # Invoice receipts
            if m.txn_type == "INVOICE":
                if m.to_state.code == "FULL":
                    row["received_full"] += m.quantity
                if m.to_state.code == "EMPTY":
                    row["received_empty"] += m.quantity
                if m.to_state.code == "DEFECTIVE":
                    row["received_defective"] += m.quantity

            # Loads assigned
            if m.txn_type == "ASSIGN":   # godown → cm_out
                row["load_assigned"] += m.quantity

            # Deliveries
            if m.txn_type == "DELIVERY":  # cm_out full decreased
                row["delivered_full"] += m.quantity

            # Empty collected (return)
            if m.txn_type == "RETURN":
                if m.to_state.code == "EMPTY":
                    row["empty_collected"] += m.quantity
                if m.to_state.code == "FULL":
                    row["unsold_full"] += m.quantity

            # Defective returned
            if m.txn_type == "ADJUSTMENT" and m.to_state and m.to_state.code == "DEFECTIVE":
                row["defective_returned"] += m.quantity

        # -------------------------------------------
        # 3) Closing Stock = inventory current
        # -------------------------------------------
        closing = Inventory.objects.select_related("product", "bucket", "state")
        for inv in closing:
            row = dsr[inv.product.id]
            if inv.bucket.code == "GODOWN":
                if inv.state.code == "FULL":
                    row["closing_full"] += inv.quantity
                if inv.state.code == "EMPTY":
                    row["closing_empty"] += inv.quantity
            if inv.state.code == "DEFECTIVE":
                row["closing_defective"] += inv.quantity

        return list(dsr.values())
