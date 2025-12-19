import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Slide,
  IconButton,
  useTheme,
} from '@mui/material';
import { Delete, Warning, Close } from '@mui/icons-material';
import { forwardRef } from 'react';
import type { TransitionProps } from '@mui/material/transitions';
import axiosInstance from '@/api/axiosInstance';

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ProductDeleteActionProps {
  productId: number;
  productName: string;
  onSuccess?: () => void;
}

const ProductDeleteAction = ({ productId, productName, onSuccess }: ProductDeleteActionProps) => {
  const theme = useTheme();
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
      await axiosInstance.delete(`/inventory/products/${productId}/`);

      setSnackbar({
        open: true,
        message: `Product "${productName}" deleted successfully`,
        severity: 'success',
      });
      setDialogOpen(false);

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to delete product. Please try again.';

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
      <IconButton
        size="small"
        color="error"
        onClick={handleOpenDialog}
        disabled={loading}
        sx={{
          '&:hover': {
            backgroundColor: 'error.light',
          },
        }}
      >
        <Delete fontSize="small" />
      </IconButton>

      <Dialog
        open={dialogOpen}
        onClose={loading ? undefined : handleCloseDialog}
        TransitionComponent={Transition}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: theme.palette.secondary.main,
            color: theme.palette.secondary.contrastText,
            py: 1.5,
            px: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning sx={{ fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight={600}>
              Delete Product
            </Typography>
          </Box>
          <IconButton
            onClick={handleCloseDialog}
            disabled={loading}
            sx={{ color: 'inherit', p: 0.5 }}
            size="small"
          >
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Are you sure you want to delete
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 700,
              color: 'error.main',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            {productName}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2, fontSize: '0.85rem' }}
          >
            This action cannot be undone. All data associated with this product will be
            permanently removed.
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            bgcolor: theme.palette.background.default,
            justifyContent: 'center',
          }}
        >
          <Button
            variant="outlined"
            onClick={handleCloseDialog}
            disabled={loading}
            sx={{
              textTransform: 'none',
              minWidth: 100,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleConfirm}
            disabled={loading}
            sx={{
              textTransform: 'none',
              minWidth: 100,
            }}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Delete'
            )}
          </Button>
        </DialogActions>
      </Dialog>

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

export default ProductDeleteAction;
