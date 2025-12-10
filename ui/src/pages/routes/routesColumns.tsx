// src/pages/consumers/consumerColumns.tsx
import type { GridColDef } from "@mui/x-data-grid";

export type AppGridColDef = GridColDef & {
  visibleByDefault?: boolean;
};
 
export const routesColumns: AppGridColDef[] = [
  {
    field: "id",
    headerName: "ID",
    width: 80,
    visibleByDefault: true,
  },
  {
    field: "area_code",
    headerName: "Area Code",
    width: 150,  // Fixed - predictable format
    sortable: true,
    visibleByDefault: true,
    cellClassName: "monospace-cell",
  },
  {
    field: "area_code_description",
    headerName: "Area Name",
    flex: 1.5,  // Flex - variable length names
    minWidth: 180,
    sortable: true,
    visibleByDefault: true,
  },
  {
    field: "area_count",
    headerName: "Areas Count",
    width: 140,  // Fixed - always 10 digits
    sortable: true,
    visibleByDefault: true,
    valueGetter: (params: any) => params ?? "",
    cellClassName: "monospace-cell",
  },
  {
    field: "delivery_person_name",
    headerName: "Delivery Person",
    width: 150,  // Fixed - standard format
    sortable: false,
    visibleByDefault: true,
  },
  {
    field: "consumer_count",
    headerName: "Consumers",
    flex: 1.2,  // Flex - variable length street names
    minWidth: 150,
    sortable: true,
    visibleByDefault: true,
    cellClassName: "monospace-cell",
  },

 
];
