import pandas as pd
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Scans the cust.csv file and lists all unique lookup values for review.'

    def add_arguments(self, parser):
        parser.add_argument('csv_file_path', type=str, help='The full path to the cust.csv file.')

    def handle(self, *args, **options):
        csv_file_path = options['csv_file_path']
        self.stdout.write(self.style.SUCCESS(f'--- Scanning "{csv_file_path}" for unique foundational values ---'))

        try:
            df = pd.read_csv(csv_file_path, dtype=str).fillna('')

            lookup_map = {
                'MarketType': 'TypeOfMarket',
                'ConnectionType': 'InDocTypeIdDesc',
                'ConsumerType': 'ConsumerTypeIdDesc',
                'ConsumerCategory': 'Category',
                'BPLType': 'BPLType',
                'DCTType': 'DCTType',
                'Scheme': 'Scheme',
            }

            self.stdout.write(self.style.HTTP_INFO("\nThe following data will be used to populate your foundational tables:\n"))

            self.stdout.write(self.style.SUCCESS("--- Product Category ---"))
            self.stdout.write(self.style.NOTICE("The 'populate_lookups' script will ensure these essential categories exist:"))
            self.stdout.write("- LPG Cylinder")
            self.stdout.write("- Appliance\n")

            self.stdout.write(self.style.SUCCESS("--- Unit ---"))
            self.stdout.write(self.style.NOTICE("The 'populate_lookups' script will ensure these essential units exist:"))
            self.stdout.write("- kg")
            self.stdout.write("- pcs")
            self.stdout.write("- mtr\n")

            for model_name, column_name in lookup_map.items():
                if column_name in df.columns:
                    unique_values = sorted([val for val in df[column_name].unique() if val])
                    self.stdout.write(self.style.SUCCESS(f"--- {model_name} ---"))
                    if unique_values:
                        for value in unique_values:
                            self.stdout.write(f"- {value}")
                    else:
                        self.stdout.write(self.style.WARNING("No values found in this sample."))
                    self.stdout.write("")

        except Exception as e:
            self.stderr.write(self.style.ERROR(f'An error occurred: {e}'))