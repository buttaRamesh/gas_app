import pandas as pd
from typing import Union, IO
from datetime import datetime


class ProductSeeder:
    """
    CSV expected columns:
    PRODUCT_CODE,PRODUCT_NAME,PRODUCT_CATEGORY,UNIT,CYLINDER_FLAG,
    CYLINDER_WEIGHT,CYLINDER_CATEGORY,PRICE,EFFECTIVE_DATE
    """

    def __init__(self, file_source: Union[str, IO]):
        self.file_source = file_source
        self.raw_df = None
        self.df = None
        self.load()

    # ============================================================
    # PUBLIC API
    # ============================================================
    def save_db(self):
        """Clear product tables then insert fresh data."""
        self._clear_tables()
        self._save_categories()
        self._save_units()
        self._save_cylinder_categories()
        self._save_products()
        self._save_cylinder_details()
        self._save_prices()
        print("[DONE] Product, Cylinder, Price seeded.")
        return self

    # ============================================================
    # LOAD CSV
    # ============================================================
    def load(self):
        """Load CSV into Pandas dataframe."""
        try:
            if isinstance(self.file_source, str):
                self.raw_df = pd.read_csv(self.file_source)
            else:
                self.raw_df = pd.read_csv(self.file_source)
        except UnicodeDecodeError:
            if not isinstance(self.file_source, str):
                self.file_source.seek(0)
            self.raw_df = pd.read_csv(self.file_source, encoding="latin1")

        self.raw_df.columns = [str(c).strip() for c in self.raw_df.columns]

        required = [
            "PRODUCT_CODE",
            "PRODUCT_NAME",
            "PRODUCT_CATEGORY",
            "UNIT",
            "CYLINDER_FLAG",
            "CYLINDER_WEIGHT",
            "CYLINDER_CATEGORY",
            "PRICE",
            "EFFECTIVE_DATE",
        ]
        missing = [c for c in required if c not in self.raw_df.columns]
        if missing:
            raise ValueError(f"Missing columns: {missing}")

        self.df = self.raw_df.copy()

        print("[OK] Product CSV loaded.")
        return self

    # ============================================================
    # CLEAR TABLES
    # ============================================================
    def _clear_tables(self):
        from inventory.models import (
            ProductCategory,
            Unit,
            CylinderCategory,
            Product,
            CylinderDetails,
            ProductPrice,
        )

        print("\n" + "="*80)
        print("CLEARING PRODUCT TABLES - RECORD COUNTS BEFORE DELETION")
        print("="*80)

        # Count and store before deletion
        models = [
            ("ProductPrice", ProductPrice),
            ("CylinderDetails", CylinderDetails),
            ("Product", Product),
            ("ProductCategory", ProductCategory),
            ("CylinderCategory", CylinderCategory),
            ("Unit", Unit),
        ]

        record_counts = {}
        for name, model in models:
            try:
                count = model.objects.count()
                record_counts[name] = count
                print(f"  {name}: {count:,} records")
            except Exception as e:
                print(f"  {name}: Error counting - {e}")
                record_counts[name] = 0

        total_before = sum(record_counts.values())
        print(f"\nTotal records to delete: {total_before:,}")
        print("="*80)

        # Delete in reverse dependency order
        print("\n[CLEAR] Deleting records...")
        for name, model in models:
            deleted_count, _ = model.objects.all().delete()
            if deleted_count > 0:
                print(f"  ✓ Deleted {deleted_count:,} {name} records")

        # Print summary
        print("\n" + "="*80)
        print("CLEARING COMPLETED")
        print("="*80)
        print(f"Total records deleted: {total_before:,}")
        print("\nDeleted records by table:")
        for name, count in record_counts.items():
            if count > 0:
                print(f"  - {name}: {count:,} records")
        print("="*80 + "\n")

    # ============================================================
    # SAVE LOOKUP: Product Categories
    # ============================================================
    def _save_categories(self):
        from inventory.models import ProductCategory

        for name in self.df["PRODUCT_CATEGORY"].dropna().unique():
            name = str(name).strip()
            ProductCategory.objects.get_or_create(name=name)

            print("  + ProductCategory:", name)

    # ============================================================
    # SAVE LOOKUP: Units
    # ============================================================
    def _save_units(self):
        from inventory.models import Unit

        for u in self.df["UNIT"].dropna().unique():
            u = str(u).strip()
            Unit.objects.get_or_create(short_name=u)

            print("  + Unit:", u)

    # ============================================================
    # SAVE LOOKUP: Cylinder Categories
    # ============================================================
    def _save_cylinder_categories(self):
        from inventory.models import CylinderCategory

        values = (
            self.df["CYLINDER_CATEGORY"]
            .dropna()
            .astype(str)
            .str.strip()
            .unique()
        )

        for code in values:
            if not code or code == "nan":
                continue

            CylinderCategory.objects.get_or_create(
                code=code, defaults={"name": code}
            )

            print("  + CylinderCategory:", code)

    # ============================================================
    # SAVE PRODUCTS
    # ============================================================
    def _save_products(self):
        from inventory.models import Product, ProductCategory, Unit

        print("[INFO] Creating Products...")

        for _, row in self.df.iterrows():

            category = ProductCategory.objects.get(name=row["PRODUCT_CATEGORY"])
            unit = Unit.objects.get(short_name=row["UNIT"])

            raw_code = str(row["PRODUCT_CODE"]).strip()
            if raw_code.lower() in ("nan", "", "none"):
                product_code = None
            else:
                # Remove .0 suffix for integer values (e.g., "5300.0" -> "5300")
                if raw_code.endswith(".0"):
                    product_code = raw_code[:-2]
                else:
                    product_code = raw_code

            Product.objects.create(
                name=row["PRODUCT_NAME"],
                product_code=product_code,
                category=category,
                unit=unit,
                is_cylinder=bool(int(row["CYLINDER_FLAG"]))  # 1 or 0
            )

            print("  + Product:", row["PRODUCT_NAME"])

    # ============================================================
    # SAVE CYLINDER DETAILS
    # ============================================================
    def _save_cylinder_details(self):
        from inventory.models import Product, CylinderCategory, CylinderDetails

        print("[INFO] Creating CylinderDetails...")

        for _, row in self.df.iterrows():
            if int(row["CYLINDER_FLAG"]) != 1:
                continue

            try:
                product = Product.objects.get(name=row["PRODUCT_NAME"])
            except Product.DoesNotExist:
                continue

            cyl_cat_code = str(row["CYLINDER_CATEGORY"]).strip()
            cyl_cat = None

            if cyl_cat_code and cyl_cat_code != "nan":
                cyl_cat = CylinderCategory.objects.get(code=cyl_cat_code)

            CylinderDetails.objects.create(
                product=product,
                weight=row["CYLINDER_WEIGHT"],
                cylinder_category=cyl_cat
            )

            print("  + CylinderDetails:", product.name)

    # ============================================================
    # DATE PARSING HELPER
    # ============================================================
    def _parse_date(self, date_value):
        """
        Parse date from various formats (DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD) to YYYY-MM-DD.
        Returns: date object or None
        """
        if pd.isna(date_value) or not date_value:
            return None

        date_str = str(date_value).strip()

        # Try multiple date formats
        date_formats = [
            "%d-%m-%Y",  # DD-MM-YYYY
            "%d/%m/%Y",  # DD/MM/YYYY
            "%Y-%m-%d",  # YYYY-MM-DD (already correct)
            "%d.%m.%Y",  # DD.MM.YYYY
        ]

        for fmt in date_formats:
            try:
                return datetime.strptime(date_str, fmt).date()
            except ValueError:
                continue

        # If none of the formats work, try pandas parsing
        try:
            return pd.to_datetime(date_str, dayfirst=True).date()
        except Exception:
            print(f"  [WARNING] Could not parse date: {date_str}")
            return None

    # ============================================================
    # SAVE PRICE
    # ============================================================
    def _save_prices(self):
        from inventory.models import Product, ProductPrice
        from datetime import date

        print("[INFO] Creating Product Prices...")

        # Default date to use when parsing fails
        default_date = date(2024, 1, 1)

        for _, row in self.df.iterrows():

            product = Product.objects.get(name=row["PRODUCT_NAME"])

            # Parse the date from CSV format to Django format
            effective_date = self._parse_date(row["EFFECTIVE_DATE"])

            if effective_date is None:
                effective_date = default_date
                print(f"  [WARNING] Invalid date for {product.name}, using default: {default_date}")

            ProductPrice.objects.create(
                product=product,
                price=row["PRICE"],
                effective_date=effective_date,
                is_active=True
            )

            print("  + ProductPrice:", product.name)
