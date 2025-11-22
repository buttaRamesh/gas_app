"""
Management command to migrate upload types from 4 to 2

This command updates existing FieldConfiguration and ColumnMapping records
to use the new simplified upload type system (PENDING, DELIVERY instead of
PENDING_CSV, PENDING_EXCEL, DELIVERY_CSV, DELIVERY_EXCEL).
"""

from django.core.management.base import BaseCommand
from order_book.models import FieldConfiguration, ColumnMapping


class Command(BaseCommand):
    help = 'Migrate upload types from 4 types to 2 types (PENDING, DELIVERY)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be changed without actually changing it',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']

        # Mapping: old_value -> new_value
        upload_type_mapping = {
            'PENDING_CSV': 'PENDING',
            'PENDING_EXCEL': 'PENDING',
            'DELIVERY_CSV': 'DELIVERY',
            'DELIVERY_EXCEL': 'DELIVERY',
        }

        self.stdout.write(
            self.style.WARNING(
                f"\n{'[DRY RUN] ' if dry_run else ''}Migrating upload types..."
            )
        )

        # Migrate FieldConfiguration records
        fc_updated = 0
        for old_type, new_type in upload_type_mapping.items():
            count = FieldConfiguration.objects.filter(upload_type=old_type).count()
            if count > 0:
                self.stdout.write(
                    f"  Found {count} FieldConfiguration records with upload_type='{old_type}'"
                )
                if not dry_run:
                    FieldConfiguration.objects.filter(upload_type=old_type).update(
                        upload_type=new_type
                    )
                    fc_updated += count

        # Migrate ColumnMapping records
        cm_updated = 0
        for old_type, new_type in upload_type_mapping.items():
            count = ColumnMapping.objects.filter(upload_type=old_type).count()
            if count > 0:
                self.stdout.write(
                    f"  Found {count} ColumnMapping records with upload_type='{old_type}'"
                )
                if not dry_run:
                    ColumnMapping.objects.filter(upload_type=old_type).update(
                        upload_type=new_type
                    )
                    cm_updated += count

        if not dry_run:
            self.stdout.write(
                self.style.SUCCESS(
                    f"\nMigration complete!"
                    f"\n  FieldConfiguration: {fc_updated} records updated"
                    f"\n  ColumnMapping: {cm_updated} records updated"
                )
            )

            # Check for duplicates
            self.stdout.write("\nChecking for duplicate records...")

            # Handle FieldConfiguration duplicates
            seen = set()
            duplicates_removed = 0
            for config in FieldConfiguration.objects.all().order_by(
                'upload_type', 'field_name', 'id'
            ):
                key = (config.upload_type, config.field_name)
                if key in seen:
                    config.delete()
                    duplicates_removed += 1
                else:
                    seen.add(key)

            if duplicates_removed > 0:
                self.stdout.write(
                    self.style.WARNING(
                        f"  Removed {duplicates_removed} duplicate FieldConfiguration records"
                    )
                )

            # Handle ColumnMapping duplicates (keep most recently updated)
            seen_mappings = set()
            mappings_removed = 0
            for mapping in ColumnMapping.objects.all().order_by(
                'upload_type', '-updated_at'
            ):
                if mapping.upload_type in seen_mappings:
                    mapping.delete()
                    mappings_removed += 1
                else:
                    seen_mappings.add(mapping.upload_type)

            if mappings_removed > 0:
                self.stdout.write(
                    self.style.WARNING(
                        f"  Removed {mappings_removed} duplicate ColumnMapping records"
                    )
                )

            if duplicates_removed == 0 and mappings_removed == 0:
                self.stdout.write(
                    self.style.SUCCESS("  No duplicates found")
                )

            self.stdout.write(
                self.style.SUCCESS(
                    "\n✓ Upload type migration completed successfully!"
                )
            )
        else:
            self.stdout.write(
                self.style.WARNING(
                    "\n[DRY RUN] No changes made. Run without --dry-run to apply changes."
                )
            )
