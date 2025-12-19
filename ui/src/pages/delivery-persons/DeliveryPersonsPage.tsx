import { useState, useMemo } from "react";
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
  LocalShipping,
  SearchOff,
  Visibility,
  Edit,
  Delete,
  Warning,
} from "@mui/icons-material";
import { useDeliveryPersonData } from "./hooks/useDeliveryPersonData";
import { DeliveryPersonStats } from "./components/DeliveryPersonStats";
import { DeliveryPersonFilters } from "./components/DeliveryPersonFilters";
// import { DeliveryPersonCard } from "./components/DeliveryPersonCard";
import { DeliveryPersonCard } from "./components/DeliveryPersonCard2";
import DeliveryPersonDialog from "./components/DeliveryPersonDialog";
import axiosInstance from "../../api/axiosInstance";
import type { SortField, SortDirection, AssignmentFilter } from "./types";

export default function DeliveryPersonsPage() {
  const { deliveryPersons, stats, loading, error, refetch } = useDeliveryPersonData();

  const [searchQuery, setSearchQuery] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState<AssignmentFilter>("all");
  const [sortField, setSortField] = useState<SortField>("person_name");
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDeliveryPersonId, setSelectedDeliveryPersonId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedPerson, setSelectedPerson] = useState<any | null>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchPersonDetails = async (id: number) => {
    setLoadingDetails(true);
    try {
      const res = await axiosInstance.get(`/delivery-persons/${id}/`);
      setSelectedPerson(res.data);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCreate = () => {
    setSelectedPerson(null);
    setDialogMode('add');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedPerson(null);
  };

  const handleView = async () => {
    if (selectedDeliveryPersonId) {
      const success = await fetchPersonDetails(selectedDeliveryPersonId);
      if (success) {
        setDialogMode('view');
        setDialogOpen(true);
        handleActionClose();
      }
    }
  };

  const handleEdit = async () => {
    if (selectedDeliveryPersonId) {
      const success = await fetchPersonDetails(selectedDeliveryPersonId);
      if (success) {
        setDialogMode('edit');
        setDialogOpen(true);
        handleActionClose();
      }
    }
  };
  const filteredAndSortedDeliveryPersons = useMemo(() => {
    let filtered = deliveryPersons.filter((dp) => {
      const matchesSearch =
        searchQuery === "" ||
        dp.person.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dp.person.contacts?.[0]?.mobile_number?.includes(searchQuery);

      const matchesAssignment =
        assignmentFilter === "all" ||
        (assignmentFilter === "assigned" && dp.assigned_routes_count > 0) ||
        (assignmentFilter === "unassigned" && dp.assigned_routes_count === 0);

      return matchesSearch && matchesAssignment;
    });

    if (sortDirection) {
      filtered.sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
          case "person_name":
            comparison = a.person.full_name.localeCompare(b.person.full_name);
            break;
          case "assigned_routes_count":
            comparison = a.assigned_routes_count - b.assigned_routes_count;
            break;
          case "total_consumers":
            comparison = a.total_consumers - b.total_consumers;
            break;
        }
        return sortDirection === "desc" ? -comparison : comparison;
      });
    }

    return filtered;
  }, [deliveryPersons, searchQuery, assignmentFilter, sortField, sortDirection]);

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

  const handleActionClick = (event: React.MouseEvent<HTMLElement>, deliveryPersonId: number) => {
    event.stopPropagation();
    setSelectedDeliveryPersonId(deliveryPersonId);
    setActionAnchorEl(event.currentTarget);
  };

  const handleActionClose = () => {
    setActionAnchorEl(null);
    setSelectedDeliveryPersonId(null);
  };



  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    setActionAnchorEl(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDeliveryPersonId) return;

    setDeleteLoading(true);
    try {
      await axiosInstance.delete(`/delivery-persons/${selectedDeliveryPersonId}/`);
      refetch();
      setDeleteDialogOpen(false);
      setSelectedDeliveryPersonId(null);
    } catch (err: any) {
      console.error("Failed to delete delivery person:", err);
      alert(err.response?.data?.detail || "Failed to delete delivery person");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedDeliveryPersonId(null);
  };

  const handleCreateSuccess = () => {
    refetch();
  };

  if (!loading && deliveryPersons.length === 0) {
    return (
      <Box sx={{ p: 2, height: "calc(100vh - 90px)" }}>
        <Typography variant="h5" fontWeight={700} color="primary.main" mb={3}>
          Delivery Persons Management
        </Typography>
        <Box sx={{ textAlign: "center", py: 12 }}>
          <LocalShipping sx={{ fontSize: 120, color: "text.disabled", opacity: 0.3 }} />
          <Typography variant="h5" color="text.secondary" sx={{ mt: 3 }}>No delivery persons configured</Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 1, mb: 3 }}>
            Add your first delivery person to get started
          </Typography>
          <Button variant="contained" startIcon={<Add />}>
            Add Delivery Person
          </Button>
        </Box>
      </Box>
    );
  }

  const noSearchResults = !loading && filteredAndSortedDeliveryPersons.length === 0 && searchQuery;

  return (
    <Box sx={{ p: 2, height: "calc(100vh - 90px)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" fontWeight={700} color="primary.main">
          Delivery Persons Management
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<Add />}
          onClick={handleCreate} // Updated onClick
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
          New Delivery Person
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => refetch()}>
          {error}
        </Alert>
      )}

      <DeliveryPersonStats stats={stats} loading={loading} />

      <DeliveryPersonFilters
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
              No delivery persons match "{searchQuery}"
            </Typography>
            <Button onClick={() => setSearchQuery("")} sx={{ mt: 2 }}>Clear Search</Button>
          </Box>
        ) : (
          <Grid container spacing={2} sx={{ pt: 1 }}>
            {filteredAndSortedDeliveryPersons.map((dp) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={dp.id}>
                <DeliveryPersonCard deliveryPerson={dp} onActionClick={handleActionClick} />
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
          <Typography variant="body2">Edit Person</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteClick} sx={{ gap: 1.5, color: "error.main" }}>
          <Delete fontSize="small" />
          <Typography variant="body2">Delete</Typography>
        </MenuItem>
      </Menu>

      {/* Create/Edit/View Dialog */}
      <DeliveryPersonDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        mode={dialogMode}
        person={selectedPerson}
        onModeChange={(newMode) => setDialogMode(newMode)}
        onSuccess={() => {
          if (refetch) refetch(); // guard check
          handleCloseDialog();
        }} // closing bracket for onSuccess
      />
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, color: "error.main" }}>
          <Warning />
          <Typography variant="h6" fontWeight={700}>
            Delete Delivery Person
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this delivery person? This action cannot be undone.
            All route assignments and history will be removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleDeleteCancel} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={18} color="inherit" /> : <Delete />}
          >
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
