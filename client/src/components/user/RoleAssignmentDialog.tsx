import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon, Shield as ShieldIcon } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi, rolesApi } from '@/services/api';
import type { User, Role } from '@/types/auth';
import { toast } from 'sonner';

interface RoleAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

const roleColors: Record<string, string> = {
  admin: '#DC2626',
  manager: '#D97706',
  staff: '#2563EB',
  delivery: '#059669',
  viewer: '#6366F1',
};

export default function RoleAssignmentDialog({
  open,
  onOpenChange,
  user,
}: RoleAssignmentDialogProps) {
  const onClose = () => onOpenChange(false);
  const queryClient = useQueryClient();
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.getAll(),
    enabled: open,
  });

  const roles = rolesData?.data?.results || rolesData?.data || [];

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['user', user?.id],
    queryFn: () => usersApi.getById(user!.id),
    enabled: open && !!user?.id,
  });

  useEffect(() => {
    if (userData?.data && roles.length > 0) {
      const userRoleNames = userData.data.roles || [];
      const roleIds = roles
        .filter((role: Role) => userRoleNames.includes(role.name))
        .map((role: Role) => role.id);
      setSelectedRoleIds(roleIds);
    }
  }, [userData, roles]);

  const assignRolesMutation = useMutation({
    mutationFn: (roleIds: number[]) =>
      usersApi.assignRoles(user!.id, roleIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', user?.id] });
      toast.success('Roles assigned successfully');
      onClose();
    },
    onError: () => {
      toast.error('Failed to assign roles');
    },
  });

  const handleToggleRole = (roleId: number) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSubmit = () => {
    assignRolesMutation.mutate(selectedRoleIds);
  };

  const isLoading = rolesLoading || userLoading;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'hsl(var(--card))',
          borderRadius: 3,
          border: '1px solid hsl(var(--border))',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShieldIcon sx={{ color: 'hsl(var(--primary))' }} />
          <Typography variant="h6" fontWeight={700}>
            Assign Roles
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {user && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'hsl(var(--muted) / 0.3)', borderRadius: 2 }}>
            <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 0.5 }}>
              User
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {user.full_name}
            </Typography>
            <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
              {user.email}
            </Typography>
          </Box>
        )}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : roles.length === 0 ? (
          <Alert severity="warning">No roles available</Alert>
        ) : (
          <Stack spacing={1.5}>
            <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>
              Select roles to assign to this user:
            </Typography>
            {roles.map((role: Role) => {
              const isSelected = selectedRoleIds.includes(role.id);
              const permCount = role.permissions_count || role.permissions_list?.length || 0;

              return (
                <Box
                  key={role.id}
                  sx={{
                    p: 2,
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 2,
                    bgcolor: isSelected ? 'hsl(var(--primary) / 0.05)' : 'transparent',
                    borderColor: isSelected ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'hsl(var(--muted) / 0.3)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleToggleRole(role.id)}
                      sx={{ p: 0, mt: 0.5 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="body1" fontWeight={600}>
                          {role.display_name}
                        </Typography>
                        <Chip
                          label={`${permCount} perms`}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: 11,
                            bgcolor: `${roleColors[role.name] || '#6B7280'}20`,
                            color: roleColors[role.name] || '#6B7280',
                          }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                        {role.description}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          sx={{
            textTransform: 'none',
            color: 'hsl(var(--muted-foreground))',
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading || assignRolesMutation.isPending}
          sx={{
            bgcolor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
            textTransform: 'none',
            px: 3,
            '&:hover': { bgcolor: 'hsl(var(--primary) / 0.9)' },
          }}
        >
          {assignRolesMutation.isPending ? 'Assigning...' : 'Assign Roles'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
