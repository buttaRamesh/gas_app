from django.core.management.base import BaseCommand
from order_book.models import ColumnMapping


class Command(BaseCommand):
    help = 'Seed default column mappings for order book uploads'

    def handle(self, *args, **options):
        # Note: Upload type now represents data type, not file format
        # Same mapping works for both CSV and Excel files
        mappings_data = [
            {
                'name': 'Pending Orders',
                'upload_type': 'PENDING',
                'description': 'Column mapping for GetPendingOrderConsumerDetails files (CSV/Excel)',
                'mappings': {
                    'consumer_number': 'LPG ID',
                    'order_no': 'Refill Booking Number',
                    'book_date': 'Date of Refill Booking',
                    'product': 'Product',
                    'refill_type': 'Refill Type',
                    'delivery_flag': 'Delivery Status',
                },
                'is_active': True,
            },
            {
                'name': 'Delivery Marking',
                'upload_type': 'DELIVERY',
                'description': 'Column mapping for RefillDetails files (CSV/Excel)',
                'mappings': {
                    'consumer_number': 'LPG ID',
                    'order_no': 'Refill Booking Number',
                    'book_date': 'Date of Refill Booking',
                    'delivery_date': 'Date of Delivery of Refill',
                    'cash_memo_no': 'Cash Memo Number',
                    'payment_option': 'Payment Mode',
                },
                'is_active': True,
            },
        ]

        created_count = 0
        updated_count = 0

        for mapping_data in mappings_data:
            upload_type = mapping_data['upload_type']

            # Check if mapping already exists
            existing = ColumnMapping.objects.filter(upload_type=upload_type).first()

            if existing:
                # Update existing mapping
                for key, value in mapping_data.items():
                    setattr(existing, key, value)
                existing.save()
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Updated mapping: {mapping_data["name"]}')
                )
            else:
                # Create new mapping
                ColumnMapping.objects.create(**mapping_data)
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created mapping: {mapping_data["name"]}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\nSeeding complete! Created: {created_count}, Updated: {updated_count}'
            )
        )
