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

interface DeliveryPersonFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortClick: (field: SortField) => void;
  assignmentFilter: AssignmentFilter;
  onAssignmentFilterChange: (value: AssignmentFilter) => void;
  stats: {
    total_delivery_persons: number;
    assigned_delivery_persons: number;
    unassigned_delivery_persons: number;
  } | null;
}

export function DeliveryPersonFilters({
  searchQuery,
  onSearchChange,
  sortField,
  sortDirection,
  onSortClick,
  assignmentFilter,
  onAssignmentFilterChange,
  stats,
}: DeliveryPersonFiltersProps) {
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
        placeholder="Search delivery persons..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ flex: 1, minWidth: 150, "& .MuiOutlinedInput-root": { bgcolor: "grey.50", "&:hover fieldset": { borderColor: "primary.main" }, "&.Mui-focused fieldset": { borderColor: "primary.main" } } }}
        InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" sx={{ color: "primary.main" }} /></InputAdornment> }}
      />
      <Box sx={{ position: "relative", border: 1, borderColor: "primary.light", borderRadius: 1.5, px: 1.25, pt: 1.25, pb: 0.5 }}>
        <Typography variant="caption" sx={{ position: "absolute", top: -9, left: 10, bgcolor: "background.paper", px: 0.75, color: "primary.main", fontWeight: 600, fontSize: "0.7rem" }}>Filter</Typography>
        <ToggleButtonGroup value={assignmentFilter} exclusive onChange={(_, val) => { if (val) onAssignmentFilterChange(val); }} size="small" sx={{ "& .MuiToggleButton-root": { border: "none", borderRadius: "6px !important", px: 1.25, py: 0.4, textTransform: "none", fontWeight: 500, fontSize: "0.75rem", "&.Mui-selected": { bgcolor: "primary.main", color: "white", "&:hover": { bgcolor: "primary.dark" } } } }}>
          <ToggleButton value="all">All<Chip size="small" label={stats?.total_delivery_persons || 0} sx={{ ml: 0.75, height: 16, fontSize: "0.6rem", bgcolor: alpha("#003366", 0.15) }} /></ToggleButton>
          <ToggleButton value="assigned">Assigned<Chip size="small" label={stats?.assigned_delivery_persons || 0} sx={{ ml: 0.75, height: 16, fontSize: "0.6rem", bgcolor: alpha("#4CAF50", 0.15) }} /></ToggleButton>
          <ToggleButton value="unassigned">Unassigned<Chip size="small" label={stats?.unassigned_delivery_persons || 0} sx={{ ml: 0.75, height: 16, fontSize: "0.6rem", bgcolor: alpha("#FF9800", 0.15) }} /></ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box sx={{ position: "relative", border: 1, borderColor: "secondary.main", borderRadius: 1.5, px: 1.25, pt: 1.25, pb: 0.5 }}>
        <Typography variant="caption" sx={{ position: "absolute", top: -9, left: 10, bgcolor: "background.paper", px: 0.75, color: "secondary.dark", fontWeight: 600, fontSize: "0.7rem" }}>Sort By</Typography>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title={"Sort by name"}><Chip icon={getSortIcon("person_name")} label="Name" size="small" onClick={() => onSortClick("person_name")} sx={{ cursor: "pointer", bgcolor: sortField === "person_name" && sortDirection ? "primary.main" : "grey.100", color: sortField === "person_name" && sortDirection ? "white" : "text.primary", fontWeight: 500, fontSize: "0.7rem", height: 24, "& .MuiChip-icon": { color: sortField === "person_name" && sortDirection ? "white" : "text.secondary" }, "&:hover": { bgcolor: sortField === "person_name" && sortDirection ? "primary.dark" : "grey.200" } }} /></Tooltip>
          <Tooltip title={"Sort by routes"}><Chip icon={getSortIcon("assigned_routes_count")} label="Routes" size="small" onClick={() => onSortClick("assigned_routes_count")} sx={{ cursor: "pointer", bgcolor: sortField === "assigned_routes_count" && sortDirection ? "warning.main" : "grey.100", color: sortField === "assigned_routes_count" && sortDirection ? "white" : "text.primary", fontWeight: 500, fontSize: "0.7rem", height: 24, "& .MuiChip-icon": { color: sortField === "assigned_routes_count" && sortDirection ? "white" : "text.secondary" }, "&:hover": { bgcolor: sortField === "assigned_routes_count" && sortDirection ? "warning.dark" : "grey.200" } }} /></Tooltip>
          <Tooltip title={"Sort by consumers"}><Chip icon={getSortIcon("total_consumers")} label="Consumers" size="small" onClick={() => onSortClick("total_consumers")} sx={{ cursor: "pointer", bgcolor: sortField === "total_consumers" && sortDirection ? "warning.main" : "grey.100", color: sortField === "total_consumers" && sortDirection ? "white" : "text.primary", fontWeight: 500, fontSize: "0.7rem", height: 24, "& .MuiChip-icon": { color: sortField === "total_consumers" && sortDirection ? "white" : "text.secondary" }, "&:hover": { bgcolor: sortField === "total_consumers" && sortDirection ? "warning.dark" : "grey.200" } }} /></Tooltip>
        </Box>
      </Box>
    </Box>
  );
}
