import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  People as ConsumersIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  LocalShipping as RouteIcon,
} from "@mui/icons-material";
import { consumersApi, routesApi } from "@/services/api";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { PageHeader } from "@/components/PageHeader";
import type { ConsumerListItem } from "@/types/consumers";
import type { Route } from "@/types/routes";

export default function RouteConsumers() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState<Route | null>(null);
  const [consumers, setConsumers] = useState<ConsumerListItem[]>([]);

  useEffect(() => {
    if (id) {
      fetchRouteAndConsumers();
    }
  }, [id]);

  const fetchRouteAndConsumers = async () => {
    try {
      setLoading(true);
      const [routeRes, consumersRes] = await Promise.all([
        routesApi.getById(Number(id)),
        consumersApi.getByRoute(Number(id))
      ]);

      setRoute(routeRes.data);

      // Extract consumers from paginated response or direct array
      const consumersData = consumersRes.data.results || consumersRes.data || [];
      setConsumers(consumersData);

    } catch (err: any) {
      console.error("Failed to fetch route details:", err);
      showSnackbar("Failed to load route details", "error");
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

  if (!route) {
    return (
      <Container maxWidth="xl" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h6">Route not found</Typography>
        <Button onClick={() => navigate("/routes")} sx={{ mt: 2 }}>
          Back to Routes
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.100", py: 4 }}>
      <Container maxWidth="lg" sx={{ px: 2 }}>
        <PageHeader
          title={`Route: ${route.area_code}`}
          description={route.area_code_description}
          actions={
            <Box sx={{ display: "flex", gap: 2 }}>
              <IconButton
                onClick={() => navigate("/routes")}
                sx={{ bgcolor: "background.paper" }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Box>
          }
        />

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 3, mb: 3 }}>
          <Card elevation={3} sx={{ bgcolor: "background.paper" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    bgcolor: "success.light",
                    p: 1.5,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ConsumersIcon color="success" fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {consumers.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Consumers
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Consumers assigned to this route
              </Typography>
            </CardContent>
          </Card>

          <Card elevation={3} sx={{ bgcolor: "background.paper" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    bgcolor: "info.light",
                    p: 1.5,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <RouteIcon color="info" fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {route.area_count || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Areas
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Number of areas in this route
              </Typography>
            </CardContent>
          </Card>

          <Card elevation={3} sx={{ bgcolor: "background.paper" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    bgcolor: "primary.light",
                    p: 1.5,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckIcon color="primary" fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {consumers.filter(c => c.is_kyc_done).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    KYC Completed
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Consumers with completed KYC
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Card elevation={3} sx={{ bgcolor: "background.paper" }}>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Consumers in Route {route.area_code}
              </Typography>
              {route.delivery_person_name && (
                <Chip
                  label={`Delivery: ${route.delivery_person_name}`}
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>

            {consumers.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <ConsumersIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No consumers found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No consumers are assigned to this route yet
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 700, color: '#333' }}>Consumer Number</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#333' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#333' }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#333' }}>Mobile</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#333' }}>KYC Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#333' }}>Opting Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#333' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {consumers.map((consumer, index) => (
                      <TableRow
                        key={consumer.id}
                        hover
                        sx={{
                          bgcolor: index % 2 === 0 ? '#fafafa' : 'white',
                          '&:hover': { bgcolor: '#f0f7ff' }
                        }}
                      >
                        <TableCell>
                          <Chip label={consumer.consumer_number} size="small" color="primary" variant="outlined" />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{consumer.consumer_name}</TableCell>
                        <TableCell>{consumer.category_name || '-'}</TableCell>
                        <TableCell>
                          {consumer.mobile_number ? (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <PhoneIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                              <Typography variant="body2">{consumer.mobile_number}</Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {consumer.is_kyc_done ? (
                            <Chip
                              icon={<CheckIcon />}
                              label="Done"
                              size="small"
                              color="success"
                              sx={{ fontWeight: 500 }}
                            />
                          ) : (
                            <Chip
                              icon={<CancelIcon />}
                              label="Pending"
                              size="small"
                              color="warning"
                              sx={{ fontWeight: 500 }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={consumer.opting_status_display || consumer.opting_status}
                            size="small"
                            color={
                              consumer.opting_status === 'OPT_IN' ? 'success' :
                              consumer.opting_status === 'OPT_OUT' ? 'error' : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            onClick={() => navigate(`/consumers/${consumer.id}`)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
