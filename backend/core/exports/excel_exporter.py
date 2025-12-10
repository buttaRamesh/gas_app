"""
Excel Exporter - generates Excel (.xlsx) export files with formatting.
"""
from io import BytesIO
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from .base import BaseExporter


class ExcelExporter(BaseExporter):
    """
    Export data to Excel format with professional formatting.

    Features:
    - Bold headers with background color
    - Auto-sized columns
    - Borders and alignment
    - Freeze header row
    """

    extension = 'xlsx'
    content_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

    def generate(self):
        """
        Generate Excel file and return as HttpResponse.

        Returns:
            HttpResponse with Excel content
        """
        # Create workbook and worksheet
        workbook = Workbook()
        worksheet = workbook.active
        worksheet.title = "Export Data"

        # Get headers and data
        headers = self.get_headers()
        data_rows = self.get_data_rows()

        # Define styles
        header_font = Font(bold=True, color="FFFFFF", size=11)
        header_fill = PatternFill(start_color="003366", end_color="003366", fill_type="solid")
        header_alignment = Alignment(horizontal="center", vertical="center")

        border_side = Side(style='thin', color="CCCCCC")
        cell_border = Border(left=border_side, right=border_side, top=border_side, bottom=border_side)
        cell_alignment = Alignment(horizontal="left", vertical="center")

        # Write headers (row 1)
        for col_idx, header in enumerate(headers, start=1):
            cell = worksheet.cell(row=1, column=col_idx, value=header)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = header_alignment
            cell.border = cell_border

        # Write data rows (starting from row 2)
        for row_idx, row_dict in enumerate(data_rows, start=2):
            for col_idx, field in enumerate(self.visible_fields, start=1):
                value = row_dict.get(field, '')
                cell = worksheet.cell(row=row_idx, column=col_idx, value=value)
                cell.alignment = cell_alignment
                cell.border = cell_border

        # Auto-size columns based on content
        for col_idx, header in enumerate(headers, start=1):
            column_letter = worksheet.cell(row=1, column=col_idx).column_letter

            # Calculate max width
            max_length = len(str(header))
            for row_idx in range(2, len(data_rows) + 2):
                cell_value = worksheet.cell(row=row_idx, column=col_idx).value
                if cell_value:
                    max_length = max(max_length, len(str(cell_value)))

            # Set column width (with a reasonable max)
            adjusted_width = min(max_length + 2, 50)
            worksheet.column_dimensions[column_letter].width = adjusted_width

        # Freeze header row
        worksheet.freeze_panes = 'A2'

        # Save to BytesIO buffer
        buffer = BytesIO()
        workbook.save(buffer)
        buffer.seek(0)

        # Create and return response
        return self.create_response(buffer.read())
