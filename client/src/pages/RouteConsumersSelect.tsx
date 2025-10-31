import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Autocomplete,
  TextField,
} from "@mui/material";
import { routesApi } from "@/services/api";
import { useSnackbar } from "@/contexts/SnackbarContext";
import type { Route } from "@/types/routes";

export default function RouteConsumersSelect() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState<Route[]>([]);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await routesApi.getAll();
      const data = Array.isArray(response.data?.results) ? response.data.results : [];
      setRoutes(data);
    } catch (err: any) {
      console.error("Failed to fetch routes:", err);
      showSnackbar("Failed to load routes", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRouteSelect = (route: Route | null) => {
    if (route) {
      navigate(`/routes/${route.id}/consumers`);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 8, display: "flex", justifyContent: "center" }}>
        <CircularProgress size={48} />
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.100", py: 4 }}>
      <Container maxWidth="md" sx={{ px: 2 }}>
        <Card elevation={3}>
          <CardContent>
            <Autocomplete
              options={routes}
              getOptionLabel={(option) => option.area_code}
              onChange={(_, value) => handleRouteSelect(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Route"
                  placeholder="Search by area code..."
                  variant="outlined"
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props} key={option.id}>
                  <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                    <Box sx={{ fontWeight: 600 }}>{option.area_code}</Box>
                    <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                      {option.area_code_description} • {option.consumer_count || 0} consumers
                    </Box>
                  </Box>
                </Box>
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText="No routes found"
            />
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
