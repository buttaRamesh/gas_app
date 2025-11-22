"""
Django management command to clean order_book data

This command deletes OrderBook and PaymentInfo records.
Optionally deletes lookup tables (RefillType, DeliveryFlag, PaymentOption) and configuration tables (ColumnMapping, FieldConfiguration).

Usage:
    python manage.py clean_orderbook_data                      # Delete OrderBook and PaymentInfo only
    python manage.py clean_orderbook_data --include-lookups    # Also delete lookup tables
    python manage.py clean_orderbook_data --all                # Delete everything including ColumnMapping and FieldConfiguration
    python manage.py clean_orderbook_data --force              # Skip confirmation prompt
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from order_book.models import OrderBook, RefillType, DeliveryFlag, PaymentOption, ColumnMapping, PaymentInfo, FieldConfiguration


class Command(BaseCommand):
    help = 'Clean order_book database tables'

    def add_arguments(self, parser):
        parser.add_argument(
            '--include-lookups',
            action='store_true',
            help='Also delete lookup data (RefillType, DeliveryFlag, PaymentOption)',
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Delete all order_book data including column mappings and field configurations',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Skip confirmation prompt',
        )

    def handle(self, *args, **options):
        include_lookups = options['include_lookups']
        delete_all = options['all']
        force = options['force']

        # If --all is specified, include lookups automatically
        if delete_all:
            include_lookups = True

        # Show what will be deleted
        self.stdout.write(self.style.WARNING('\n=== ORDER BOOK DATA CLEANUP ===\n'))

        orderbook_count = OrderBook.objects.count()
        payment_info_count = PaymentInfo.objects.count()
        refill_count = RefillType.objects.count()
        flag_count = DeliveryFlag.objects.count()
        payment_opt_count = PaymentOption.objects.count()
        mapping_count = ColumnMapping.objects.count()
        field_config_count = FieldConfiguration.objects.count()

        self.stdout.write(f'OrderBook records: {orderbook_count}')
        self.stdout.write(f'PaymentInfo records: {payment_info_count}')

        if include_lookups:
            self.stdout.write(f'RefillType records: {refill_count}')
            self.stdout.write(f'DeliveryFlag records: {flag_count}')
            self.stdout.write(f'PaymentOption records: {payment_opt_count}')

        if delete_all:
            self.stdout.write(f'ColumnMapping records: {mapping_count}')
            self.stdout.write(f'FieldConfiguration records: {field_config_count}')

        # Check if there's anything to delete
        total_to_delete = orderbook_count + payment_info_count
        if include_lookups:
            total_to_delete += refill_count + flag_count + payment_opt_count
        if delete_all:
            total_to_delete += mapping_count + field_config_count

        if total_to_delete == 0:
            self.stdout.write(self.style.SUCCESS('\nNo records to delete. Database is already clean!'))
            return

        # Confirmation
        if not force:
            self.stdout.write(self.style.WARNING(f'\nTotal records to delete: {total_to_delete}'))
            confirm = input('\nAre you sure you want to delete these records? (yes/no): ')
            if confirm.lower() not in ['yes', 'y']:
                self.stdout.write(self.style.ERROR('\nOperation cancelled.'))
                return

        # Delete data in transaction
        try:
            with transaction.atomic():
                deleted_counts = {}

                # Delete PaymentInfo first (has FK to OrderBook)
                if payment_info_count > 0:
                    deleted_counts['PaymentInfo'] = PaymentInfo.objects.all().delete()[0]
                    self.stdout.write(self.style.SUCCESS(f'✓ Deleted {deleted_counts["PaymentInfo"]} PaymentInfo records'))

                # Delete OrderBook records
                if orderbook_count > 0:
                    deleted_counts['OrderBook'] = OrderBook.objects.all().delete()[0]
                    self.stdout.write(self.style.SUCCESS(f'✓ Deleted {deleted_counts["OrderBook"]} OrderBook records'))

                # Delete lookups if requested
                if include_lookups:
                    if refill_count > 0:
                        deleted_counts['RefillType'] = RefillType.objects.all().delete()[0]
                        self.stdout.write(self.style.SUCCESS(f'✓ Deleted {deleted_counts["RefillType"]} RefillType records'))

                    if flag_count > 0:
                        deleted_counts['DeliveryFlag'] = DeliveryFlag.objects.all().delete()[0]
                        self.stdout.write(self.style.SUCCESS(f'✓ Deleted {deleted_counts["DeliveryFlag"]} DeliveryFlag records'))

                    if payment_opt_count > 0:
                        deleted_counts['PaymentOption'] = PaymentOption.objects.all().delete()[0]
                        self.stdout.write(self.style.SUCCESS(f'✓ Deleted {deleted_counts["PaymentOption"]} PaymentOption records'))

                # Delete column mappings and field configurations if --all specified
                if delete_all:
                    if mapping_count > 0:
                        deleted_counts['ColumnMapping'] = ColumnMapping.objects.all().delete()[0]
                        self.stdout.write(self.style.SUCCESS(f'✓ Deleted {deleted_counts["ColumnMapping"]} ColumnMapping records'))

                    if field_config_count > 0:
                        deleted_counts['FieldConfiguration'] = FieldConfiguration.objects.all().delete()[0]
                        self.stdout.write(self.style.SUCCESS(f'✓ Deleted {deleted_counts["FieldConfiguration"]} FieldConfiguration records'))

                total_deleted = sum(deleted_counts.values())
                self.stdout.write(self.style.SUCCESS(f'\n✓ Successfully deleted {total_deleted} total records'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\n✗ Error during deletion: {str(e)}'))
            raise

        self.stdout.write(self.style.SUCCESS('\n=== CLEANUP COMPLETE ===\n'))
