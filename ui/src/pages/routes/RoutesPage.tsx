import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
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
} from "@mui/material";
import {
  Add,
  Route as RouteIcon,
  SearchOff,
  Visibility,
  Edit,
  Delete,
} from "@mui/icons-material";
import { useRouteData } from "./hooks/useRouteData";
import { RouteStats } from "./components/RouteStats";
import { RouteFilters } from "./components/RouteFilters";
import { RouteCard } from "./components/RouteCard";
import type { SortField, SortDirection, AssignmentFilter } from "./types";

export default function RoutesPage() {
  const navigate = useNavigate();
  const { routes, stats, loading, error, refetch } = useRouteData();

  const [searchQuery, setSearchQuery] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState<AssignmentFilter>("all");
  const [sortField, setSortField] = useState<SortField>("area_code");
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);

  const filteredAndSortedRoutes = useMemo(() => {
    let filtered = routes.filter((route) => {
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
    if (selectedRouteId) navigate(`/routes/${selectedRouteId}`);
    handleActionClose();
  };

  const handleEdit = () => {
    if (selectedRouteId) navigate(`/routes/${selectedRouteId}/edit`);
    handleActionClose();
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
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate("/routes/create")}>
            Create Route
          </Button>
        </Box>
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
          onClick={() => navigate("/routes/create")}
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
        <MenuItem onClick={handleActionClose} sx={{ gap: 1.5, color: "error.main" }}>
          <Delete fontSize="small" />
          <Typography variant="body2">Delete</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
}
