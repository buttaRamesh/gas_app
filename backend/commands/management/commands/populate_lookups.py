import pandas as pd
from django.core.management.base import BaseCommand

from lookups.models import MarketType, ConnectionType, ConsumerType, BPLType, DCTType, ConsumerCategory
from schemes.models import Scheme
from products.models import Product, Unit

class Command(BaseCommand):
    help = 'Populates all foundational data including lookups, units, and product categories.'

    def add_arguments(self, parser):
        parser.add_argument('csv_file_path', type=str, help='The full path to the cust.csv file.')

    def handle(self, *args, **options):
        csv_file_path = options['csv_file_path']
        self.stdout.write(self.style.SUCCESS('--- Starting Foundational Data Population ---'))

        try:
            self.stdout.write('Step 1: Reading CSV and collecting unique values...')
            df = pd.read_csv(csv_file_path, dtype=str).fillna('')

            market_types = df['TypeOfMarket'].unique()
            connection_types = df['InDocTypeIdDesc'].unique()
            consumer_types = df['ConsumerTypeIdDesc'].unique()
            consumer_categories = df['Category'].unique()
            bpl_types = df['BPLType'].unique()
            dct_types = df['DCTType'].unique()
            schemes = df['Scheme'].unique()
            
            self.stdout.write(self.style.SUCCESS('...Done reading CSV.'))
            self.stdout.write('Step 2: Populating database tables...')

            Product.objects.get_or_create(name='LPG Cylinder')
            Product.objects.get_or_create(name='Appliance')
            self.stdout.write("Ensured essential Product Categories ('LPG Cylinder', 'Appliance') exist.")

            Unit.objects.get_or_create(short_name='kg', defaults={'description': 'Kilogram'})
            Unit.objects.get_or_create(short_name='pcs', defaults={'description': 'Pieces'})
            Unit.objects.get_or_create(short_name='mtr', defaults={'description': 'Meter'})
            self.stdout.write('Ensured essential Units (kg, pcs, mtr) exist.')

            for name in market_types:
                if name: MarketType.objects.get_or_create(name=name)
            self.stdout.write(f"Processed Market Types.")

            for name in connection_types:
                if name: ConnectionType.objects.get_or_create(name=name)
            self.stdout.write(f"Processed Connection Types.")

            for name in consumer_types:
                if name: ConsumerType.objects.get_or_create(name=name)
            self.stdout.write(f"Processed Consumer Types.")

            for name in consumer_categories:
                if name: ConsumerCategory.objects.get_or_create(name=name)
            self.stdout.write(f"Processed Consumer Categories.")

            for name in bpl_types:
                if name: BPLType.objects.get_or_create(name=name)
            self.stdout.write(f"Processed BPL Types.")

            for name in dct_types:
                if name: DCTType.objects.get_or_create(name=name)
            self.stdout.write(f"Processed DCT Types.")

            for name in schemes:
                if name: Scheme.objects.get_or_create(name=name)
            self.stdout.write(f"Processed Schemes.")

            self.stdout.write(self.style.SUCCESS('--- Foundational Data Population Complete ---'))

        except Exception as e:
            self.stderr.write(self.style.ERROR(f'An error occurred: {e}'))