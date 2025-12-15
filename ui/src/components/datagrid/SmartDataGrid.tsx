// src/components/datagrid/SmartDataGrid.tsx
/**
 * SmartDataGrid - Professional DataGrid component with advanced features
 *
 * Features:
 * - Server-side pagination, sorting, and filtering
 * - Column visibility management with persistence
 * - Export to CSV, Excel, and PDF with filters
 * - Print functionality
 * - Responsive and themable
 *
 * Refactored twice for maximum maintainability
 */
import React from "react";
import Box from "@mui/material/Box";
import { DataGrid, type GridPaginationModel } from "@mui/x-data-grid";

import SmartDataGridToolbar from "./SmartDataGridToolbar";
import { useExport } from "@/hooks/useExport";
import {
  useGridPreferences,
  useGridState,
  useGridData,
  usePrintGrid,
  useProcessedColumns,
  usePageTitle,
  type ColumnWithVisibility,
} from "./hooks";
import { buildExportParams } from "./utils/buildExportParams";
import { extractResource } from "./utils/extractResource";
import { getVisibleColumns } from "./utils/getVisibleColumns";
import { NoRowsOverlay, LoadingOverlay } from "./components/DataGridSlots";
import { datagridStyles } from "./styles/datagridStyles";

export interface SmartDataGridProps {
  endpoint: string;
  columns: ColumnWithVisibility[];
  extraParams?: Record<string, any>;
  pageSizeOptions?: number[];
  initialPageSize?: number;

  toolbarOptions?: {
    showColumns?: boolean;
    showFilters?: boolean;
    showExport?: boolean;
    kycStatus?: "pending" | "done";
    onKycStatusChange?: (status: "pending" | "done") => void;
  };
}

export default function SmartDataGrid({
  endpoint,
  columns,
  extraParams,
  pageSizeOptions = [10, 20, 50],
  initialPageSize = 20,
  toolbarOptions,
}: SmartDataGridProps) {
  /* ==================== Derived Values ==================== */
  const resource = React.useMemo(() => extractResource(endpoint), [endpoint]);

  const stableExtraParams = React.useMemo(
    () => extraParams ?? {},
    [JSON.stringify(extraParams ?? {})]
  );

  const storageKey = React.useMemo(
    () => `datagrid-prefs-${endpoint}`,
    [endpoint]
  );

  /* ==================== Column Processing ==================== */
  const { processedColumns, initialVisibility } = useProcessedColumns(columns);

  /* ==================== Page Title ==================== */
  const pageTitle = usePageTitle({ endpoint, resource });

  /* ==================== State Management (Hooks) ==================== */
  // Grid preferences (localStorage)
  const {
    columnVisibilityModel,
    setColumnVisibilityModel,
    paginationModel,
    setPaginationModel,
  } = useGridPreferences({
    storageKey,
    initialVisibility,
    initialPageSize,
  });

  // Grid state (sorting, filtering)
  const {
    sortModel,
    filterModel,
    handleSortModelChange,
    handleFilterModelChange,
  } = useGridState();

  // Data fetching
  const { rows, rowCount, loading } = useGridData({
    endpoint,
    extraParams: stableExtraParams,
    paginationModel,
    sortModel,
    filterModel,
  });

  /* ==================== Export Functionality ==================== */
  const { exportData, isExporting, error: exportError } = useExport(resource);

  // Visible columns for export
  const visibleColumns = React.useMemo(
    () => getVisibleColumns(processedColumns, columnVisibilityModel),
    [processedColumns, columnVisibilityModel]
  );

  // Export params with all filters
  const exportParams = React.useMemo(
    () =>
      buildExportParams({
        extraParams: stableExtraParams,
        filterModel,
        sortModel,
      }),
    [stableExtraParams, filterModel, sortModel]
  );

  /* ==================== Print Functionality ==================== */
  const { handlePrint: printGrid } = usePrintGrid({
    processedColumns,
    columnVisibilityModel,
    pageTitle,
  });

  const handlePrint = React.useCallback(() => {
    printGrid(rows);
  }, [printGrid, rows]);

  /* ==================== Event Handlers ==================== */
  const handlePaginationModelChange = React.useCallback(
    (model: GridPaginationModel) => {
      if (
        model.page === paginationModel.page &&
        model.pageSize === paginationModel.pageSize
      ) {
        return;
      }
      setPaginationModel(model);
    },
    [paginationModel.page, paginationModel.pageSize, setPaginationModel]
  );

  /* ==================== Render ==================== */
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <DataGrid
        rows={rows}
        columns={processedColumns}
        loading={loading}
        rowCount={rowCount}
        disableRowSelectionOnClick
        disableColumnMenu
        disableMultipleColumnsSorting={false}
        autoHeight={false}
        rowHeight={42}
        paginationMode="server"
        sortingMode="server"
        filterMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        sortModel={sortModel}
        onSortModelChange={(model) =>
          handleSortModelChange(model, setPaginationModel)
        }
        filterModel={filterModel}
        onFilterModelChange={(model) =>
          handleFilterModelChange(model, setPaginationModel)
        }
        pageSizeOptions={pageSizeOptions}
        initialState={{
          columns: { columnVisibilityModel: initialVisibility },
        }}
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={setColumnVisibilityModel}
        showToolbar
        slots={{
          toolbar: SmartDataGridToolbar,
          noRowsOverlay: () => (
            <NoRowsOverlay
              hasQuickFilter={!!filterModel.quickFilterValues?.[0]}
            />
          ),
          loadingOverlay: LoadingOverlay,
        }}
        slotProps={{
          toolbar: {
            showColumns: toolbarOptions?.showColumns ?? true,
            showFilters: toolbarOptions?.showFilters ?? true,
            showExport: toolbarOptions?.showExport ?? true,
            filterCount: filterModel.items.length,
            kycStatus: toolbarOptions?.kycStatus,
            onKycStatusChange: toolbarOptions?.onKycStatusChange,
            exportData,
            isExporting,
            exportError,
            visibleColumns,
            exportParams,
            onPrint: handlePrint,
            pageTitle: pageTitle,
          } as unknown as any,
        }}
        sx={datagridStyles}
      />
    </Box>
  );
}
