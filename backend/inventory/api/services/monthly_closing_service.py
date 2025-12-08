from datetime import date, timedelta
from django.db.models import Sum
from inventory.models import Inventory, InventoryTransaction, Product


class MonthlyClosingService:

    @staticmethod
    def get_opening(product_id, day):
        inv = Inventory.objects.filter(product_id=product_id).select_related("state", "bucket")

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
        inv = Inventory.objects.filter(product_id=product_id).select_related("state", "bucket")

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
    def generate(month_str):
        # month_str = '2025-02'
        year, month = map(int, month_str.split("-"))
        start = date(year, month, 1)
        end = date(year + (month == 12), (month % 12) + 1, 1) - timedelta(days=1)

        products = Product.objects.all()

        report = []

        for p in products:

            opening = MonthlyClosingService.get_opening(p.id, start)
            closing = MonthlyClosingService.get_closing(p.id)

            # Monthly movement = all txns in this month
            txns = InventoryTransaction.objects.filter(
                product_id=p.id,
                created_at__date__gte=start,
                created_at__date__lte=end,
            ).select_related(
                "from_state", "to_state", "from_bucket", "to_bucket"
            )

            mv = {
                "received_full": 0,
                "received_empty": 0,
                "received_defective": 0,

                "issued_full": 0,
                "delivered_full": 0,
                "unsold_full": 0,
                "empty_collected": 0,
                "defective_moved": 0,
            }

            # Summarize movements
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
                    if t.to_state.code == "FULL":
                        mv["unsold_full"] += t.quantity
                    if t.to_state.code == "EMPTY":
                        mv["empty_collected"] += t.quantity

                if t.txn_type == "ADJUSTMENT" and t.to_state.code == "DEFECTIVE":
                    mv["defective_moved"] += t.quantity

            # Append final row
            report.append({
                "product_id": p.id,
                "product_name": p.product_name,

                "opening_full": opening["full"],
                "received_full": mv["received_full"],
                "issued_full": mv["issued_full"],
                "delivered_full": mv["delivered_full"],
                "unsold_full": mv["unsold_full"],
                "closing_full": closing["full"],

                "opening_empty": opening["empty"],
                "received_empty": mv["received_empty"],
                "empty_collected": mv["empty_collected"],
                "closing_empty": closing["empty"],

                "opening_defective": opening["def"],
                "received_defective": mv["received_defective"],
                "defective_moved": mv["defective_moved"],
                "closing_defective": closing["def"],
            })

        return {"month": month_str, "products": report}
