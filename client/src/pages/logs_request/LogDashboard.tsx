import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Paper,
  TextField,
  IconButton,
  Tooltip,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import axios from "axios";
import RefreshIcon from "@mui/icons-material/Refresh";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

// -----------------------------------------------------
// 🔹 Types
// -----------------------------------------------------
interface LogRecord {
  id: number;
  timestamp?: string;
  ip_address?: string;
  method?: string;
  path?: string;
  referer?: string;
  status_code?: number;
  error_type?: string;
  error_message?: string;
}

// -----------------------------------------------------
// 🔹 Utility: Date Formatter
// -----------------------------------------------------
const formatDate = (value?: string): string => {
  if (!value) return "—";
  const normalized = value.replace(/(\.\d{3})\d*Z$/, "$1Z");
  const date = new Date(normalized);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

// -----------------------------------------------------
// 🔹 Component: LogDashboard
// -----------------------------------------------------
export default function LogDashboard() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [errors, setErrors] = useState<LogRecord[]>([]);
  const [search, setSearch] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const BASE_URL = "http://127.0.0.1:8000/api/";

  // -----------------------------------------------------
  // 🔹 Fetch Logs
  // -----------------------------------------------------
  const fetchLogs = async (): Promise<void> => {
    try {
      const endpoint = tab === 0 ? "logger/logs/" : "logger/errors/";
      const fullUrl = BASE_URL + endpoint;

      const res = await axios.get(fullUrl); // interceptor adds header automatically
      const rows: LogRecord[] = res.data?.results ?? [];

      const withIds = rows.map((item, index) => ({
        ...item,
        id: item.id ?? index + 1,
      }));

      if (tab === 0) setLogs(withIds);
      else setErrors(withIds);
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------
  // 🔹 Auto Refresh every 10 seconds
  // -----------------------------------------------------
  useEffect(() => {
    fetchLogs();
  }, [tab]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLogs();
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, [tab, autoRefresh]);

  // -----------------------------------------------------
  // 🔹 Filtered Data (Search)
  // -----------------------------------------------------
  const filteredData = useMemo(() => {
    const data = tab === 0 ? logs : errors;
    if (!search.trim()) return data;
    const term = search.toLowerCase();
    return data.filter(
      (row) =>
        row.path?.toLowerCase().includes(term) ||
        row.method?.toLowerCase().includes(term) ||
        String(row.status_code || "").includes(term)
    );
  }, [tab, logs, errors, search]);

  // -----------------------------------------------------
  // 🔹 Columns
  // -----------------------------------------------------
  const columnsLogs: GridColDef<LogRecord>[] = [
    { field: "id", headerName: "ID", width: 70 },
    {
      field: "timestamp",
      headerName: "Date & Time",
      flex: 1.3,
      renderCell: (params) => <>{formatDate(params.row.timestamp)}</>,
    },
    { field: "ip_address", headerName: "IP", flex: 1 },
    { field: "method", headerName: "Method", width: 50 },
    { field: "path", headerName: "Path", flex: 1.25 },
    { field: "referer", headerName: "Referer", flex: 2.5 },
    { field: "status_code", headerName: "Status", width: 100 },
  ];

  const columnsErrors: GridColDef<LogRecord>[] = [
    { field: "id", headerName: "ID", width: 70 },
    {
      field: "timestamp",
      headerName: "Date & Time",
      flex: 1.3,
      renderCell: (params) => <>{formatDate(params.row.timestamp)}</>,
    },
    { field: "ip_address", headerName: "IP", flex: 1 },
    { field: "method", headerName: "Method", width: 100 },
    { field: "path", headerName: "Path", flex: 2 },
    { field: "status_code", headerName: "Status", width: 100 },
    { field: "error_type", headerName: "Error Type", flex: 1.2 },
    {
      field: "error_message",
      headerName: "Message",
      flex: 2,
      renderCell: (params) => (
        <span style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {params.row.error_message || "—"}
        </span>
      ),
    },
  ];

  // -----------------------------------------------------
  // 🔹 UI
  // -----------------------------------------------------
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        🔍 API Logger Dashboard
      </Typography>

      <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_, newValue) => setTab(newValue)}
          centered
          indicatorColor="primary"
          textColor="primary"
          sx={{
            borderBottom: "1px solid #ddd",
            bgcolor: "#fafafa",
          }}
        >
          <Tab label="Requests" />
          <Tab label="Errors" />
        </Tabs>

        {/* Toolbar: Search + Auto-refresh toggle */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            borderBottom: "1px solid #eee",
          }}
        >
          <TextField
            size="small"
            placeholder="Search by path, method or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 350 }}
          />

          <Box>
            <Tooltip title="Manual refresh">
              <IconButton onClick={fetchLogs}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title={autoRefresh ? "Pause auto-refresh" : "Resume auto-refresh"}>
              <IconButton onClick={() => setAutoRefresh(!autoRefresh)}>
                {autoRefresh ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* DataGrid */}
        {loading ? (
          <Box
            sx={{
              p: 6,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ height: "70vh", bgcolor: "#fff" }}>
            <DataGrid
              rows={filteredData}
              columns={tab === 0 ? columnsLogs : columnsErrors}
              getRowId={(row) => row.id}
              initialState={{
                pagination: { paginationModel: { pageSize: 10, page: 0 } },
              }}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              getRowClassName={(params) =>
                params.indexRelativeToCurrentPage % 2 === 0
                  ? "even-row"
                  : "odd-row"
              }
              sx={{
                border: "none",
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#f4f4f4",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                },
                "& .even-row": { backgroundColor: "#fafafa" },
                "& .odd-row": { backgroundColor: "#fff" },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "#eaf4ff",
                },
              }}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
}
