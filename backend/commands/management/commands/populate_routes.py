import pandas as pd
from django.core.management.base import BaseCommand
from django.db import transaction

from routes.models import Route, RouteArea

class Command(BaseCommand):
    help = 'Populates Route and RouteArea models from a CSV with AREA CODE and AREA NAME columns.'

    def add_arguments(self, parser):
        parser.add_argument('csv_file_path', type=str, help='Path to the CSV file.')

    def handle(self, *args, **options):
        csv_file_path = options['csv_file_path']
        self.stdout.write(self.style.SUCCESS(f"--- Populating Routes and Areas from '{csv_file_path}' ---"))

        try:
            # Use specific column names from your description
            # Skip initial rows if they contain metadata, adjust 'skiprows' as needed
            df = pd.read_csv(csv_file_path, dtype=str, skiprows=0).fillna('')
            
            # Rename columns for easier access, handling potential leading/trailing spaces
            df.columns = [col.strip() for col in df.columns]
            df = df.rename(columns={'AREA CODE': 'area_code', 'AREA NAME': 'area_name'})

            created_routes = 0
            found_routes = 0
            created_areas = 0
            current_route_obj = None # Keep track of the last valid Route

            for index, row in df.iterrows():
                area_code = row.get('area_code', '').strip()
                area_name = row.get('area_name', '').strip()

                # --- Handle Route ---
                if area_code:
                    try:
                        # Find or create the Route
                        route_obj, created = Route.objects.get_or_create(
                            area_code=area_code,
                            # Set description same as code if created
                            defaults={'area_code_description': area_code}
                        )
                        current_route_obj = route_obj # Update the current route
                        
                        if created:
                            created_routes += 1
                        else:
                            found_routes += 1
                            # Optional: Update description if needed, though unlikely given the logic
                            # if route_obj.area_code_description != area_code:
                            #    route_obj.area_code_description = area_code
                            #    route_obj.save()

                    except Exception as e:
                        self.stderr.write(self.style.ERROR(f"Error processing Route on row {index + 1}: {e}"))
                        current_route_obj = None # Invalidate current route on error
                        continue # Skip to next row

                # --- Handle RouteArea ---
                if area_name and current_route_obj:
                    try:
                        # Create the RouteArea, linked to the current Route
                        # We use get_or_create to avoid duplicate Area names *for the same route*
                        area_obj, created = RouteArea.objects.get_or_create(
                            route=current_route_obj,
                            area_name=area_name
                        )
                        if created:
                            created_areas += 1
                            
                    except Exception as e:
                        self.stderr.write(self.style.ERROR(f"Error processing RouteArea on row {index + 1}: {e}"))
                        # Don't invalidate current_route_obj here, the route itself was likely okay
                
                # If AREA CODE is blank but AREA NAME is present, it implies it belongs to the previous route
                elif area_name and not area_code and current_route_obj:
                     try:
                        area_obj, created = RouteArea.objects.get_or_create(
                            route=current_route_obj,
                            area_name=area_name
                        )
                        if created:
                            created_areas += 1
                     except Exception as e:
                        self.stderr.write(self.style.ERROR(f"Error processing RouteArea (no code) on row {index + 1}: {e}"))
                
                elif area_name and not current_route_obj:
                    self.stdout.write(self.style.WARNING(f"Row {index + 1}: Found AREA NAME '{area_name}' but no preceding valid AREA CODE. Skipping Area."))


            self.stdout.write("\n--- Summary ---")
            self.stdout.write(self.style.SUCCESS(f"Created {created_routes} new Routes."))
            self.stdout.write(self.style.NOTICE(f"Found {found_routes} existing Routes."))
            self.stdout.write(self.style.SUCCESS(f"Created {created_areas} new Route Areas."))
            self.stdout.write(self.style.SUCCESS("--- Population Complete ---"))

        except FileNotFoundError:
            self.stderr.write(self.style.ERROR(f"File not found: {csv_file_path}"))
        except KeyError as e:
             self.stderr.write(self.style.ERROR(f"CSV file must contain columns 'AREA CODE' and 'AREA NAME'. Missing: {e}"))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"An unexpected error occurred: {e}"))