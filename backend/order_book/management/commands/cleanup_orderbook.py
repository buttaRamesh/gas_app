"""
Management command to clean all order_book related data

Usage:
    python manage.py cleanup_orderbook                    # Interactive mode with confirmations
    python manage.py cleanup_orderbook --all --force      # Clean everything without confirmation
    python manage.py cleanup_orderbook --orders           # Clean only orders
    python manage.py cleanup_orderbook --configs          # Clean only configurations
    python manage.py cleanup_orderbook --lookups          # Clean only lookup tables
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from order_book.models import (
    OrderBook,
    PaymentInfo,
    ColumnMapping,
    FieldConfiguration,
    RefillType,
    DeliveryFlag,
    PaymentOption,
)


class Command(BaseCommand):
    help = "Clean all order_book app related data with various options"

    def add_arguments(self, parser):
        # What to clean
        parser.add_argument(
            '--all',
            action='store_true',
            help='Clean everything (orders, configs, lookups)',
        )
        parser.add_argument(
            '--orders',
            action='store_true',
            help='Clean only OrderBook and PaymentInfo records',
        )
        parser.add_argument(
            '--configs',
            action='store_true',
            help='Clean only ColumnMapping and FieldConfiguration',
        )
        parser.add_argument(
            '--lookups',
            action='store_true',
            help='Clean only lookup tables (RefillType, DeliveryFlag, PaymentOption)',
        )

        # Safety options
        parser.add_argument(
            '--force',
            action='store_true',
            help='Skip confirmation prompts (use with caution!)',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("\n" + "="*70))
        self.stdout.write(self.style.WARNING("  ORDER BOOK CLEANUP UTILITY"))
        self.stdout.write(self.style.WARNING("="*70 + "\n"))

        # Determine what to clean
        clean_orders = options['orders'] or options['all']
        clean_configs = options['configs'] or options['all']
        clean_lookups = options['lookups'] or options['all']

        # If nothing specified, default to interactive mode for all
        if not (clean_orders or clean_configs or clean_lookups):
            self.stdout.write(self.style.NOTICE(
                "No specific cleanup option provided. Entering interactive mode...\n"
            ))
            clean_orders = True
            clean_configs = True
            clean_lookups = True

        force = options['force']
        dry_run = options['dry_run']

        if dry_run:
            self.stdout.write(self.style.NOTICE("DRY RUN MODE - No data will be deleted\n"))

        # Show current statistics
        self.show_statistics()

        # Collect items to delete
        deletions = []

        if clean_orders:
            deletions.extend([
                ('OrderBook records', OrderBook.objects.all()),
                ('PaymentInfo records', PaymentInfo.objects.all()),
            ])

        if clean_configs:
            deletions.extend([
                ('ColumnMapping configurations', ColumnMapping.objects.all()),
                ('FieldConfiguration settings', FieldConfiguration.objects.all()),
            ])

        if clean_lookups:
            deletions.extend([
                ('RefillType lookup entries', RefillType.objects.all()),
                ('DeliveryFlag lookup entries', DeliveryFlag.objects.all()),
                ('PaymentOption lookup entries', PaymentOption.objects.all()),
            ])

        # Show what will be deleted
        self.stdout.write(self.style.WARNING("\nThe following will be deleted:\n"))
        total_count = 0
        for label, queryset in deletions:
            count = queryset.count()
            total_count += count
            if count > 0:
                self.stdout.write(f"  • {label}: {self.style.ERROR(str(count))}")
            else:
                self.stdout.write(f"  • {label}: {count}")

        if total_count == 0:
            self.stdout.write(self.style.SUCCESS("\n✓ No data to clean. Database is already clean!\n"))
            return

        self.stdout.write(f"\n  {self.style.WARNING('TOTAL RECORDS TO DELETE: ' + str(total_count))}\n")

        # Confirmation
        if not force and not dry_run:
            self.stdout.write(self.style.ERROR(
                "⚠️  WARNING: This action cannot be undone!\n"
            ))
            confirm = input("Are you sure you want to delete all this data? Type 'yes' to confirm: ")
            if confirm.lower() != 'yes':
                self.stdout.write(self.style.NOTICE("\n✗ Cleanup cancelled by user.\n"))
                return

        # Perform deletion
        if dry_run:
            self.stdout.write(self.style.NOTICE("\n✓ Dry run complete. No data was deleted.\n"))
            return

        try:
            with transaction.atomic():
                self.stdout.write(self.style.NOTICE("\n🗑️  Deleting data...\n"))

                deleted_counts = {}
                for label, queryset in deletions:
                    count = queryset.count()
                    if count > 0:
                        queryset.delete()
                        deleted_counts[label] = count
                        self.stdout.write(f"  ✓ Deleted {count} {label}")

                self.stdout.write(self.style.SUCCESS(
                    f"\n✓ Successfully deleted {sum(deleted_counts.values())} total records!\n"
                ))

                # Show final statistics
                self.stdout.write(self.style.NOTICE("\nFinal Statistics:"))
                self.show_statistics()

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"\n✗ Error during cleanup: {str(e)}\n"))
            raise

    def show_statistics(self):
        """Display current database statistics"""
        stats = [
            ("OrderBook", OrderBook.objects.count()),
            ("PaymentInfo", PaymentInfo.objects.count()),
            ("ColumnMapping", ColumnMapping.objects.count()),
            ("FieldConfiguration", FieldConfiguration.objects.count()),
            ("RefillType", RefillType.objects.count()),
            ("DeliveryFlag", DeliveryFlag.objects.count()),
            ("PaymentOption", PaymentOption.objects.count()),
        ]

        self.stdout.write("")
        for label, count in stats:
            color = self.style.SUCCESS if count == 0 else self.style.NOTICE
            self.stdout.write(f"  {label:.<30} {color(str(count))}")
        self.stdout.write("")
