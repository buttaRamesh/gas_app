import csv
from django.core.management.base import BaseCommand
from django.db import transaction
from routes.models import Route, RouteArea

class Command(BaseCommand):
    help = 'Populates the database with routes and route areas from a given CSV file.'

    def add_arguments(self, parser):
        # parser.add_argument('csv_file_path', type=str, help='The full path to the CSV file.')
        pass

    @transaction.atomic
    def handle(self, *args, **options):
        # csv_file_path = options['csv_file_path']
        csv_file_path = '../rsc/routes.csv'
        self.stdout.write(self.style.SUCCESS(f'Starting to process file: {csv_file_path}'))

        try:
            current_code = None
            with open(csv_file_path, mode='r', encoding='utf-8') as file:
                reader = csv.reader(file)
                header = next(reader)  # Skip the header row
                self.stdout.write(f'header--  {header}')
                # if header != ['AREA CODE', 'AREA NAME']:
                #     self.stderr.write(self.style.ERROR('CSV headers must be AREA_CODE,AREA_NAME'))
                #     return

                routes_created = 0
                areas_created = 0
                
                for row in reader:
                    route_code , area_name = row[0] , row[1]

                    if route_code:
                        current_code = route_code
                        route_obj, route_created = Route.objects.get_or_create(code=route_code)
                        if route_created:
                            routes_created += 1
                            self.stdout.write(f'Created new route: {route_code}')

                    
                    
                    # Create the corresponding RouteArea, ensuring it doesn't already exist
                    area_obj, area_created = RouteArea.objects.get_or_create(
                        route=route_obj,
                        area_name=area_name
                    )

                    if area_created:
                        areas_created += 1

        except FileNotFoundError:
            self.stderr.write(self.style.ERROR(f'File not found at: {csv_file_path}'))
            return
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'An error occurred: {e}'))
            return

        self.stdout.write(self.style.SUCCESS('--------------------'))
        self.stdout.write(self.style.SUCCESS('Population complete!'))
        self.stdout.write(f'New routes created: {routes_created}')
        self.stdout.write(f'New route areas created: {areas_created}')