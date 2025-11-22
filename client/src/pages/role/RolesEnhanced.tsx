import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Avatar,
  Stack,
  Tooltip,
  Badge,
  LinearProgress,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  Shield as ShieldIcon,
  People as PeopleIcon,
  MoreVert as MoreVertIcon,
  Security as SecurityIcon,
  Visibility as ViewIcon,
  ContentCopy as CopyIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Compare as CompareIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { rolesApi, permissionsApi } from '@/services/api';
import PermissionAssignmentDialog from '@/components/role/PermissionAssignmentDialog';
import RoleComparisonDialog from '@/components/role/RoleComparisonDialog';
import type { Role } from '@/types/auth';

// Role card colors based on priority/type
const roleColors: Record<string, { bg: string; color: string; icon: string }> = {
  admin: { bg: '#FEE2E2', color: '#DC2626', icon: '👑' },
  manager: { bg: '#FEF3C7', color: '#D97706', icon: '⚡' },
  staff: { bg: '#DBEAFE', color: '#2563EB', icon: '👔' },
  delivery: { bg: '#D1FAE5', color: '#059669', icon: '🚚' },
  viewer: { bg: '#E0E7FF', color: '#6366F1', icon: '👁️' },
  default: { bg: '#F3F4F6', color: '#6B7280', icon: '🔐' },
};

const getPermissionLevel = (count: number): { label: string; color: string; percentage: number } => {
  if (count >= 60) return { label: 'Full Access', color: '#DC2626', percentage: 100 };
  if (count >= 30) return { label: 'High Access', color: '#D97706', percentage: 75 };
  if (count >= 10) return { label: 'Medium Access', color: '#2563EB', percentage: 50 };
  return { label: 'Limited Access', color: '#6B7280', percentage: 25 };
};

export default function RolesEnhanced() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [permDialogOpen, setPermDialogOpen] = useState(false);
  const [comparisonDialogOpen, setComparisonDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuRole, setMenuRole] = useState<Role | null>(null);

  const { data: rolesData, isLoading } = useQuery({
    queryKey: ['roles', search],
    queryFn: () => rolesApi.getAll(search),
  });

  // Fetch total permissions count for progress calculation
  const { data: permissionsData } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => permissionsApi.getAll(undefined, undefined, 1000),
  });

  const roles = Array.isArray(rolesData?.data) ? rolesData.data : rolesData?.data?.results || [];

  // Get total permissions count from the API's count field (not results.length which is just the first page)
  const totalPermissionsCount = permissionsData?.data?.count ||
                                 permissionsData?.data?.results?.length ||
                                 (Array.isArray(permissionsData?.data) ? permissionsData.data.length : 0) ||
                                 1; // Default to 1 to avoid division by zero

  const deleteMutation = useMutation({
    mutationFn: (id: number) => rolesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      showSnackbar('Role deleted successfully', 'success');
    },
    onError: () => {
      showSnackbar('Failed to delete role', 'error');
    },
  });

  const handleAssignPermissions = (role: Role) => {
    setSelectedRole(role);
    setPermDialogOpen(true);
  };

  const handleClosePermDialog = () => {
    setPermDialogOpen(false);
    setSelectedRole(null);
  };

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete the role "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, role: Role) => {
    setAnchorEl(event.currentTarget);
    setMenuRole(role);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRole(null);
  };

  const handleDuplicateRole = (role: Role) => {
    // TODO: Implement duplicate functionality
    showSnackbar('Duplicate role feature coming soon!', 'info');
    handleMenuClose();
  };

  const getRoleStyle = (roleName: string) => {
    const name = roleName.toLowerCase();
    return roleColors[name] || roleColors.default;
  };

  // Calculate statistics
  const totalRoles = roles.length;
  const activeRoles = roles.filter((r: any) => r.is_active).length;
  const totalPermissions = roles.reduce((sum: number, r: any) => sum + (r.permissions_count || 0), 0);
  const avgPermissions = totalRoles > 0 ? Math.round(totalPermissions / totalRoles) : 0;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'hsl(var(--background))', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header with Stats */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShieldIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                Role Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage system roles and permissions for secure access control
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<CompareIcon />}
                onClick={() => setComparisonDialogOpen(true)}
                sx={{ borderColor: 'primary.main', color: 'primary.main' }}
              >
                Compare Roles
              </Button>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => navigate('/roles/create')}
                sx={{
                  bgcolor: 'primary.main',
                  '&:hover': { bgcolor: 'primary.dark' },
                  boxShadow: 2,
                }}
              >
                Create Role
              </Button>
            </Stack>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#EFF6FF', borderLeft: '4px solid #3B82F6' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#3B82F6', width: 48, height: 48 }}>
                      <ShieldIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight={700}>{totalRoles}</Typography>
                      <Typography variant="body2" color="text.secondary">Total Roles</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#F0FDF4', borderLeft: '4px solid #10B981' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#10B981', width: 48, height: 48 }}>
                      <SecurityIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight={700}>{activeRoles}</Typography>
                      <Typography variant="body2" color="text.secondary">Active Roles</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#FEF3C7', borderLeft: '4px solid #F59E0B' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#F59E0B', width: 48, height: 48 }}>
                      <AssignmentIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight={700}>{totalPermissions}</Typography>
                      <Typography variant="body2" color="text.secondary">Total Permissions</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#FDF4FF', borderLeft: '4px solid #A855F7' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#A855F7', width: 48, height: 48 }}>
                      <PeopleIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight={700}>{avgPermissions}</Typography>
                      <Typography variant="body2" color="text.secondary">Avg Permissions</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Search Bar */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <TextField
                fullWidth
                placeholder="Search roles by name, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'background.paper',
                  },
                }}
              />
            </CardContent>
          </Card>
        </Box>

        {/* Roles Grid */}
        {isLoading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography>Loading roles...</Typography>
          </Box>
        ) : roles?.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            No roles found. Create your first role to get started!
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {roles?.map((role: any) => {
              const roleStyle = getRoleStyle(role.name);
              const permLevel = getPermissionLevel(role.permissions_count || 0);

              return (
                <Grid item xs={12} sm={6} md={4} key={role.id}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      position: 'relative',
                      transition: 'all 0.3s',
                      border: '2px solid transparent',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                        borderColor: roleStyle.color,
                      },
                    }}
                  >
                    {/* Role Icon Badge */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -16,
                        left: 16,
                        width: 56,
                        height: 56,
                        borderRadius: '12px',
                        bgcolor: roleStyle.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                        boxShadow: 3,
                      }}
                    >
                      {roleStyle.icon}
                    </Box>

                    {/* Menu Button */}
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, role)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>

                    <CardContent sx={{ pt: 5 }}>
                      {/* Role Name & Status */}
                      <Box sx={{ mb: 2 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <Typography variant="h6" fontWeight={700}>
                            {role.display_name}
                          </Typography>
                          <Chip
                            label={role.is_active ? 'Active' : 'Inactive'}
                            size="small"
                            color={role.is_active ? 'success' : 'default'}
                            sx={{ height: 20 }}
                          />
                        </Stack>
                        <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                          {role.name}
                        </Typography>
                      </Box>

                      {/* Description */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          minHeight: 40,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {role.description || 'No description provided'}
                      </Typography>

                      {/* Permission Info */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" fontWeight={600}>
                            Permissions
                          </Typography>
                          <Typography variant="caption" fontWeight={600} sx={{ color: permLevel.color }}>
                            {role.permissions_count || 0} / {totalPermissionsCount}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(role.permissions_count / totalPermissionsCount) * 100}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: permLevel.color,
                              borderRadius: 3,
                            },
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {permLevel.label}
                        </Typography>
                      </Box>

                      {/* Tags */}
                      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                        <Chip
                          label={`Priority: ${role.priority}`}
                          size="small"
                          sx={{ bgcolor: roleStyle.bg, color: roleStyle.color }}
                        />
                        <Chip
                          icon={<PeopleIcon sx={{ fontSize: 16 }} />}
                          label={`${role.users_count || 0} Users`}
                          size="small"
                          sx={{ bgcolor: '#E0F2FE', color: '#0284C7' }}
                        />
                      </Stack>

                      {/* Action Buttons */}
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Assign Permissions">
                          <Button
                            fullWidth
                            variant="outlined"
                            size="small"
                            startIcon={<AssignmentIcon />}
                            onClick={() => handleAssignPermissions(role)}
                            sx={{ borderColor: '#10B981', color: '#10B981', '&:hover': { borderColor: '#059669' } }}
                          >
                            Permissions
                          </Button>
                        </Tooltip>
                        <Tooltip title="Edit Role">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/roles/${role.id}/edit`)}
                            sx={{
                              border: '1px solid',
                              borderColor: '#F59E0B',
                              color: '#F59E0B',
                              '&:hover': { bgcolor: '#FEF3C7' },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Role">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(role.id, role.name)}
                            sx={{
                              border: '1px solid',
                              borderColor: 'error.main',
                              color: 'error.main',
                              '&:hover': { bgcolor: 'error.light' },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => { navigate(`/roles/${menuRole?.id}/edit`); handleMenuClose(); }}>
            <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Edit Role</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { handleAssignPermissions(menuRole!); handleMenuClose(); }}>
            <ListItemIcon><AssignmentIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Assign Permissions</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { handleDuplicateRole(menuRole!); }}>
            <ListItemIcon><CopyIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Duplicate Role</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { handleDelete(menuRole!.id, menuRole!.name); handleMenuClose(); }} sx={{ color: 'error.main' }}>
            <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
            <ListItemText>Delete Role</ListItemText>
          </MenuItem>
        </Menu>

        {/* Permission Assignment Dialog */}
        <PermissionAssignmentDialog
          open={permDialogOpen}
          onClose={handleClosePermDialog}
          role={selectedRole}
        />

        {/* Role Comparison Dialog */}
        <RoleComparisonDialog
          open={comparisonDialogOpen}
          onClose={() => setComparisonDialogOpen(false)}
        />
      </Container>
    </Box>
  );
}
