import { useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, IconButton, Snackbar, Alert } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { ConnectionDialog } from '../dialogs/ConnectionDialog';
import axiosInstance from '../../../../../api/axiosInstance';
import type { Connection } from '../../types';

interface ConnectionsTabProps {
  connections: Connection[];
  consumerId: number;
  onRefresh: () => void;
}

export function ConnectionsTab({ connections, consumerId, onRefresh }: ConnectionsTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleOpenDialog = (connection?: Connection) => {
    if (connection) {
      setEditingConnection(connection);
    } else {
      setEditingConnection(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingConnection(null);
  };

  const handleSuccess = () => {
    onRefresh();
  };

  const handleDelete = async (connectionId: number) => {
    if (!window.confirm('Are you sure you want to delete this connection?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/connections/${connectionId}/`);

      setSnackbar({
        open: true,
        message: 'Connection deleted successfully!',
        severity: 'success',
      });

      onRefresh();
    } catch (error: any) {
      console.error('Failed to delete connection:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Failed to delete connection',
        severity: 'error',
      });
    }
  };

  if (!connections || connections.length === 0) {
    return (
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Gas Connections
          </Typography>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => handleOpenDialog()}
            sx={{ fontWeight: 600 }}
          >
            Add Connection
          </Button>
        </Box>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">No connections available</Typography>
        </Box>
        <ConnectionDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          onSuccess={handleSuccess}
          consumerId={consumerId}
          connection={editingConnection}
        />

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatProduct = (connection: Connection) => {
    if (connection.product_code) {
      return `${connection.product_code} - ${connection.product_name || `Product ${connection.product}`}`;
    }
    return connection.product_name || `Product ${connection.product}`;
  };

  return (
    <Box sx={{ maxWidth: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          Gas Connections
        </Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => handleOpenDialog()}
          sx={{ fontWeight: 600 }}
        >
          Add Connection
        </Button>
      </Box>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          border: '1px solid rgba(102, 126, 234, 0.15)',
          boxShadow: '0 2px 12px rgba(102, 126, 234, 0.08)',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>SV Number</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>SV Date</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Connection Type</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Product</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Size</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Regulators</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Description</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {connections.map((connection) => (
              <TableRow
                key={connection.id}
                sx={{
                  '&:hover': {
                    bgcolor: 'rgba(102, 126, 234, 0.04)',
                  },
                }}
              >
                <TableCell>
                  <Chip
                    label={connection.sv_number}
                    size="small"
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell>{formatDate(connection.sv_date)}</TableCell>
                <TableCell>
                  {connection.connection_type_name || `Type ${connection.connection_type}`}
                </TableCell>
                <TableCell>
                  {formatProduct(connection)}
                </TableCell>
                <TableCell>{connection.product_size}</TableCell>
                <TableCell align="center">{connection.num_of_regulators}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {connection.hist_code_description || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(connection)}
                      title="Edit connection"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(connection.id)}
                      title="Delete connection"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ConnectionDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
        consumerId={consumerId}
        connection={editingConnection}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
