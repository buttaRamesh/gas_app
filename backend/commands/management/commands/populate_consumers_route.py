import pandas as pd
from django.core.management.base import BaseCommand
from django.db import transaction

from consumers.models import Consumer, ConsumerRouteAssignment
from routes.models import Route

class Command(BaseCommand):
    help = 'Populates ConsumerRouteAssignment based on AreaCodeDesc in the consumer CSV.'

    def add_arguments(self, parser):
        parser.add_argument('csv_file_path', type=str, help='Path to the customers.csv file.')

    @transaction.atomic
    def handle(self, *args, **options):
        csv_file_path = options['csv_file_path']
        self.stdout.write(self.style.SUCCESS(f"--- Populating Consumer Route Assignments from '{csv_file_path}' ---"))

        # --- Step 1: Pre-fetch existing data ---
        self.stdout.write("Step 1: Pre-fetching Consumers, Routes, and existing Assignments...")
        try:
            # Get consumers already in the DB, mapping number to object
            consumer_map = {c.consumer_number: c for c in Consumer.objects.all()}
            # Get routes already in the DB, mapping area_code to object
            route_map = {r.area_code: r for r in Route.objects.all()}
            # Get the set of consumer IDs that already have an assignment
            assigned_consumer_ids = set(ConsumerRouteAssignment.objects.values_list('consumer_id', flat=True))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error fetching initial data: {e}"))
            return

        # --- Step 2: Read CSV and prepare NEW assignments ---
        self.stdout.write("Step 2: Reading CSV and preparing new assignments...")
        try:
            df = pd.read_csv(csv_file_path, dtype=str).fillna('')
        except FileNotFoundError:
            self.stderr.write(self.style.ERROR(f"File not found: {csv_file_path}"))
            return
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error reading CSV: {e}"))
            return

        assignments_to_create = []
        processed_consumer_ids_in_batch = set() # Track consumers processed in this run to avoid duplicates within the batch
        skipped_already_assigned = 0
        skipped_missing_data = 0

        for index, row in df.iterrows():
            consumer_number = row.get('ConsumerNumber')
            area_code_desc = row.get('AreaCodeDesc')

            if not consumer_number or not area_code_desc:
                skipped_missing_data +=1
                continue

            # Extract area_code (part before '-')
            area_code = area_code_desc.split('-')[0].strip()

            # Find corresponding objects using pre-fetched maps
            consumer_obj = consumer_map.get(consumer_number)
            route_obj = route_map.get(area_code)

            if not consumer_obj or not route_obj:
                skipped_missing_data += 1
                # self.stdout.write(self.style.WARNING(f"Row {index+2}: Skipping. Consumer '{consumer_number}' or Route '{area_code}' not found."))
                continue

            # Check if consumer already has an assignment in DB or in this batch
            if consumer_obj.id in assigned_consumer_ids or consumer_obj.id in processed_consumer_ids_in_batch:
                skipped_already_assigned += 1
                continue

            # If all checks pass, prepare the assignment
            assignments_to_create.append(ConsumerRouteAssignment(
                consumer=consumer_obj,
                route=route_obj
            ))
            # Add consumer to processed set for this batch
            processed_consumer_ids_in_batch.add(consumer_obj.id)

        # --- Step 3: Bulk create the new assignments ---
        if assignments_to_create:
            self.stdout.write(f"Step 3: Bulk creating {len(assignments_to_create)} new assignments...")
            try:
                ConsumerRouteAssignment.objects.bulk_create(assignments_to_create, batch_size=2000)
                self.stdout.write(self.style.SUCCESS("Assignments created successfully."))
            except Exception as e:
                 self.stderr.write(self.style.ERROR(f"Error during bulk create: {e}"))
        else:
            self.stdout.write("No new assignments needed based on the CSV data.")

        self.stdout.write("\n--- Summary ---")
        self.stdout.write(f"Processed {len(df)} rows from CSV.")
        self.stdout.write(f"Created {len(assignments_to_create)} new Consumer Route assignments.")
        self.stdout.write(f"Skipped {skipped_already_assigned} rows (Consumer already assigned).")
        self.stdout.write(f"Skipped {skipped_missing_data} rows (Missing Consumer/Route/Data).")
        self.stdout.write(self.style.SUCCESS("--- Population Complete ---"))