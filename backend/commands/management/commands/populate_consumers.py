import pandas as pd
from datetime import datetime
from django.core.management.base import BaseCommand
from django.db import transaction
from django.contrib.contenttypes.models import ContentType

from consumers.models import Consumer
from connections.models import ConnectionDetails
from address.models import Address
from address.models import Contact
from lookups.models import ConsumerCategory, ConsumerType, ConnectionType, BPLType, DCTType
from schemes.models import Scheme
from products.models import Product, ProductVariant, Unit

class Command(BaseCommand):
    help = 'A highly optimized script to bulk populate consumer records from a CSV file.'

    def add_arguments(self, parser):
        parser.add_argument('csv_file_path', type=str, help='The full path to the cust.csv file.')

    @transaction.atomic
    def handle(self, *args, **options):
        csv_file_path = options['csv_file_path']
        self.stdout.write(self.style.SUCCESS(f'--- Starting BULK Consumer Import from "{csv_file_path}" ---'))

        # --- Step 1: Pre-fetch all existing data and lookups ---
        self.stdout.write("Step 1: Pre-fetching existing data...")
        consumer_content_type = ContentType.objects.get_for_model(Consumer)
        
        categories = {cat.name: cat for cat in ConsumerCategory.objects.all()}
        consumer_types = {ct.name: ct for ct in ConsumerType.objects.all()}
        connection_types = {ct.name: ct for ct in ConnectionType.objects.all()}
        products = {p.name: p for p in Product.objects.all()}
        units = {u.short_name: u for u in Unit.objects.all()}
        
        existing_consumer_nums = set(Consumer.objects.values_list('consumer_number', flat=True))
        existing_connection_nums = set(ConnectionDetails.objects.values_list('sv_number', flat=True))
        existing_variant_codes = set(ProductVariant.objects.values_list('product_code', flat=True))

        # --- Step 2: Read CSV and prepare lists of NEW objects ---
        self.stdout.write("Step 2: Reading CSV and preparing new records in memory...")
        df = pd.read_csv(csv_file_path, dtype=str).fillna('')

        consumers_to_create = []
        new_consumer_numbers = set()

        unique_consumer_df = df.drop_duplicates(subset=['ConsumerNumber'], keep='first')
        
        for _, row in unique_consumer_df.iterrows():
            if row['ConsumerNumber'] in existing_consumer_nums:
                continue
            
            consumers_to_create.append(Consumer(
                consumer_number=row['ConsumerNumber'],
                consumer_name=row['ConsumerName'],
                father_name=row.get('FatherName'), mother_name=row.get('MotherName'),
                ration_card_num=row.get('Rationcardno') if row.get('Rationcardno') else None,
                lpg_id=int(float(row['LPGId'])) if row.get('LPGId') and row.get('LPGId').replace('.','',1).isdigit() else None,
                blue_book=int(row['BlueBookNumber']) if row.get('BlueBookNumber') and row.get('BlueBookNumber').isdigit() else None,
                is_kyc_done=True if row.get('KYCDone') == 'KYC Done' else False,
                category=categories.get(row['Category']),
                consumer_type=consumer_types.get(row['ConsumerTypeIdDesc']),
            ))
            new_consumer_numbers.add(row['ConsumerNumber'])

        # --- Step 3: Bulk create Consumers ---
        self.stdout.write(f"Step 3: Bulk creating {len(consumers_to_create)} new consumers...")
        Consumer.objects.bulk_create(consumers_to_create, batch_size=2000)

        # --- Step 4: Fetch newly created consumer IDs for linking ---
        self.stdout.write("Step 4: Fetching all consumer IDs for linking...")
        consumer_map = {c.consumer_number: c for c in Consumer.objects.all()}
        
        # --- Step 5: Prepare all child objects (Address, Contact, Variant, Connection) ---
        self.stdout.write("Step 5: Preparing all related records...")
        addresses_to_create = []
        contacts_to_create = []
        variants_to_create = {}
        connections_to_create = []
        
        # NEW: Keep track of sv_numbers in the current batch to prevent duplicates
        sv_numbers_in_batch = set()
        
        for _, row in df.iterrows():
            consumer_obj = consumer_map.get(row['ConsumerNumber'])
            if not consumer_obj: continue

            if consumer_obj.consumer_number in new_consumer_numbers:
                addresses_to_create.append(Address(content_type=consumer_content_type, object_id=consumer_obj.id, address_text=row.get('Address')))
                contacts_to_create.append(Contact(content_type=consumer_content_type, object_id=consumer_obj.id, mobile_number=row.get('MobileNumber')))
                new_consumer_numbers.remove(consumer_obj.consumer_number)

            prod_code = row['ProdCode']
            if prod_code and prod_code not in existing_variant_codes and prod_code not in variants_to_create:
                variant_size = float(row.get('NoOfCylinder', 0))
                ct = consumer_types.get(row['ConsumerTypeIdDesc'])
                variant_type_str = 'DOMESTIC' if ct and ct.name == 'Domestic' else 'COMMERCIAL'
                
                variants_to_create[prod_code] = ProductVariant(
                    product_code=prod_code, name=f"{variant_type_str.title()} Cylinder {variant_size}kg",
                    product=products.get('LPG Cylinder'), unit=units.get('kg'),
                    size=variant_size, variant_type=variant_type_str,
                    price=0.0
                )
            
            # MODIFIED: Check against batch duplicates as well
            sv_number = row['SvNumber']
            if sv_number not in existing_connection_nums and sv_number not in sv_numbers_in_batch:
                sv_date = datetime.strptime(row['SvDateInt'], '%b %d, %Y').date() if row.get('SvDateInt') else None
                connections_to_create.append(ConnectionDetails(
                    consumer_id=consumer_obj.id, sv_number=sv_number,
                    sv_date=sv_date, connection_type=connection_types.get(row['InDocTypeIdDesc']),
                    hist_code_description=row.get('HistCodeDescription'),
                    num_of_regulators=int(row.get('NoOfDpr', 1))
                ))
                # Add the sv_number to our batch set to prevent re-adding it
                sv_numbers_in_batch.add(sv_number)

        # --- Step 6: Bulk create all remaining objects ---
        self.stdout.write(f"Step 6: Bulk creating {len(variants_to_create)} variants, {len(connections_to_create)} connections, and other data...")
        if variants_to_create:
            ProductVariant.objects.bulk_create(list(variants_to_create.values()), batch_size=2000)
        
        variant_map = {v.product_code: v for v in ProductVariant.objects.all()}
        for conn in connections_to_create:
            prod_code = df.loc[df['SvNumber'] == conn.sv_number, 'ProdCode'].iloc[0]
            conn.product = variant_map.get(prod_code)

        if addresses_to_create: Address.objects.bulk_create(addresses_to_create, batch_size=2000)
        if contacts_to_create: Contact.objects.bulk_create(contacts_to_create, batch_size=2000)
        if connections_to_create: ConnectionDetails.objects.bulk_create(connections_to_create, batch_size=2000)

        self.stdout.write(self.style.SUCCESS("--- BULK import complete! ---"))