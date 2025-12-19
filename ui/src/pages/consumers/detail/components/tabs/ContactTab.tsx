import { useState } from 'react';
import { Box, Typography, Grid, Button } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { DetailCard } from '../shared/DetailCard';
import { DetailRow } from '../shared/DetailRow';
import { ContactEditDialog } from '../dialogs/ContactEditDialog';
import type { Contact } from '../../types';

interface ContactTabProps {
  contacts: Contact[];
  consumerId: number;
  onRefresh: () => void;
}

export function ContactTab({ contacts, consumerId, onRefresh }: ContactTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);
  const handleSuccess = () => onRefresh();

  if (!contacts || contacts.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          No contact information available
        </Typography>
        <Button
          startIcon={<EditIcon />}
          variant="contained"
          onClick={handleOpenDialog}
          sx={{ fontWeight: 600 }}
        >
          Add Contact
        </Button>
        <ContactEditDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          onSuccess={handleSuccess}
          consumerId={consumerId}
          contacts={[]}
        />
      </Box>
    );
  }

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
          Edit Contacts
        </Button>
      </Box>

      <Grid container spacing={3}>
        {contacts.map((contact, index) => (
          <Grid item xs={12} key={contact.id || index}>
            <DetailCard>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
                Contact {contacts.length > 1 ? `#${index + 1}` : 'Information'}
              </Typography>
              <DetailRow label="Email" value={contact.email} showDivider />
              <DetailRow label="Mobile Number" value={contact.mobile_number} showDivider />
              <DetailRow label="Phone Number" value={contact.phone_number} />
            </DetailCard>
          </Grid>
        ))}
      </Grid>

      <ContactEditDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
        consumerId={consumerId}
        contacts={contacts}
      />
    </Box>
  );
}
