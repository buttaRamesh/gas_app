import {
  Box,
  TextField,
  InputAdornment,
  Chip,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  alpha,
} from "@mui/material";
import {
  Search,
  SwapVert,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";
import type { SortField, SortDirection, AssignmentFilter } from "../types";

interface RouteFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortClick: (field: SortField) => void;
  assignmentFilter: AssignmentFilter;
  onAssignmentFilterChange: (value: AssignmentFilter) => void;
  stats: {
    total_routes: number;
    assigned_routes: number;
    unassigned_routes: number;
  } | null;
}

export function RouteFilters({
  searchQuery,
  onSearchChange,
  sortField,
  sortDirection,
  onSortClick,
  assignmentFilter,
  onAssignmentFilterChange,
  stats,
}: RouteFiltersProps) {
  const getSortIcon = (field: SortField) => {
    if (sortField !== field || sortDirection === null) {
      return <SwapVert sx={{ fontSize: 16 }} />;
    }
    return sortDirection === "asc" ? <ArrowUpward sx={{ fontSize: 16 }} /> : <ArrowDownward sx={{ fontSize: 16 }} />;
  };

  return (
    <Box sx={{ display: "flex", alignItems: "stretch", gap: 1.5, mb: 1.5, p: 1, bgcolor: "background.paper", borderRadius: 2, boxShadow: "0 2px 8px rgba(0,51,102,0.08)" }}>
      <TextField
        size="small"
        placeholder="Search routes..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ flex: 1, minWidth: 150, "& .MuiOutlinedInput-root": { bgcolor: "grey.50", "&:hover fieldset": { borderColor: "primary.main" }, "&.Mui-focused fieldset": { borderColor: "primary.main" } } }}
        InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" sx={{ color: "primary.main" }} /></InputAdornment> }}
      />
      <Box sx={{ position: "relative", border: 1, borderColor: "primary.light", borderRadius: 1.5, px: 1.25, pt: 1.25, pb: 0.5 }}>
        <Typography variant="caption" sx={{ position: "absolute", top: -9, left: 10, bgcolor: "background.paper", px: 0.75, color: "primary.main", fontWeight: 600, fontSize: "0.7rem" }}>Filter</Typography>
        <ToggleButtonGroup value={assignmentFilter} exclusive onChange={(_, val) => { if (val) onAssignmentFilterChange(val); }} size="small" sx={{ "& .MuiToggleButton-root": { border: "none", borderRadius: "6px !important", px: 1.25, py: 0.4, textTransform: "none", fontWeight: 500, fontSize: "0.75rem", "&.Mui-selected": { bgcolor: "primary.main", color: "white", "&:hover": { bgcolor: "primary.dark" } } } }}>
          <ToggleButton value="all">All<Chip size="small" label={stats?.total_routes || 0} sx={{ ml: 0.75, height: 16, fontSize: "0.6rem", bgcolor: alpha("#003366", 0.15) }} /></ToggleButton>
          <ToggleButton value="assigned">Assigned<Chip size="small" label={stats?.assigned_routes || 0} sx={{ ml: 0.75, height: 16, fontSize: "0.6rem", bgcolor: alpha("#4CAF50", 0.15) }} /></ToggleButton>
          <ToggleButton value="unassigned">Unassigned<Chip size="small" label={stats?.unassigned_routes || 0} sx={{ ml: 0.75, height: 16, fontSize: "0.6rem", bgcolor: alpha("#FF9800", 0.15) }} /></ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box sx={{ position: "relative", border: 1, borderColor: "secondary.main", borderRadius: 1.5, px: 1.25, pt: 1.25, pb: 0.5 }}>
        <Typography variant="caption" sx={{ position: "absolute", top: -9, left: 10, bgcolor: "background.paper", px: 0.75, color: "secondary.dark", fontWeight: 600, fontSize: "0.7rem" }}>Sort By</Typography>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title={"Sort by route"}><Chip icon={getSortIcon("area_code")} label="Route" size="small" onClick={() => onSortClick("area_code")} sx={{ cursor: "pointer", bgcolor: sortField === "area_code" && sortDirection ? "primary.main" : "grey.100", color: sortField === "area_code" && sortDirection ? "white" : "text.primary", fontWeight: 500, fontSize: "0.7rem", height: 24, "& .MuiChip-icon": { color: sortField === "area_code" && sortDirection ? "white" : "text.secondary" }, "&:hover": { bgcolor: sortField === "area_code" && sortDirection ? "primary.dark" : "grey.200" } }} /></Tooltip>
          <Tooltip title={"Sort by person"}><Chip icon={getSortIcon("delivery_person_name")} label="Person" size="small" onClick={() => onSortClick("delivery_person_name")} sx={{ cursor: "pointer", bgcolor: sortField === "delivery_person_name" && sortDirection ? "primary.main" : "grey.100", color: sortField === "delivery_person_name" && sortDirection ? "white" : "text.primary", fontWeight: 500, fontSize: "0.7rem", height: 24, "& .MuiChip-icon": { color: sortField === "delivery_person_name" && sortDirection ? "white" : "text.secondary" }, "&:hover": { bgcolor: sortField === "delivery_person_name" && sortDirection ? "primary.dark" : "grey.200" } }} /></Tooltip>
          <Tooltip title={"Sort by consumers"}><Chip icon={getSortIcon("consumer_count")} label="Consumers" size="small" onClick={() => onSortClick("consumer_count")} sx={{ cursor: "pointer", bgcolor: sortField === "consumer_count" && sortDirection ? "warning.main" : "grey.100", color: sortField === "consumer_count" && sortDirection ? "white" : "text.primary", fontWeight: 500, fontSize: "0.7rem", height: 24, "& .MuiChip-icon": { color: sortField === "consumer_count" && sortDirection ? "white" : "text.secondary" }, "&:hover": { bgcolor: sortField === "consumer_count" && sortDirection ? "warning.dark" : "grey.200" } }} /></Tooltip>
          <Tooltip title={"Sort by areas"}><Chip icon={getSortIcon("area_count")} label="Areas" size="small" onClick={() => onSortClick("area_count")} sx={{ cursor: "pointer", bgcolor: sortField === "area_count" && sortDirection ? "warning.main" : "grey.100", color: sortField === "area_count" && sortDirection ? "white" : "text.primary", fontWeight: 500, fontSize: "0.7rem", height: 24, "& .MuiChip-icon": { color: sortField === "area_count" && sortDirection ? "white" : "text.secondary" }, "&:hover": { bgcolor: sortField === "area_count" && sortDirection ? "warning.dark" : "grey.200" } }} /></Tooltip>
        </Box>
      </Box>
    </Box>
  );
}
