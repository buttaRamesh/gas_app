import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Divider,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  alpha,
} from "@mui/material";
import {
  Search,
  Map,
  People,
  LocalShipping,
  Route,
  Edit,
  Visibility,
  Delete,
  MoreVert,
  TrendingUp,
  Assignment,
  CheckCircle,
  Cancel,
  Add,
  ArrowUpward,
  ArrowDownward,
  SwapVert,
  LocationOn,
  Person,
  Groups,
} from "@mui/icons-material";
import { routesApi, RouteItem } from "@/api/routes";
import { useDebounce } from "@/hooks/useDebounce";

type FilterTab = "all" | "assigned" | "unassigned";
type SortField = "area_code" | "delivery_person_name" | "consumer_count" | "area_count";
type SortDirection = "asc" | "desc" | null;

interface SortState {
  field: SortField;
  direction: SortDirection;
}

const RouteList = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [sortState, setSortState] = useState<SortState>({ field: "area_code", direction: null });
  const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  
  const debouncedSearch = useDebounce(searchValue, 400);
  const pageSize = 200;

  const { data, isLoading, error } = useQuery({
    queryKey: ["routes", pageSize, debouncedSearch],
    queryFn: async () => {
      return routesApi.getAll({
        page: 1,
        page_size: pageSize,
        search: debouncedSearch || undefined,
      });
    },
  });

  // Filter and sort routes
  const filteredAndSortedRoutes = useMemo(() => {
    if (!data?.results) return [];
    
    let filtered = [...data.results];
    
    // Apply tab filter
    if (activeTab === "assigned") {
      filtered = filtered.filter((r) => r.delivery_person_name !== null);
    } else if (activeTab === "unassigned") {
      filtered = filtered.filter((r) => r.delivery_person_name === null);
    }
    
    // Apply sorting only if direction is set
    if (sortState.direction) {
      filtered.sort((a, b) => {
        let comparison = 0;
        switch (sortState.field) {
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
        return sortState.direction === "desc" ? -comparison : comparison;
      });
    }
    
    return filtered;
  }, [data?.results, activeTab, sortState]);

  const stats = data?.statistics;

  const handleConsumersClick = (e: React.MouseEvent, routeId: number) => {
    e.stopPropagation();
    navigate(`/consumers?route=${routeId}`);
  };

  const handleAreasClick = (e: React.MouseEvent, routeId: number) => {
    e.stopPropagation();
    navigate(`/areas?route=${routeId}`);
  };

  const handleSortClick = (field: SortField) => {
    setSortState((prev) => {
      if (prev.field !== field) {
        return { field, direction: "asc" };
      }
      // Cycle: null -> asc -> desc -> null
      if (prev.direction === null) return { field, direction: "asc" };
      if (prev.direction === "asc") return { field, direction: "desc" };
      return { field, direction: null };
    });
  };

  const getSortIcon = (field: SortField) => {
    if (sortState.field !== field || sortState.direction === null) {
      return <SwapVert sx={{ fontSize: 16 }} />;
    }
    return sortState.direction === "asc" 
      ? <ArrowUpward sx={{ fontSize: 16 }} /> 
      : <ArrowDownward sx={{ fontSize: 16 }} />;
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

  return (
    <Box sx={{ p: 2, height: "calc(100vh - 90px)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header with New Button */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" fontWeight={700} color="primary.main">
          Routes Management
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<Add />}
          sx={{ 
            fontWeight: 600,
            px: 3,
            boxShadow: "0 4px 12px rgba(255, 204, 0, 0.4)",
          }}
        >
          New Route
        </Button>
      </Box>

      {/* Stats Panel */}
      {stats && (
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <Card sx={{ 
                background: "linear-gradient(135deg, #003366 0%, #1a5a8a 100%)",
                color: "white",
              }}>
                <CardContent sx={{ py: 1, px: 1.5, "&:last-child": { pb: 1 } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Route sx={{ fontSize: 24, opacity: 0.9 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={700}>{stats.total_routes}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.85, fontSize: "0.65rem" }}>Total Routes</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <Card sx={{ 
                background: "linear-gradient(135deg, #4CAF50 0%, #81C784 100%)",
                color: "white",
              }}>
                <CardContent sx={{ py: 1, px: 1.5, "&:last-child": { pb: 1 } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CheckCircle sx={{ fontSize: 24, opacity: 0.9 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={700}>{stats.assigned_routes}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.85, fontSize: "0.65rem" }}>Assigned</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <Card sx={{ 
                background: "linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)",
                color: "white",
              }}>
                <CardContent sx={{ py: 1, px: 1.5, "&:last-child": { pb: 1 } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Cancel sx={{ fontSize: 24, opacity: 0.9 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={700}>{stats.unassigned_routes}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.85, fontSize: "0.65rem" }}>Unassigned</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <Card sx={{ 
                background: "linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)",
                color: "white",
              }}>
                <CardContent sx={{ py: 1, px: 1.5, "&:last-child": { pb: 1 } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <People sx={{ fontSize: 24, opacity: 0.9 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={700}>{stats.total_consumers.toLocaleString()}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.85, fontSize: "0.65rem" }}>Consumers</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <Card sx={{ 
                background: "linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)",
                color: "white",
              }}>
                <CardContent sx={{ py: 1, px: 1.5, "&:last-child": { pb: 1 } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Assignment sx={{ fontSize: 24, opacity: 0.9 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={700}>{stats.assigned_consumers.toLocaleString()}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.85, fontSize: "0.65rem" }}>Assigned</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <Card sx={{ 
                background: "linear-gradient(135deg, #607D8B 0%, #90A4AE 100%)",
                color: "white",
              }}>
                <CardContent sx={{ py: 1, px: 1.5, "&:last-child": { pb: 1 } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TrendingUp sx={{ fontSize: 24, opacity: 0.9 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={700}>{Math.round(stats.average_consumers_per_route)}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.85, fontSize: "0.65rem" }}>Avg/Route</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Combined Search, Filter & Sort Panel */}
      <Box 
        sx={{ 
          display: "flex", 
          alignItems: "stretch",
          gap: 2,
          mb: 2,
          p: 1.5,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,51,102,0.08)",
        }}
      >
        {/* Search */}
        <TextField
          size="small"
          placeholder="Search routes..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          sx={{ 
            flex: 1,
            minWidth: 150,
            "& .MuiOutlinedInput-root": {
              bgcolor: "grey.50",
              "&:hover fieldset": { borderColor: "primary.main" },
              "&.Mui-focused fieldset": { borderColor: "primary.main" },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" sx={{ color: "primary.main" }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Filter Section with Title Border */}
        <Box 
          sx={{ 
            position: "relative",
            border: 1,
            borderColor: "primary.light",
            borderRadius: 1.5,
            px: 1.5,
            pt: 1.5,
            pb: 0.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              top: -9,
              left: 10,
              bgcolor: "background.paper",
              px: 0.75,
              color: "primary.main",
              fontWeight: 600,
              fontSize: "0.7rem",
            }}
          >
            Filter
          </Typography>
          <ToggleButtonGroup
            value={activeTab}
            exclusive
            onChange={(_, val) => {
              if (val) {
                setActiveTab(val);
              }
            }}
            size="small"
            sx={{
              "& .MuiToggleButton-root": {
                border: "none",
                borderRadius: "6px !important",
                px: 1.5,
                py: 0.5,
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.8rem",
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": { bgcolor: "primary.dark" },
                },
              },
            }}
          >
            <ToggleButton value="all">
              All
              <Chip size="small" label={stats?.total_routes || 0} sx={{ ml: 0.75, height: 18, fontSize: "0.65rem", bgcolor: alpha("#003366", 0.15) }} />
            </ToggleButton>
            <ToggleButton value="assigned">
              Assigned
              <Chip size="small" label={stats?.assigned_routes || 0} sx={{ ml: 0.75, height: 18, fontSize: "0.65rem", bgcolor: alpha("#4CAF50", 0.15) }} />
            </ToggleButton>
            <ToggleButton value="unassigned">
              Unassigned
              <Chip size="small" label={stats?.unassigned_routes || 0} sx={{ ml: 0.75, height: 18, fontSize: "0.65rem", bgcolor: alpha("#FF9800", 0.15) }} />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Sort Section with Title Border */}
        <Box 
          sx={{ 
            position: "relative",
            border: 1,
            borderColor: "secondary.main",
            borderRadius: 1.5,
            px: 1.5,
            pt: 1.5,
            pb: 0.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              top: -9,
              left: 10,
              bgcolor: "background.paper",
              px: 0.75,
              color: "secondary.dark",
              fontWeight: 600,
              fontSize: "0.7rem",
            }}
          >
            Sort By
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title={`Route ${sortState.field === "area_code" && sortState.direction ? `(${sortState.direction})` : ""}`}>
              <Chip
                icon={getSortIcon("area_code")}
                label="Route"
                size="small"
                onClick={() => handleSortClick("area_code")}
                sx={{
                  cursor: "pointer",
                  bgcolor: sortState.field === "area_code" && sortState.direction ? "primary.main" : "grey.100",
                  color: sortState.field === "area_code" && sortState.direction ? "white" : "text.primary",
                  fontWeight: 500,
                  fontSize: "0.75rem",
                  "& .MuiChip-icon": { 
                    color: sortState.field === "area_code" && sortState.direction ? "white" : "text.secondary" 
                  },
                  "&:hover": { bgcolor: sortState.field === "area_code" && sortState.direction ? "primary.dark" : "grey.200" },
                }}
              />
            </Tooltip>
            <Tooltip title={`Delivery Person ${sortState.field === "delivery_person_name" && sortState.direction ? `(${sortState.direction})` : ""}`}>
              <Chip
                icon={getSortIcon("delivery_person_name")}
                label="Person"
                size="small"
                onClick={() => handleSortClick("delivery_person_name")}
                sx={{
                  cursor: "pointer",
                  bgcolor: sortState.field === "delivery_person_name" && sortState.direction ? "primary.main" : "grey.100",
                  color: sortState.field === "delivery_person_name" && sortState.direction ? "white" : "text.primary",
                  fontWeight: 500,
                  fontSize: "0.75rem",
                  "& .MuiChip-icon": { 
                    color: sortState.field === "delivery_person_name" && sortState.direction ? "white" : "text.secondary" 
                  },
                  "&:hover": { bgcolor: sortState.field === "delivery_person_name" && sortState.direction ? "primary.dark" : "grey.200" },
                }}
              />
            </Tooltip>
            <Tooltip title={`Consumers ${sortState.field === "consumer_count" && sortState.direction ? `(${sortState.direction})` : ""}`}>
              <Chip
                icon={getSortIcon("consumer_count")}
                label="Consumers"
                size="small"
                onClick={() => handleSortClick("consumer_count")}
                sx={{
                  cursor: "pointer",
                  bgcolor: sortState.field === "consumer_count" && sortState.direction ? "warning.main" : "grey.100",
                  color: sortState.field === "consumer_count" && sortState.direction ? "white" : "text.primary",
                  fontWeight: 500,
                  fontSize: "0.75rem",
                  "& .MuiChip-icon": { 
                    color: sortState.field === "consumer_count" && sortState.direction ? "white" : "text.secondary" 
                  },
                  "&:hover": { bgcolor: sortState.field === "consumer_count" && sortState.direction ? "warning.dark" : "grey.200" },
                }}
              />
            </Tooltip>
            <Tooltip title={`Areas ${sortState.field === "area_count" && sortState.direction ? `(${sortState.direction})` : ""}`}>
              <Chip
                icon={getSortIcon("area_count")}
                label="Areas"
                size="small"
                onClick={() => handleSortClick("area_count")}
                sx={{
                  cursor: "pointer",
                  bgcolor: sortState.field === "area_count" && sortState.direction ? "warning.main" : "grey.100",
                  color: sortState.field === "area_count" && sortState.direction ? "white" : "text.primary",
                  fontWeight: 500,
                  fontSize: "0.75rem",
                  "& .MuiChip-icon": { 
                    color: sortState.field === "area_count" && sortState.direction ? "white" : "text.secondary" 
                  },
                  "&:hover": { bgcolor: sortState.field === "area_count" && sortState.direction ? "warning.dark" : "grey.200" },
                }}
              />
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load routes. Please try again.
        </Alert>
      )}

      {/* Route Cards Grid */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <CircularProgress sx={{ color: "primary.main" }} />
          </Box>
        ) : filteredAndSortedRoutes.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
            <Typography color="text.secondary">No routes found</Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filteredAndSortedRoutes.map((route) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={route.id}>
                <Card
                  sx={{
                    height: "100%",
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    position: "relative",
                    overflow: "visible",
                    border: 1,
                    borderColor: route.delivery_person_name ? alpha("#4CAF50", 0.3) : alpha("#FF9800", 0.3),
                    background: route.delivery_person_name 
                      ? `linear-gradient(135deg, ${alpha("#4CAF50", 0.02)} 0%, ${alpha("#4CAF50", 0.08)} 100%)`
                      : `linear-gradient(135deg, ${alpha("#FF9800", 0.02)} 0%, ${alpha("#FF9800", 0.08)} 100%)`,
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: route.delivery_person_name 
                        ? "0 12px 28px rgba(76, 175, 80, 0.2)"
                        : "0 12px 28px rgba(255, 152, 0, 0.2)",
                      borderColor: route.delivery_person_name ? "success.main" : "warning.main",
                    },
                  }}
                >

                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    {/* Header */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box 
                          sx={{ 
                            p: 1,
                            borderRadius: 2,
                            background: "linear-gradient(135deg, #003366 0%, #1a5a8a 100%)",
                            display: "flex",
                            boxShadow: "0 4px 12px rgba(0, 51, 102, 0.3)",
                          }}
                        >
                          <LocationOn sx={{ color: "white", fontSize: 22 }} />
                        </Box>
                        <Box>
                          <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ lineHeight: 1.2 }}>
                            {route.area_code}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                            {route.area_code_description}
                          </Typography>
                        </Box>
                      </Box>
                      <Tooltip title="Actions">
                        <IconButton 
                          size="small" 
                          onClick={(e) => handleActionClick(e, route.id)}
                          sx={{ 
                            mt: 0.5,
                            bgcolor: "grey.100",
                            "&:hover": { bgcolor: "grey.200" },
                          }}
                        >
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    {/* Stats Grid - Clickable */}
                    <Box 
                      sx={{ 
                        display: "grid", 
                        gridTemplateColumns: "1fr 1fr", 
                        gap: 1,
                        mb: 1.5,
                      }}
                    >
                      <Box 
                        onClick={(e) => handleAreasClick(e, route.id)}
                        sx={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: 0.75,
                          p: 1,
                          bgcolor: alpha("#003366", 0.03),
                          borderRadius: 1.5,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          "&:hover": {
                            bgcolor: alpha("#003366", 0.1),
                            transform: "scale(1.02)",
                          },
                        }}
                      >
                        <Map sx={{ color: "primary.light", fontSize: 18 }} />
                        <Box>
                          <Typography variant="body1" fontWeight={700} color="primary.main">
                            {route.area_count}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>Areas</Typography>
                        </Box>
                      </Box>
                      <Box 
                        onClick={(e) => handleConsumersClick(e, route.id)}
                        sx={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: 0.75,
                          p: 1,
                          bgcolor: alpha("#FF9800", 0.05),
                          borderRadius: 1.5,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          "&:hover": {
                            bgcolor: alpha("#FF9800", 0.15),
                            transform: "scale(1.02)",
                          },
                        }}
                      >
                        <Groups sx={{ color: "warning.main", fontSize: 18 }} />
                        <Box>
                          <Typography variant="body1" fontWeight={700} color="warning.dark">
                            {route.consumer_count.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>Consumers</Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Delivery Person */}
                    <Box 
                      sx={{ 
                        p: 1.25, 
                        borderRadius: 1.5, 
                        bgcolor: route.delivery_person_name ? alpha("#4CAF50", 0.1) : alpha("#FF9800", 0.1),
                        border: 1,
                        borderColor: route.delivery_person_name ? alpha("#4CAF50", 0.2) : alpha("#FF9800", 0.2),
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{
                          p: 0.5,
                          borderRadius: 1,
                          bgcolor: route.delivery_person_name ? "success.main" : "warning.main",
                          display: "flex",
                        }}
                      >
                        <Person sx={{ fontSize: 16, color: "white" }} />
                      </Box>
                      <Typography 
                        variant="body2" 
                        fontWeight={600}
                        color={route.delivery_person_name ? "success.dark" : "warning.dark"}
                        sx={{ flex: 1 }}
                      >
                        {route.delivery_person_name || "Unassigned"}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Actions Menu */}
      <Menu
        anchorEl={actionAnchorEl}
        open={Boolean(actionAnchorEl)}
        onClose={handleActionClose}
        PaperProps={{ 
          sx: { 
            bgcolor: "background.paper", 
            boxShadow: "0 8px 24px rgba(0,51,102,0.15)",
            borderRadius: 2,
          } 
        }}
      >
        <MenuItem onClick={handleActionClose} sx={{ gap: 1.5 }}>
          <Visibility fontSize="small" sx={{ color: "primary.main" }} />
          <Typography variant="body2">View Details</Typography>
        </MenuItem>
        <MenuItem onClick={handleActionClose} sx={{ gap: 1.5 }}>
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
};

export default RouteList;
