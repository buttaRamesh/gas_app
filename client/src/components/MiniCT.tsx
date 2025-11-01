import { Typography, Tooltip } from "@mui/material";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';
import {
  Toolbar,
  ToolbarButton,
  // ExportCsv,
  ExportPrint,
} from "@mui/x-data-grid";

interface MiniCTProps {
  title : string;
  onExportClick?: () => void;
  exportLoading?: boolean;
}

export function MiniCT({title, onExportClick, exportLoading }: MiniCTProps = {}) {
  return (
    <Toolbar>
      <Typography fontWeight="medium" sx={{ flex: 1, mx: 1 }}>
        {title}
      </Typography>
      <Tooltip title={exportLoading ? "Exporting..." : "Download as CSV"}>
          <ToolbarButton onClick={onExportClick} disabled={exportLoading}>
            <FileDownloadIcon fontSize="small" />
          </ToolbarButton>
      </Tooltip>
      {/* <Tooltip title={exportLoading ? "Exporting..." : "Download as CSV"}>
        {onExportClick ? (
          <ToolbarButton onClick={onExportClick} disabled={exportLoading}>
            <FileDownloadIcon fontSize="small" />
          </ToolbarButton>
        ) : (
          <ExportCsv render={<ToolbarButton />}>
            <FileDownloadIcon fontSize="small" />
          </ExportCsv>
        )} */}
      {/* </Tooltip> */}
      <Tooltip title="Print">
        <ExportPrint render={<ToolbarButton />}>
          <PrintIcon fontSize="small" />
        </ExportPrint>
      </Tooltip>
    </Toolbar>
  );
}

