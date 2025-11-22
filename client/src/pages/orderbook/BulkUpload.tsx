import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Stack,
  Fade,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Grid,
} from "@mui/material";
import {
  CloudUpload,
  CheckCircle,
  Error as ErrorIcon,
  ArrowBack,
  PostAdd,
  LocalShipping,
  Refresh,
  Settings,
} from "@mui/icons-material";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { orderBookApi } from "../../services/api";
import ColumnMappingDialog from "../../components/order_book/ColumnMappingDialog";

// Type for upload result
interface UploadResult {
  success: boolean;
  message: string;
  success_count: number;
  error_count: number;
  skipped_count?: number;
  errors?: Array<{ row: number; errors: string[] }>;
}

type UploadType = 'pending' | 'delivery';

const BulkUpload = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  // Pending orders upload state
  const pendingFileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingUploading, setPendingUploading] = useState(false);
  const [pendingProgress, setPendingProgress] = useState(0);
  const [pendingResult, setPendingResult] = useState<UploadResult | null>(null);
  const [pendingDragging, setPendingDragging] = useState(false);

  // Delivery marking upload state
  const deliveryFileInputRef = useRef<HTMLInputElement>(null);
  const [deliveryFile, setDeliveryFile] = useState<File | null>(null);
  const [deliveryUploading, setDeliveryUploading] = useState(false);
  const [deliveryProgress, setDeliveryProgress] = useState(0);
  const [deliveryResult, setDeliveryResult] = useState<UploadResult | null>(null);
  const [deliveryDragging, setDeliveryDragging] = useState(false);

  // Column mapping dialog state
  const [mappingDialogOpen, setMappingDialogOpen] = useState(false);
  const [currentMappingType, setCurrentMappingType] = useState<UploadType | null>(null);
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({});

  const validateFile = (file: File): boolean => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      showSnackbar("File must be CSV or Excel (.xlsx)", "error");
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      showSnackbar("File size must be less than 10MB", "error");
      return false;
    }
    return true;
  };

  const handleFileSelect = (file: File, type: UploadType) => {
    if (validateFile(file)) {
      if (type === 'pending') {
        setPendingFile(file);
        setPendingResult(null);
      } else {
        setDeliveryFile(file);
        setDeliveryResult(null);
      }
      showSnackbar(`File selected: ${file.name}`, "success");
    }
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: UploadType
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file, type);
    }
  };

  const handleDragOver = (e: React.DragEvent, type: UploadType) => {
    e.preventDefault();
    if (type === 'pending') {
      setPendingDragging(true);
    } else {
      setDeliveryDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent, type: UploadType) => {
    e.preventDefault();
    if (type === 'pending') {
      setPendingDragging(false);
    } else {
      setDeliveryDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent, type: UploadType) => {
    e.preventDefault();
    if (type === 'pending') {
      setPendingDragging(false);
    } else {
      setDeliveryDragging(false);
    }
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file, type);
    }
  };

  const handleUpload = async (type: UploadType) => {
    const file = type === 'pending' ? pendingFile : deliveryFile;

    if (!file) {
      showSnackbar("Please select a file first", "error");
      return;
    }

    try {
      if (type === 'pending') {
        setPendingUploading(true);
        setPendingProgress(0);
      } else {
        setDeliveryUploading(true);
        setDeliveryProgress(0);
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        if (type === 'pending') {
          setPendingProgress((prev) => (prev >= 90 ? 90 : prev + 10));
        } else {
          setDeliveryProgress((prev) => (prev >= 90 ? 90 : prev + 10));
        }
      }, 200);

      // Call appropriate API
      const response = type === 'pending'
        ? await orderBookApi.uploadPending(file)
        : await orderBookApi.uploadDeliveries(file);

      const result: UploadResult = response.data;

      clearInterval(progressInterval);
      if (type === 'pending') {
        setPendingProgress(100);
        setPendingResult(result);
      } else {
        setDeliveryProgress(100);
        setDeliveryResult(result);
      }

      if (result.success_count > 0) {
        const message = type === 'pending'
          ? `${result.success_count} orders uploaded successfully`
          : `${result.success_count} orders marked as delivered${result.skipped_count ? `, ${result.skipped_count} skipped` : ''}`;
        showSnackbar(
          message + (result.error_count > 0 ? `, ${result.error_count} failed` : ""),
          result.error_count > 0 ? "warning" : "success"
        );
      } else {
        showSnackbar("Upload failed. Please check the errors below", "error");
      }
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.message || "An error occurred during upload",
        "error"
      );
      console.error(error);
    } finally {
      if (type === 'pending') {
        setPendingUploading(false);
      } else {
        setDeliveryUploading(false);
      }
    }
  };

  const handleReset = (type: UploadType) => {
    if (type === 'pending') {
      setPendingFile(null);
      setPendingResult(null);
      setPendingProgress(0);
      if (pendingFileInputRef.current) {
        pendingFileInputRef.current.value = "";
      }
    } else {
      setDeliveryFile(null);
      setDeliveryResult(null);
      setDeliveryProgress(0);
      if (deliveryFileInputRef.current) {
        deliveryFileInputRef.current.value = "";
      }
    }
  };

  const handleOpenMappingDialog = (type: UploadType) => {
    setCurrentMappingType(type);
    setMappingDialogOpen(true);
  };

  const handleSaveMappings = (mappings: Record<string, string>) => {
    setColumnMappings(mappings);
    showSnackbar("Column mappings saved successfully", "success");
  };

  const renderUploadCard = (
    type: UploadType,
    title: string,
    description: string,
    icon: React.ReactNode,
    color: string,
    file: File | null,
    uploading: boolean,
    progress: number,
    result: UploadResult | null,
    dragging: boolean,
    fileInputRef: React.RefObject<HTMLInputElement>
  ) => (
    <Paper
      elevation={0}
      sx={{
        border: `2px solid ${color}20`,
        borderRadius: 3,
        p: 4,
        background: 'white',
        boxShadow: `0 4px 20px ${color}15`,
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: `${color}40`,
          boxShadow: `0 8px 30px ${color}25`,
        },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Box
          sx={{
            p: 1.5,
            bgcolor: `${color}10`,
            borderRadius: 2,
            display: 'flex',
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            {description}
          </Typography>
        </Box>
      </Stack>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx"
        style={{ display: "none" }}
        onChange={(e) => handleFileInputChange(e, type)}
      />

      <Fade in={true}>
        <Box
          onDragOver={(e) => handleDragOver(e, type)}
          onDragLeave={(e) => handleDragLeave(e, type)}
          onDrop={(e) => handleDrop(e, type)}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            border: `2px dashed ${dragging ? color : file ? '#10b981' : '#cbd5e1'}`,
            borderRadius: 2,
            p: 4,
            textAlign: "center",
            bgcolor: dragging ? `${color}10` : file ? "#f0fdf4" : "#fafbfc",
            cursor: "pointer",
            transition: "all 0.3s ease",
            mb: 3,
            "&:hover": {
              borderColor: color,
              bgcolor: `${color}05`,
            },
          }}
        >
          <CloudUpload
            sx={{
              fontSize: 48,
              color: file ? "#10b981" : color,
              mb: 1,
            }}
          />
          {file ? (
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                {file.name}
              </Typography>
              <Chip
                label={`${(file.size / 1024).toFixed(2)} KB`}
                size="small"
                sx={{
                  bgcolor: '#d1fae5',
                  color: '#065f46',
                  fontWeight: 600,
                }}
              />
            </Box>
          ) : (
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                {dragging ? "Drop file here" : "Drag & drop file or click"}
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                CSV or Excel (.xlsx) • Max 10MB
              </Typography>
            </Box>
          )}
        </Box>
      </Fade>

      {uploading && (
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Uploading...
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {progress}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: "#e5e7eb",
              "& .MuiLinearProgress-bar": {
                bgcolor: color,
                borderRadius: 3,
              },
            }}
          />
        </Box>
      )}

      <Stack direction="row" spacing={2}>
        <Button
          variant="outlined"
          onClick={() => handleOpenMappingDialog(type)}
          disabled={!file || uploading}
          startIcon={<Settings />}
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: 2,
            borderColor: file ? color : '#e5e7eb',
            color: file ? color : '#94a3b8',
            fontWeight: 600,
            "&:hover": {
              borderColor: color,
              bgcolor: `${color}05`,
            },
            "&:disabled": {
              borderColor: '#e5e7eb',
              color: '#94a3b8',
            },
          }}
        >
          Mappings
        </Button>
        <Button
          variant="contained"
          onClick={() => handleUpload(type)}
          disabled={!file || uploading}
          startIcon={<CloudUpload />}
          sx={{
            flex: 1,
            py: 1.5,
            fontWeight: 600,
            borderRadius: 2,
            bgcolor: color,
            "&:hover": {
              bgcolor: color,
              filter: 'brightness(0.9)',
            },
            "&:disabled": {
              background: '#e5e7eb',
              color: '#94a3b8',
            },
          }}
        >
          {uploading ? "Uploading..." : "Upload"}
        </Button>
        {file && !uploading && (
          <Button
            variant="outlined"
            onClick={() => handleReset(type)}
            startIcon={<Refresh />}
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 2,
              borderColor: '#e5e7eb',
              color: '#64748b',
              fontWeight: 600,
            }}
          >
            Reset
          </Button>
        )}
      </Stack>

      {result && (
        <Fade in={true}>
          <Box sx={{ mt: 3 }}>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Card sx={{ flex: 1, bgcolor: "#ecfdf5", border: "1px solid #86efac" }}>
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CheckCircle sx={{ color: "#10b981", fontSize: 24 }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#065f46' }}>
                        {result.success_count}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#047857" }}>
                        Success
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {result.skipped_count !== undefined && result.skipped_count > 0 && (
                <Card sx={{ flex: 1, bgcolor: "#fef3c7", border: "1px solid #fbbf24" }}>
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <ErrorIcon sx={{ color: "#f59e0b", fontSize: 24 }} />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#92400e' }}>
                          {result.skipped_count}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#b45309" }}>
                          Skipped
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              )}

              <Card sx={{ flex: 1, bgcolor: "#fef2f2", border: "1px solid #fca5a5" }}>
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <ErrorIcon sx={{ color: "#ef4444", fontSize: 24 }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#991b1b' }}>
                        {result.error_count}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#dc2626" }}>
                        Failed
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>

            {result.errors && result.errors.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#ef4444' }}>
                  Errors ({result.errors.length} rows)
                </Typography>
                <List
                  sx={{
                    bgcolor: "#fef2f2",
                    borderRadius: 2,
                    border: "1px solid #fca5a5",
                    maxHeight: 200,
                    overflow: 'auto',
                  }}
                >
                  {result.errors.slice(0, 10).map((error, index) => (
                    <Box key={index}>
                      <ListItem dense>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <ErrorIcon sx={{ color: "#ef4444", fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={`Row ${error.row}`}
                          secondary={error.errors.join(", ")}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                      {index < Math.min(result.errors!.length - 1, 9) && <Divider />}
                    </Box>
                  ))}
                  {result.errors.length > 10 && (
                    <ListItem dense>
                      <ListItemText
                        primary={`... and ${result.errors.length - 10} more errors`}
                        primaryTypographyProps={{
                          variant: 'caption',
                          sx: { fontStyle: 'italic', color: '#64748b', textAlign: 'center' }
                        }}
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            )}
          </Box>
        </Fade>
      )}
    </Paper>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/orderbook')}
          variant="outlined"
          sx={{
            borderRadius: 2,
            borderColor: '#e5e7eb',
            color: '#64748b',
          }}
        >
          Back to Orders
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
            Bulk Upload Orders
          </Typography>
          <Typography variant="body1" sx={{ color: "#64748b", fontSize: '1.05rem' }}>
            Upload pending orders or mark deliveries in bulk • Select a file to configure mappings
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Pending Orders Upload */}
        <Grid item xs={12} lg={6}>
          {renderUploadCard(
            'pending',
            'Upload Pending Orders',
            'Add new orders from GetPendingOrderConsumerDetails file',
            <PostAdd sx={{ fontSize: 32, color: '#667eea' }} />,
            '#667eea',
            pendingFile,
            pendingUploading,
            pendingProgress,
            pendingResult,
            pendingDragging,
            pendingFileInputRef
          )}
        </Grid>

        {/* Delivery Marking Upload */}
        <Grid item xs={12} lg={6}>
          {renderUploadCard(
            'delivery',
            'Upload Refills',
            'Mark existing orders as delivered from RefillDetails file',
            <LocalShipping sx={{ fontSize: 32, color: '#10b981' }} />,
            '#10b981',
            deliveryFile,
            deliveryUploading,
            deliveryProgress,
            deliveryResult,
            deliveryDragging,
            deliveryFileInputRef
          )}
        </Grid>
      </Grid>

      {(pendingResult || deliveryResult) && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/orderbook')}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              fontWeight: 600,
            }}
          >
            View All Orders
          </Button>
        </Box>
      )}

      {/* Column Mapping Dialog */}
      <ColumnMappingDialog
        open={mappingDialogOpen}
        onClose={() => setMappingDialogOpen(false)}
        csvFile={currentMappingType === 'pending' ? pendingFile : deliveryFile}
        uploadType={currentMappingType === 'pending' ? 'PENDING' : 'DELIVERY'}
        onSave={handleSaveMappings}
      />
    </Container>
  );
};

export default BulkUpload;
