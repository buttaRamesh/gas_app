import { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { DetailCard } from '../shared/DetailCard';
import { DetailRow } from '../shared/DetailRow';
import { PersonalEditDialog } from '../dialogs/PersonalEditDialog';
import type { Person } from '../../types';

interface PersonalTabProps {
  person: Person | null;
  consumerId: number;
  onRefresh: () => void;
}

export function PersonalTab({ person, consumerId, onRefresh }: PersonalTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!person) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No personal information available</Typography>
      </Box>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not provided';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);
  const handleSuccess = () => onRefresh();

  return (
    <Box sx={{ maxWidth: '100%' }}>
      <DetailCard>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Personal Information
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
        <DetailRow label="First Name" value={person.first_name} showDivider />
        <DetailRow label="Last Name" value={person.last_name} showDivider />
        <DetailRow label="Full Name" value={person.full_name} showDivider />
        <DetailRow label="Date of Birth" value={formatDate(person.dob)} />
      </DetailCard>

      <PersonalEditDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
        consumerId={consumerId}
        personInfo={{
          first_name: person.first_name,
          last_name: person.last_name,
          full_name: person.full_name,
          date_of_birth: person.dob,
        }}
      />
    </Box>
  );
}
