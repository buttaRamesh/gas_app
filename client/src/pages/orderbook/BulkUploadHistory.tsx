import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Paper,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { bulkUploadHistoryApi } from '../../services/api';
import { useSnackbar } from '../../contexts/SnackbarContext';
import type { BulkUploadHistory } from '../../types/orderbook';

const BulkUploadHistoryPage = () => {
  const { showSnackbar } = useSnackbar();
  const [histories, setHistories] = useState<BulkUploadHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });
  const [uploadTypeFilter, setUploadTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedHistory, setSelectedHistory] = useState<BulkUploadHistory | null>(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: paginationModel.page + 1,
        page_size: paginationModel.pageSize,
      };

      if (uploadTypeFilter) {
        params.upload_type = uploadTypeFilter;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await bulkUploadHistoryApi.getAll(params);
      setHistories(response.data.results || []);
      setRowCount(response.data.count || 0);
    } catch (error: any) {
      console.error('Failed to fetch upload history:', error);
      showSnackbar('Failed to fetch upload history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [paginationModel, uploadTypeFilter, statusFilter]);

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'SUCCESS':
        return 'success';
      case 'PARTIAL':
        return 'warning';
      case 'FAILED':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleRowClick = (params: GridRenderCellParams) => {
    const history = params.row as BulkUploadHistory;
    if (history.error_summary && (history.status === 'FAILED' || history.status === 'PARTIAL')) {
      setSelectedHistory(history);
      setErrorDialogOpen(true);
    }
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const parseErrorSummary = (errorSummary: string | undefined): any[] => {
    if (!errorSummary) return [];
    try {
      return JSON.parse(errorSummary);
    } catch {
      return [];
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'file_name',
      headerName: 'File Name',
      width: 250,
      sortable: false,
    },
    {
      field: 'file_type',
      headerName: 'Type',
      width: 80,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value} size="small" variant="outlined" />
      ),
    },
    {
      field: 'upload_type_display',
      headerName: 'Upload Type',
      width: 150,
      sortable: false,
    },
    {
      field: 'file_size_mb',
      headerName: 'Size (MB)',
      width: 100,
      sortable: false,
      valueFormatter: (params) => params ? params.toFixed(2) : '-',
    },
    {
      field: 'row_count',
      headerName: 'Rows',
      width: 80,
      sortable: false,
    },
    {
      field: 'success_count',
      headerName: 'Success',
      width: 90,
      sortable: false,
    },
    {
      field: 'error_count',
      headerName: 'Errors',
      width: 80,
      sortable: false,
    },
    {
      field: 'skipped_count',
      headerName: 'Skipped',
      width: 90,
      sortable: false,
      valueFormatter: (params) => params ?? '-',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.row.status_display}
          color={getStatusColor(params.value as string)}
          size="small"
        />
      ),
    },
    {
      field: 'uploaded_by_name',
      headerName: 'Uploaded By',
      width: 150,
      sortable: false,
    },
    {
      field: 'uploaded_at',
      headerName: 'Upload Date',
      width: 180,
      sortable: false,
      valueFormatter: (params) => formatDateTime(params),
    },
  ];

  return (
    <Container maxWidth={false}>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          Bulk Upload History
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Track all file uploads for pending orders and delivery marking
        </Typography>

        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Upload Type</InputLabel>
            <Select
              value={uploadTypeFilter}
              label="Upload Type"
              onChange={(e) => {
                setUploadTypeFilter(e.target.value);
                setPaginationModel({ ...paginationModel, page: 0 });
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="PENDING">Pending Orders</MenuItem>
              <MenuItem value="DELIVERY">Delivery Marking</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPaginationModel({ ...paginationModel, page: 0 });
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="SUCCESS">Success</MenuItem>
              <MenuItem value="PARTIAL">Partial</MenuItem>
              <MenuItem value="FAILED">Failed</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <DataGrid
          rows={histories}
          columns={columns}
          loading={loading}
          rowCount={rowCount}
          pageSizeOptions={[10, 25, 50, 100]}
          paginationModel={paginationModel}
          paginationMode="server"
          onPaginationModelChange={setPaginationModel}
          disableRowSelectionOnClick
          autoHeight
          onCellClick={(params) => {
            if (params.row.error_summary && (params.row.status === 'FAILED' || params.row.status === 'PARTIAL')) {
              handleRowClick(params);
            }
          }}
          sx={{
            '& .MuiDataGrid-row': {
              cursor: (params) => {
                const row = histories.find(h => h.id === params.id);
                return row?.error_summary && (row.status === 'FAILED' || row.status === 'PARTIAL')
                  ? 'pointer'
                  : 'default';
              },
            },
          }}
        />
      </Paper>

      {/* Error Details Dialog */}
      <Dialog
        open={errorDialogOpen}
        onClose={() => setErrorDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Upload Errors - {selectedHistory?.file_name}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Typography variant="body2" gutterBottom>
              <strong>Upload Type:</strong> {selectedHistory?.upload_type_display}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Status:</strong>{' '}
              <Chip
                label={selectedHistory?.status_display}
                color={getStatusColor(selectedHistory?.status || '')}
                size="small"
              />
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Total Rows:</strong> {selectedHistory?.row_count}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Success:</strong> {selectedHistory?.success_count} |{' '}
              <strong>Errors:</strong> {selectedHistory?.error_count}
              {selectedHistory?.skipped_count !== undefined && (
                <>
                  {' | '}
                  <strong>Skipped:</strong> {selectedHistory.skipped_count}
                </>
              )}
            </Typography>
          </DialogContentText>

          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            Error Details (First 100 errors)
          </Typography>

          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {parseErrorSummary(selectedHistory?.error_summary).map((error: any, index: number) => (
              <Paper key={index} sx={{ p: 2, mb: 1, bgcolor: 'error.light', color: 'error.contrastText' }}>
                <Typography variant="body2" fontWeight="bold">
                  Row {error.row}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {error.errors.join(', ')}
                </Typography>
                {error.data && (
                  <Typography variant="caption" sx={{ mt: 0.5, display: 'block', opacity: 0.8 }}>
                    Data: {JSON.stringify(error.data)}
                  </Typography>
                )}
              </Paper>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BulkUploadHistoryPage;
