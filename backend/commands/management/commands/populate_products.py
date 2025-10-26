from django.core.management.base import BaseCommand
from products.models import Unit, Product, ProductVariant


class Command(BaseCommand):
    help = 'Populates products database with standard LPG cylinder and related product data.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('--- Starting Product Population ---'))

        try:
            # Step 1: Ensure Units exist
            self.stdout.write('Step 1: Creating units of measurement...')
            kg_unit, _ = Unit.objects.get_or_create(
                short_name='kg',
                defaults={'description': 'Kilogram'}
            )
            pcs_unit, _ = Unit.objects.get_or_create(
                short_name='pcs',
                defaults={'description': 'Pieces'}
            )
            mtr_unit, _ = Unit.objects.get_or_create(
                short_name='mtr',
                defaults={'description': 'Meter'}
            )
            ltr_unit, _ = Unit.objects.get_or_create(
                short_name='ltr',
                defaults={'description': 'Liter'}
            )
            self.stdout.write(self.style.SUCCESS('Units created/verified.'))

            # Step 2: Create Product Categories
            self.stdout.write('Step 2: Creating product categories...')
            lpg_product, _ = Product.objects.get_or_create(
                name='LPG Cylinder',
                defaults={'description': 'Liquefied Petroleum Gas cylinders'}
            )
            appliance_product, _ = Product.objects.get_or_create(
                name='Appliance',
                defaults={'description': 'Gas appliances and accessories'}
            )
            regulator_product, _ = Product.objects.get_or_create(
                name='Regulator',
                defaults={'description': 'Gas pressure regulators'}
            )
            hose_product, _ = Product.objects.get_or_create(
                name='Gas Hose',
                defaults={'description': 'Gas connection hoses'}
            )
            self.stdout.write(self.style.SUCCESS('Product categories created/verified.'))

            # Step 3: Create Product Variants for LPG Cylinders
            self.stdout.write('Step 3: Creating LPG cylinder variants...')
            lpg_variants = [
                {
                    'product_code': 'LPG-DOM-14.2',
                    'name': 'Domestic LPG Cylinder 14.2 kg',
                    'product': lpg_product,
                    'unit': kg_unit,
                    'size': 14.2,
                    'variant_type': ProductVariant.VariantType.DOMESTIC,
                    'price':0.0
                },
                {
                    'product_code': 'LPG-DOM-5',
                    'name': 'Domestic LPG Cylinder 5 kg',
                    'product': lpg_product,
                    'unit': kg_unit,
                    'size': 5.0,
                    'variant_type': ProductVariant.VariantType.DOMESTIC,
                    'price':0.0
                },
                {
                    'product_code': 'LPG-COM-19',
                    'name': 'Commercial LPG Cylinder 19 kg',
                    'product': lpg_product,
                    'unit': kg_unit,
                    'size': 19.0,
                    'variant_type': ProductVariant.VariantType.COMMERCIAL,
                    'price':0.0
                },
                {
                    'product_code': 'LPG-COM-35',
                    'name': 'Commercial LPG Cylinder 35 kg',
                    'product': lpg_product,
                    'unit': kg_unit,
                    'size': 35.0,
                    'variant_type': ProductVariant.VariantType.COMMERCIAL,
                    'price':0.0
                },
                {
                    'product_code': 'LPG-IND-47.5',
                    'name': 'Industrial LPG Cylinder 47.5 kg',
                    'product': lpg_product,
                    'unit': kg_unit,
                    'size': 47.5,
                    'variant_type': ProductVariant.VariantType.INDUSTRIAL,
                    'price':0.0
                },
            ]

            for variant_data in lpg_variants:
                variant, created = ProductVariant.objects.get_or_create(
                    product_code=variant_data['product_code'],
                    defaults=variant_data
                )
                if created:
                    self.stdout.write(f"  Created: {variant.name}")
                else:
                    self.stdout.write(f"  Already exists: {variant.name}")

            # Step 4: Create Product Variants for Regulators
            self.stdout.write('Step 4: Creating regulator variants...')
            regulator_variants = [
                {
                    'product_code': 'REG-DOM-STD',
                    'name': 'Standard Domestic Regulator',
                    'product': regulator_product,
                    'unit': pcs_unit,
                    'size': 1,
                    'variant_type': ProductVariant.VariantType.DOMESTIC,
                    'price':0.0
                },
                {
                    'product_code': 'REG-COM-HP',
                    'name': 'High Pressure Commercial Regulator',
                    'product': regulator_product,
                    'unit': pcs_unit,
                    'size': 1,
                    'variant_type': ProductVariant.VariantType.COMMERCIAL,
                    'price':0.0
                },
            ]

            for variant_data in regulator_variants:
                variant, created = ProductVariant.objects.get_or_create(
                    product_code=variant_data['product_code'],
                    defaults=variant_data
                )
                if created:
                    self.stdout.write(f"  Created: {variant.name}")
                else:
                    self.stdout.write(f"  Already exists: {variant.name}")

            # Step 5: Create Product Variants for Gas Hoses
            self.stdout.write('Step 5: Creating gas hose variants...')
            hose_variants = [
                {
                    'product_code': 'HOSE-DOM-1M',
                    'name': 'Domestic Gas Hose 1 meter',
                    'product': hose_product,
                    'unit': mtr_unit,
                    'size': 1.0,
                    'variant_type': ProductVariant.VariantType.DOMESTIC,
                    'price':0.0
                },
                {
                    'product_code': 'HOSE-DOM-2M',
                    'name': 'Domestic Gas Hose 2 meter',
                    'product': hose_product,
                    'unit': mtr_unit,
                    'size': 2.0,
                    'variant_type': ProductVariant.VariantType.DOMESTIC,
                    'price':0.0
                },
                {
                    'product_code': 'HOSE-COM-3M',
                    'name': 'Commercial Gas Hose 3 meter',
                    'product': hose_product,
                    'unit': mtr_unit,
                    'size': 3.0,
                    'variant_type': ProductVariant.VariantType.COMMERCIAL,
                    'price':0.0
                },
            ]

            for variant_data in hose_variants:
                variant, created = ProductVariant.objects.get_or_create(
                    product_code=variant_data['product_code'],
                    defaults=variant_data
                )
                if created:
                    self.stdout.write(f"  Created: {variant.name}")
                else:
                    self.stdout.write(f"  Already exists: {variant.name}")

            # Final Summary
            self.stdout.write(self.style.SUCCESS('\n--- Product Population Complete ---'))
            self.stdout.write(f"Total Products: {Product.objects.count()}")
            self.stdout.write(f"Total Units: {Unit.objects.count()}")
            self.stdout.write(f"Total Product Variants: {ProductVariant.objects.count()}")

            # Breakdown by type
            for variant_type in ProductVariant.VariantType:
                count = ProductVariant.objects.filter(variant_type=variant_type.value).count()
                self.stdout.write(f"  {variant_type.label}: {count}")

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error during product population: {str(e)}'))
            raise
