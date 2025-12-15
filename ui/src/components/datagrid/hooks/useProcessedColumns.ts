/**
 * useProcessedColumns - Processes column definitions for DataGrid
 *
 * Extracts visibleByDefault property and builds initial visibility model
 */
import { useMemo } from 'react';
import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';

export type ColumnWithVisibility = GridColDef & { visibleByDefault?: boolean };

interface ProcessedColumnsResult {
  processedColumns: GridColDef[];
  initialVisibility: GridColumnVisibilityModel;
}

/**
 * Processes raw columns with visibleByDefault into clean GridColDef
 * and generates initial visibility model
 */
export function useProcessedColumns(
  columns: ColumnWithVisibility[]
): ProcessedColumnsResult {
  return useMemo(() => {
    const visibility: GridColumnVisibilityModel = {};

    const processed = columns.map((col) => {
      // Determine if column should be visible by default
      const visible =
        typeof col.visibleByDefault === 'boolean'
          ? col.visibleByDefault
          : true;

      visibility[col.field] = visible;

      // Remove custom property from column definition
      const { visibleByDefault, ...rest } = col as any;
      return rest as GridColDef;
    });

    return {
      processedColumns: processed,
      initialVisibility: visibility,
    };
  }, [columns]);
}
