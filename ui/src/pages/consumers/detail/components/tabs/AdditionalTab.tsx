import { useState } from 'react';
import { Box, Typography, Grid, Button } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { DetailCard } from '../shared/DetailCard';
import { DetailRow } from '../shared/DetailRow';
import { AdditionalEditDialog } from '../dialogs/AdditionalEditDialog';
import type { ConsumerDetail } from '../../types';

interface AdditionalTabProps {
  consumer: ConsumerDetail;
  onRefresh: () => void;
}

export function AdditionalTab({ consumer, onRefresh }: AdditionalTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);
  const handleSuccess = () => onRefresh();

  return (
    <Box sx={{ maxWidth: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          startIcon={<EditIcon />}
          variant="outlined"
          size="small"
          onClick={handleOpenDialog}
          sx={{ fontWeight: 600 }}
        >
          Edit Details
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <DetailCard>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
              Consumer Details
            </Typography>
            <DetailRow label="Blue Book" value={consumer.blue_book?.toString()} showDivider />
            <DetailRow label="LPG ID" value={consumer.lpg_id?.toString() || 'Not assigned'} showDivider />
            <DetailRow label="Opting Status" value={consumer.opting_status} />
          </DetailCard>
        </Grid>

        <Grid item xs={12}>
          <DetailCard>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
              Classification
            </Typography>
            <DetailRow label="Status" value={consumer.status} showDivider />
            <DetailRow label="Category" value={consumer.category} showDivider />
            <DetailRow label="Consumer Type" value={consumer.consumer_type} showDivider />
            <DetailRow label="DCT Type" value={consumer.dct_type} />
          </DetailCard>
        </Grid>
      </Grid>

      <AdditionalEditDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
        consumerId={consumer.id}
        consumer={consumer}
      />
    </Box>
  );
}
