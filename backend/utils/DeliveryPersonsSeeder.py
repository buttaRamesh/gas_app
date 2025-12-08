import pandas as pd
from typing import Union, IO
from django.contrib.contenttypes.models import ContentType

from commons.models import Person   # ✔ Correct model path


class DeliveryPersonSeeder:
    """
    Updated for new DeliveryPerson model using GenericForeignKey.

    CSV Columns:
        Name, Route

    Route can be comma separated:
        R1
        R1,R2
        R3,R4,R5
    """

    def __init__(self, file_source: Union[str, IO]):
        self.file_source = file_source
        self.raw_df = None
        self.person_df = None

        # ✔ stores { "John": <DeliveryPerson instance>, ... }
        self.dp_map = {}

        self.load()

    # ==================================================================
    # PUBLIC ENTRYPOINT
    # ==================================================================
    def save_db(self):
        self._clear_delivery_tables()
        self._save_delivery_people()
        self._ensure_all_routes_exist()
        self._assign_routes()

        print("\n🎉 Delivery seeding completed successfully.\n")
        return self

    # ==================================================================
    def _clear_delivery_tables(self):
        from delivery.models import (
            DeliveryRouteAssignmentHistory,
            DeliveryRouteAssignment,
            DeliveryPerson,
        )

        print("[INFO] Clearing delivery tables...")

        DeliveryRouteAssignmentHistory.objects.all().delete()
        DeliveryRouteAssignment.objects.all().delete()
        DeliveryPerson.objects.all().delete()

        print("[INFO] Cleared.")

    # ==================================================================
    def load(self):
        try:
            self.raw_df = pd.read_csv(self.file_source)
        except UnicodeDecodeError:
            self.file_source.seek(0)
            self.raw_df = pd.read_csv(self.file_source, encoding="latin1")

        self.raw_df.columns = [str(c).strip() for c in self.raw_df.columns]

        required = ["Name", "Route"]
        missing = [c for c in required if c not in self.raw_df.columns]
        if missing:
            raise ValueError(f"Missing columns in CSV: {missing}")

        df = self.raw_df.copy()
        df["Name"] = df["Name"].astype(str).str.strip()
        df["Route"] = df["Route"].astype(str).str.strip()
        df["RouteList"] = df["Route"].apply(self._split_routes)

        self.person_df = df[df["Name"] != ""]
        print(f"[OK] Loaded delivery persons: {len(self.person_df)}")
        return self

    def _split_routes(self, value):
        if not value or str(value).strip().lower() == "nan":
            return []
        return [v.strip() for v in str(value).split(",") if v.strip()]

    # ==================================================================
    # CREATE PERSON → DELIVERY PERSON  (✔ FIXED)
    # ==================================================================
    def _save_delivery_people(self):
        from delivery.models import DeliveryPerson

        print("[INFO] Creating DeliveryPerson records...")

        person_ct = ContentType.objects.get_for_model(Person)

        for _, row in self.person_df.iterrows():
            full_name = row["Name"]

            # 1️⃣ Create Person
            person = Person.objects.create(full_name=full_name)

            # 2️⃣ Create DeliveryPerson linked via GFK
            dp = DeliveryPerson.objects.create(
                person_content_type=person_ct,
                person_object_id=person.id,
            )

            # 3️⃣ Keep in memory for route assignment
            self.dp_map[full_name] = dp

            print(f"  + DeliveryPerson created: {dp.name}")

    # ==================================================================
    def _ensure_all_routes_exist(self):
        from routes.models import Route

        print("[INFO] Ensuring route master entries...")

        for _, row in self.person_df.iterrows():
            for code in row["RouteList"]:
                route, created = Route.objects.get_or_create(
                    area_code=code,
                    defaults={"area_code_description": code},
                )
                if created:
                    print(f"    • Route created: {code}")

    # ==================================================================
    # ASSIGN ROUTES (✔ FIXED: NO REVERSE GFK QUERY)
    # ==================================================================
    def _assign_routes(self):
        from delivery.models import (
            DeliveryRouteAssignment,
            DeliveryRouteAssignmentHistory,
        )
        from routes.models import Route

        print("[INFO] Assigning routes...")

        for _, row in self.person_df.iterrows():
            name = row["Name"]

            # ✔ Use in-memory dp_map instead of invalid reverse lookup
            dp = self.dp_map[name]

            for code in row["RouteList"]:
                route = Route.objects.get(area_code=code)

                # Remove existing assignment (exclusive allocation)
                existing = DeliveryRouteAssignment.objects.filter(route=route).first()
                if existing and existing.delivery_person != dp:
                    DeliveryRouteAssignmentHistory.objects.create(
                        delivery_person=existing.delivery_person,
                        delivery_person_name=existing.delivery_person.name,
                        route=route,
                        route_code=route.area_code,
                        route_description=route.area_code_description,
                        action_type=DeliveryRouteAssignmentHistory.ActionType.DELETED,
                    )
                    existing.delete()

                # Assign route
                assignment = DeliveryRouteAssignment.objects.create(
                    route=route,
                    delivery_person=dp,
                )

                # Log new assignment
                DeliveryRouteAssignmentHistory.objects.create(
                    delivery_person=dp,
                    delivery_person_name=dp.name,
                    route=route,
                    route_code=route.area_code,
                    route_description=route.area_code_description,
                    action_type=DeliveryRouteAssignmentHistory.ActionType.CREATED,
                )

                print(f"  + {dp.name} assigned to {code}")
