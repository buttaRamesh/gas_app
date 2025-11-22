import { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  Card,
  Divider,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Save,
  Refresh,
  Settings as SettingsIcon,
  CheckCircle,
  Cancel,
  DragIndicator,
  Info,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { orderBookApi, fieldConfigurationApi } from "../../services/api";
import { useSnackbar } from "../../contexts/SnackbarContext";
import type { BackendFieldDefinition } from "../../types/orderbook";

interface FieldConfigRow {
  field_name: string;
  label: string;
  field_type: string;
  is_included: boolean;
  display_order: number;
  configuration_id?: number;
}

const UPLOAD_TYPE_OPTIONS = [
  { value: "PENDING", label: "Pending Orders" },
  { value: "DELIVERY", label: "Delivery Marking" },
];

const FieldSettings = () => {
  const { showSnackbar } = useSnackbar();

  const [uploadType, setUploadType] = useState<string>("PENDING");
  const [allFields, setAllFields] = useState<BackendFieldDefinition[]>([]);
  const [fieldConfigs, setFieldConfigs] = useState<FieldConfigRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load all available fields and existing configurations
  useEffect(() => {
    loadFieldConfigurations();
  }, [uploadType]);

  const loadFieldConfigurations = async () => {
    setLoading(true);
    try {
      // 1. Fetch all available fields WITH upload_type to get PaymentInfo fields for DELIVERY
      const fieldsResponse = await orderBookApi.getFieldDefinitions(uploadType);
      const allFieldDefs: BackendFieldDefinition[] = fieldsResponse.data.fields || [];
      setAllFields(allFieldDefs);

      // 2. Fetch existing configurations for selected upload type
      const configsResponse = await fieldConfigurationApi.getByUploadType(uploadType);
      const existingConfigs = Array.isArray(configsResponse.data)
        ? configsResponse.data
        : configsResponse.data.results || [];

      // 3. Build config map for quick lookup
      const configMap = new Map(
        existingConfigs.map((config: any) => [
          config.field_name,
          {
            is_included: config.is_included,
            display_order: config.display_order,
            configuration_id: config.id,
          },
        ])
      );

      // 4. Merge all fields with their configurations
      const mergedConfigs: FieldConfigRow[] = allFieldDefs.map((field, index) => {
        const existingConfig = configMap.get(field.field_name);
        return {
          field_name: field.field_name,
          label: field.label,
          field_type: field.field_type,
          // If no config exists, default to included. If config exists, use its is_included value.
          is_included: existingConfig ? existingConfig.is_included : true,
          display_order: existingConfig?.display_order ?? index,
          configuration_id: existingConfig?.configuration_id,
        };
      });

      // Sort by display order
      mergedConfigs.sort((a, b) => a.display_order - b.display_order);

      setFieldConfigs(mergedConfigs);
      setHasChanges(false);
    } catch (error: any) {
      console.error("Error loading field configurations:", error);
      showSnackbar(
        error.response?.data?.error || "Failed to load field configurations",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFieldToggle = (fieldName: string, included: boolean) => {
    setFieldConfigs((prev) =>
      prev.map((field) =>
        field.field_name === fieldName ? { ...field, is_included: included } : field
      )
    );
    setHasChanges(true);
  };

  const handleDisplayOrderChange = (fieldName: string, order: number) => {
    setFieldConfigs((prev) =>
      prev.map((field) =>
        field.field_name === fieldName ? { ...field, display_order: order } : field
      )
    );
    setHasChanges(true);
  };

  const handleReset = () => {
    loadFieldConfigurations();
    showSnackbar("Settings reset to saved state", "info");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Prepare batch operations
      const createPromises = [];
      const updatePromises = [];

      for (const config of fieldConfigs) {
        // Always create or update configuration (for both included and excluded fields)
        const configData = {
          upload_type: uploadType,
          field_name: config.field_name,
          is_included: config.is_included,
          is_required: false, // Not used anymore, but backend still expects it
          display_order: config.display_order,
        };

        if (config.configuration_id) {
          // Update existing
          updatePromises.push(
            fieldConfigurationApi.update(config.configuration_id, configData)
          );
        } else {
          // Create new (both for included and excluded fields)
          createPromises.push(fieldConfigurationApi.create(configData));
        }
      }

      // Execute all operations in parallel
      await Promise.all([...createPromises, ...updatePromises]);

      showSnackbar(
        `Field configurations saved successfully for ${UPLOAD_TYPE_OPTIONS.find((opt) => opt.value === uploadType)?.label}`,
        "success"
      );
      setHasChanges(false);

      // Reload to get updated IDs
      await loadFieldConfigurations();
    } catch (error: any) {
      console.error("Error saving field configurations:", error);
      console.error("Error details:", error.response?.data);

      // Extract detailed error message
      let errorMessage = "Failed to save field configurations";
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.non_field_errors) {
          errorMessage = error.response.data.non_field_errors.join(', ');
        } else {
          // Try to extract field-specific errors
          const fieldErrors = Object.entries(error.response.data)
            .filter(([key]) => key !== 'error' && key !== 'detail')
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('; ');
          if (fieldErrors) {
            errorMessage = fieldErrors;
          }
        }
      }

      showSnackbar(errorMessage, "error");
    } finally {
      setSaving(false);
    }
  };

  const includedCount = fieldConfigs.filter((f) => f.is_included).length;
  const excludedCount = fieldConfigs.filter((f) => !f.is_included).length;

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      const response = await fieldConfigurationApi.deleteByUploadType(uploadType);

      showSnackbar(
        response.data.message || `All settings for ${UPLOAD_TYPE_OPTIONS.find((opt) => opt.value === uploadType)?.label} deleted successfully`,
        "success"
      );
      setDeleteDialogOpen(false);

      // Reload configurations
      await loadFieldConfigurations();
    } catch (error: any) {
      console.error("Error deleting field settings:", error);
      showSnackbar(
        error.response?.data?.error || "Failed to delete field settings",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Gradient Header */}
        <Box
          sx={{
            p: 1.5,
            pb: 1.5,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%)',
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                <SettingsIcon sx={{ fontSize: 24 }} />
                <Typography variant="h6" fontWeight="700">
                  Field Mapping Settings
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.95, maxWidth: 700, fontSize: '0.8rem' }}>
                Configure field visibility and display order for different upload types
              </Typography>
            </Box>

            {/* Delete Button */}
            <Tooltip title={`Delete all settings for ${UPLOAD_TYPE_OPTIONS.find((opt) => opt.value === uploadType)?.label}`}>
              <IconButton
                onClick={handleDeleteClick}
                disabled={loading || saving || deleting}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(244, 67, 54, 0.8)',
                  '&:hover': {
                    bgcolor: 'rgba(244, 67, 54, 1)',
                  },
                  '&:disabled': {
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'rgba(255, 255, 255, 0.5)',
                  }
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Content Area */}
        <Box sx={{ p: 2 }}>
          {/* Upload Type Selector */}
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              mb: 2,
              borderRadius: 2,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Tabs
                value={uploadType}
                onChange={(e, newValue) => setUploadType(newValue)}
                disabled={loading || saving}
                sx={{
                  minHeight: 40,
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#667eea',
                    height: 3,
                  },
                  '& .MuiTab-root': {
                    minHeight: 40,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: 'text.secondary',
                    '&.Mui-selected': {
                      color: '#667eea',
                    },
                    '&:hover': {
                      color: '#667eea',
                      backgroundColor: 'rgba(102, 126, 234, 0.04)',
                    }
                  }
                }}
              >
                {UPLOAD_TYPE_OPTIONS.map((option) => (
                  <Tab key={option.value} label={option.label} value={option.value} />
                ))}
              </Tabs>

              {/* Summary Chips */}
              {!loading && (
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                  <Chip
                    icon={<CheckCircle sx={{ fontSize: '18px !important' }} />}
                    label={`${includedCount} Included`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(102, 126, 234, 0.1)',
                      color: '#667eea',
                      fontWeight: 600,
                      border: '1px solid rgba(102, 126, 234, 0.3)',
                    }}
                  />
                  <Chip
                    icon={<Cancel sx={{ fontSize: '18px !important' }} />}
                    label={`${excludedCount} Excluded`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                      color: 'text.secondary',
                      fontWeight: 600,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                  {hasChanges && (
                    <Chip
                      icon={<Info sx={{ fontSize: '18px !important' }} />}
                      label="Unsaved Changes"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255, 152, 0, 0.1)',
                        color: '#f57c00',
                        fontWeight: 600,
                        border: '1px solid rgba(255, 152, 0, 0.3)',
                      }}
                    />
                  )}
                </Stack>
              )}
            </Box>
          </Paper>

          {/* Loading State */}
          {loading && (
            <Box sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 12,
            }}>
              <CircularProgress size={48} sx={{ color: '#667eea', mb: 2 }} />
              <Typography variant="body1" color="text.secondary" fontWeight={500}>
                Loading field configurations...
              </Typography>
            </Box>
          )}

          {/* Field Configuration Table */}
          {!loading && (
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow
                      sx={{
                        bgcolor: 'rgba(102, 126, 234, 0.08)',
                        '& .MuiTableCell-head': {
                          borderBottom: '2px solid',
                          borderColor: 'rgba(102, 126, 234, 0.2)',
                        }
                      }}
                    >
                      <TableCell width="5%">
                        <DragIndicator sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </TableCell>
                      <TableCell width="45%">
                        <Typography variant="subtitle2" fontWeight="700" color="text.primary">
                          Field Name
                        </Typography>
                      </TableCell>
                      <TableCell width="20%">
                        <Typography variant="subtitle2" fontWeight="700" color="text.primary">
                          Type
                        </Typography>
                      </TableCell>
                      <TableCell width="15%" align="center">
                        <Typography variant="subtitle2" fontWeight="700" color="text.primary">
                          Include
                        </Typography>
                      </TableCell>
                      <TableCell width="15%" align="center">
                        <Typography variant="subtitle2" fontWeight="700" color="text.primary">
                          Display Order
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fieldConfigs.map((field, index) => (
                      <TableRow
                        key={field.field_name}
                        sx={{
                          transition: 'all 0.2s ease',
                          bgcolor: index % 2 === 0 
                            ? (field.is_included ? 'background.paper' : 'rgba(0,0,0,0.02)') 
                            : (field.is_included ? 'action.hover' : 'rgba(0,0,0,0.04)'),
                          opacity: field.is_included ? 1 : 0.6,
                          '&:hover': {
                            bgcolor: field.is_included
                              ? 'rgba(102, 126, 234, 0.04)'
                              : 'rgba(0,0,0,0.04)',
                          },
                          '& .MuiTableCell-root': {
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            py: 0.5,
                          }
                        }}
                      >
                        {/* Drag Handle */}
                        <TableCell>
                          <DragIndicator sx={{ color: 'text.disabled', fontSize: 20 }} />
                        </TableCell>

                        {/* Field Name */}
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="600" color="text.primary">
                              {field.label}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'text.secondary',
                                fontFamily: 'monospace',
                                fontSize: '0.7rem',
                              }}
                            >
                              {field.field_name}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Field Type */}
                        <TableCell>
                          <Chip
                            label={field.field_type}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              bgcolor: 'rgba(102, 126, 234, 0.08)',
                              color: '#667eea',
                            }}
                          />
                        </TableCell>

                        {/* Include Checkbox */}
                        <TableCell align="center">
                          <Checkbox
                            checked={field.is_included}
                            onChange={(e) =>
                              handleFieldToggle(field.field_name, e.target.checked)
                            }
                            disabled={saving}
                            sx={{
                              color: '#667eea',
                              '&.Mui-checked': {
                                color: '#667eea',
                              }
                            }}
                          />
                        </TableCell>

                        {/* Display Order */}
                        <TableCell align="center">
                          <TextField
                            type="number"
                            size="small"
                            value={field.display_order}
                            onChange={(e) =>
                              handleDisplayOrderChange(
                                field.field_name,
                                parseInt(e.target.value, 10) || 0
                              )
                            }
                            disabled={!field.is_included || saving}
                            sx={{
                              width: 90,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1.5,
                                '&:hover fieldset': {
                                  borderColor: '#667eea',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#667eea',
                                }
                              },
                            }}
                            inputProps={{ min: 0, max: 999 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* Help Text */}
          {!loading && (
            <Alert
              severity="info"
              icon={<Info />}
              sx={{
                mt: 3,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'rgba(2, 136, 209, 0.2)',
                bgcolor: 'rgba(2, 136, 209, 0.05)',
                '& .MuiAlert-icon': {
                  color: '#0288d1',
                }
              }}
            >
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Include:</strong> Check to show this field in the column mapping
                dialog for this upload type. Unchecked fields will be hidden.
              </Typography>
              <Typography variant="body2">
                <strong>Display Order:</strong> Controls the order fields appear in the
                dialog (lower numbers first). Use gaps (10, 20, 30) for easy reordering.
              </Typography>
            </Alert>
          )}

          {/* Action Buttons */}
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {hasChanges ? 'You have unsaved changes' : 'All changes saved'}
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                onClick={handleReset}
                startIcon={<Refresh />}
                disabled={loading || saving || !hasChanges}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  borderRadius: 2,
                  color: 'text.secondary',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.05)',
                  }
                }}
              >
                Reset Changes
              </Button>
              <Button
                onClick={handleSave}
                variant="contained"
                startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />}
                disabled={loading || saving || !hasChanges}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 4,
                  py: 1.2,
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #764ba2 30%, #667eea 90%)',
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
                {saving ? "Saving..." : "Save Configuration"}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#f44336' }}>
          Delete Field Settings?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete all field settings and column mappings for{' '}
            <strong>{UPLOAD_TYPE_OPTIONS.find((opt) => opt.value === uploadType)?.label}</strong>.
            {' '}This action cannot be undone.
          </DialogContentText>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Warning:</strong> All saved column mappings for this upload type will also be deleted.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={handleDeleteCancel}
            disabled={deleting}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={18} color="inherit" /> : <DeleteIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: '#f44336',
              '&:hover': {
                bgcolor: '#d32f2f',
              },
            }}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FieldSettings;
