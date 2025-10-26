import pandas as pd
from django.core.management.base import BaseCommand
from delivery.models import DeliveryPerson

class Command(BaseCommand):
    help = 'Populates DeliveryPerson data from DPS.csv (name only).'

    def add_arguments(self, parser):
        parser.add_argument('dps_csv_path', type=str, help='Path to the DPS.csv file.')

    def handle(self, *args, **options):
        dps_csv_path = options['dps_csv_path']
        self.stdout.write(self.style.SUCCESS(f"--- Populating Delivery Persons from '{dps_csv_path}' ---"))

        try:
            # Assuming the CSV has a header row with the column name 'dp_name'
            dps_df = pd.read_csv(dps_csv_path, dtype=str).fillna('')
            
            created_count = 0
            found_count = 0
            
            for name in dps_df['name'].unique():
                if not name: # Skip blank names
                    continue
                    
                dp, created = DeliveryPerson.objects.get_or_create(name=name)
                if created:
                    created_count += 1
                else:
                    found_count += 1
                    
            self.stdout.write(f"Processed {len(dps_df['name'].unique())} unique names.")
            self.stdout.write(self.style.SUCCESS(f"Created {created_count} new Delivery Persons."))
            self.stdout.write(self.style.NOTICE(f"Found {found_count} existing Delivery Persons."))
            self.stdout.write(self.style.SUCCESS("--- Delivery Person population complete ---"))

        except FileNotFoundError:
            self.stderr.write(self.style.ERROR(f"File not found: {dps_csv_path}"))
        except KeyError:
             self.stderr.write(self.style.ERROR("CSV file must contain a 'name' column."))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"An error occurred: {e}"))