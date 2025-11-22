import { useState } from 'react';
import { Box, Container, Typography, Card, CardContent, Chip, Button, TextField, InputAdornment, CircularProgress, LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add as PlusIcon, Search as SearchIcon, Shield as ShieldIcon, People as UsersIcon, Lock as LockIcon, CheckCircle as CheckCircleIcon, Visibility as VisibilityIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { rolesApi } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RoleFormDialog } from '@/components/user/RoleFormDialog';
import PermissionAssignmentDialog from '@/components/user/PermissionAssignmentDialog';
import type { Role } from '@/types/auth';
import { IconButton, Tooltip } from '@mui/material';
import { toast } from 'sonner';
import { colors } from '@/theme';

const RoleManagementPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [showPermDialog, setShowPermDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [viewMode, setViewMode] = useState(false);

  const { data: rolesData, isLoading } = useQuery({
    queryKey: ['roles', search],
    queryFn: () => rolesApi.getAll(search),
  });

  const deleteRoleMutation = useMutation({  
    mutationFn: (id: number) => rolesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role has been deleted successfully.');
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete role');
    },
  });

  const handleDeleteClick = (role: Role) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (roleToDelete) {
      deleteRoleMutation.mutate(roleToDelete.id);
    }
  };

  const roles = rolesData?.data?.results || rolesData?.data || [];

  const getPriorityColor = (priority: number) => {
    if (priority >= 90) return colors.priority.critical.main;
    if (priority >= 70) return colors.priority.high.main;
    if (priority >= 50) return colors.priority.medium.main;
    return colors.priority.low.main;
  };

  const getRoleIcon = (name: string) => {
    const icons: Record<string, any> = {
      admin: ShieldIcon,
      manager: UsersIcon,
      staff: LockIcon,
      delivery: UsersIcon,
      viewer: LockIcon,
    };
    return icons[name] || ShieldIcon;
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, hsl(var(--background)), hsl(var(--background)), hsl(var(--muted) / 0.2))' }}>
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h3"
            fontWeight={700}
            sx={{
              background: 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary) / 0.6))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              mb: 2,
            }}
          >
            Role Management
          </Typography>
          <Typography variant="body1" sx={{ color: 'hsl(var(--muted-foreground))' }}>
            Manage roles and their permissions
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 6 }}>
          <Box sx={{ position: 'relative', flex: 1 }}>
            <TextField
              fullWidth
              placeholder="Search roles by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 16, color: 'hsl(var(--muted-foreground))' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  pl: 1,
                },
              }}
            />
          </Box>
          <Button
            onClick={() => {
              setSelectedRole(null);
              setViewMode(false);
              setShowRoleForm(true);
            }}
            variant="contained"
            startIcon={<PlusIcon sx={{ fontSize: 16 }} />}
            sx={{
              bgcolor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
              '&:hover': {
                bgcolor: 'hsl(var(--primary) / 0.9)',
              },
              gap: 2,
            }}
          >
            Add Role
          </Button>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 6 }}>
            {[1, 2, 3].map((i) => (
              <Card key={i} sx={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                <Box sx={{ height: 160, bgcolor: 'hsl(var(--muted))' }} />
              </Card>
            ))}
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 6 }}>
            {roles.map((role: Role) => {
              const Icon = getRoleIcon(role.name);
              const priorityColor = getPriorityColor(role.priority || 0);

              return (
                <Card
                  key={role.id}
                  sx={{
                    background: colors.cardGradients.gold.background,
                    border: `2px solid ${colors.cardGradients.gold.border}`,
                    borderRadius: 3,
                    boxShadow: '0 4px 12px rgba(251,191,36,0.15)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(251,191,36,0.3)',
                      borderColor: colors.cardGradients.gold.borderHover,
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: 128,
                      height: 128,
                      background: 'linear-gradient(to bottom right, rgba(251,191,36,0.15), transparent)',
                      borderRadius: '0 0 0 100%',
                    },
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            p: 2,
                            background: 'linear-gradient(to bottom right, hsl(var(--primary)), hsl(var(--primary) / 0.6))',
                            borderRadius: 2,
                          }}
                        >
                          <Icon sx={{ fontSize: 20, color: 'hsl(var(--primary-foreground))' }} />
                        </Box>
                        <Box>
                          <Typography variant="h6" fontSize="1rem">
                            {role.display_name}
                          </Typography>
                          <Typography variant="caption" fontSize="0.7rem" sx={{ color: 'hsl(var(--muted-foreground))', mt: 0.5 }}>
                            {role.name}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                        <Chip
                          label={role.is_active ? 'Active' : 'Inactive'}
                          size="small"
                          sx={{
                            width: '56px',
                            bgcolor: role.is_active ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                            color: role.is_active ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
                          }}
                        />
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Edit Role">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedRole(role);
                                setViewMode(false);
                                setShowRoleForm(true);
                              }}
                              sx={{
                                width: 24,
                                height: 24,
                                color: colors.priority.low.main,
                                bgcolor: colors.priority.low.main,
                                '&:hover': {
                                  bgcolor: colors.priority.low.dark,
                                },
                              }}
                            >
                              <EditIcon sx={{ fontSize: 14, color: '#fff' }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Role">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(role)}
                              sx={{
                                width: 24,
                                height: 24,
                                color: colors.priority.critical.light,
                                bgcolor: colors.priority.critical.light,
                                '&:hover': {
                                  bgcolor: colors.priority.critical.main,
                                },
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 14, color: '#fff' }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Box>

                    <Typography
                      variant="body2"
                      fontSize="0.8rem"
                      sx={{
                        color: 'hsl(var(--muted-foreground))',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        minHeight: 32,
                      }}
                    >
                      {role.description}
                    </Typography>

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, pt: 2, borderTop: '1px solid hsl(var(--border))', mt: 2 }}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'hsl(var(--muted) / 0.5)', borderRadius: 2 }}>
                        <UsersIcon sx={{ fontSize: 14, mx: 'auto', mb: 0.5, color: 'hsl(var(--muted-foreground))' }} />
                        <Typography variant="h6" fontSize="1.25rem" fontWeight={700} sx={{ color: 'hsl(var(--foreground))' }}>
                          {role.users_count || 0}
                        </Typography>
                        <Typography variant="caption" fontSize="0.7rem" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                          Users
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'hsl(var(--muted) / 0.5)', borderRadius: 2 }}>
                        <CheckCircleIcon sx={{ fontSize: 14, mx: 'auto', mb: 0.5, color: 'hsl(var(--muted-foreground))' }} />
                        <Typography variant="h6" fontSize="1.25rem" fontWeight={700} sx={{ color: 'hsl(var(--foreground))' }}>
                          {role.permissions_count || role.permissions_list?.length || 0}
                        </Typography>
                        <Typography variant="caption" fontSize="0.7rem" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                          Permissions
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => {
                        setSelectedRole(role);
                        setShowPermDialog(true);
                      }}
                      sx={{
                        mt: 2,
                        borderColor: 'hsl(var(--border))',
                        color: 'hsl(var(--foreground))',
                        '&:hover': {
                          borderColor: 'hsl(var(--primary))',
                          bgcolor: 'hsl(var(--primary) / 0.05)',
                        },
                      }}
                    >
                      Manage Permissions
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}

        {roles.length === 0 && !isLoading && (
          <Card sx={{ p: 12, textAlign: 'center' }}>
            <Box sx={{ color: 'hsl(var(--muted-foreground))' }}>
              <ShieldIcon sx={{ fontSize: 48, mx: 'auto', mb: 4, opacity: 0.5 }} />
              <Typography variant="h6" fontWeight={500} fontSize="1.125rem">
                No roles found
              </Typography>
              <Typography variant="body2" fontSize="0.875rem" sx={{ mt: 1 }}>
                Try adjusting your search or add a new role
              </Typography>
            </Box>
          </Card>
        )}
      </Container>

      <RoleFormDialog open={showRoleForm} onOpenChange={setShowRoleForm} role={selectedRole} viewMode={viewMode} />

      {selectedRole && (
        <PermissionAssignmentDialog
          open={showPermDialog}
          onOpenChange={setShowPermDialog}
          role={selectedRole}
        />
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the role "{roleToDelete?.display_name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              color: 'hsl(var(--muted-foreground))',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            disabled={deleteRoleMutation.isPending}
            sx={{
              bgcolor: colors.priority.critical.light,
              color: '#fff',
              '&:hover': {
                bgcolor: colors.priority.critical.main,
              },
            }}
          >
            {deleteRoleMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoleManagementPage;
