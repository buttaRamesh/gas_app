import pandas as pd
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Scans a CSV to find Ration Card numbers shared by different (unique) Consumer Numbers and prints in a table.'

    def add_arguments(self, parser):
        parser.add_argument('csv_file_path', type=str, help='The full path to the cust.csv file.')

    def handle(self, *args, **options):
        csv_file_path = options['csv_file_path']
        self.stdout.write(self.style.HTTP_INFO(f"--- Scanning '{csv_file_path}' for Ration Cards shared by different consumers ---"))

        try:
            # Read the CSV, ensuring key columns are treated as strings
            df = pd.read_csv(csv_file_path, dtype=str).fillna('')
            df_filtered = df[df['Rationcardno'] != '']
            
            grouped = df_filtered.groupby('Rationcardno')['ConsumerNumber'].nunique()
            true_duplicates = grouped[grouped > 1]

            if true_duplicates.empty:
                self.stdout.write(self.style.SUCCESS("✅ No Ration Card numbers were found to be shared across different consumers."))
                return

            self.stdout.write(self.style.WARNING(f"Found {len(true_duplicates)} Ration Card number(s) shared by different consumers:"))

            all_offending_rows = df[df['Rationcardno'].isin(true_duplicates.index)]
            
            for ration_card_num, group_df in all_offending_rows.groupby('Rationcardno'):
                unique_consumer_count = group_df['ConsumerNumber'].nunique()
                self.stdout.write(self.style.HTTP_INFO(f"\n--- Ration Card #: {ration_card_num} is shared by {unique_consumer_count} different consumers ---"))
                
                # --- NEW: Print table header ---
                header = f"{'Row':<8} | {'Consumer Number':<15} | {'Consumer Name':<25} | {'House No':<20} | {'Mobile Number':<15}"
                self.stdout.write(header)
                self.stdout.write('-' * len(header))
                
                unique_consumer_rows = group_df.drop_duplicates(subset=['ConsumerNumber'])
                
                # --- NEW: Print formatted table row ---
                for index, row in unique_consumer_rows.iterrows():
                    # Truncate long strings to keep table format clean
                    consumer_name = str(row['ConsumerName'])[:24]
                    house_no = str(row['HouseNo'])[:19]
                    
                    row_str = (
                        f"{str(index + 2):<8} | "
                        f"{str(row['ConsumerNumber']):<15} | "
                        f"{consumer_name:<25} | "
                        f"{house_no:<20} | "
                        f"{str(row['MobileNumber']):<15}"
                    )
                    self.stdout.write(row_str)

            self.stdout.write(self.style.SUCCESS("\n--- CSV scan complete ---"))

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"An error occurred: {e}"))