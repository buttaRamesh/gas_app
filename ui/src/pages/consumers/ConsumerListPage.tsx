// ConsumerListPage.tsx
import { Box } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import SmartDataGrid from "@/components/datagrid/SmartDataGrid";
import { consumerColumns } from "./consumerColumns";

export default function ConsumerListPage() {
  const [searchParams] = useSearchParams();
  const routeId = searchParams.get("route");

  const extraParams = routeId ? { route: routeId } : undefined;

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
      <SmartDataGrid
        endpoint="/consumers/"
        columns={consumerColumns}
        extraParams={extraParams}
      />
    </Box>
  );
}
