import pandas as pd
from typing import Union, IO


class RouteSeeder:
    """
    CSV expected: AREA_CODE, AREA_NAME

    Full reset + seed:
        RouteSeeder(file).save_db()
    """

    def __init__(self, file_source: Union[str, IO]):
        self.file_source = file_source
        self.raw_df = None
        self.route_df = None
        self.area_df = None

        self.load()

    # ============================================================
    # PUBLIC API
    # ============================================================
    def save_db(self):
        """Clear all route data then insert fresh."""
        self._clear_route_tables()
        self._save_routes()
        self._save_route_areas()
        print("[DONE] Route + RouteArea seeded.")
        return self

    # ============================================================
    # CLEAR ALL ROUTE TABLES
    # ============================================================
    def _clear_route_tables(self):
        from routes.models import Route, RouteArea
        from delivery.models import DeliveryRouteAssignment, DeliveryRouteAssignmentHistory

        print("[INFO] Clearing Route-related tables in safe FK order...")

        # 1. History FIRST
        DeliveryRouteAssignmentHistory.objects.all().delete()

        # 2. Remove assignments (FK depends on Route)
        DeliveryRouteAssignment.objects.all().delete()

        # 3. Remove route areas (FK depends on Route)
        RouteArea.objects.all().delete()

        # 4. Now routes can be safely deleted
        Route.objects.all().delete()

        print("[INFO] Route + related tables cleared safely.")


    # ============================================================
    # LOAD CSV
    # ============================================================
    def load(self):
        """Loads CSV and extracts frames."""
        try:
            if isinstance(self.file_source, str):
                self.raw_df = pd.read_csv(self.file_source)
            else:
                self.raw_df = pd.read_csv(self.file_source)
        except UnicodeDecodeError:
            if not isinstance(self.file_source, str):
                self.file_source.seek(0)
            self.raw_df = pd.read_csv(self.file_source, encoding="latin1")

        self.raw_df.columns = [str(c).strip() for c in self.raw_df.columns]

        required = ["AREA_CODE", "AREA_NAME"]
        missing = [c for c in required if c not in self.raw_df.columns]
        if missing:
            raise ValueError(f"Missing columns: {missing}")

        df = self.raw_df.copy()
        df["AREA_CODE"] = df["AREA_CODE"].astype(str).str.strip()
        df["AREA_NAME"] = df["AREA_NAME"].astype(str).str.strip()

        self.route_df = df[["AREA_CODE"]].drop_duplicates()
        self.area_df = df[["AREA_CODE", "AREA_NAME"]]

        print("[OK] Route CSV loaded and processed.")
        return self

    # ============================================================
    # SAVE ROUTES
    # ============================================================
    def _save_routes(self):
        from routes.models import Route

        print("[INFO] Seeding Routes...")

        for _, row in self.route_df.iterrows():
            code = row["AREA_CODE"]

            Route.objects.create(
                area_code=code,
                area_code_description=code
            )

            print("  + Route Created:", code)

    # ============================================================
    # SAVE AREAS
    # ============================================================
    def _save_route_areas(self):
        from routes.models import Route, RouteArea

        print("[INFO] Seeding RouteArea...")

        for _, row in self.area_df.iterrows():
            code = row["AREA_CODE"]
            name = row["AREA_NAME"]

            route = Route.objects.get(area_code=code)

            RouteArea.objects.create(
                area_name=name,
                route=route
            )

            print(f"  + Area {name} added to Route {code}")
