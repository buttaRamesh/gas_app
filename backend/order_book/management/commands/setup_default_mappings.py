"""
Django management command to create default column mappings

This creates default ColumnMapping configurations for:
- PENDING: For uploading pending orders
- DELIVERY: For marking orders as delivered

Usage:
    python manage.py setup_default_mappings
    python manage.py setup_default_mappings --force  # Recreate if exists
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from order_book.models import ColumnMapping
from order_book.views import OrderBookViewSet


class Command(BaseCommand):
    help = 'Create default column mappings for PENDING and DELIVERY upload types'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force recreate mappings even if they exist',
        )

    def handle(self, *args, **options):
        force = options['force']
        User = get_user_model()

        # Try to get a user for created_by (optional)
        user = User.objects.first()

        self.stdout.write(self.style.WARNING('\n=== CREATING DEFAULT COLUMN MAPPINGS ===\n'))
        self.stdout.write('Using AUTO-GENERATED MAPPING_SCHEMA from OrderBook model\n')

        # Get the schema from the ViewSet (AUTO-GENERATED FROM MODEL!)
        viewset = OrderBookViewSet()
        schema = viewset.MAPPING_SCHEMA

        # Generate default mappings from schema
        # Default CSV column names follow PascalCase convention
        def generate_default_csv_name(key):
            """Convert snake_case key to PascalCase CSV column name"""
            words = key.split('_')
            return ''.join(word.capitalize() for word in words)

        pending_mapping = {}
        for field in schema["PENDING"]["fields"]:
            pending_mapping[field["key"]] = generate_default_csv_name(field["key"])

        delivery_mapping = {}
        for field in schema["DELIVERY"]["fields"]:
            delivery_mapping[field["key"]] = generate_default_csv_name(field["key"])

        # Create or update PENDING mapping
        pending_exists = ColumnMapping.objects.filter(upload_type='PENDING').exists()
        if pending_exists and not force:
            self.stdout.write(self.style.WARNING('✓ PENDING mapping already exists (use --force to recreate)'))
        else:
            if pending_exists:
                ColumnMapping.objects.filter(upload_type='PENDING').delete()
                self.stdout.write(self.style.WARNING('  Deleted existing PENDING mapping'))

            ColumnMapping.objects.create(
                name="Default Pending Orders Mapping",
                upload_type="PENDING",
                description="Default column mapping for pending orders upload",
                mappings=pending_mapping,
                is_active=True,
                created_by=user,
            )
            self.stdout.write(self.style.SUCCESS('✓ Created PENDING mapping'))
            self.stdout.write(f'  Mappings: {pending_mapping}')

        # Create or update DELIVERY mapping
        delivery_exists = ColumnMapping.objects.filter(upload_type='DELIVERY').exists()
        if delivery_exists and not force:
            self.stdout.write(self.style.WARNING('✓ DELIVERY mapping already exists (use --force to recreate)'))
        else:
            if delivery_exists:
                ColumnMapping.objects.filter(upload_type='DELIVERY').delete()
                self.stdout.write(self.style.WARNING('  Deleted existing DELIVERY mapping'))

            ColumnMapping.objects.create(
                name="Default Delivery Marking Mapping",
                upload_type="DELIVERY",
                description="Default column mapping for delivery marking upload",
                mappings=delivery_mapping,
                is_active=True,
                created_by=user,
            )
            self.stdout.write(self.style.SUCCESS('✓ Created DELIVERY mapping'))
            self.stdout.write(f'  Mappings: {delivery_mapping}')

        self.stdout.write(self.style.SUCCESS('\n=== SETUP COMPLETE ==='))
        self.stdout.write('\nYou can now:')
        self.stdout.write('1. Upload pending orders to /api/orderbooks/upload_pending/')
        self.stdout.write('2. Mark deliveries to /api/orderbooks/upload_deliveries/')
        self.stdout.write('\nTo customize mappings, edit them in Django Admin → Column Mappings\n')
