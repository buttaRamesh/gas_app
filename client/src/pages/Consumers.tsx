import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Collapse,
  Paper,
  Grid,
  Divider,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
  GridRenderCellParams,
  GridRowParams,
} from "@mui/x-data-grid";
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  ViewColumn as ViewColumnIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
} from "@mui/icons-material";
import { consumersApi } from "../services/api";
import { useSnackbar } from "../contexts/SnackbarContext";
import type { ConsumerListItem, OptingStatus } from "../types/consumers";

const Consumers = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [consumers, setConsumers] = useState<ConsumerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [consumerToDelete, setConsumerToDelete] = useState<number | null>(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [totalRows, setTotalRows] = useState(0);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    fetchConsumers();
  }, [paginationModel.page, paginationModel.pageSize]);

  const fetchConsumers = async () => {
    try {
      setLoading(true);
      const response = await consumersApi.getAll({
        page: paginationModel.page + 1,
      });
      const data = response.data;
      setConsumers(data.results || data);
      setTotalRows(data.count || 0);
    } catch (error) {
      showSnackbar("Failed to fetch consumers", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!consumerToDelete) return;

    try {
      await consumersApi.delete(consumerToDelete);
      showSnackbar("Consumer deleted successfully", "success");
      setDeleteDialogOpen(false);
      setConsumerToDelete(null);
      fetchConsumers();
    } catch (error) {
      showSnackbar("Failed to delete consumer", "error");
      console.error(error);
    }
  };

  const getOptingStatusColor = (status: OptingStatus) => {
    switch (status) {
      case "OPT_IN":
        return "success";
      case "OPT_OUT":
        return "error";
      case "PENDING":
        return "warning";
      default:
        return "default";
    }
  };

  const toggleRowExpansion = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleExportCSV = () => {
    const headers = ["Consumer #", "Name", "Category", "Type", "Status", "KYC", "Mobile"];
    const rows = consumers.map(c => [
      c.consumer_number,
      c.consumer_name,
      c.category_name || "",
      c.type_name || "",
      c.opting_status_display || c.opting_status,
      c.is_kyc_done ? "Yes" : "No",
      c.mobile_number || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "consumers.csv";
    link.click();
    URL.revokeObjectURL(url);
    setExportMenuAnchor(null);
  };

  const handlePrint = () => {
    window.print();
    setExportMenuAnchor(null);
  };

  const CustomToolbar = () => {
    return (
      <GridToolbarContainer
        sx={{
          p: 2,
          borderBottom: "2px solid #667eea",
          bgcolor: "#f0f7ff",
          minHeight: "60px",
        }}
      >
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", width: "100%", justifyContent: "flex-end" }}>
          <GridToolbarColumnsButton />
          <GridToolbarFilterButton />

          <Tooltip title="Export">
            <IconButton
              size="small"
              onClick={(e) => setExportMenuAnchor(e.currentTarget)}
              sx={{
                bgcolor: "white",
                border: "1px solid #667eea",
                "&:hover": { bgcolor: "#667eea", color: "white" }
              }}
            >
              <FileDownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <GridToolbarQuickFilter
            sx={{
              bgcolor: "white",
              borderRadius: 1,
              px: 1,
              border: "1px solid #e0e0e0",
              "& .MuiInput-root": {
                fontSize: "0.875rem",
              },
            }}
          />
        </Box>
      </GridToolbarContainer>
    );
  };

  const columns: GridColDef[] = [
    {
      field: "expand",
      headerName: "",
      width: 45,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      resizable: false,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton
          size="small"
          onClick={() => toggleRowExpansion(params.row.id)}
          sx={{
            transform: expandedRows.has(params.row.id) ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s",
          }}
        >
          <ExpandMoreIcon fontSize="small" />
        </IconButton>
      ),
    },
    {
      field: "consumer_number",
      headerName: "Consumer #",
      flex: 0.7,
      minWidth: 85,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography sx={{ fontWeight: 600, color: "#667eea", fontSize: "0.875rem" }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "consumer_name",
      headerName: "Name",
      flex: 1.8,
      minWidth: 110,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "category_name",
      headerName: "Category",
      flex: 0.6,
      minWidth: 80,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }}>
          <Chip
            label={params.value || "-"}
            size="small"
            sx={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "white",
              fontWeight: 600,
              fontSize: "0.75rem",
              height: 24,
            }}
          />
        </Box>
      ),
    },
    {
      field: "type_name",
      headerName: "Type",
      flex: 0.6,
      minWidth: 80,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }}>
          <Chip
            label={params.value || "-"}
            size="small"
            sx={{
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              color: "white",
              fontWeight: 600,
              fontSize: "0.75rem",
              height: 24,
            }}
          />
        </Box>
      ),
    },
    {
      field: "opting_status",
      headerName: "Status",
      flex: 0.6,
      minWidth: 80,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }}>
          <Chip
            label={params.row.opting_status_display || params.value}
            color={getOptingStatusColor(params.value)}
            size="small"
            sx={{ fontWeight: 600, fontSize: "0.75rem", height: 24 }}
          />
        </Box>
      ),
    },
    {
      field: "is_kyc_done",
      headerName: "KYC",
      width: 60,
      resizable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }}>
          {params.value ? (
            <CheckIcon sx={{ color: "#4caf50", fontSize: 20 }} />
          ) : (
            <CancelIcon sx={{ color: "#f44336", fontSize: 20 }} />
          )}
        </Box>
      ),
    },
    {
      field: "mobile_number",
      headerName: "Mobile",
      flex: 0.75,
      minWidth: 90,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 110,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      resizable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 0.3, width: "100%", height: "100%" }}>
          <IconButton
            size="small"
            onClick={() => navigate(`/consumers/${params.row.id}`)}
            sx={{
              bgcolor: "rgba(103, 126, 234, 0.1)",
              "&:hover": { bgcolor: "rgba(103, 126, 234, 0.2)" },
              padding: "4px",
            }}
          >
            <ViewIcon sx={{ fontSize: 18, color: "#667eea" }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => navigate(`/consumers/${params.row.id}/edit`)}
            sx={{
              bgcolor: "rgba(79, 172, 254, 0.1)",
              "&:hover": { bgcolor: "rgba(79, 172, 254, 0.2)" },
              padding: "4px",
            }}
          >
            <EditIcon sx={{ fontSize: 18, color: "#4facfe" }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              setConsumerToDelete(params.row.id);
              setDeleteDialogOpen(true);
            }}
            sx={{
              bgcolor: "rgba(244, 67, 54, 0.1)",
              "&:hover": { bgcolor: "rgba(244, 67, 54, 0.2)" },
              padding: "4px",
            }}
          >
            <DeleteIcon sx={{ fontSize: 18, color: "#f44336" }} />
          </IconButton>
        </Box>
      ),
    },
  ];

  const getRowClassName = (params: GridRowParams) => {
    return params.indexRelativeToCurrentPage % 2 === 0 ? "even-row" : "odd-row";
  };

  const DetailPanel = ({ row }: { row: ConsumerListItem }) => (
    <Box sx={{ p: 3, bgcolor: "#f8f9fa" }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Father's Name
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {row.father_name || "-"}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Mother's Name
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {row.mother_name || "-"}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Spouse Name
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {row.spouse_name || "-"}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Ration Card Number
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {row.ration_card_num || "-"}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Blue Book
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {row.blue_book || "-"}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            LPG ID
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {row.lpg_id || "-"}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Container maxWidth={false} sx={{ py: 3, px: { xs: 2, sm: 3 }, maxWidth: "1260px" }}>
      {/* Title and Add Button */}
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "primary.main" }}>
          Consumers
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/consumers/create")}
          sx={{
            bgcolor: "#667eea",
            "&:hover": { bgcolor: "#5568d3" },
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Add Consumer
        </Button>
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "auto",
          border: "1px solid #e0e0e0",
          width: "100%",
        }}
      >
        <DataGrid
          rows={consumers}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 50]}
          paginationMode="server"
          rowCount={totalRows}
          loading={loading}
          slots={{
            toolbar: CustomToolbar,
          }}
          getRowClassName={getRowClassName}
          disableRowSelectionOnClick
          autoHeight
          disableColumnResize={false}
          columnHeaderHeight={40}
          rowHeight={40}
          sx={{
            border: "none",
            width: "100%",
            "& .MuiDataGrid-main": {
              borderRadius: 0,
            },
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: "#f5f5f5",
              borderBottom: "2px solid #667eea",
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: 700,
                color: "#333",
              },
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #f0f0f0",
            },
            "& .even-row": {
              bgcolor: "#fafafa",
            },
            "& .odd-row": {
              bgcolor: "white",
            },
            "& .MuiDataGrid-row:hover": {
              bgcolor: "#f0f7ff !important",
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "2px solid #667eea",
              bgcolor: "#f5f5f5",
            },
            "& .MuiDataGrid-virtualScroller": {
              overflowX: "auto",
            },
          }}
          initialState={{
            columns: {
              columnVisibilityModel: {
                mobile_number: true,
              },
            },
          }}
        />

        {/* Expandable Detail Rows */}
        {consumers.map((row) => (
          <Collapse key={row.id} in={expandedRows.has(row.id)} timeout="auto" unmountOnExit>
            <DetailPanel row={row} />
            <Divider />
          </Collapse>
        ))}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this consumer? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Menu */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={() => setExportMenuAnchor(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handlePrint}>Print</MenuItem>
        <MenuItem onClick={handleExportCSV}>Download as CSV</MenuItem>
      </Menu>
    </Container>
  );
};

export default Consumers;
