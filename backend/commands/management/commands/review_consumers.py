import pandas as pd
from datetime import datetime
from django.core.management.base import BaseCommand

from lookups.models import ConsumerCategory, ConsumerType, ConnectionType
from products.models import Product

class Command(BaseCommand):
    help = 'Scans the consumer CSV and prints a full review of the data to be imported.'

    def add_arguments(self, parser):
        parser.add_argument('csv_file_path', type=str, help='The full path to the cust.csv file.')

    def handle(self, *args, **options):
        csv_file_path = options['csv_file_path']
        self.stdout.write(self.style.SUCCESS(f'--- Starting Full Review of "{csv_file_path}" ---'))

        error_count = 0
        processed_rows = 0

        try:
            df = pd.read_csv(csv_file_path, dtype=str).fillna('')
            total_rows = len(df)
            
            for index, row in df.iterrows():
                processed_rows += 1
                row_has_error = False
                self.stdout.write("----------------------------------------------------")
                self.stdout.write(self.style.HTTP_INFO(f"Reviewing Row {index + 2} | ConsumerNumber: {row['ConsumerNumber']}"))

                try:
                    consumer_category = ConsumerCategory.objects.get(name=row['Category'])
                    consumer_type = ConsumerType.objects.get(name=row['ConsumerTypeIdDesc'])
                    connection_type = ConnectionType.objects.get(name=row['InDocTypeIdDesc'])
                    Product.objects.get(name='LPG Cylinder')
                    
                except Exception as e:
                    self.stderr.write(self.style.ERROR(f"  [VALIDATION FAILED] Could not find required lookup data: {e}"))
                    self.stderr.write(self.style.WARNING(f"  (Have you run 'populate_lookups' first?)"))
                    error_count += 1
                    row_has_error = True

                if not row_has_error:
                    self.stdout.write(self.style.SUCCESS("  [VALIDATION PASSED] Foundational data looks OK."))
                    
                    self.stdout.write("\n  -> Would Create Contact:")
                    self.stdout.write(f"     - Mobile: {row['MobileNumber']}")
                    self.stdout.write(f"     - Phone: {row['PhoneNumber']}")
                    self.stdout.write(f"     - Email: {row['EmailId']}")
                    
                    self.stdout.write("\n  -> Would Create Address:")
                    self.stdout.write(f"     - House No: {row['HouseNo']}")
                    self.stdout.write(f"     - Flat/Building Name: {row['HouseNameFlatNumber']}")
                    self.stdout.write(f"     - Complex: {row['HousingComplexBuilding']}")
                    self.stdout.write(f"     - Street: {row['StreetRoadName']}")
                    self.stdout.write(f"     - Landmark: {row['AreaLandMark']}")
                    self.stdout.write(f"     - City: {row['CityTownVillage']}")
                    self.stdout.write(f"     - District: {row['District']}")
                    self.stdout.write(f"     - Pin Code: {row['PinCode']}")
                    self.stdout.write(f"     - Full Address Text: {row['Address']}")

                    self.stdout.write("\n  -> Would Create Customer (Consumer):")
                    self.stdout.write(f"     - Name: {row['ConsumerName']}")
                    self.stdout.write(f"     - Number: {row['ConsumerNumber']}")
                    self.stdout.write(f"     - Father's Name: {row['FatherName']}")
                    self.stdout.write(f"     - Mother's Name: {row['MotherName']}")
                    self.stdout.write(f"     - Category: '{consumer_category.name}'")
                    kyc_status = True if row.get('KYCDone') == 'KYC Done' else False
                    self.stdout.write(f"     - KYC Status: {kyc_status}")

                    self.stdout.write("\n  -> Would Create Connection (linked to Customer):")
                    self.stdout.write(f"     - SV Number: {row['SvNumber']}")
                    self.stdout.write(f"     - SV Date: {row['SvDateInt']}")
                    self.stdout.write(f"     - Type: '{connection_type.name}'")
                    # --- NEWLY ADDED LINE ---
                    self.stdout.write(f"     - History Description: {row['HistCodeDescription']}")
            
            self.stdout.write("----------------------------------------------------")
            self.stdout.write(self.style.SUCCESS("\n--- Review Complete ---"))
            self.stdout.write(f"Processed {processed_rows}/{total_rows} rows.")
            if error_count > 0:
                self.stderr.write(self.style.ERROR(f"Found {error_count} rows with validation errors."))
            else:
                self.stdout.write(self.style.SUCCESS("No validation errors found. Ready for population."))

        except Exception as e:
            self.stderr.write(self.style.ERROR(f'A critical error occurred: {e}'))