import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import {
  Person as PersonIcon,
  LocalShipping as RouteIcon,
  Group as ConsumersIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import { deliveryPersonsApi } from "@/services/api";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { PageHeader } from "@/components/PageHeader";

interface PersonStatistics {
  id: number;
  name: string;
  route_count: number;
  consumer_count: number;
  area_count: number;
  workload_percentage: number;
}

export default function DeliveryPersonStatistics() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<PersonStatistics[]>([]);
  const [totalStats, setTotalStats] = useState({
    total_persons: 0,
    total_routes: 0,
    total_consumers: 0,
    unassigned_persons: 0,
  });

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await deliveryPersonsApi.getStatistics();
      const data = response.data;
      
      setStatistics(data.person_statistics || []);
      setTotalStats({
        total_persons: data.total_persons || 0,
        total_routes: data.total_routes || 0,
        total_consumers: data.total_consumers || 0,
        unassigned_persons: data.unassigned_persons || 0,
      });
    } catch (err: any) {
      console.error("Failed to fetch statistics:", err);
      showSnackbar("Failed to load statistics", "error");
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
    <Box sx={{ minHeight: "100vh", bgcolor: "hsl(var(--background))", py: 4 }}>
      <Container maxWidth="xl" sx={{ px: 2 }}>
        <PageHeader title="Delivery Person Statistics" />

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 3, mb: 4 }}>
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
                  <PersonIcon color="primary" fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {totalStats.total_persons}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Persons
                  </Typography>
                </Box>
              </Box>
              {totalStats.unassigned_persons > 0 && (
                <Chip 
                  label={`${totalStats.unassigned_persons} Unassigned`} 
                  size="small" 
                  color="warning"
                  sx={{ mt: 1 }}
                />
              )}
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
                    {totalStats.total_routes}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Routes
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

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
                    {totalStats.total_consumers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Consumers
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card elevation={3} sx={{ bgcolor: "background.paper" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    bgcolor: "secondary.light",
                    p: 1.5,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TrendingUpIcon color="secondary" fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {totalStats.total_persons > 0 
                      ? (totalStats.total_routes / totalStats.total_persons).toFixed(1)
                      : "0"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Routes/Person
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Card elevation={3} sx={{ bgcolor: "background.paper" }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Workload Distribution
            </Typography>

            {statistics.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <PersonIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No delivery persons found
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">Routes</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">Areas</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">Consumers</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">Workload</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statistics.map((person) => (
                      <TableRow 
                        key={person.id} 
                        hover
                        sx={{ 
                          cursor: "pointer",
                          "&:hover": {
                            bgcolor: "action.hover",
                          }
                        }}
                        onClick={() => navigate(`/delivery-persons/${person.id}`)}
                      >
                        <TableCell>#{person.id}</TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 500 }}>{person.name}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={person.route_count} 
                            size="small" 
                            color="info"
                          />
                        </TableCell>
                        <TableCell align="center">{person.area_count}</TableCell>
                        <TableCell align="center">{person.consumer_count}</TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={`${person.workload_percentage}%`}
                            size="small"
                            color={
                              person.workload_percentage > 40 ? "error" :
                              person.workload_percentage > 25 ? "warning" :
                              "success"
                            }
                            sx={{ fontWeight: 600 }}
                          />
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
