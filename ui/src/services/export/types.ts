/**
 * Export module types and interfaces
 */

/**
 * Supported export formats
 */
export type ExportFormat = 'csv' | 'excel' | 'pdf';

/**
 * Export options passed to the export service
 */
export interface ExportOptions {
  /** API endpoint to export from (e.g., '/consumers/') */
  endpoint: string;

  /** Export format */
  format: ExportFormat;

  /** List of visible column field names to export */
  visibleColumns: string[];

  /** Optional query parameters (filters, search, ordering) */
  params?: Record<string, any>;
}

/**
 * Export hook state
 */
export interface ExportState {
  /** Whether export is in progress */
  isExporting: boolean;

  /** Error message if export failed */
  error: string | null;

  /** Current export format being processed */
  currentFormat: ExportFormat | null;
}

/**
 * Export format metadata
 */
export interface ExportFormatInfo {
  /** Format identifier */
  format: ExportFormat;

  /** Display label */
  label: string;

  /** Icon name or component */
  icon?: string;

  /** MIME type */
  mimeType: string;

  /** File extension */
  extension: string;
}

/**
 * Available export formats with metadata
 */
export const EXPORT_FORMATS: ExportFormatInfo[] = [
  {
    format: 'csv',
    label: 'CSV',
    mimeType: 'text/csv',
    extension: 'csv',
  },
  {
    format: 'excel',
    label: 'Excel',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extension: 'xlsx',
  },
  {
    format: 'pdf',
    label: 'PDF',
    mimeType: 'application/pdf',
    extension: 'pdf',
  },
];
