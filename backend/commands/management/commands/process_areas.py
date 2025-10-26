# ==============================================================================
# FILE: route/management/commands/process_areas.py
# Django Management Command to Process Areas from CSV
# ==============================================================================

import csv
from collections import defaultdict
from django.core.management.base import BaseCommand, CommandError
from tabulate import tabulate


class Command(BaseCommand):
    help = 'Process areas from CSV file and display grouped by AreaCodeDesc'

    def add_arguments(self, parser):
        """Add command line arguments"""
        parser.add_argument(
            'csv_file',
            type=str,
            help='Path to the CSV file containing area data'
        )
        parser.add_argument(
            '--output',
            type=str,
            default='table',
            choices=['table', 'csv', 'json'],
            help='Output format (default: table)'
        )

    def handle(self, *args, **options):
        """Main command execution"""
        csv_file_path = options['csv_file']
        output_format = options['output']

        self.stdout.write(self.style.SUCCESS(f'\nProcessing CSV file: {csv_file_path}\n'))

        try:
            # Read and process CSV
            areas_dict = self.process_csv(csv_file_path)
            
            # Display results
            if output_format == 'table':
                self.display_as_table(areas_dict)
            elif output_format == 'csv':
                self.display_as_csv(areas_dict)
            elif output_format == 'json':
                self.display_as_json(areas_dict)
            
            # Summary
            self.display_summary(areas_dict)
            
        except FileNotFoundError:
            raise CommandError(f'CSV file not found: {csv_file_path}')
        except Exception as e:
            raise CommandError(f'Error processing CSV: {str(e)}')

    def process_csv(self, csv_file_path):
        """
        Read CSV and group AreaIDs by AreaCodeDesc.
        Returns dict: {AreaCodeDesc: [list of unique AreaIDs]}
        """
        areas_dict = defaultdict(set)  # Use set to automatically remove duplicates
        
        with open(csv_file_path, 'r', encoding='utf-8') as file:
            # Try different delimiters
            sample = file.read(1024)
            file.seek(0)
            
            # Detect delimiter
            sniffer = csv.Sniffer()
            try:
                delimiter = sniffer.sniff(sample).delimiter
            except:
                delimiter = ','  # Default to comma
            
            reader = csv.DictReader(file, delimiter=delimiter)
            
            # Check if required columns exist
            if 'AreaId' not in reader.fieldnames or 'AreaCodeDesc' not in reader.fieldnames:
                raise CommandError(
                    f'CSV must contain "AreaId" and "AreaCodeDesc" columns. '
                    f'Found columns: {reader.fieldnames}'
                )
            
            row_count = 0
            for row in reader:
                area_id = row.get('AreaId', '').strip()
                area_code_desc = row.get('AreaCodeDesc', '').strip()
                
                # Skip empty rows
                if not area_id or not area_code_desc:
                    continue
                
                # Add to dictionary (set automatically handles duplicates)
                areas_dict[area_code_desc].add(area_id)
                row_count += 1
            
            self.stdout.write(
                self.style.SUCCESS(f'✓ Processed {row_count} rows from CSV\n')
            )
        
        # Convert sets to sorted lists
        return {
            area_desc: sorted(list(area_ids)) 
            for area_desc, area_ids in sorted(areas_dict.items())
        }

    def display_as_table(self, areas_dict):
        """Display results in tabular format"""
        self.stdout.write(self.style.HTTP_INFO('\n' + '='*80))
        self.stdout.write(self.style.HTTP_INFO('AREAS GROUPED BY AREA CODE DESCRIPTION'))
        self.stdout.write(self.style.HTTP_INFO('='*80 + '\n'))
        
        # Prepare table data
        table_data = []
        for area_desc, area_ids in areas_dict.items():
            # Join area IDs with comma
            area_ids_str = ', '.join(area_ids)
            table_data.append([
                area_desc,
                len(area_ids),
                area_ids_str
            ])
        
        # Display table
        headers = ['Area Code Description', 'Count', 'Area IDs']
        table = tabulate(
            table_data,
            headers=headers,
            tablefmt='grid',
            maxcolwidths=[30, 10, 50]
        )
        
        self.stdout.write(table)
        self.stdout.write('\n')

    def display_as_csv(self, areas_dict):
        """Display results in CSV format"""
        import sys
        
        writer = csv.writer(sys.stdout)
        writer.writerow(['AreaCodeDesc', 'Count', 'AreaIDs'])
        
        for area_desc, area_ids in areas_dict.items():
            writer.writerow([
                area_desc,
                len(area_ids),
                '|'.join(area_ids)  # Use pipe separator for area IDs
            ])

    def display_as_json(self, areas_dict):
        """Display results in JSON format"""
        import json
        
        output = []
        for area_desc, area_ids in areas_dict.items():
            output.append({
                'area_code_desc': area_desc,
                'count': len(area_ids),
                'area_ids': area_ids
            })
        
        self.stdout.write(
            json.dumps(output, indent=2, ensure_ascii=False)
        )

    def display_summary(self, areas_dict):
        """Display summary statistics"""
        total_descriptions = len(areas_dict)
        total_unique_ids = sum(len(ids) for ids in areas_dict.values())
        
        # Find area with most IDs
        max_area = max(areas_dict.items(), key=lambda x: len(x[1]))
        
        # Find area with least IDs
        min_area = min(areas_dict.items(), key=lambda x: len(x[1]))
        
        self.stdout.write(self.style.HTTP_INFO('\n' + '='*80))
        self.stdout.write(self.style.HTTP_INFO('SUMMARY'))
        self.stdout.write(self.style.HTTP_INFO('='*80 + '\n'))
        
        summary_data = [
            ['Total Area Code Descriptions', total_descriptions],
            ['Total Unique Area IDs', total_unique_ids],
            ['Average IDs per Description', f'{total_unique_ids/total_descriptions:.2f}'],
            ['Most IDs', f'{max_area[0]} ({len(max_area[1])} IDs)'],
            ['Least IDs', f'{min_area[0]} ({len(min_area[1])} IDs)'],
        ]
        
        summary_table = tabulate(
            summary_data,
            tablefmt='simple',
            colalign=('left', 'right')
        )
        
        self.stdout.write(summary_table)
        self.stdout.write('\n')


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
   route/management/commands/process_areas.py

4. Install required package:
   pip install tabulate

5. Run the command:

   # Display as table (default)
   python manage.py process_areas /path/to/areas.csv

   # Display as CSV
   python manage.py process_areas /path/to/areas.csv --output=csv

   # Display as JSON
   python manage.py process_areas /path/to/areas.csv --output=json

   # Save output to file
   python manage.py process_areas /path/to/areas.csv > output.txt

   # Save CSV output to file
   python manage.py process_areas /path/to/areas.csv --output=csv > output.csv


SAMPLE CSV FORMAT:
------------------
AreaId,AreaCodeDesc
A001,North Zone
A002,North Zone
A003,South Zone
A001,North Zone
A004,South Zone


EXPECTED OUTPUT:
----------------
================================================================================
AREAS GROUPED BY AREA CODE DESCRIPTION
================================================================================
+------------------------+-------+------------------+
| Area Code Description  | Count | Area IDs         |
+========================+=======+==================+
| North Zone             |     2 | A001, A002       |
+------------------------+-------+------------------+
| South Zone             |     2 | A003, A004       |
+------------------------+-------+------------------+

================================================================================
SUMMARY
================================================================================
Total Area Code Descriptions           2
Total Unique Area IDs                  4
Average IDs per Description         2.00
Most IDs                      North Zone (2 IDs)
Least IDs                     North Zone (2 IDs)
"""