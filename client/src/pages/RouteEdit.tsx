import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  Chip,
  Autocomplete,
  Divider,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { routesApi, areasApi } from "@/services/api";
import { Route, Area } from "@/types/routes";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { PageHeader } from "@/components/PageHeader";

const routeSchema = z.object({
  area_code: z.string().trim().min(1, "Area code is required").max(50, "Area code must be less than 50 characters"),
  area_code_description: z.string().trim().min(1, "Description is required").max(200, "Description must be less than 200 characters"),
  delivery_person_name: z.string().trim().max(100, "Name must be less than 100 characters").optional().nullable(),
});

type RouteFormData = z.infer<typeof routeSchema>;

export default function RouteEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [route, setRoute] = useState<Route | null>(null);
  const [assignedAreas, setAssignedAreas] = useState<Area[]>([]);
  const [availableAreas, setAvailableAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [areasLoading, setAreasLoading] = useState(false);
  const { showSnackbar } = useSnackbar();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RouteFormData>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      area_code: "",
      area_code_description: "",
      delivery_person_name: "",
    },
  });

  useEffect(() => {
    if (id) {
      fetchRoute(parseInt(id));
      fetchAreas();
    }
  }, [id]);

  const fetchRoute = async (routeId: number) => {
    try {
      setLoading(true);
      const response = await routesApi.getById(routeId);
      const route: Route = response.data;
      setRoute(route);
      setAssignedAreas(route.areas || []);
      reset({
        area_code: route.area_code,
        area_code_description: route.area_code_description,
        delivery_person_name: route.delivery_person_name || "",
      });
    } catch (err: any) {
      console.error("Failed to fetch route:", err);
      showSnackbar(err.message || "Failed to fetch route details", "error");
      navigate("/routes");
    } finally {
      setLoading(false);
    }
  };

  const fetchAreas = async () => {
    try {
      setAreasLoading(true);
      const response = await areasApi.getAvailable();
      const data = Array.isArray(response.data?.results) 
        ? response.data.results 
        : Array.isArray(response.data) 
        ? response.data 
        : [];
      setAvailableAreas(data);
    } catch (err: any) {
      console.error("Failed to fetch available areas:", err);
      setAvailableAreas([]);
    } finally {
      setAreasLoading(false);
    }
  };

  const handleAddArea = async () => {
    if (!selectedArea || !id) return;

    try {
      setSaving(true);
      await areasApi.assignToRoute(selectedArea.id, parseInt(id));
      
      setAssignedAreas([...assignedAreas, selectedArea]);
      setAvailableAreas(availableAreas.filter(a => a.id !== selectedArea.id));
      setSelectedArea(null);
      
      showSnackbar("Area added successfully", "success");
    } catch (err: any) {
      console.error("Failed to add area:", err);
      showSnackbar(err.message || "Failed to add area", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveArea = async (area: Area) => {
    try {
      setSaving(true);
      await areasApi.removeFromRoute(area.id);
      
      setAssignedAreas(assignedAreas.filter(a => a.id !== area.id));
      setAvailableAreas([...availableAreas, area]);
      
      showSnackbar("Area removed successfully", "success");
    } catch (err: any) {
      console.error("Failed to remove area:", err);
      showSnackbar(err.message || "Failed to remove area", "error");
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = async (data: RouteFormData) => {
    if (!id) return;

    try {
      setSaving(true);
      await routesApi.update(parseInt(id), {
        ...data,
        delivery_person_name: data.delivery_person_name || null,
      });
      
      showSnackbar("Route updated successfully", "success");
      
      navigate(`/routes/${id}`);
    } catch (err: any) {
      console.error("Failed to update route:", err);
      showSnackbar(err.message || "Failed to update route", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "grey.100", py: 8 }}>
        <Container maxWidth="xl" sx={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress size={48} />
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "hsl(var(--background))", py: 4 }}>
      <Container maxWidth={false} sx={{ width: "80%", mx: "auto" }}>
        <PageHeader
          title="Edit Route"
          description="Update route information"
          actions={
            <IconButton onClick={() => navigate(`/routes/${id}`)} sx={{ bgcolor: "background.paper" }}>
              <BackIcon />
            </IconButton>
          }
        />

        <Card 
          elevation={3} 
          sx={{ 
            background: "linear-gradient(145deg, hsl(var(--card)) 0%, hsla(var(--card-gradient-end), 0.03) 100%)",
            border: "1px solid hsla(var(--primary), 0.15)",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ display: "grid", gap: 3.5 }}>
                <Controller
                  name="area_code"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Area Code"
                      fullWidth
                      error={!!errors.area_code}
                      helperText={errors.area_code?.message}
                      disabled={saving}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          fontSize: "1rem",
                          fontWeight: 500,
                          "&:hover fieldset": {
                            borderColor: "hsla(var(--primary), 0.5)",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "hsl(var(--primary))",
                          },
                        },
                      }}
                    />
                  )}
                />

                <Controller
                  name="area_code_description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description"
                      fullWidth
                      multiline
                      rows={3}
                      error={!!errors.area_code_description}
                      helperText={errors.area_code_description?.message}
                      disabled={saving}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          fontSize: "1rem",
                          fontWeight: 500,
                          "&:hover fieldset": {
                            borderColor: "hsla(var(--primary), 0.5)",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "hsl(var(--primary))",
                          },
                        },
                      }}
                    />
                  )}
                />

                <Controller
                  name="delivery_person_name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={field.value || ""}
                      label="Delivery Person Name"
                      fullWidth
                      error={!!errors.delivery_person_name}
                      helperText={errors.delivery_person_name?.message || "Leave empty if unassigned"}
                      disabled={saving}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          fontSize: "1rem",
                          fontWeight: 500,
                          "&:hover fieldset": {
                            borderColor: "hsla(var(--primary), 0.5)",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "hsl(var(--primary))",
                          },
                        },
                      }}
                    />
                  )}
                />

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2.5, fontSize: "1.125rem" }}>
                  Manage Areas
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 500 }}>
                    Assigned Areas ({assignedAreas.length})
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                    {assignedAreas.length > 0 ? (
                      assignedAreas.map((area) => {
                        return (
                          <Chip
                            key={area.id}
                            label={area.area_name}
                            onDelete={() => handleRemoveArea(area)}
                            deleteIcon={<DeleteIcon />}
                            disabled={saving}
                            sx={{
                              bgcolor: "hsla(var(--primary), 0.1)",
                              color: "hsl(var(--primary))",
                              borderColor: "hsla(var(--primary), 0.3)",
                              border: "1px solid",
                              fontWeight: 500,
                              fontSize: "0.875rem",
                            }}
                          />
                        );
                      })
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        No areas assigned
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 500 }}>
                    Add Area
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Autocomplete
                      options={availableAreas}
                      getOptionLabel={(option) => option.area_name}
                      value={selectedArea}
                      onChange={(_, newValue) => setSelectedArea(newValue)}
                      loading={areasLoading}
                      disabled={saving}
                      sx={{ flex: 1 }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select an area to add"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              fontSize: "1rem",
                              fontWeight: 500,
                              "&:hover fieldset": {
                                borderColor: "hsla(var(--primary), 0.5)",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "hsl(var(--primary))",
                              },
                            },
                          }}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {areasLoading ? <CircularProgress size={20} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddArea}
                      disabled={!selectedArea || saving}
                      sx={{
                        px: 3.5,
                        py: 1.25,
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        bgcolor: "hsl(var(--primary))",
                        "&:hover": {
                          bgcolor: "hsl(var(--primary-dark))",
                        },
                      }}
                    >
                      Add
                    </Button>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 2.5, justifyContent: "flex-end", mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/routes/${id}`)}
                    disabled={saving}
                    sx={{
                      px: 3.5,
                      py: 1.25,
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      borderColor: "hsla(var(--primary), 0.4)",
                      color: "hsl(var(--primary))",
                      "&:hover": {
                        borderColor: "hsl(var(--primary))",
                        bgcolor: "hsla(var(--primary), 0.05)",
                      },
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    disabled={saving}
                    sx={{
                      px: 4,
                      py: 1.25,
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      bgcolor: "hsl(var(--primary))",
                      "&:hover": {
                        bgcolor: "hsl(var(--primary-dark))",
                      },
                    }}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </Box>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
