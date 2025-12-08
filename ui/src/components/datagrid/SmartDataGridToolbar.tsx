// src/components/datagrid/SmartDataGridToolbar.tsx
import React from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";

import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import FilterListIcon from "@mui/icons-material/FilterList";
import PrintIcon from "@mui/icons-material/Print";
import Badge from "@mui/material/Badge";
import Typography from "@mui/material/Typography";

import {
  ColumnsPanelTrigger,
  FilterPanelTrigger,
} from "@mui/x-data-grid";

import type { GridToolbarProps } from "@mui/x-data-grid";

export type CustomToolbarProps = {
  quickFilterValue?: string;
  onQuickFilterChange?: (v: string) => void;

  showColumns?: boolean;
  showFilters?: boolean;
  showExport?: boolean;

  filterCount?: number;

  onPrint?: () => void;
  onExportCsv?: () => void;
  onExportExcel?: () => void;
};

export default function SmartDataGridToolbar(
  props: GridToolbarProps & Partial<CustomToolbarProps>
) {
  // Dummy placeholder functions
  const handlePrint = () => {};
  const handleExportCsv = () => {};
  const handleExportExcel = () => {};

  const {
    quickFilterValue = "",
    onQuickFilterChange,

    showColumns = true,
    showFilters = true,
    showExport = true,

    filterCount = 0,

    onPrint = handlePrint,
    onExportCsv = handleExportCsv,
    onExportExcel = handleExportExcel,
  } = props;

  const [exportAnchor, setExportAnchor] = React.useState<HTMLElement | null>(null);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 1.5,
        py: 1,
        width: "100%",
      }}
    >
      {/* Left spacer / Title placeholder */}
      <Typography fontWeight="medium" sx={{ flex: 1 }} />

      {/* Search box */}
      <TextField
        size="small"
        placeholder="Search…"
        value={quickFilterValue}
        onChange={(e) => onQuickFilterChange?.(e.target.value)}
        sx={{ width: 220 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
          sx: { height: 36 },
        }}
      />

      {/* Divider between search and icons */}
      <Divider orientation="vertical" flexItem />

      {/* Columns panel trigger */}
      {showColumns && (
        <ColumnsPanelTrigger
          render={({ onClick }) => (
            <Tooltip title="Columns">
              <IconButton size="small" onClick={onClick}>
                <ViewColumnIcon />
              </IconButton>
            </Tooltip>
          )}
        />
      )}

      {/* Filters panel trigger */}
      {showFilters && (
        <FilterPanelTrigger
          render={({ onClick }) => (
            <Tooltip title="Filters">
              <IconButton size="small" onClick={onClick}>
                <Badge badgeContent={filterCount} color="primary" variant="dot">
                  <FilterListIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          )}
        />
      )}

      {/* Divider between filters and print */}
      <Divider orientation="vertical" flexItem />

      {/* Print button */}
      <Tooltip title="Print">
        <IconButton size="small" onClick={() => onPrint()}>
          <PrintIcon />
        </IconButton>
      </Tooltip>

      {/* Divider before export */}
      <Divider orientation="vertical" flexItem />

      {/* Export menu (CSV, Excel placeholder) */}
      {showExport && (
        <>
          <Tooltip title="Export">
            <IconButton
              size="small"
              aria-haspopup="true"
              onClick={(e) => setExportAnchor(e.currentTarget)}
            >
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>

          <Menu
            id="export-menu"
            anchorEl={exportAnchor}
            open={Boolean(exportAnchor)}
            onClose={() => setExportAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem
              onClick={() => {
                setExportAnchor(null);
                onExportCsv();
              }}
            >
              Download CSV (placeholder)
            </MenuItem>

            <MenuItem
              onClick={() => {
                setExportAnchor(null);
                onExportExcel();
              }}
            >
              Download Excel (placeholder)
            </MenuItem>
          </Menu>
        </>
      )}
    </Box>
  );
}
