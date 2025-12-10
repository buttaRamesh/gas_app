"""
CSV Exporter - generates comma-separated values export files.
"""
import csv
from io import StringIO
from django.http import StreamingHttpResponse
from .base import BaseExporter


class CSVExporter(BaseExporter):
    """
    Export data to CSV format.

    Features:
    - UTF-8 encoding with BOM for Excel compatibility
    - Streaming response for large datasets
    - Handles special characters and commas
    """

    extension = 'csv'
    content_type = 'text/csv; charset=utf-8'

    def generate(self) -> StreamingHttpResponse:
        """
        Generate CSV file and return as streaming response.

        Returns:
            StreamingHttpResponse with CSV content
        """
        def csv_generator():
            """Generator function for streaming CSV data"""
            # Create StringIO buffer
            buffer = StringIO()
            writer = csv.writer(buffer)

            # Write UTF-8 BOM for Excel compatibility
            yield '\ufeff'

            # Write headers
            headers = self.get_headers()
            writer.writerow(headers)
            yield buffer.getvalue()
            buffer.seek(0)
            buffer.truncate(0)

            # Write data rows
            data_rows = self.get_data_rows()
            for row_dict in data_rows:
                row_values = [
                    row_dict.get(field, '')
                    for field in self.visible_fields
                ]
                writer.writerow(row_values)
                yield buffer.getvalue()
                buffer.seek(0)
                buffer.truncate(0)

        # Create streaming response
        response = StreamingHttpResponse(
            csv_generator(),
            content_type=self.content_type
        )
        filename = self.get_filename()
        response['Content-Disposition'] = f'attachment; filename="{filename}"'

        return response
