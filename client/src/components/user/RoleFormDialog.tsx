import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Stack,
  Avatar,
  Slider,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Shield as ShieldIcon,
  LockOpen as LockOpenIcon,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi } from '@/services/api';
import type { Role } from '@/types/auth';

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role | null;
  viewMode?: boolean;
}

export const RoleFormDialog = ({ open, onOpenChange, role, viewMode = false }: RoleFormDialogProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: role?.name || '',
    display_name: role?.display_name || '',
    description: role?.description || '',
    priority: role?.priority || 50,
    is_active: role?.is_active ?? true,
  });

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        display_name: role.display_name || '',
        description: role.description || '',
        priority: role.priority || 50,
        is_active: role.is_active ?? true,
      });
    } else {
      setFormData({
        name: '',
        display_name: '',
        description: '',
        priority: 50,
        is_active: true,
      });
    }
  }, [role, open]);

  const createRoleMutation = useMutation({
    mutationFn: (data: any) => rolesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success(`${formData.display_name} role has been created successfully.`);
      resetAndClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create role');
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: (data: any) => rolesApi.update(role!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success(`${formData.display_name} role has been updated successfully.`);
      resetAndClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update role');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      display_name: formData.display_name,
      description: formData.description,
      priority: formData.priority,
      is_active: formData.is_active,
    };

    if (role) {
      updateRoleMutation.mutate(payload);
    } else {
      createRoleMutation.mutate(payload);
    }
  };

  const resetAndClose = () => {
    setFormData({
      name: '',
      display_name: '',
      description: '',
      priority: 50,
      is_active: true,
    });
    onOpenChange(false);
  };

  const onClose = () => {
    resetAndClose();
  };

  const getPriorityColor = () => {
    if (formData.priority >= 90) return '#DC2626';
    if (formData.priority >= 70) return '#F59E0B';
    if (formData.priority >= 50) return '#3B82F6';
    return '#10B981';
  };

  const getPriorityLabel = () => {
    if (formData.priority >= 90) return 'Critical';
    if (formData.priority >= 70) return 'High';
    if (formData.priority >= 50) return 'Medium';
    return 'Low';
  };

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
          maxWidth: '650px',
        },
      }}
      scroll="paper"
    >
      <Box sx={{
        background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)',
        p: 2,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{
              bgcolor: 'hsl(var(--primary-foreground) / 0.2)',
              width: 48,
              height: 48,
            }}>
              <ShieldIcon sx={{ color: 'hsl(var(--primary-foreground))' }} />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: 'hsl(var(--primary-foreground))' }}>
                {viewMode ? 'View Role' : role ? 'Edit Role' : 'Add New Role'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'hsl(var(--primary-foreground) / 0.8)' }}>
                {viewMode ? 'Role details and information' : role ? 'Update role details' : 'Create a new role with specific permissions'}
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: 'hsl(var(--primary-foreground))',
              bgcolor: 'hsl(var(--primary-foreground) / 0.1)',
              '&:hover': { bgcolor: 'hsl(var(--primary-foreground) / 0.2)' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: 'hsl(var(--foreground))' }}>
                Role Name (System) *
              </Typography>
              <TextField
                fullWidth
                placeholder="admin"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                required
                size="small"
                disabled={viewMode}
                helperText="Lowercase, no spaces (used in code)"
                InputProps={{
                  startAdornment: <LockOpenIcon sx={{ mr: 1, color: 'hsl(var(--muted-foreground))' }} />,
                  readOnly: viewMode,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'hsl(var(--background))',
                    '& fieldset': { borderColor: 'hsl(var(--border))' },
                    '&:hover fieldset': { borderColor: 'hsl(var(--primary))' },
                    '&.Mui-focused fieldset': { borderColor: 'hsl(var(--primary))' },
                  },
                  '& .MuiFormHelperText-root': {
                    color: 'hsl(var(--muted-foreground))',
                  },
                }}
              />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: 'hsl(var(--foreground))' }}>
                Display Name *
              </Typography>
              <TextField
                fullWidth
                placeholder="Administrator"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                required
                size="small"
                disabled={viewMode}
                InputProps={{
                  readOnly: viewMode,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'hsl(var(--background))',
                    '& fieldset': { borderColor: 'hsl(var(--border))' },
                    '&:hover fieldset': { borderColor: 'hsl(var(--primary))' },
                    '&.Mui-focused fieldset': { borderColor: 'hsl(var(--primary))' },
                  },
                }}
              />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: 'hsl(var(--foreground))' }}>
                Description
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Describe the role's purpose and responsibilities..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                size="small"
                disabled={viewMode}
                InputProps={{
                  readOnly: viewMode,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'hsl(var(--background))',
                    '& fieldset': { borderColor: 'hsl(var(--border))' },
                    '&:hover fieldset': { borderColor: 'hsl(var(--primary))' },
                    '&.Mui-focused fieldset': { borderColor: 'hsl(var(--primary))' },
                  },
                }}
              />
            </Box>

            <Divider />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{
                flex: 2,
                p: 2,
                bgcolor: 'hsl(var(--muted) / 0.3)',
                borderRadius: 2,
                border: '1px solid hsl(var(--border))',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body1" fontWeight={600}>
                    Priority Level
                  </Typography>
                  <Chip
                    label={getPriorityLabel()}
                    size="small"
                    sx={{
                      bgcolor: `${getPriorityColor()}20`,
                      color: getPriorityColor(),
                      fontWeight: 700,
                      fontSize: '0.75rem',
                    }}
                  />
                </Box>
                <Slider
                  value={formData.priority}
                  onChange={(_, value) => setFormData({ ...formData, priority: value as number })}
                  min={0}
                  max={100}
                  step={5}
                  disabled={viewMode}
                  marks={[
                    { value: 0, label: '0' },
                    { value: 50, label: '50' },
                    { value: 100, label: '100' },
                  ]}
                  sx={{
                    color: getPriorityColor(),
                    '& .MuiSlider-markLabel': {
                      color: 'hsl(var(--muted-foreground))',
                    },
                  }}
                />
                <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))', mt: 0.5, display: 'block' }}>
                  Higher values indicate higher authority
                </Typography>
              </Box>

              <Box sx={{
                flex: 1,
                p: 2,
                bgcolor: 'hsl(var(--muted) / 0.3)',
                borderRadius: 2,
                border: '1px solid hsl(var(--border))',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body1" fontWeight={600}>
                    Active Status
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', mb: 1, pl: 1 }}>
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    disabled={viewMode}
                    sx={{
                      width: '90px',
                      height: '30px',
                      padding: 0,
                      '& .MuiSwitch-switchBase': {
                        padding: '3px',
                        color: '#fff',
                        '&.Mui-checked': {
                          transform: 'translateX(60px)',
                          color: '#fff',
                          '& + .MuiSwitch-track': {
                            backgroundColor: 'hsl(var(--primary))',
                            opacity: 1,
                          },
                        },
                      },
                      '& .MuiSwitch-thumb': {
                        width: 24,
                        height: 24,
                        backgroundColor: '#fff',
                      },
                      '& .MuiSwitch-track': {
                        borderRadius: 15,
                        backgroundColor: 'hsl(var(--muted))',
                        opacity: 1,
                      },
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))', mt: 0.5, display: 'block' }}>
                  Available for assignment
                </Typography>
              </Box>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={onClose}
            disabled={!viewMode && (createRoleMutation.isPending || updateRoleMutation.isPending)}
            sx={{
              textTransform: 'none',
              color: 'hsl(var(--muted-foreground))',
              px: 3,
            }}
          >
            {viewMode ? 'Close' : 'Cancel'}
          </Button>
          {!viewMode && (
            <Button
              type="submit"
              variant="contained"
              disabled={createRoleMutation.isPending || updateRoleMutation.isPending}
              sx={{
                bgcolor: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
                textTransform: 'none',
                px: 3,
                boxShadow: '0 4px 12px hsl(var(--primary) / 0.3)',
                '&:hover': {
                  bgcolor: 'hsl(var(--primary) / 0.9)',
                  boxShadow: '0 6px 16px hsl(var(--primary) / 0.4)',
                },
              }}
            >
              {role ? 'Update Role' : 'Create Role'}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};
