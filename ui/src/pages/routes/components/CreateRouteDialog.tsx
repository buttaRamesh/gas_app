import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  Autocomplete,
  Chip,
  alpha,
  Snackbar,
} from "@mui/material";
import {
  Close,
  Save,
  Route as RouteIcon,
  Description,
  LocationOn,
  Person,
  Map,
  Add,
  Edit,
} from "@mui/icons-material";
import axiosInstance from "@/api/axiosInstance";

interface CreateRouteDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editRouteId?: number | null;
  viewMode?: boolean;
}

interface DeliveryPerson {  id: number;  person: {    id: number;    full_name: string;  };  assigned_routes_count: number;  total_consumers: number;}

interface Area {
  id: number;
  area_name: string;
  route?: number;
  route_code?: string;
  route_description?: string;
}

interface RouteFormData {
  area_code: string;
  area_code_description: string;
  delivery_person_id: number | null;
  area_ids: number[];
}

export function CreateRouteDialog({ open, onClose, onSuccess, editRouteId, viewMode = false }: CreateRouteDialogProps) {
  const [formData, setFormData] = useState<RouteFormData>({
    area_code: "",
    area_code_description: "",
    delivery_person_id: null,
    area_ids: [],
  });
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [unassignedAreas, setUnassignedAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [deliveryPersonDialogOpen, setDeliveryPersonDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const isEditMode = Boolean(editRouteId);
  const assignedDeliveryPerson = deliveryPersons.find((p) => p.id === formData.delivery_person_id);

  useEffect(() => {
    if (open) {
      // Clear success message on open
      setSuccessMessage("");
      setError(null);

      const loadData = async () => {
        await fetchData(); // Wait for delivery persons and areas to load first
        if (editRouteId) {
          await fetchRouteData(editRouteId);
        } else {
          // Reset form for create mode
          setFormData({
            area_code: "",
            area_code_description: "",
            delivery_person_id: null,
            area_ids: [],
          });
        }
      };
      loadData();
    }
  }, [open, editRouteId]);

  const fetchData = async () => {
    setDataLoading(true);
    try {
      const [personsResponse, areasResponse] = await Promise.all([
        axiosInstance.get("/delivery-persons/"),
        axiosInstance.get("/route-areas/?assigned=false"),
      ]);
      setDeliveryPersons(personsResponse.data.results || personsResponse.data || []);
      setUnassignedAreas(areasResponse.data.results || areasResponse.data || []);
    } catch (err: any) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load delivery persons and areas");
    } finally {
      setDataLoading(false);
    }
  };

  const fetchRouteData = async (routeId: number) => {
    try {
      const routeResponse = await axiosInstance.get(`/routes/${routeId}/`);
      const route = routeResponse.data;

      console.log("📋 Fetched route data:", route);

      // Add the route's existing areas to the unassigned areas list
      if (route.areas && route.areas.length > 0) {
        setUnassignedAreas((prev) => {
          const existingIds = new Set(prev.map((a: Area) => a.id));
          const newAreas = route.areas.filter((area: Area) => !existingIds.has(area.id));
          const merged = [...prev, ...newAreas];
          console.log("🗺️ Merged areas (prev + route areas):", merged.length);
          console.log("🗺️ Route areas:", route.areas);
          return merged;
        });
      }

      // Small delay to ensure state updates have processed
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get area IDs from the route's areas array
      const areaIds = route.areas?.map((area: any) => area.id) || [];

      const formDataToSet = {
        area_code: route.area_code || "",
        area_code_description: route.area_code_description || "",
        delivery_person_id: route.delivery_person?.id || null,
        area_ids: areaIds,
      };

      console.log("📝 Setting form data:", formDataToSet);
      console.log("📝 Delivery persons available:", deliveryPersons.length);

      setFormData(formDataToSet);
    } catch (err: any) {
      console.error("Failed to fetch route:", err);
      setError("Failed to load route data");
    }
  };

  const handleSubmit = async () => {
    if (!formData.area_code.trim() || !formData.area_code_description.trim()) {
      setError("Route code and description are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        area_code: formData.area_code.trim(),
        area_code_description: formData.area_code_description.trim(),
        delivery_person_id: formData.delivery_person_id,
      };

      if (formData.area_ids.length > 0) {
        payload.areas = formData.area_ids;
      }

      if (isEditMode && editRouteId) {
        await axiosInstance.put(`/routes/${editRouteId}/`, payload);
        setSuccessMessage("Route updated successfully!");
      } else {
        await axiosInstance.post("/routes/", payload);
        setSuccessMessage("Route created successfully!");
      }

      // Reset form data
      setFormData({
        area_code: "",
        area_code_description: "",
        delivery_person_id: null,
        area_ids: [],
      });

      // Call onSuccess to refresh the routes list
      onSuccess();

      // Delay closing to allow snackbar to show
      setTimeout(() => {
        setSuccessMessage("");
        onClose();
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.area_code?.[0] ||
                          err.response?.data?.message ||
                          err.response?.data?.detail ||
                          `Failed to ${isEditMode ? 'update' : 'create'} route`;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        area_code: "",
        area_code_description: "",
        delivery_person_id: null,
        area_ids: [],
      });
      setUnassignedAreas([]);
      setSelectedArea(null);
      setError(null);
      setSuccessMessage("");
      onClose();
    }
  };

  const handleRemoveArea = (areaId: number) => {
    setFormData((prev) => ({
      ...prev,
      area_ids: prev.area_ids.filter((id) => id !== areaId),
    }));
  };

  const handleAddArea = () => {
    if (selectedArea && !formData.area_ids.includes(selectedArea.id)) {
      setFormData((prev) => ({
        ...prev,
        area_ids: [...prev.area_ids, selectedArea.id],
      }));
      setSelectedArea(null); // Clear selection after adding
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: (theme) => ({
          borderRadius: 3,
          boxShadow: `0 12px 48px ${alpha(theme.palette.primary.main, 0.2)}`,
          background: `linear-gradient(to bottom, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
        }),
      }}
    >
      <DialogTitle
        sx={(theme) => ({
          background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
          color: theme.palette.secondary.contrastText,
          py: 1,
          px: 2,
        })}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={(theme) => ({
                width: 32,
                height: 32,
                borderRadius: 1,
                bgcolor: theme.palette.primary.main,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              })}
            >
              <RouteIcon sx={(theme) => ({ color: theme.palette.primary.contrastText, fontSize: 18 })} />
            </Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '0.95rem' }}>
              {viewMode ? "Route Details" : (isEditMode ? "Edit Route" : "Create New Route")}
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            disabled={loading}
            size="small"
            sx={(theme) => ({
              color: theme.palette.secondary.contrastText,
              "&:hover": { bgcolor: alpha(theme.palette.common.white, 0.15) },
            })}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2.5, pb: 1.5, px: 3, height: "70vh", overflow: "auto" }}>
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2, borderRadius: 1.5, fontWeight: 500 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {dataLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <Box
              component="fieldset"
              sx={(theme) => ({
                border: 1,
                borderColor: "divider",
                borderRadius: 1.5,
                p: 1.5,
                m: 0,
              })}
            >
              <Box
                component="legend"
                sx={{
                  px: 1,
                  color: "primary.main",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              >
                Route Information
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <TextField
                  label="Route Code"
                  value={formData.area_code}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, area_code: e.target.value }))
                  }
                  disabled={loading || viewMode}
                  required
                  fullWidth
                  size="small"
                  placeholder="e.g., R001, ZONE-A"
                  InputProps={{
                    startAdornment: (
                      <RouteIcon sx={{ mr: 1, color: "primary.main", fontSize: 20 }} />
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "white",
                      "&:hover fieldset": { borderColor: "primary.main" },
                      "&.Mui-focused fieldset": { borderColor: "primary.main", borderWidth: 2 },
                    },
                  }}
                />

                <TextField
                  label="Route Description"
                  value={formData.area_code_description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, area_code_description: e.target.value }))
                  }
                  disabled={loading || viewMode}
                  required
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  placeholder="Enter detailed route description"
                  InputProps={{
                    startAdornment: (
                      <Description
                        sx={{ mr: 1, color: "primary.main", fontSize: 20, alignSelf: "start", mt: 1 }}
                      />
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "white",
                      "&:hover fieldset": { borderColor: "primary.main" },
                      "&.Mui-focused fieldset": { borderColor: "primary.main", borderWidth: 2 },
                    },
                  }}
                />
              </Box>
            </Box>

            <Box
              component="fieldset"
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 1.5,
                p: 2,
                m: 0,
              }}
            >
              <Box
                component="legend"
                sx={{
                  px: 1,
                  color: "success.dark",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              >
                Delivery Person
              </Box>

              {assignedDeliveryPerson ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip
                    icon={<Person sx={{ fontSize: 18 }} />}
                    label={assignedDeliveryPerson.person.full_name}
                    onDelete={viewMode ? undefined : () => setFormData((prev) => ({ ...prev, delivery_person_id: null }))}
                    sx={(theme) => ({
                      background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                      color: "white",
                      fontWeight: 600,
                      height: 36,
                      px: 1,
                      "& .MuiChip-icon": {
                        color: "white !important",
                      },
                      "& .MuiChip-deleteIcon": {
                        color: "rgba(255,255,255,0.7) !important",
                        "&:hover": {
                          color: "white !important",
                        },
                      },
                    })}
                  />
                  {!viewMode && (
                    <Button
                      size="small"
                      startIcon={<Edit fontSize="small" />}
                      onClick={() => setDeliveryPersonDialogOpen(true)}
                      sx={{ textTransform: "none", minWidth: 0 }}
                    >
                      Change
                    </Button>
                  )}
                </Box>
              ) : viewMode ? (
                <Typography variant="body2" color="text.secondary">
                  No delivery person assigned
                </Typography>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => setDeliveryPersonDialogOpen(true)}
                  sx={{
                    textTransform: "none",
                    borderStyle: "dashed",
                    borderWidth: 2,
                    color: "success.main",
                    borderColor: "success.main",
                    "&:hover": {
                      borderWidth: 2,
                      borderColor: "success.dark",
                      bgcolor: alpha("#4CAF50", 0.05),
                    },
                  }}
                >
                  Assign Delivery Person
                </Button>
              )}
            </Box>

            <Box
              component="fieldset"
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 1.5,
                p: 2,
                m: 0,
              }}
            >
              <Box
                component="legend"
                sx={{
                  px: 1,
                  color: "info.dark",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                Areas
                {formData.area_ids.length > 0 && (
                  <Chip
                    label={formData.area_ids.length}
                    size="small"
                    sx={(theme) => ({
                      bgcolor: theme.palette.info.main,
                      color: "white",
                      fontWeight: 700,
                      fontSize: "0.65rem",
                      height: 18,
                      "& .MuiChip-label": { px: 0.75 },
                    })}
                  />
                )}
              </Box>

              {formData.area_ids.length > 0 && (
                <Box
                  sx={{
                    mb: 1.5,
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: "grey.50",
                    border: 1,
                    borderColor: "grey.200",
                    maxHeight: 120,
                    overflowY: "auto",
                  }}
                >
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                    {formData.area_ids.map((areaId, index) => {
                      const area = unassignedAreas.find((a) => a.id === areaId);
                      if (!area) {
                        console.warn(`⚠️ Area with ID ${areaId} not found in unassignedAreas`);
                        return null;
                      }
                      const colors = [
                        { bg: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)", textColor: "white", borderColor: "#1976D2" },
                        { bg: "linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)", textColor: "white", borderColor: "#7B1FA2" },
                        { bg: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)", textColor: "white", borderColor: "#F57C00" },
                        { bg: "linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)", textColor: "white", borderColor: "#0097A7" },
                        { bg: "linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)", textColor: "white", borderColor: "#388E3C" },
                        { bg: "linear-gradient(135deg, #E91E63 0%, #C2185B 100%)", textColor: "white", borderColor: "#C2185B" },
                      ];
                      const colorStyle = colors[index % colors.length];
                      return (
                        <Chip
                          key={areaId}
                          label={area.area_name}
                          onDelete={viewMode ? undefined : () => handleRemoveArea(areaId)}
                          size="small"
                          sx={{
                            background: colorStyle.bg,
                            color: colorStyle.textColor,
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            height: 26,
                            "& .MuiChip-deleteIcon": {
                              color: `${colorStyle.textColor} !important`,
                              fontSize: 16,
                              "&:hover": {
                                opacity: 1,
                              },
                            },
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>
              )}

              {!viewMode && (
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                  <Autocomplete
                  sx={{ flex: 1 }}
                  options={unassignedAreas.filter((a) => !formData.area_ids.includes(a.id))}
                  getOptionLabel={(option) => option.area_name}
                  value={selectedArea}
                  onChange={(_, newValue) => setSelectedArea(newValue)}
                  disabled={loading || dataLoading}
                  size="small"
                  renderOption={(props, option) => (
                    <Box
                      component="li"
                      {...props}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        py: 1,
                        "&:hover": {
                          bgcolor: alpha("#2196F3", 0.08),
                        },
                      }}
                    >
                      <LocationOn sx={{ color: "info.main", fontSize: 18 }} />
                      <Box>
                        <Typography variant="body2" fontWeight={600} color="text.primary">
                          {option.area_name}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Area"
                      placeholder="Search and select areas..."
                      helperText={
                        unassignedAreas.filter((a) => !formData.area_ids.includes(a.id)).length > 0
                          ? `${unassignedAreas.filter((a) => !formData.area_ids.includes(a.id)).length} areas available`
                          : "No more areas available"
                      }
                      size="small"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <Map sx={{ ml: 1, mr: 0.5, color: "info.main", fontSize: 20 }} />
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "white",
                          "&:hover fieldset": { borderColor: "info.main" },
                          "&.Mui-focused fieldset": { borderColor: "info.main", borderWidth: 2 },
                        },
                      }}
                    />
                  )}
                />
                <Button
                  variant="contained"
                  size="medium"
                  onClick={handleAddArea}
                  disabled={!selectedArea || loading || dataLoading}
                  startIcon={<Add />}
                  sx={(theme) => ({
                    minWidth: 100,
                    height: 40,
                    fontWeight: 700,
                    background: theme.custom.gradients.blue,
                    boxShadow: `0 2px 8px ${alpha(theme.palette.info.main, 0.3)}`,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      background: `linear-gradient(90deg, ${theme.palette.info.dark} 0%, ${theme.palette.info.main} 100%)`,
                      boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.4)}`,
                      transform: "translateY(-1px)",
                    },
                    "&:disabled": {
                      background: theme.palette.action.disabledBackground,
                      color: theme.palette.action.disabled,
                    },
                  })}
                >
                  Add
                </Button>
              </Box>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={(theme) => ({
          px: 3,
          py: 1,
          borderTop: 1,
          borderColor: "divider",
          gap: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.02),
        })}
      >
        {viewMode ? (
          <Button
            onClick={handleClose}
            variant="contained"
            size="medium"
            fullWidth
            sx={(theme) => ({
              fontWeight: 600,
              px: 4,
            })}
          >
            Close
          </Button>
        ) : (
          <>
            <Button
              onClick={handleClose}
              disabled={loading}
              variant="outlined"
              size="medium"
              sx={(theme) => ({
                fontWeight: 600,
                px: 3,
                borderWidth: 1.5,
                borderColor: alpha(theme.palette.text.secondary, 0.3),
                color: "text.secondary",
                "&:hover": {
                  borderWidth: 1.5,
                  borderColor: alpha(theme.palette.text.secondary, 0.5),
                  bgcolor: alpha(theme.palette.text.secondary, 0.05),
                },
              })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || dataLoading}
              variant="contained"
              color="secondary"
              size="medium"
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Save />}
              sx={(theme) => ({
                fontWeight: 700,
                px: 4,
                backgroundColor: theme.palette.secondary.main,
                color: theme.palette.secondary.contrastText,
                boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.3)}`,
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: theme.palette.secondary.dark,
                  boxShadow: `0 6px 16px ${alpha(theme.palette.secondary.main, 0.4)}`,
                  transform: "translateY(-1px)",
                },
                "&:active": {
                  transform: "translateY(0px)",
                },
                "&.Mui-disabled": {
                  backgroundColor: alpha(theme.palette.secondary.main, 0.3),
                  color: alpha(theme.palette.secondary.contrastText, 0.5),
                },
              })}
            >
              {loading ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Route" : "Create Route")}
            </Button>
          </>
        )}
      </DialogActions>

      {/* Delivery Person Selection Dialog */}
      <Dialog
        open={deliveryPersonDialogOpen}
        onClose={() => setDeliveryPersonDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={(theme) => ({
            background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
            color: theme.palette.secondary.contrastText,
            py: 1,
            px: 2,
          })}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={(theme) => ({
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  bgcolor: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                })}
              >
                <Person sx={(theme) => ({ color: theme.palette.primary.contrastText, fontSize: 18 })} />
              </Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '0.95rem' }}>
                Select Delivery Person
              </Typography>
            </Box>
            <IconButton
              onClick={() => setDeliveryPersonDialogOpen(false)}
              size="small"
              sx={(theme) => ({
                color: theme.palette.secondary.contrastText,
                '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.15) },
              })}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {deliveryPersons.map((dp) => (
              <Box
                key={dp.id}
                onClick={() => {
                  setFormData((prev) => ({ ...prev, delivery_person_id: dp.id }));
                  setDeliveryPersonDialogOpen(false);
                }}
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: formData.delivery_person_id === dp.id ? "success.main" : "divider",
                  borderRadius: 1.5,
                  cursor: "pointer",
                  bgcolor: formData.delivery_person_id === dp.id ? alpha("#4CAF50", 0.08) : "transparent",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: "success.main",
                    bgcolor: alpha("#4CAF50", 0.05),
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Person sx={{ color: "success.main", fontSize: 28 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" fontWeight={600}>
                      {dp.person.full_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dp.assigned_routes_count} routes • {dp.total_consumers} consumers
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ mt: 8 }}
      >
        <Alert
          onClose={() => setSuccessMessage("")}
          severity="success"
          variant="filled"
          sx={{
            width: "100%",
            boxShadow: "0 8px 24px rgba(76, 175, 80, 0.3)",
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
