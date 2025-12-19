import type { GridColDef } from "@mui/x-data-grid";
import { Chip, Box, IconButton, Tooltip } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

export type AppGridColDef = GridColDef & {
  visibleByDefault?: boolean;
};

export interface CategoryColumnsOptions {
  showActions?: boolean;
  onEdit?: (category: any) => void;
  onDelete?: (category: any) => void;
}

export const categoryColumns: AppGridColDef[] = [
  {
    field: "id",
    headerName: "ID",
    width: 80,
    visibleByDefault: false,
  },
  {
    field: "name",
    headerName: "Name",
    width: 150,
    sortable: true,
    visibleByDefault: true,
    cellClassName: "monospace-cell",
  },
  {
    field: "description",
    headerName: "Description",
    width: 200,
    sortable: true,
    visibleByDefault: true,
    cellClassName: "monospace-cell",
  },
  {
    field: "is_active",
    headerName: "Status",
    width: 200,
    sortable: true,
    visibleByDefault: true,
    renderCell: (params: any) =>
      params.value ? (
        <Chip label="Active" color="success" size="small" />
      ) : (
        <Chip label="InActive" color="error" size="small" />
      ),
  }
];

/**
 * Get category columns with optional actions column
 *
 * @param options - Configuration options
 * @returns Column definitions with optional actions column
 */
export function getCategoryColumns(options?: CategoryColumnsOptions): AppGridColDef[] {
  const { showActions = false, onEdit, onDelete } = options || {};

  if (!showActions) {
    return categoryColumns;
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
          <Tooltip title="Edit Category">
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
          <Tooltip title="Delete Category">
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

  return [...categoryColumns, actionsColumn];
}
