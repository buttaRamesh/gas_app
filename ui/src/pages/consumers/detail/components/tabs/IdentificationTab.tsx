import { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { DetailCard } from '../shared/DetailCard';
import { DetailRow } from '../shared/DetailRow';
import { IdentificationEditDialog } from '../dialogs/IdentificationEditDialog';
import type { Identification } from '../../types';

interface IdentificationTabProps {
  identification: Identification | null;
  consumerId: number;
  onRefresh: () => void;
}

export function IdentificationTab({ identification, consumerId, onRefresh }: IdentificationTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);
  const handleSuccess = () => onRefresh();

  if (!identification) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          No identification information available
        </Typography>
        <Button
          startIcon={<EditIcon />}
          variant="contained"
          onClick={handleOpenDialog}
          sx={{ fontWeight: 600 }}
        >
          Add Identification
        </Button>
        <IdentificationEditDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          onSuccess={handleSuccess}
          consumerId={consumerId}
          identification={null}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '100%' }}>
      <DetailCard>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Identification Documents
          </Typography>
          <Button
            startIcon={<EditIcon />}
            variant="outlined"
            size="small"
            onClick={handleOpenDialog}
            sx={{ fontWeight: 600 }}
          >
            Edit
          </Button>
        </Box>
        <DetailRow label="Ration Card Number" value={identification.ration_card_num} showDivider />
        <DetailRow label="Aadhar Number" value={identification.aadhar_num} showDivider />
        <DetailRow label="PAN Number" value={identification.pan_num} />
      </DetailCard>

      <IdentificationEditDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
        consumerId={consumerId}
        identification={identification}
      />
    </Box>
  );
}
