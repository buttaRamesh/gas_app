import { useState, useEffect } from "react";
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
  Chip,
  Card,
  CardContent,
  Fade,
  Tooltip,
  Paper,
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
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { orderBookApi, columnMappingApi } from "../../services/api";
import { extractColumnNames, compareColumnMappings } from "../../utils/csvParser";
import type {
  BackendFieldDefinition,
  FieldDefinitionsResponse,
  MismatchResult,
  ColumnMappingData,
} from "../../types/orderbook";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { red } from "@mui/material/colors";

interface ColumnMappingDialogProps {
  open: boolean;
  onClose: () => void;
  csvFile: File | null;
  uploadType: string;
  onSave?: (mappings: Record<string, string>) => void;
}

const ColumnMappingDialog = ({
  open,
  onClose,
  csvFile,
  uploadType,
  onSave,
}: ColumnMappingDialogProps) => {
  const { showSnackbar } = useSnackbar();

  // State
  const [backendFields, setBackendFields] = useState<BackendFieldDefinition[]>([]);
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mismatchAlert, setMismatchAlert] = useState<MismatchResult | null>(null);
  const [savedMappingId, setSavedMappingId] = useState<number | null>(null);
  const [error, setError] = useState<string>("");
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch backend field definitions and CSV columns on open
  useEffect(() => {
    const initialize = async () => {
      if (!open) return;

      setLoading(true);
      setError("");
      setMismatchAlert(null);
      setSavedMappingId(null); // Reset on each initialization

      try {
        // 1. Fetch backend field definitions (only configured fields for mappings)
        const fieldDefsResponse = await orderBookApi.getFieldDefinitions(uploadType, true);
        const fieldDefinitions: FieldDefinitionsResponse = fieldDefsResponse.data;

        if (!fieldDefinitions.success || !fieldDefinitions.fields) {
          throw new Error("Failed to load field definitions");
        }

        setBackendFields(fieldDefinitions.fields);

        // 2. Extract CSV columns if file provided
        let extractedColumns: string[] = [];
        if (csvFile) {
          const extractResult = await extractColumnNames(csvFile);
          if (!extractResult.success) {
            setError(extractResult.error || "Failed to extract CSV columns");
            setLoading(false);
            return;
          }
          extractedColumns = extractResult.columns;
          setCsvColumns(extractedColumns);
        }

        // 3. Determine file format from the file extension
        const fileFormat = csvFile?.name.endsWith('.xlsx') ? 'EXCEL' : 'CSV';

        // 4. Try to load saved mapping for this upload type and file format
        try {
          const mappingsResponse = await columnMappingApi.getByUploadType(uploadType, fileFormat);
          const savedMappings: ColumnMappingData[] = Array.isArray(mappingsResponse.data)
            ? mappingsResponse.data
            : mappingsResponse.data.results || [];

          if (savedMappings.length > 0) {
            const savedMapping = savedMappings[0]; // Use first matching mapping
            setSavedMappingId(savedMapping.id || null);

            // Filter saved mappings to only include fields that exist in current backend definitions
            const validFieldNames = new Set(fieldDefinitions.fields.map(f => f.field_name));
            const filteredMappings: Record<string, string> = {};
            for (const [fieldName, csvColumn] of Object.entries(savedMapping.mappings)) {
              if (validFieldNames.has(fieldName)) {
                filteredMappings[fieldName] = csvColumn;
              }
            }
            setMappings(filteredMappings);

            // If we have both CSV columns and saved mapping, check for missing columns
            if (extractedColumns.length > 0) {
              // Check if any saved column names are not present in extracted columns
              const savedColumnNames = Object.values(filteredMappings).filter(col => col);
              const missingColumns = savedColumnNames.filter(col => !extractedColumns.includes(col));

              if (missingColumns.length > 0) {
                setMismatchAlert({
                  has_changes: true,
                  missing_columns: missingColumns,
                  new_columns: [],
                  message: 'Some saved column names are not present in the selected file'
                });
              }
            } else {
              // No CSV file, extract columns from filtered mapping
              const savedColumns = Array.from(
                new Set(Object.values(filteredMappings).filter(col => col))
              );
              setCsvColumns(savedColumns);
            }

            // Initialize edit mode:
            // - Fields with saved mappings → view mode (false)
            // - Newly added fields without mappings → edit mode (true)
            const initialEditMode: Record<string, boolean> = {};
            fieldDefinitions.fields.forEach(field => {
              const hasSavedMapping = field.field_name in filteredMappings &&
                                      filteredMappings[field.field_name] !== null &&
                                      filteredMappings[field.field_name] !== '';
              initialEditMode[field.field_name] = !hasSavedMapping; // True if no saved mapping
            });
            setEditMode(initialEditMode);
          } else {
            // No saved mapping exists for this upload type and file format
            setSavedMappingId(null); // Reset savedMappingId to prevent overwriting other format's mapping

            if (extractedColumns.length === 0) {
              setError("Please select a CSV file to configure column mappings");
            } else {
              // Use default mapping as starting point
              setMappings(fieldDefinitions.default_mapping || {});
              // Enable edit mode for all fields
              const allEditMode: Record<string, boolean> = {};
              fieldDefinitions.fields.forEach(field => {
                allEditMode[field.field_name] = true;
              });
              setEditMode(allEditMode);
            }
          }
        } catch (mappingError) {
          console.error("Error loading saved mappings:", mappingError);
          // No saved mappings - start fresh
          setSavedMappingId(null); // Reset savedMappingId on error

          if (extractedColumns.length > 0) {
            setMappings(fieldDefinitions.default_mapping || {});
            const allEditMode: Record<string, boolean> = {};
            fieldDefinitions.fields.forEach(field => {
              allEditMode[field.field_name] = true;
            });
            setEditMode(allEditMode);
          } else {
            setError("Please select a CSV file to configure column mappings");
          }
        }
      } catch (err: any) {
        console.error("Initialization error:", err);
        setError(err.message || "Failed to initialize column mapping");
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [open, csvFile, uploadType]);

  const handleEditClick = (fieldName: string) => {
    setEditMode(prev => ({ ...prev, [fieldName]: true }));
  };

  const handleMappingChange = (fieldName: string, csvColumn: string) => {
    setMappings(prev => ({ ...prev, [fieldName]: csvColumn }));
  };

  const handleReset = () => {
    // Reset to saved mapping or empty
    const initialEditMode: Record<string, boolean> = {};
    backendFields.forEach(field => {
      initialEditMode[field.field_name] = csvFile !== null;
    });
    setEditMode(initialEditMode);
    setMismatchAlert(null);
    showSnackbar("Mappings reset to saved state", "info");
  };

  const handleCancel = () => {
    setMappings({});
    setEditMode({});
    setMismatchAlert(null);
    onClose();
  };

  const validateMappings = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check required fields are mapped
    const requiredFields = backendFields.filter(f => f.required);
    for (const field of requiredFields) {
      if (!mappings[field.field_name] || mappings[field.field_name].trim() === "") {
        errors.push(`Required field '${field.label}' must be mapped`);
      }
    }

    // Check for duplicate mappings
    const usedColumns = new Map<string, string>();
    for (const [backendField, csvColumn] of Object.entries(mappings)) {
      if (csvColumn && csvColumn.trim()) {
        if (usedColumns.has(csvColumn)) {
          errors.push(
            `CSV column '${csvColumn}' is mapped to multiple fields: ${usedColumns.get(csvColumn)} and ${backendField}`
          );
        } else {
          usedColumns.set(csvColumn, backendField);
        }
      }
    }

    // Check mapped columns exist in CSV
    for (const [backendField, csvColumn] of Object.entries(mappings)) {
      if (csvColumn && csvColumn.trim() && !csvColumns.includes(csvColumn)) {
        errors.push(`CSV column '${csvColumn}' not found in uploaded file`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  };

  const handleSave = async () => {
    // Validate mappings
    const validation = validateMappings();
    if (!validation.valid) {
      showSnackbar(validation.errors.join(". "), "error");
      return;
    }

    setSaving(true);

    try {
      const fileFormat = csvFile?.name.endsWith('.xlsx') ? 'EXCEL' : 'CSV';
      const mappingData: Partial<ColumnMappingData> = {
        name: `${uploadType} ${fileFormat} Mapping`,
        upload_type: uploadType,
        file_format: fileFormat,
        description: `Column mapping for ${uploadType} ${fileFormat} files`,
        mappings: mappings,
        is_active: true,
      };

      if (savedMappingId) {
        // Update existing mapping
        await columnMappingApi.update(savedMappingId, mappingData);
        showSnackbar("Column mapping updated successfully", "success");
      } else {
        // Create new mapping
        await columnMappingApi.create(mappingData);
        showSnackbar("Column mapping saved successfully", "success");
      }

      // Call parent onSave if provided
      if (onSave) {
        onSave(mappings);
      }

      onClose();
    } catch (err: any) {
      console.error("Error saving mapping:", err);
      showSnackbar(err.response?.data?.error || "Failed to save mapping", "error");
    } finally {
      setSaving(false);
    }
  };

  const isFieldEditable = (fieldName: string): boolean => {
    return editMode[fieldName] === true;
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!savedMappingId) return;

    setDeleting(true);
    try {
      await columnMappingApi.delete(savedMappingId);
      showSnackbar(`${fileFormat} mapping deleted successfully`, "success");
      setDeleteDialogOpen(false);
      onClose();
    } catch (err: any) {
      console.error("Error deleting mapping:", err);
      showSnackbar(err.response?.data?.error || "Failed to delete mapping", "error");
    } finally {
      setDeleting(false);
    }
  };

  const fileFormat = csvFile?.name.endsWith('.xlsx') ? 'Excel' : 'CSV';

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
          mb:1
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <SwapHoriz sx={{ fontSize: 24 }} />
            <Typography variant="h5" fontWeight="700">
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
            {csvFile && (
              <Chip
                label={`${fileFormat} File`}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.25)',
                  color: 'white',
                  fontWeight: 600,
                  backdropFilter: 'blur(10px)',
                }}
              />
            )}
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
        {savedMappingId && (
          <Tooltip title={`Delete ${fileFormat} mapping`}>
            <IconButton
              onClick={handleDeleteClick}
              disabled={deleting || saving}
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
        )}
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

        {/* Error State */}
        {!loading && error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: 2,
            }}
          >
            {error}
          </Alert>
        )}

        {/* Mismatch Alert - Show only for saved mappings with missing columns */}
        {!loading && !error && savedMappingId && mismatchAlert && mismatchAlert.has_changes && (
          <Alert
            severity="warning"
            icon={<Warning />}
            sx={{
              mb: 3,mt:1,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
              border: '1px solid #ffb74d',
              boxShadow: '0 4px 12px rgba(255, 152, 0, 0.15)',
            }}
          >
            <Typography variant="body1" fontWeight="700" sx={{ mb: 1 }}>
              ⚠️ Column structure has changed
            </Typography>
            {mismatchAlert.missing_columns.length > 0 && (
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Missing:</strong> {mismatchAlert.missing_columns.join(", ")}
              </Typography>
            )}
            {mismatchAlert.new_columns.length > 0 && (
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>New:</strong> {mismatchAlert.new_columns.join(", ")}
              </Typography>
            )}
            <Typography variant="caption" sx={{ mt: 1, display: "block", fontStyle: 'italic' }}>
              Please review and update the mappings below.
            </Typography>
          </Alert>
        )}

        {/* Mapping Grid */}
        {!loading && !error && backendFields.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: 'white',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ mb: 0.2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle sx={{ color: '#667eea',fontSize:20 }} />
              <Typography variant="h6" fontWeight="700">
                Field Mappings
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 3, mb: 1.5}}>
              <Box sx={{ flex: '0 0 45%' }}>
                <Typography variant="subtitle1" fontWeight="700" color="text.secondary">
                  Backend Field
                </Typography>
              </Box>
              <Box sx={{ flex: '0 0 45%' }}>
                <Typography variant="subtitle1" fontWeight="700" color="text.secondary">
                  CSV/Excel Column
                </Typography>
              </Box>
            </Box>

            <Stack spacing={1.5}>
              {backendFields.map((field,index) => (
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
                    }
                  }}
                >
                  <CardContent sx={{ px: 1.5 , py: 0.5  }}>
                    <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-end'  }}>
                      {/* Left: Backend field label */}
                      <Box sx={{ flex: '0 0 45%'  }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25  }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" fontWeight="600" sx={{ fontSize: '0.875rem' }}>
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
                          variant="standard"
                          select
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
                            '& .MuiInput-underline:before': {
                              borderBottomColor: '#e0e0e0',
                            },
                            '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                              borderBottomColor: '#667eea',
                            },
                            '& .MuiInput-underline:after': {
                              borderBottomColor: '#667eea',
                            }
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#f44336' }}>
          Delete Column Mapping?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            This will permanently delete the <strong>{fileFormat}</strong> column mapping for{' '}
            <strong>{uploadType}</strong>. This action cannot be undone.
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Warning:</strong> You will need to reconfigure the column mapping the next time you upload a {fileFormat} file.
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
    </Dialog>
  );
};

export default ColumnMappingDialog;
