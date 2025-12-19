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
  Person as PersonIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import axiosInstance from '../../../../../api/axiosInstance';
import type { PersonInfo } from '../../types';

interface PersonalEditDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  consumerId: number;
  personInfo: PersonInfo;
}

interface PersonFormData {
  first_name: string;
  last_name: string;
  dob: string;
}

export function PersonalEditDialog({
  open,
  onClose,
  onSuccess,
  consumerId,
  personInfo,
}: PersonalEditDialogProps) {
  const theme = useTheme();
  const [formData, setFormData] = useState<PersonFormData>({
    first_name: '',
    last_name: '',
    dob: '',
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
    if (open && personInfo) {
      setFormData({
        first_name: personInfo.first_name || '',
        last_name: personInfo.last_name || '',
        dob: personInfo.date_of_birth || '',
      });
    }
  }, [open, personInfo]);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const payload = {
        person: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          dob: formData.dob || null,
        },
      };

      await axiosInstance.patch(`/consumers/${consumerId}/`, payload);

      setSnackbar({
        open: true,
        message: 'Personal information updated successfully!',
        severity: 'success',
      });

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (error: any) {
      console.error('Failed to update personal info:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Failed to update personal information',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof PersonFormData, value: string) => {
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
            <PersonIcon sx={{ color: theme.palette.primary.contrastText, fontSize: 18 }} />
          </Box>
          <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '0.95rem' }}>
            Edit Personal Information
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
          {/* Row 1 */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="First Name"
              value={formData.first_name}
              onChange={(e) => handleChange('first_name', e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Last Name"
              value={formData.last_name}
              onChange={(e) => handleChange('last_name', e.target.value)}
              fullWidth
              required
            />
          </Box>

          {/* Row 2 */}
          <TextField
            label="Date of Birth"
            type="date"
            value={formData.dob}
            onChange={(e) => handleChange('dob', e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
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
          {loading ? 'Saving...' : 'Update Personal Info'}
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
