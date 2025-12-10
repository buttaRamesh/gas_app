// src/components/datagrid/SmartDataGridToolbar.tsx

import React from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Badge from "@mui/material/Badge";

import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PrintIcon from "@mui/icons-material/Print";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Cancel";

import {
  Toolbar,                 // ⭐ MUST RECEIVE {...props}
  QuickFilter,
  QuickFilterControl,
  QuickFilterClear,
  type GridToolbarProps,
  ColumnsPanelTrigger,
  FilterPanelTrigger,
} from "@mui/x-data-grid";

import UnderlineInput from "./UnderlineInput";
import StatusToggle from "@/components/shared/StatusToggle";
import type { ExportFormat } from "@/services/export/types";

export default function SmartDataGridToolbar(
  props: GridToolbarProps & {
    showColumns?: boolean;
    showFilters?: boolean;
    showExport?: boolean;
    filterCount?: number;
    kycStatus?: "pending" | "done";
    onKycStatusChange?: (status: "pending" | "done") => void;

    // Export functionality
    exportData?: (
      format: ExportFormat,
      visibleColumns: string[],
      params?: Record<string, any>
    ) => Promise<void>;
    isExporting?: boolean;
    exportError?: string | null;
    visibleColumns?: string[];
    exportParams?: Record<string, any>;

    onPrint?: () => void;
  }
) {
  const {
    showColumns = true,
    showFilters = true,
    showExport = true,
    filterCount = 0,
    kycStatus,
    onKycStatusChange,

    // Export props
    exportData,
    isExporting = false,
    exportError,
    visibleColumns = [],
    exportParams = {},

    onPrint = () => {},
    ...muiToolbarProps // IMPORTANT → needed for context
  } = props;

  const [exportAnchor, setExportAnchor] = React.useState<null | HTMLElement>(
    null
  );

  // Focus state controls animated underline
  const [focused, setFocused] = React.useState(false);

  // Export handlers
  const handleExport = async (format: ExportFormat) => {
    if (!exportData) return;

    setExportAnchor(null); // Close menu

    try {
      await exportData(format, visibleColumns, exportParams);
    } catch (error) {
      console.error('Export failed:', error);
      // Error handling is done in the hook
    }
  };

  return (
    // 🟢 THIS IS THE FIX — spread GridToolbarProps into Toolbar
    <Toolbar
      {...muiToolbarProps}
      sx={(theme) => ({
        // Bold Branding: Primary blue gradient - Full width!
        background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.primary.light} 100%)`,
        borderBottom: `2px solid ${theme.palette.primary.dark}`,
        boxShadow: "0 2px 8px rgba(0, 51, 102, 0.15)",
        padding: "0 !important", // Remove default Toolbar padding

        // White placeholder text for search input
        "& .underline-input::placeholder": {
          color: "rgba(255, 255, 255, 0.7)",
          opacity: 1,
        },
      })}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 1.5,
          py: 1,
          height: 56,
          width: "100%",
        }}
      >
        {/* Spacer */}
        <Typography sx={{ flex: 1 }} />

        {/* ================= QuickFilter with underline animation ================= */}
        <QuickFilter
          render={(quickProps, state) => (
            <Box
              {...quickProps}
              sx={(theme) => ({
                width: 360,
                display: "flex",
                alignItems: "center",
                gap: 1,
                position: "relative",
                pb: "6px",

                // Base underline (always visible) - Yellow for contrast on blue
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: "2px",
                  background: theme.palette.secondary.main,
                  opacity: 0.5,
                },

                // Animated underline (focus) - Bright yellow
                "&::after": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  height: "2px",
                  background: theme.palette.secondary.main,
                  right: focused ? 0 : "100%",
                  transition: "right 200ms ease",
                },
              })}
            >
              <SearchIcon
                sx={{ color: "#ffffff" }}
              />

              <QuickFilterControl
                placeholder="Search…"
                render={({ slotProps, ...controlProps }) => (
                  <UnderlineInput
                    {...(slotProps?.htmlInput as any)}
                    {...(controlProps as any)}
                    placeholder="Search…"
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={{
                      color: "#ffffff",
                      "::placeholder": { color: "rgba(255, 255, 255, 0.7)" },
                    }}
                  />
                )}
              />

              {state.value !== "" && (
                <QuickFilterClear
                  render={
                    <IconButton size="small">
                      <ClearIcon
                        fontSize="small"
                        sx={{ color: "#ffffff" }}
                      />
                    </IconButton>
                  }
                />
              )}
            </Box>
          )}
        />

        {/* KYC Status Toggle (only shown when kycStatus prop is provided) */}
        {kycStatus !== undefined && onKycStatusChange && (
          <>
            <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255, 255, 255, 0.3)", mx: 1 }} />
            <StatusToggle
              status={kycStatus}
              onChange={onKycStatusChange}
              size="small"
              showLabel={true}
            />
          </>
        )}

        <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255, 255, 255, 0.3)" }} />

        {/* Columns Panel */}
        {showColumns && (
          <ColumnsPanelTrigger
            render={({ onClick }) => (
              <Tooltip title="Columns">
                <IconButton size="small" onClick={onClick} sx={{ color: "#ffffff" }}>
                  <ViewColumnIcon />
                </IconButton>
              </Tooltip>
            )}
          />
        )}

        {/* Filters Panel */}
        {showFilters && (
          <FilterPanelTrigger
            render={({ onClick }) => (
              <Tooltip title="Filters">
                <IconButton size="small" onClick={onClick} sx={{ color: "#ffffff" }}>
                  <Badge badgeContent={filterCount} color="secondary" variant="dot">
                    <FilterListIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}
          />
        )}

        <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255, 255, 255, 0.3)" }} />

        {/* Print */}
        <Tooltip title="Print">
          <IconButton size="small" onClick={onPrint} sx={{ color: "#ffffff" }}>
            <PrintIcon />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255, 255, 255, 0.3)" }} />

        {/* Export */}
        {showExport && (
          <>
            <Tooltip title={isExporting ? "Exporting..." : "Export"}>
              <span>
                <IconButton
                  size="small"
                  onClick={(e) => setExportAnchor(e.currentTarget)}
                  disabled={isExporting}
                  sx={{
                    color: "#ffffff",
                    opacity: isExporting ? 0.5 : 1,
                  }}
                >
                  <FileDownloadIcon />
                </IconButton>
              </span>
            </Tooltip>

            <Menu
              anchorEl={exportAnchor}
              open={Boolean(exportAnchor)}
              onClose={() => setExportAnchor(null)}
            >
              <MenuItem onClick={() => handleExport('csv')}>
                Export as CSV
              </MenuItem>

              <MenuItem onClick={() => handleExport('excel')}>
                Export as Excel
              </MenuItem>

              <MenuItem onClick={() => handleExport('pdf')}>
                Export as PDF
              </MenuItem>
            </Menu>
          </>
        )}
      </Box>
    </Toolbar>
  );
}




// // src/components/datagrid/SmartDataGridToolbar.tsx
// import React from "react";
// import Box from "@mui/material/Box";
// import IconButton from "@mui/material/IconButton";
// import Tooltip from "@mui/material/Tooltip";
// import Menu from "@mui/material/Menu";
// import MenuItem from "@mui/material/MenuItem";
// import Divider from "@mui/material/Divider";
// import Typography from "@mui/material/Typography";
// import Badge from "@mui/material/Badge";

// import FileDownloadIcon from "@mui/icons-material/FileDownload";
// import PrintIcon from "@mui/icons-material/Print";
// import ViewColumnIcon from "@mui/icons-material/ViewColumn";
// import FilterListIcon from "@mui/icons-material/FilterList";
// import SearchIcon from "@mui/icons-material/Search";
// import ClearIcon from "@mui/icons-material/Cancel";

// import {
//   QuickFilter,
//   QuickFilterControl,
//   QuickFilterClear,
//   type GridToolbarProps,
//   ColumnsPanelTrigger,
//   FilterPanelTrigger,
// } from "@mui/x-data-grid";

// import UnderlineInput from "./UnderlineInput";

// export default function SmartDataGridToolbar(
//   props: GridToolbarProps & {
//     showColumns?: boolean;
//     showFilters?: boolean;
//     showExport?: boolean;
//     filterCount?: number;

//     onPrint?: () => void;
//     onExportCsv?: () => void;
//     onExportExcel?: () => void;
//   }
// ) {
//   const {
//     showColumns = true,
//     showFilters = true,
//     showExport = true,
//     filterCount = 0,

//     onPrint = () => {},
//     onExportCsv = () => {},
//     onExportExcel = () => {},
//   } = props;

//   const [exportAnchor, setExportAnchor] = React.useState<null | HTMLElement>(
//     null
//   );

//   // focused state is only for underline animation (pure UI)
//   const [focused, setFocused] = React.useState(false);

//   return (
//     <Box
//       sx={(theme) => ({
//         display: "flex",
//         alignItems: "center",
//         gap: 1.5,
//         px: 1.5,
//         py: 1,
//         height: 56,
//         borderBottom: `1px solid ${theme.palette.divider}`,
//         backgroundColor: theme.palette.background.paper,
//       })}
//     >
//       {/* Left spacer */}
//       <Typography sx={{ flex: 1 }} />

//       {/* QuickFilter: always-visible custom input */}
//       <QuickFilter
//         render={(props, state) => (
//           <Box
//             {...props}
//             sx={(theme) => ({
//               width: 360, // increased width as requested
//               display: "flex",
//               alignItems: "center",
//               gap: 1,
//               position: "relative",
//               pb: "4px",
//               // animated underline pseudo-element
//               "&::after": {
//                 content: '""',
//                 position: "absolute",
//                 left: 0,
//                 bottom: 0,
//                 height: "2px",
//                 background: theme.palette.secondary.main, // theme-based
//                 right: focused ? 0 : "100%",
//                 transition: "right 200ms ease",
//               },
//             })}
//           >
//             <SearchIcon sx={(theme) => ({ color: theme.palette.text.primary })} />

//             <QuickFilterControl
//               placeholder="Search…"
//               render={({ slotProps, ...controlProps }) => (
//                 <UnderlineInput
//                   {...(slotProps?.htmlInput as any)}
//                   {...(controlProps as any)}
//                   placeholder="Search…"
//                   onFocus={(e: React.FocusEvent<HTMLInputElement>) =>
//                     setFocused(true)
//                   }
//                   onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
//                     setFocused(false)
//                   }
//                 />
//               )}
//             />

//             {state.value !== "" && (
//               <QuickFilterClear
//                 render={
//                   <IconButton size="small" aria-label="Clear quick filter">
//                     <ClearIcon
//                       fontSize="small"
//                       sx={(theme) => ({ color: theme.palette.text.secondary })}
//                     />
//                   </IconButton>
//                 }
//               />
//             )}
//           </Box>
//         )}
//       />

//       <Divider orientation="vertical" flexItem />

//       {showColumns && (
//         <ColumnsPanelTrigger
//           render={({ onClick }) => (
//             <Tooltip title="Columns">
//               <IconButton size="small" onClick={onClick}>
//                 <ViewColumnIcon />
//               </IconButton>
//             </Tooltip>
//           )}
//         />
//       )}

//       {showFilters && (
//         <FilterPanelTrigger
//           render={({ onClick }) => (
//             <Tooltip title="Filters">
//               <IconButton size="small" onClick={onClick}>
//                 <Badge
//                   badgeContent={filterCount}
//                   color="primary"
//                   variant="dot"
//                 >
//                   <FilterListIcon />
//                 </Badge>
//               </IconButton>
//             </Tooltip>
//           )}
//         />
//       )}

//       <Divider orientation="vertical" flexItem />

//       <Tooltip title="Print">
//         <IconButton size="small" onClick={onPrint}>
//           <PrintIcon />
//         </IconButton>
//       </Tooltip>

//       <Divider orientation="vertical" flexItem />

//       {showExport && (
//         <>
//           <Tooltip title="Export">
//             <IconButton
//               size="small"
//               onClick={(e) => setExportAnchor(e.currentTarget)}
//             >
//               <FileDownloadIcon />
//             </IconButton>
//           </Tooltip>

//           <Menu
//             anchorEl={exportAnchor}
//             open={Boolean(exportAnchor)}
//             onClose={() => setExportAnchor(null)}
//           >
//             <MenuItem
//               onClick={() => {
//                 setExportAnchor(null);
//                 onExportCsv();
//               }}
//             >
//               Download CSV (placeholder)
//             </MenuItem>
//             <MenuItem
//               onClick={() => {
//                 setExportAnchor(null);
//                 onExportExcel();
//               }}
//             >
//               Download Excel (placeholder)
//             </MenuItem>
//           </Menu>
//         </>
//       )}
//     </Box>
//   );
// }




