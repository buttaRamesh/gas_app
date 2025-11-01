import { Typography, Tooltip, Box } from "@mui/material";
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
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
  QuickFilterClear,
} from "@mui/x-data-grid";

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
      </Box>
    </Toolbar>
  );
}

