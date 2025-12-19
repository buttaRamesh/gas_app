import type { GridColDef } from "@mui/x-data-grid";
import { Box, Chip, IconButton, Tooltip } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

export type AppGridColDef = GridColDef & {
  visibleByDefault?: boolean;
};

export interface ProductColumnsOptions {
  showActions?: boolean;
  onEdit?: (product: any) => void;
  onDelete?: (product: any) => void;
}

export const productColumns: AppGridColDef[] = [
  {
    field: "id",
    headerName: "ID",
    width: 80,
    visibleByDefault: false,
  },
  {
    field: "name",
    headerName: "Product Name",
    width: 300,
    sortable: true,
    visibleByDefault: true,
    renderCell: (params: any) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {params.row.product_code && (
          <Chip
            label={params.row.product_code}
            size="small"
            color="primary"
            sx={{ fontSize: '0.75rem', height: '20px' }}
          />
        )}
        <span>{params.value}</span>
      </Box>
    ),
  },
  {
    field: "category__name",
    headerName: "Category",
    minWidth: 180,
    sortable: true,
    visibleByDefault: true,
    valueGetter: (_value: any, row: any) => row?.category?.name ?? "",
  },
  {
    field: "unit__short_name",
    headerName: "Unit",
    width: 140,
    sortable: true,
    visibleByDefault: true,
    valueGetter: (_value: any, row: any) => row?.unit?.short_name ?? "",
    cellClassName: "monospace-cell",
  },
];

/**
 * Get product columns with optional actions column
 *
 * @param options - Configuration options
 * @returns Column definitions with optional actions column
 */
export function getProductColumns(options?: ProductColumnsOptions): AppGridColDef[] {
  const { showActions = false, onEdit, onDelete } = options || {};

  if (!showActions) {
    return productColumns;
  }

  // Add actions column for edit and delete
  const actionsColumn: AppGridColDef = {
    field: 'actions',
    headerName: 'Actions',
    width: 120,
    sortable: false,
    filterable: false,
    hideable: false,
    visibleByDefault: true,
    renderCell: (params: any) => (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {onEdit && (
          <Tooltip title="Edit Product">
            <IconButton
              size="small"
              color="primary"
              onClick={() => onEdit(params.row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {onDelete && (
          <Tooltip title="Delete Product">
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(params.row)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    ),
  };

  return [...productColumns, actionsColumn];
}
