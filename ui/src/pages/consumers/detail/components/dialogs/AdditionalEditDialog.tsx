import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Info as InfoIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import axiosInstance from '../../../../../api/axiosInstance';
import type { ConsumerDetail } from '../../types';

interface AdditionalEditDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  consumerId: number;
  consumer: ConsumerDetail;
}

interface AdditionalFormData {
  blue_book: number | '';
  lpg_id: number | '';
  opting_status: string;
  status: string;
  category: number | '';
  consumer_type: number | '';
  dct_type: number | '';
}

interface Lookup {
  id: number;
  name: string;
}

export function AdditionalEditDialog({
  open,
  onClose,
  onSuccess,
  consumerId,
  consumer,
}: AdditionalEditDialogProps) {
  const theme = useTheme();
  const [formData, setFormData] = useState<AdditionalFormData>({
    blue_book: '',
    lpg_id: '',
    opting_status: '',
    status: '',
    category: '',
    consumer_type: '',
    dct_type: '',
  });
  const [categories, setCategories] = useState<Lookup[]>([]);
  const [consumerTypes, setConsumerTypes] = useState<Lookup[]>([]);
  const [dctTypes, setDctTypes] = useState<Lookup[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Load lookups
  useEffect(() => {
    if (open) {
      fetchLookups();
    }
  }, [open]);

  // Load consumer data
  useEffect(() => {
    if (open && consumer) {
      setFormData({
        blue_book: consumer.blue_book || '',
        lpg_id: consumer.lpg_id || '',
        opting_status: consumer.opting_status || '',
        status: consumer.status || '',
        category: '', // Will be set after lookups load
        consumer_type: '', // Will be set after lookups load
        dct_type: '', // Will be set after lookups load
      });
    }
  }, [open, consumer]);

  const fetchLookups = async () => {
    try {
      setLoadingLookups(true);
      const [categoriesRes, consumerTypesRes, dctTypesRes] = await Promise.all([
        axiosInstance.get('/lookups/consumer-categories/'),
        axiosInstance.get('/lookups/consumer-types/'),
        axiosInstance.get('/lookups/dct-types/'),
      ]);
      const categoriesData = categoriesRes.data.results || categoriesRes.data;
      const consumerTypesData = consumerTypesRes.data.results || consumerTypesRes.data;
      const dctTypesData = dctTypesRes.data.results || dctTypesRes.data;

      setCategories(categoriesData);
      setConsumerTypes(consumerTypesData);
      setDctTypes(dctTypesData);

      // Set form data with matched IDs
      if (consumer) {
        const categoryId = categoriesData.find((c: Lookup) => c.name === consumer.category)?.id || '';
        const consumerTypeId = consumerTypesData.find((c: Lookup) => c.name === consumer.consumer_type)?.id || '';
        const dctTypeId = dctTypesData.find((d: Lookup) => d.name === consumer.dct_type)?.id || '';

        setFormData((prev) => ({
          ...prev,
          category: categoryId,
          consumer_type: consumerTypeId,
          dct_type: dctTypeId,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch lookups:', error);
    } finally {
      setLoadingLookups(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const payload = {
        blue_book: formData.blue_book || null,
        lpg_id: formData.lpg_id || null,
        opting_status: formData.opting_status,
        status: formData.status,
        category: formData.category || null,
        consumer_type: formData.consumer_type || null,
        dct_type: formData.dct_type || null,
      };

      await axiosInstance.patch(`/consumers/${consumerId}/`, payload);

      setSnackbar({
        open: true,
        message: 'Consumer details updated successfully!',
        severity: 'success',
      });

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (error: any) {
      console.error('Failed to update consumer details:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Failed to update consumer details',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof AdditionalFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
            <InfoIcon sx={{ color: theme.palette.primary.contrastText, fontSize: 18 }} />
          </Box>
          <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '0.95rem' }}>
            Edit Consumer Details
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
        {loadingLookups ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3 }}>
            {/* Consumer Details Section */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 2 }}>
                Consumer Details
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <TextField
                    label="Blue Book"
                    type="number"
                    value={formData.blue_book}
                    onChange={(e) => handleChange('blue_book', Number(e.target.value) || '')}
                    fullWidth
                  />
                  <TextField
                    label="LPG ID"
                    type="number"
                    value={formData.lpg_id}
                    onChange={(e) => handleChange('lpg_id', Number(e.target.value) || '')}
                    fullWidth
                  />
                </Box>
                <FormControl fullWidth>
                  <InputLabel>Opting Status</InputLabel>
                  <Select
                    value={formData.opting_status}
                    label="Opting Status"
                    onChange={(e) => handleChange('opting_status', e.target.value)}
                  >
                    <MenuItem value="OPT_IN">Opt In</MenuItem>
                    <MenuItem value="OPT_OUT">Opt Out</MenuItem>
                    <MenuItem value="PENDING">Pending</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Classification Section */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 2 }}>
                Classification
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => handleChange('status', e.target.value)}
                  >
                    <MenuItem value="NEW">New</MenuItem>
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="INACTIVE">Inactive</MenuItem>
                    <MenuItem value="SUSPENDED">Suspended</MenuItem>
                    <MenuItem value="DELETED">Deleted</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={formData.category}
                      label="Category"
                      onChange={(e) => handleChange('category', Number(e.target.value))}
                    >
                      <MenuItem value="">
                        <em>Select Category</em>
                      </MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Consumer Type</InputLabel>
                    <Select
                      value={formData.consumer_type}
                      label="Consumer Type"
                      onChange={(e) => handleChange('consumer_type', Number(e.target.value))}
                    >
                      <MenuItem value="">
                        <em>Select Consumer Type</em>
                      </MenuItem>
                      {consumerTypes.map((type) => (
                        <MenuItem key={type.id} value={type.id}>
                          {type.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <FormControl fullWidth>
                  <InputLabel>DCT Type</InputLabel>
                  <Select
                    value={formData.dct_type}
                    label="DCT Type"
                    onChange={(e) => handleChange('dct_type', Number(e.target.value))}
                  >
                    <MenuItem value="">
                      <em>Select DCT Type</em>
                    </MenuItem>
                    {dctTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>
        )}
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
          disabled={loading || loadingLookups}
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
          {loading ? 'Saving...' : 'Update Details'}
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
