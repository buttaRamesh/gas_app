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
  Paper,
  Tooltip,
  Alert,
} from "@mui/material";
import { ToolbarButton } from "@mui/x-data-grid";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowParams,
} from "@mui/x-data-grid";
import {
  CheckCircle as DeliveredIcon,
  UploadFile as UploadIcon,
  Pending as PendingIcon,
  DeleteSweep as ClearIcon,
} from "@mui/icons-material";
import { orderBookApi, deliveryFlagsApi } from "../../services/api";
import { useSnackbar } from "../../contexts/SnackbarContext";
import type { OrderBookListItem, BulkUploadResponse } from "../../types/orderbook";
import { CustomToolbar } from "@/components/CustomToolbar";
import { useDialog } from "@/hooks";
import MarkDeliveredDialog from "../../components/order_book/MarkDeliveredDialog";
import OrderDetailDialog from "../../components/order_book/OrderDetailDialog";

const PENDING_FILTER_OPTIONS = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'delivered', label: 'Delivered' },
];

// Utility function to format date as dd-mm-yyyy
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const OrderBook = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [orders, setOrders] = useState<OrderBookListItem[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const deliverDialog = useDialog<OrderBookListItem>();
  const uploadResultDialog = useDialog<BulkUploadResponse>();
  const detailDialog = useDialog<any>();
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<any[]>([
    { field: 'book_date', sort: 'asc' },
    { field: 'order_no', sort: 'asc' },
  ]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [pendingFilter, setPendingFilter] = useState<'all' | 'pending' | 'delivered'>('all');
  const [exportLoading, setExportLoading] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [deliveryFlags, setDeliveryFlags] = useState<Array<{ id: number; name: string }>>([]);

  // Column visibility configurations for each tab
  const getColumnVisibility = (filter: string) => {
    switch (filter) {
      case 'all':
        return {
          order_no: true,
          book_date: true,
          consumer_number: true,
          consumer_name: false,
          mobile_number: false,
          product: true,
          last_delivery_date: true,
          refill_type_name: true,
          delivery_flag_name: true,
          delivery_date: false,
          delivery_person_name: false,
          payment_info: false,
          cash_memo_no: false,
          is_pending: false,
          actions: false,
        };
      case 'pending':
        return {
          order_no: true,
          book_date: true,
          consumer_number: true,
          consumer_name: false,
          mobile_number: false,
          product: true,
          last_delivery_date: false,
          refill_type_name: true,
          delivery_flag_name: true,
          delivery_date: false,
          delivery_person_name: false,
          payment_info: true,
          cash_memo_no: false,
          is_pending: false,
          actions: true,
        };
      case 'delivered':
        return {
          order_no: true,
          book_date: true,
          consumer_number: true,
          consumer_name: false,
          mobile_number: false,
          product: true,
          last_delivery_date: false,
          refill_type_name: false,
          delivery_flag_name: false,
          delivery_date: true,
          delivery_person_name: true,
          payment_info: true,
          cash_memo_no: true,
          is_pending: false,
          actions: false,
        };
      default:
        return {
          order_no: true,
          book_date: true,
          consumer_number: true,
          consumer_name: false,
          mobile_number: false,
          product: true,
          last_delivery_date: true,
          refill_type_name: true,
          delivery_flag_name: true,
          delivery_date: false,
          delivery_person_name: false,
          payment_info: false,
          cash_memo_no: false,
          is_pending: false,
          actions: false,
        };
    }
  };

  const [columnVisibilityModel, setColumnVisibilityModel] = useState(
    getColumnVisibility(pendingFilter)
  );

  // Update column visibility when pendingFilter changes
  useEffect(() => {
    setColumnVisibilityModel(getColumnVisibility(pendingFilter));
  }, [pendingFilter]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      if (searchInput !== searchQuery) {
        setPaginationModel(prev => ({ ...prev, page: 0 }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchOrders();
  }, [paginationModel.page, paginationModel.pageSize, sortModel, searchQuery, pendingFilter]);

  // Fetch delivery flags on mount
  useEffect(() => {
    const fetchDeliveryFlags = async () => {
      try {
        const response = await deliveryFlagsApi.getAll();
        setDeliveryFlags(response.data);
      } catch (error) {
        console.error("Failed to fetch delivery flags:", error);
      }
    };
    fetchDeliveryFlags();
  }, []);

  // Helper function to get color based on delivery flag status
  const getDeliveryStatusColor = (statusName: string): "success" | "warning" | "error" | "info" | "default" => {
    switch (statusName) {
      case "Delivery Done":
        return "success";  // Green - completed delivery
      case "Schedule":
        return "info";  // Blue - scheduled for delivery
      case "Booked Not Printed":
        return "warning";  // Orange - booked but not yet printed
      default:
        return "default";  // Gray - unknown status
    }
  };

  // Map frontend field names to backend field names for sorting
  const mapSortField = (frontendField: string): string => {
    const fieldMapping: Record<string, string> = {
      'consumer_number': 'consumer__consumer_number',
      'consumer_name': 'consumer__person__person_name',
      'delivery_flag_name': 'delivery_flag__name',
      'refill_type_name': 'refill_type__name',
      'delivery_person_name': 'delivery_person__person__person_name',
      // Fields that match directly
      'book_date': 'book_date',
      'order_no': 'order_no',
      'product': 'product',
      'last_delivery_date': 'last_delivery_date',
      'delivery_date': 'delivery_date',
      'is_pending': 'is_pending',
    };
    return fieldMapping[frontendField] || frontendField;
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);

      // Build ordering parameter from sortModel (supports multiple columns)
      let ordering = '';
      if (sortModel.length > 0) {
        // Map all sort fields and join with comma
        const orderingFields = sortModel.map(({ field, sort }) => {
          const backendField = mapSortField(field);
          return sort === 'desc' ? `-${backendField}` : backendField;
        });
        ordering = orderingFields.join(',');
      }

      // Build pending filter parameter
      let is_pending = undefined;
      if (pendingFilter === 'pending') is_pending = true;
      if (pendingFilter === 'delivered') is_pending = false;

      const response = await orderBookApi.getAll({
        page: paginationModel.page + 1,
        page_size: paginationModel.pageSize,
        ordering,
        search: searchQuery || undefined,
        is_pending,
      });

      const data = response.data;
      setOrders(data.results || data);
      setRowCount(data.count || (data.results ? data.results.length : data.length));
    } catch (error) {
      showSnackbar("Failed to fetch orders", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = async (orderId: number) => {
    try {
      setLoadingDetail(true);
      const response = await orderBookApi.getById(orderId);
      const orderData = response.data;

      // Transform to match OrderDetailDialog interface
      const detailData = {
        id: orderData.id,
        order_no: orderData.order_no,
        book_date: formatDate(orderData.book_date),
        product: orderData.product || '-',
        consumer_name: orderData.consumer_name,
        consumer_number: orderData.consumer_number,
        mobile_number: orderData.mobile_number,
        refill_type: orderData.refill_type?.name || '-',
        delivery_flag: orderData.delivery_flag?.name || '-',
        delivery_date: orderData.delivery_date ? formatDate(orderData.delivery_date) : undefined,
        delivery_person: orderData.delivery_person_name || undefined,
        payment_info: orderData.payment_info ? {
          payment_option: orderData.payment_info.payment_option_name || '-',
          cash_memo_no: orderData.payment_info.cash_memo_no || '-',
          payment_date: orderData.payment_info.payment_date ? formatDate(orderData.payment_info.payment_date) : '-',
          amount: orderData.payment_info.amount || 0,
          payment_status: orderData.payment_info.payment_status || 'PENDING',
          transaction_id: orderData.payment_info.transaction_id,
          notes: orderData.payment_info.notes,
        } : undefined,
      };

      detailDialog.open(detailData);
    } catch (error: any) {
      console.error("Error fetching order details:", error);
      showSnackbar("Failed to load order details", "error");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleMarkDelivered = async (orderId: number, paymentData: any) => {
    try {
      await orderBookApi.markDelivered(orderId, {
        delivery_date: paymentData.delivery_date,
        delivery_person: paymentData.delivery_person,
        payment_option: paymentData.payment_option,
        cash_memo_no: paymentData.cash_memo_no,
        payment_date: paymentData.payment_date,
        amount: parseFloat(paymentData.amount),
        payment_status: paymentData.payment_status,
        transaction_id: paymentData.transaction_id || null,
        notes: paymentData.notes || null,
        confirm: true,
      });
      showSnackbar("Order marked as delivered with payment info saved successfully", "success");
      deliverDialog.close();
      fetchOrders();
    } catch (error: any) {
      const errorMessage = error.response?.data?.delivery_date?.[0]
        || error.response?.data?.error
        || "Failed to mark order as delivered";
      showSnackbar(errorMessage, "error");
      console.error(error);
      throw error; // Re-throw to let dialog handle it
    }
  };

  const handlePendingFilterChange = (filter: 'all' | 'pending' | 'delivered') => {
    setPendingFilter(filter);
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed:', event.target.files);
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file.name, file.type, file.size);
    if (!file.name.endsWith('.csv')) {
      showSnackbar("Please upload a CSV file", "error");
      return;
    }

    uploadCSVFile(file);
  };

  const uploadCSVFile = async (file: File) => {
    try {
      console.log('Starting CSV upload for file:', file.name);
      setUploadLoading(true);
      console.log('Calling API...');
      const response = await orderBookApi.bulkUpload(file);
      console.log('API response:', response);
      const result: BulkUploadResponse = response.data;
      console.log('Upload result:', result);

      if (result.success_count > 0) {
        showSnackbar(
          `Upload completed: ${result.success_count} orders processed`,
          result.error_count > 0 ? "warning" : "success"
        );
        fetchOrders();
      }

      if (result.error_count > 0) {
        uploadResultDialog.open(result);
      }
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.message || "Failed to upload CSV file",
        "error"
      );
      console.error(error);
    } finally {
      setUploadLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    console.log('Upload button clicked, fileInputRef:', fileInputRef.current);
    fileInputRef.current?.click();
  };

  const handleExportCSV = async () => {
    try {
      setExportLoading(true);
      // Build query parameters for export (supports multiple columns)
      let ordering = '';
      if (sortModel.length > 0) {
        // Map all sort fields and join with comma
        const orderingFields = sortModel.map(({ field, sort }) => {
          const backendField = mapSortField(field);
          return sort === 'desc' ? `-${backendField}` : backendField;
        });
        ordering = orderingFields.join(',');
      }

      let is_pending = undefined;
      if (pendingFilter === 'pending') is_pending = true;
      if (pendingFilter === 'delivered') is_pending = false;

      const response = await orderBookApi.exportCSV({
        ordering,
        search: searchQuery || undefined,
        is_pending,
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orderbook_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showSnackbar("Export completed successfully", "success");
    } catch (error) {
      showSnackbar("Failed to export orders", "error");
      console.error(error);
    } finally {
      setExportLoading(false);
    }
  };

  const handleClearData = async () => {
    try {
      setClearLoading(true);
      const response = await orderBookApi.clearData();
      const result = response.data;

      if (result.success) {
        showSnackbar(result.message, "success");
        fetchOrders(); // Refresh the list
      } else {
        showSnackbar(result.message || "Failed to clear data", "error");
      }
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.message || "Failed to clear OrderBook data",
        "error"
      );
      console.error(error);
    } finally {
      setClearLoading(false);
      setClearDialogOpen(false);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "book_date",
      headerName: "Book Date",
      flex: 1,
      sortable: true,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          {formatDate(params.value)}
        </Box>
      ),
    },
    {
      field: "order_no",
      headerName: "Order #",
      flex: 1,
      sortable: true,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography
            onClick={() => handleOrderClick(params.row.id)}
            sx={{
              fontWeight: 600,
              color: "#667eea",
              fontSize: "0.875rem",
              cursor: "pointer",
              textDecoration: "underline",
              "&:hover": {
                color: "#5568d3",
                textDecoration: "underline",
              },
            }}
          >
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "consumer_number",
      headerName: "Consumer #",
      flex: 1,
      sortable: true,
    },
    {
      field: "consumer_name",
      headerName: "Consumer Name",
      flex: 1,
      sortable: true,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "mobile_number",
      headerName: "Mobile",
      flex: 1,
      sortable: false,  // Can't sort SerializerMethodField
    },
    {
      field: "product",
      headerName: "Product",
      flex: 1,
      sortable: true,
    },
    {
      field: "last_delivery_date",
      headerName: "Last Delv Date",
      flex: 1,
      sortable: true,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          {formatDate(params.value)}
        </Box>
      ),
    },
    {
      field: "delivery_flag_name",
      headerName: "Status",
      flex: 1.5,
      align: "center",
      headerAlign: "center",
      sortable: true,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }}>
          <Chip
            label={params.value || "-"}
            size="small"
            color={getDeliveryStatusColor(params.value)}
            sx={{ fontWeight: 600, fontSize: "0.75rem", height: 24 }}
          />
        </Box>
      ),
    },
    {
      field: "delivery_date",
      headerName: "Delivery Date",
      flex: 1,
      sortable: true,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          {formatDate(params.value)}
        </Box>
      ),
    },
    {
      field: "delivery_person_name",
      headerName: "Delivery Person",
      flex: 2,
      sortable: true,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          {params.value || "-"}
        </Box>
      ),
    },
    {
      field: "refill_type_name",
      headerName: "Refill Type",
      flex: 1.5,
      sortable: true,
    },
    {
      field: "payment_info",
      headerName: "Payment Option",
      flex: 1,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", width: "100%", px: 0.5 }}>
          <Typography sx={{ fontSize: "0.8rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {params.value?.payment_option_name || "-"}
          </Typography>
        </Box>
      ),
    },
    {
      field: "cash_memo_no",
      headerName: "Cash Memo",
      flex: 1,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", width: "100%" }}>
          <Typography sx={{ fontSize: "0.8rem" }}>
            {params.row.payment_info?.cash_memo_no || "-"}
          </Typography>
        </Box>
      ),
    },
    {
      field: "is_pending",
      headerName: "Status",
      flex: 0.5,
      align: "center",
      headerAlign: "center",
      sortable: true,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }}>
          {params.value ? (
            <PendingIcon sx={{ color: "#ff9800", fontSize: 18 }} />
          ) : (
            <DeliveredIcon sx={{ color: "#4caf50", fontSize: 18 }} />
          )}
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.5,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 0.5, width: "100%", height: "100%" }}>
          {params.row.is_pending && (
            <Button
              size="small"
              variant="contained"
              color="success"
              onClick={() => deliverDialog.open(params.row)}
              startIcon={<DeliveredIcon />}
              sx={{
                textTransform: "none",
                fontSize: "0.75rem",
                py: 0.5,
                px: 1.5,
              }}
            >
              Mark Delivered
            </Button>
          )}
        </Box>
      ),
    },
  ];

  const getRowClassName = (params: GridRowParams) => {
    const index = orders.findIndex(order => order.id === params.id);
    return index % 2 === 0 ? "even-row" : "odd-row";
  };

  return (
    <Container maxWidth={false} sx={{ py: 3, px: { xs: 2, sm: 3 }, maxWidth: "1400px" }}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "auto",
          border: "1px solid #e0e0e0",
          width: "100%",
          "& .even-row": {
            backgroundColor: "#fafafa",
          },
          "& .odd-row": {
            backgroundColor: "#ffffff",
          },
          "& .even-row:hover, & .odd-row:hover": {
            backgroundColor: "#f5f5f5 !important",
          },
        }}
      >
        <DataGrid
          rows={orders}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={setColumnVisibilityModel}
          rowCount={rowCount}
          pageSizeOptions={[5, 10, 20, 50]}
          paginationMode="server"
          sortingMode="server"
          loading={loading}
          showToolbar
          slots={{
            toolbar: CustomToolbar,
          }}
          slotProps={{
            toolbar: {
              title: 'Order Book',
              searchValue: searchInput,
              onSearchChange: setSearchInput,
              showExport: true,
              onExportClick: handleExportCSV,
              exportLoading: exportLoading,
              showPrint: true,
              showTabs: true,
              tabValue: pendingFilter,
              onTabChange: (value: string) => {
                setPendingFilter(value as 'all' | 'pending' | 'delivered');
                setPaginationModel(prev => ({ ...prev, page: 0 }));
              },
              customActions: (
                <Tooltip title={clearLoading ? "Clearing..." : "Clear All Data"}>
                  <ToolbarButton
                    onClick={() => setClearDialogOpen(true)}
                    disabled={clearLoading}
                  >
                    <ClearIcon fontSize="small" />
                  </ToolbarButton>
                </Tooltip>
              ),
            },
          }}
          getRowClassName={getRowClassName}
          disableRowSelectionOnClick
          autoHeight
          disableColumnResize={false}
          columnHeaderHeight={40}
          rowHeight={40}
        />
      </Paper>

      {/* Mark Delivered Confirmation Dialog */}
      <MarkDeliveredDialog
        open={deliverDialog.isOpen}
        order={deliverDialog.data}
        onClose={deliverDialog.close}
        onConfirm={handleMarkDelivered}
      />

      {/* Order Detail Dialog */}
      <OrderDetailDialog
        open={detailDialog.isOpen}
        order={detailDialog.data}
        onClose={detailDialog.close}
      />

      {/* Upload Results Dialog */}
      <Dialog
        open={uploadResultDialog.isOpen}
        onClose={uploadResultDialog.close}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>CSV Upload Results</DialogTitle>
        <DialogContent>
          {uploadResultDialog.data && (
            <>
              <Alert severity={uploadResultDialog.data.error_count > 0 ? "warning" : "success"} sx={{ mb: 2 }}>
                {uploadResultDialog.data.message}
              </Alert>

              {uploadResultDialog.data.errors && uploadResultDialog.data.errors.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Errors:
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
                    {uploadResultDialog.data.errors.map((error, index) => (
                      <Box key={index} sx={{ mb: 1.5 }}>
                        <Typography variant="body2" color="error" sx={{ fontWeight: 600 }}>
                          Row {error.row}:
                        </Typography>
                        <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                          {error.errors.map((err, errIdx) => (
                            <li key={errIdx}>
                              <Typography variant="body2" color="text.secondary">
                                {err}
                              </Typography>
                            </li>
                          ))}
                        </ul>
                      </Box>
                    ))}
                  </Paper>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={uploadResultDialog.close} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear Data Confirmation Dialog */}
      <Dialog
        open={clearDialogOpen}
        onClose={() => !clearLoading && setClearDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Clear All OrderBook Data?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action will permanently delete all OrderBook and PaymentInfo records from the database.
            This operation cannot be undone.
          </DialogContentText>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              Warning: This will delete all order data!
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setClearDialogOpen(false)}
            disabled={clearLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleClearData}
            color="error"
            variant="contained"
            disabled={clearLoading}
          >
            {clearLoading ? "Clearing..." : "Clear All Data"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderBook;
