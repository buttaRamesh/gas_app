import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { consumersApi } from '../../services/api';
import { useSnackbar } from '../../contexts/SnackbarContext';

interface NewConsumer {
  id: number;
  consumer_number: string;
  consumer_name: string;
  mobile_number: string | null;
  status: string;
  completion_info: {
    status: 'COMPLETED' | 'INCOMPLETE';
    message: string;
  };
}

export default function ConsumerNewActivation() {
  const { showSnackbar } = useSnackbar();
  const [consumers, setConsumers] = useState<NewConsumer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<number | null>(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchNewConsumers();
  }, [paginationModel]);

  const fetchNewConsumers = async () => {
    try {
      setLoading(true);
      const response = await consumersApi.getNewCustomers({
        page: paginationModel.page + 1,
        page_size: paginationModel.pageSize,
      });
      setConsumers(response.data.results || []);
      setTotalCount(response.data.count || 0);
    } catch (error) {
      showSnackbar('Failed to fetch new consumers', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (consumerId: number) => {
    try {
      setActivating(consumerId);
      await consumersApi.activate(consumerId);
      showSnackbar('Consumer activated successfully!', 'success');
      // Refresh the list
      fetchNewConsumers();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to activate consumer';
      showSnackbar(errorMessage, 'error');
      console.error(error);
    } finally {
      setActivating(null);
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
      field: 'completion_info',
      headerName: 'Info',
      flex: 1.5,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams) => {
        const info = params.value as NewConsumer['completion_info'];
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {info.status === 'COMPLETED' ? (
              <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
            ) : (
              <CancelIcon sx={{ color: 'error.main', fontSize: 20 }} />
            )}
            <Typography
              variant="body2"
              sx={{
                color: info.status === 'COMPLETED' ? 'success.main' : 'error.main',
                fontWeight: 500,
              }}
            >
              {info.message}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const consumer = params.row as NewConsumer;
        const isComplete = consumer.completion_info.status === 'COMPLETED';
        const isActivating = activating === consumer.id;

        return (
          <Button
            variant="contained"
            size="small"
            disabled={!isComplete || isActivating}
            onClick={() => handleActivate(consumer.id)}
            sx={{
              textTransform: 'none',
              backgroundColor: isComplete ? 'success.main' : 'grey.400',
              '&:hover': {
                backgroundColor: isComplete ? 'success.dark' : 'grey.400',
              },
              '&:disabled': {
                backgroundColor: 'grey.300',
                color: 'grey.600',
              },
            }}
          >
            {isActivating ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Activate'
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
            New Customers Activation
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Review and activate newly registered customers
          </Typography>
          <Alert severity="info" icon={<InfoIcon />}>
            Only customers with complete information (address, contact, and additional details) can be activated.
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
