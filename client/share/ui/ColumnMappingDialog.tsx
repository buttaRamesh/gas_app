import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  Stack,
  IconButton,
  Alert,
  Divider,
  CircularProgress,
  InputAdornment,
  Paper,
  Chip,
  Card,
  CardContent,
  Fade,
  Tooltip,
  Grid,
} from "@mui/material";
import {
  Close,
  Save,
  Refresh,
  Edit as EditIcon,
  Warning,
  CheckCircle,
  SwapHoriz,
  Description,
} from "@mui/icons-material";
import { useSnackbar } from "@/contexts/SnackbarContext";

interface BackendField {
  field_name: string;
  label: string;
  required: boolean;
  help_text?: string;
}

interface ColumnMappingDialogProps {
  open: boolean;
  onClose: () => void;
  csvFile?: File | null;
  uploadType?: string;
  onSave?: (mappings: Record<string, string>) => void;
}

const ColumnMappingDialog = ({
  open,
  onClose,
  csvFile = null,
  uploadType = "Demo Upload",
  onSave,
}: ColumnMappingDialogProps) => {
  const { showSnackbar } = useSnackbar();

  // Demo data
  const demoBackendFields: BackendField[] = [
    { field_name: "order_id", label: "Order ID", required: true, help_text: "Unique order identifier" },
    { field_name: "customer_name", label: "Customer Name", required: true, help_text: "Full name of customer" },
    { field_name: "email", label: "Email Address", required: true, help_text: "Customer email" },
    { field_name: "phone", label: "Phone Number", required: false, help_text: "Contact number" },
    { field_name: "address", label: "Delivery Address", required: true, help_text: "Full delivery address" },
    { field_name: "product", label: "Product Name", required: true, help_text: "Item description" },
    { field_name: "quantity", label: "Quantity", required: true, help_text: "Number of items" },
    { field_name: "total_amount", label: "Total Amount", required: true, help_text: "Order total" },
  ];

  const demoCsvColumns = [
    "OrderID",
    "CustomerName",
    "EmailAddress",
    "PhoneNumber",
    "ShippingAddress",
    "ProductName",
    "Qty",
    "TotalPrice",
    "OrderDate",
    "Status",
  ];

  // State
  const [backendFields] = useState<BackendField[]>(demoBackendFields);
  const [csvColumns] = useState<string[]>(demoCsvColumns);
  const [mappings, setMappings] = useState<Record<string, string>>({
    order_id: "OrderID",
    customer_name: "CustomerName",
    email: "EmailAddress",
    phone: "PhoneNumber",
    address: "ShippingAddress",
    product: "ProductName",
    quantity: "Qty",
    total_amount: "TotalPrice",
  });
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [loading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showMismatch] = useState(false);

  const handleEditClick = (fieldName: string) => {
    setEditMode(prev => ({ ...prev, [fieldName]: true }));
  };

  const handleMappingChange = (fieldName: string, csvColumn: string) => {
    setMappings(prev => ({ ...prev, [fieldName]: csvColumn }));
  };

  const handleReset = () => {
    setEditMode({});
    showSnackbar("Mappings reset to saved state", "info");
  };

  const handleCancel = () => {
    setEditMode({});
    onClose();
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    showSnackbar("Column mapping saved successfully", "success");
    
    if (onSave) {
      onSave(mappings);
    }
    
    setSaving(false);
    onClose();
  };

  const isFieldEditable = (fieldName: string): boolean => {
    return editMode[fieldName] === true;
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
          background: 'linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)',
        },
      }}
      TransitionComponent={Fade}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 2,
          pt: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <SwapHoriz sx={{ fontSize: 24 }} />
            <Typography variant="h6" fontWeight="700">
              Column Mapping Configuration
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label={uploadType}
              size="small"
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.25)',
                color: 'white',
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
              }}
            />
            {csvColumns.length > 0 && (
              <Chip 
                icon={<Description sx={{ color: 'white !important' }} />}
                label={`${csvColumns.length} columns detected`}
                size="small"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.25)',
                  color: 'white',
                  fontWeight: 600,
                  backdropFilter: 'blur(10px)',
                }}
              />
            )}
          </Box>
        </Box>
        <IconButton 
          onClick={handleCancel} 
          size="small"
          sx={{ 
            color: 'white',
            '&:hover': { 
              bgcolor: 'rgba(255,255,255,0.15)',
              transform: 'rotate(90deg)',
              transition: 'all 0.3s ease'
            }
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 4, py: 4, bgcolor: 'background.default' }}>
        {/* Loading State */}
        {loading && (
          <Box
            sx={{
              display: "flex",
              flexDirection: 'column',
              alignItems: "center",
              justifyContent: "center",
              py: 8,
              gap: 2,
            }}
          >
            <CircularProgress size={48} thickness={4} sx={{ color: '#667eea' }} />
            <Typography variant="h6" fontWeight="600" color="text.secondary">
              Loading field definitions...
            </Typography>
          </Box>
        )}

        {/* Mismatch Alert */}
        {!loading && showMismatch && (
          <Alert 
            severity="warning" 
            icon={<Warning />} 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
              border: '1px solid #ffb74d',
              boxShadow: '0 4px 12px rgba(255, 152, 0, 0.15)',
            }}
          >
            <Typography variant="body1" fontWeight="700" sx={{ mb: 1 }}>
              ⚠️ Column structure has changed
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Missing:</strong> OrderStatus, DeliveryDate
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>New:</strong> Status, OrderDate
            </Typography>
            <Typography variant="caption" sx={{ mt: 1, display: "block", fontStyle: 'italic' }}>
              Please review and update the mappings below.
            </Typography>
          </Alert>
        )}

        {/* Mapping Grid */}
        {!loading && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2,
              borderRadius: 3,
              bgcolor: 'white',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle sx={{ color: '#667eea', fontSize: 20 }} />
              <Typography variant="subtitle1" fontWeight="700">
                Field Mappings
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 3, mb: 1.5 }}>
              <Box sx={{ flex: '0 0 45%' }}>
                <Typography variant="body2" fontWeight="700" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  Backend Field
                </Typography>
              </Box>
              <Box sx={{ flex: '0 0 50%' }}>
                <Typography variant="body2" fontWeight="700" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  CSV/Excel Column
                </Typography>
              </Box>
            </Box>

            <Stack spacing={1}>
              {backendFields.map((field, index) => (
                <Card 
                  key={field.field_name}
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    bgcolor: index % 2 === 0 ? 'background.paper' : 'action.hover',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#667eea',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.1)',
                      transform: 'translateY(-2px)',
                      bgcolor: 'rgba(102, 126, 234, 0.04)',
                    }
                  }}
                >
                  <CardContent sx={{ p: 1.5 }}>
                    <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-end' }}>
                      {/* Left: Backend field label */}
                      <Box sx={{ flex: '0 0 45%' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight="600" sx={{ fontSize: '0.875rem' }}>
                              {field.label}
                            </Typography>
                            {field.required && (
                              <Chip 
                                label="Required" 
                                size="small" 
                                color="error"
                                sx={{ 
                                  height: 16,
                                  fontSize: '0.6rem',
                                  fontWeight: 700,
                                }} 
                              />
                            )}
                          </Box>
                          {field.help_text && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              {field.help_text}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* Right: CSV column (dropdown) */}
                      <Box sx={{ flex: '0 0 50%' }}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          select
                          size="small"
                          value={mappings[field.field_name] || ""}
                          onChange={(e) =>
                            handleMappingChange(field.field_name, e.target.value)
                          }
                          disabled={!isFieldEditable(field.field_name)}
                          placeholder="Select column..."
                          SelectProps={{
                            displayEmpty: true,
                          }}
                          InputProps={{
                            endAdornment: !isFieldEditable(field.field_name) && mappings[field.field_name] && (
                              <InputAdornment position="end">
                                <Tooltip title="Edit mapping" arrow>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditClick(field.field_name)}
                                    edge="end"
                                    sx={{
                                      color: '#667eea',
                                      '&:hover': {
                                        bgcolor: 'rgba(102, 126, 234, 0.1)',
                                      }
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              fontSize: '0.875rem',
                              bgcolor: isFieldEditable(field.field_name) ? 'background.paper' : 'action.hover',
                              transition: 'all 0.2s',
                              '& fieldset': {
                                borderColor: '#e0e0e0',
                              },
                              '&:hover fieldset': {
                                borderColor: '#667eea',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#667eea',
                                borderWidth: '2px',
                              },
                            },
                            '& .MuiSelect-select': {
                              py: 1,
                            },
                          }}
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {csvColumns.map((col) => (
                            <MenuItem key={col} value={col}>
                              {col}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Paper>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 4, py: 3, bgcolor: '#f8f9fa' }}>
        <Button 
          onClick={handleCancel} 
          disabled={saving}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'rgba(0,0,0,0.05)',
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleReset}
          startIcon={<Refresh />}
          disabled={saving || loading}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            color: '#667eea',
            '&:hover': {
              bgcolor: 'rgba(102, 126, 234, 0.08)',
            }
          }}
        >
          Reset
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />}
          disabled={saving || loading || csvColumns.length === 0}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            px: 4,
            py: 1.2,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #6a3f91 100%)',
              boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
              transform: 'translateY(-1px)',
            },
            '&:disabled': {
              background: '#e0e0e0',
              boxShadow: 'none',
            },
            transition: 'all 0.3s ease',
          }}
        >
          {saving ? "Saving..." : "Save Mapping"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ColumnMappingDialog;
