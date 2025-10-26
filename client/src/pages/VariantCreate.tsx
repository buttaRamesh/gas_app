import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { PageHeader } from '../components/PageHeader';
import { variantsApi, productsApi, unitsApi } from '../services/api';
import { Product, Unit, VariantType } from '../types/products';
import { useSnackbar } from '../contexts/SnackbarContext';

const VARIANT_TYPES: VariantType[] = ['DOMESTIC', 'COMMERCIAL', 'INDUSTRIAL', 'OTHER'];

export default function VariantCreate() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [formData, setFormData] = useState({
    product_code: '',
    name: '',
    product: '',
    unit: '',
    size: '',
    variant_type: 'DOMESTIC' as VariantType,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, unitsRes] = await Promise.all([
        productsApi.getAll(),
        unitsApi.getAll(),
      ]);
      setProducts(productsRes.data.results || productsRes.data);
      setUnits(unitsRes.data.results || unitsRes.data);
    } catch (error) {
      showSnackbar('Failed to load products and units', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: { [key: string]: string } = {};
    if (!formData.product_code.trim()) newErrors.product_code = 'Product code is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.product) newErrors.product = 'Product is required';
    if (!formData.unit) newErrors.unit = 'Unit is required';
    if (!formData.size) newErrors.size = 'Size is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await variantsApi.create({
        ...formData,
        product: Number(formData.product),
        unit: Number(formData.unit),
        size: Number(formData.size),
      });
      showSnackbar('Variant created successfully', 'success');
      navigate('/products');
    } catch (error) {
      showSnackbar('Failed to create variant', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Create Product Variant"
        description="Add a new variant to an existing product"
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/products')}
          >
            Back to Products
          </Button>
        }
      />

      <Box sx={{ maxWidth: '80%', mx: 'auto', mt: 4 }}>
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  label="Product Code"
                  placeholder="e.g., 5300"
                  value={formData.product_code}
                  onChange={(e) => {
                    setFormData({ ...formData, product_code: e.target.value });
                    setErrors({ ...errors, product_code: '' });
                  }}
                  error={!!errors.product_code}
                  helperText={errors.product_code}
                  required
                  fullWidth
                />

                <TextField
                  label="Name"
                  placeholder="Enter variant name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setErrors({ ...errors, name: '' });
                  }}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                  fullWidth
                />

                <TextField
                  select
                  label="Product"
                  value={formData.product}
                  onChange={(e) => {
                    setFormData({ ...formData, product: e.target.value });
                    setErrors({ ...errors, product: '' });
                  }}
                  error={!!errors.product}
                  helperText={errors.product}
                  required
                  fullWidth
                >
                  {products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Size"
                  type="number"
                  placeholder="e.g., 2.0"
                  value={formData.size}
                  onChange={(e) => {
                    setFormData({ ...formData, size: e.target.value });
                    setErrors({ ...errors, size: '' });
                  }}
                  error={!!errors.size}
                  helperText={errors.size}
                  required
                  fullWidth
                />

                <TextField
                  select
                  label="Unit"
                  value={formData.unit}
                  onChange={(e) => {
                    setFormData({ ...formData, unit: e.target.value });
                    setErrors({ ...errors, unit: '' });
                  }}
                  error={!!errors.unit}
                  helperText={errors.unit}
                  required
                  fullWidth
                >
                  {units.map((unit) => (
                    <MenuItem key={unit.id} value={unit.id}>
                      {unit.short_name} - {unit.description}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Variant Type"
                  value={formData.variant_type}
                  onChange={(e) => setFormData({ ...formData, variant_type: e.target.value as VariantType })}
                  required
                  fullWidth
                >
                  {VARIANT_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/products')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                  >
                    {loading ? 'Creating...' : 'Create Variant'}
                  </Button>
                </Box>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
