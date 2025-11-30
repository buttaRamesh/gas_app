import pandas as pd
from typing import Union, IO
from decimal import Decimal


class ProductSeeder:
    """
    Seeds Units, Products, and ProductVariants from CSV files.

    Expected CSV files:
        - units.csv: Name, Description
        - products.csv: Name, Description
        - product-variants.csv: ProductCode, Name, Product, Unit, Qty, Type, Price

    Usage:
        seeder = ProductSeeder(
            units_file="seed/db/units.csv",
            products_file="seed/db/products.csv",
            variants_file="seed/db/product-variants.csv"
        )
        seeder.save_db()
    """

    def __init__(
        self,
        units_file: Union[str, IO],
        products_file: Union[str, IO],
        variants_file: Union[str, IO]
    ):
        self.units_file = units_file
        self.products_file = products_file
        self.variants_file = variants_file

        self.units_df = None
        self.products_df = None
        self.variants_df = None

        self.load()

    # ============================================================
    # PUBLIC API
    # ============================================================
    def save_db(self, clear=False):
        """
        Seed product data.

        Args:
            clear (bool): If True, clear all product data before seeding.
                         WARNING: This will fail if ConnectionDetails exist.
                         Default is False (upsert mode - update existing or create new).
        """
        if clear:
            self._clear_product_tables()

        self._save_units()
        self._save_products()
        self._save_variants()
        print("[DONE] Units, Products, and ProductVariants seeded successfully.")
        return self

    # ============================================================
    # CLEAR ALL PRODUCT TABLES (Use with caution!)
    # ============================================================
    def _clear_product_tables(self):
        from products.models import Unit, Product, ProductVariant, ProductVariantPriceHistory
        from connections.models import ConnectionDetails

        print("[WARNING] Attempting to clear Product-related tables...")

        # Check if ConnectionDetails exist
        conn_count = ConnectionDetails.objects.count()
        if conn_count > 0:
            raise ValueError(
                f"Cannot clear product tables: {conn_count} ConnectionDetails records exist "
                "that reference ProductVariant. Please delete ConnectionDetails first or use "
                "save_db(clear=False) for upsert mode."
            )

        print("[INFO] Clearing Product-related tables in safe FK order...")

        # 1. Clear price history (depends on ProductVariant)
        ProductVariantPriceHistory.objects.all().delete()
        print("[INFO] Cleared ProductVariantPriceHistory")

        # 2. Clear product variants (depends on Product and Unit)
        ProductVariant.objects.all().delete()
        print("[INFO] Cleared ProductVariant")

        # 3. Clear products (no dependencies)
        Product.objects.all().delete()
        print("[INFO] Cleared Product")

        # 4. Clear units (no dependencies)
        Unit.objects.all().delete()
        print("[INFO] Cleared Unit")

        print("[INFO] Product tables cleared safely.")

    # ============================================================
    # LOAD CSV FILES
    # ============================================================
    def load(self):
        """Loads all CSV files and validates columns."""
        print("[INFO] Loading CSV files...")

        # Load Units CSV
        self.units_df = self._load_csv(self.units_file, ["Name", "Description"])
        self.units_df.columns = ["Name", "Description"]
        self.units_df = self.units_df.applymap(lambda x: str(x).strip() if pd.notna(x) else "")

        # Load Products CSV
        self.products_df = self._load_csv(self.products_file, ["Name", "Description"])
        self.products_df.columns = ["Name", "Description"]
        self.products_df = self.products_df.applymap(lambda x: str(x).strip() if pd.notna(x) else "")

        # Load ProductVariants CSV
        self.variants_df = self._load_csv(
            self.variants_file,
            ["ProductCode", "Name", "Product", "Unit", "Qty", "Type", "Price"]
        )
        self.variants_df.columns = ["ProductCode", "Name", "Product", "Unit", "Qty", "Type", "Price"]
        self.variants_df = self.variants_df.applymap(lambda x: str(x).strip() if pd.notna(x) else "")

        print(f"[OK] Loaded {len(self.units_df)} units, {len(self.products_df)} products, {len(self.variants_df)} variants")
        return self

    def _load_csv(self, file_source: Union[str, IO], required_columns: list):
        """Load CSV with proper encoding handling."""
        try:
            if isinstance(file_source, str):
                df = pd.read_csv(file_source)
            else:
                df = pd.read_csv(file_source)
        except UnicodeDecodeError:
            if not isinstance(file_source, str):
                file_source.seek(0)
            df = pd.read_csv(file_source, encoding="latin1")

        # Strip column names
        df.columns = [str(c).strip() for c in df.columns]

        # Validate required columns
        missing = [c for c in required_columns if c not in df.columns]
        if missing:
            raise ValueError(f"Missing columns: {missing}")

        return df

    # ============================================================
    # SAVE UNITS
    # ============================================================
    def _save_units(self):
        from products.models import Unit

        print("[INFO] Seeding Units...")

        units_created = 0

        for _, row in self.units_df.iterrows():
            name = row["Name"]
            description = row["Description"]

            if not name:
                continue

            unit, created = Unit.objects.get_or_create(
                short_name=name,
                defaults={"description": description}
            )

            if created:
                units_created += 1
                print(f"  + Unit created: {name}")
            else:
                print(f"  - Unit already exists: {name}")

        print(f"[OK] {units_created} units created")

    # ============================================================
    # SAVE PRODUCTS
    # ============================================================
    def _save_products(self):
        from products.models import Product

        print("[INFO] Seeding Products...")

        products_created = 0

        for _, row in self.products_df.iterrows():
            name = row["Name"]
            description = row["Description"]

            if not name:
                continue

            product, created = Product.objects.get_or_create(
                name=name,
                defaults={"description": description}
            )

            if created:
                products_created += 1
                print(f"  + Product created: {name}")
            else:
                print(f"  - Product already exists: {name}")

        print(f"[OK] {products_created} products created")

    # ============================================================
    # SAVE PRODUCT VARIANTS
    # ============================================================
    def _save_variants(self):
        from products.models import Product, Unit, ProductVariant

        print("[INFO] Seeding ProductVariants...")

        variants_created = 0
        variants_failed = 0

        for _, row in self.variants_df.iterrows():
            try:
                product_code = row["ProductCode"]
                name = row["Name"]
                product_name = row["Product"]
                unit_name = row["Unit"]
                quantity = row["Qty"]
                variant_type = row["Type"]
                price = row["Price"]

                if not product_code or not name:
                    print(f"  [SKIP] Missing product code or name")
                    continue

                # Get Product FK
                try:
                    product = Product.objects.get(name=product_name)
                except Product.DoesNotExist:
                    print(f"  [ERROR] Product not found: {product_name}")
                    variants_failed += 1
                    continue

                # Get Unit FK
                try:
                    unit = Unit.objects.get(short_name=unit_name)
                except Unit.DoesNotExist:
                    print(f"  [ERROR] Unit not found: {unit_name}")
                    variants_failed += 1
                    continue

                # Validate and convert quantity
                try:
                    quantity_val = Decimal(str(quantity))
                    if quantity_val <= 0:
                        quantity_val = Decimal('0.01')
                except:
                    quantity_val = Decimal('0.01')

                # Validate and convert price
                try:
                    price_val = Decimal(str(price))
                    if price_val <= 0:
                        price_val = Decimal('0.01')
                except:
                    price_val = Decimal('0.01')

                # Validate variant_type
                valid_types = ['DOMESTIC', 'COMMERCIAL', 'INDUSTRIAL', 'OTHER']
                variant_type_upper = variant_type.upper()
                if variant_type_upper not in valid_types:
                    print(f"  [WARN] Invalid variant type '{variant_type}' for {product_code}, defaulting to OTHER")
                    variant_type_upper = 'OTHER'

                # Create or Update ProductVariant
                variant, created = ProductVariant.objects.update_or_create(
                    product_code=product_code,
                    defaults={
                        "name": name,
                        "product": product,
                        "unit": unit,
                        "quantity": quantity_val,
                        "variant_type": variant_type_upper,
                        "price": price_val
                    }
                )

                if created:
                    variants_created += 1
                    print(f"  + Variant created: {product_code} - {name} (₹{price_val})")
                else:
                    variants_created += 1
                    print(f"  * Variant updated: {product_code} - {name} (₹{price_val})")

            except Exception as e:
                variants_failed += 1
                print(f"  [ERROR] Failed to create variant: {e}")

        print(f"[OK] {variants_created} variants created, {variants_failed} failed")
