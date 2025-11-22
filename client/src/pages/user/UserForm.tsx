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
import { usersApi } from '@/services/api';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { PageHeader } from '@/components/PageHeader';
import { StatusSelect, type StatusOption } from '@/components/common';

const STATUS_OPTIONS: StatusOption[] = [
  { value: true, label: 'Active', color: 'success' },
  { value: false, label: 'Inactive', color: 'error' },
];

const userSchema = z.object({
  employee_id: z.string().min(1, 'Employee ID is required'),
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  phone: z.string().optional(),
  is_active: z.boolean(),
});

type UserFormValues = z.infer<typeof userSchema>;

export default function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const { data: user } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getById(Number(id)),
    enabled: isEdit,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      employee_id: '',
      full_name: '',
      email: '',
      password: '',
      phone: '',
      is_active: true,
    },
  });

  useEffect(() => {
    if (user?.data) {
      reset({
        employee_id: user.data.employee_id,
        full_name: user.data.full_name,
        email: user.data.email,
        password: '',
        phone: user.data.phone || '',
        is_active: user.data.is_active,
      });
    }
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (isEdit) {
        return usersApi.update(Number(id), data);
      }
      return usersApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showSnackbar(
        isEdit ? 'User updated successfully' : 'User created successfully',
        'success'
      );
      navigate('/users');
    },
    onError: (error: any) => {
      showSnackbar(
        error.response?.data?.message || 'Failed to save user',
        'error'
      );
    },
  });

  const onSubmit = (data: UserFormValues) => {
    const submitData = { ...data };
    if (isEdit && !submitData.password) {
      delete submitData.password;
    }
    mutation.mutate(submitData);
  };

  return (
    <Container maxWidth="lg">
      <PageHeader
        title={isEdit ? 'Edit User' : 'Create User'}
        description={isEdit ? 'Update user information' : 'Add a new user to the system'}
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/users')}
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
                name="employee_id"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Employee ID"
                    disabled={isEdit}
                    error={!!errors.employee_id}
                    helperText={errors.employee_id?.message}
                    placeholder="e.g., admin, EMP001"
                    required
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="full_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Full Name"
                    error={!!errors.full_name}
                    helperText={errors.full_name?.message}
                    placeholder="e.g., John Doe"
                    required
                  />
                )}
              />
            </Grid>

            {/* Contact Information Section */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2, mt: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
                  Contact Information
                </Typography>
                <Divider />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email Address"
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    placeholder="user@example.com"
                    required
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Phone Number"
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    placeholder="+91 9876543210"
                  />
                )}
              />
            </Grid>

            {/* Security Section */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2, mt: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
                  Security & Status
                </Typography>
                <Divider />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={isEdit ? 'New Password (leave blank to keep current)' : 'Password'}
                    type="password"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    placeholder={isEdit ? 'Leave blank to keep current' : ''}
                    required={!isEdit}
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
                  onClick={() => navigate('/users')}
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
