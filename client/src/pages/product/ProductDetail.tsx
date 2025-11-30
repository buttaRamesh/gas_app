import { useEffect ,useState} from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  Alert,
  Skeleton,
  Tooltip,
  Divider,
} from '@mui/material';
import { ArrowBack, Edit, Delete, Add, Save, Close } from '@mui/icons-material';
import { PageHeader } from '../../components/PageHeader';
import { FormDialog } from '../../components/common';
import { useProducts } from '../../hooks';
import { productsApi, variantsApi } from '../../services/api';
import { VariantType } from '../../types/products';
import { useSnackbar } from '../../contexts/SnackbarContext';

const VARIANT_TYPES: VariantType[] = ['DOMESTIC', 'COMMERCIAL', 'INDUSTRIAL', 'OTHER'];

// Validation schemas
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').min(3, 'Must be at least 3 characters'),
  description: z.string().max(500, 'Description too long').optional().or(z.literal('')),
});

const variantSchema = z.object({
  product_code: z.string().min(1, 'Product code is required'),
  name: z.string().min(1, 'Variant name is required'),
  unit: z.string().min(1, 'Unit is required'),
  quantity: z.string().min(1, 'Quantity is required').refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Quantity must be a positive number',
  }),
  price: z.string().min(1, 'Price is required').refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Price must be a positive number',
  }),
  variant_type: z.enum(['DOMESTIC', 'COMMERCIAL', 'INDUSTRIAL', 'OTHER']),
});

type ProductFormData = z.infer<typeof productSchema>;
type VariantFormData = z.infer<typeof variantSchema>;

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const { product, variants, units, loading, refetch } = useProducts({
    productId: Number(id),
    includeVariants: true,
    includeUnits: true,
  });

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addVariantDialogOpen, setAddVariantDialogOpen] = useState(false);
  const [deleteVariantDialogOpen, setDeleteVariantDialogOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  // Form for editing product
  const {
    register: registerProduct,
    handleSubmit: handleProductSubmit,
    formState: { errors: productErrors },
    reset: resetProduct,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    mode: 'onChange',
  });

  // Form for adding variant
  const {
    register: registerVariant,
    handleSubmit: handleVariantSubmit,
    formState: { errors: variantErrors },
    reset: resetVariant,
    setValue: setVariantValue,
    watch: watchVariant,
  } = useForm<VariantFormData>({
    resolver: zodResolver(variantSchema),
    mode: 'onChange',
    defaultValues: {
      product_code: '',
      name: '',
      unit: '',
      quantity: '',
      price: '',
      variant_type: 'DOMESTIC',
    },
  });

  useEffect(() => {
    if (product) {
      resetProduct({
        name: product.name,
        description: product.description || '',
      });
    }
  }, [product, resetProduct]);

  const onProductUpdate = async (data: ProductFormData) => {
    try {
      await productsApi.update(Number(id), data);
      showSnackbar('Product updated successfully', 'success');
      setEditDialogOpen(false);
      refetch();
    } catch (err: any) {
      console.error('Failed to update product:', err);
      showSnackbar('Failed to update product', 'error');
    }
  };

  const onVariantAdd = async (data: VariantFormData) => {
    try {
      await productsApi.addVariant(Number(id), {
        ...data,
        product: Number(id),
        unit: Number(data.unit),
        quantity: parseFloat(data.quantity),
        price: parseFloat(data.price),
      });
      showSnackbar('Variant added successfully', 'success');
      setAddVariantDialogOpen(false);
      resetVariant();
      refetch();
    } catch (err: any) {
      console.error('Failed to add variant:', err);
      showSnackbar(err.response?.data?.detail || 'Failed to add variant', 'error');
    }
  };

  const handleDeleteVariant = async () => {
    if (!selectedVariant) return;

    try {
      await variantsApi.delete(selectedVariant.id);
      showSnackbar('Variant deleted successfully', 'success');
      setDeleteVariantDialogOpen(false);
      setSelectedVariant(null);
      refetch();
    } catch (err: any) {
      console.error('Failed to delete variant:', err);
      showSnackbar('Failed to delete variant', 'error');
    }
  };

  const getVariantTypeColor = (type: VariantType) => {
    switch (type) {
      case 'DOMESTIC':
        return 'primary';
      case 'COMMERCIAL':
        return 'success';
      case 'INDUSTRIAL':
        return 'warning';
      default:
        return 'default';
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
          <Alert severity="error">
            Product not found
          </Alert>
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
            <Box sx={{ display: 'flex', gap: 4 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                  Product ID
                </Typography>
                <Typography variant="h6" sx={{ fontFamily: 'monospace', mt: 0.5 }}>
                  #{product.id}
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                  Total Variants
                </Typography>
                <Typography variant="h6" sx={{ mt: 0.5 }}>
                  {variants.length}
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box sx={{ flex: 1 }}>
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

        {/* Variants Card */}
        <Card
          elevation={3}
          sx={{
            borderRadius: 3,
            background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card)/.95) 100%)',
            border: '1px solid hsl(var(--border))',
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Product Variants
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage different configurations of this product
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setAddVariantDialogOpen(true)}
              >
                Add Variant
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Unit</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {variants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          <Typography variant="h6" color="text.secondary">
                            No variants yet
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Add variants to define different configurations of this product
                          </Typography>
                          <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => setAddVariantDialogOpen(true)}
                            sx={{ mt: 1 }}
                          >
                            Add First Variant
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    variants.map((variant) => (
                      <TableRow key={variant.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                            {variant.product_code}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {variant.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1">{variant.quantity}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={variant.unit_name || variant.unit}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                            ₹{variant.price ? Number(variant.price).toFixed(2) : '0.00'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={variant.variant_type}
                            size="small"
                            color={getVariantTypeColor(variant.variant_type)}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Delete Variant">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setSelectedVariant(variant);
                                setDeleteVariantDialogOpen(true);
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Container>

      {/* Edit Product Dialog */}
      <FormDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        title="Edit Product"
        onSubmit={handleProductSubmit(onProductUpdate)}
        submitLabel="Save Changes"
        maxWidth="sm"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <TextField
            fullWidth
            label="Product Name"
            {...registerProduct('name')}
            error={!!productErrors.name}
            helperText={productErrors.name?.message}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            {...registerProduct('description')}
            error={!!productErrors.description}
            helperText={productErrors.description?.message}
          />
        </Box>
      </FormDialog>

      {/* Add Variant Dialog */}
      <FormDialog
        open={addVariantDialogOpen}
        onClose={() => setAddVariantDialogOpen(false)}
        title="Add Product Variant"
        onSubmit={handleVariantSubmit(onVariantAdd)}
        submitLabel="Add Variant"
        maxWidth="sm"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          <TextField
            fullWidth
            label="Product Code"
            {...registerVariant('product_code')}
            error={!!variantErrors.product_code}
            helperText={variantErrors.product_code?.message || 'Unique identifier for this variant'}
            placeholder="e.g., LPG-14.2-DOM"
          />
          <TextField
            fullWidth
            label="Variant Name"
            {...registerVariant('name')}
            error={!!variantErrors.name}
            helperText={variantErrors.name?.message}
            placeholder="e.g., 14.2 kg Domestic"
          />
          <TextField
            fullWidth
            label="Quantity"
            type="number"
            {...registerVariant('quantity')}
            error={!!variantErrors.quantity}
            helperText={variantErrors.quantity?.message}
            placeholder="e.g., 14.2"
            inputProps={{ step: '0.01', min: '0' }}
          />
          <TextField
            fullWidth
            select
            label="Unit"
            {...registerVariant('unit')}
            error={!!variantErrors.unit}
            helperText={variantErrors.unit?.message}
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
          <TextField
            fullWidth
            label="Price"
            type="number"
            {...registerVariant('price')}
            error={!!variantErrors.price}
            helperText={variantErrors.price?.message || 'Price in INR (₹)'}
            placeholder="e.g., 850.00"
            inputProps={{ step: '0.01', min: '0' }}
          />
          <TextField
            fullWidth
            select
            label="Variant Type"
            {...registerVariant('variant_type')}
            error={!!variantErrors.variant_type}
            helperText={variantErrors.variant_type?.message}
            defaultValue="DOMESTIC"
          >
            {VARIANT_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </FormDialog>

      {/* Delete Variant Dialog */}
      <FormDialog
        open={deleteVariantDialogOpen}
        onClose={() => setDeleteVariantDialogOpen(false)}
        title="Delete Variant"
        onSubmit={handleDeleteVariant}
        submitLabel="Delete Variant"
        maxWidth="xs"
      >
        <Alert severity="warning" sx={{ mb: 2 }}>
          This action cannot be undone!
        </Alert>
        <Typography>
          Are you sure you want to delete variant <strong>"{selectedVariant?.name}"</strong>?
        </Typography>
      </FormDialog>
    </Box>
  );
}
