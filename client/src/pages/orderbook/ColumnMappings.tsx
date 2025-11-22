import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
} from "@mui/material";
import {
  ArrowBack,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  CloudUpload,
  Save as SaveIcon,
} from "@mui/icons-material";
import { columnMappingApi, orderBookApi } from "../../services/api";
import { useSnackbar } from "../../contexts/SnackbarContext";

interface ColumnMapping {
  id: number;
  name: string;
  upload_type: string;
  upload_type_display: string;
  description: string;
  mappings: Record<string, string>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const REQUIRED_FIELDS = {
  'consumer_number': { label: 'Consumer Number', required: true },
  'order_no': { label: 'Order Number', required: true },
  'book_date': { label: 'Book Date', required: true },
  'product': { label: 'Product', required: false },
  'refill_type': { label: 'Refill Type', required: false },
  'delivery_flag': { label: 'Delivery Flag', required: false },
  'delivery_date': { label: 'Delivery Date', required: false },
  'cash_memo_no': { label: 'Cash Memo Number', required: false },
  'payment_option': { label: 'Payment Option', required: false },
};

const ColumnMappings = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    mapping: ColumnMapping | null;
  }>({ open: false, mapping: null });
  const [editedMappings, setEditedMappings] = useState<Record<string, string>>({});
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    fetchMappings();
  }, []);

  const fetchMappings = async () => {
    try {
      setLoading(true);
      const response = await columnMappingApi.getAll();
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      // Filter out mappings without upload_type (legacy)
      const validMappings = data.filter((m: ColumnMapping) => m.upload_type);
      setMappings(validMappings);
    } catch (error) {
      showSnackbar("Failed to fetch column mappings", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (mapping: ColumnMapping) => {
    setEditDialog({ open: true, mapping });
    setEditedMappings(mapping.mappings);
    setDetectedColumns([]);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      showSnackbar("Please upload a CSV or Excel file", "error");
      return;
    }

    try {
      setUploadingFile(true);
      const response = await orderBookApi.detectHeaders(file);
      const headers = response.data.headers || [];
      setDetectedColumns(headers);
      showSnackbar(`Detected ${headers.length} columns from file`, "success");
    } catch (error) {
      showSnackbar("Failed to detect columns from file", "error");
      console.error(error);
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    if (!editDialog.mapping) return;

    // Validate required fields
    const requiredFields = Object.entries(REQUIRED_FIELDS)
      .filter(([_, config]) => config.required)
      .map(([field]) => field);

    const missingFields = requiredFields.filter(field => !editedMappings[field]);
    if (missingFields.length > 0) {
      showSnackbar(
        `Please map required fields: ${missingFields.map(f => REQUIRED_FIELDS[f as keyof typeof REQUIRED_FIELDS].label).join(', ')}`,
        "error"
      );
      return;
    }

    try {
      await columnMappingApi.update(editDialog.mapping.id, {
        mappings: editedMappings,
      });
      showSnackbar("Mapping saved successfully", "success");
      setEditDialog({ open: false, mapping: null });
      setDetectedColumns([]);
      fetchMappings();
    } catch (error) {
      showSnackbar("Failed to save mapping", "error");
      console.error(error);
    }
  };

  const getColorByType = (uploadType: string) => {
    if (uploadType.includes('PENDING')) return '#667eea';
    if (uploadType.includes('DELIVERY')) return '#10b981';
    return '#64748b';
  };

  const getFieldsForUploadType = (uploadType: string): string[] => {
    if (uploadType.includes('PENDING')) {
      return ['consumer_number', 'order_no', 'book_date', 'product', 'refill_type', 'delivery_flag'];
    } else if (uploadType.includes('DELIVERY')) {
      return ['consumer_number', 'order_no', 'book_date', 'delivery_date', 'cash_memo_no', 'payment_option'];
    }
    return Object.keys(REQUIRED_FIELDS);
  };

  const relevantFields = editDialog.mapping
    ? getFieldsForUploadType(editDialog.mapping.upload_type)
    : Object.keys(REQUIRED_FIELDS);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/orderbook/upload')}
          variant="outlined"
          sx={{
            borderRadius: 2,
            borderColor: '#e5e7eb',
            color: '#64748b',
          }}
        >
          Back to Upload
        </Button>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 0.5,
            }}
          >
            Column Mappings
          </Typography>
          <Typography variant="body1" sx={{ color: "#64748b", fontSize: '1.05rem' }}>
            Configure how Excel/CSV columns map to database fields
          </Typography>
        </Box>
        <Button
          startIcon={<RefreshIcon />}
          onClick={fetchMappings}
          variant="outlined"
          sx={{
            borderRadius: 2,
            borderColor: '#e5e7eb',
            color: '#64748b',
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* Mappings Grid */}
      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))' }}>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : mappings.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No column mappings found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Run: python manage.py seed_column_mappings
            </Typography>
          </Paper>
        ) : (
          mappings.map((mapping) => (
            <Card
              key={mapping.id}
              elevation={0}
              sx={{
                border: `2px solid ${getColorByType(mapping.upload_type)}20`,
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: `${getColorByType(mapping.upload_type)}60`,
                  boxShadow: `0 8px 30px ${getColorByType(mapping.upload_type)}15`,
                },
              }}
            >
              <CardHeader
                title={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {mapping.upload_type_display}
                    </Typography>
                    <Chip
                      label={mapping.is_active ? "Active" : "Inactive"}
                      size="small"
                      color={mapping.is_active ? "success" : "default"}
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </Stack>
                }
                action={
                  <IconButton
                    onClick={() => handleEdit(mapping)}
                    sx={{
                      bgcolor: `${getColorByType(mapping.upload_type)}10`,
                      '&:hover': {
                        bgcolor: `${getColorByType(mapping.upload_type)}20`,
                      },
                    }}
                  >
                    <EditIcon sx={{ fontSize: 20, color: getColorByType(mapping.upload_type) }} />
                  </IconButton>
                }
                sx={{
                  bgcolor: `${getColorByType(mapping.upload_type)}05`,
                  borderBottom: `1px solid ${getColorByType(mapping.upload_type)}20`,
                }}
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {mapping.description}
                </Typography>

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Database Field</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Excel/CSV Column</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(mapping.mappings).map(([key, value]) => (
                        <TableRow key={key} hover>
                          <TableCell sx={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#667eea' }}>
                            {key}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                            {value || <Chip label="Not Mapped" size="small" color="warning" />}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Last updated: {new Date(mapping.updated_at).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      {/* Edit Dialog */}
      <Dialog
        open={editDialog.open}
        onClose={() => {
          setEditDialog({ open: false, mapping: null });
          setDetectedColumns([]);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#f8f9ff', borderBottom: '2px solid #667eea' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Configure Column Mapping
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {editDialog.mapping?.upload_type_display}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {/* File Upload Section */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              border: '2px dashed #cbd5e1',
              borderRadius: 2,
              bgcolor: '#fafbfc',
              textAlign: 'center',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
            <CloudUpload sx={{ fontSize: 40, color: '#667eea', mb: 1 }} />
            <Typography variant="body2" sx={{ mb: 2 }}>
              Upload a sample file to auto-detect column names
            </Typography>
            <Button
              variant="outlined"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFile}
              sx={{
                borderColor: '#667eea',
                color: '#667eea',
                '&:hover': {
                  borderColor: '#667eea',
                  bgcolor: '#f8f9ff',
                },
              }}
            >
              {uploadingFile ? 'Detecting...' : 'Upload Sample File'}
            </Button>
            {detectedColumns.length > 0 && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Detected {detectedColumns.length} columns. Select them from dropdowns below.
              </Alert>
            )}
          </Paper>

          <Divider sx={{ mb: 3 }} />

          {/* Mapping Fields */}
          <Stack spacing={2.5}>
            {relevantFields.map((field) => {
              const fieldConfig = REQUIRED_FIELDS[field as keyof typeof REQUIRED_FIELDS];
              return (
                <FormControl key={field} fullWidth size="small">
                  <InputLabel>
                    {fieldConfig.label} {fieldConfig.required && '*'}
                  </InputLabel>
                  <Select
                    value={editedMappings[field] || ''}
                    onChange={(e) =>
                      setEditedMappings({ ...editedMappings, [field]: e.target.value })
                    }
                    label={`${fieldConfig.label} ${fieldConfig.required ? '*' : ''}`}
                  >
                    <MenuItem value="">
                      <em>Not Mapped</em>
                    </MenuItem>
                    {detectedColumns.length > 0 ? (
                      detectedColumns.map((col) => (
                        <MenuItem key={col} value={col}>
                          {col}
                        </MenuItem>
                      ))
                    ) : (
                      editDialog.mapping &&
                      Object.values(editDialog.mapping.mappings).map((col) => (
                        <MenuItem key={col} value={col}>
                          {col}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  <Typography variant="caption" sx={{ mt: 0.5, ml: 1.5, color: '#64748b' }}>
                    Database field: <code style={{ color: '#667eea' }}>{field}</code>
                  </Typography>
                </FormControl>
              );
            })}
          </Stack>

          {detectedColumns.length === 0 && (
            <Alert severity="info" sx={{ mt: 3 }}>
              Upload a sample file to see available columns, or select from previously mapped columns.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#fafbfc' }}>
          <Button
            onClick={() => {
              setEditDialog({ open: false, mapping: null });
              setDetectedColumns([]);
            }}
            sx={{ color: '#64748b' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{
              px: 4,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              fontWeight: 600,
            }}
          >
            Save Mapping
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ColumnMappings;
