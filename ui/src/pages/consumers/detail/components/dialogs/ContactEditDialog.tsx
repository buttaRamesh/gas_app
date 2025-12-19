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
  Phone as PhoneIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import axiosInstance from '../../../../../api/axiosInstance';
import type { Contact } from '../../types';

interface ContactEditDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  consumerId: number;
  contacts: Contact[];
}

interface ContactFormData {
  email: string;
  mobile_number: string;
  phone_number: string;
}

export function ContactEditDialog({
  open,
  onClose,
  onSuccess,
  consumerId,
  contacts,
}: ContactEditDialogProps) {
  const theme = useTheme();
  const [contactsList, setContactsList] = useState<ContactFormData[]>([]);
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
      if (contacts.length > 0) {
        setContactsList(
          contacts.map((c) => ({
            email: c.email || '',
            mobile_number: c.mobile_number || '',
            phone_number: c.phone_number || '',
          }))
        );
      } else {
        // Start with one empty contact
        setContactsList([{ email: '', mobile_number: '', phone_number: '' }]);
      }
    }
  }, [open, contacts]);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Filter out completely empty contacts
      const validContacts = contactsList.filter(
        (c) => c.email || c.mobile_number || c.phone_number
      );

      const payload = {
        person: {
          contacts: validContacts,
        },
      };

      await axiosInstance.patch(`/consumers/${consumerId}/`, payload);

      setSnackbar({
        open: true,
        message: 'Contact information updated successfully!',
        severity: 'success',
      });

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (error: any) {
      console.error('Failed to update contacts:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Failed to update contact information',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, field: keyof ContactFormData, value: string) => {
    setContactsList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddContact = () => {
    setContactsList((prev) => [...prev, { email: '', mobile_number: '', phone_number: '' }]);
  };

  const handleRemoveContact = (index: number) => {
    setContactsList((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
            <PhoneIcon sx={{ color: theme.palette.primary.contrastText, fontSize: 18 }} />
          </Box>
          <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '0.95rem' }}>
            Edit Contact Information
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
          {contactsList.map((contact, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                  Contact {index + 1}
                </Typography>
                {contactsList.length > 1 && (
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveContact(index)}
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Email"
                  type="email"
                  value={contact.email}
                  onChange={(e) => handleChange(index, 'email', e.target.value)}
                  fullWidth
                />
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <TextField
                    label="Mobile Number"
                    value={contact.mobile_number}
                    onChange={(e) => handleChange(index, 'mobile_number', e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Phone Number"
                    value={contact.phone_number}
                    onChange={(e) => handleChange(index, 'phone_number', e.target.value)}
                    fullWidth
                  />
                </Box>
              </Box>
            </Box>
          ))}

          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            onClick={handleAddContact}
            sx={{
              borderStyle: 'dashed',
              borderWidth: 2,
              py: 1.5,
              fontWeight: 600,
              color: theme.palette.primary.main,
              borderColor: theme.palette.primary.main,
              '&:hover': {
                borderColor: theme.palette.primary.dark,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              },
            }}
          >
            Add Another Contact
          </Button>
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
          {loading ? 'Saving...' : 'Update Contacts'}
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
