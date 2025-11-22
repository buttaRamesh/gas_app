"""
Management command to diagnose column mapping issues

Usage:
    python manage.py check_mappings
    python manage.py check_mappings --upload-type PENDING
    python manage.py check_mappings --mapping-id 1
"""

from django.core.management.base import BaseCommand
from order_book.models import ColumnMapping
from order_book.views import OrderBookViewSet


class Command(BaseCommand):
    help = "Check column mappings and diagnose upload issues"

    def add_arguments(self, parser):
        parser.add_argument(
            '--upload-type',
            type=str,
            help='Filter by upload type (PENDING or DELIVERY)',
        )
        parser.add_argument(
            '--mapping-id',
            type=int,
            help='Check specific mapping by ID',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("\n" + "="*70))
        self.stdout.write(self.style.WARNING("  COLUMN MAPPING DIAGNOSTIC"))
        self.stdout.write(self.style.WARNING("="*70 + "\n"))

        upload_type = options.get('upload_type')
        mapping_id = options.get('mapping_id')

        # Get AUTO-GENERATED MAPPING_SCHEMA
        viewset = OrderBookViewSet()
        schema = viewset.MAPPING_SCHEMA

        # Get ColumnMappings from database
        if mapping_id:
            mappings = ColumnMapping.objects.filter(id=mapping_id)
            if not mappings.exists():
                self.stdout.write(self.style.ERROR(f"\n✗ No mapping found with ID {mapping_id}\n"))
                return
        elif upload_type:
            mappings = ColumnMapping.objects.filter(upload_type=upload_type)
        else:
            mappings = ColumnMapping.objects.all()

        if not mappings.exists():
            self.stdout.write(self.style.ERROR("\n✗ No column mappings found in database!\n"))
            self.stdout.write(self.style.NOTICE("Run: python manage.py setup_default_mappings\n"))
            return

        # Check each mapping
        for mapping in mappings:
            self.check_mapping(mapping, schema)

    def check_mapping(self, mapping, schema):
        """Check a single ColumnMapping against the schema"""

        self.stdout.write(self.style.SUCCESS(f"\n{'='*70}"))
        self.stdout.write(self.style.SUCCESS(f"Checking Mapping: {mapping.name} (ID: {mapping.id})"))
        self.stdout.write(self.style.SUCCESS(f"{'='*70}\n"))

        self.stdout.write(f"Upload Type: {self.style.NOTICE(mapping.upload_type)}")
        self.stdout.write(f"Is Active: {self.style.NOTICE(str(mapping.is_active))}")
        self.stdout.write(f"Created: {mapping.created_at.strftime('%Y-%m-%d %H:%M')}\n")

        # Get expected fields from schema
        if mapping.upload_type not in schema:
            self.stdout.write(self.style.ERROR(f"✗ Invalid upload_type: {mapping.upload_type}\n"))
            return

        expected_fields = schema[mapping.upload_type]["fields"]
        required_keys = [f["key"] for f in expected_fields if f["required"]]
        optional_keys = [f["key"] for f in expected_fields if not f["required"]]

        self.stdout.write(self.style.WARNING("\nEXPECTED FIELDS FROM MAPPING_SCHEMA:"))
        self.stdout.write(self.style.WARNING("-" * 70))

        # Show required fields
        self.stdout.write(self.style.ERROR("\nRequired Fields:"))
        for field in expected_fields:
            if field["required"]:
                self.stdout.write(f"  • {field['key']:.<30} {field['label']}")

        # Show optional fields
        self.stdout.write(self.style.NOTICE("\nOptional Fields:"))
        for field in expected_fields:
            if not field["required"]:
                self.stdout.write(f"  • {field['key']:.<30} {field['label']}")

        # Check actual mappings
        self.stdout.write(self.style.WARNING("\n\nACTUAL MAPPINGS IN DATABASE:"))
        self.stdout.write(self.style.WARNING("-" * 70))

        actual_mappings = mapping.mappings

        if not actual_mappings:
            self.stdout.write(self.style.ERROR("\n✗ Mappings dictionary is EMPTY!\n"))
            return

        self.stdout.write(f"\nBackend Key → CSV Column Name")
        self.stdout.write("-" * 70)

        for key, csv_col in actual_mappings.items():
            self.stdout.write(f"{key:.<30} → {csv_col}")

        # Validation
        self.stdout.write(self.style.WARNING("\n\nVALIDATION RESULTS:"))
        self.stdout.write(self.style.WARNING("-" * 70 + "\n"))

        issues_found = False

        # Check for missing required fields
        missing_required = []
        for key in required_keys:
            if key not in actual_mappings:
                missing_required.append(key)
                issues_found = True

        if missing_required:
            self.stdout.write(self.style.ERROR("✗ MISSING REQUIRED MAPPINGS:"))
            for key in missing_required:
                field_info = next(f for f in expected_fields if f["key"] == key)
                self.stdout.write(f"  • {key} ({field_info['label']})")
            self.stdout.write("")
        else:
            self.stdout.write(self.style.SUCCESS("✓ All required fields are mapped"))

        # Check for empty CSV column names
        empty_mappings = []
        for key, csv_col in actual_mappings.items():
            if not csv_col or csv_col.strip() == "":
                empty_mappings.append(key)
                issues_found = True

        if empty_mappings:
            self.stdout.write(self.style.ERROR("\n✗ EMPTY CSV COLUMN NAMES:"))
            for key in empty_mappings:
                self.stdout.write(f"  • {key} → (empty)")
            self.stdout.write("")
        else:
            self.stdout.write(self.style.SUCCESS("✓ All mappings have CSV column names"))

        # Check for unexpected keys
        all_valid_keys = required_keys + optional_keys
        unexpected_keys = []
        for key in actual_mappings.keys():
            if key not in all_valid_keys:
                unexpected_keys.append(key)
                issues_found = True

        if unexpected_keys:
            self.stdout.write(self.style.ERROR("\n✗ UNEXPECTED KEYS (not in MAPPING_SCHEMA):"))
            for key in unexpected_keys:
                self.stdout.write(f"  • {key} → {actual_mappings[key]}")
            self.stdout.write(self.style.NOTICE("\nThese keys will be ignored during upload."))

        # Check for missing optional fields (just informational)
        missing_optional = []
        for key in optional_keys:
            if key not in actual_mappings:
                missing_optional.append(key)

        if missing_optional:
            self.stdout.write(self.style.NOTICE("\nℹ MISSING OPTIONAL MAPPINGS (OK to skip):"))
            for key in missing_optional:
                field_info = next(f for f in expected_fields if f["key"] == key)
                self.stdout.write(f"  • {key} ({field_info['label']})")

        # Summary
        self.stdout.write("\n" + "="*70)
        if issues_found:
            self.stdout.write(self.style.ERROR("✗ ISSUES FOUND - This mapping will cause upload errors!"))
            self.stdout.write(self.style.NOTICE("\nFix by:"))
            self.stdout.write("1. Go to frontend and edit this column mapping")
            self.stdout.write("2. Map all required fields to CSV columns")
            self.stdout.write("3. Or run: python manage.py setup_default_mappings --force")
        else:
            self.stdout.write(self.style.SUCCESS("✓ MAPPING IS VALID - Ready for uploads!"))
        self.stdout.write("="*70 + "\n")
