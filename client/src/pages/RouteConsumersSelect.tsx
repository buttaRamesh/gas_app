import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
} from "@mui/material";
import {
  Search as SearchIcon,
  People as ConsumersIcon,
  LocalShipping as RouteIcon,
} from "@mui/icons-material";
import { routesApi } from "@/services/api";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { PageHeader } from "@/components/PageHeader";
import type { Route } from "@/types/routes";

export default function RouteConsumersSelect() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);

  useEffect(() => {
    fetchRoutes();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRoutes(routes);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = routes.filter(
      (route) =>
        route.area_code.toLowerCase().includes(query) ||
        route.area_code_description.toLowerCase().includes(query)
    );
    setFilteredRoutes(filtered);
  }, [searchQuery, routes]);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await routesApi.getAll();
      const data = Array.isArray(response.data?.results) ? response.data.results : [];
      setRoutes(data);
      setFilteredRoutes(data);
    } catch (err: any) {
      console.error("Failed to fetch routes:", err);
      showSnackbar("Failed to load routes", "error");
    } finally {
      setLoading(false);
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
        <PageHeader
          title="View Consumers by Route"
          description="Select a route to view all assigned consumers"
        />

        <Card elevation={3} sx={{ mb: 3 }}>
          <CardContent>
            <TextField
              fullWidth
              placeholder="Search routes by code or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {filteredRoutes.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <RouteIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  {searchQuery ? "No routes found" : "No routes available"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchQuery ? "Try a different search term" : "Create routes first"}
                </Typography>
              </Box>
            ) : (
              <List>
                {filteredRoutes.map((route) => (
                  <ListItem key={route.id} disablePadding sx={{ mb: 1 }}>
                    <ListItemButton
                      onClick={() => navigate(`/routes/${route.id}/consumers`)}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        "&:hover": {
                          borderColor: "primary.main",
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", width: "100%", gap: 2 }}>
                        <RouteIcon color="primary" />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {route.area_code}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {route.area_code_description}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Chip
                            icon={<ConsumersIcon />}
                            label={`${route.consumer_count || 0} consumers`}
                            size="small"
                            color="success"
                          />
                          {route.delivery_person_name && (
                            <Chip
                              label={route.delivery_person_name}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
