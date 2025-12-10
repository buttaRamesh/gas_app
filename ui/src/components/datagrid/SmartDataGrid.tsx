// src/components/datagrid/SmartDataGrid.tsx

import React from "react";
import Box from "@mui/material/Box";
import { Typography, Skeleton } from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridSortModel,
  type GridPaginationModel,
  type GridFilterModel,
  type GridColumnVisibilityModel,
} from "@mui/x-data-grid";
import InboxIcon from "@mui/icons-material/Inbox";

import axiosInstance from "@/api/axiosInstance";
import SmartDataGridToolbar from "./SmartDataGridToolbar";
import { useExport } from "@/hooks/useExport";

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
  const [rows, setRows] = React.useState<any[]>([]);
  const [rowCount, setRowCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  /* Stable memoized extra filters */
  const stableExtraParams = React.useMemo(
    () => extraParams ?? {},
    [JSON.stringify(extraParams ?? {})]
  );

  /* Column visibility setup */
  const { processedColumns, initialVisibility } = React.useMemo(() => {
    const vis: Record<string, boolean> = {};

    const processed = columns.map((c) => {
      const visible =
        typeof c.visibleByDefault === "boolean" ? c.visibleByDefault : true;

      vis[c.field] = visible;

      const { visibleByDefault, ...rest } = c as any;
      return rest as GridColDef;
    });

    return {
      processedColumns: processed,
      initialVisibility: vis as GridColumnVisibilityModel,
    };
  }, [columns]);

  /* Storage key for persistence */
  const storageKey = React.useMemo(() => `datagrid-prefs-${endpoint}`, [endpoint]);

  /* Load saved preferences from localStorage */
  const loadPreferences = React.useCallback(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Failed to load grid preferences:", error);
    }
    return null;
  }, [storageKey]);

  const savedPrefs = React.useMemo(() => loadPreferences(), [loadPreferences]);

  /* Pagination - initialize with saved or default */
  const [paginationModel, setPaginationModel] =
    React.useState<GridPaginationModel>({
      page: 0,
      pageSize: savedPrefs?.pageSize ?? initialPageSize,
    });

  /* Sorting */
  const [sortModel, setSortModel] = React.useState<GridSortModel>([]);

  /* Filtering */
  const [filterModel, setFilterModel] = React.useState<GridFilterModel>({
    items: [],
    quickFilterValues: [],
  });

  /* Column visibility - initialize with saved or default */
  const [columnVisibilityModel, setColumnVisibilityModel] =
    React.useState<GridColumnVisibilityModel>(
      savedPrefs?.columnVisibility ?? initialVisibility
    );

  /* Export functionality */
  const { exportData, isExporting, error: exportError } = useExport(endpoint);

  /* Calculate visible columns for export */
  const visibleColumns = React.useMemo(() => {
    return processedColumns
      .filter((col) => columnVisibilityModel[col.field] !== false)
      .map((col) => col.field);
  }, [processedColumns, columnVisibilityModel]);

  /* Save preferences to localStorage whenever they change */
  React.useEffect(() => {
    try {
      const preferences = {
        columnVisibility: columnVisibilityModel,
        pageSize: paginationModel.pageSize,
      };
      localStorage.setItem(storageKey, JSON.stringify(preferences));
    } catch (error) {
      console.error("Failed to save grid preferences:", error);
    }
  }, [columnVisibilityModel, paginationModel.pageSize, storageKey]);

  /* Clean endpoint */
  const cleanedEndpoint = endpoint.startsWith("/")
    ? endpoint.slice(1)
    : endpoint;

  /* Debounce reference */
  const fetchDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  /* AbortController to cancel previous requests */
  const abortControllerRef = React.useRef<AbortController | null>(null);

  /* Clear data immediately when endpoint changes and show loading */
  React.useEffect(() => {
    setRows([]);
    setRowCount(0);
    setLoading(true);
  }, [cleanedEndpoint]);

  /* Fetch data logic */
  const fetchData = React.useCallback(async () => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Clear data first for clean skeleton display
    setRows([]);
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page: paginationModel.page + 1,
        page_size: paginationModel.pageSize,
        ...stableExtraParams,
      };

      // Apply quick filter:
      if (filterModel.quickFilterValues?.[0]) {
        params.search = filterModel.quickFilterValues[0];
      }

      // Apply column filters from filter panel
      if (filterModel.items && filterModel.items.length > 0) {
        filterModel.items.forEach((filter) => {
          if (!filter.field || filter.value === undefined || filter.value === null) {
            return;
          }

          const { field, operator, value } = filter;

          // Map DataGrid operators to backend query params
          switch (operator) {
            case 'contains':
            case 'startsWith':
            case 'endsWith':
              // Text filters - backend uses icontains/istartswith/iendswith
              params[field] = value;
              break;

            case 'equals':
            case '=':
              // Exact match for numbers, IDs, and choice fields
              params[field] = value;
              break;

            case 'is':
              // Boolean filters (is_kyc_done, etc.)
              params[field] = value;
              break;

            case '>':
            case 'after':
              params[`${field}__gt`] = value;
              break;

            case '>=':
            case 'onOrAfter':
              params[`${field}__gte`] = value;
              break;

            case '<':
            case 'before':
              params[`${field}__lt`] = value;
              break;

            case '<=':
            case 'onOrBefore':
              params[`${field}__lte`] = value;
              break;

            case '!=':
            case 'not':
              params[`${field}__ne`] = value;
              break;

            case 'isEmpty':
              params[`${field}__isnull`] = 'true';
              break;

            case 'isNotEmpty':
              params[`${field}__isnull`] = 'false';
              break;

            case 'isAnyOf':
              // Multiple values (for choice fields)
              if (Array.isArray(value) && value.length > 0) {
                params[`${field}__in`] = value.join(',');
              }
              break;

            default:
              // Default to simple equality
              params[field] = value;
          }
        });
      }

      // Sorting: Support multiple columns (comma-separated)
      if (sortModel.length > 0) {
        const orderingFields = sortModel
          .filter((s) => s?.field)
          .map((s) => (s.sort === "desc" ? `-${s.field}` : s.field));

        if (orderingFields.length > 0) {
          params.ordering = orderingFields.join(",");
        }
      }

      const resp = await axiosInstance.get(cleanedEndpoint, {
        params,
        signal: abortController.signal
      });

      setRows(resp.data.results ?? []);
      setRowCount(resp.data.count ?? 0);
    } catch (err: any) {
      // Ignore aborted requests (they were intentionally cancelled)
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        return;
      }
      console.error("SmartDataGrid fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [
    cleanedEndpoint,
    stableExtraParams,
    paginationModel.page,
    paginationModel.pageSize,
    filterModel.quickFilterValues,
    filterModel.items,
    sortModel,
  ]);

  /* Debounce trigger */
  React.useEffect(() => {
    if (fetchDebounceRef.current) clearTimeout(fetchDebounceRef.current);

    // Use 300ms debounce for better UX (prevents race conditions on fast typing)
    fetchDebounceRef.current = setTimeout(fetchData, 300);

    return () => {
      if (fetchDebounceRef.current) clearTimeout(fetchDebounceRef.current);
    };
  }, [
    fetchData,
    paginationModel.page,
    paginationModel.pageSize,
    filterModel,
    sortModel,
    stableExtraParams,
  ]);

  /* Handlers */
  const handlePaginationModelChange = (model: GridPaginationModel) => {
    if (
      model.page === paginationModel.page &&
      model.pageSize === paginationModel.pageSize
    )
      return;
    setPaginationModel(model);
  };

  const handleSortModelChange = (newModel: GridSortModel) => {
    setPaginationModel((p) => ({ ...p, page: 0 }));

    // Multi-column sorting logic:
    // If user clicks a new column, add it as secondary sort
    // If user clicks an existing sorted column, cycle through: asc -> desc -> remove
    if (newModel.length === 0) {
      // User cleared all sorting
      setSortModel([]);
      return;
    }

    // Get the newly clicked/changed column
    const newSort = newModel[0];

    // Find if this column was already in the sort model
    const existingIndex = sortModel.findIndex((s) => s.field === newSort.field);

    if (existingIndex === -1) {
      // New column: Add to existing sorts (secondary sort)
      setSortModel([...sortModel, newSort]);
    } else {
      // Existing column: Update or remove
      const existingSort = sortModel[existingIndex];

      if (existingSort.sort === "asc" && newSort.sort === "desc") {
        // asc -> desc: Update the sort direction
        const updatedModel = [...sortModel];
        updatedModel[existingIndex] = newSort;
        setSortModel(updatedModel);
      } else if (existingSort.sort === "desc" && newSort.sort === "asc") {
        // desc -> (cycle back to asc or remove): Remove this column from sort
        const updatedModel = sortModel.filter((_, i) => i !== existingIndex);
        setSortModel(updatedModel);
      } else {
        // Update the sort direction
        const updatedModel = [...sortModel];
        updatedModel[existingIndex] = newSort;
        setSortModel(updatedModel);
      }
    }
  };

  const handleFilterModelChange = (model: GridFilterModel) => {
    setFilterModel(model);
    setPaginationModel((p) => ({ ...p, page: 0 }));
  };

  /* ===========================================
     STRICT LAYOUT — no vh/no calc, only flex
     =========================================== */
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
        onSortModelChange={handleSortModelChange}
        filterModel={filterModel}
        onFilterModelChange={handleFilterModelChange}
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
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 2,
                py: 8,
              }}
            >
              <InboxIcon sx={{ fontSize: 64, color: "text.disabled" }} />
              <Typography variant="h6" color="text.secondary">
                No data found
              </Typography>
              <Typography variant="body2" color="text.disabled">
                {filterModel.quickFilterValues?.[0]
                  ? "Try adjusting your search or filters"
                  : "No records to display"}
              </Typography>
            </Box>
          ),
          loadingOverlay: () => (
            <Box sx={{ p: 3, height: "100%", overflow: "hidden" }}>
              {[...Array(8)].map((_, index) => (
                <Skeleton
                  key={index}
                  variant="rectangular"
                  height={42}
                  sx={{ mb: 1, borderRadius: 1 }}
                  animation="wave"
                />
              ))}
            </Box>
          ),
        }}
        slotProps={{
          toolbar: {
            showColumns: toolbarOptions?.showColumns ?? true,
            showFilters: toolbarOptions?.showFilters ?? true,
            showExport: toolbarOptions?.showExport ?? true,
            filterCount: filterModel.items.length,
            kycStatus: toolbarOptions?.kycStatus,
            onKycStatusChange: toolbarOptions?.onKycStatusChange,
            // Export functionality
            exportData,
            isExporting,
            exportError,
            visibleColumns,
            exportParams: {
              ...stableExtraParams,
              search: filterModel.quickFilterValues?.[0],
              ordering: sortModel.length > 0
                ? sortModel
                    .filter((s) => s?.field)
                    .map((s) => (s.sort === "desc" ? `-${s.field}` : s.field))
                    .join(",")
                : undefined,
            },
          } as unknown as any,
        }}
        sx={(theme) => ({
          width: "100%",
          height: "100%",

          // Column header styling - Light gray background with yellow accent
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#f8f9fa",
            borderBottom: `3px solid ${theme.palette.secondary.main}`,
            fontWeight: 600,
            fontSize: "0.875rem",
            color: theme.palette.text.primary,

            // Individual column header cells
            "& .MuiDataGrid-columnHeader": {
              "&:focus, &:focus-within": {
                outline: "none",
              },
            },

            // Column header text
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: 700,
              color: theme.palette.primary.main,
            },
          },

          // Professional zebra striping - subtle blue tint
          "& .MuiDataGrid-row": {
            animation: "fadeIn 150ms ease-in",
            "&:nth-of-type(odd)": {
              backgroundColor: "#ffffff", // White
            },
            "&:nth-of-type(even)": {
              backgroundColor: "#f8fafc", // Very subtle blue-gray tint
            },

            // Hover effect for better interactivity
            "&:hover": {
              backgroundColor: "#e3f2fd !important", // Light blue on hover
              cursor: "pointer",
            },
          },

          // Fade-in animation for smooth row appearance
          "@keyframes fadeIn": {
            from: {
              opacity: 0,
              transform: "translateY(-3px)",
            },
            to: {
              opacity: 1,
              transform: "translateY(0)",
            },
          },

          // Ensure virtualScroller handles all scrolling with smooth transitions
          "& .MuiDataGrid-virtualScroller": {
            overflow: "auto !important",
            transition: "opacity 100ms ease-in-out",
          },

          // Smooth opacity transition for rows when data changes
          "& .MuiDataGrid-virtualScrollerContent": {
            transition: "opacity 100ms ease-in-out",
          },

          // Consistent font weight for ALL cells
          "& .MuiDataGrid-cell": {
            fontWeight: 450,
            lineHeight: 1.5,
            display: "flex",
            alignItems: "center",

            // Ensure custom elements inside cells also inherit font weight
            "& *": {
              fontWeight: "inherit",
            },
          },

          // Generic monospace styling for numeric cells
          // Monospace fonts need higher weight to match Inter visually
          "& .monospace-cell": {
            fontFamily: "'Roboto Mono', 'JetBrains Mono', 'Courier New', monospace",
            fontWeight: 550,
            letterSpacing: "0.01em",
          },

          // Modern pagination footer styling
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: "#f8f9fa",
            borderTop: `2px solid ${theme.palette.primary.main}`,
            padding: "12px 16px",
            minHeight: "56px",
          },

          // Pagination text styling
          "& .MuiTablePagination-displayedRows": {
            fontSize: "0.875rem",
            fontWeight: 500,
            color: theme.palette.text.secondary,
          },

          // Rows per page text
          "& .MuiTablePagination-selectLabel": {
            fontSize: "0.875rem",
            fontWeight: 500,
            color: theme.palette.text.secondary,
          },

          // Page selector dropdown
          "& .MuiTablePagination-select": {
            fontSize: "0.875rem",
            fontWeight: 600,
            color: theme.palette.primary.main,
            borderRadius: "6px",
            padding: "4px 8px",
            "&:hover": {
              backgroundColor: "#e3f2fd",
            },
          },

          // Navigation buttons (arrows) - only in pagination
          "& .MuiDataGrid-footerContainer .MuiIconButton-root": {
            color: theme.palette.primary.main,
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "#e3f2fd",
              transform: "scale(1.1)",
            },
            "&.Mui-disabled": {
              color: theme.palette.action.disabled,
            },
          },

          // Scrollbar styling is now handled globally in theme/components.ts
        })}
      />
    </Box>
  );
}
