import { useState, useEffect } from 'react';
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
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { PageHeader } from '../../components/PageHeader';
import { productsApi, productCategoriesApi, unitsApi } from '../../services/api';
import { useSnackbar } from '../../contexts/SnackbarContext';
import type { ProductCategory, Unit } from '../../types/products';

// Zod validation schema
const productSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .min(3, 'Product name must be at least 3 characters')
    .max(200, 'Product name must not exceed 200 characters'),
  product_code: z
    .string()
    .max(20, 'Product code must not exceed 20 characters')
    .optional()
    .or(z.literal('')),
  category: z.string().min(1, 'Category is required'),
  unit: z.string().min(1, 'Unit is required'),
  is_cylinder: z.boolean().default(false),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional()
    .or(z.literal('')),
  is_active: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductCreate() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      product_code: '',
      category: '',
      unit: '',
      is_cylinder: false,
      description: '',
      is_active: true,
    },
  });

  const isCylinder = watch('is_cylinder');

  useEffect(() => {
    fetchCategoriesAndUnits();
  }, []);

  const fetchCategoriesAndUnits = async () => {
    try {
      const [categoriesRes, unitsRes] = await Promise.all([
        productCategoriesApi.getAll(),
        unitsApi.getAll(),
      ]);
      setCategories(categoriesRes.data.results || categoriesRes.data);
      setUnits(unitsRes.data.results || unitsRes.data);
    } catch (err: any) {
      console.error('Failed to fetch categories/units:', err);
      showSnackbar('Failed to load form data', 'error');
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setLoading(true);
      setApiError(null);
      const response = await productsApi.create({
        ...data,
        category: Number(data.category),
        unit: Number(data.unit),
        product_code: data.product_code || null,
        description: data.description || null,
      });
      showSnackbar('Product created successfully', 'success');
      navigate(`/products/${response.data.id}`);
    } catch (err: any) {
      console.error('Failed to create product:', err);
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || 'Failed to create product';
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
                  />
                </Box>

                {/* Product Code */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}
                  >
                    Product Code {isCylinder && <span style={{ color: 'hsl(var(--destructive))' }}>*</span>}
                  </Typography>
                  <TextField
                    fullWidth
                    {...register('product_code')}
                    error={!!errors.product_code}
                    helperText={errors.product_code?.message || (isCylinder ? 'Required for cylinder products' : 'Optional for non-cylinder products')}
                    placeholder="e.g., LPG-14.2"
                    disabled={loading}
                  />
                </Box>

                {/* Category */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}
                  >
                    Category <span style={{ color: 'hsl(var(--destructive))' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    select
                    {...register('category')}
                    error={!!errors.category}
                    helperText={errors.category?.message}
                    disabled={loading || categories.length === 0}
                    defaultValue=""
                  >
                    {categories.length === 0 ? (
                      <MenuItem value="" disabled>
                        No categories available
                      </MenuItem>
                    ) : (
                      categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </MenuItem>
                      ))
                    )}
                  </TextField>
                </Box>

                {/* Unit */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}
                  >
                    Unit <span style={{ color: 'hsl(var(--destructive))' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    select
                    {...register('unit')}
                    error={!!errors.unit}
                    helperText={errors.unit?.message}
                    disabled={loading || units.length === 0}
                    defaultValue=""
                  >
                    {units.length === 0 ? (
                      <MenuItem value="" disabled>
                        No units available
                      </MenuItem>
                    ) : (
                      units.map((unit) => (
                        <MenuItem key={unit.id} value={unit.id}>
                          {unit.short_name} - {unit.description}
                        </MenuItem>
                      ))
                    )}
                  </TextField>
                </Box>

                {/* Is Cylinder */}
                <Box>
                  <FormControlLabel
                    control={<Switch {...register('is_cylinder')} />}
                    label="Is Cylinder Product"
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, ml: 4 }}>
                    Check this if the product is a cylinder (requires product code)
                  </Typography>
                </Box>

                {/* Is Active */}
                <Box>
                  <FormControlLabel
                    control={<Switch {...register('is_active')} defaultChecked />}
                    label="Active"
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, ml: 4 }}>
                    Inactive products won't appear in listings
                  </Typography>
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
              Product Information
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Products represent items in your catalog. Each product must have a name, category, and unit.
              For cylinder products, a unique product code is required. Use the description field to add
              additional details about the product.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
