"""
Base exporter class providing common functionality for all export formats.
"""
from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Dict, Any
from django.http import HttpResponse


class BaseExporter(ABC):
    """
    Abstract base class for all exporters.

    Provides common functionality:
    - Filename generation with timestamp
    - Field filtering (only visible columns)
    - Data iteration

    Subclasses must implement:
    - generate(): Creates and returns the file response
    - extension: File extension (csv, xlsx, pdf)
    - content_type: MIME type
    """

    extension: str = None
    content_type: str = None

    def __init__(
        self,
        queryset,
        visible_fields: List[str],
        filename_prefix: str = "export",
        serializer_class=None
    ):
        """
        Initialize exporter.

        Args:
            queryset: Django queryset to export
            visible_fields: List of field names to include in export
            filename_prefix: Prefix for the generated filename
            serializer_class: Optional serializer to format data
        """
        self.queryset = queryset
        self.visible_fields = visible_fields
        self.filename_prefix = filename_prefix
        self.serializer_class = serializer_class

    def get_filename(self) -> str:
        """
        Generate filename with timestamp.

        Format: {prefix}_export_{YYYY-MM-DD}_{HHMMSS}.{extension}
        Example: consumers_export_2025-12-09_143022.csv
        """
        if not self.extension:
            raise NotImplementedError("Subclass must define 'extension' attribute")

        timestamp = datetime.now().strftime('%Y-%m-%d_%H%M%S')
        return f"{self.filename_prefix}_export_{timestamp}.{self.extension}"

    def get_headers(self) -> List[str]:
        """
        Get human-readable headers from field names.

        Converts snake_case to Title Case.
        Example: consumer_number -> Consumer Number
        """
        return [
            field.replace('_', ' ').title()
            for field in self.visible_fields
        ]

    def get_data_rows(self) -> List[Dict[str, Any]]:
        """
        Get data rows from queryset.

        If serializer_class is provided, uses serializer to format data.
        Otherwise, uses queryset values.

        Returns:
            List of dictionaries with only visible fields
        """
        if self.serializer_class:
            # Use serializer to format data
            serializer = self.serializer_class(self.queryset, many=True)
            data = serializer.data
        else:
            # Use queryset values
            data = list(self.queryset.values())

        # Filter to only visible fields
        filtered_data = []
        for row in data:
            filtered_row = {
                field: row.get(field, '')
                for field in self.visible_fields
            }
            filtered_data.append(filtered_row)

        return filtered_data

    @abstractmethod
    def generate(self) -> HttpResponse:
        """
        Generate the export file and return as HttpResponse.

        Must be implemented by subclasses.

        Returns:
            HttpResponse with appropriate content type and file attachment
        """
        pass

    def create_response(self, file_content: bytes = None) -> HttpResponse:
        """
        Create HTTP response with appropriate headers.

        Args:
            file_content: Optional bytes content for the file

        Returns:
            HttpResponse configured for file download
        """
        if not self.content_type:
            raise NotImplementedError("Subclass must define 'content_type' attribute")

        response = HttpResponse(content_type=self.content_type)
        filename = self.get_filename()
        response['Content-Disposition'] = f'attachment; filename="{filename}"'

        if file_content:
            response.write(file_content)

        return response
