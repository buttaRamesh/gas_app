/**
 * useGridData - Manages DataGrid data fetching with debouncing and cancellation
 *
 * Handles API calls to fetch data with proper error handling and loading states
 */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axiosInstance from '@/api/axiosInstance';
import type { GridSortModel, GridFilterModel, GridPaginationModel } from '@mui/x-data-grid';

interface UseGridDataOptions {
  endpoint: string;
  extraParams: Record<string, any>;
  paginationModel: GridPaginationModel;
  sortModel: GridSortModel;
  filterModel: GridFilterModel;
}

export function useGridData({
  endpoint,
  extraParams,
  paginationModel,
  sortModel,
  filterModel,
}: UseGridDataOptions) {
  const [rows, setRows] = useState<any[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Clean endpoint
  const cleanedEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

  // Calculate valid filters (memoized to prevent unnecessary re-fetches)
  const validFilters = useMemo(() => {
    if (!filterModel.items || filterModel.items.length === 0) {
      return [];
    }

    return filterModel.items.filter((filter) => {
      // Must have field and operator
      if (!filter.field || !filter.operator) return false;

      // isEmpty and isNotEmpty don't need a value
      if (filter.operator === 'isEmpty' || filter.operator === 'isNotEmpty') {
        return true;
      }

      // Other operators need a non-empty value
      if (filter.value === undefined || filter.value === null || filter.value === '') {
        return false;
      }

      return true;
    });
  }, [filterModel.items]);

  // Serialize valid filters for dependency tracking
  const validFiltersKey = useMemo(
    () => JSON.stringify(validFilters),
    [validFilters]
  );

  // Clear data immediately when endpoint changes
  useEffect(() => {
    setRows([]);
    setRowCount(0);
    setLoading(true);
  }, [cleanedEndpoint]);

  // Fetch data function
  const fetchData = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setRows([]);
    setLoading(true);

    try {
      const params: Record<string, any> = {
        page: paginationModel.page + 1,
        page_size: paginationModel.pageSize,
        ...extraParams,
      };

      // Apply quick filter
      if (filterModel.quickFilterValues?.[0]) {
        params.search = filterModel.quickFilterValues[0];
      }

      // Apply column filters using filter_model for DataGridFilterBackend
      // Use the pre-calculated validFilters from useMemo
      if (validFilters.length > 0) {
        params.filter_model = JSON.stringify({
          items: validFilters,
          logicOperator: filterModel.logicOperator || 'and',
        });
      }

      // Apply sorting
      if (sortModel.length > 0) {
        const orderingFields = sortModel
          .filter((s) => s?.field)
          .map((s) => (s.sort === 'desc' ? `-${s.field}` : s.field));

        if (orderingFields.length > 0) {
          params.ordering = orderingFields.join(',');
        }
      }

      const resp = await axiosInstance.get(cleanedEndpoint, {
        params,
        signal: abortController.signal,
      });

      setRows(resp.data.results ?? []);
      setRowCount(resp.data.count ?? 0);
    } catch (err: any) {
      // Ignore aborted requests
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        return;
      }
      console.error('SmartDataGrid fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [
    cleanedEndpoint,
    extraParams,
    paginationModel.page,
    paginationModel.pageSize,
    filterModel.quickFilterValues,
    filterModel.logicOperator,
    validFiltersKey,
    sortModel,
  ]);

  // Debounced fetch trigger
  useEffect(() => {
    if (fetchDebounceRef.current) {
      clearTimeout(fetchDebounceRef.current);
    }

    fetchDebounceRef.current = setTimeout(fetchData, 300);

    return () => {
      if (fetchDebounceRef.current) {
        clearTimeout(fetchDebounceRef.current);
      }
    };
  }, [fetchData]);

  return {
    rows,
    rowCount,
    loading,
  };
}
