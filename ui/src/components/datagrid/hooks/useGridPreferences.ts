/**
 * useGridPreferences - Manages DataGrid preferences persistence in localStorage
 *
 * Handles saving/loading column visibility and page size preferences
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import type { GridColumnVisibilityModel, GridPaginationModel } from '@mui/x-data-grid';

interface GridPreferences {
  columnVisibility: GridColumnVisibilityModel;
  pageSize: number;
}

interface UseGridPreferencesOptions {
  storageKey: string;
  initialVisibility: GridColumnVisibilityModel;
  initialPageSize: number;
}

export function useGridPreferences({
  storageKey,
  initialVisibility,
  initialPageSize,
}: UseGridPreferencesOptions) {
  // Load saved preferences from localStorage
  const loadPreferences = useCallback((): GridPreferences | null => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load grid preferences:', error);
    }
    return null;
  }, [storageKey]);

  const savedPrefs = useMemo(() => loadPreferences(), [loadPreferences]);

  // Column visibility state
  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>(
      savedPrefs?.columnVisibility ?? initialVisibility
    );

  // Pagination state
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: savedPrefs?.pageSize ?? initialPageSize,
  });

  // Save preferences whenever they change
  useEffect(() => {
    try {
      const preferences: GridPreferences = {
        columnVisibility: columnVisibilityModel,
        pageSize: paginationModel.pageSize,
      };
      localStorage.setItem(storageKey, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save grid preferences:', error);
    }
  }, [columnVisibilityModel, paginationModel.pageSize, storageKey]);

  return {
    columnVisibilityModel,
    setColumnVisibilityModel,
    paginationModel,
    setPaginationModel,
  };
}
