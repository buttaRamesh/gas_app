import { useState } from 'react';
import { Box, Container, Typography, Card, CardContent, Avatar, Chip, Button, TextField, InputAdornment, CircularProgress, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add as PlusIcon, Search as SearchIcon, Shield as ShieldIcon, Email as MailIcon, Phone as PhoneIcon, CalendarToday as CalendarIcon, Visibility as VisibilityIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { usersApi } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserFormDialog } from '@/components/user/UserFormDialog';
import RoleAssignmentDialog from '@/components/user/RoleAssignmentDialog';
import type { User } from '@/types/auth';
import { toast } from 'sonner';
import { colors } from '@/theme';

const UserManagementPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState(false);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', search],
    queryFn: () => usersApi.getAll(search),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User has been deleted successfully.');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete user');
    },
  });

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id);
    }
  };

  const users = usersData?.data?.results || usersData?.data || [];

  const getRoleBadgeColor = (role: string) => {
    return colors.roles[role as keyof typeof colors.roles] || colors.roles.default;
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
            User Management
          </Typography>
          <Typography variant="body1" sx={{ color: 'hsl(var(--muted-foreground))' }}>
            Manage users, roles, and permissions
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 6 }}>
          <Box sx={{ position: 'relative', flex: 1 }}>
            <TextField
              fullWidth
              placeholder="Search users by name, email, or ID..."
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
              setSelectedUser(null);
              setViewMode(false);
              setShowUserForm(true);
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
            Add User
          </Button>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 4 }}>
            {[1, 2, 3].map((i) => (
              <Card key={i} sx={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                <Box sx={{ height: 128, bgcolor: 'hsl(var(--muted))' }} />
              </Card>
            ))}
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 4 }}>
            {users.map((user: User) => (
              <Card
                key={user.id}
                sx={{
                  background: colors.cardGradients.gold.background,
                  border: `2px solid ${colors.cardGradients.gold.border}`,
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(251,191,36,0.15)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(251,191,36,0.3)',
                    borderColor: colors.cardGradients.gold.borderHover,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          background: 'linear-gradient(to bottom right, hsl(var(--primary)), hsl(var(--primary) / 0.6))',
                          color: 'hsl(var(--primary-foreground))',
                          fontWeight: 600,
                          border: '2px solid hsl(var(--primary) / 0.2)',
                        }}
                      >
                        {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontSize="1.125rem">
                          {user.full_name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                          {user.employee_id}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                      <Chip
                        label={user.is_active ? 'Active' : 'Inactive'}
                        size="small"
                        sx={{
                          fontSize: '0.75rem',
                          width: '56px',
                          bgcolor: user.is_active ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                          color: user.is_active ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
                        }}
                      />
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Edit User">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedUser(user);
                              setViewMode(false);
                              setShowUserForm(true);
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
                        <Tooltip title="Delete User">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(user)}
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

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: '0.875rem', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'hsl(var(--muted-foreground))' }}>
                      <MailIcon sx={{ fontSize: 16 }} />
                      <Typography variant="body2" noWrap>{user.email}</Typography>
                    </Box>
                    {user.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'hsl(var(--muted-foreground))' }}>
                        <PhoneIcon sx={{ fontSize: 16 }} />
                        <Typography variant="body2">{user.phone}</Typography>
                      </Box>
                    )}
                    {user.created_at && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'hsl(var(--muted-foreground))' }}>
                        <CalendarIcon sx={{ fontSize: 16 }} />
                        <Typography variant="body2">
                          Joined {new Date(user.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ pt: 3, borderTop: '1px solid hsl(var(--border))' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <ShieldIcon sx={{ fontSize: 16, color: 'hsl(var(--muted-foreground))' }} />
                      <Typography variant="body2" fontWeight={500} fontSize="0.875rem">
                        Roles
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((role) => (
                          <Chip
                            key={role}
                            label={role}
                            size="small"
                            variant="outlined"
                            sx={{
                              bgcolor: `${getRoleBadgeColor(role)}10`,
                              color: getRoleBadgeColor(role),
                              borderColor: `${getRoleBadgeColor(role)}20`,
                            }}
                          />
                        ))
                      ) : (
                        <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                          No roles assigned
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      setSelectedUser(user);
                      setShowRoleDialog(true);
                    }}
                    sx={{
                      mt: 4,
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                      '&:hover': {
                        borderColor: 'hsl(var(--primary))',
                        bgcolor: 'hsl(var(--primary) / 0.05)',
                      },
                    }}
                  >
                    Manage Roles
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {users.length === 0 && !isLoading && (
          <Card sx={{ p: 12, textAlign: 'center' }}>
            <Box sx={{ color: 'hsl(var(--muted-foreground))' }}>
              <ShieldIcon sx={{ fontSize: 48, mx: 'auto', mb: 4, opacity: 0.5 }} />
              <Typography variant="h6" fontWeight={500} fontSize="1.125rem">
                No users found
              </Typography>
              <Typography variant="body2" fontSize="0.875rem" sx={{ mt: 1 }}>
                Try adjusting your search or add a new user
              </Typography>
            </Box>
          </Card>
        )}
      </Container>

      <UserFormDialog open={showUserForm} onOpenChange={setShowUserForm} user={selectedUser} viewMode={viewMode} />

      {selectedUser && (
        <RoleAssignmentDialog
          open={showRoleDialog}
          onOpenChange={setShowRoleDialog}
          user={selectedUser}
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
            Are you sure you want to delete the user "{userToDelete?.full_name}"? This action cannot be undone.
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
            disabled={deleteUserMutation.isPending}
            sx={{
              bgcolor: colors.priority.critical.light,
              color: '#fff',
              '&:hover': {
                bgcolor: colors.priority.critical.main,
              },
            }}
          >
            {deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagementPage;
