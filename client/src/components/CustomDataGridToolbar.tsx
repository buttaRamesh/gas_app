import { useState, useRef } from "react";
import { Box, Typography, TextField, InputAdornment, Menu, MenuItem, Divider, Tooltip } from "@mui/material";
import {
  Search as SearchIcon,
  Print as PrintIcon,
  FileDownload as ExportIcon,
} from "@mui/icons-material";
import {
  Toolbar,
  ToolbarButton,
  ExportCsv,
  ExportPrint
} from "@mui/x-data-grid";

interface CustomDataGridToolbarProps {
  title?: string;
  onQuickFilterChange?: (value: string) => void;
  showQuickFilter?: boolean;
  showPrint?: boolean;
  showExport?: boolean;
}

export function CustomDataGridToolbar({
  title,
  onQuickFilterChange,
  showQuickFilter = true,
  showPrint = true,
  showExport = true,
}: CustomDataGridToolbarProps) {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuTriggerRef = useRef<HTMLButtonElement>(null);

  return (
    <Toolbar
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 2,
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      {/* Left Side - Title */}
      {title && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
      )}

      {/* Right Side - Toolbar Actions */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {showQuickFilter && onQuickFilterChange && (
          <TextField
            size="small"
            placeholder="Quick search..."
            onChange={(e) => onQuickFilterChange(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: 200 }}
          />
        )}

        {(showPrint || showExport) && (
          <>
            <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />

            <Tooltip title="Export">
              <ToolbarButton
                ref={exportMenuTriggerRef}
                id="export-menu-trigger"
                aria-controls="export-menu"
                aria-haspopup="true"
                aria-expanded={exportMenuOpen ? 'true' : undefined}
                onClick={() => setExportMenuOpen(true)}
              >
                <ExportIcon fontSize="small" />
              </ToolbarButton>
            </Tooltip>

            <Menu
              id="export-menu"
              anchorEl={exportMenuTriggerRef.current}
              open={exportMenuOpen}
              onClose={() => setExportMenuOpen(false)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{
                list: {
                  'aria-labelledby': 'export-menu-trigger',
                },
              }}
            >
              {showPrint && (
                <ExportPrint
                  render={<MenuItem />}
                  onClick={() => setExportMenuOpen(false)}
                >
                  <PrintIcon fontSize="small" sx={{ mr: 1 }} />
                  Print
                </ExportPrint>
              )}
              {showExport && (
                <ExportCsv
                  render={<MenuItem />}
                  onClick={() => setExportMenuOpen(false)}
                  csvOptions={{
                    fileName: `${(title || "export").replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}`,
                    utf8WithBom: true,
                  }}
                >
                  <ExportIcon fontSize="small" sx={{ mr: 1 }} />
                  Download as CSV
                </ExportCsv>
              )}
            </Menu>
          </>
        )}
      </Box>
    </Toolbar>
  );
}
