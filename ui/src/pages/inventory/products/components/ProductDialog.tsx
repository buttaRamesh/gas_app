import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  IconButton,
  useTheme,
  Alert,
  CircularProgress,
  Divider,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  Straighten as UnitIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import inventoryApi from '@/api/inventory';
import type { Product, ProductWrite, ProductCategory, Unit } from '@/api/inventory';

interface ProductDialogProps {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
  onSuccess?: () => void;
}

const ProductDialog: React.FC<ProductDialogProps> = ({
  open,
  onClose,
  product,
  onSuccess,
}) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const isEditing = !!product;

  const [formData, setFormData] = useState<ProductWrite>({
    name: '',
    product_code: '',
    category: 0,
    unit: 0,
    is_cylinder: false,
    description: '',
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch categories
  const { data: categoriesData, isLoading: loadingCategories } = useQuery({
    queryKey: ['productCategories'],
    queryFn: () => inventoryApi.getProductCategories({ page_size: 100 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
    enabled: open,            // Only fetch when dialog is open
  });

  // Fetch units
  const { data: unitsData, isLoading: loadingUnits } = useQuery({
    queryKey: ['units'],
    queryFn: () => inventoryApi.getUnits({ page_size: 100 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
    enabled: open,            // Only fetch when dialog is open
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: inventoryApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      if (error.response?.data) {
        setErrors(error.response.data);
      }
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProductWrite> }) =>
      inventoryApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      if (error.response?.data) {
        setErrors(error.response.data);
      }
    },
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        product_code: product.product_code || '',
        category: product.category.id,
        unit: product.unit.id,
        is_cylinder: product.is_cylinder,
        description: product.description || '',
        is_active: product.is_active,
      });
    } else {
      setFormData({
        name: '',
        product_code: '',
        category: 0,
        unit: 0,
        is_cylinder: false,
        description: '',
        is_active: true,
      });
    }
    setErrors({});
  }, [product, open]);

  const handleChange = (field: keyof ProductWrite, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.unit) {
      newErrors.unit = 'Unit is required';
    }
    if (formData.is_cylinder && !formData.product_code?.trim()) {
      newErrors.product_code = 'Product code is required for cylinder products';
    }
    if (!formData.is_cylinder && formData.product_code?.trim()) {
      newErrors.product_code = 'Non-cylinder products should not have a product code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const submitData: ProductWrite = {
      ...formData,
      product_code: formData.product_code?.trim() || null,
      description: formData.description?.trim() || null,
    };

    if (isEditing && product) {
      updateMutation.mutate({ id: product.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const categories = categoriesData?.results || [];
  const units = unitsData?.results || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: theme.palette.secondary.main,
          color: theme.palette.secondary.contrastText,
          py: 1,
          px: 2,
          mb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InventoryIcon sx={{ fontSize: 20 }} />
          <Typography variant="subtitle1" fontWeight={600}>
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{ color: 'inherit', p: 0.5 }}
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        {Object.keys(errors).length > 0 && errors.non_field_errors && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.non_field_errors}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Product Name */}
          <TextField
            label="Product Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            required
            size="small"
          />

          {/* Category & Unit Row */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <FormControl size="small" error={!!errors.category} required>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category || ''}
                onChange={(e) => handleChange('category', e.target.value)}
                label="Category"
                startAdornment={
                  <CategoryIcon sx={{ ml: 1, mr: 0.5, color: theme.palette.text.secondary, fontSize: 20 }} />
                }
              >
                {loadingCategories ? (
                  <MenuItem disabled>Loading...</MenuItem>
                ) : (
                  categories.filter(c => c.is_active).map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))
                )}
              </Select>
              {errors.category && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.category}
                </Typography>
              )}
            </FormControl>

            <FormControl size="small" error={!!errors.unit} required>
              <InputLabel>Unit</InputLabel>
              <Select
                value={formData.unit || ''}
                onChange={(e) => handleChange('unit', e.target.value)}
                label="Unit"
                startAdornment={
                  <UnitIcon sx={{ ml: 1, mr: 0.5, color: theme.palette.text.secondary, fontSize: 20 }} />
                }
              >
                {loadingUnits ? (
                  <MenuItem disabled>Loading...</MenuItem>
                ) : (
                  units.filter(u => u.is_active).map((unit) => (
                    <MenuItem key={unit.id} value={unit.id}>
                      {unit.short_name}
                    </MenuItem>
                  ))
                )}
              </Select>
              {errors.unit && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.unit}
                </Typography>
              )}
            </FormControl>
          </Box>

          <Divider />

          {/* Cylinder Toggle */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              borderRadius: 1,
              bgcolor: formData.is_cylinder
                ? theme.palette.primary.main + '10'
                : theme.palette.background.default,
              border: `1px solid ${formData.is_cylinder ? theme.palette.primary.main : theme.palette.divider}`,
            }}
          >
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                Cylinder Product
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Enable if this is an OMC cylinder product
              </Typography>
            </Box>
            <Switch
              checked={formData.is_cylinder}
              onChange={(e) => handleChange('is_cylinder', e.target.checked)}
              color="primary"
              sx={{ transform: 'scale(1.3)' }}
            />
          </Box>

          {/* Product Code - Only visible when is_cylinder is true */}
          {formData.is_cylinder && (
            <TextField
              label="OMC Product Code"
              value={formData.product_code || ''}
              onChange={(e) => handleChange('product_code', e.target.value)}
              error={!!errors.product_code}
              helperText={errors.product_code || 'Unique OMC product code for cylinder'}
              fullWidth
              required
              size="small"
            />
          )}

          {/* Description */}
          <TextField
            label="Description"
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            multiline
            rows={3}
            fullWidth
            size="small"
            placeholder="Optional product description..."
          />

          {/* Active Status */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              borderRadius: 1,
              bgcolor: theme.palette.background.default,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Status
              </Typography>
              <Chip
                label={formData.is_active ? 'Active' : 'Inactive'}
                size="small"
                color={formData.is_active ? 'success' : 'default'}
              />
            </Box>
            <Switch
              checked={formData.is_active}
              onChange={(e) => handleChange('is_active', e.target.checked)}
              color="success"
              sx={{ transform: 'scale(1.3)' }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: theme.palette.background.default }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="secondary"
          disabled={isLoading}
          sx={{
            textTransform: 'none',
            minWidth: 100,
          }}
        >
          {isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : isEditing ? (
            'Update'
          ) : (
            'Create'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductDialog;
