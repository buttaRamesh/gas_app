from django.core.management.base import BaseCommand
from order_book.models import OrderBook, PaymentInfo


class Command(BaseCommand):
    help = 'Delete all OrderBook records (and related PaymentInfo) from the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirm deletion without prompting',
        )

    def handle(self, *args, **options):
        # Count existing records
        orderbook_count = OrderBook.objects.count()
        payment_info_count = PaymentInfo.objects.count()

        if orderbook_count == 0:
            self.stdout.write(self.style.WARNING('No OrderBook records found.'))
            return

        self.stdout.write(self.style.WARNING(f'Found {orderbook_count} OrderBook records.'))
        if payment_info_count > 0:
            self.stdout.write(self.style.WARNING(f'Found {payment_info_count} PaymentInfo records (will be deleted with OrderBook).'))

        # Confirm deletion
        if not options['confirm']:
            total_records = orderbook_count + payment_info_count
            confirmation = input(f'Are you sure you want to delete all {total_records} records? (yes/no): ')
            if confirmation.lower() != 'yes':
                self.stdout.write(self.style.ERROR('Operation cancelled.'))
                return

        # Delete all records
        self.stdout.write('Deleting OrderBook and related PaymentInfo records...')
        deleted_count, deleted_details = OrderBook.objects.all().delete()

        self.stdout.write(
            self.style.SUCCESS(f'Successfully deleted {deleted_count} records total.')
        )
