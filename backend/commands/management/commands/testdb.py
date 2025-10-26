import random
from django.core.management.base import BaseCommand
from consumers.models import Consumer

class Command(BaseCommand):
    help = 'Performs a random spot check on the database by fetching a consumer and their related data.'

    def add_arguments(self, parser):
        parser.add_argument(
            'count',
            type=int,
            nargs='?',
            default=1,
            help='(Optional) The number of random consumers to test. Defaults to 1.'
        )

    def handle(self, *args, **options):
        count_to_test = options['count']
        self.stdout.write(self.style.HTTP_INFO(f"--- Performing Random Spot Check for {count_to_test} Consumer(s) ---"))

        # Get all consumer primary keys into a list
        consumer_pks = list(Consumer.objects.values_list('pk', flat=True))

        if not consumer_pks:
            self.stdout.write(self.style.WARNING("No consumers found in the database to test."))
            return

        # Select a random sample of primary keys
        # Use min() to avoid error if count_to_test is larger than the number of consumers
        random_pks_to_test = random.sample(consumer_pks, min(count_to_test, len(consumer_pks)))

        for i, pk in enumerate(random_pks_to_test):
            self.stdout.write(self.style.HTTP_INFO(f"\n--- Test #{i + 1}: Fetching data for Consumer with ID: {pk} ---"))
            
            try:
                consumer = Consumer.objects.get(pk=pk)

                # --- Print Consumer Details ---
                self.stdout.write(self.style.SUCCESS("## Consumer Details"))
                self.stdout.write(f"  - Name: {consumer.consumer_name}")
                self.stdout.write(f"  - Number: {consumer.consumer_number}")
                self.stdout.write(f"  - Category: {consumer.category.name if consumer.category else 'N/A'}")
                self.stdout.write(f"  - KYC Status: {consumer.is_kyc_done}")
                self.stdout.write(f"  - Ration Card: {consumer.ration_card_num or 'N/A'}")

                # --- Print Connection Details ---
                self.stdout.write(self.style.SUCCESS("\n## Connection Details"))
                connections = consumer.connections.all()
                if connections:
                    for conn in connections:
                        self.stdout.write(f"  - SV Number: {conn.sv_number}")
                        self.stdout.write(f"    - Date: {conn.sv_date}")
                        self.stdout.write(f"    - Product: {conn.product.name if conn.product else 'N/A'}")
                else:
                    self.stdout.write(self.style.WARNING("  No connections found for this consumer."))

                # --- Print Address Details ---
                self.stdout.write(self.style.SUCCESS("\n## Address Details"))
                addresses = consumer.addresses.all()
                if addresses:
                    for address in addresses:
                        self.stdout.write(f"  - Full Text: {address.address_text or 'N/A'}")
                else:
                    self.stdout.write(self.style.WARNING("  No address found for this consumer."))

                # --- Print Contact Details ---
                self.stdout.write(self.style.SUCCESS("\n## Contact Details"))
                contacts = consumer.contacts.all()
                if contacts:
                    for contact in contacts:
                        self.stdout.write(f"  - Mobile: {contact.mobile_number or 'N/A'}")
                        self.stdout.write(f"  - Email: {contact.email or 'N/A'}")
                else:
                    self.stdout.write(self.style.WARNING("  No contact info found for this consumer."))

            except Consumer.DoesNotExist:
                self.stderr.write(self.style.ERROR(f"Could not find Consumer with ID {pk}."))
        
        self.stdout.write(self.style.SUCCESS("\n--- Spot check complete. ---"))