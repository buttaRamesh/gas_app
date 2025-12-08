// src/pages/consumers/ConsumerListPage.tsx

import SmartDataGrid from "@/components/datagrid/SmartDataGrid";
import { consumerColumns } from "./consumerColumns";

export default function ConsumerListPage() {
  return (
    <div style={{ padding: 16 }}>
      <SmartDataGrid
        endpoint="/consumers/"
        columns={consumerColumns}
       
      />
    </div>
  );
}
