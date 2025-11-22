import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { VerifiedUser as VerifiedUserIcon, Info as InfoIcon } from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { consumersApi } from '../../services/api';
import { useSnackbar } from '../../contexts/SnackbarContext';

interface PendingKycConsumer {
  id: number;
  consumer_number: string;
  consumer_name: string;
  mobile_number: string | null;
}

export default function ConsumerKycPendingNew() {
  const { showSnackbar } = useSnackbar();
  const [consumers, setConsumers] = useState<PendingKycConsumer[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingKyc, setUpdatingKyc] = useState<number | null>(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchPendingKycConsumers();
  }, [paginationModel]);

  const fetchPendingKycConsumers = async () => {
    try {
      setLoading(true);
      const response = await consumersApi.getKycPending({
        page: paginationModel.page + 1,
        page_size: paginationModel.pageSize,
      });
      setConsumers(response.data.results || []);
      setTotalCount(response.data.count || 0);
    } catch (error) {
      showSnackbar('Failed to fetch pending KYC consumers', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnableKyc = async (consumerId: number) => {
    try {
      setUpdatingKyc(consumerId);
      await consumersApi.updateKycStatus(consumerId, true);
      showSnackbar('KYC enabled successfully!', 'success');
      // Refresh the list
      fetchPendingKycConsumers();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to enable KYC';
      showSnackbar(errorMessage, 'error');
      console.error(error);
    } finally {
      setUpdatingKyc(null);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'consumer_number',
      headerName: 'Consumer Number',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'consumer_name',
      headerName: 'Name',
      flex: 1.5,
      minWidth: 200,
    },
    {
      field: 'mobile_number',
      headerName: 'Mobile',
      flex: 1,
      minWidth: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.value || 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 130,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const consumer = params.row as PendingKycConsumer;
        const isUpdating = updatingKyc === consumer.id;

        return (
          <Button
            variant="contained"
            size="small"
            disabled={isUpdating}
            onClick={() => handleEnableKyc(consumer.id)}
            startIcon={isUpdating ? null : <VerifiedUserIcon />}
            sx={{
              textTransform: 'none',
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}
          >
            {isUpdating ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Enable KYC'
            )}
          </Button>
        );
      },
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Pending KYC Users
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enable KYC for customers who have completed verification
          </Typography>
          <Alert severity="info" icon={<InfoIcon />}>
            Review customer documents and enable KYC status once verification is complete.
          </Alert>
        </Box>

        <DataGrid
          rows={consumers}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
          rowCount={totalCount}
          paginationMode="server"
          loading={loading}
          disableRowSelectionOnClick
          autoHeight
          sx={{
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center',
            },
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        />
      </Paper>
    </Box>
  );
}
