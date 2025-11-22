import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Card,
  CardContent,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Close,
  Payment,
  Save,
  Description,
  CalendarToday,
  CurrencyRupee,
} from '@mui/icons-material';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { deliveryPersonsApi, paymentOptionsApi } from '../../services/api';

interface DeliveryPerson {
  id: number;
  name: string;
  mobile_number?: string;
  assigned_routes_count?: number;
  total_consumers?: number;
}

interface PaymentOption {
  id: number;
  name: string;
}

interface PaymentData {
  delivery_person: number;
  delivery_date: string;
  payment_option: string;
  cash_memo_no: string;
  payment_date: string;
  amount: string;
  payment_status: string;
  transaction_id: string;
  notes: string;
}

interface OrderDetails {
  id: number;
  order_no: string;
  consumer_name: string;
  book_date: string;
  consumer_number: string;
  mobile_number: string;
  product: string;
  delivery_person?: number;  // Order's delivery person ID
  consumer_assigned_delivery_person?: number;  // Consumer's assigned delivery person ID (via route)
}

interface MarkDeliveredDialogProps {
  open: boolean;
  order: OrderDetails | null;
  onClose: () => void;
  onConfirm: (orderId: number, paymentData: PaymentData) => Promise<void>;
}

const PAYMENT_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'REFUNDED', label: 'Refunded' },
];

const MarkDeliveredDialog = ({
  open,
  order,
  onClose,
  onConfirm,
}: MarkDeliveredDialogProps) => {
  const { showSnackbar } = useSnackbar();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<PaymentData>({
    delivery_person: 0,
    delivery_date: new Date().toISOString().split('T')[0],
    payment_option: '',
    cash_memo_no: '',
    payment_date: new Date().toISOString().split('T')[0],
    amount: '',
    payment_status: 'COMPLETED',
    transaction_id: '',
    notes: '',
  });

  // Fetch delivery persons and payment options
  useEffect(() => {
    if (open) {
      fetchDeliveryPersons();
      fetchPaymentOptions();
    }
  }, [open]);

  const fetchDeliveryPersons = async () => {
    try {
      setLoading(true);
      const response = await deliveryPersonsApi.getAll();
      const data = response.data;
      const persons = Array.isArray(data) ? data : data.results || [];
      setDeliveryPersons(persons);
    } catch (error) {
      showSnackbar('Failed to fetch delivery persons', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentOptions = async () => {
    try {
      const response = await paymentOptionsApi.getAll();
      const data = response.data;
      const options = Array.isArray(data) ? data : data.results || [];
      setPaymentOptions(options);
    } catch (error) {
      showSnackbar('Failed to fetch payment options', 'error');
      console.error(error);
    }
  };

  // Reset form when dialog opens
  useEffect(() => {
    if (open && order) {
      setFormData({
        delivery_person: order.consumer_assigned_delivery_person || 0,  // Set default from consumer's assigned delivery person (via route)
        delivery_date: new Date().toISOString().split('T')[0],
        payment_option: '',
        cash_memo_no: '',
        payment_date: new Date().toISOString().split('T')[0],
        amount: '',
        payment_status: 'COMPLETED',
        transaction_id: '',
        notes: '',
      });
      setErrors({});
    }
  }, [open, order]);

  const handleChange = (field: keyof PaymentData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.delivery_person || formData.delivery_person === 0) {
      newErrors.delivery_person = 'Delivery person is required';
    }
    if (!formData.delivery_date) {
      newErrors.delivery_date = 'Delivery date is required';
    } else if (order) {
      const bookDate = new Date(order.book_date);
      bookDate.setHours(0, 0, 0, 0);
      const selectedDate = new Date(formData.delivery_date);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < bookDate) {
        newErrors.delivery_date = 'Delivery date cannot be before booking date';
      }

      if (selectedDate > new Date()) {
        newErrors.delivery_date = 'Delivery date cannot be in the future';
      }
    }
    if (!formData.payment_option) {
      newErrors.payment_option = 'Payment option is required';
    }
    if (!formData.payment_date) {
      newErrors.payment_date = 'Payment date is required';
    }
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!order || !validate()) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await onConfirm(order.id, formData);
      onClose();
    } catch (error) {
      console.error('Error saving delivery info:', error);
      // Error is handled in parent component
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  if (!order) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: {
          maxWidth: '640px',
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f0fff4 100%)',
        },
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          py: 0.8,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Payment sx={{ fontSize: 22 }} />
        <Box sx={{ flex: 1, lineHeight: 1.2 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0 }}>
            Delivery Info
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', lineHeight: 1.2 }}>
            Record delivery and payment details
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={submitting}
          sx={{
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 ,mt:2 }}>
        {/* Order Number Card */}
        <Card
          elevation={0}
          sx={{
            mb: 3,
            border: '2px solid',
            borderColor: 'success.main',
            borderRadius: 2,
            bgcolor: 'success.50',
          }}
        >
          <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Description sx={{ color: 'success.main', fontSize: 24 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Order Number
                </Typography>
                <Typography variant="h6" fontWeight={700} color="success.main">
                  {order.order_no}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Form Fields */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Delivery Person */}
          <TextField
            fullWidth
            select
            label="Delivery Person"
            required
            value={formData.delivery_person}
            onChange={(e) => handleChange('delivery_person', Number(e.target.value))}
            error={!!errors.delivery_person}
            helperText={errors.delivery_person}
            variant="outlined"
            disabled={loading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          >
            {loading ? (
              <MenuItem disabled>Loading...</MenuItem>
            ) : deliveryPersons.length === 0 ? (
              <MenuItem disabled>No delivery persons available</MenuItem>
            ) : (
              deliveryPersons.map((person) => (
                <MenuItem key={person.id} value={person.id}>
                  {person.name}
                </MenuItem>
              ))
            )}
          </TextField>

          {/* Delivery Date */}
          <TextField
            fullWidth
            type="date"
            label="Delivery Date"
            required
            value={formData.delivery_date}
            onChange={(e) => handleChange('delivery_date', e.target.value)}
            error={!!errors.delivery_date}
            helperText={errors.delivery_date}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            inputProps={{
              max: new Date().toISOString().split('T')[0],
              min: order.book_date,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarToday sx={{ color: 'action.active' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          {/* Two column row: Payment Option + Payment Date */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              select
              label="Payment Option"
              required
              value={formData.payment_option}
              onChange={(e) => handleChange('payment_option', e.target.value)}
              error={!!errors.payment_option}
              helperText={errors.payment_option}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Payment sx={{ color: 'action.active' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            >
              {paymentOptions.map((option) => (
                <MenuItem key={option.id} value={option.name}>
                  {option.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              type="date"
              label="Payment Date"
              required
              value={formData.payment_date}
              onChange={(e) => handleChange('payment_date', e.target.value)}
              error={!!errors.payment_date}
              helperText={errors.payment_date}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday sx={{ color: 'action.active' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Box>

          {/* Two column row: Cash Memo + Amount */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Cash Memo Number"
              value={formData.cash_memo_no}
              onChange={(e) => handleChange('cash_memo_no', e.target.value)}
              variant="outlined"
              placeholder="Enter cash memo number"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Description sx={{ color: 'action.active' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              fullWidth
              type="number"
              label="Amount"
              required
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              error={!!errors.amount}
              helperText={errors.amount}
              variant="outlined"
              placeholder="0.00"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CurrencyRupee sx={{ color: 'action.active' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Box>

          <TextField
            fullWidth
            select
            label="Payment Status"
            required
            value={formData.payment_status}
            onChange={(e) => handleChange('payment_status', e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          >
            {PAYMENT_STATUSES.map((status) => (
              <MenuItem key={status.value} value={status.value}>
                {status.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Transaction ID (Optional)"
            value={formData.transaction_id}
            onChange={(e) => handleChange('transaction_id', e.target.value)}
            variant="outlined"
            placeholder="For online payments"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes (Optional)"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            variant="outlined"
            placeholder="Add any additional notes here..."
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={submitting}
          variant="outlined"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          variant="contained"
          startIcon={submitting ? <CircularProgress size={20} /> : <Save />}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 2,
            px: 3,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            },
          }}
        >
          {submitting ? 'Marking...' : 'Mark Delivered'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MarkDeliveredDialog;
