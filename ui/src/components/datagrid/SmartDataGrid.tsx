// src/components/datagrid/SmartDataGrid.tsx
import React from "react";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";

import type {
  GridColDef,
  GridSortModel,
  GridPaginationModel,
  GridFilterModel,
  GridColumnVisibilityModel,
} from "@mui/x-data-grid";

import axios from "@/api/axiosInstance";
import SmartDataGridToolbar from "./SmartDataGridToolbar";

export interface SmartDataGridProps {
  endpoint: string;
  columns: (GridColDef & { visibleByDefault?: boolean })[];
  extraParams?: Record<string, any>;
  pageSizeOptions?: number[];
  initialPageSize?: number;

  toolbarOptions?: {
    showColumns?: boolean;
    showFilters?: boolean;
    showExport?: boolean;
  };
}

/**
 * SmartDataGrid:
 * - Reusable across all list pages.
 * - Internally handles: server paging, sorting, filtering, quick-search (q).
 * - Debounces fetch.
 * - Controlled column visibility based on visibleByDefault.
 * - Exposes toolbar via slots.toolbar with slotProps.toolbar.
 * - CSV/Print/Excel are placeholders only (as per requirement).
 *
 * List pages only pass: endpoint, columns, toolbarOptions.
 */
export default function SmartDataGrid({
  endpoint,
  columns,
  extraParams,
  pageSizeOptions = [10, 20, 50],
  initialPageSize = 20,
  toolbarOptions,
}: SmartDataGridProps) {
  // table data
  const [rows, setRows] = React.useState<any[]>([]);
  const [rowCount, setRowCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  // create stable params so that useCallback doesn't fire unnecessarily
  const stableExtraParams = React.useMemo(
    () => (extraParams ? JSON.parse(JSON.stringify(extraParams)) : {}),
    [JSON.stringify(extraParams ?? {})]
  );

  // server-side models
  const [paginationModel, setPaginationModel] =
    React.useState<GridPaginationModel>({
      page: 0,
      pageSize: initialPageSize,
    });

  const [sortModel, setSortModel] = React.useState<GridSortModel>([]);
  const [filterModel, setFilterModel] = React.useState<GridFilterModel>({
    items: [],
    quickFilterValues: [],
  });

  const [quickFilterValue, setQuickFilterValue] = React.useState("");

  // process column visibility based on visibleByDefault
  const { processedColumns, initialVisibilityModel } = React.useMemo(() => {
    const vis: Record<string, boolean> = {};

    const processed = columns.map((col) => {
      const visible =
        typeof col.visibleByDefault === "boolean" ? col.visibleByDefault : true;

      vis[col.field] = visible;

      const { visibleByDefault, ...rest } = col as any;
      return rest as GridColDef;
    });

    return {
      processedColumns: processed,
      initialVisibilityModel: vis as GridColumnVisibilityModel,
    };
  }, [columns]);

  const [columnVisibilityModel, setColumnVisibilityModel] =
    React.useState<GridColumnVisibilityModel>(initialVisibilityModel);

  // ensure endpoint has no leading slash for axios base handling
  const cleanedEndpoint = React.useMemo(
    () => (endpoint.startsWith("/") ? endpoint.slice(1) : endpoint),
    [endpoint]
  );

  // fetch data
  const fetchData = React.useCallback(async () => {
    setLoading(true);

    try {
      const params: Record<string, any> = {
        page: paginationModel.page + 1, // backend is 1-based
        page_size: paginationModel.pageSize,
        ...stableExtraParams,
      };

      if (quickFilterValue.trim()) {
        params.q = quickFilterValue.trim();
      }

      if (sortModel.length > 0) {
        const s = sortModel[0];
        params.ordering = s.sort === "desc" ? `-${s.field}` : s.field;
      }

      const resp = await axios.get(cleanedEndpoint, { params });

      setRows(resp.data.results ?? []);
      setRowCount(resp.data.count ?? 0);
    } catch (err) {
      console.error("SmartDataGrid fetch error:", err);
      setRows([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  }, [
    cleanedEndpoint,
    stableExtraParams,
    paginationModel.page,
    paginationModel.pageSize,
    quickFilterValue,
    sortModel,
  ]);

  // debounce fetch
  React.useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [fetchData]);

  // handlers with loop protection
  const handlePaginationModelChange = (model: GridPaginationModel) => {
    if (
      model.page === paginationModel.page &&
      model.pageSize === paginationModel.pageSize
    )
      return;
    setPaginationModel(model);
  };

  const handleSortModelChange = (model: GridSortModel) => {
    const prev = sortModel[0];
    const next = model[0];

    if (prev?.field === next?.field && prev?.sort === next?.sort) return;

    setSortModel(model);
  };

  const handleFilterModelChange = (model: GridFilterModel) => {
    const newQuick = model.quickFilterValues?.[0] ?? "";
    if (newQuick !== quickFilterValue) {
      setQuickFilterValue(newQuick);
      setPaginationModel((p) => ({ ...p, page: 0 }));
    }
    setFilterModel(model);
  };

  const handleQuickFilterChange = (val: string) => {
    setQuickFilterValue(val);
    setFilterModel((old) => ({
      ...old,
      quickFilterValues: val ? [val] : [],
    }));
    setPaginationModel((p) => ({ ...p, page: 0 }));
  };

  // dummy functions for export placeholders
  const placeholderCsv = React.useCallback(() => {}, []);
  const placeholderPrint = React.useCallback(() => {}, []);
  const placeholderExcel = React.useCallback(() => {}, []);

  return (
    <Box sx={{ width: "100%", height: "calc(100vh - 180px)" }}>
      <DataGrid
        showToolbar
        rows={rows}
        columns={processedColumns}
        rowCount={rowCount}
        loading={loading}
        disableRowSelectionOnClick
        paginationMode="server"
        sortingMode="server"
        filterMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        sortModel={sortModel}
        onSortModelChange={handleSortModelChange}
        filterModel={filterModel}
        onFilterModelChange={handleFilterModelChange}
        pageSizeOptions={pageSizeOptions}
        initialState={{
          columns: { columnVisibilityModel: initialVisibilityModel },
        }}
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={(m) => setColumnVisibilityModel(m)}
        slots={{
          toolbar: SmartDataGridToolbar,
        }}
        slotProps={{
          toolbar: {
            quickFilterValue,
            onQuickFilterChange: handleQuickFilterChange,
            showColumns: toolbarOptions?.showColumns ?? true,
            showFilters: toolbarOptions?.showFilters ?? true,
            showExport: toolbarOptions?.showExport ?? true,
            filterCount: filterModel.items.length,

            // placeholders
            onExportCsv: placeholderCsv,
            onPrint: placeholderPrint,
            onExportExcel: placeholderExcel,
          } as unknown as any, // avoid TS literal-check errors
        }}
      />
    </Box>
  );
}
