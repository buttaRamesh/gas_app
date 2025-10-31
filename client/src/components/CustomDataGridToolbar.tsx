import { Box, Typography, Button, TextField, InputAdornment } from "@mui/material";
import {
  Search as SearchIcon,
  Print as PrintIcon,
} from "@mui/icons-material";
import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarProps,
} from "@mui/x-data-grid";

interface CustomDataGridToolbarProps extends Partial<GridToolbarProps> {
  title: string;
  onQuickFilterChange?: (value: string) => void;
  onPrint?: () => void;
  showQuickFilter?: boolean;
  showPrint?: boolean;
  showExport?: boolean;
}

export function CustomDataGridToolbar({
  title,
  onQuickFilterChange,
  onPrint,
  showQuickFilter = true,
  showPrint = true,
  showExport = true,
  ...otherProps
}: CustomDataGridToolbarProps) {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <GridToolbarContainer
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 2,
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
      {...otherProps}
    >
      {/* Left Side - Title */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>

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

        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />

        {showPrint && (
          <Button
            size="small"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            variant="outlined"
          >
            Print
          </Button>
        )}

        {showExport && (
          <GridToolbarExport
            slotProps={{
              button: {
                variant: "outlined",
                size: "small",
              },
            }}
            csvOptions={{
              fileName: `${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}`,
              utf8WithBom: true,
            }}
            printOptions={{
              hideFooter: true,
              hideToolbar: true,
            }}
          />
        )}
      </Box>
    </GridToolbarContainer>
  );
}
