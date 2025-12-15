import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Box, Typography, Button, Grid, Alert } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RouteIcon from "@mui/icons-material/Route";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import { useRouteData } from "./hooks/useRouteData";
import { RouteStats } from "./components/RouteStats";
import { RouteFilters } from "./components/RouteFilters";
import { RouteCard } from "./components/RouteCard";
import { RouteCardSkeleton } from "./components/RouteCardSkeleton";
import type { SortOption, AssignmentFilter } from "./types";

export default function RoutesPage() {
  const navigate = useNavigate();
  const { routes, stats, loading, error, refetch } = useRouteData();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState<AssignmentFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("area_code");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");


  // Filter and sort routes
  const filteredAndSortedRoutes = useMemo(() => {
    let filtered = routes.filter((route) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        route.area_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.area_code_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.delivery_person_name?.toLowerCase().includes(searchQuery.toLowerCase());

      // Assignment filter
      const matchesAssignment =
        assignmentFilter === "all" ||
        (assignmentFilter === "assigned" && route.delivery_person_name) ||
        (assignmentFilter === "unassigned" && !route.delivery_person_name);

      return matchesSearch && matchesAssignment;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "area_code":
          comparison = a.area_code.localeCompare(b.area_code);
          break;
        case "consumer_count":
          comparison = a.consumer_count - b.consumer_count;
          break;
        case "area_count":
          comparison = a.area_count - b.area_count;
          break;
        case "delivery_person":
          const aName = a.delivery_person_name || "zzz";
          const bName = b.delivery_person_name || "zzz";
          comparison = aName.localeCompare(bName);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [routes, searchQuery, assignmentFilter, sortBy, sortOrder]);

  const handleSortOrderToggle = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleAssignmentFilterChange = (value: AssignmentFilter) => {
    setAssignmentFilter(value);
  };

  // Empty state - no routes at all
  if (!loading && routes.length === 0) {
    return (
      <Box sx={{ height: "100%", overflow: "auto", p: 3 }}>
        <Typography variant="h4" fontWeight={700} mb={4}>
          Delivery Routes
        </Typography>

        <Box sx={{ textAlign: "center", py: 12 }}>
          <RouteIcon
            sx={{
              fontSize: 120,
              color: "text.disabled",
              opacity: 0.3,
            }}
          />
          <Typography variant="h5" color="text.secondary" sx={{ mt: 3 }}>
            No routes configured
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 1, mb: 3 }}>
            Create your first delivery route to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/routes/create")}
          >
            Create Route
          </Button>
        </Box>
      </Box>
    );
  }

  // Empty state - no search results
  const noSearchResults = !loading && filteredAndSortedRoutes.length === 0 && searchQuery;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", p: 3 }}>
      {/* Page Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Delivery Routes
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/routes/create")}
        >
          New Route
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => refetch()}>
          {error}
        </Alert>
      )}

      {/* Statistics Bar */}
      <RouteStats stats={stats} loading={loading} />

      {/* Filters */}
      <RouteFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderToggle={handleSortOrderToggle}
        assignmentFilter={assignmentFilter}
        onAssignmentFilterChange={handleAssignmentFilterChange}
        resultCount={filteredAndSortedRoutes.length}
      />
      {/* Scrollable Routes Area */}
      <Box sx={{ flex: 1, overflow: "auto", minHeight: 0 }}>

      {/* No Search Results */}
      {noSearchResults && (
        <Box sx={{ textAlign: "center", py: 12 }}>
          <SearchOffIcon sx={{ fontSize: 120, color: "text.disabled" }} />
          <Typography variant="h5" color="text.secondary" sx={{ mt: 3 }}>
            No routes match "{searchQuery}"
          </Typography>
          <Button onClick={() => setSearchQuery("")} sx={{ mt: 2 }}>
            Clear Search
          </Button>
        </Box>
      )}

      {/* Loading State */}
      {loading && (
        <Grid container spacing={3}>
          {[...Array(8)].map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <RouteCardSkeleton />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Route Cards */}
      {!loading && !noSearchResults && (
        <>
          <Grid container spacing={3}>
            {filteredAndSortedRoutes.map((route, index) => (
              <Grid key={route.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <RouteCard
                  route={route}
                  index={index}
                />
              </Grid>
            ))}
          </Grid>

        </>
      )}
      </Box>
    </Box>
  );
}
