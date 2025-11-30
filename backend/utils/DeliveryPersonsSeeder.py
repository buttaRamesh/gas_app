import pandas as pd
from typing import Union, IO


class DeliveryPersonSeeder:
    """
    Delivery Person Seeder

    Supports:
        - Multiple routes per person
        - Auto-create routes
        - Exclusive route ownership
        - Full reset of delivery tables

    CSV expected:
        Name, Route
    """

    def __init__(self, file_source: Union[str, IO]):
        self.file_source = file_source
        self.raw_df = None
        self.person_df = None

        self.load()

    # ============================================================
    # PUBLIC API
    # ============================================================
    def save_db(self):
        """CLEAR ALL + SEED NEW DATA"""
        self._clear_delivery_tables()
        self._save_delivery_people()
        self._ensure_all_routes_exist()
        self._assign_routes()
        print("[DONE] Delivery seeding completed.")
        return self

    # ============================================================
    # CLEAR DELIVERY TABLES
    # ============================================================
    def _clear_delivery_tables(self):
        from delivery.models import (
            DeliveryRouteAssignmentHistory,
            DeliveryRouteAssignment,
            DeliveryPerson
        )
        from routes.models import RouteArea, Route

        print("[INFO] Clearing Delivery-related tables in safe FK order...")

        # HISTORIES MUST BE FIRST
        DeliveryRouteAssignmentHistory.objects.all().delete()

        # Then assignments
        DeliveryRouteAssignment.objects.all().delete()

        # DeliveryPerson depends on no FK
        DeliveryPerson.objects.all().delete()

        print("[INFO] Delivery tables cleared safely.")


    # ============================================================
    # LOAD CSV
    # ============================================================
    def load(self):
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

        required = ["Name", "Route"]
        missing = [c for c in required if c not in self.raw_df.columns]
        if missing:
            raise ValueError(f"Missing columns: {missing}")

        df = self.raw_df.copy()
        df["Name"] = df["Name"].astype(str).str.strip()
        df["Route"] = df["Route"].astype(str).str.strip()
        df["RouteList"] = df["Route"].apply(self._split_routes)

        self.person_df = df[df["Name"] != ""]
        print(f"[OK] DeliveryPerson CSV: {len(self.person_df)} rows")
        return self

    # Split multi-route values
    def _split_routes(self, value):
        if not value:
            return []
        return [v.strip() for v in value.split(",") if v.strip()]

    # ============================================================
    # SAVE DELIVERY PERSONS
    # ============================================================
    def _save_delivery_people(self):
        from delivery.models import DeliveryPerson

        print("[INFO] Creating DeliveryPersons...")

        for _, row in self.person_df.iterrows():
            name = row["Name"]

            DeliveryPerson.objects.create(name=name)
            print("  + Person Created:", name)

    # ============================================================
    # ENSURE ROUTES EXIST
    # ============================================================
    def _ensure_all_routes_exist(self):
        from routes.models import Route

        print("[INFO] Ensuring all routes exist...")

        for _, row in self.person_df.iterrows():
            for code in row["RouteList"]:
                Route.objects.get_or_create(
                    area_code=code,
                    defaults={"area_code_description": code}
                )
                print("  = Route ensured:", code)

    # ============================================================
    # ASSIGN ROUTES WITH EXCLUSIVE OWNERSHIP
    # ============================================================
    def _assign_routes(self):
        from delivery.models import (
            DeliveryPerson,
            DeliveryRouteAssignment,
            DeliveryRouteAssignmentHistory,
        )
        from routes.models import Route

        print("[INFO] Assigning routes...")

        for _, row in self.person_df.iterrows():
            person = DeliveryPerson.objects.get(name=row["Name"])

            for code in row["RouteList"]:
                route = Route.objects.get(area_code=code)

                # If already assigned to another person → detach
                existing = DeliveryRouteAssignment.objects.filter(route=route).first()
                if existing and existing.delivery_person != person:
                    old_person = existing.delivery_person

                    # Log DELETED action
                    DeliveryRouteAssignmentHistory.objects.create(
                        delivery_person=old_person,
                        delivery_person_name=old_person.name,
                        route=route,
                        route_code=code,
                        route_description=route.area_code_description,
                        action_type=DeliveryRouteAssignmentHistory.ActionType.DELETED,
                    )
                    existing.delete()

                # Create new assignment
                assignment = DeliveryRouteAssignment.objects.create(
                    route=route,
                    delivery_person=person
                )

                # Log CREATED action
                DeliveryRouteAssignmentHistory.objects.create(
                    delivery_person=person,
                    delivery_person_name=person.name,
                    route=route,
                    route_code=code,
                    route_description=route.area_code_description,
                    action_type=DeliveryRouteAssignmentHistory.ActionType.CREATED,
                )

                print(f"  + {person.name} assigned to {code}")
