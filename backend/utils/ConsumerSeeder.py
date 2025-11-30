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

        table_names = []
        for m in model_order:
            try:
                table_names.append(m._meta.db_table)
            except Exception:
                pass

        if use_truncate:
            # TRUNCATE fast path
            with connection.cursor() as cursor:
                try:
                    cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
                    for tbl in table_names:
                        cursor.execute(f"TRUNCATE TABLE `{tbl}`;")
                    cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
                    return True
                except Exception as e:
                    try:
                        cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
                    except Exception:
                        pass
                    print("[_clear_tables] TRUNCATE path failed, falling back to ORM delete:", e)

        # ORM delete fallback with signals suspended
        # Suspend signals so post_delete/post_save handlers don't run
        self._suspend_signals()
        try:
            # delete in reverse dependency order (children first)
            for m in model_order:
                qs = m.objects.all()
                # delete in chunks to avoid locking for too long
                while True:
                    batch = qs[:BATCH_SIZE]
                    if not batch:
                        break
                    # Use QuerySet.delete() on the slice (invokes bulk delete without iterating)
                    # Note: This still calls cascades at DB level, but signals are suspended.
                    batch.delete()
            return True
        finally:
            self._resume_signals()

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
        from django.apps import apps
        from django.contrib.contenttypes.models import ContentType

        # Lazy model imports (after django.setup())
        Person = apps.get_model("consumers", "Person")
        Address = apps.get_model("address", "Address")
        Contact = apps.get_model("address", "Contact")
        Consumer = apps.get_model("consumers", "Consumer")
        Identification = apps.get_model("consumers", "Identification")
        Assignment = apps.get_model("consumers", "ConsumerRouteAssignment")
        AssignmentHistory = apps.get_model("consumers", "ConsumerRouteAssignmentHistory")
        ConnectionDetails = apps.get_model("connections", "ConnectionDetails")
        Route = apps.get_model("routes", "Route")
        ProductVariant = apps.get_model("products", "ProductVariant")

        # Clear existing if requested
        if clear_existing and not dry_run:
            print("[CLEAR] Clearing consumer-related tables ...")
            ok = self._clear_tables(Person, Address, Contact, Consumer, Identification,
                                    ConnectionDetails, Assignment, AssignmentHistory,
                                    use_truncate=use_truncate)
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

        # -------------------------
        # PREP: ProductVariant map & existing svs
        # -------------------------
        print("[PREP] prefetching products and existing SvNumbers ...")
        all_prod_codes = {str(row.get("ProdCode", "")).strip() for _, row in self.df.iterrows() if str(row.get("ProdCode", "")).strip()}
        product_map = {}
        if all_prod_codes:
            product_qs = ProductVariant.objects.filter(product_code__in=list(all_prod_codes))
            product_map = {p.product_code: p for p in product_qs}

        raw_sv_nums = {str(row.get("SvNumber", "")).strip() for _, row in self.df.iterrows() if str(row.get("SvNumber", "")).strip()}
        existing_db_svs = set()
        if raw_sv_nums:
            existing_db_svs = set(ConnectionDetails.objects.filter(sv_number__in=list(raw_sv_nums)).values_list("sv_number", flat=True))
        used_sv_set = set(existing_db_svs)

        # -------------------------
        # 1) Persons bulk create + ID-order mapping
        # -------------------------
        print("[STEP] Creating Person objects (bulk)...")
        person_objs = []
        for cnum in consumer_numbers:
            first = self.consumers_map[cnum]["first"]
            person_objs.append(Person(
                person_name=first.get("ConsumerName") or None,
                father_name=first.get("FatherName") or None,
                mother_name=first.get("MotherName") or None,
                spouse_name=first.get("SpouseName") or None,
            ))

        self._bulk_create(Person, person_objs)
        n_persons = len(person_objs)
        if n_persons:
            created_persons = list(Person.objects.order_by("-id")[:n_persons])
            created_persons.reverse()
        else:
            created_persons = []
        person_map = {cnum: p for cnum, p in zip(consumer_numbers, created_persons)}
        self.stats["persons_created"] = len(created_persons)

        # -------------------------
        # 2) Address & Contact bulk create
        # -------------------------
        print("[STEP] Creating Address & Contact (bulk)...")
        ct_person = ContentType.objects.get_for_model(Person)
        address_objs = []
        contact_objs = []
        for cnum in consumer_numbers:
            first = self.consumers_map[cnum]["first"]
            person = person_map.get(cnum)
            if not person:
                raise RuntimeError(f"Missing Person for consumer {cnum}")
            pid = person.id
            address_objs.append(Address(
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
            ))
            contact_objs.append(Contact(
                content_type=ct_person,
                object_id=pid,
                email=first.get("EmailId") or None,
                phone_number=self.mask_phone_number(first.get("PhoneNumber")) or None,
                mobile_number=self.mask_phone_number(first.get("MobileNumber")) or None,
            ))

        self._bulk_create(Address, address_objs)
        self._bulk_create(Contact, contact_objs)
        self.stats["addresses_created"] = len(address_objs)
        self.stats["contacts_created"] = len(contact_objs)

        # -------------------------
        # 3) Consumer objects
        # -------------------------
        print("[STEP] Creating Consumer objects (bulk)...")
        consumer_objs = []
        for cnum in consumer_numbers:
            first = self.consumers_map[cnum]["first"]
            consumer_objs.append(Consumer(
                person=person_map[cnum],
                consumer_number=cnum,
                blue_book=(int(first.get("BlueBookNumber")) if str(first.get("BlueBookNumber","")).strip().isdigit() else None),
                lpg_id=(int(first.get("LPGId")) if str(first.get("LPGId","")).strip().isdigit() else None),
                is_kyc_done=(str(first.get("KYCDone","")).strip().upper() in ("KYC DONE","TRUE","1")),
                category=self.lookup_cache.get("Category", {}).get(str(first.get("Category","")).strip()),
                consumer_type=self.lookup_cache.get("ConsumerTypeIdDesc", {}).get(str(first.get("ConsumerTypeIdDesc","")).strip()),
                bpl_type=self.lookup_cache.get("BPLType", {}).get(str(first.get("BPLType","")).strip()),
                dct_type=self.lookup_cache.get("DCTType", {}).get(str(first.get("DCTType","")).strip()),
                opting_status=first.get("Optingstatus") or None,
                scheme=self.lookup_cache.get("Scheme", {}).get(str(first.get("Scheme","")).strip()),
            ))

        self._bulk_create(Consumer, consumer_objs)
        qs_cons = Consumer.objects.filter(consumer_number__in=consumer_numbers).in_bulk(field_name="consumer_number")
        consumer_map = {cnum: qs_cons[cnum] for cnum in consumer_numbers}
        self.stats["consumers_created"] = len(consumer_map)

        # -------------------------
        # 4) Identification
        # -------------------------
        print("[STEP] Creating Identification objects (bulk)...")
        ident_objs = []
        for cnum in consumer_numbers:
            first = self.consumers_map[cnum]["first"]
            ident_objs.append(Identification(
                consumer=consumer_map[cnum],
                ration_card_num=first.get("Rationcardno") or None
            ))
        self._bulk_create(Identification, ident_objs)
        self.stats["identifications_created"] = len(ident_objs)

        # -------------------------
        # 5) Connections with duplicate SvNumber handling
        # -------------------------
        print("[STEP] Creating ConnectionDetails (bulk) and handling duplicate SvNumber ...")
        conn_objs = []
        generated_sv_used = set(used_sv_set) if (used_sv_set := set(existing_db_svs)) is not None else set(existing_db_svs)

        for cnum, pack in self.consumers_map.items():
            consumer = consumer_map.get(cnum)
            if not consumer:
                continue
            for row in pack["rows"]:
                raw_sv = str(row.get("SvNumber", "")).strip()
                final_sv = None
                if raw_sv:
                    candidate = raw_sv
                    if candidate in generated_sv_used:
                        suffix = 1
                        while True:
                            candidate2 = f"{raw_sv}-{suffix}"
                            if candidate2 not in generated_sv_used:
                                candidate = candidate2
                                break
                            suffix += 1
                    final_sv = candidate
                    if final_sv != raw_sv:
                        self.duplicate_sv_log[cnum].append({
                            "original_sv": raw_sv,
                            "generated_sv": final_sv,
                            "row": row
                        })
                        self.stats["sv_modified_count"] += 1
                    generated_sv_used.add(final_sv)
                else:
                    final_sv = None

                prod_code = str(row.get("ProdCode", "")).strip()
                product_variant = product_map.get(prod_code) if prod_code else None
                if prod_code and product_variant is None:
                    self.stats["missing_product_variant"] += 1

                sv_date_val = str(row.get("SvDateInt", "")).strip()
                sv_date = None
                if sv_date_val:
                    try:
                        if len(sv_date_val) == 8 and sv_date_val.isdigit():
                            sv_date = pd.to_datetime(sv_date_val, format="%Y%m%d").date()
                        else:
                            sv_date = pd.to_datetime(sv_date_val).date()
                    except Exception:
                        sv_date = None

                conn_objs.append(ConnectionDetails(
                    consumer=consumer,
                    sv_number=final_sv,
                    sv_date=sv_date,
                    hist_code_description=row.get("HistCodeDescription") or None,
                    connection_type=self.lookup_cache.get("InDocTypeIdDesc", {}).get(str(row.get("InDocTypeIdDesc","")).strip()),
                    product=product_variant,
                    num_of_regulators=(int(row.get("NoOfDpr")) if str(row.get("NoOfDpr","")).strip().isdigit() else 0),
                ))

        self._bulk_create(ConnectionDetails, conn_objs)
        self.stats["connections_created"] = len(conn_objs)

        # -------------------------
        # 6) Fast Route assignment (one route per consumer)
        #    Route can have many consumers. Only bulk-create new assignments (no deletes).
        # -------------------------
        print("[STEP] Fast route assignment (one route per consumer) ...")

        route_codes_needed = set()
        for cnum in consumer_numbers:
            first = self.consumers_map[cnum]["first"]
            route_raw = (first.get("AreaCodeDesc") or first.get("AreaId") or "").strip()
            if route_raw:
                route_code = route_raw.split("-")[0].strip()
                if route_code:
                    route_codes_needed.add(route_code)

        existing_routes = {r.area_code: r for r in Route.objects.filter(area_code__in=list(route_codes_needed))}
        missing_codes = route_codes_needed - set(existing_routes.keys())

        if missing_codes:
            Route.objects.bulk_create([Route(area_code=rc, area_code_description=rc) for rc in missing_codes], batch_size=BATCH_SIZE)
            existing_routes.update({r.area_code: r for r in Route.objects.filter(area_code__in=list(route_codes_needed))})
            self.stats["routes_created"] += len(missing_codes)

        existing_assign_qs = Assignment.objects.select_related("route", "consumer").filter(route__area_code__in=list(route_codes_needed))
        existing_pairs = set((ra.route.area_code, ra.consumer.consumer_number) for ra in existing_assign_qs)

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
        # Final summary
        # -------------------------
        print("\n=== CONSUMER SEED SUMMARY ===")
        for k, v in sorted(self.stats.items()):
            print(f"{k}: {v}")
        print("=============================\n")

        return {"stats": self.stats, "duplicate_sv_log": dict(self.duplicate_sv_log)}

    def mask_phone_number(self,phone):
        """Mask phone number for security (e.g., 9876543210 -> 98XXXX3210)"""
        if not phone or len(phone) < 6:
            return phone
        return phone[:2] + 'X' * (len(phone) - 4) + phone[-2:]