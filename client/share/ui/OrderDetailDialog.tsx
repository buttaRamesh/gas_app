import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  IconButton, 
  Box, 
  Typography, 
  Divider,
  Card,
  CardContent,
  Chip,
  Stack
} from '@mui/material';
import { 
  Close, 
  ShoppingCart, 
  Person, 
  CalendarToday, 
  LocalShipping,
  Payment,
  Flag,
  Description
} from '@mui/icons-material';

interface OrderDetail {
  id: number;
  order_no: string;
  book_date: string;
  product: string;
  consumer_name: string;
  consumer_number: string;
  mobile_number: string;
  refill_type: string;
  delivery_flag: string;
  delivery_date?: string;
  delivery_person?: string;
  payment_info?: {
    payment_option: string;
    cash_memo_no: string;
    payment_date: string;
    amount: number;
    payment_status: string;
    transaction_id?: string;
    notes?: string;
  };
}

interface OrderDetailDialogProps {
  open: boolean;
  order: OrderDetail | null;
  onClose: () => void;
}

const OrderDetailDialog = ({ open, order, onClose }: OrderDetailDialogProps) => {
  if (!order) return null;

  const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, py: 1.5 }}>
      <Box sx={{ 
        color: 'primary.main', 
        display: 'flex', 
        alignItems: 'center',
        minWidth: 24
      }}>
        {icon}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {label}
        </Typography>
        <Typography variant="body1" fontWeight={500}>
          {value || '—'}
        </Typography>
      </Box>
    </Box>
  );

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return 'success';
      case 'PENDING': return 'warning';
      case 'FAILED': return 'error';
      case 'REFUNDED': return 'info';
      default: return 'default';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
          maxWidth: '640px'
        }
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 0.8,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <ShoppingCart sx={{ fontSize: 22 }} />
        <Box sx={{ flex: 1, lineHeight: 1.2 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0 }}>
            Order Details
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', lineHeight: 1.2 }}>
            Complete information for order #{order.order_no}
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose}
          sx={{ 
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Order Information */}
        <Card 
          elevation={0}
          sx={{ 
            mb: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Box sx={{ 
            bgcolor: 'primary.main', 
            color: 'white', 
            px: 2, 
            py: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Description sx={{ fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight={700}>
              Order Information
            </Typography>
          </Box>
          <CardContent>
            <InfoRow 
              icon={<ShoppingCart />} 
              label="Order Number" 
              value={order.order_no} 
            />
            <Divider />
            <InfoRow 
              icon={<CalendarToday />} 
              label="Book Date" 
              value={order.book_date} 
            />
            <Divider />
            <InfoRow 
              icon={<Description />} 
              label="Product" 
              value={order.product} 
            />
            <Divider />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
              <Box sx={{ color: 'primary.main', minWidth: 24 }}>
                <Flag />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Refill Type / Delivery Flag
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                  <Chip 
                    label={order.refill_type} 
                    size="small"
                    color="primary"
                    sx={{ fontWeight: 600 }}
                  />
                  <Chip 
                    label={order.delivery_flag} 
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                </Stack>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Consumer Information */}
        <Card 
          elevation={0}
          sx={{ 
            mb: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Box sx={{ 
            bgcolor: 'secondary.main', 
            color: 'white', 
            px: 2, 
            py: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Person sx={{ fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight={700}>
              Consumer Information
            </Typography>
          </Box>
          <CardContent>
            <InfoRow 
              icon={<Person />} 
              label="Consumer Name" 
              value={order.consumer_name} 
            />
            <Divider />
            <InfoRow 
              icon={<Description />} 
              label="Consumer Number" 
              value={order.consumer_number} 
            />
            <Divider />
            <InfoRow 
              icon={<Description />} 
              label="Mobile Number" 
              value={order.mobile_number} 
            />
          </CardContent>
        </Card>

        {/* Delivery Information */}
        <Card 
          elevation={0}
          sx={{ 
            mb: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Box sx={{ 
            bgcolor: 'success.main', 
            color: 'white', 
            px: 2, 
            py: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <LocalShipping sx={{ fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight={700}>
              Delivery Information
            </Typography>
          </Box>
          <CardContent>
            <InfoRow 
              icon={<CalendarToday />} 
              label="Delivery Date" 
              value={order.delivery_date || 'Not delivered'} 
            />
            <Divider />
            <InfoRow 
              icon={<Person />} 
              label="Delivery Person" 
              value={order.delivery_person || 'Not assigned'} 
            />
          </CardContent>
        </Card>

        {/* Payment Information */}
        {order.payment_info && (
          <Card 
            elevation={0}
            sx={{ 
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <Box sx={{ 
              bgcolor: 'info.main', 
              color: 'white', 
              px: 2, 
              py: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Payment sx={{ fontSize: 20 }} />
              <Typography variant="subtitle1" fontWeight={700}>
                Payment Information
              </Typography>
            </Box>
            <CardContent>
              <InfoRow 
                icon={<Payment />} 
                label="Payment Option" 
                value={order.payment_info.payment_option} 
              />
              <Divider />
              <InfoRow 
                icon={<Description />} 
                label="Cash Memo No" 
                value={order.payment_info.cash_memo_no} 
              />
              <Divider />
              <InfoRow 
                icon={<CalendarToday />} 
                label="Payment Date" 
                value={order.payment_info.payment_date} 
              />
              <Divider />
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, py: 1.5 }}>
                <Box sx={{ color: 'primary.main', minWidth: 24 }}>
                  <Payment />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Amount / Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Typography variant="h6" fontWeight={700} color="success.main">
                      ₹{order.payment_info.amount}
                    </Typography>
                    <Chip 
                      label={order.payment_info.payment_status}
                      size="small"
                      color={getStatusColor(order.payment_info.payment_status)}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </Box>
              </Box>
              {order.payment_info.transaction_id && (
                <>
                  <Divider />
                  <InfoRow 
                    icon={<Description />} 
                    label="Transaction ID" 
                    value={order.payment_info.transaction_id} 
                  />
                </>
              )}
              {order.payment_info.notes && (
                <>
                  <Divider />
                  <InfoRow 
                    icon={<Description />} 
                    label="Notes" 
                    value={order.payment_info.notes} 
                  />
                </>
              )}
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailDialog;
