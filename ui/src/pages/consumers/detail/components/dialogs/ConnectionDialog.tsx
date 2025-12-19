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
  Cable as ConnectionIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import axiosInstance from '../../../../../api/axiosInstance';
import type { Connection } from '../../types';

interface ConnectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  consumerId: number;
  connection?: Connection | null;
}

interface ConnectionFormData {
  sv_number: string;
  sv_date: string;
  connection_type: number | '';
  product: number | '';
  product_size: string;
  num_of_regulators: number;
  hist_code_description: string;
}

interface Lookup {
  id: number;
  name: string;
  product_code?: string | null;
}

export function ConnectionDialog({ open, onClose, onSuccess, consumerId, connection }: ConnectionDialogProps) {
  const theme = useTheme();
  const [formData, setFormData] = useState<ConnectionFormData>({
    sv_number: '',
    sv_date: '',
    connection_type: '',
    product: '',
    product_size: '',
    num_of_regulators: 1,
    hist_code_description: '',
  });
  const [connectionTypes, setConnectionTypes] = useState<Lookup[]>([]);
  const [products, setProducts] = useState<Lookup[]>([]);
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

  // Load connection data for edit mode
  useEffect(() => {
    if (connection && open) {
      setFormData({
        sv_number: connection.sv_number || '',
        sv_date: connection.sv_date || '',
        connection_type: connection.connection_type || '',
        product: connection.product || '',
        product_size: connection.product_size || '',
        num_of_regulators: connection.num_of_regulators || 1,
        hist_code_description: connection.hist_code_description || '',
      });
    } else if (open) {
      // Reset form for new connection
      setFormData({
        sv_number: '',
        sv_date: '',
        connection_type: '',
        product: '',
        product_size: '',
        num_of_regulators: 1,
        hist_code_description: '',
      });
    }
  }, [connection, open]);

  const fetchLookups = async () => {
    try {
      setLoadingLookups(true);
      const [typesRes, productsRes] = await Promise.all([
        axiosInstance.get('/lookups/connection-types/'),
        axiosInstance.get('/inventory/products/'),
      ]);
      setConnectionTypes(typesRes.data.results || typesRes.data);
      setProducts(productsRes.data.results || productsRes.data);
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
        ...formData,
        consumer: consumerId,
      };

      if (connection) {
        // Update existing connection
        await axiosInstance.put(`/connections/${connection.id}/`, payload);
      } else {
        // Create new connection
        await axiosInstance.post('/connections/', payload);
      }

      setSnackbar({
        open: true,
        message: connection ? 'Connection updated successfully!' : 'Connection added successfully!',
        severity: 'success',
      });

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (error: any) {
      console.error('Failed to save connection:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Failed to save connection',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ConnectionFormData, value: any) => {
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
            <ConnectionIcon sx={{ color: theme.palette.primary.contrastText, fontSize: 18 }} />
          </Box>
          <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '0.95rem' }}>
            {connection ? 'Edit Connection' : 'Add Connection'}
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
            {/* Row 1 */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Service Number"
                value={formData.sv_number}
                onChange={(e) => handleChange('sv_number', e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Service Date"
                type="date"
                value={formData.sv_date}
                onChange={(e) => handleChange('sv_date', e.target.value)}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            {/* Row 2 */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl fullWidth required>
                <InputLabel>Connection Type</InputLabel>
                <Select
                  value={formData.connection_type}
                  label="Connection Type"
                  onChange={(e) => handleChange('connection_type', Number(e.target.value))}
                >
                  <MenuItem value="">
                    <em>Select Connection Type</em>
                  </MenuItem>
                  {connectionTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Product</InputLabel>
                <Select
                  value={formData.product}
                  label="Product"
                  onChange={(e) => handleChange('product', Number(e.target.value))}
                >
                  <MenuItem value="">
                    <em>Select Product</em>
                  </MenuItem>
                  {products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.product_code ? `${product.product_code} - ${product.name}` : product.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Row 3 */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Product Size"
                value={formData.product_size}
                onChange={(e) => handleChange('product_size', e.target.value)}
                fullWidth
              />
              <TextField
                label="Number of Regulators"
                type="number"
                value={formData.num_of_regulators}
                onChange={(e) => handleChange('num_of_regulators', parseInt(e.target.value) || 1)}
                fullWidth
                inputProps={{ min: 1 }}
              />
            </Box>

            {/* Row 4 */}
            <TextField
              label="History/Description"
              value={formData.hist_code_description}
              onChange={(e) => handleChange('hist_code_description', e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
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
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : connection ? <EditIcon /> : <AddIcon />}
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
          {loading ? 'Saving...' : connection ? 'Update Connection' : 'Add Connection'}
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
