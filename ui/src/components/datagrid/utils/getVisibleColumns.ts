/**
 * getVisibleColumns - Filters columns to get exportable field names
 *
 * Excludes:
 * - Hidden columns (based on visibility model)
 * - Actions column
 * - UI-only columns (non-sortable AND non-filterable)
 */
import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';

/**
 * Returns array of visible column field names suitable for export
 */
export function getVisibleColumns(
  columns: GridColDef[],
  visibilityModel: GridColumnVisibilityModel
): string[] {
  return columns
    .filter((col) => visibilityModel[col.field] !== false)
    .filter((col) => {
      // Exclude actions column
      if (col.field === 'actions') return false;

      // Exclude UI-only columns (non-sortable AND non-filterable)
      if (col.sortable === false && col.filterable === false) return false;

      return true;
    })
    .map((col) => col.field);
}
