import { useState } from 'react';
import { Box, Typography, Grid, Button } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { DetailCard } from '../shared/DetailCard';
import { DetailRow } from '../shared/DetailRow';
import { AddressEditDialog } from '../dialogs/AddressEditDialog';
import type { Address } from '../../types';

interface AddressTabProps {
  addresses: Address[];
  consumerId: number;
  onRefresh: () => void;
}

export function AddressTab({ addresses, consumerId, onRefresh }: AddressTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);
  const handleSuccess = () => onRefresh();

  if (!addresses || addresses.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          No address information available
        </Typography>
        <Button
          startIcon={<EditIcon />}
          variant="contained"
          onClick={handleOpenDialog}
          sx={{ fontWeight: 600 }}
        >
          Add Address
        </Button>
        <AddressEditDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          onSuccess={handleSuccess}
          consumerId={consumerId}
          addresses={[]}
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
          Edit Addresses
        </Button>
      </Box>

      <Grid container spacing={3}>
        {addresses.map((address, index) => (
          <Grid item xs={12} key={address.id || index}>
            <DetailCard>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
                Address {addresses.length > 1 ? `#${index + 1}` : ''}
              </Typography>
              <DetailRow label="House No" value={address.house_no} showDivider />
              <DetailRow label="House Name/Flat Number" value={address.house_name_flat_number} showDivider />
              <DetailRow label="Housing Complex/Building" value={address.housing_complex_building} showDivider />
              <DetailRow label="Street/Road Name" value={address.street_road_name} showDivider />
              <DetailRow label="Landmark" value={address.land_mark} showDivider />
              <DetailRow label="City/Town/Village" value={address.city_town_village} showDivider />
              <DetailRow label="District" value={address.district} showDivider />
              <DetailRow label="PIN Code" value={address.pin_code} showDivider />
              <DetailRow label="Full Address" value={address.address_text} />
            </DetailCard>
          </Grid>
        ))}
      </Grid>

      <AddressEditDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
        consumerId={consumerId}
        addresses={addresses}
      />
    </Box>
  );
}
