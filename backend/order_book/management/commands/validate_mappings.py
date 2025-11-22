"""
Django management command to validate and fix column mappings

This validates that ColumnMapping keys match what the backend expects,
and offers to fix any incorrect keys.

Usage:
    python manage.py validate_mappings
    python manage.py validate_mappings --fix  # Auto-fix incorrect keys
"""

from django.core.management.base import BaseCommand
from order_book.models import ColumnMapping
from order_book.views import OrderBookViewSet


class Command(BaseCommand):
    help = 'Validate column mapping keys and fix incorrect ones'

    def get_expected_keys(self):
        """Get expected keys from AUTO-GENERATED MAPPING_SCHEMA"""
        viewset = OrderBookViewSet()
        schema = viewset.MAPPING_SCHEMA
        expected_keys = {}
        for upload_type, config in schema.items():
            expected_keys[upload_type] = [field["key"] for field in config["fields"]]
        return expected_keys

    def add_arguments(self, parser):
        parser.add_argument(
            '--fix',
            action='store_true',
            help='Automatically fix incorrect keys',
        )

    def handle(self, *args, **options):
        auto_fix = options['fix']

        self.stdout.write(self.style.WARNING('\n=== COLUMN MAPPING VALIDATION ===\n'))
        self.stdout.write('Using MAPPING_SCHEMA from OrderBookViewSet as source of truth\n')

        # Get expected keys from schema
        expected_keys_dict = self.get_expected_keys()

        mappings = ColumnMapping.objects.all()
        if not mappings.exists():
            self.stdout.write(self.style.ERROR('No column mappings found!'))
            self.stdout.write('Run: python manage.py setup_default_mappings')
            return

        issues_found = False

        for mapping in mappings:
            self.stdout.write(f'\nChecking: {mapping.name} (upload_type={mapping.upload_type})')

            if mapping.upload_type not in expected_keys_dict:
                self.stdout.write(self.style.WARNING(f'  ⚠ Unknown upload_type: {mapping.upload_type}'))
                continue

            expected_keys = expected_keys_dict[mapping.upload_type]
            actual_keys = list(mapping.mappings.keys())

            # Check for incorrect keys
            incorrect_keys = {}
            for key in actual_keys:
                if key not in expected_keys:
                    # Check if this is a known mistake
                    if key in self.KEY_FIXES:
                        correct_key = self.KEY_FIXES[key]
                        incorrect_keys[key] = correct_key
                        issues_found = True
                        self.stdout.write(
                            self.style.ERROR(f'  ✗ Invalid key: "{key}" → should be "{correct_key}"')
                        )
                    else:
                        issues_found = True
                        self.stdout.write(
                            self.style.WARNING(f'  ⚠ Unexpected key: "{key}"')
                        )

            # Check for missing keys
            missing_keys = [k for k in expected_keys if k not in actual_keys]
            for key in missing_keys:
                # Check if they used an incorrect version of this key
                if key not in incorrect_keys.values():
                    self.stdout.write(
                        self.style.WARNING(f'  ⚠ Missing key: "{key}"')
                    )

            # Fix if requested
            if auto_fix and incorrect_keys:
                new_mappings = {}
                for old_key, value in mapping.mappings.items():
                    new_key = incorrect_keys.get(old_key, old_key)
                    new_mappings[new_key] = value

                mapping.mappings = new_mappings
                mapping.save()
                self.stdout.write(self.style.SUCCESS(f'  ✓ Fixed {len(incorrect_keys)} key(s)'))

            if not incorrect_keys and not missing_keys:
                self.stdout.write(self.style.SUCCESS('  ✓ All keys are correct'))

        # Summary
        if issues_found:
            self.stdout.write(self.style.WARNING('\n=== ISSUES FOUND ==='))
            if not auto_fix:
                self.stdout.write('\nTo auto-fix issues, run:')
                self.stdout.write('  python manage.py validate_mappings --fix\n')
        else:
            self.stdout.write(self.style.SUCCESS('\n=== ALL MAPPINGS ARE VALID ===\n'))

        # Show expected keys for reference
        self.stdout.write('\n=== EXPECTED KEYS REFERENCE ===')
        for upload_type, keys in expected_keys_dict.items():
            self.stdout.write(f'\n{upload_type}:')
            for key in keys:
                self.stdout.write(f'  - {key}')
        self.stdout.write('')
