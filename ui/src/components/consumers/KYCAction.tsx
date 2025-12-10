import { useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import axiosInstance from '@/api/axiosInstance';
import EnableKYCButton from './EnableKYCButton';
import EnableKYCConfirmationDialog from './EnableKYCConfirmationDialog';

interface KYCActionProps {
  consumerId: number;
  consumerName: string;
  consumerNumber?: string;
  onSuccess?: () => void; // Callback to refresh grid
}

/**
 * Self-contained KYC action component
 * Handles button click → dialog → API call → success/error notification
 */
const KYCAction = ({
  consumerId,
  consumerName,
  consumerNumber,
  onSuccess,
}: KYCActionProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (!loading) {
      setDialogOpen(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await axiosInstance.patch(`/consumers/${consumerId}/enable-kyc/`);

      // Success
      setSnackbar({
        open: true,
        message: `KYC enabled successfully for ${consumerName}`,
        severity: 'success',
      });
      setDialogOpen(false);

      // Delay parent refresh to show snackbar first
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500); // 1.5 second delay to show success message
      }
    } catch (error: any) {
      // Error
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to enable KYC. Please try again.';

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      {/* Enable KYC Button */}
      <EnableKYCButton
        onClick={handleOpenDialog}
        loading={loading}
        disabled={loading}
      />

      {/* Confirmation Dialog */}
      <EnableKYCConfirmationDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirm}
        consumerName={consumerName}
        consumerNumber={consumerNumber}
        loading={loading}
      />

      {/* Success/Error Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default KYCAction;
