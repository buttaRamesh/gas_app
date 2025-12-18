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

  // Handle sort model changes with multi-column support
  const handleSortModelChange = useCallback(
    (newModel: GridSortModel, setPaginationModel: (updater: (prev: GridPaginationModel) => GridPaginationModel) => void) => {
      // Reset to first page when sorting changes
      setPaginationModel((p) => ({ ...p, page: 0 }));

      // Multi-column sorting logic:
      // - If user clicks a new column, add it as secondary sort
      // - If user clicks an existing sorted column, cycle through: asc -> desc -> remove
      if (newModel.length === 0) {
        setSortModel([]);
        return;
      }

      const newSort = newModel[0];
      const existingIndex = sortModel.findIndex((s) => s.field === newSort.field);

      if (existingIndex === -1) {
        // New column: Add to existing sorts
        setSortModel([...sortModel, newSort]);
      } else {
        // Existing column: Update or remove
        const existingSort = sortModel[existingIndex];

        if (existingSort.sort === 'asc' && newSort.sort === 'desc') {
          // asc -> desc
          const updatedModel = [...sortModel];
          updatedModel[existingIndex] = newSort;
          setSortModel(updatedModel);
        } else if (existingSort.sort === 'desc' && newSort.sort === 'asc') {
          // desc -> remove
          const updatedModel = sortModel.filter((_, i) => i !== existingIndex);
          setSortModel(updatedModel);
        } else {
          // Update the sort direction
          const updatedModel = [...sortModel];
          updatedModel[existingIndex] = newSort;
          setSortModel(updatedModel);
        }
      }
    },
    [sortModel]
  );

  // // Handle filter model changes
  // const handleFilterModelChange = useCallback(
  //   (model: GridFilterModel, setPaginationModel: (updater: (prev: GridPaginationModel) => GridPaginationModel) => void) => {
  //     setFilterModel(model);
  //     // Reset to first page when filters change
  //     setPaginationModel((p) => ({ ...p, page: 0 }));
  //   },
  //   []
  // );

   // Handle filter model changes
    const handleFilterModelChange = useCallback(
      (model: GridFilterModel, setPaginationModel: (updater: (prev: GridPaginationModel) => GridPaginationModel) => void) => {
        setFilterModel(model);

        // Only reset pagination if there are complete valid filters
        const hasValidFilters = model.items?.some((filter) => {
          if (!filter.field || !filter.operator) return false;
          if (filter.operator === 'isEmpty' || filter.operator === 'isNotEmpty') return true;
          return filter.value !== undefined && filter.value !== null && filter.value !== '';
        });

        if (hasValidFilters || model.quickFilterValues?.[0]) {
          setPaginationModel((p) => ({ ...p, page: 0 }));
        }
      },
      []
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
