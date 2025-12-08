from datetime import timedelta
from django.db.models import Sum
from inventory.models import (
    Inventory,
    InventoryTransaction,
    Product
)


class ProductMovementService:

    @staticmethod
    def get_opening(product_id, day):
        inv = Inventory.objects.filter(
            product_id=product_id
        ).select_related("state", "bucket")

        opening = {"full": 0, "empty": 0, "def": 0}

        for x in inv:
            if x.bucket.code == "GODOWN":
                if x.state.code == "FULL":
                    opening["full"] += x.quantity
                if x.state.code == "EMPTY":
                    opening["empty"] += x.quantity
            if x.state.code == "DEFECTIVE":
                opening["def"] += x.quantity

        return opening

    @staticmethod
    def get_closing(product_id):
        inv = Inventory.objects.filter(
            product_id=product_id
        ).select_related("state", "bucket")

        closing = {"full": 0, "empty": 0, "def": 0}

        for x in inv:
            if x.bucket.code == "GODOWN":
                if x.state.code == "FULL":
                    closing["full"] += x.quantity
                if x.state.code == "EMPTY":
                    closing["empty"] += x.quantity
            if x.state.code == "DEFECTIVE":
                closing["def"] += x.quantity

        return closing

    @staticmethod
    def get_day_movements(product_id, day):
        txns = InventoryTransaction.objects.filter(
            product_id=product_id,
            created_at__date=day
        ).select_related("from_state", "to_state", "from_bucket", "to_bucket")

        mv = {
            "received_full": 0,
            "received_empty": 0,
            "received_defective": 0,
            "issued_full": 0,
            "delivered_full": 0,
            "empty_collected": 0,
            "unsold_full": 0,
            "defective_moved": 0,
        }

        for t in txns:

            if t.txn_type == "INVOICE":
                if t.to_state.code == "FULL":
                    mv["received_full"] += t.quantity
                if t.to_state.code == "EMPTY":
                    mv["received_empty"] += t.quantity
                if t.to_state.code == "DEFECTIVE":
                    mv["received_defective"] += t.quantity

            if t.txn_type == "ASSIGN":
                mv["issued_full"] += t.quantity

            if t.txn_type == "DELIVERY":
                mv["delivered_full"] += t.quantity

            if t.txn_type == "RETURN":
                if t.to_state.code == "EMPTY":
                    mv["empty_collected"] += t.quantity
                if t.to_state.code == "FULL":
                    mv["unsold_full"] += t.quantity

            if t.txn_type == "ADJUSTMENT" and t.to_state.code == "DEFECTIVE":
                mv["defective_moved"] += t.quantity

        return mv

    @staticmethod
    def generate_movement(product_id, start_date, end_date):
        product = Product.objects.get(id=product_id)

        day = start_date
        results = []

        # We use current stock as closing for last day.
        while day <= end_date:

            # Opening = snapshot for this day (based on inventory table)
            opening = ProductMovementService.get_opening(product_id, day)

            # Movements for this day
            mv = ProductMovementService.get_day_movements(product_id, day)

            # Closing = Opening + receipts - issues - deliveries + returns...
            closing = {
                "full": opening["full"]
                        + mv["received_full"]
                        - mv["issued_full"]
                        - mv["delivered_full"]
                        + mv["unsold_full"],

                "empty": opening["empty"]
                          + mv["received_empty"]
                          + mv["empty_collected"],

                "def": opening["def"]
                       + mv["received_defective"]
                       + mv["defective_moved"],
            }

            results.append({
                "date": day,
                "opening_full": opening["full"],
                "opening_empty": opening["empty"],
                "opening_defective": opening["def"],

                "received_full": mv["received_full"],
                "received_empty": mv["received_empty"],
                "received_defective": mv["received_defective"],

                "issued_full": mv["issued_full"],
                "delivered_full": mv["delivered_full"],
                "empty_collected": mv["empty_collected"],
                "unsold_full": mv["unsold_full"],
                "defective_moved": mv["defective_moved"],

                "closing_full": closing["full"],
                "closing_empty": closing["empty"],
                "closing_defective": closing["def"],
            })

            day += timedelta(days=1)

        return {
            "product_id": product.id,
            "product_name": product.product_name,
            "days": results
        }
