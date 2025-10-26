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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  LocalShipping as RouteIcon,
  People as ConsumersIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { deliveryPersonsApi, routeAssignmentsApi, routesApi } from "@/services/api";
import { DeliveryPerson, Route } from "@/types/routes";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { PageHeader } from "@/components/PageHeader";

export default function DeliveryPersonDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [person, setPerson] = useState<DeliveryPerson | null>(null);
  const [assignedRoutes, setAssignedRoutes] = useState<Route[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [availableRoutes, setAvailableRoutes] = useState<Route[]>([]);
  const [selectedRoutes, setSelectedRoutes] = useState<number[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPersonDetails();
    }
  }, [id]);

  const fetchPersonDetails = async () => {
    try {
      setLoading(true);
      const personRes = await deliveryPersonsApi.getById(Number(id));
      const personData = personRes.data;
      
      setPerson(personData);
      
      // Map assigned_routes to Route format for table display
      const mappedRoutes = personData.assigned_routes?.map((ar: any) => ({
        id: ar.route_id,
        area_code: ar.route_code,
        area_code_description: ar.route_description,
        area_count: ar.areas?.length || 0,
        consumer_count: ar.consumer_count,
        delivery_person_name: personData.name,
        areas: ar.areas?.map((areaName: string, index: number) => ({
          id: index,
          area_name: areaName,
          route: ar.route_id,
        })) || [],
      })) || [];
      
      setAssignedRoutes(mappedRoutes);
    } catch (err: any) {
      console.error("Failed to fetch person details:", err);
      showSnackbar("Failed to load delivery person details", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRoutes = async () => {
    try {
      const response = await routesApi.getAll();
      const allRoutes = Array.isArray(response.data?.results)
        ? response.data.results
        : [];
      const unassigned = allRoutes.filter((route) => !route.delivery_person_name);
      setAvailableRoutes(unassigned);
    } catch (err: any) {
      console.error("Failed to fetch available routes:", err);
      showSnackbar("Failed to load available routes", "error");
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deliveryPersonsApi.delete(Number(id));
      showSnackbar("Delivery person deleted successfully", "success");
      navigate("/delivery-persons");
    } catch (err: any) {
      console.error("Failed to delete delivery person:", err);
      showSnackbar(
        err.response?.data?.error || "Failed to delete delivery person",
        "error"
      );
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleOpenAssignDialog = () => {
    fetchAvailableRoutes();
    setAssignDialogOpen(true);
  };

  const handleAssignRoutes = async () => {
    if (selectedRoutes.length === 0) {
      showSnackbar("Please select at least one route", "warning");
      return;
    }

    try {
      setAssigning(true);
      await routeAssignmentsApi.bulkAssign(Number(id), selectedRoutes);
      showSnackbar(`${selectedRoutes.length} route(s) assigned successfully`, "success");
      setAssignDialogOpen(false);
      setSelectedRoutes([]);
      fetchPersonDetails();
    } catch (err: any) {
      console.error("Failed to assign routes:", err);
      showSnackbar("Failed to assign routes", "error");
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassignRoute = async (routeId: number) => {
    try {
      await routeAssignmentsApi.unassignRoute(routeId);
      showSnackbar("Route unassigned successfully", "success");
      fetchPersonDetails();
    } catch (err: any) {
      console.error("Failed to unassign route:", err);
      showSnackbar("Failed to unassign route", "error");
    }
  };

  const toggleRouteSelection = (routeId: number) => {
    setSelectedRoutes((prev) =>
      prev.includes(routeId)
        ? prev.filter((id) => id !== routeId)
        : [...prev, routeId]
    );
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 8, display: "flex", justifyContent: "center" }}>
        <CircularProgress size={48} />
      </Container>
    );
  }

  if (!person) {
    return (
      <Container maxWidth="xl" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h6">Delivery person not found</Typography>
        <Button onClick={() => navigate("/delivery-persons")} sx={{ mt: 2 }}>
          Back to List
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.100", py: 4 }}>
      <Container maxWidth="lg" sx={{ px: 2 }}>
        <PageHeader
          title={person.name}
          description={`Delivery Person ID: ${person.id}`}
          actions={
            <Box sx={{ display: "flex", gap: 2 }}>
              <IconButton
                onClick={() => navigate("/delivery-persons")}
                sx={{ bgcolor: "background.paper" }}
              >
                <ArrowBackIcon />
              </IconButton>
              <IconButton
                sx={{ bgcolor: "error.light", color: "error.main", '&:hover': { bgcolor: "error.main", color: "white" } }}
                onClick={() => setDeleteDialogOpen(true)}
              >
                <DeleteIcon />
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
                    {person.assigned_routes_count || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Assigned Routes
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Total routes assigned to this person
              </Typography>
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
                    {person.total_consumers || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Consumers
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Total consumers across all routes
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
                  <PersonIcon color="primary" fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {assignedRoutes.reduce((sum, route) => sum + route.area_count, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Areas
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Total delivery areas covered
              </Typography>
            </CardContent>
          </Card>
        </Box>

          <Card elevation={3} sx={{ bgcolor: "background.paper" }}>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Assigned Routes
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenAssignDialog}
                sx={{ bgcolor: "primary.main", color: "white" }}
              >
                Assign Routes
              </Button>
            </Box>

            {assignedRoutes.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <RouteIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No routes assigned yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Assign routes to this delivery person to get started
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenAssignDialog}
                  sx={{ bgcolor: "primary.main", color: "white" }}
                >
                  Assign Routes
                </Button>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Route ID</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Area Code</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Areas</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Consumers</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignedRoutes.map((route) => (
                      <TableRow key={route.id} hover>
                        <TableCell>#{route.id}</TableCell>
                        <TableCell>
                          <Chip label={route.area_code} size="small" />
                        </TableCell>
                        <TableCell>{route.area_code_description}</TableCell>
                        <TableCell>{route.area_count}</TableCell>
                        <TableCell>{route.consumer_count}</TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                              size="small"
                              onClick={() => navigate(`/routes/${route.id}`)}
                            >
                              View
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleUnassignRoute(route.id)}
                            >
                              Unassign
                            </Button>
                          </Box>
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

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Delivery Person</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{person.name}</strong>?
            {assignedRoutes.length > 0 && (
              <Typography color="error" sx={{ mt: 2 }}>
                Warning: This person has {assignedRoutes.length} assigned route(s). 
                You may need to unassign routes first.
              </Typography>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            color="error"
            onClick={handleDelete}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : null}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={assignDialogOpen} 
        onClose={() => setAssignDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Assign Routes to {person.name}</DialogTitle>
        <DialogContent>
          {availableRoutes.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="text.secondary">
                No unassigned routes available
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select routes to assign ({selectedRoutes.length} selected)
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {availableRoutes.map((route) => (
                  <Card
                    key={route.id}
                    elevation={0}
                    sx={{
                      cursor: "pointer",
                      bgcolor: selectedRoutes.includes(route.id)
                        ? "hsla(var(--primary), 0.15)"
                        : "background.paper",
                      border: "2px solid",
                      borderColor: selectedRoutes.includes(route.id)
                        ? "primary.main"
                        : "divider",
                      borderRadius: 2,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        borderColor: "primary.main",
                        boxShadow: "0 4px 12px rgba(212, 175, 55, 0.2)",
                      },
                    }}
                    onClick={() => toggleRouteSelection(route.id)}
                  >
                    <CardContent sx={{ py: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            #{route.id} - {route.area_code}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {route.area_code_description}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 2 }}>
                          <Chip label={`${route.area_count} areas`} size="small" />
                          <Chip label={`${route.consumer_count} consumers`} size="small" />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)} disabled={assigning}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAssignRoutes}
            disabled={assigning || selectedRoutes.length === 0}
            startIcon={assigning ? <CircularProgress size={20} /> : null}
            sx={{ bgcolor: "primary.main", color: "white" }}
          >
            {assigning ? "Assigning..." : `Assign ${selectedRoutes.length} Route(s)`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
