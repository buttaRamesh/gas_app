// src/pages/consumers/consumerColumns.tsx
import type { GridColDef } from "@mui/x-data-grid";
import { Chip } from "@mui/material";

export type AppGridColDef = GridColDef & {
  visibleByDefault?: boolean;
};

export const consumerColumns: AppGridColDef[] = [
  {
    field: "id",
    headerName: "ID",
    width: 90,
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
    width: 220,
    sortable: true,
    visibleByDefault: true,
  },
  {
    field: "mobile_number",
    headerName: "Mobile No",
    width: 150,
    sortable: true,
    visibleByDefault: true,
    valueGetter: (params: any) => params ?? "",
  },
  {
    field: "ration_card_num",
    headerName: "Ration Card",
    width: 150,
    sortable: true,
    visibleByDefault: false,
  },
  {
    field: "street_road_name",
    headerName: "Street Area",
    width: 200,
    sortable: true,
    visibleByDefault: true,
  },
  
  {
    field: "phone_number",
    headerName: "Phone No",
    width: 150,
    sortable: true,
    visibleByDefault: false,
    valueGetter: (params: any) => params.value ?? "",
  },
  {
    field: "email",
    headerName: "Email",
    width: 200,
    sortable: true,
    visibleByDefault: false,
    valueGetter: (params: any) => params.value ?? "",
  },
  {
    field: "consumer_type",
    headerName: "Type",
    width: 130,
    sortable: true,
    visibleByDefault: true,
    valueFormatter: (params: any) => {
      const map: Record<string, string> = {
        D: "Domestic",
        C: "Commercial",
      };
      return map[params.value] ?? params.value;
    },
  },
  {
    field: "category",
    headerName: "Category",
    width: 130,
    sortable: true,
    visibleByDefault: false,
  },
  {
    field: "pin_code",
    headerName: "Pin Code",
    width: 110,
    sortable: true,
    visibleByDefault: false,
  },
  {
    field: "address_text",
    headerName: "Address",
    minWidth: 250,
    flex: 1,
    sortable: false,
    visibleByDefault: false,
    renderCell: (params: any) => (
      <span title={params.value ?? ""}>{params.value}</span>
    ),
  },
  {
    field: "is_kyc_done",
    headerName: "KYC Status",
    width: 140,
    sortable: true,
    visibleByDefault: true,
    renderCell: (params: any) =>
      params.value ? (
        <Chip label="Done" color="success" size="small" />
      ) : (
        <Chip label="Pending" color="error" size="small" />
      ),
  },
  {
    field: "blue_book",
    headerName: "Blue Book",
    width: 140,
    sortable: true,
    visibleByDefault: false,
  },
  {
    field: "cylinders",
    headerName: "Cylinders",
    width: 140,
    sortable: true,
    visibleByDefault: true,
  }
];
