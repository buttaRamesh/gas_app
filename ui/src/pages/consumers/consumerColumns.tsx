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
    width: 80,
    visibleByDefault: false,
  },
  {
    field: "consumer_number",
    headerName: "Consumer No",
    width: 150,  // Fixed - predictable format
    sortable: true,
    visibleByDefault: true,
    cellClassName: "monospace-cell",
  },
  {
    field: "name",
    headerName: "Name",
    flex: 1.5,  // Flex - variable length names
    minWidth: 180,
    sortable: true,
    visibleByDefault: true,
  },
  {
    field: "mobile_number",
    headerName: "Mobile No",
    width: 140,  // Fixed - always 10 digits
    sortable: true,
    visibleByDefault: true,
    valueGetter: (params: any) => params ?? "",
    cellClassName: "monospace-cell",
  },
  {
    field: "ration_card_num",
    headerName: "Ration Card",
    width: 150,  // Fixed - standard format
    sortable: false,
    visibleByDefault: true,
    cellClassName: "monospace-cell",
  },
  {
    field: "street_road_name",
    headerName: "Street Area",
    flex: 1.2,  // Flex - variable length street names
    minWidth: 150,
    sortable: true,
    visibleByDefault: true,
  },

  {
    field: "phone_number",
    headerName: "Phone No",
    width: 140,  // Fixed - standard phone format
    sortable: true,
    visibleByDefault: false,
    valueGetter: (params: any) => params.value ?? "",
    cellClassName: "monospace-cell",
  },
  {
    field: "email",
    headerName: "Email",
    flex: 1.3,  // Flex - variable length emails
    minWidth: 180,
    sortable: true,
    visibleByDefault: false,
    valueGetter: (params: any) => params.value ?? "",
  },
  {
    field: "consumer_type",
    headerName: "Type",
    width: 130,  // Fixed - "Domestic" or "Commercial"
    sortable: true,
    visibleByDefault: true,
  },
  {
    field: "category",
    headerName: "Category",
    flex: 0.8,  // Flex - variable category names
    minWidth: 110,
    sortable: true,
    visibleByDefault: false,
  },
  {
    field: "pin_code",
    headerName: "Pin Code",
    width: 110,  // Fixed - 6 digit pin code
    sortable: true,
    visibleByDefault: false,
    cellClassName: "monospace-cell",
  },
  {
    field: "address_text",
    headerName: "Address",
    flex: 2,  // Flex - variable length addresses
    minWidth: 250,
    sortable: false,
    visibleByDefault: false,
    renderCell: (params: any) => (
      <span title={params.value ?? ""}>{params.value}</span>
    ),
  },
  {
    field: "is_kyc_done",
    headerName: "KYC Status",
    width: 130,  // Fixed - chip size is consistent
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
    width: 130,  // Fixed - standard number format
    sortable: true,
    visibleByDefault: false,
  },
  {
    field: "cylinders",
    headerName: "Cylinders",
    width: 110,  // Fixed - small numbers
    sortable: true,
    visibleByDefault: true,
    cellClassName: "monospace-cell",
  }
];
