import type { GridColDef } from "@mui/x-data-grid";
import { Chip, Box, IconButton, Tooltip } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

export type AppGridColDef = GridColDef & {
  visibleByDefault?: boolean;
};

export interface UnitColumnsOptions {
  showActions?: boolean;
  onEdit?: (unit: any) => void;
  onDelete?: (unit: any) => void;
}

export const unitColumns: AppGridColDef[] = [
  {
    field: "id",
    headerName: "ID",
    width: 80,
    visibleByDefault: false,
  },
  {
    field: "short_name",
    headerName: "Short Name",
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
 * Get unit columns with optional actions column
 *
 * @param options - Configuration options
 * @returns Column definitions with optional actions column
 */
export function getUnitColumns(options?: UnitColumnsOptions): AppGridColDef[] {
  const { showActions = false, onEdit, onDelete } = options || {};

  if (!showActions) {
    return unitColumns;
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
          <Tooltip title="Edit Unit">
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
          <Tooltip title="Delete Unit">
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

  return [...unitColumns, actionsColumn];
}
