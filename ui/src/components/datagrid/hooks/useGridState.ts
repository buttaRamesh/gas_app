/**
 * useGridState - Manages DataGrid state (sorting and filtering)
 *
 * Handles sort model and filter model state with proper callbacks
 */
import { useState, useCallback } from 'react';
import type {
  GridSortModel,
  GridFilterModel,
  GridPaginationModel
} from '@mui/x-data-grid';

export function useGridState() {
  // Sorting state
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  // Filtering state
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
    quickFilterValues: [],
  });

  // Handle sort model changes
  const handleSortModelChange = useCallback(
    (newModel: GridSortModel, setPaginationModel: (updater: (prev: GridPaginationModel) => GridPaginationModel) => void) => {
      const isSame = JSON.stringify(newModel) === JSON.stringify(sortModel);
      if (isSame) return;

      setSortModel(newModel);
      // Reset to first page when sorting changes
      setPaginationModel((p) => ({ ...p, page: 0 }));
    },
    [sortModel]
  );

  // Handle filter model changes
  const handleFilterModelChange = useCallback(
    (model: GridFilterModel, setPaginationModel: (updater: (prev: GridPaginationModel) => GridPaginationModel) => void) => {
      const isSame = JSON.stringify(model) === JSON.stringify(filterModel);
      if (isSame) return;

      setFilterModel(model);

      // Only reset pagination if there are complete valid filters or quick filter
      const hasValidFilters =
        model.items?.some((filter) => {
          if (!filter.field || !filter.operator) return false;
          if (filter.operator === 'isEmpty' || filter.operator === 'isNotEmpty') return true;
          return filter.value !== undefined && filter.value !== null && filter.value !== '';
        }) || (model.quickFilterValues && model.quickFilterValues.length > 0);

      if (hasValidFilters) {
        setPaginationModel((p) => ({ ...p, page: 0 }));
      }
    },
    [filterModel]
  );

  return {
    sortModel,
    setSortModel,
    filterModel,
    setFilterModel,
    handleSortModelChange,
    handleFilterModelChange,
  };
}
