import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  IconButton,
  Typography,
  useTheme,
  alpha,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Badge as BadgeIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import axiosInstance from '../../../../../api/axiosInstance';
import type { Identification } from '../../types';

interface IdentificationEditDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  consumerId: number;
  identification: Identification | null;
}

interface IdentificationFormData {
  ration_card_num: string;
  aadhar_num: string;
  pan_num: string;
}

export function IdentificationEditDialog({
  open,
  onClose,
  onSuccess,
  consumerId,
  identification,
}: IdentificationEditDialogProps) {
  const theme = useTheme();
  const [formData, setFormData] = useState<IdentificationFormData>({
    ration_card_num: '',
    aadhar_num: '',
    pan_num: '',
  });
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

  useEffect(() => {
    if (open) {
      setFormData({
        ration_card_num: identification?.ration_card_num || '',
        aadhar_num: identification?.aadhar_num || '',
        pan_num: identification?.pan_num || '',
      });
    }
  }, [open, identification]);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const payload = {
        person: {
          identification: formData,
        },
      };

      await axiosInstance.patch(`/consumers/${consumerId}/`, payload);

      setSnackbar({
        open: true,
        message: 'Identification updated successfully!',
        severity: 'success',
      });

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (error: any) {
      console.error('Failed to update identification:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Failed to update identification information',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof IdentificationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: theme.palette.background.default,
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
          color: theme.palette.secondary.contrastText,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 1,
          px: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              bgcolor: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BadgeIcon sx={{ color: theme.palette.primary.contrastText, fontSize: 18 }} />
          </Box>
          <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '0.95rem' }}>
            Edit Identification
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: theme.palette.secondary.contrastText,
            '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.15) },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3 }}>
          <TextField
            label="Ration Card Number"
            value={formData.ration_card_num}
            onChange={(e) => handleChange('ration_card_num', e.target.value)}
            fullWidth
          />
          <TextField
            label="Aadhar Number"
            value={formData.aadhar_num}
            onChange={(e) => handleChange('aadhar_num', e.target.value)}
            fullWidth
            inputProps={{ maxLength: 12 }}
          />
          <TextField
            label="PAN Number"
            value={formData.pan_num}
            onChange={(e) => handleChange('pan_num', e.target.value.toUpperCase())}
            fullWidth
            inputProps={{ maxLength: 10 }}
          />
        </Box>
      </DialogContent>

      {/* Footer */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          bgcolor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
          gap: 1.5,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={loading}
          sx={{
            borderRadius: 2,
            px: 3,
            borderColor: theme.palette.divider,
            color: theme.palette.text.secondary,
            '&:hover': {
              borderColor: theme.palette.text.secondary,
              bgcolor: 'transparent',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="secondary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <EditIcon />}
          onClick={handleSubmit}
          sx={{
            borderRadius: 2,
            px: 3,
            bgcolor: theme.palette.secondary.main,
            color: theme.palette.secondary.contrastText,
            boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.3)}`,
            '&:hover': {
              bgcolor: theme.palette.secondary.dark,
              boxShadow: `0 6px 16px ${alpha(theme.palette.secondary.main, 0.4)}`,
            },
            '&.Mui-disabled': {
              bgcolor: alpha(theme.palette.secondary.main, 0.3),
              color: alpha(theme.palette.secondary.contrastText, 0.5),
            },
          }}
        >
          {loading ? 'Saving...' : 'Update Identification'}
        </Button>
      </DialogActions>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
