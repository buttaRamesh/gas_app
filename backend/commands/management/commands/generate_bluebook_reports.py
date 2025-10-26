import pandas as pd
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Generates a single CSV report of consumers who share a Blue Book number, sorted by frequency.'

    def add_arguments(self, parser):
        parser.add_argument('csv_file_path', type=str, help='The full path to the input cust.csv file.')
        parser.add_argument('output_file_path', type=str, help='The full path for the single output CSV report file (e.g., report.csv).')

    def handle(self, *args, **options):
        csv_file_path = options['csv_file_path']
        output_file_path = options['output_file_path']

        self.stdout.write(self.style.HTTP_INFO(f"--- Generating single report for shared Blue Books from '{csv_file_path}' ---"))

        try:
            df = pd.read_csv(csv_file_path, dtype=str).fillna('')

            # 1. Get a clean list with one row for every unique consumer
            unique_consumer_df = df.drop_duplicates(subset=['ConsumerNumber'], keep='first')
            consumers_with_blue_book = unique_consumer_df[unique_consumer_df['BlueBookNumber'] != ''].copy()
            
            # 2. Find and count shared Blue Book numbers
            blue_book_counts = consumers_with_blue_book['BlueBookNumber'].value_counts()
            shared_blue_books = blue_book_counts[blue_book_counts > 1]

            if shared_blue_books.empty:
                self.stdout.write(self.style.SUCCESS("✅ No shared Blue Book numbers found. No report generated."))
                return

            # 3. Sort the shared blue books by their frequency (the count) in ascending order
            sorted_shared_blue_books = shared_blue_books.sort_values(ascending=True)
            self.stdout.write(f"Found {len(sorted_shared_blue_books)} shared Blue Book numbers. Preparing report...")

            # 4. Build the final report DataFrame in the correct sorted order
            report_df_list = []
            for blue_book_num in sorted_shared_blue_books.index:
                # Get all unique consumers who have this specific blue book number
                group_df = consumers_with_blue_book[consumers_with_blue_book['BlueBookNumber'] == blue_book_num]
                report_df_list.append(group_df)
            
            # Concatenate all the small dataframes into one final report
            final_report_df = pd.concat(report_df_list)

            # 5. Select and order the final columns
            output_columns = ['BlueBookNumber', 'ConsumerNumber', 'ConsumerName', 'HouseNo', 'MobileNumber']
            final_report_df = final_report_df[output_columns]
            self.stdout.write(self.style.SUCCESS(f"\n--- final df finished ---  {output_file_path}"))

            # 6. Save the single report file
            final_report_df.to_csv(output_file_path, index=False)
            
            self.stdout.write(self.style.SUCCESS(f"\n--- Report generation complete. File saved to: {output_file_path} ---"))

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"An error occurred: {e}"))