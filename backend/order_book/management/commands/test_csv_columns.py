from django.core.management.base import BaseCommand
import csv


class Command(BaseCommand):
    help = 'Test CSV column detection'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to CSV file')

    def handle(self, *args, **options):
        csv_path = options['csv_file']

        try:
            with open(csv_path, 'r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                headers = reader.fieldnames or []

                self.stdout.write(self.style.SUCCESS(f'\nCSV Headers found ({len(headers)}):'))
                for i, header in enumerate(headers, 1):
                    self.stdout.write(f'  {i}. "{header}"')

                self.stdout.write('\n' + '='*50)
                self.stdout.write('Expected columns:')
                expected = [
                    'ConsumerNumber',
                    'OrderNo',
                    'BookDate',
                    'Product',  # <- This is the important one!
                    'RefillType',
                    'DeliveryFlag',
                    'LastDelivDate',
                    'PaymentOption'
                ]

                for col in expected:
                    # Check exact match
                    if col in headers:
                        self.stdout.write(self.style.SUCCESS(f'  ✓ {col} - FOUND (exact match)'))
                    else:
                        # Check case-insensitive match
                        headers_lower = {h.lower(): h for h in headers}
                        if col.lower() in headers_lower:
                            actual = headers_lower[col.lower()]
                            self.stdout.write(self.style.WARNING(f'  ~ {col} - Found as "{actual}" (case mismatch)'))
                        else:
                            self.stdout.write(self.style.ERROR(f'  ✗ {col} - NOT FOUND'))

                # Show first row data
                f.seek(0)
                reader = csv.DictReader(f)
                first_row = next(reader, None)

                if first_row:
                    self.stdout.write('\n' + '='*50)
                    self.stdout.write('First row sample:')
                    for key, value in first_row.items():
                        display_value = value[:50] + '...' if len(value) > 50 else value
                        self.stdout.write(f'  {key}: "{display_value}"')

        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'File not found: {csv_path}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))
