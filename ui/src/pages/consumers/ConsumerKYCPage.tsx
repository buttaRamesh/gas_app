// src/pages/consumers/ConsumerKYCPage.tsx
import { useState, useMemo } from 'react';
import { Box } from '@mui/material';
import SmartDataGrid from '@/components/datagrid/SmartDataGrid';
import { getKYCColumns } from './kycColumns';

export default function ConsumerKYCPage() {
  const [kycStatus, setKycStatus] = useState<'pending' | 'done'>('pending');
  const [refreshKey, setRefreshKey] = useState(0);

  // Dynamic endpoint based on KYC status
  const endpoint = useMemo(() => {
    return kycStatus === 'pending'
      ? '/consumers/kyc/'
      : '/consumers/kyc/?kyc=on';
  }, [kycStatus]);

  // Get columns with actions for pending status
  const columns = useMemo(() => {
    return getKYCColumns({
      showActions: kycStatus === 'pending',
      onActionSuccess: () => setRefreshKey((prev) => prev + 1),
    });
  }, [kycStatus]);

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
        columns={columns}
        initialPageSize={20}
        pageSizeOptions={[10, 20, 50]}
        toolbarOptions={{
          showColumns: true,
          showFilters: true,
          showExport: true,
          kycStatus,
          onKycStatusChange: setKycStatus,
        }}
      />
    </Box>
  );
}
