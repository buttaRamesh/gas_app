#!/usr/bin/env python
"""
Test script for ProductSeeder
Run with: python test_product_seeder.py
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.dev')
django.setup()

from utils.ProductSeeder import ProductSeeder

if __name__ == "__main__":
    print("=" * 60)
    print("PRODUCT SEEDER TEST")
    print("=" * 60)

    # Define CSV file paths
    base_path = os.path.join(os.path.dirname(__file__), "..", "seed", "db")
    units_file = os.path.join(base_path, "units.csv")
    products_file = os.path.join(base_path, "products.csv")
    variants_file = os.path.join(base_path, "product-variants.csv")

    # Check if files exist
    for file_path in [units_file, products_file, variants_file]:
        if not os.path.exists(file_path):
            print(f"[ERROR] File not found: {file_path}")
            sys.exit(1)

    print(f"\n[INFO] CSV Files:")
    print(f"  - Units: {units_file}")
    print(f"  - Products: {products_file}")
    print(f"  - Variants: {variants_file}")
    print()

    try:
        # Initialize and run seeder
        seeder = ProductSeeder(
            units_file=units_file,
            products_file=products_file,
            variants_file=variants_file
        )

        seeder.save_db()

        print("\n" + "=" * 60)
        print("SEEDING COMPLETED SUCCESSFULLY")
        print("=" * 60)

        # Display summary
        from products.models import Unit, Product, ProductVariant

        print(f"\nDatabase Summary:")
        print(f"  - Units: {Unit.objects.count()}")
        print(f"  - Products: {Product.objects.count()}")
        print(f"  - Product Variants: {ProductVariant.objects.count()}")

    except Exception as e:
        print(f"\n[ERROR] Seeding failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
