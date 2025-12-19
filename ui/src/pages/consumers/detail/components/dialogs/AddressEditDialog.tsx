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
  Home as HomeIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import axiosInstance from '../../../../../api/axiosInstance';
import type { Address } from '../../types';

interface AddressEditDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  consumerId: number;
  addresses: Address[];
}

interface AddressFormData {
  house_no: string;
  house_name_flat_number: string;
  housing_complex_building: string;
  street_road_name: string;
  land_mark: string;
  city_town_village: string;
  district: string;
  pin_code: string;
  address_text: string;
}

export function AddressEditDialog({
  open,
  onClose,
  onSuccess,
  consumerId,
  addresses,
}: AddressEditDialogProps) {
  const theme = useTheme();
  const [addressesList, setAddressesList] = useState<AddressFormData[]>([]);
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
      if (addresses.length > 0) {
        setAddressesList(
          addresses.map((a) => ({
            house_no: a.house_no || '',
            house_name_flat_number: a.house_name_flat_number || '',
            housing_complex_building: a.housing_complex_building || '',
            street_road_name: a.street_road_name || '',
            land_mark: a.land_mark || '',
            city_town_village: a.city_town_village || '',
            district: a.district || '',
            pin_code: a.pin_code || '',
            address_text: a.address_text || '',
          }))
        );
      } else {
        // Start with one empty address
        setAddressesList([
          {
            house_no: '',
            house_name_flat_number: '',
            housing_complex_building: '',
            street_road_name: '',
            land_mark: '',
            city_town_village: '',
            district: '',
            pin_code: '',
            address_text: '',
          },
        ]);
      }
    }
  }, [open, addresses]);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Filter out completely empty addresses
      const validAddresses = addressesList.filter((a) =>
        Object.values(a).some((val) => val.trim() !== '')
      );

      const payload = {
        person: {
          addresses: validAddresses,
        },
      };

      await axiosInstance.patch(`/consumers/${consumerId}/`, payload);

      setSnackbar({
        open: true,
        message: 'Address information updated successfully!',
        severity: 'success',
      });

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (error: any) {
      console.error('Failed to update addresses:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Failed to update address information',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, field: keyof AddressFormData, value: string) => {
    setAddressesList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddAddress = () => {
    setAddressesList((prev) => [
      ...prev,
      {
        house_no: '',
        house_name_flat_number: '',
        housing_complex_building: '',
        street_road_name: '',
        land_mark: '',
        city_town_village: '',
        district: '',
        pin_code: '',
        address_text: '',
      },
    ]);
  };

  const handleRemoveAddress = (index: number) => {
    setAddressesList((prev) => prev.filter((_, i) => i !== index));
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
            <HomeIcon sx={{ color: theme.palette.primary.contrastText, fontSize: 18 }} />
          </Box>
          <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '0.95rem' }}>
            Edit Address Information
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3, maxHeight: '60vh', overflowY: 'auto' }}>
          {addressesList.map((address, index) => (
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
                  Address {index + 1}
                </Typography>
                {addressesList.length > 1 && (
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveAddress(index)}
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <TextField
                    label="House No."
                    value={address.house_no}
                    onChange={(e) => handleChange(index, 'house_no', e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="House Name / Flat Number"
                    value={address.house_name_flat_number}
                    onChange={(e) => handleChange(index, 'house_name_flat_number', e.target.value)}
                    fullWidth
                  />
                </Box>

                <TextField
                  label="Housing Complex / Building"
                  value={address.housing_complex_building}
                  onChange={(e) => handleChange(index, 'housing_complex_building', e.target.value)}
                  fullWidth
                />

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <TextField
                    label="Street / Road Name"
                    value={address.street_road_name}
                    onChange={(e) => handleChange(index, 'street_road_name', e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Landmark"
                    value={address.land_mark}
                    onChange={(e) => handleChange(index, 'land_mark', e.target.value)}
                    fullWidth
                  />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                  <TextField
                    label="City / Town / Village"
                    value={address.city_town_village}
                    onChange={(e) => handleChange(index, 'city_town_village', e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="District"
                    value={address.district}
                    onChange={(e) => handleChange(index, 'district', e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="PIN Code"
                    value={address.pin_code}
                    onChange={(e) => handleChange(index, 'pin_code', e.target.value)}
                    fullWidth
                    inputProps={{ maxLength: 6 }}
                  />
                </Box>

                <TextField
                  label="Full Address"
                  value={address.address_text}
                  onChange={(e) => handleChange(index, 'address_text', e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Complete formatted address"
                />
              </Box>
            </Box>
          ))}

          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            onClick={handleAddAddress}
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
            Add Another Address
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
          {loading ? 'Saving...' : 'Update Addresses'}
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
