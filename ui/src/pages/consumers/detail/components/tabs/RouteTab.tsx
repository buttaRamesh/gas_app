import { useState } from 'react';
import { Box, Typography, Alert, AlertTitle, Button } from '@mui/material';
import { Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import { DetailCard } from '../shared/DetailCard';
import { DetailRow } from '../shared/DetailRow';
import { RouteAssignmentDialog } from '../dialogs/RouteAssignmentDialog';
import type { RouteInfo } from '../../types';

interface RouteTabProps {
  routeInfo: RouteInfo | null;
  consumerId: number;
  onRefresh: () => void;
}

export function RouteTab({ routeInfo, consumerId, onRefresh }: RouteTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSuccess = () => {
    onRefresh();
  };

  if (!routeInfo) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>No Route Assigned</AlertTitle>
          This consumer has not been assigned to any route yet.
        </Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={handleOpenDialog}
            sx={{ fontWeight: 600 }}
          >
            Assign Route
          </Button>
        </Box>
        <RouteAssignmentDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          onSuccess={handleSuccess}
          consumerId={consumerId}
          currentRoute={null}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
        Route Assignment
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '2fr 1.5fr 1.5fr auto',
          gap: 3,
          alignItems: 'center',
          p: 3,
          borderRadius: 3,
          border: '1px solid rgba(102, 126, 234, 0.15)',
          bgcolor: 'white',
          boxShadow: '0 2px 12px rgba(102, 126, 234, 0.08)',
        }}
      >
        {/* Area Code & Description */}
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
            Route
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {routeInfo.area_code}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {routeInfo.area_code_description}
          </Typography>
        </Box>

        {/* Delivery Person */}
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
            Delivery Person
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {routeInfo.delivery_person_name || 'Not assigned'}
          </Typography>
        </Box>

        {/* DP Mobile */}
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
            DP Mobile
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {routeInfo.delivery_person_mobile || 'N/A'}
          </Typography>
        </Box>

        {/* Change Route Button */}
        <Button
          startIcon={<EditIcon />}
          variant="outlined"
          onClick={handleOpenDialog}
          sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
        >
          Change Route
        </Button>
      </Box>

      <RouteAssignmentDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
        consumerId={consumerId}
        currentRoute={routeInfo}
      />
    </Box>
  );
}
