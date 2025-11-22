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
  Assignment as AssignmentIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { usersApi } from '@/services/api';
import { UserFormDialog } from '@/components/user/UserFormDialog';
import { RoleAssignmentDialog } from '@/components/user/RoleAssignmentDialog';
import type { User } from '@/types/auth';

const roleColors: Record<string, 'error' | 'warning' | 'info' | 'success' | 'default' | 'primary'> = {
  admin: 'error',
  manager: 'warning',
  delivery: 'info',
  staff: 'success',
  viewer: 'default',
};

export default function Users() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ['users', search],
    queryFn: () => usersApi.getAll(search),
  });

  const users = usersResponse?.data?.results || usersResponse?.data || [];

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showSnackbar('User deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    },
    onError: () => {
      showSnackbar('Failed to delete user', 'error');
    },
  });

  const handleAddUser = () => {
    setSelectedUser(null);
    setUserDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUserDialogOpen(true);
  };

  const handleAssignRoles = (user: User) => {
    setSelectedUser(user);
    setRoleDialogOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete.id);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'employee_id',
      headerName: 'Employee ID',
      flex: 0.8,
      minWidth: 110,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Typography sx={{ fontWeight: 600, color: '#667eea', fontSize: '0.875rem' }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'full_name',
      headerName: 'Full Name',
      flex: 1.5,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1.8,
      minWidth: 180,
    },
    {
      field: 'phone',
      headerName: 'Phone',
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => params.value || '-',
    },
    {
      field: 'roles',
      headerName: 'Roles',
      flex: 1.5,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center', py: 0.5 }}>
          {params.value && params.value.length > 0 ? (
            params.value.map((role: string) => (
              <Chip
                key={role}
                label={role}
                color={roleColors[role] || 'default'}
                size="small"
                sx={{ fontSize: '0.75rem', height: 24 }}
              />
            ))
          ) : (
            <Chip label="No roles" size="small" color="default" sx={{ fontSize: '0.75rem', height: 24 }} />
          )}
        </Box>
      ),
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
          <Tooltip title="Assign Roles" arrow>
            <IconButton
              size="small"
              onClick={() => handleAssignRoles(params.row)}
              sx={{
                bgcolor: 'rgba(16, 185, 129, 0.1)',
                '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.2)' },
                padding: '4px',
              }}
            >
              <AssignmentIcon sx={{ fontSize: 18, color: '#10B981' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit" arrow>
            <IconButton
              size="small"
              onClick={() => handleEditUser(params.row)}
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
    const index = users.findIndex((user: User) => user.id === params.id);
    return index % 2 === 0 ? 'even-row' : 'odd-row';
  };

  return (
    <Container maxWidth={false} sx={{ py: 3, px: { xs: 2, sm: 3 }, maxWidth: '1260px' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ color: '#667eea' }}>
            User Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage system users and their roles
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddUser}
          sx={{
            bgcolor: '#667eea',
            '&:hover': { bgcolor: '#5568d3' },
            borderRadius: '8px',
            textTransform: 'none',
            px: 3,
          }}
        >
          Add User
        </Button>
      </Box>

      {/* Search */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Search by employee ID, name, or email..."
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

      {/* Users DataGrid */}
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
          rows={users}
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

      {/* User Form Dialog */}
      <UserFormDialog
        open={userDialogOpen}
        onClose={() => {
          setUserDialogOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />

      {/* Role Assignment Dialog */}
      <RoleAssignmentDialog
        open={roleDialogOpen}
        onClose={() => {
          setRoleDialogOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete user <strong>{userToDelete?.employee_id}</strong> ({userToDelete?.full_name})?
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
