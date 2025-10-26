import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Chip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { routesApi } from "@/services/api";
import { Route } from "@/types/routes";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { PageHeader } from "@/components/PageHeader";

interface RouteHistoryItem extends Route {
  action?: 'created' | 'updated' | 'deleted';
  timestamp?: string;
}

export default function RouteHistory() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [historyItems, setHistoryItems] = useState<RouteHistoryItem[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await routesApi.getAll();
      const routes = Array.isArray(response.data?.results)
        ? response.data.results
        : [];

      // Sort by ID (most recent first) and mark as created
      const sortedRoutes = routes
        .sort((a, b) => b.id - a.id)
        .map(route => ({
          ...route,
          action: 'created' as const,
        }));

      setHistoryItems(sortedRoutes);
    } catch (err: any) {
      console.error("Failed to fetch history:", err);
      showSnackbar("Failed to load route history", "error");
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'success';
      case 'updated':
        return 'info';
      case 'deleted':
        return 'error';
      default:
        return 'default';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <AddIcon fontSize="small" />;
      case 'updated':
        return <EditIcon fontSize="small" />;
      case 'deleted':
        return <DeleteIcon fontSize="small" />;
      default:
        return <ScheduleIcon fontSize="small" />;
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
      <Container maxWidth="xl" sx={{ px: 2 }}>
        <PageHeader
          title="Route History"
          description="Track all route activities and changes"
          actions={
            <IconButton onClick={() => navigate("/routes")} sx={{ bgcolor: "background.paper" }}>
              <ArrowBackIcon />
            </IconButton>
          }
        />

        {historyItems.length === 0 ? (
          <Card elevation={3} sx={{ bgcolor: "background.paper" }}>
            <CardContent>
              <Box sx={{ textAlign: "center", py: 8 }}>
                <ScheduleIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No history available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Route activities will appear here
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {historyItems.map((item, index) => (
              <Card
                key={`${item.id}-${index}`}
                elevation={3}
                sx={{
                  bgcolor: "background.paper",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                        <Chip
                          icon={getActionIcon(item.action || 'created')}
                          label={item.action || 'created'}
                          color={getActionColor(item.action || 'created')}
                          size="small"
                        />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {item.area_code} - {item.area_code_description}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 4, mt: 2 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Route ID
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            #{item.id}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Areas
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.area_count}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Consumers
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.consumer_count}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Delivery Person
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.delivery_person_name || "Unassigned"}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <IconButton
                      color="primary"
                      onClick={() => navigate(`/routes/${item.id}`)}
                      sx={{ ml: 2 }}
                    >
                      <ArrowBackIcon sx={{ transform: "rotate(180deg)" }} />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}
