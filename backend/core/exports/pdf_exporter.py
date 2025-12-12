"""
PDF Exporter - generates PDF export files with formatted tables.
"""
from io import BytesIO
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.enums import TA_CENTER
from datetime import datetime
from .base import BaseExporter


class PDFExporter(BaseExporter):
    """
    Export data to PDF format with formatted tables.

    Features:
    - Landscape orientation for wide tables
    - Professional table styling
    - Header with export info
    - Auto-sized columns
    - Page breaks for large datasets
    """

    extension = 'pdf'
    content_type = 'application/pdf'

    def generate(self):
        """
        Generate PDF file and return as HttpResponse.

        Returns:
            HttpResponse with PDF content
        """
        # Create PDF buffer
        buffer = BytesIO()

        # Create PDF document (landscape for wide tables)
        doc = SimpleDocTemplate(
            buffer,
            pagesize=landscape(letter),
            rightMargin=30,
            leftMargin=30,
            topMargin=50,
            bottomMargin=30
        )

        # Container for PDF elements
        elements = []

        # Add title
        styles = getSampleStyleSheet()
        title_style = styles['Title']
        title_style.alignment = TA_CENTER
        title = Paragraph(self.page_title, title_style)
        elements.append(title)

        # Add subtitle with total records
        subtitle_style = styles['Normal']
        subtitle_style.alignment = TA_CENTER
        total_records = self.queryset.count()
        subtitle = Paragraph(f"Total Records: {total_records}", subtitle_style)
        elements.append(subtitle)
        elements.append(Spacer(1, 0.3 * inch))

        # Get headers
        headers = self.get_headers()

        # Prepare table data
        table_data = [headers]  # First row is headers

        # Stream data rows efficiently using bulk loader
        import time
        if self.serializer_class:
            # Toggle between ORM and Raw SQL implementations
            USE_RAW_SQL = True  # ← Set to False to use ORM version

            t_bulk_start = time.time()

            if USE_RAW_SQL:
                from core.exports.bulk_loaders_raw_sql import bulk_load_consumer_export_data_raw_sql
                print(f"  📊 PDF: Using RAW SQL bulk loading...")
                data = bulk_load_consumer_export_data_raw_sql(self.queryset, self.visible_fields)
            else:
                from core.exports.bulk_loaders import bulk_load_consumer_export_data
                print(f"  📊 PDF: Using ORM bulk loading...")
                data = bulk_load_consumer_export_data(self.queryset, self.visible_fields)

            print(f"  ⏱️  PDF: Bulk load complete: {(time.time() - t_bulk_start):.2f}s")

            t_write_start = time.time()
            pdf_row_count = 0
            for row_dict in data:
                row_values = [
                    self._format_value(row_dict.get(field, ''))
                    for field in self.visible_fields
                ]
                table_data.append(row_values)
                pdf_row_count += 1
            print(f"  ⏱️  PDF: Process {pdf_row_count} rows: {(time.time() - t_write_start):.2f}s")
        else:
            # Fast path: Stream values() directly
            for row_dict in self.queryset.values(*self.visible_fields).iterator(chunk_size=1000):
                row_values = [
                    self._format_value(row_dict.get(field, ''))
                    for field in self.visible_fields
                ]
                table_data.append(row_values)

        # Calculate column widths based on number of columns
        page_width = landscape(letter)[0] - 60  # Account for margins
        num_columns = len(headers)
        col_width = page_width / num_columns

        # Limit column width for readability
        col_width = min(col_width, 2 * inch)
        col_widths = [col_width] * num_columns

        # Create table
        table = Table(table_data, colWidths=col_widths, repeatRows=1)

        # Apply table styling
        table_style = TableStyle([
            # Header row styling
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#003366')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('TOPPADDING', (0, 0), (-1, 0), 12),

            # Data rows styling
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('TOPPADDING', (0, 1), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),

            # Borders
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('LINEBELOW', (0, 0), (-1, 0), 2, colors.HexColor('#003366')),

            # Alternating row colors for readability
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F5F5F5')]),
        ])

        table.setStyle(table_style)
        elements.append(table)

        # Build PDF
        doc.build(elements)

        # Get PDF data
        buffer.seek(0)
        pdf_data = buffer.read()

        # Create and return response
        return self.create_response(pdf_data)

    def _format_value(self, value):
        """Format a value for PDF output."""
        if value is None:
            return ''
        if isinstance(value, bool):
            return 'Yes' if value else 'No'
        return str(value)
