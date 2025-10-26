import pandas as pd
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Counts Blue Book numbers that are shared among unique consumers in a CSV.'

    def add_arguments(self, parser):
        parser.add_argument('csv_file_path', type=str, help='The full path to the cust.csv file.')

    def handle(self, *args, **options):
        csv_file_path = options['csv_file_path']
        self.stdout.write(self.style.HTTP_INFO(f"--- Analyzing '{csv_file_path}' for shared Blue Book numbers ---"))

        try:
            df = pd.read_csv(csv_file_path, dtype=str).fillna('')

            # Step 1: Get a clean list with one row for every unique consumer
            unique_consumer_df = df.drop_duplicates(subset=['ConsumerNumber'], keep='first')

            # Step 2: From that list, get the BlueBookNumber column and count the values
            consumers_with_blue_book = unique_consumer_df[unique_consumer_df['BlueBookNumber'] != '']
            blue_book_counts = consumers_with_blue_book['BlueBookNumber'].value_counts()

            # Step 3: Filter for counts greater than 1, which indicates a shared number
            duplicate_counts = blue_book_counts[blue_book_counts > 1]

            if duplicate_counts.empty:
                self.stdout.write(self.style.SUCCESS("\n✅ No Blue Book numbers are shared by more than one unique consumer."))
                return
            
            self.stdout.write(self.style.WARNING(f"\nFound {len(duplicate_counts)} Blue Book number(s) shared by multiple unique consumers:"))
            
            # Step 4: Print the resulting Series (Blue Book # and its count)
            # We add a custom header for clarity
            self.stdout.write("\nBlue Book #      | Count of Unique Consumers")
            self.stdout.write("-----------------|---------------------------")
            self.stdout.write(duplicate_counts.to_string())

            self.stdout.write(self.style.SUCCESS("\n--- Analysis Complete ---"))

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"An error occurred: {e}"))