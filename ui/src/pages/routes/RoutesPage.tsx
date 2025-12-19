import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  Add,
  Route as RouteIcon,
  SearchOff,
  Visibility,
  Edit,
  Delete,
  Warning,
} from "@mui/icons-material";
import { useRouteData } from "./hooks/useRouteData";
import { RouteStats } from "./components/RouteStats";
import { RouteFilters } from "./components/RouteFilters";
import { RouteCard } from "./components/RouteCard";
import { CreateRouteDialog } from "./components/CreateRouteDialog";
import axiosInstance from "@/api/axiosInstance";
import type { SortField, SortDirection, AssignmentFilter } from "./types";

export default function RoutesPage() {
  const navigate = useNavigate();
  const { routes, stats, loading, error, refetch } = useRouteData();

  const [searchParams] = useSearchParams();
  const deliveryPersonId = searchParams.get("delivery_person");

  // Keep existing state
  const [searchQuery, setSearchQuery] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState<AssignmentFilter>("all");
  const [sortField, setSortField] = useState<SortField>("area_code");
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editRouteId, setEditRouteId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewMode, setViewMode] = useState(false);

  // If filtered by delivery person, show a chip or alert (optional, but good for UX)
  // For now, just filter

  const filteredAndSortedRoutes = useMemo(() => {
    let filtered = routes.filter((route) => {
      // 1. Delivery Person Filter (from URL)
      if (deliveryPersonId && route.delivery_person !== parseInt(deliveryPersonId)) {
        return false;
      }

      const matchesSearch =
        searchQuery === "" ||
        route.area_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.area_code_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.delivery_person_name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAssignment =
        assignmentFilter === "all" ||
        (assignmentFilter === "assigned" && route.delivery_person_name) ||
        (assignmentFilter === "unassigned" && !route.delivery_person_name);

      return matchesSearch && matchesAssignment;
    });

    if (sortDirection) {
      filtered.sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
          case "area_code":
            comparison = a.area_code.localeCompare(b.area_code);
            break;
          case "delivery_person_name":
            comparison = (a.delivery_person_name || "").localeCompare(b.delivery_person_name || "");
            break;
          case "consumer_count":
            comparison = a.consumer_count - b.consumer_count;
            break;
          case "area_count":
            comparison = a.area_count - b.area_count;
            break;
        }
        return sortDirection === "desc" ? -comparison : comparison;
      });
    }

    return filtered;
  }, [routes, searchQuery, assignmentFilter, sortField, sortDirection]);

  const handleSortClick = (field: SortField) => {
    if (sortField !== field) {
      setSortField(field);
      setSortDirection("asc");
    } else {
      if (sortDirection === null) setSortDirection("asc");
      else if (sortDirection === "asc") setSortDirection("desc");
      else setSortDirection(null);
    }
  };

  const handleActionClick = (event: React.MouseEvent<HTMLElement>, routeId: number) => {
    event.stopPropagation();
    setSelectedRouteId(routeId);
    setActionAnchorEl(event.currentTarget);
  };

  const handleActionClose = () => {
    setActionAnchorEl(null);
    setSelectedRouteId(null);
  };

  const handleView = () => {
    if (selectedRouteId) {
      setEditRouteId(selectedRouteId);
      setViewMode(true);
      setCreateDialogOpen(true);
    }
    handleActionClose();
  };

  const handleEdit = () => {
    if (selectedRouteId) {
      setEditRouteId(selectedRouteId);
      setViewMode(false);
      setCreateDialogOpen(true);
    }
    handleActionClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    setActionAnchorEl(null); // Just close the menu, keep selectedRouteId
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRouteId) return;

    setDeleteLoading(true);
    try {
      await axiosInstance.delete(`/routes/${selectedRouteId}/`);
      refetch();
      setDeleteDialogOpen(false);
      setSelectedRouteId(null);
    } catch (err: any) {
      console.error("Failed to delete route:", err);
      alert(err.response?.data?.detail || "Failed to delete route");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedRouteId(null);
  };

  const handleCreateSuccess = () => {
    refetch();
  };

  if (!loading && routes.length === 0) {
    return (
      <Box sx={{ p: 2, height: "calc(100vh - 90px)" }}>
        <Typography variant="h5" fontWeight={700} color="primary.main" mb={3}>
          Routes Management
        </Typography>
        <Box sx={{ textAlign: "center", py: 12 }}>
          <RouteIcon sx={{ fontSize: 120, color: "text.disabled", opacity: 0.3 }} />
          <Typography variant="h5" color="text.secondary" sx={{ mt: 3 }}>No routes configured</Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 1, mb: 3 }}>
            Create your first delivery route to get started
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => {
            setViewMode(false);
            setEditRouteId(null);
            setCreateDialogOpen(true);
          }}>
            Create Route
          </Button>
        </Box>
        <CreateRouteDialog
          open={createDialogOpen}
          onClose={() => {
            setCreateDialogOpen(false);
            setEditRouteId(null);
          }}
          onSuccess={handleCreateSuccess}
          editRouteId={editRouteId}
        />
      </Box>
    );
  }

  const noSearchResults = !loading && filteredAndSortedRoutes.length === 0 && searchQuery;

  return (
    <Box sx={{ p: 2, height: "calc(100vh - 90px)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" fontWeight={700} color="primary.main">
          Routes Management
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<Add />}
          onClick={() => {
            setViewMode(false);
            setEditRouteId(null);
            setCreateDialogOpen(true);
          }}
          sx={(theme) => ({
            fontWeight: 600,
            px: 3,
            bgcolor: theme.palette.secondary.main,
            backgroundImage: "none",
            "&:hover": {
              bgcolor: theme.palette.secondary.dark,
              backgroundImage: "none"
            }
          })}
        >
          New Route
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => refetch()}>
          {error}
        </Alert>
      )}

      <RouteStats stats={stats} loading={loading} />

      <RouteFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortClick={handleSortClick}
        assignmentFilter={assignmentFilter}
        onAssignmentFilterChange={setAssignmentFilter}
        stats={stats}
      />

      <Box sx={{ flex: 1, overflow: "auto" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <CircularProgress sx={{ color: "primary.main" }} />
          </Box>
        ) : noSearchResults ? (
          <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: 200 }}>
            <SearchOff sx={{ fontSize: 120, color: "text.disabled" }} />
            <Typography variant="h5" color="text.secondary" sx={{ mt: 3 }}>
              No routes match "{searchQuery}"
            </Typography>
            <Button onClick={() => setSearchQuery("")} sx={{ mt: 2 }}>Clear Search</Button>
          </Box>
        ) : (
          <Grid container spacing={2} sx={{ pt: 1 }}>
            {filteredAndSortedRoutes.map((route) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={route.id}>
                <RouteCard route={route} onActionClick={handleActionClick} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Menu
        anchorEl={actionAnchorEl}
        open={Boolean(actionAnchorEl)}
        onClose={handleActionClose}
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            boxShadow: "0 8px 24px rgba(0,51,102,0.15)",
            borderRadius: 2,
          },
        }}
      >
        <MenuItem onClick={handleView} sx={{ gap: 1.5 }}>
          <Visibility fontSize="small" sx={{ color: "primary.main" }} />
          <Typography variant="body2">View Details</Typography>
        </MenuItem>
        <MenuItem onClick={handleEdit} sx={{ gap: 1.5 }}>
          <Edit fontSize="small" sx={{ color: "warning.main" }} />
          <Typography variant="body2">Edit Route</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteClick} sx={{ gap: 1.5, color: "error.main" }}>
          <Delete fontSize="small" />
          <Typography variant="body2">Delete</Typography>
        </MenuItem>
      </Menu>
      <CreateRouteDialog
        open={createDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          setEditRouteId(null);
          setViewMode(false);
        }}
        onSuccess={handleCreateSuccess}
        editRouteId={editRouteId}
        viewMode={viewMode}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 1,
            px: 2,
          })}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={(theme) => ({
                width: 32,
                height: 32,
                borderRadius: 1,
                bgcolor: theme.palette.error.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              })}
            >
              <Warning sx={{ color: 'white', fontSize: 18 }} />
            </Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '0.95rem' }}>
              Delete Route
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <DialogContentText>
            Are you sure you want to delete this route? This action cannot be undone.
            All assigned areas will become unassigned.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1.5 }}>
          <Button
            onClick={handleDeleteCancel}
            disabled={deleteLoading}
            variant="outlined"
            sx={(theme) => ({
              borderRadius: 2,
              px: 3,
              borderColor: theme.palette.divider,
              color: theme.palette.text.secondary,
              '&:hover': {
                borderColor: theme.palette.text.secondary,
                bgcolor: 'transparent',
              },
            })}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={18} color="inherit" /> : <Delete />}
            sx={{
              borderRadius: 2,
              px: 3,
            }}
          >
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
