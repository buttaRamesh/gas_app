import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Typography,
  alpha,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import type { SortOption, AssignmentFilter } from "../types";

interface RouteFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: SortOption;
  onSortByChange: (value: SortOption) => void;
  sortOrder: "asc" | "desc";
  onSortOrderToggle: () => void;
  assignmentFilter: AssignmentFilter;
  onAssignmentFilterChange: (value: AssignmentFilter) => void;
  resultCount: number;
}

export function RouteFilters({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderToggle,
  assignmentFilter,
  onAssignmentFilterChange,
  resultCount,
}: RouteFiltersProps) {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 3 }}>
      {/* Search and Sort Row */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "center",
          flexWrap: "wrap",
          mb: 2,
        }}
      >
        {/* Search */}
        <TextField
          placeholder="Search routes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          size="small"
          sx={{
            minWidth: 300,
            flex: 1,
            "& .MuiOutlinedInput-root": {
              "&:hover fieldset": {
                borderColor: theme.palette.primary.main,
              },
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
              ),
              endAdornment: searchQuery && (
                <IconButton
                  size="small"
                  onClick={() => onSearchChange("")}
                  aria-label="Clear search"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              ),
            },
          }}
        />

        {/* Sort */}
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={(e) => onSortByChange(e.target.value as SortOption)}
          >
            <MenuItem value="area_code">Route Code</MenuItem>
            <MenuItem value="consumer_count">Consumer Count</MenuItem>
            <MenuItem value="area_count">Area Count</MenuItem>
            <MenuItem value="delivery_person">Delivery Person</MenuItem>
          </Select>
        </FormControl>

        {/* Sort Order Toggle */}
        <IconButton
          onClick={onSortOrderToggle}
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.2),
            },
          }}
          title={sortOrder === "asc" ? "Ascending" : "Descending"}
          aria-label={`Sort ${sortOrder === "asc" ? "ascending" : "descending"}`}
        >
          <SwapVertIcon
            sx={{
              transform: sortOrder === "desc" ? "rotate(180deg)" : "none",
              transition: "transform 0.2s",
            }}
          />
        </IconButton>

        {/* Result Count */}
        <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
          {resultCount} {resultCount === 1 ? "route" : "routes"}
        </Typography>
      </Box>

      {/* Filter Chips Row */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {/* Assignment Filter Chips */}
        <Chip
          label="All"
          onClick={() => onAssignmentFilterChange("all")}
          color={assignmentFilter === "all" ? "primary" : "default"}
          sx={{
            cursor: "pointer",
            fontWeight: assignmentFilter === "all" ? 600 : 400,
            transition: "all 0.2s",
            "&:hover": {
              transform: "scale(1.05)",
            },
          }}
        />
        <Chip
          label="Assigned"
          onClick={() => onAssignmentFilterChange("assigned")}
          color={assignmentFilter === "assigned" ? "primary" : "default"}
          sx={{
            cursor: "pointer",
            fontWeight: assignmentFilter === "assigned" ? 600 : 400,
            transition: "all 0.2s",
            "&:hover": {
              transform: "scale(1.05)",
            },
          }}
        />
        <Chip
          label="Unassigned"
          onClick={() => onAssignmentFilterChange("unassigned")}
          color={assignmentFilter === "unassigned" ? "warning" : "default"}
          sx={{
            cursor: "pointer",
            fontWeight: assignmentFilter === "unassigned" ? 600 : 400,
            transition: "all 0.2s",
            "&:hover": {
              transform: "scale(1.05)",
            },
          }}
        />
      </Box>
    </Box>
  );
}
