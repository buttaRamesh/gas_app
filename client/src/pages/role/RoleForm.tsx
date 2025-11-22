import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
  CircularProgress,
  Divider,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { rolesApi } from '@/services/api';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { PageHeader } from '@/components/PageHeader';
import { StatusSelect, type StatusOption } from '@/components/common';

const STATUS_OPTIONS: StatusOption[] = [
  { value: true, label: 'Active', color: 'success' },
  { value: false, label: 'Inactive', color: 'error' },
];

const roleSchema = z.object({
  name: z.string().min(1, 'Role name is required').regex(/^[a-z_]+$/, 'Role name must be lowercase letters and underscores only'),
  display_name: z.string().min(1, 'Display name is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.number().min(1, 'Priority must be at least 1').max(100, 'Priority must be at most 100'),
  is_active: z.boolean(),
});

type RoleFormValues = z.infer<typeof roleSchema>;

export default function RoleForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const { data: role } = useQuery({
    queryKey: ['role', id],
    queryFn: () => rolesApi.getById(Number(id)),
    enabled: isEdit,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      display_name: '',
      description: '',
      priority: 5,
      is_active: true,
    },
  });

  useEffect(() => {
    if (role?.data) {
      reset({
        name: role.data.name,
        display_name: role.data.display_name,
        description: role.data.description,
        priority: role.data.priority,
        is_active: role.data.is_active,
      });
    }
  }, [role, reset]);

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (isEdit) {
        return rolesApi.update(Number(id), data);
      }
      return rolesApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      showSnackbar(
        isEdit ? 'Role updated successfully' : 'Role created successfully',
        'success'
      );
      navigate('/roles');
    },
    onError: (error: any) => {
      showSnackbar(
        error.response?.data?.message || 'Failed to save role',
        'error'
      );
    },
  });

  const onSubmit = (data: RoleFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Container maxWidth="lg">
      <PageHeader
        title={isEdit ? 'Edit Role' : 'Create Role'}
        description={isEdit ? 'Update role information' : 'Add a new role to the system'}
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/roles')}
          >
            Back
          </Button>
        }
      />

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Basic Information Section */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
                  Basic Information
                </Typography>
                <Divider />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Role Name (Internal)"
                    disabled={isEdit}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    placeholder="e.g., route_manager, data_viewer"
                    required
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="display_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Display Name (Public)"
                    error={!!errors.display_name}
                    helperText={errors.display_name?.message}
                    placeholder="e.g., Route Manager, Data Viewer"
                    required
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    placeholder="e.g., Manages delivery routes, assigns areas to delivery persons"
                    required
                  />
                )}
              />
            </Grid>

            {/* Configuration Section */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2, mt: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
                  Configuration
                </Typography>
                <Divider />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Priority"
                    type="number"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    error={!!errors.priority}
                    helperText={errors.priority?.message || 'Lower number = higher priority (1-100)'}
                    required
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="is_active"
                control={control}
                render={({ field, fieldState }) => (
                  <StatusSelect
                    label="Status"
                    value={field.value}
                    onChange={field.onChange}
                    options={STATUS_OPTIONS}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>

            {/* Actions */}
            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/roles')}
                  disabled={mutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={mutation.isPending ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={mutation.isPending}
                >
                  {isEdit ? 'Update' : 'Create'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}
