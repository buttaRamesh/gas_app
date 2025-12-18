// src/pages/consumers/kycColumns.tsx
import type { GridColDef } from "@mui/x-data-grid";
import { Chip } from "@mui/material";
// import KYCAction from "@/components/consumers/KYCAction";

export type AppGridColDef = GridColDef & {
  visibleByDefault?: boolean;
};

export interface KYCColumnsOptions {
  showActions?: boolean;
  onActionSuccess?: () => void;
}

export const routeAreaColumns: AppGridColDef[] = [
  {
    field: "id",
    headerName: "ID",
    width: 80,
    visibleByDefault: false,
  },
  {
    field: "area_name",
    headerName: "Area",
    width: 350,
    sortable: true,
    filterable: true,
    visibleByDefault: true,
  },
  {
    field: "route_code",
    headerName: "Route",
    // flex: 1.5,
    minWidth: 180,
    sortable: true,
    filterable: true,
    visibleByDefault: true,
  },
 
 
];

/**
 * Get KYC columns with optional actions column
 *
 * @param options - Configuration options
 * @returns Column definitions with optional actions column
 */
// export function getKYCColumns(options?: KYCColumnsOptions): AppGridColDef[] {
//   const { showActions = false, onActionSuccess } = options || {};

//   if (!showActions) {
//     return kycColumns;
//   }

//   // Add actions column for pending KYC status
//   const actionsColumn: AppGridColDef = {
//     field: 'actions',
//     headerName: 'Actions',
//     width: 150,
//     sortable: false,
//     filterable: false,
//     hideable: false,
//     visibleByDefault: true,
//     renderCell: (params: any) => (
//       <KYCAction
//         consumerId={params.row.id}
//         consumerName={params.row.name}
//         consumerNumber={params.row.consumer_number}
//         onSuccess={onActionSuccess}
//       />
//     ),
//   };

//   return [...kycColumns, actionsColumn];
// }
