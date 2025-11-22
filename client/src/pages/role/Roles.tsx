import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { rolesApi } from '@/services/api';
import PermissionAssignmentDialog from '@/components/role/PermissionAssignmentDialog';
import type { Role } from '@/types/auth';

export default function Roles() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [permDialogOpen, setPermDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const { data: rolesResponse, isLoading } = useQuery({
    queryKey: ['roles', search],
    queryFn: () => rolesApi.getAll(search),
  });

  const roles = Array.isArray(rolesResponse?.data)
    ? rolesResponse.data
    : rolesResponse?.data?.results || [];

  const deleteMutation = useMutation({
    mutationFn: (id: number) => rolesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      showSnackbar('Role deleted successfully', 'success');
    },
    onError: (error: any) => {
      showSnackbar(
        error.response?.data?.message || 'Failed to delete role',
        'error'
      );
    },
  });

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete role "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleAssignPermissions = (role: Role) => {
    setSelectedRole(role);
    setPermDialogOpen(true);
  };

  const handleClosePermDialog = () => {
    setPermDialogOpen(false);
    setSelectedRole(null);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Role Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage system roles and their permissions
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/roles/create')}
            sx={{ bgcolor: '#F59E0B', '&:hover': { bgcolor: '#D97706' } }}
          >
            Add Role
          </Button>
        </Box>

        {/* Search */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <TextField
              fullWidth
              placeholder="Search roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </CardContent>
        </Card>

        {/* Roles Table */}
        <Card>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Role Name</strong></TableCell>
                  <TableCell><strong>Display Name</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Priority</strong></TableCell>
                  <TableCell><strong>Permissions</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : roles?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No roles found
                    </TableCell>
                  </TableRow>
                ) : (
                  roles?.map((role: any) => (
                    <TableRow key={role.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {role.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{role.display_name}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>
                          {role.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={role.priority} size="small" color="primary" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${role.permissions_count || 0} permissions`}
                          size="small"
                          color="info"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={role.is_active ? 'Active' : 'Inactive'}
                          color={role.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleAssignPermissions(role)}
                          sx={{ color: '#10B981' }}
                          title="Assign Permissions"
                        >
                          <AssignmentIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/roles/${role.id}/edit`)}
                          sx={{ color: '#F59E0B' }}
                          title="Edit Role"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(role.id, role.name)}
                          sx={{ color: 'error.main' }}
                          title="Delete Role"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Container>

      {/* Permission Assignment Dialog */}
      <PermissionAssignmentDialog
        open={permDialogOpen}
        onClose={handleClosePermDialog}
        role={selectedRole}
      />
    </Box>
  );
}
