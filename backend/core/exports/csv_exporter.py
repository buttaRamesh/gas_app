"""
CSV Exporter - generates comma-separated values export files.
"""
import csv
from django.http import StreamingHttpResponse
from .base import BaseExporter


class Echo:
    """An object that implements just the write method of the file-like interface for streaming."""
    def write(self, value):
        return value


class CSVExporter(BaseExporter):
    """
    Export data to CSV format.

    Features:
    - UTF-8 encoding with BOM for Excel compatibility
    - Streaming for memory efficiency with large datasets
    - Handles special characters and commas
    """

    extension = 'csv'
    content_type = 'text/csv; charset=utf-8'

    def generate(self) -> StreamingHttpResponse:
        """
        Generate CSV file as streaming response for memory efficiency.

        Returns:
            StreamingHttpResponse with CSV content
        """
        def csv_row_generator():
            """Generator that yields CSV rows one at a time."""
            import time

            # Yield UTF-8 BOM for Excel compatibility
            yield '\ufeff'

            # Create a pseudo-buffer for csv.writer
            pseudo_buffer = Echo()
            writer = csv.writer(pseudo_buffer)

            # Yield headers
            headers = self.get_headers()
            yield writer.writerow(headers)

            # Yield data rows efficiently
            if self.serializer_class:
                from core.exports.data_loader import load_export_data

                # Toggle between ORM and Raw SQL (True = Raw SQL, False = ORM)
                # NOTE: Raw SQL is faster but doesn't respect queryset filters
                # Use ORM to ensure filters are applied correctly
                USE_RAW_SQL = False

                # Load data using centralized loader
                data = load_export_data(self.queryset, self.visible_fields, use_raw_sql=USE_RAW_SQL)

                # Write rows
                row_count = 0
                t_write_start = time.time()
                for row_dict in data:
                    row_values = [
                        self._format_value(row_dict.get(field, ''))
                        for field in self.visible_fields
                    ]
                    yield writer.writerow(row_values)
                    row_count += 1
                print(f"  ⏱️  CSV: Write {row_count} rows: {(time.time() - t_write_start):.2f}s")
            else:
                # Fast path: Stream values() directly using iterator for memory efficiency
                # Use iterator() to fetch rows in chunks instead of all at once
                for row_dict in self.queryset.values(*self.visible_fields).iterator(chunk_size=1000):
                    row_values = [
                        self._format_value(row_dict.get(field, ''))
                        for field in self.visible_fields
                    ]
                    yield writer.writerow(row_values)

        # Create streaming response
        response = StreamingHttpResponse(
            csv_row_generator(),
            content_type=self.content_type
        )

        filename = self.get_filename()
        response['Content-Disposition'] = f'attachment; filename="{filename}"'

        return response

    def _format_value(self, value):
        """Format a value for CSV output."""
        if value is None:
            return ''
        if isinstance(value, bool):
            return 'Yes' if value else 'No'
        return str(value)
