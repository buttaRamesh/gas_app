import { Typography, Tooltip, Box, Tabs, Tab, Divider } from "@mui/material";
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import GridOnIcon from '@mui/icons-material/GridOn';
import { styled } from '@mui/material/styles';

import {
  Toolbar,
  ToolbarButton,
  ExportPrint,
  QuickFilter,
  QuickFilterControl,
} from "@mui/x-data-grid";

import { FilterToggle, type FilterOption } from './custom/FilterToggle';

interface TBProps {
  title: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onExportClick?: () => void;
  exportLoading?: boolean;
  showExport?: boolean;
  showPrint?: boolean;
  onExportPdf?: () => void;
  pdfLoading?: boolean;
  onExportExcel?: () => void;
  excelLoading?: boolean;
  filterLabel?: string;
  filterOptions?: FilterOption[];
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  customActions?: React.ReactNode;
  showTabs?: boolean;
  tabValue?: string;
  onTabChange?: (value: string) => void;
}

const StyledQuickFilter = styled(QuickFilter)({
  display: 'flex',
  alignItems: 'center',
});

export function CustomToolbar({
  title,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search consumer...',
  onExportClick,
  exportLoading = false,
  showExport = false,
  showPrint = false,
  onExportPdf,
  pdfLoading = false,
  onExportExcel,
  excelLoading = false,
  filterLabel,
  filterOptions,
  filterValue,
  onFilterChange,
  customActions,
  showTabs = false,
  tabValue = 'all',
  onTabChange,
}: TBProps) {
  return (
    <Toolbar sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      px: 2,
      py: 1.5,
    }}>
      <Typography fontWeight="medium" sx={{ flex: 1 }}>
        {title}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {onSearchChange ? (
          <StyledQuickFilter expanded>
            <QuickFilterControl
              render={({ ref, ...other }) => (
                <TextField
                  {...other}
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  variant="standard"
                  sx={{ width: 260 }}
                  inputRef={ref}
                  aria-label="Search"
                  placeholder={searchPlaceholder}
                  size="small"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),

                      ...other.slotProps?.input,
                    },
                    ...other.slotProps,
                  }}
                />
              )}
            />
          </StyledQuickFilter>
        ) : null}

        {showTabs && onTabChange && (
          <>
            <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 32, alignSelf: 'center' }} />
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => onTabChange(newValue)}
              sx={{
                minHeight: 36,
                '& .MuiTabs-indicator': {
                  backgroundColor: '#667eea',
                  height: 3,
                },
                '& .MuiTab-root': {
                  minHeight: 36,
                  minWidth: 80,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'text.secondary',
                  px: 2,
                  '&.Mui-selected': {
                    color: '#667eea',
                  },
                  '&:hover': {
                    color: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.04)',
                  }
                }
              }}
            >
              <Tab label="All" value="all" />
              <Tab label="Pending" value="pending" />
              <Tab label="Delivered" value="delivered" />
            </Tabs>
            <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 32, alignSelf: 'center' }} />
          </>
        )}

        {filterOptions && filterOptions.length > 0 && onFilterChange && (
          <FilterToggle
            label={filterLabel || 'Filter'}
            options={filterOptions}
            value={filterValue}
            onChange={onFilterChange}
          />
        )}

        {showExport && onExportClick && (
          <Tooltip title={exportLoading ? "Exporting..." : "Export CSV"}>
            <ToolbarButton onClick={onExportClick} disabled={exportLoading}>
              <FileDownloadIcon fontSize="small" />
            </ToolbarButton>
          </Tooltip>
        )}

        {onExportExcel && (
          <Tooltip title={excelLoading ? "Generating..." : "Export Excel"}>
            <ToolbarButton onClick={onExportExcel} disabled={excelLoading}>
              <GridOnIcon fontSize="small" />
            </ToolbarButton>
          </Tooltip>
        )}

        {onExportPdf && (
          <Tooltip title={pdfLoading ? "Generating..." : "Export PDF"}>
            <ToolbarButton onClick={onExportPdf} disabled={pdfLoading}>
              <PictureAsPdfIcon fontSize="small" />
            </ToolbarButton>
          </Tooltip>
        )}

        {showPrint && (
          <Tooltip title="Print">
            <ExportPrint render={<ToolbarButton />}>
              <PrintIcon fontSize="small" />
            </ExportPrint>
          </Tooltip>
        )}

        {customActions}
      </Box>
    </Toolbar>
  );
}

