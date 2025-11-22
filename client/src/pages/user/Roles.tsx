import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
  type GridRowParams,
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Lock as PermissionIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { rolesApi } from '@/services/api';
import { RoleFormDialog } from '@/components/user/RoleFormDialog';
import { PermissionAssignmentDialog } from '@/components/user/PermissionAssignmentDialog';
import type { Role } from '@/types/auth';

export default function Roles() {
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const { data: rolesResponse, isLoading } = useQuery({
    queryKey: ['roles', search],
    queryFn: () => rolesApi.getAll(search),
  });

  const roles = rolesResponse?.data?.results || rolesResponse?.data || [];

  const deleteMutation = useMutation({
    mutationFn: (id: number) => rolesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      showSnackbar('Role deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
    },
    onError: () => {
      showSnackbar('Failed to delete role', 'error');
    },
  });

  const handleAddRole = () => {
    setSelectedRole(null);
    setRoleDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setRoleDialogOpen(true);
  };

  const handleAssignPermissions = (role: Role) => {
    setSelectedRole(role);
    setPermissionDialogOpen(true);
  };

  const handleDeleteClick = (role: Role) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (roleToDelete) {
      deleteMutation.mutate(roleToDelete.id);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Role Name',
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Typography sx={{ fontWeight: 600, color: '#667eea', fontSize: '0.875rem' }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'display_name',
      headerName: 'Display Name',
      flex: 1.2,
      minWidth: 140,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" color="text.secondary">
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'permissions_count',
      headerName: 'Permissions',
      flex: 0.8,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
          <Chip
            label={`${params.value || 0} permissions`}
            size="small"
            color="primary"
            sx={{ fontSize: '0.75rem', height: 24 }}
          />
        </Box>
      ),
    },
    {
      field: 'priority',
      headerName: 'Priority',
      flex: 0.6,
      minWidth: 90,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'is_active',
      headerName: 'Status',
      flex: 0.6,
      minWidth: 90,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
          {params.value ? (
            <CheckIcon sx={{ color: '#4caf50', fontSize: 20 }} />
          ) : (
            <CancelIcon sx={{ color: '#f44336', fontSize: 20 }} />
          )}
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 130,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      resizable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.3, width: '100%', height: '100%' }}>
          <Tooltip title="Assign Permissions" arrow>
            <IconButton
              size="small"
              onClick={() => handleAssignPermissions(params.row)}
              sx={{
                bgcolor: 'rgba(99, 102, 241, 0.1)',
                '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.2)' },
                padding: '4px',
              }}
            >
              <PermissionIcon sx={{ fontSize: 18, color: '#6366F1' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit" arrow>
            <IconButton
              size="small"
              onClick={() => handleEditRole(params.row)}
              sx={{
                bgcolor: 'rgba(245, 158, 11, 0.1)',
                '&:hover': { bgcolor: 'rgba(245, 158, 11, 0.2)' },
                padding: '4px',
              }}
            >
              <EditIcon sx={{ fontSize: 18, color: '#F59E0B' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete" arrow>
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(params.row)}
              sx={{
                bgcolor: 'rgba(244, 67, 54, 0.1)',
                '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.2)' },
                padding: '4px',
              }}
            >
              <DeleteIcon sx={{ fontSize: 18, color: '#f44336' }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const getRowClassName = (params: GridRowParams) => {
    const index = roles.findIndex((role: Role) => role.id === params.id);
    return index % 2 === 0 ? 'even-row' : 'odd-row';
  };

  return (
    <Container maxWidth={false} sx={{ py: 3, px: { xs: 2, sm: 3 }, maxWidth: '1260px' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ color: '#667eea' }}>
            Role Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage system roles and permissions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddRole}
          sx={{
            bgcolor: '#667eea',
            '&:hover': { bgcolor: '#5568d3' },
            borderRadius: '8px',
            textTransform: 'none',
            px: 3,
          }}
        >
          Add Role
        </Button>
      </Box>

      {/* Search */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Search by role name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
          }}
        />
      </Paper>

      {/* Roles DataGrid */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: 'auto',
          border: '1px solid #e0e0e0',
          width: '100%',
        }}
      >
        <DataGrid
          rows={roles}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 50]}
          paginationMode="client"
          loading={isLoading}
          getRowClassName={getRowClassName}
          disableRowSelectionOnClick
          autoHeight
          disableColumnResize={false}
          columnHeaderHeight={40}
          rowHeight={52}
          sx={{
            border: 'none',
            width: '100%',
            '& .MuiDataGrid-main': {
              borderRadius: 0,
            },
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: '#f5f5f5',
              borderBottom: '2px solid #667eea',
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 700,
                color: '#333',
              },
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f0f0f0',
            },
            '& .even-row': {
              bgcolor: '#fafafa',
            },
            '& .odd-row': {
              bgcolor: 'white',
            },
            '& .MuiDataGrid-row:hover': {
              bgcolor: '#f0f7ff !important',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '2px solid #667eea',
              bgcolor: '#f5f5f5',
            },
            '& .MuiDataGrid-virtualScroller': {
              overflowX: 'auto',
            },
          }}
        />
      </Paper>

      {/* Role Form Dialog */}
      <RoleFormDialog
        open={roleDialogOpen}
        onClose={() => {
          setRoleDialogOpen(false);
          setSelectedRole(null);
        }}
        role={selectedRole}
      />

      {/* Permission Assignment Dialog */}
      <PermissionAssignmentDialog
        open={permissionDialogOpen}
        onClose={() => {
          setPermissionDialogOpen(false);
          setSelectedRole(null);
        }}
        role={selectedRole}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete role <strong>{roleToDelete?.name}</strong> ({roleToDelete?.display_name})?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
