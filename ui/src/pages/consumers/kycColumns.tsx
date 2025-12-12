// src/pages/consumers/kycColumns.tsx
import type { GridColDef } from "@mui/x-data-grid";
import { Chip } from "@mui/material";
import KYCAction from "@/components/consumers/KYCAction";

export type AppGridColDef = GridColDef & {
  visibleByDefault?: boolean;
};

export interface KYCColumnsOptions {
  showActions?: boolean;
  onActionSuccess?: () => void;
}

export const kycColumns: AppGridColDef[] = [
  {
    field: "id",
    headerName: "ID",
    width: 80,
    visibleByDefault: false,
  },
  {
    field: "consumer_number",
    headerName: "Consumer No",
    width: 100,
    sortable: true,
    filterable: true,
    visibleByDefault: true,
  },
  {
    field: "name",
    headerName: "Name",
    flex: 1.5,
    minWidth: 180,
    sortable: true,
    filterable: true,
    visibleByDefault: true,
  },
  {
    field: "mobile_number",
    headerName: "Mobile No",
    width: 120,
    sortable: true,
    filterable: true,
    visibleByDefault: true,
    valueGetter: (params: any) => params ?? "",
  },
  {
    field: "address",
    headerName: "Address",
    flex: 2,
    minWidth: 400,
    sortable: false,
    visibleByDefault: true,
    renderCell: (params: any) => (
      <span title={params.value ?? ""}>{params.value}</span>
    ),
  },
  {
    field: "category",
    headerName: "Category",
    flex: 0.8,
    width: 100,
    sortable: true,
    filterable: true,
    visibleByDefault: false,
  },
  {
    field: "consumer_type",
    headerName: "Type",
    width: 100,
    sortable: true,
    filterable: true,
    visibleByDefault: false,
  },
  {
    field: "is_kyc_done",
    headerName: "KYC Status",
    width: 100,
    sortable: true,
    filterable: true,
    visibleByDefault: false,
    renderCell: (params: any) =>
      params.value ? (
        <Chip label="Done" color="success" size="small" />
      ) : (
        <Chip label="Pending" color="error" size="small" />
      ),
  },
];

/**
 * Get KYC columns with optional actions column
 *
 * @param options - Configuration options
 * @returns Column definitions with optional actions column
 */
export function getKYCColumns(options?: KYCColumnsOptions): AppGridColDef[] {
  const { showActions = false, onActionSuccess } = options || {};

  if (!showActions) {
    return kycColumns;
  }

  // Add actions column for pending KYC status
  const actionsColumn: AppGridColDef = {
    field: 'actions',
    headerName: 'Actions',
    width: 150,
    sortable: false,
    filterable: false,
    hideable: false,
    visibleByDefault: true,
    renderCell: (params: any) => (
      <KYCAction
        consumerId={params.row.id}
        consumerName={params.row.name}
        consumerNumber={params.row.consumer_number}
        onSuccess={onActionSuccess}
      />
    ),
  };

  return [...kycColumns, actionsColumn];
}
