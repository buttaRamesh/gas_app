import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Alert,
  Skeleton,
  Divider,
  Chip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { ArrowBack, Edit, Delete } from '@mui/icons-material';
import { PageHeader } from '../../components/PageHeader';
import { FormDialog } from '../../components/common';
import { useProducts } from '../../hooks';
import { productsApi, productCategoriesApi, unitsApi } from '../../services/api';
import { useSnackbar } from '../../contexts/SnackbarContext';
import type { ProductCategory, Unit } from '../../types/products';

// Validation schema
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').min(3, 'Must be at least 3 characters'),
  product_code: z.string().optional().nullable(),
  category: z.string().min(1, 'Category is required'),
  unit: z.string().min(1, 'Unit is required'),
  is_cylinder: z.boolean(),
  description: z.string().max(500, 'Description too long').optional().nullable(),
  is_active: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const { product, loading, refetch } = useProducts({
    productId: Number(id),
  });

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Form for editing product
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    mode: 'onChange',
  });

  const isCylinder = watch('is_cylinder');

  useEffect(() => {
    fetchCategoriesAndUnits();
  }, []);

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        product_code: product.product_code || '',
        category: String(product.category.id),
        unit: String(product.unit.id),
        is_cylinder: product.is_cylinder,
        description: product.description || '',
        is_active: product.is_active,
      });
    }
  }, [product, reset]);

  const fetchCategoriesAndUnits = async () => {
    try {
      const [categoriesRes, unitsRes] = await Promise.all([
        productCategoriesApi.getAll(),
        unitsApi.getAll(),
      ]);
      setCategories(categoriesRes.data.results || categoriesRes.data);
      setUnits(unitsRes.data.results || unitsRes.data);
    } catch (err) {
      console.error('Failed to fetch categories/units:', err);
    }
  };

  const onProductUpdate = async (data: ProductFormData) => {
    try {
      await productsApi.update(Number(id), {
        ...data,
        category: Number(data.category),
        unit: Number(data.unit),
        product_code: data.product_code || null,
        description: data.description || null,
      });
      showSnackbar('Product updated successfully', 'success');
      setEditDialogOpen(false);
      refetch();
    } catch (err: any) {
      console.error('Failed to update product:', err);
      showSnackbar(err.response?.data?.detail || 'Failed to update product', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await productsApi.delete(Number(id));
      showSnackbar('Product deleted successfully', 'success');
      navigate('/products');
    } catch (err: any) {
      console.error('Failed to delete product:', err);
      showSnackbar(err.response?.data?.detail || 'Failed to delete product', 'error');
    }
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: 'hsl(var(--background))', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          <Skeleton variant="rectangular" height={100} sx={{ mb: 3, borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
        </Container>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ bgcolor: 'hsl(var(--background))', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          <Alert severity="error">Product not found</Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/products')}
            sx={{ mt: 2 }}
          >
            Back to Products
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'hsl(var(--background))', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <PageHeader
          title={product.name}
          description={product.description || 'No description provided'}
          actions={
            <>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate('/products')}
                sx={{ mr: 2 }}
              >
                Back
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => setDeleteDialogOpen(true)}
                sx={{ mr: 2 }}
              >
                Delete
              </Button>
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => setEditDialogOpen(true)}
              >
                Edit Product
              </Button>
            </>
          }
        />

        {/* Product Info Card */}
        <Card
          elevation={2}
          sx={{
            mb: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card)/.98) 100%)',
            border: '1px solid hsl(var(--border))',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                  Product Code
                </Typography>
                <Typography variant="h6" sx={{ fontFamily: 'monospace', mt: 0.5 }}>
                  {product.product_code || 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                  Category
                </Typography>
                <Typography variant="h6" sx={{ mt: 0.5 }}>
                  {product.category.name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                  Unit
                </Typography>
                <Typography variant="h6" sx={{ mt: 0.5 }}>
                  {product.unit.short_name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                  Type
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={product.is_cylinder ? 'Cylinder' : 'Non-Cylinder'}
                    color={product.is_cylinder ? 'primary' : 'default'}
                    size="small"
                  />
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={product.is_active ? 'Active' : 'Inactive'}
                    color={product.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                  Created
                </Typography>
                <Typography variant="h6" sx={{ mt: 0.5 }}>
                  {product.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Additional Details Card */}
        <Card
          elevation={3}
          sx={{
            borderRadius: 3,
            background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card)/.95) 100%)',
            border: '1px solid hsl(var(--border))',
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Product Details
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Product Name
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {product.name}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {product.description || 'No description provided'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Category Details
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {product.category.description || product.category.name}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Unit Details
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {product.unit.description} ({product.unit.short_name})
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Edit Product Dialog */}
      <FormDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        title="Edit Product"
        onSubmit={handleSubmit(onProductUpdate)}
        submitLabel="Save Changes"
        maxWidth="sm"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <TextField
            fullWidth
            label="Product Name"
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
          />

          <TextField
            fullWidth
            label="Product Code"
            {...register('product_code')}
            error={!!errors.product_code}
            helperText={errors.product_code?.message || (isCylinder ? 'Required for cylinder products' : 'Optional for non-cylinder products')}
          />

          <TextField
            fullWidth
            select
            label="Category"
            {...register('category')}
            error={!!errors.category}
            helperText={errors.category?.message}
          >
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            select
            label="Unit"
            {...register('unit')}
            error={!!errors.unit}
            helperText={errors.unit?.message}
          >
            {units.map((unit) => (
              <MenuItem key={unit.id} value={unit.id}>
                {unit.short_name} - {unit.description}
              </MenuItem>
            ))}
          </TextField>

          <FormControlLabel
            control={<Switch {...register('is_cylinder')} defaultChecked={product.is_cylinder} />}
            label="Is Cylinder Product"
          />

          <FormControlLabel
            control={<Switch {...register('is_active')} defaultChecked={product.is_active} />}
            label="Active"
          />

          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            {...register('description')}
            error={!!errors.description}
            helperText={errors.description?.message}
          />
        </Box>
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <FormDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Delete Product"
        onSubmit={handleDelete}
        submitLabel="Delete Product"
        maxWidth="sm"
      >
        <Alert severity="warning" sx={{ mb: 2 }}>
          This action cannot be undone!
        </Alert>
        <Typography>
          Are you sure you want to delete <strong>"{product.name}"</strong>?
        </Typography>
      </FormDialog>
    </Box>
  );
}
