// src/pages/consumers/ConsumerKYCPage.tsx
import { Box } from "@mui/material";
import SmartDataGrid from "@/components/datagrid/SmartDataGrid";
import { kycColumns } from "./kycColumns";

export default function ConsumerKYCPage() {
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
        endpoint="/consumers/kyc/"
        columns={kycColumns}
        initialPageSize={20}
        pageSizeOptions={[10, 20, 50]}
      />
    </Box>
  );
}
