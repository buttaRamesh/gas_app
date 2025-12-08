# backend/utils/ConsumerSeeder.py
"""
Final ConsumerSeeder with fast clear (TRUNCATE) + safe ORM-delete fallback (signals suspended).
- Use after django.setup()
- Usage:
    seeder = ConsumerSeeder("/path/to/consumers.csv")
    seeder.save_db(clear_existing=True, dry_run=False, use_truncate=True)
"""

import importlib
import pandas as pd
from pathlib import Path
from typing import Dict, List, Tuple, Union
from collections import defaultdict

BATCH_SIZE = 1000


class ConsumerSeeder:
    def __init__(self, file_source: Union[str, Path]):
        self.file_source = str(file_source)
        self.df = None
        self.consumers_map: Dict[str, Dict] = {}
        self.lookup_cache: Dict[str, Dict[str, object]] = {}
        self.duplicate_sv_log: Dict[str, List[Dict]] = defaultdict(list)
        self.sv_to_consumers_map: Dict[str, List[str]] = defaultdict(list)  # SV -> list of consumer numbers

        self.stats = {
            "rows": 0,
            "unique_consumers": 0,
            "persons_created": 0,
            "addresses_created": 0,
            "contacts_created": 0,
            "consumers_created": 0,
            "identifications_created": 0,
            "connections_created": 0,
            "routes_created": 0,
            "assignments_created": 0,
            "missing_product_variant": 0,
            "sv_modified_count": 0,
        }

        # Load & group immediately
        self._load_csv()
        self._group_by_consumer_number()

    # -------------------------
    # CSV load & grouping
    # -------------------------
    def _load_csv(self):
        print(f"[LOAD] Reading CSV: {self.file_source}")
        self.df = pd.read_csv(self.file_source, dtype=str).fillna("")
        self.df.columns = [c.strip() for c in self.df.columns]
        self.stats["rows"] = len(self.df)
        print(f"[LOAD] rows: {self.stats['rows']}")

    def _group_by_consumer_number(self):
        seen = set()
        for _, row in self.df.iterrows():
            cnum = str(row.get("ConsumerNumber", "")).strip()
            if not cnum:
                continue
            if cnum not in seen:
                seen.add(cnum)
                self.consumers_map[cnum] = {"first": row.to_dict(), "rows": [row.to_dict()]}
            else:
                self.consumers_map[cnum]["rows"].append(row.to_dict())
        self.stats["unique_consumers"] = len(self.consumers_map)
        print(f"[GROUP] unique consumers: {self.stats['unique_consumers']}")

    # -------------------------
    # Bulk create wrapper (MySQL-safe)
    # -------------------------
    def _bulk_create(self, Model, objs: List[object]):
        if not objs:
            return []
        Model.objects.bulk_create(objs, batch_size=BATCH_SIZE)
        return objs

    # -------------------------
    # Lookups
    # -------------------------
    def _ensure_lookups(self):
        print("[LOOKUPS] Ensuring lookup values exist ...")
        from django.apps import apps

        mapping = {
            "Category": ("lookups", "ConsumerCategory"),
            "ConsumerTypeIdDesc": ("lookups", "ConsumerType"),
            "BPLType": ("lookups", "BPLType"),
            "DCTType": ("lookups", "DCTType"),
            "Scheme": ("schemes", "Scheme"),
            "InDocTypeIdDesc": ("lookups", "ConnectionType"),
        }

        for csv_col, (app_label, model_name) in mapping.items():
            Model = apps.get_model(app_label, model_name)
            values = {str(v).strip() for v in self.df[csv_col].unique() if str(v).strip()}
            if not values:
                self.lookup_cache[csv_col] = {}
                continue

            existing = Model.objects.filter(name__in=values).in_bulk(field_name="name")
            missing = values - set(existing.keys())
            if missing:
                Model.objects.bulk_create([Model(name=m) for m in missing], batch_size=min(500, len(missing)))
                print(f"[LOOKUPS] Created {len(missing)} rows for {model_name}")

            all_objs = Model.objects.filter(name__in=values)
            self.lookup_cache[csv_col] = {o.name: o for o in all_objs}

        print("[LOOKUPS] done.")

    # -------------------------
    # Signal suspension/resume
    # -------------------------
    def _suspend_signals(self):
        """
        Attempt to disconnect specific receivers from consumers.signals.
        If exact receiver names aren't present, fall back to a global temporary freeze of post_save/post_delete.
        """
        from django.db.models import signals
        self._suspended = {"post_save": [], "post_delete": []}
        try:
            sig_mod = importlib.import_module("consumers.signals")
        except Exception:
            sig_mod = None

        # Preferred: disconnect explicit known receivers if present
        if sig_mod:
            try:
                # Common receiver names we expect based on your signals.py
                receivers_to_disconnect = [
                    getattr(sig_mod, "log_consumer_route_assignment_create_update", None),
                    getattr(sig_mod, "log_consumer_route_assignment_delete", None),
                ]
                for func in receivers_to_disconnect:
                    if func:
                        try:
                            signals.post_save.disconnect(func)
                            self._suspended["post_save"].append(func)
                        except Exception:
                            pass
                        try:
                            signals.post_delete.disconnect(func)
                            self._suspended["post_delete"].append(func)
                        except Exception:
                            pass
            except Exception:
                pass

        # If nothing disconnected, fallback to clearing all receivers (store and clear)
        if not any(self._suspended.values()):
            # store and clear receivers (dangerous but temporary)
            for name in ("post_save", "post_delete"):
                sig = getattr(signals, name)
                # copy current receivers
                try:
                    current = list(sig.receivers)
                    if current:
                        self._suspended[name] = current
                        sig.receivers = []
                except Exception:
                    # some Django versions need different handling; ignore
                    pass

    def _resume_signals(self):
        from django.db.models import signals
        # If we stored explicit callables, reconnect them
        try:
            for func in self._suspended.get("post_save", []) or []:
                try:
                    signals.post_save.connect(func)
                except Exception:
                    # if stored as weakrefs, skip
                    pass
            for func in self._suspended.get("post_delete", []) or []:
                try:
                    signals.post_delete.connect(func)
                except Exception:
                    pass
        except Exception:
            pass

        # If we stored receiver lists (fallback), restore them
        for name in ("post_save", "post_delete"):
            stored = self._suspended.get(name)
            if stored and isinstance(stored[0], tuple):
                sig = getattr(signals, name)
                try:
                    sig.receivers = stored
                except Exception:
                    pass

        self._suspended = {"post_save": [], "post_delete": []}

    # -------------------------
    # Model imports
    # -------------------------
    def _get_models(self):
        """
        Import and return all required Django models.
        Returns: dict of model_name -> Model class
        """
        from django.apps import apps

        return {
            "Person": apps.get_model("commons", "Person"),
            "Address": apps.get_model("commons", "Address"),
            "Contact": apps.get_model("commons", "Contact"),
            "Identification": apps.get_model("commons", "Identification"),
            "Consumer": apps.get_model("consumers", "Consumer"),
            "Assignment": apps.get_model("consumers", "ConsumerRouteAssignment"),
            "AssignmentHistory": apps.get_model("consumers", "ConsumerRouteAssignmentHistory"),
            "ConnectionDetails": apps.get_model("connections", "ConnectionDetails"),
            "Route": apps.get_model("routes", "Route"),
            "Product": apps.get_model("inventory", "Product"),
        }

    # -------------------------
    # Product and SV number prefetching
    # -------------------------
    def _prefetch_products_and_sv_numbers(self, Product, ConnectionDetails):
        """
        Prefetch products and existing SV numbers from database.
        Returns: tuple (product_map, existing_db_svs)
        """
        print("[PREP] prefetching products and existing SvNumbers ...")

        # Get all product codes from CSV
        all_prod_codes = {
            str(row.get("ProdCode", "")).strip()
            for _, row in self.df.iterrows()
            if str(row.get("ProdCode", "")).strip()
        }

        product_map = {}
        if all_prod_codes:
            product_qs = Product.objects.filter(product_code__in=list(all_prod_codes))
            product_map = {p.product_code: p for p in product_qs}
        print(product_map)

        # Get all existing SV numbers
        raw_sv_nums = {
            str(row.get("SvNumber", "")).strip()
            for _, row in self.df.iterrows()
            if str(row.get("SvNumber", "")).strip()
        }

        existing_db_svs = set()
        if raw_sv_nums:
            existing_db_svs = set(
                ConnectionDetails.objects.filter(sv_number__in=list(raw_sv_nums))
                .values_list("sv_number", flat=True)
            )

        return product_map, existing_db_svs

    # -------------------------
    # Identification creation
    # -------------------------
    def _create_identifications(self, Identification, consumer_numbers):
        """
        Create Identification objects for all consumers.
        Returns: dict mapping consumer_number -> Identification object
        """
        print("[STEP] Creating Identification objects (bulk)...")

        ident_objs = []
        for cnum in consumer_numbers:
            first = self.consumers_map[cnum]["first"]
            ident_objs.append(
                Identification(ration_card_num=first.get("Rationcardno") or None)
            )

        self._bulk_create(Identification, ident_objs)
        n_idents = len(ident_objs)

        if n_idents:
            created_idents = list(Identification.objects.order_by("-id")[:n_idents])
            created_idents.reverse()
        else:
            created_idents = []

        ident_map = {cnum: ident for cnum, ident in zip(consumer_numbers, created_idents)}
        self.stats["identifications_created"] = len(created_idents)

        return ident_map

    # -------------------------
    # Person creation
    # -------------------------
    def _create_persons(self, Person, consumer_numbers, ident_map):
        """
        Create Person objects for all consumers.
        Returns: dict mapping consumer_number -> Person object
        """
        print("[STEP] Creating Person objects (bulk)...")

        person_objs = []
        for cnum in consumer_numbers:
            first = self.consumers_map[cnum]["first"]
            consumer_name = first.get("ConsumerName") or ""

            # Split name into first and last (simple split)
            name_parts = consumer_name.strip().split(maxsplit=1) if consumer_name else ["", ""]
            first_name = name_parts[0] if len(name_parts) > 0 else ""
            last_name = name_parts[1] if len(name_parts) > 1 else ""

            person_objs.append(
                Person(
                    first_name=first_name or "",
                    last_name=last_name or "",
                    full_name=consumer_name or "",
                    identification=ident_map.get(cnum),
                )
            )

        self._bulk_create(Person, person_objs)
        n_persons = len(person_objs)

        if n_persons:
            created_persons = list(Person.objects.order_by("-id")[:n_persons])
            created_persons.reverse()
        else:
            created_persons = []

        person_map = {cnum: p for cnum, p in zip(consumer_numbers, created_persons)}
        self.stats["persons_created"] = len(created_persons)

        return person_map

    # -------------------------
    # Address and Contact creation
    # -------------------------
    def _create_addresses_and_contacts(self, Address, Contact, Person, consumer_numbers, person_map):
        """
        Create Address and Contact objects for all consumers.
        Returns: None (updates stats internally)
        """
        print("[STEP] Creating Address & Contact (bulk)...")
        from django.contrib.contenttypes.models import ContentType

        ct_person = ContentType.objects.get_for_model(Person)
        address_objs = []
        contact_objs = []

        for cnum in consumer_numbers:
            first = self.consumers_map[cnum]["first"]
            person = person_map.get(cnum)
            if not person:
                raise RuntimeError(f"Missing Person for consumer {cnum}")

            pid = person.id
            address_objs.append(
                Address(
                    content_type=ct_person,
                    object_id=pid,
                    house_no=first.get("HouseNo") or None,
                    house_name_flat_number=first.get("HouseNameFlatNumber") or None,
                    housing_complex_building=first.get("HousingComplexBuilding") or None,
                    street_road_name=first.get("StreetRoadName") or None,
                    land_mark=first.get("AreaLandMark") or None,
                    city_town_village=first.get("CityTownVillage") or None,
                    district=first.get("District") or None,
                    pin_code=first.get("PinCode") or None,
                    address_text=first.get("Address") or None,
                )
            )
            contact_objs.append(
                Contact(
                    content_type=ct_person,
                    object_id=pid,
                    email=first.get("EmailId") or None,
                    phone_number=self.mask_phone_number(first.get("PhoneNumber")) or None,
                    mobile_number=self.mask_phone_number(first.get("MobileNumber")) or None,
                )
            )

        self._bulk_create(Address, address_objs)
        self._bulk_create(Contact, contact_objs)
        self.stats["addresses_created"] = len(address_objs)
        self.stats["contacts_created"] = len(contact_objs)

    # -------------------------
    # Consumer creation
    # -------------------------
    def _create_consumers(self, Consumer, consumer_numbers, person_map):
        """
        Create Consumer objects for all consumers.
        Returns: dict mapping consumer_number -> Consumer object
        """
        print("[STEP] Creating Consumer objects (bulk)...")

        consumer_objs = []
        for cnum in consumer_numbers:
            first = self.consumers_map[cnum]["first"]
            consumer_objs.append(
                Consumer(
                    person=person_map[cnum],
                    consumer_number=cnum,
                    blue_book=(
                        int(first.get("BlueBookNumber"))
                        if str(first.get("BlueBookNumber", "")).strip().isdigit()
                        else None
                    ),
                    lpg_id=(
                        int(first.get("LPGId"))
                        if str(first.get("LPGId", "")).strip().isdigit()
                        else None
                    ),
                    is_kyc_done=(
                        str(first.get("KYCDone", "")).strip().upper()
                        in ("KYC DONE", "TRUE", "1")
                    ),
                    category=self.lookup_cache.get("Category", {}).get(
                        str(first.get("Category", "")).strip()
                    ),
                    consumer_type=self.lookup_cache.get("ConsumerTypeIdDesc", {}).get(
                        str(first.get("ConsumerTypeIdDesc", "")).strip()
                    ),
                    bpl_type=self.lookup_cache.get("BPLType", {}).get(
                        str(first.get("BPLType", "")).strip()
                    ),
                    dct_type=self.lookup_cache.get("DCTType", {}).get(
                        str(first.get("DCTType", "")).strip()
                    ),
                    opting_status=first.get("Optingstatus") or None,
                    scheme=self.lookup_cache.get("Scheme", {}).get(
                        str(first.get("Scheme", "")).strip()
                    ),
                )
            )

        self._bulk_create(Consumer, consumer_objs)
        qs_cons = Consumer.objects.filter(consumer_number__in=consumer_numbers).in_bulk(
            field_name="consumer_number"
        )
        consumer_map = {cnum: qs_cons[cnum] for cnum in consumer_numbers}
        self.stats["consumers_created"] = len(consumer_map)

        return consumer_map

    # -------------------------
    # Date parsing helper
    # -------------------------
    def _parse_sv_date(self, sv_date_val):
        """
        Parse SV date from various formats.
        Returns: date object or None
        """
        if not sv_date_val:
            return None

        try:
            if len(sv_date_val) == 8 and sv_date_val.isdigit():
                return pd.to_datetime(sv_date_val, format="%Y%m%d").date()
            else:
                return pd.to_datetime(sv_date_val).date()
        except Exception:
            return None

    # -------------------------
    # Connection details creation
    # -------------------------
    def _create_connection_details(
        self, ConnectionDetails, consumer_map, product_map, existing_db_svs
    ):
        """
        Create ConnectionDetails objects for all consumers.
        Allows duplicate SV numbers (no unique constraint).
        Returns: None (updates stats internally)
        """
        print("[STEP] Creating ConnectionDetails (bulk) ...")

        conn_objs = []
        skip_reasons = {
            "missing_product": 0,
            "missing_connection_type": 0,
            "missing_consumer": 0,
            "both_missing": 0
        }

        # Track unique missing product codes and connection types for reporting
        missing_prod_codes = set()
        missing_conn_types = set()

        for cnum, pack in self.consumers_map.items():
            consumer = consumer_map.get(cnum)
            if not consumer:
                skip_reasons["missing_consumer"] += 1
                continue

            for row in pack["rows"]:
                raw_sv = str(row.get("SvNumber", "")).strip()

                # Track which consumers have which original SV numbers
                if raw_sv:
                    self.sv_to_consumers_map[raw_sv].append(cnum)

                # Use the SV number as-is (no suffix generation)
                sv_number = raw_sv if raw_sv else None

                prod_code = str(row.get("ProdCode", "")).strip()
                product = product_map.get(prod_code) if prod_code else None

                conn_type_raw = str(row.get("InDocTypeIdDesc", "")).strip()
                connection_type = self.lookup_cache.get("InDocTypeIdDesc", {}).get(conn_type_raw)

                # Track missing items
                has_missing = False
                if prod_code and product is None:
                    missing_prod_codes.add(prod_code)
                    has_missing = True

                if conn_type_raw and connection_type is None:
                    missing_conn_types.add(conn_type_raw)
                    has_missing = True

                # SKIP if product or connection_type is None (both are required fields)
                if product is None and connection_type is None:
                    skip_reasons["both_missing"] += 1
                    continue
                elif product is None:
                    skip_reasons["missing_product"] += 1
                    self.stats["missing_product_variant"] += 1
                    continue
                elif connection_type is None:
                    skip_reasons["missing_connection_type"] += 1
                    continue

                sv_date_val = str(row.get("SvDateInt", "")).strip()
                sv_date = self._parse_sv_date(sv_date_val)

                conn_objs.append(
                    ConnectionDetails(
                        consumer=consumer,
                        sv_number=sv_number,
                        sv_date=sv_date,
                        hist_code_description=row.get("HistCodeDescription") or None,
                        connection_type=connection_type,
                        product=product,
                        num_of_regulators=(
                            int(row.get("NoOfDpr"))
                            if str(row.get("NoOfDpr", "")).strip().isdigit()
                            else 0
                        ),
                    )
                )

        # Print skip reasons
        total_skipped = sum(skip_reasons.values())
        if total_skipped > 0:
            print(f"\n[WARNING] Skipped {total_skipped} connection records:")
            for reason, count in skip_reasons.items():
                if count > 0:
                    print(f"  - {reason.replace('_', ' ').title()}: {count:,}")

            if missing_prod_codes:
                print(f"\n[WARNING] Missing {len(missing_prod_codes)} unique product codes:")
                for code in sorted(list(missing_prod_codes)[:10]):  # Show first 10
                    print(f"  - {code}")
                if len(missing_prod_codes) > 10:
                    print(f"  ... and {len(missing_prod_codes) - 10} more")

            if missing_conn_types:
                print(f"\n[WARNING] Missing {len(missing_conn_types)} unique connection types:")
                for ctype in sorted(list(missing_conn_types)[:10]):  # Show first 10
                    print(f"  - {ctype}")
                if len(missing_conn_types) > 10:
                    print(f"  ... and {len(missing_conn_types) - 10} more")

        self._bulk_create(ConnectionDetails, conn_objs)
        self.stats["connections_created"] = len(conn_objs)
        print(f"\n[INFO] Created {len(conn_objs):,} connection records")

    # -------------------------
    # Route assignment
    # -------------------------
    def _create_or_get_routes(self, Route, consumer_numbers):
        """
        Create or get existing routes needed for consumer assignments.
        Returns: dict mapping area_code -> Route object
        """
        route_codes_needed = set()
        for cnum in consumer_numbers:
            first = self.consumers_map[cnum]["first"]
            route_raw = (first.get("AreaCodeDesc") or first.get("AreaId") or "").strip()
            if route_raw:
                route_code = route_raw.split("-")[0].strip()
                if route_code:
                    route_codes_needed.add(route_code)

        existing_routes = {
            r.area_code: r
            for r in Route.objects.filter(area_code__in=list(route_codes_needed))
        }
        missing_codes = route_codes_needed - set(existing_routes.keys())

        if missing_codes:
            Route.objects.bulk_create(
                [Route(area_code=rc, area_code_description=rc) for rc in missing_codes],
                batch_size=BATCH_SIZE,
            )
            existing_routes.update({
                r.area_code: r
                for r in Route.objects.filter(area_code__in=list(route_codes_needed))
            })
            self.stats["routes_created"] += len(missing_codes)

        return existing_routes

    def _assign_consumers_to_routes(
        self, Assignment, Route, consumer_numbers, consumer_map, existing_routes
    ):
        """
        Assign consumers to routes.
        Only creates new assignments, doesn't delete existing ones.
        Returns: None (updates stats internally)
        """
        print("[STEP] Fast route assignment (one route per consumer) ...")

        # Get all route codes needed for filtering
        route_codes_needed = set(existing_routes.keys())

        existing_assign_qs = Assignment.objects.select_related("route", "consumer").filter(
            route__area_code__in=list(route_codes_needed)
        )
        existing_pairs = set(
            (ra.route.area_code, ra.consumer.consumer_number) for ra in existing_assign_qs
        )

        new_assignments = []
        for cnum in consumer_numbers:
            first = self.consumers_map[cnum]["first"]
            consumer = consumer_map.get(cnum)
            if not consumer:
                continue

            route_raw = (first.get("AreaCodeDesc") or first.get("AreaId") or "").strip()
            if not route_raw:
                continue

            route_code = route_raw.split("-")[0].strip()
            if not route_code:
                continue

            route = existing_routes.get(route_code)
            if not route:
                # defensive fallback
                route = Route.objects.get(area_code=route_code)
                existing_routes[route_code] = route

            if (route_code, cnum) in existing_pairs:
                continue

            new_assignments.append(Assignment(route=route, consumer=consumer))

        if new_assignments:
            Assignment.objects.bulk_create(new_assignments, batch_size=BATCH_SIZE)
            self.stats["assignments_created"] += len(new_assignments)
            print(f"[ROUTES] Created {len(new_assignments)} new ConsumerRouteAssignment rows.")

    # -------------------------
    # Fast clear: TRUNCATE (preferred) or ORM delete fallback
    # -------------------------
    def _clear_tables(self, Person, Address, Contact, Consumer, Identification,
                      ConnectionDetails, Assignment, AssignmentHistory,
                      use_truncate: bool = True):
        """
        Clear consumer-related tables quickly.
        If use_truncate=True -> disables FK checks and TRUNCATEs tables (fast).
        Else -> suspends signals and deletes in chunks via ORM (safer).
        """
        from django.db import connection, transaction

        model_order = [
            AssignmentHistory, Assignment, ConnectionDetails, Identification,
            Consumer, Address, Contact, Person
        ]

        # Count records before deletion
        print("\n" + "="*80)
        print("CLEARING TABLES - RECORD COUNTS BEFORE DELETION")
        print("="*80)
        record_counts = {}
        for m in model_order:
            try:
                count = m.objects.count()
                record_counts[m._meta.model_name] = count
                print(f"  {m._meta.model_name.capitalize()}: {count:,} records")
            except Exception as e:
                print(f"  {m._meta.model_name.capitalize()}: Error counting - {e}")
                record_counts[m._meta.model_name] = 0

        total_before = sum(record_counts.values())
        print(f"\nTotal records to delete: {total_before:,}")
        print("="*80)

        table_names = []
        for m in model_order:
            try:
                table_names.append(m._meta.db_table)
            except Exception:
                pass

        if use_truncate:
            # TRUNCATE fast path
            print("\n[CLEAR] Using TRUNCATE method (fast)...")
            with connection.cursor() as cursor:
                try:
                    cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
                    for tbl in table_names:
                        cursor.execute(f"TRUNCATE TABLE `{tbl}`;")
                    cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
                    print("[CLEAR] ✓ Successfully truncated all tables")
                    self._print_clear_summary(record_counts, total_before)
                    return True
                except Exception as e:
                    try:
                        cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
                    except Exception:
                        pass
                    print(f"[CLEAR] TRUNCATE failed: {e}")
                    print("[CLEAR] Falling back to ORM delete method...")

        # ORM delete fallback with signals suspended
        print("\n[CLEAR] Using ORM delete method (safer but slower)...")
        self._suspend_signals()
        try:
            deleted_counts = {}
            # delete in reverse dependency order (children first)
            for m in model_order:
                model_name = m._meta.model_name
                qs = m.objects.all()
                total_deleted = 0
                # delete in chunks to avoid locking for too long
                while True:
                    batch = qs[:BATCH_SIZE]
                    if not batch:
                        break
                    # Use QuerySet.delete() on the slice (invokes bulk delete without iterating)
                    # Note: This still calls cascades at DB level, but signals are suspended.
                    deleted, _ = batch.delete()
                    total_deleted += deleted
                deleted_counts[model_name] = total_deleted
                if total_deleted > 0:
                    print(f"  ✓ Deleted {total_deleted:,} {model_name} records")

            print("[CLEAR] ✓ Successfully deleted all records via ORM")
            self._print_clear_summary(record_counts, total_before)
            return True
        finally:
            self._resume_signals()

    def _print_clear_summary(self, record_counts, total_before):
        """Print summary after clearing tables."""
        print("\n" + "="*80)
        print("CLEARING COMPLETED")
        print("="*80)
        print(f"Total records deleted: {total_before:,}")
        print("\nDeleted records by table:")
        for model_name, count in record_counts.items():
            if count > 0:
                print(f"  - {model_name.capitalize()}: {count:,} records")
        print("="*80 + "\n")

    # -------------------------
    # Main seeding pipeline
    # -------------------------
    def save_db(self, clear_existing: bool = True, dry_run: bool = False, use_truncate: bool = True):
        """
        Main public method.
        - clear_existing: remove existing consumer-related rows before seeding (if not dry_run)
        - dry_run: if True, only validate counts (no DB write)
        - use_truncate: when clearing, prefer TRUNCATE (fast). If False, will use ORM-delete with signals suspended.
        Returns dict { "stats": ..., "duplicate_sv_log": {...} }
        """
        # Get all model classes
        models = self._get_models()
        Person = models["Person"]
        Address = models["Address"]
        Contact = models["Contact"]
        Identification = models["Identification"]
        Consumer = models["Consumer"]
        Assignment = models["Assignment"]
        AssignmentHistory = models["AssignmentHistory"]
        ConnectionDetails = models["ConnectionDetails"]
        Route = models["Route"]
        Product = models["Product"]

        # Clear existing if requested
        if clear_existing and not dry_run:
            print("[CLEAR] Clearing consumer-related tables ...")
            ok = self._clear_tables(
                Person, Address, Contact, Consumer, Identification,
                ConnectionDetails, Assignment, AssignmentHistory,
                use_truncate=use_truncate
            )
            if not ok:
                raise RuntimeError("Failed to clear tables")

        # Ensure lookups exist
        self._ensure_lookups()

        consumer_numbers = list(self.consumers_map.keys())

        # Dry-run early return
        if dry_run:
            total_conn = sum(len(v["rows"]) for v in self.consumers_map.values())
            print("[DRY RUN] Unique consumers:", len(consumer_numbers))
            print("[DRY RUN] Total connections:", total_conn)
            return {"unique_consumers": len(consumer_numbers), "total_connections": total_conn}

        # Prefetch products and existing SV numbers
        product_map, existing_db_svs = self._prefetch_products_and_sv_numbers(
            Product, ConnectionDetails
        )

        # Create identifications
        ident_map = self._create_identifications(Identification, consumer_numbers)

        # Create persons
        person_map = self._create_persons(Person, consumer_numbers, ident_map)

        # Create addresses and contacts
        self._create_addresses_and_contacts(
            Address, Contact, Person, consumer_numbers, person_map
        )

        # Create consumers
        consumer_map = self._create_consumers(Consumer, consumer_numbers, person_map)

        # Create connection details (with duplicate SV handling)
        self._create_connection_details(
            ConnectionDetails, consumer_map, product_map, existing_db_svs
        )

        # Create or get routes
        existing_routes = self._create_or_get_routes(Route, consumer_numbers)

        # Assign consumers to routes
        self._assign_consumers_to_routes(
            Assignment, Route, consumer_numbers, consumer_map, existing_routes
        )

        # Final summary
        self._print_summary()

        return {"stats": self.stats, "duplicate_sv_log": dict(self.duplicate_sv_log)}

    def _print_summary(self):
        """Print final seeding summary statistics."""
        print("\n=== CONSUMER SEED SUMMARY ===")
        for k, v in sorted(self.stats.items()):
            print(f"{k}: {v}")
        print("=============================\n")

        # Print duplicate SV number report if any duplicates were found
        self.print_duplicate_sv_report()

    def get_duplicate_sv_stats(self):
        """
        Get formatted statistics for duplicate SV numbers.
        Shows which SV numbers are shared by multiple consumers.
        Returns: dict with SV-wise duplicate information
        """
        # Find SV numbers that have multiple consumers
        duplicate_svs = {
            sv: consumers
            for sv, consumers in self.sv_to_consumers_map.items()
            if len(consumers) > 1
        }

        stats = {
            "total_duplicate_sv_numbers": len(duplicate_svs),
            "total_consumers_affected": sum(len(consumers) for consumers in duplicate_svs.values()),
            "total_sv_modifications": self.stats.get("sv_modified_count", 0),
            "duplicate_sv_details": {}
        }

        for sv, consumers in duplicate_svs.items():
            stats["duplicate_sv_details"][sv] = {
                "sv_number": sv,
                "consumer_count": len(consumers),
                "consumer_numbers": sorted(consumers)
            }

        return stats

    def print_duplicate_sv_report(self):
        """
        Print a detailed report showing which consumers have the same SV numbers.
        Groups by SV number to show all consumers sharing that SV.
        """
        # Find SV numbers that have multiple consumers
        duplicate_svs = {
            sv: consumers
            for sv, consumers in self.sv_to_consumers_map.items()
            if len(consumers) > 1
        }

        if not duplicate_svs:
            print("\n[INFO] No duplicate SV numbers found across consumers.")
            return

        total_consumers_affected = sum(len(consumers) for consumers in duplicate_svs.values())

        print("\n" + "="*80)
        print("DUPLICATE SV NUMBER REPORT")
        print("="*80)
        print(f"Total duplicate SV numbers: {len(duplicate_svs)}")
        print(f"Total consumers affected: {total_consumers_affected}")
        print(f"Total SV modifications made: {self.stats.get('sv_modified_count', 0)}")
        print("="*80)
        print("\nSV Numbers shared by multiple consumers:")
        print("-" * 80)

        for sv, consumers in sorted(duplicate_svs.items()):
            print(f"\nSV Number: '{sv}'")
            print(f"  Shared by {len(consumers)} consumers:")
            for i, consumer_num in enumerate(sorted(consumers), 1):
                # Show if this consumer's SV was modified
                modified = ""
                if consumer_num in self.duplicate_sv_log:
                    for dup in self.duplicate_sv_log[consumer_num]:
                        if dup["original_sv"] == sv:
                            modified = f" -> modified to '{dup['generated_sv']}'"
                            break
                print(f"    {i}. Consumer: {consumer_num}{modified}")

        print("\n" + "="*80 + "\n")

    def mask_phone_number(self,phone):
        """Mask phone number for security (e.g., 9876543210 -> 98XXXX3210)"""
        if not phone or len(phone) < 6:
            return phone
        return phone[:2] + 'X' * (len(phone) - 4) + phone[-2:]