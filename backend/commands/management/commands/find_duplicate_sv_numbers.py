import pandas as pd
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Scans a CSV to find and list consumers sharing the same SvNumber.'

    def add_arguments(self, parser):
        parser.add_argument('csv_file_path', type=str, help='The full path to the input cust.csv file.')

    def handle(self, *args, **options):
        csv_file_path = options['csv_file_path']
        self.stdout.write(self.style.HTTP_INFO(f"--- Scanning '{csv_file_path}' for duplicate SvNumbers ---"))

        try:
            df = pd.read_csv(csv_file_path, dtype=str).fillna('')

            # 1. Create a boolean mask to identify all rows that are part of a duplicate SvNumber set.
            is_duplicate_mask = df.duplicated(subset=['SvNumber'], keep=False)
            
            # 2. Filter the DataFrame to get only the rows with duplicate SvNumbers.
            duplicate_sv_rows = df[is_duplicate_mask]

            if duplicate_sv_rows.empty:
                self.stdout.write(self.style.SUCCESS("✅ No duplicate SvNumbers found in the CSV file."))
                return
            
            # Sort the results by SvNumber to group them visually in the output.
            duplicate_sv_rows = duplicate_sv_rows.sort_values(by='SvNumber')
            
            self.stdout.write(self.style.WARNING(f"Found {duplicate_sv_rows['SvNumber'].nunique()} SvNumber(s) with duplicates:"))

            # 3. Group the filtered rows by SvNumber and print the details for each group.
            for sv_num, group_df in duplicate_sv_rows.groupby('SvNumber'):
                self.stdout.write(self.style.HTTP_INFO(f"\n--- Consumers sharing SvNumber: {sv_num} ---"))
                
                header = f"{'Row':<8} | {'Consumer Number':<15} | {'Consumer Name':<30}"
                self.stdout.write(header)
                self.stdout.write('-' * len(header))
                
                for index, row in group_df.iterrows():
                    consumer_name = str(row['ConsumerName'])[:29]
                    row_str = (
                        f"{str(index + 2):<8} | "
                        f"{str(row['ConsumerNumber']):<15} | "
                        f"{consumer_name:<30}"
                    )
                    self.stdout.write(row_str)

            self.stdout.write(self.style.SUCCESS("\n--- CSV scan complete ---"))

        except FileNotFoundError:
            self.stderr.write(self.style.ERROR(f"File not found at: {csv_file_path}"))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"An error occurred: {e}"))