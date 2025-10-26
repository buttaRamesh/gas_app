# ==============================================================================
# FILE: route/management/commands/validate_consumer_addresses.py
# Django Management Command to Validate Consumer Addresses Against Route Areas
# ==============================================================================

import csv
from collections import defaultdict, OrderedDict
from django.core.management.base import BaseCommand, CommandError
from tabulate import tabulate
from routes.models import Route, RouteArea


class Command(BaseCommand):
    help = 'Validate consumer addresses against route areas from CSV file'

    def add_arguments(self, parser):
        """Add command line arguments"""
        parser.add_argument(
            'csv_file',
            type=str,
            help='Path to the CSV file'
        )
        parser.add_argument(
            'area_code_desc',
            type=str,
            help='AreaCodeDesc to filter (format: AREA_CODE-DESCRIPTION)'
        )

    def handle(self, *args, **options):
        """Main command execution"""
        csv_file_path = options['csv_file']
        area_code_desc_filter = options['area_code_desc']

        self.stdout.write(
            self.style.SUCCESS(f'\n{"="*80}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'VALIDATING CONSUMER ADDRESSES')
        )
        self.stdout.write(
            self.style.SUCCESS(f'{"="*80}\n')
        )
        
        self.stdout.write(f'CSV File: {csv_file_path}')
        self.stdout.write(f'Filter: {area_code_desc_filter}\n')

        try:
            # Step 1: Process CSV
            consumers_by_area = self.process_csv(csv_file_path, area_code_desc_filter)
            
            if not consumers_by_area:
                self.stdout.write(
                    self.style.WARNING(
                        f'\nNo data found for AreaCodeDesc: {area_code_desc_filter}'
                    )
                )
                return
            
            # Step 2: Process each AreaCodeDesc group
            all_invalid_consumers = []
            processed_routes = set()  # Track unique routes
            
            for area_code_desc, consumers in consumers_by_area.items():
                # Parse area_code and description
                area_code, area_description = self.parse_area_code_desc(area_code_desc)
                
                # Find route
                route = self.find_route(area_code, area_description)
                
                if not route:
                    if area_code not in processed_routes:  # Print only once
                        self.stdout.write(
                            self.style.ERROR(
                                f'\n✗ Route not found for: {area_code} - {area_description}'
                            )
                        )
                        processed_routes.add(area_code)
                    continue
                
                if area_code not in processed_routes:  # Print only once
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'\n✓ Found Route: {route.area_code} - {route.area_code_description}'
                        )
                    )
                    processed_routes.add(area_code)
                
                # Get route areas
                route_areas = self.get_route_areas(route)
                
                if not route_areas:
                    self.stdout.write(
                        self.style.WARNING(
                            f'  ⚠ No areas found for this route'
                        )
                    )
                    continue
                
                self.stdout.write(
                    f'  Areas in route: {", ".join(route_areas)}'
                )
                
                # Validate consumers
                invalid = self.validate_consumers(consumers, route_areas)
                
                if invalid:
                    all_invalid_consumers.extend(invalid)
            
            # Display results
            if all_invalid_consumers:
                total_consumers = sum(len(consumers) for consumers in consumers_by_area.values())
                self.display_invalid_consumers(all_invalid_consumers, total_consumers)
            else:
                total_consumers = sum(len(consumers) for consumers in consumers_by_area.values())
                self.stdout.write(
                    self.style.SUCCESS(
                        f'\n{"="*80}\n'
                        f'✓ All consumer addresses contain valid area names!\n'
                        f'Total Records: {total_consumers}\n'
                        f'Mismatches: 0\n'
                        f'{"="*80}\n'
                    )
                )
            
        except FileNotFoundError:
            raise CommandError(f'CSV file not found: {csv_file_path}')
        except Exception as e:
            raise CommandError(f'Error: {str(e)}')

    def process_csv(self, csv_file_path, area_code_desc_filter):
        """
        Read CSV and process data.
        Returns: {AreaCodeDesc: [(ConsumerNumber, Address), ...]}
        """
        self.stdout.write(f'\nProcessing CSV file...')
        
        consumers_by_area = defaultdict(lambda: OrderedDict())
        
        with open(csv_file_path, 'r', encoding='utf-8') as file:
            # Detect delimiter
            sample = file.read(1024)
            file.seek(0)
            
            sniffer = csv.Sniffer()
            try:
                delimiter = sniffer.sniff(sample).delimiter
            except:
                delimiter = ','
            
            reader = csv.DictReader(file, delimiter=delimiter)
            
            # Validate columns
            required_cols = ['ConsumerNumber', 'AreaCodeDesc', 'Address']
            for col in required_cols:
                if col not in reader.fieldnames:
                    raise CommandError(
                        f'CSV must contain "{col}" column. '
                        f'Found: {reader.fieldnames}'
                    )
            
            row_count = 0
            filtered_count = 0
            
            for row in reader:
                row_count += 1
                
                consumer_number = row.get('ConsumerNumber', '').strip()
                area_code_desc = row.get('AreaCodeDesc', '').strip()
                address = row.get('Address', '').strip()
                
                # Skip empty rows
                if not consumer_number or not area_code_desc or not address:
                    continue
                
                # Filter by AreaCodeDesc
                if area_code_desc != area_code_desc_filter:
                    continue
                
                filtered_count += 1
                
                # Remove duplicates (keep first occurrence)
                if consumer_number not in consumers_by_area[area_code_desc]:
                    consumers_by_area[area_code_desc][consumer_number] = address
            
            self.stdout.write(
                f'✓ Total rows: {row_count}'
            )
            self.stdout.write(
                f'✓ Filtered rows: {filtered_count}'
            )
            
            # Convert OrderedDict to list of tuples
            result = {}
            for area_desc, consumer_dict in consumers_by_area.items():
                unique_count = len(consumer_dict)
                self.stdout.write(
                    f'✓ Unique consumers: {unique_count}'
                )
                result[area_desc] = list(consumer_dict.items())
            
            return result

    def parse_area_code_desc(self, area_code_desc):
        """
        Parse AreaCodeDesc into area_code and area_description.
        Format: "R001-North Zone"
        Returns: ("R001", "North Zone")
        """
        parts = area_code_desc.split('-', 1)  # Split only on first hyphen
        
        if len(parts) != 2:
            raise CommandError(
                f'Invalid AreaCodeDesc format: {area_code_desc}. '
                f'Expected format: AREA_CODE-DESCRIPTION'
            )
        
        area_code = parts[0].strip()
        area_description = parts[1].strip()
        
        return area_code, area_description

    def find_route(self, area_code, area_description):
        """Find Route by area_code and area_code_description"""
        try:
            route = Route.objects.get(
                area_code=area_code,
                area_code_description=area_description
            )
            return route
        except Route.DoesNotExist:
            return None
        except Route.MultipleObjectsReturned:
            # If multiple found, return first one
            return Route.objects.filter(
                area_code=area_code,
                area_code_description=area_description
            ).first()

    def get_route_areas(self, route):
        """
        Get all area names for a route in UPPERCASE.
        Returns: ['JAGTIAL', 'KORUTLA', 'METPALLY']
        """
        areas = RouteArea.objects.filter(route=route).values_list('area_name', flat=True)
        return [area.upper() for area in areas]

    def validate_consumers(self, consumers, route_areas):
        """
        Check if consumer addresses contain any route area name.
        Returns list of invalid consumers (address doesn't contain any area).
        """
        invalid_consumers = []
        
        for consumer_number, address in consumers:
            # Convert address to uppercase for comparison
            address_upper = address.upper()
            
            # Check if ANY area name is in the address
            area_found = any(area in address_upper for area in route_areas)
            
            if not area_found:
                invalid_consumers.append((consumer_number, address))
        
        return invalid_consumers

    def display_invalid_consumers(self, invalid_consumers, total_consumers):
        """Display consumers with invalid addresses in table format"""
        self.stdout.write(
            self.style.ERROR(f'\n{"="*80}')
        )
        self.stdout.write(
            self.style.ERROR(f'CONSUMERS WITH INVALID ADDRESSES')
        )
        self.stdout.write(
            self.style.ERROR(f'{"="*80}\n')
        )
        
        self.stdout.write(
            self.style.WARNING(
                'These consumer addresses do NOT contain any area name from their route:\n'
            )
        )
        
        # Prepare table data
        table_data = []
        for i, (consumer_number, address) in enumerate(invalid_consumers, 1):
            table_data.append([i, consumer_number, address])
        
        # Display table
        headers = ['#', 'Consumer Number', 'Address']
        table = tabulate(
            table_data,
            headers=headers,
            tablefmt='grid',
            maxcolwidths=[5, 20, 60]
        )
        
        self.stdout.write(table)
        
        # Summary with counts
        mismatch_count = len(invalid_consumers)
        match_count = total_consumers - mismatch_count
        mismatch_percentage = (mismatch_count / total_consumers * 100) if total_consumers > 0 else 0
        
        self.stdout.write(
            self.style.ERROR(
                f'\n{"="*80}'
            )
        )
        self.stdout.write(
            self.style.HTTP_INFO(
                f'SUMMARY STATISTICS'
            )
        )
        self.stdout.write(
            self.style.ERROR(
                f'{"="*80}'
            )
        )
        
        summary_data = [
            ['Total Records', total_consumers],
            ['Valid Addresses', match_count],
            ['Invalid Addresses (Mismatches)', mismatch_count],
            ['Mismatch Percentage', f'{mismatch_percentage:.2f}%'],
        ]
        
        summary_table = tabulate(
            summary_data,
            tablefmt='simple',
            colalign=('left', 'right')
        )
        
        self.stdout.write('\n' + summary_table)
        
        self.stdout.write(
            self.style.ERROR(
                f'\n{"="*80}\n'
            )
        )


# ==============================================================================
# USAGE INSTRUCTIONS
# ==============================================================================
"""
1. Create directory structure:
   route/management/commands/

2. Create __init__.py files in:
   - route/management/__init__.py
   - route/management/commands/__init__.py

3. Place this file as:
   route/management/commands/validate_consumer_addresses.py

4. Ensure tabulate is installed:
   pip install tabulate

5. Run the command:

   python manage.py validate_consumer_addresses /path/to/file.csv "R001-North Zone"


SAMPLE CSV FORMAT:
------------------
ConsumerNumber,AreaCodeDesc,Address
C001,R001-North Zone,"123 Jagtial Road, Telangana"
C002,R001-North Zone,"456 Main Street, Hyderabad"
C003,R001-North Zone,"789 Korutla Lane"
C001,R001-North Zone,"Duplicate entry"


EXPECTED BEHAVIOR:
------------------
1. Filters rows where AreaCodeDesc = "R001-North Zone"
2. Removes duplicate ConsumerNumber (keeps first C001)
3. Splits "R001-North Zone" into area_code="R001", description="North Zone"
4. Finds Route with area_code="R001" and area_code_description="North Zone"
5. Gets all areas: ["Jagtial", "Korutla", "Metpally"]
6. Checks each address (case-insensitive):
   - C001: Contains "JAGTIAL" ✓ Valid
   - C002: No area name found ✗ Invalid
   - C003: Contains "KORUTLA" ✓ Valid
7. Displays only C002 in output table


SAMPLE OUTPUT:
--------------
================================================================================
VALIDATING CONSUMER ADDRESSES
================================================================================
CSV File: /path/to/file.csv
Filter: R001-North Zone

Processing CSV file...
✓ Total rows: 4
✓ Filtered rows: 4
✓ Unique consumers: 3

✓ Found Route: R001 - North Zone
  Areas in route: JAGTIAL, KORUTLA, METPALLY

================================================================================
CONSUMERS WITH INVALID ADDRESSES
================================================================================
These consumer addresses do NOT contain any area name from their route:

+---+------------------+--------------------------------+
| # | Consumer Number  | Address                        |
+===+==================+================================+
| 1 | C002             | 456 Main Street, Hyderabad     |
+---+------------------+--------------------------------+

================================================================================
SUMMARY STATISTICS
================================================================================
Total Records                                  3
Valid Addresses                                2
Invalid Addresses (Mismatches)                 1
Mismatch Percentage                        33.33%
================================================================================
"""