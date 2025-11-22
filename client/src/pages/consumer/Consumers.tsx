import { useState, useEffect } from "react";
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
  Paper,
  Grid,
  Tooltip,
  Badge,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  DataGrid,
  Toolbar,
  ToolbarButton,
  ColumnsPanelTrigger,
  FilterPanelTrigger,
  ExportCsv,
  ExportPrint,
} from "@mui/x-data-grid";
import type {
  GridColDef,
  GridRenderCellParams,
  GridRowParams,
} from "@mui/x-data-grid";
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  ViewColumn as ViewColumnIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
  Print as PrintIcon,
  Close as CloseIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { consumersApi, connectionsApi } from "../../services/api";
import { useSnackbar } from "../../contexts/SnackbarContext";
import type { ConsumerListItem, ConsumerDetail, ConnectionDetails, OptingStatus } from "../../types/consumers";
import { CustomToolbar } from "@/components/CustomToolbar";
import { KYC_FILTER_OPTIONS } from "@/components/custom/FilterToggle";
import { useDialog } from "@/hooks";
import { useResourcePermissions } from "@/hooks/usePermission";

const Consumers = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const consumerPerms = useResourcePermissions('consumers');
  const [consumers, setConsumers] = useState<ConsumerListItem[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const deleteDialog = useDialog<number>();
  const infoDialog = useDialog<ConsumerDetail>();
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [kycFilter, setKycFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [connections, setConnections] = useState<ConnectionDetails[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      // Reset to first page when searching
      if (searchInput !== searchQuery) {
        setPaginationModel(prev => ({ ...prev, page: 0 }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchConsumers();
  }, [paginationModel.page, paginationModel.pageSize, sortModel, searchQuery, kycFilter]);

  const fetchConsumers = async () => {
    try {
      setLoading(true);

      // Build ordering parameter from sortModel
      let ordering = '';
      if (sortModel.length > 0) {
        const { field, sort } = sortModel[0];
        ordering = sort === 'desc' ? `-${field}` : field;
      }

      // Build KYC filter parameter
      let is_kyc_done = undefined;
      if (kycFilter === 'done') is_kyc_done = true;
      if (kycFilter === 'pending') is_kyc_done = false;

      const response = await consumersApi.getAll({
        page: paginationModel.page + 1,
        page_size: paginationModel.pageSize,
        ordering,
        search: searchQuery || undefined,
        is_kyc_done,
      });

      const data = response.data;
      setConsumers(data.results || data);
      setRowCount(data.count || (data.results ? data.results.length : data.length));
    } catch (error) {
      showSnackbar("Failed to fetch consumers", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.data) return;

    try {
      await consumersApi.delete(deleteDialog.data);
      showSnackbar("Consumer deleted successfully", "success");
      deleteDialog.close();
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

  const handleViewInfo = async (consumerId: number) => {
    try {
      setLoadingDetails(true);
      // Fetch consumer details and connections in parallel
      const [consumerResponse, connectionsResponse] = await Promise.all([
        consumersApi.getById(consumerId),
        connectionsApi.getByConsumer(consumerId)
      ]);
      infoDialog.open(consumerResponse.data);
      setConnections(connectionsResponse.data);
    } catch (error) {
      showSnackbar("Failed to fetch consumer details", "error");
      console.error(error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleKycFilterChange = (filter: 'all' | 'pending' | 'done') => {
    setKycFilter(filter);
    // Reset to first page when filtering
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

  const handleExportCSV = async () => {
    try {
      setCsvLoading(true);

      // Build the same filters as the current view
      let ordering = '';
      if (sortModel.length > 0) {
        const { field, sort } = sortModel[0];
        ordering = sort === 'desc' ? `-${field}` : field;
      }

      let is_kyc_done = undefined;
      if (kycFilter === 'done') is_kyc_done = true;
      if (kycFilter === 'pending') is_kyc_done = false;

      const response = await consumersApi.exportCSV({
        search: searchQuery || undefined,
        ordering,
        is_kyc_done,
      });

      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `consumers_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSnackbar('CSV exported successfully', 'success');
    } catch (error) {
      console.error('Failed to export CSV:', error);
      showSnackbar('Failed to export CSV', 'error');
    } finally {
      setCsvLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setPdfLoading(true);

      // Build the same filters as the current view
      let ordering = '';
      if (sortModel.length > 0) {
        const { field, sort } = sortModel[0];
        ordering = sort === 'desc' ? `-${field}` : field;
      }

      let is_kyc_done = undefined;
      if (kycFilter === 'done') is_kyc_done = true;
      if (kycFilter === 'pending') is_kyc_done = false;

      const response = await consumersApi.exportPDF({
        search: searchQuery || undefined,
        ordering,
        is_kyc_done,
      });

      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `consumers_${new Date().toISOString().split('T')[0]}.pdf`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSnackbar('PDF exported successfully', 'success');
    } catch (error) {
      console.error('Failed to export PDF:', error);
      showSnackbar('Failed to export PDF', 'error');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExcelLoading(true);

      // Build the same filters as the current view
      let ordering = '';
      if (sortModel.length > 0) {
        const { field, sort } = sortModel[0];
        ordering = sort === 'desc' ? `-${field}` : field;
      }

      let is_kyc_done = undefined;
      if (kycFilter === 'done') is_kyc_done = true;
      if (kycFilter === 'pending') is_kyc_done = false;

      const response = await consumersApi.exportExcel({
        search: searchQuery || undefined,
        ordering,
        is_kyc_done,
      });

      // Create download link
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `consumers_${new Date().toISOString().split('T')[0]}.xlsx`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSnackbar('Excel exported successfully', 'success');
    } catch (error) {
      console.error('Failed to export Excel:', error);
      showSnackbar('Failed to export Excel', 'error');
    } finally {
      setExcelLoading(false);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "info",
      headerName: "",
      width: 60,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      resizable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title="View Connection Info" arrow>
          <IconButton
            size="small"
            onClick={() => handleViewInfo(params.row.id)}
            color="info"
            disabled={loadingDetails}
          >
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
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
          {consumerPerms.canView() && (
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
          )}
          {consumerPerms.canEdit() && (
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
          )}
          {consumerPerms.canDelete() && (
            <IconButton
              size="small"
              onClick={() => deleteDialog.open(params.row.id)}
              sx={{
                bgcolor: "rgba(244, 67, 54, 0.1)",
                "&:hover": { bgcolor: "rgba(244, 67, 54, 0.2)" },
                padding: "4px",
              }}
            >
              <DeleteIcon sx={{ fontSize: 18, color: "#f44336" }} />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  const getRowClassName = (params: GridRowParams) => {
    const index = consumers.findIndex(consumer => consumer.id === params.id);
    return index % 2 === 0 ? "even-row" : "odd-row";
  };

  // Server-side filtering is now handled in fetchConsumers

  return (
    <Container maxWidth={false} sx={{ py: 3, px: { xs: 2, sm: 3 }, maxWidth: "1260px" }}>
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
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          rowCount={rowCount}
          pageSizeOptions={[5, 10, 20]}
          paginationMode="server"
          sortingMode="server"
          loading={loading}
          showToolbar
          slots={{
            toolbar: CustomToolbar,
          }}
          slotProps={{
            toolbar: {
              title: 'Consumers',
              searchValue: searchInput,
              onSearchChange: setSearchInput,
              onExportClick: consumerPerms.canExport() ? handleExportCSV : undefined,
              exportLoading: csvLoading,
              showExport: consumerPerms.canExport(),
              showPrint: consumerPerms.canExport(),
              onExportPdf: consumerPerms.canExport() ? handleExportPDF : undefined,
              pdfLoading: pdfLoading,
              onExportExcel: consumerPerms.canExport() ? handleExportExcel : undefined,
              excelLoading: excelLoading,
              filterLabel: 'KYC',
              filterOptions: KYC_FILTER_OPTIONS,
              filterValue: kycFilter,
              onFilterChange: handleKycFilterChange,
            },
          }}
          getRowClassName={getRowClassName}
          disableRowSelectionOnClick
          autoHeight
          disableColumnResize={false}
          columnHeaderHeight={40}
          rowHeight={40}
         
          initialState={{
            columns: {
              columnVisibilityModel: {
                mobile_number: true,
              },
            },
          }}
        />
      </Paper>

      {/* Consumer Info Dialog */}
      <Dialog
        open={infoDialog.isOpen}
        onClose={infoDialog.close}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box>
            <Typography variant="h6" component="div">
              Connection Information
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {infoDialog.data?.consumer_name} - {infoDialog.data?.consumer_number}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#333' }}>Service Number</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#333' }}>Service Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#333' }}>Connection Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#333' }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#333', textAlign: 'center' }}>Regulators</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#333' }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {connections && connections.length > 0 ? (
                  connections.map((connection, index) => (
                    <TableRow
                      key={connection.id}
                      sx={{
                        bgcolor: index % 2 === 0 ? '#fafafa' : 'white',
                        '&:hover': { bgcolor: '#f0f7ff' }
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: '#667eea' }}>
                        {connection.sv_number}
                      </TableCell>
                      <TableCell>
                        {new Date(connection.sv_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{connection.connection_type_name}</TableCell>
                      <TableCell>
                        {connection.product_name}
                        {connection.product_size && connection.product_unit
                          ? ` (${connection.product_size} ${connection.product_unit})`
                          : ''}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        {connection.num_of_regulators}
                      </TableCell>
                      <TableCell>{connection.hist_code_description || '-'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No connections available
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={infoDialog.close} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.isOpen} onClose={deleteDialog.close}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this consumer? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={deleteDialog.close}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Consumers;
