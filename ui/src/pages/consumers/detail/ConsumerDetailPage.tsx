import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, CircularProgress, Alert, Paper } from '@mui/material';
import { ConsumerHeader } from './components/ConsumerHeader';
import { ConsumerTabs } from './components/ConsumerTabs';
import { PersonalTab } from './components/tabs/PersonalTab';
import { AddressTab } from './components/tabs/AddressTab';
import { ContactTab } from './components/tabs/ContactTab';
import { IdentificationTab } from './components/tabs/IdentificationTab';
import { AdditionalTab } from './components/tabs/AdditionalTab';
import { ConnectionsTab } from './components/tabs/ConnectionsTab';
import { RouteTab } from './components/tabs/RouteTab';
import { useConsumerDetail } from './hooks/useConsumerDetail';
import type { TabValue } from './types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: TabValue;
  value: TabValue;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ConsumerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { consumer, routeInfo, loading, error, refetch } = useConsumerDetail(id);
  const [tabValue, setTabValue] = useState<TabValue>(0);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress size={60} sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  if (error || !consumer) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" onClose={refetch}>
          {error || 'Consumer not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'grey.50',
        pb: 4,
      }}
    >
      <Container maxWidth="lg" sx={{ pt: 3 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* Header */}
          <ConsumerHeader
            consumerName={consumer.person?.full_name || 'N/A'}
            consumerNumber={consumer.consumer_number}
            isKycDone={consumer.is_kyc_done}
          />

          {/* Tabs Navigation */}
          <ConsumerTabs value={tabValue} onChange={setTabValue} />

          {/* Tab Content */}
          <Box sx={{ bgcolor: 'white', px: 3, height: 500, overflowY: 'auto' }}>
            <TabPanel value={tabValue} index={0}>
              <PersonalTab person={consumer.person} consumerId={consumer.id} onRefresh={refetch} />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <AddressTab addresses={consumer.person?.addresses || []} consumerId={consumer.id} onRefresh={refetch} />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <ContactTab contacts={consumer.person?.contacts || []} consumerId={consumer.id} onRefresh={refetch} />
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <IdentificationTab identification={consumer.person?.identification || null} consumerId={consumer.id} onRefresh={refetch} />
            </TabPanel>

            <TabPanel value={tabValue} index={4}>
              <AdditionalTab consumer={consumer} onRefresh={refetch} />
            </TabPanel>

            <TabPanel value={tabValue} index={5}>
              <ConnectionsTab
                connections={consumer.connections || []}
                consumerId={consumer.id}
                onRefresh={refetch}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={6}>
              <RouteTab routeInfo={routeInfo} consumerId={consumer.id} onRefresh={refetch} />
            </TabPanel>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
