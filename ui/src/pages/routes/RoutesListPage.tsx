// ConsumerListPage.tsx
import { Box } from "@mui/material";
import SmartDataGrid from "@/components/datagrid/SmartDataGrid";
import { routesColumns } from "./routesColumns";

export default function RoutesListPage() {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <SmartDataGrid endpoint="/routes/" columns={routesColumns} />
    </Box>
  );
}
