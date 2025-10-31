import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { areasApi, routesApi } from '@/services/api';
import { Route } from '@/types/routes';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  LocationOn as MapPinIcon,
  Route as RouteIcon,
} from '@mui/icons-material';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { PageHeader } from '@/components/PageHeader';

const areaSchema = z.object({
  area_name: z.string().min(1, 'Area name is required'),
  route: z.coerce.number().nullable().optional(),
});

type AreaFormData = z.infer<typeof areaSchema>;

const RouteAreaCreate = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AreaFormData>({
    resolver: zodResolver(areaSchema),
    defaultValues: {
      area_name: '',
      route: null,
    },
  });

  const selectedRoute = watch('route');

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoadingRoutes(true);
      const response = await routesApi.getAll();
      const routesData = Array.isArray(response.data?.results)
        ? response.data.results
        : Array.isArray(response.data)
          ? response.data
          : [];
      setRoutes(routesData);
    } catch (error) {
      console.error('Error fetching routes:', error);
      showSnackbar('Failed to fetch routes', 'error');
    } finally {
      setLoadingRoutes(false);
    }
  };

  const onSubmit = async (data: AreaFormData) => {
    try {
      setLoading(true);
      
      const payload = {
        area_name: data.area_name,
        route: data.route || null,
      };

      await areasApi.create(payload);

      showSnackbar('Route area created successfully', 'success');

      navigate('/route-areas');
    } catch (error: any) {
      console.error('Error creating area:', error);
      showSnackbar(error.response?.data?.message || 'Failed to create route area', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loadingRoutes) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'hsl(var(--background))', py: 4 }}>
      <Container maxWidth={false} sx={{ width: "80%", mx: "auto" }}>
        <PageHeader title="Create Route Area" />

        <Card 
          elevation={3}
          sx={{
            background: "linear-gradient(145deg, hsl(var(--card)) 0%, hsla(var(--card-gradient-end), 0.03) 100%)",
            border: "1px solid hsla(var(--primary), 0.15)",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 2.5, borderBottom: 1, borderColor: 'hsla(var(--primary), 0.2)' }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: 'hsla(var(--primary), 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MapPinIcon sx={{ color: 'hsl(var(--primary))', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.125rem' }}>
                    Area Information
                  </Typography>
                </Box>

                <TextField
                  label="Area Name"
                  {...register('area_name')}
                  error={!!errors.area_name}
                  helperText={errors.area_name?.message}
                  fullWidth
                  required
                  placeholder="e.g., Downtown District"
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
                    startAdornment: (
                      <MapPinIcon sx={{ mr: 1, color: 'hsla(var(--primary), 0.7)' }} />
                    ),
                  }}
                />

                <FormControl 
                  fullWidth 
                  error={!!errors.route}
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
                >
                  <InputLabel>Assign to Route (Optional)</InputLabel>
                  <Select
                    value={selectedRoute?.toString() || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setValue('route', value ? parseInt(value) : null);
                    }}
                    label="Assign to Route (Optional)"
                    startAdornment={<RouteIcon sx={{ mr: 1, color: 'hsla(var(--primary), 0.7)' }} />}
                  >
                    <MenuItem value="">
                      <em>No route assigned</em>
                    </MenuItem>
                    {routes.map((route) => (
                      <MenuItem key={route.id} value={route.id.toString()}>
                        {route.area_code} - {route.area_code_description}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.route && (
                    <FormHelperText>{errors.route.message}</FormHelperText>
                  )}
                </FormControl>

                <Box sx={{ display: 'flex', gap: 2.5, justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/route-areas')}
                    disabled={loading}
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
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
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
                    {loading ? 'Creating...' : 'Create Area'}
                  </Button>
                </Box>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default RouteAreaCreate;
