// src/pages/consumers/kycColumns.tsx
import type { GridColDef } from "@mui/x-data-grid";
import { Chip } from "@mui/material";

export type AppGridColDef = GridColDef & {
  visibleByDefault?: boolean;
};

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
    width: 150,
    sortable: true,
    visibleByDefault: true,
  },
  {
    field: "name",
    headerName: "Name",
    flex: 1.5,
    minWidth: 180,
    sortable: true,
    visibleByDefault: true,
  },
  {
    field: "mobile_number",
    headerName: "Mobile No",
    width: 140,
    sortable: true,
    visibleByDefault: true,
    valueGetter: (params: any) => params ?? "",
  },
  {
    field: "address",
    headerName: "Address",
    flex: 2,
    minWidth: 250,
    sortable: false,
    visibleByDefault: false,
    renderCell: (params: any) => (
      <span title={params.value ?? ""}>{params.value}</span>
    ),
  },
  {
    field: "category",
    headerName: "Category",
    flex: 0.8,
    minWidth: 110,
    sortable: true,
    visibleByDefault: false,
  },
  {
    field: "consumer_type",
    headerName: "Type",
    width: 130,
    sortable: true,
    visibleByDefault: false,
    valueFormatter: (params: any) => {
      if (!params?.value) return "";
      const map: Record<string, string> = {
        D: "Domestic",
        C: "Commercial",
      };
      return map[params.value] ?? params.value;
    },
  },
  {
    field: "is_kyc_done",
    headerName: "KYC Status",
    width: 130,
    sortable: true,
    visibleByDefault: false,
    renderCell: (params: any) =>
      params.value ? (
        <Chip label="Done" color="success" size="small" />
      ) : (
        <Chip label="Pending" color="error" size="small" />
      ),
  },
];
