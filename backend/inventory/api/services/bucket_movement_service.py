from datetime import timedelta
from inventory.models import Inventory, InventoryTransaction


class BucketMovementService:

    @staticmethod
    def get_opening_stock(date):
        """Opening stock = CURRENT inventory state"""
        opening = {}
        inv = Inventory.objects.select_related("bucket", "state", "product")

        for x in inv:
            key = (x.bucket.code, x.state.code)
            opening[key] = opening.get(key, 0) + x.quantity

        return opening

    @staticmethod
    def get_day_movements(date):
        """Fetch transactions for the day"""
        txns = InventoryTransaction.objects.filter(created_at__date=date).select_related(
            "product", "from_bucket", "to_bucket", "from_state", "to_state"
        )

        mv = {}

        for t in txns:
            # Outward movement
            if t.from_bucket:
                key_from = (t.from_bucket.code, t.from_state.code)
                mv.setdefault(key_from, {"in": 0, "out": 0})
                mv[key_from]["out"] += t.quantity

            # Inward movement
            if t.to_bucket:
                key_to = (t.to_bucket.code, t.to_state.code)
                mv.setdefault(key_to, {"in": 0, "out": 0})
                mv[key_to]["in"] += t.quantity

        return mv

    @staticmethod
    def get_closing_stock():
        """Closing = live inventory"""
        closing = {}
        inv = Inventory.objects.select_related("bucket", "state")

        for x in inv:
            key = (x.bucket.code, x.state.code)
            closing[key] = closing.get(key, 0) + x.quantity

        return closing

    @staticmethod
    def generate(from_date, to_date):

        day = from_date
        report_rows = []

        while day <= to_date:

            opening = BucketMovementService.get_opening_stock(day)
            movements = BucketMovementService.get_day_movements(day)
            closing = BucketMovementService.get_closing_stock()

            all_keys = set(opening.keys()) | set(movements.keys()) | set(closing.keys())

            for bucket, state in all_keys:
                op_qty = opening.get((bucket, state), 0)
                mv_in = movements.get((bucket, state), {}).get("in", 0)
                mv_out = movements.get((bucket, state), {}).get("out", 0)
                cl_qty = closing.get((bucket, state), 0)

                report_rows.append({
                    "date": day,
                    "bucket": bucket,
                    "state": state,
                    "opening_qty": op_qty,
                    "inward_qty": mv_in,
                    "outward_qty": mv_out,
                    "closing_qty": cl_qty,
                })

            day += timedelta(days=1)

        return {
            "from_date": from_date,
            "to_date": to_date,
            "days": report_rows
        }
