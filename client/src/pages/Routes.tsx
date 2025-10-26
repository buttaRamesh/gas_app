import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Typography,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonOutline as PersonIcon,
  LocationOn as LocationIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import { routesApi } from "@/services/api";
import { Route } from "@/types/routes";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { PageHeader } from "@/components/PageHeader";

export default function Routes() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    fetchRoutes();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRoutes(routes);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = routes.filter(
        (route) =>
          route.area_code.toLowerCase().includes(query) ||
          route.area_code_description.toLowerCase().includes(query) ||
          route.delivery_person_name?.toLowerCase().includes(query),
      );
      setFilteredRoutes(filtered);
    }
  }, [searchQuery, routes]);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await routesApi.getAll();
      const data = Array.isArray(response.data?.results) ? response.data.results : [];
      console.log("routes");
      console.log(data);
      setRoutes(data);
      setFilteredRoutes(data);
    } catch (err: any) {
      console.error("Failed to fetch routes:", err);
      setRoutes([]);
      setFilteredRoutes([]);
      showSnackbar(err.message || "Failed to fetch routes", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (route: Route, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete route "${route.area_code}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await routesApi.delete(route.id);
      showSnackbar("Route deleted successfully", "success");
      fetchRoutes();
    } catch (err: any) {
      console.error("Failed to delete route:", err);
      showSnackbar(err.response?.data?.message || "Failed to delete route", "error");
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'hsl(var(--background))', py: 4 }}>
    <Container maxWidth="xl" sx={{ px: 2 }}>
      <PageHeader
        title="Delivery Routes"
        showSearch
        searchValue={searchQuery}
        searchPlaceholder="Search routes..."
        onSearchChange={setSearchQuery}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 3,
        }}
      >
        {filteredRoutes.map((route) => (
          <Card
            key={route.id}
            elevation={2}
            sx={{
              height: "100%",
              bgcolor: "grey.100",
              borderRadius: 3,
              overflow: "hidden",
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              border: "2px solid",
              borderColor: "hsla(var(--primary), 0.3)",
              "&:hover": {
                transform: "translateY(-8px)",
                boxShadow: "0 12px 32px -10px rgba(0, 0, 0, 0.15)",
                borderColor: "primary.main",
                bgcolor: "grey.200",
              },
            }}
            onClick={() => navigate(`/routes/${route.id}`)}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2.5 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="overline" 
                    sx={{ 
                      color: "hsl(var(--primary))", 
                      fontWeight: 700,
                      fontSize: "0.7rem",
                      letterSpacing: 1,
                    }}
                  >
                    {route.area_code}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600, 
                      color: "text.primary",
                      fontSize: "1rem",
                      mt: 0.5,
                      lineHeight: 1.3,
                    }}
                  >
                    {route.area_code_description}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 0.5, ml: 1 }}>
                  <IconButton 
                    size="small" 
                    color="primary" 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/routes/${route.id}`);
                    }}
                    sx={{
                      transition: "all 0.2s",
                      "&:hover": {
                        transform: "scale(1.1)",
                        bgcolor: "primary.light",
                      }
                    }}
                  >
                    <ViewIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="secondary" 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/routes/${route.id}/edit`);
                    }}
                    sx={{
                      transition: "all 0.2s",
                      "&:hover": {
                        transform: "scale(1.1)",
                        bgcolor: "secondary.light",
                      }
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={(e) => handleDelete(route, e)}
                    sx={{
                      transition: "all 0.2s",
                      "&:hover": {
                        transform: "scale(1.1)",
                        bgcolor: "error.light",
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              <Box sx={{ display: "flex", gap: 1.5, mb: 2.5 }}>
                <Box 
                  sx={{ 
                    flex: 1, 
                    textAlign: "center", 
                    p: 2, 
                    bgcolor: "info.main", 
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "info.dark",
                  }}
                >
                  <LocationIcon sx={{ mb: 0.5, color: "white" }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "white" }}>
                    {route.area_count}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "white", fontWeight: 500, opacity: 0.9 }}>
                    Areas
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    flex: 1, 
                    textAlign: "center", 
                    p: 2, 
                    bgcolor: "success.main", 
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "success.dark",
                  }}
                >
                  <GroupIcon sx={{ mb: 0.5, color: "white" }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "white" }}>
                    {route.consumer_count}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "white", fontWeight: 500, opacity: 0.9 }}>
                    Consumers
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  bgcolor: route.delivery_person_name ? "primary.light" : "warning.light",
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: route.delivery_person_name ? "primary.main" : "warning.main",
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    bgcolor: route.delivery_person_name ? "primary.main" : "warning.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PersonIcon sx={{ fontSize: 18, color: "white" }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", fontSize: "0.65rem" }}>
                    Delivery Person
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                    {route.delivery_person_name || "Unassigned"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {filteredRoutes.length === 0 && (
        <Box sx={{ textAlign: "center", py: 16 }}>
          <Typography variant="h6" color="text.secondary">
            No routes found
          </Typography>
        </Box>
      )}
    </Container>
    </Box>
  );
}
