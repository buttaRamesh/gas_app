// src/pages/consumers/ConsumerKYCPage.tsx
import { useState } from 'react';
import { Box } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import SmartDataGrid from '@/components/datagrid/SmartDataGrid';
import { routeAreaColumns } from './RouteAreaColumns';

export default function RouteArea() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchParams] = useSearchParams();
  const routeId = searchParams.get('route');

  // Dynamic endpoint based on KYC status
  const endpoint = 'route-areas/';

  const extraParams = routeId ? { route: routeId } : undefined;

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <SmartDataGrid
        key={refreshKey}
        endpoint={endpoint}
        columns={routeAreaColumns}
        extraParams={extraParams}
        initialPageSize={20}
        pageSizeOptions={[10, 20, 50]}
        toolbarOptions={{
          showColumns: true,
          showFilters: true,
          showExport: true,
        }}
      />
    </Box>
  );
}
