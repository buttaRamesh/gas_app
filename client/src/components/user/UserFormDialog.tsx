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
} from '@mui/material';
import {
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/services/api';
import type { User } from '@/types/auth';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  viewMode?: boolean;
}

export const UserFormDialog = ({ open, onOpenChange, user, viewMode = false }: UserFormDialogProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    employee_id: user?.employee_id || '',
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
    is_active: user?.is_active ?? true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        employee_id: user.employee_id || '',
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        is_active: user.is_active ?? true,
      });
    } else {
      setFormData({
        employee_id: '',
        full_name: '',
        email: '',
        phone: '',
        password: '',
        is_active: true,
      });
    }
  }, [user, open]);

  const createUserMutation = useMutation({
    mutationFn: (data: any) => usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`${formData.full_name} has been added successfully.`);
      resetAndClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create user');
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: (data: any) => usersApi.update(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`${formData.full_name} has been updated successfully.`);
      resetAndClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update user');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {
      employee_id: formData.employee_id,
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      is_active: formData.is_active,
    };

    // Only include password if it's provided (for create or update)
    if (formData.password) {
      payload.password = formData.password;
    }

    if (user) {
      updateUserMutation.mutate(payload);
    } else {
      createUserMutation.mutate(payload);
    }
  };

  const resetAndClose = () => {
    setFormData({
      employee_id: '',
      full_name: '',
      email: '',
      phone: '',
      password: '',
      is_active: true,
    });
    onOpenChange(false);
  };

  const onClose = () => {
    resetAndClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          bgcolor: 'hsl(var(--card))',
          borderRadius: 3,
          border: '1px solid hsl(var(--border))',
        },
      }}
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
              <PersonAddIcon sx={{ color: 'hsl(var(--primary-foreground))' }} />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: 'hsl(var(--primary-foreground))' }}>
                {viewMode ? 'View User' : user ? 'Edit User' : 'Add New User'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'hsl(var(--primary-foreground) / 0.8)' }}>
                {viewMode ? 'User account details and information' : user ? 'Update user account details' : 'Create a new user account'}
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
                Employee ID *
              </Typography>
              <TextField
                fullWidth
                placeholder="EMP001"
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                required
                size="small"
                disabled={viewMode}
                InputProps={{
                  startAdornment: <BadgeIcon sx={{ mr: 1, color: 'hsl(var(--muted-foreground))' }} />,
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
                Full Name *
              </Typography>
              <TextField
                fullWidth
                placeholder="John Doe"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
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

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: 'hsl(var(--foreground))' }}>
                  Email *
                </Typography>
                <TextField
                  fullWidth
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  size="small"
                  disabled={viewMode}
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: 'hsl(var(--muted-foreground))' }} />,
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

              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: 'hsl(var(--foreground))' }}>
                  Phone
                </Typography>
                <TextField
                  fullWidth
                  type="tel"
                  placeholder="+1234567890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  size="small"
                  disabled={viewMode}
                  InputProps={{
                    startAdornment: <PhoneIcon sx={{ mr: 1, color: 'hsl(var(--muted-foreground))' }} />,
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
            </Box>

            {!user && !viewMode && (
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: 'hsl(var(--foreground))' }}>
                  Password *
                </Typography>
                <TextField
                  fullWidth
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!user}
                  size="small"
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
            )}

            <Divider />

            <Box sx={{
              p: 2.5,
              bgcolor: 'hsl(var(--muted) / 0.3)',
              borderRadius: 2,
              border: '1px solid hsl(var(--border))',
            }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    disabled={viewMode}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: 'hsl(var(--primary))',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: 'hsl(var(--primary))',
                      },
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      Active Status
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                      User can access the system
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={onClose}
            disabled={!viewMode && (createUserMutation.isPending || updateUserMutation.isPending)}
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
              disabled={createUserMutation.isPending || updateUserMutation.isPending}
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
              {user ? 'Update User' : 'Create User'}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};
