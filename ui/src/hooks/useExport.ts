/**
 * useExport Hook - manages export state and provides export functionality
 */
import { useState, useCallback } from 'react';
import { exportData as exportDataService } from '@/services/export/exportService';
import type { ExportFormat, ExportState } from '@/services/export/types';

/**
 * Hook for managing data export functionality
 *
 * @param resource - Resource name (e.g., 'consumers', 'routes')
 * @returns Export state and functions
 *
 * @example
 * ```tsx
 * const { exportData, isExporting, error } = useExport('consumers');
 *
 * const handleExport = async () => {
 *   await exportData(
 *     'excel',
 *     ['id', 'name', 'mobile'],
 *     { search: 'john', ordering: 'name' }
 *   );
 * };
 * ```
 */
export function useExport(resource: string) {
  const [state, setState] = useState<ExportState>({
    isExporting: false,
    error: null,
    currentFormat: null,
  });

  /**
   * Export data in specified format
   *
   * @param format - Export format (csv, excel, pdf)
   * @param visibleColumns - Array of column field names to export
   * @param filters - Optional filters (search, ordering, etc.)
   * @param pageTitle - Optional custom title for Excel/PDF
   */
  const exportData = useCallback(
    async (
      format: ExportFormat,
      visibleColumns: string[],
      filters?: Record<string, any>,
      pageTitle?: string
    ): Promise<void> => {
      // Validate inputs
      if (!visibleColumns || visibleColumns.length === 0) {
        setState((prev) => ({
          ...prev,
          error: 'No columns selected for export',
        }));
        return;
      }

      // Set loading state
      setState({
        isExporting: true,
        error: null,
        currentFormat: format,
      });

      try {
        // Call export service
        await exportDataService({
          resource,
          format,
          visibleColumns,
          filters,
          pageTitle,
        });

        // Success - reset state
        setState({
          isExporting: false,
          error: null,
          currentFormat: null,
        });
      } catch (error: any) {
        // Error - set error state
        setState({
          isExporting: false,
          error: error.message || 'Export failed',
          currentFormat: null,
        });

        // Re-throw for component to handle if needed
        throw error;
      }
    },
    [resource]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    /** Whether export is currently in progress */
    isExporting: state.isExporting,

    /** Error message if export failed */
    error: state.error,

    /** Current export format being processed */
    currentFormat: state.currentFormat,

    /** Export data function */
    exportData,

    /** Clear error function */
    clearError,
  };
}
