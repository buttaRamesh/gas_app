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
  QuickFilter,
  QuickFilterControl,
  QuickFilterClear,
  QuickFilterTrigger,
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
import { consumersApi, connectionsApi } from "../services/api";
import { useSnackbar } from "../contexts/SnackbarContext";
import type { ConsumerListItem, ConsumerDetail, ConnectionDetails, OptingStatus } from "../types/consumers";

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
  const [kycFilter, setKycFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [openInfoDialog, setOpenInfoDialog] = useState(false);
  const [selectedConsumer, setSelectedConsumer] = useState<ConsumerDetail | null>(null);
  const [connections, setConnections] = useState<ConnectionDetails[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

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

  const handleViewInfo = async (consumerId: number) => {
    try {
      setLoadingDetails(true);
      // Fetch consumer details and connections in parallel
      const [consumerResponse, connectionsResponse] = await Promise.all([
        consumersApi.getById(consumerId),
        connectionsApi.getByConsumer(consumerId)
      ]);
      setSelectedConsumer(consumerResponse.data);
      setConnections(connectionsResponse.data);
      setOpenInfoDialog(true);
    } catch (error) {
      showSnackbar("Failed to fetch consumer details", "error");
      console.error(error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleKycFilterChange = (filter: 'all' | 'pending' | 'done') => {
    setKycFilter(filter);
  };

  const CustomToolbar = () => {
    return (
      <Toolbar
        // @ts-expect-error - Toolbar supports sx prop but type definitions are incomplete
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '64px',
          flexWrap: 'nowrap',
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
            Consumers
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
          {/* Expandable Search */}
          <QuickFilter
            render={(_filterProps, state) => (
              <Box
                sx={{
                  display: 'grid',
                  alignItems: 'flex-end',
                  width: state.expanded ? '375px' : '40px',
                  transition: 'width 0.3s',
                }}
              >
                <QuickFilterTrigger
                  render={(triggerProps) => (
                    <Tooltip title="Search" arrow>
                      <ToolbarButton
                        {...triggerProps}
                        // @ts-expect-error - ToolbarButton supports sx prop but type definitions are incomplete
                        sx={{
                          gridArea: '1 / 1',
                          width: '40px',
                          height: '40px',
                          minWidth: '40px',
                          zIndex: 1,
                          opacity: state.expanded ? 0 : 1,
                          pointerEvents: state.expanded ? 'none' : 'auto',
                          transition: 'opacity 0.3s',
                          border: 'none',
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 0,
                        }}
                        aria-disabled={state.expanded}
                      >
                        <SearchIcon sx={{ fontSize: '20px' }} />
                      </ToolbarButton>
                    </Tooltip>
                  )}
                />
                <QuickFilterControl
                  render={({ ref, ...controlProps }) => (
                    <TextField
                      {...controlProps}
                      inputRef={ref}
                      variant="standard"
                      placeholder="Search..."
                      aria-label="Search"
                      size="small"
                      sx={{
                        gridArea: '1 / 1',
                        width: '100%',
                        opacity: state.expanded ? 1 : 0,
                        transition: 'opacity 0.3s',
                        pointerEvents: state.expanded ? 'auto' : 'none',
                        '& .MuiInput-root': {
                          fontSize: '0.875rem',
                        },
                        '& .MuiInput-root:before': {
                          borderBottomColor: 'divider',
                        },
                        '& .MuiInput-root:hover:not(.Mui-disabled):before': {
                          borderBottomColor: 'text.secondary',
                        },
                        '& .MuiInput-root:after': {
                          borderBottomColor: 'primary.main',
                        },
                      }}
                      slotProps={{
                        input: {
                          endAdornment: state.value ? (
                            <QuickFilterClear
                              edge="end"
                              size="small"
                              aria-label="Clear search"
                              // @ts-expect-error - QuickFilterClear supports sx prop but type definitions are incomplete
                              sx={{ marginRight: -0.75 }}
                            >
                              <CloseIcon sx={{ fontSize: '18px' }} />
                            </QuickFilterClear>
                          ) : null,
                          ...controlProps.slotProps?.input,
                        },
                        ...controlProps.slotProps,
                      }}
                    />
                  )}
                />
              </Box>
            )}
          />

          {/* KYC Status Filters */}
          <Box
            component="fieldset"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              border: 'none',
              borderBottom: '1px solid',
              borderColor: 'divider',
              borderRadius: 0,
              padding: '4px 6px 5px 6px',
              backgroundColor: 'transparent',
              margin: 0,
              position: 'relative',
            }}
          >
            <Box
              component="legend"
              sx={{
                fontSize: '10px',
                color: 'text.secondary',
                padding: '0 4px',
                fontWeight: 500,
              }}
            >
              KYC
            </Box>

            <Tooltip title="All" arrow>
              <IconButton
                size="small"
                onClick={() => handleKycFilterChange('all')}
                aria-label="All KYC"
                sx={{
                  width: '20px',
                  height: '20px',
                  padding: 0,
                  backgroundColor: kycFilter === 'all' ? 'primary.main' : 'transparent',
                  border: kycFilter === 'all' ? 'none' : '1.5px solid',
                  borderColor: kycFilter === 'all' ? 'transparent' : 'divider',
                  borderRadius: '50%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: kycFilter === 'all' ? 'primary.dark' : 'action.hover',
                    transform: 'scale(1.15)',
                  },
                }}
              >
                {kycFilter === 'all' && (
                  <Box
                    sx={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    }}
                  />
                )}
              </IconButton>
            </Tooltip>

            <Tooltip title="Pending" arrow>
              <IconButton
                size="small"
                onClick={() => handleKycFilterChange('pending')}
                aria-label="KYC Pending"
                sx={{
                  width: '20px',
                  height: '20px',
                  padding: 0,
                  backgroundColor: kycFilter === 'pending' ? 'error.main' : 'transparent',
                  border: kycFilter === 'pending' ? 'none' : '1.5px solid',
                  borderColor: kycFilter === 'pending' ? 'transparent' : 'divider',
                  borderRadius: '50%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: kycFilter === 'pending' ? 'error.dark' : 'action.hover',
                    transform: 'scale(1.15)',
                  },
                }}
              >
                {kycFilter === 'pending' && (
                  <Box
                    sx={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    }}
                  />
                )}
              </IconButton>
            </Tooltip>

            <Tooltip title="Done" arrow>
              <IconButton
                size="small"
                onClick={() => handleKycFilterChange('done')}
                aria-label="KYC Done"
                sx={{
                  width: '20px',
                  height: '20px',
                  padding: 0,
                  backgroundColor: kycFilter === 'done' ? 'success.main' : 'transparent',
                  border: kycFilter === 'done' ? 'none' : '1.5px solid',
                  borderColor: kycFilter === 'done' ? 'transparent' : 'divider',
                  borderRadius: '50%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: kycFilter === 'done' ? 'success.dark' : 'action.hover',
                    transform: 'scale(1.15)',
                  },
                }}
              >
                {kycFilter === 'done' && (
                  <Box
                    sx={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    }}
                  />
                )}
              </IconButton>
            </Tooltip>
          </Box>

          {/* Toolbar Action Buttons */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              '& .MuiButtonBase-root': {
                color: 'primary.main',
                '&:hover': {
                  color: 'primary.dark',
                  backgroundColor: 'action.hover',
                },
              },
            }}
          >
            <Tooltip title="Columns" arrow>
              <ColumnsPanelTrigger render={<ToolbarButton />}>
                <ViewColumnIcon sx={{ fontSize: '20px' }} />
              </ColumnsPanelTrigger>
            </Tooltip>

            <Tooltip title="Filters" arrow>
              <FilterPanelTrigger
                render={(props, state) => (
                  // @ts-expect-error - ToolbarButton ref type incompatibility with Tooltip
                  <ToolbarButton {...props}>
                    <Badge badgeContent={state.filterCount} color="primary" variant="dot">
                      <FilterListIcon sx={{ fontSize: '20px' }} />
                    </Badge>
                  </ToolbarButton>
                )}
              />
            </Tooltip>

            <Tooltip title="Download as CSV" arrow>
              <ExportCsv render={<ToolbarButton />}>
                <FileDownloadIcon sx={{ fontSize: '20px' }} />
              </ExportCsv>
            </Tooltip>

            <Tooltip title="Print" arrow>
              <ExportPrint render={<ToolbarButton />}>
                <PrintIcon sx={{ fontSize: '20px' }} />
              </ExportPrint>
            </Tooltip>
          </Box>

          {/* Add Consumer Button */}
          <Tooltip title="Add Consumer" arrow>
            <IconButton
              size="medium"
              onClick={() => navigate("/consumers/create")}
              sx={{
                border: '1px solid',
                borderColor: '#667eea',
                borderRadius: '16px',
                height: '36px',
                width: '48px',
                backgroundColor: '#667eea',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#5568d3',
                  borderColor: '#5568d3',
                },
              }}
            >
              <AddIcon sx={{ fontSize: '18px' }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    );
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
    const index = consumers.findIndex(consumer => consumer.id === params.id);
    return index % 2 === 0 ? "even-row" : "odd-row";
  };

  // Filter consumers by KYC status
  const filteredConsumers = consumers.filter((consumer) => {
    if (kycFilter === 'all') return true;
    if (kycFilter === 'pending') return !consumer.is_kyc_done;
    if (kycFilter === 'done') return consumer.is_kyc_done;
    return true;
  });

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
          rows={filteredConsumers}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 50]}
          paginationMode="client"
          loading={loading}
          showToolbar
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
      </Paper>

      {/* Consumer Info Dialog */}
      <Dialog
        open={openInfoDialog}
        onClose={() => setOpenInfoDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box>
            <Typography variant="h6" component="div">
              Connection Information
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedConsumer?.consumer_name} - {selectedConsumer?.consumer_number}
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
          <Button onClick={() => setOpenInfoDialog(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

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
    </Container>
  );
};

export default Consumers;
