import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { PageHeader } from '../components/PageHeader';
import { productsApi } from '../services/api';
import { useSnackbar } from '../contexts/SnackbarContext';

// Zod validation schema
const productSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .min(3, 'Product name must be at least 3 characters')
    .max(100, 'Product name must not exceed 100 characters'),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional()
    .or(z.literal('')),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductCreate() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      setLoading(true);
      setApiError(null);
      const response = await productsApi.create(data);
      showSnackbar('Product created successfully', 'success');
      navigate(`/products/${response.data.id}`);
    } catch (err: any) {
      console.error('Failed to create product:', err);
      const errorMessage = err.response?.data?.detail || 'Failed to create product';
      setApiError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: 'hsl(var(--background))', minHeight: '100vh', py: 4 }}>
      <Container maxWidth={false} sx={{ width: '80%', mx: 'auto' }}>
        <PageHeader
          title="Create Product"
          description="Add a new product to your catalog"
          actions={
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/products')}
              disabled={loading}
            >
              Back to Products
            </Button>
          }
        />

        {apiError && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setApiError(null)}>
            {apiError}
          </Alert>
        )}

        <Card
          elevation={3}
          sx={{
            borderRadius: 3,
            background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card)/.95) 100%)',
            border: '1px solid hsl(var(--border))',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                {/* Product Name */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}
                  >
                    Product Name <span style={{ color: 'hsl(var(--destructive))' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    {...register('name')}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    placeholder="e.g., LPG Gas Cylinder"
                    disabled={loading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: 'hsl(var(--primary))',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'hsl(var(--primary))',
                          borderWidth: 2,
                        },
                      },
                    }}
                  />
                </Box>

                {/* Description */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}
                  >
                    Description
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    {...register('description')}
                    error={!!errors.description}
                    helperText={errors.description?.message || 'Optional: Provide a detailed description of the product'}
                    placeholder="Product description..."
                    disabled={loading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: 'hsl(var(--primary))',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'hsl(var(--primary))',
                          borderWidth: 2,
                        },
                      },
                    }}
                  />
                </Box>

                {/* Form Actions */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'flex-end',
                    mt: 2,
                    pt: 3,
                    borderTop: '1px solid hsl(var(--border))',
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/products')}
                    disabled={loading}
                    sx={{ px: 3 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                    disabled={loading || !isValid}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      minWidth: 150,
                    }}
                  >
                    {loading ? 'Creating...' : 'Create Product'}
                  </Button>
                </Box>
              </Box>
            </form>
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card
          sx={{
            mt: 3,
            borderRadius: 2,
            bgcolor: 'hsl(var(--muted))',
            border: '1px solid hsl(var(--border))',
          }}
        >
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Next Steps
            </Typography>
            <Typography variant="body2" color="text.secondary">
              After creating the product, you'll be able to add variants with different sizes, types, and units.
              Variants allow you to manage different configurations of the same product.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
