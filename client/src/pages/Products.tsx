import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Skeleton,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Visibility,
  Delete,
  Assessment,
  Edit,
  Refresh,
} from '@mui/icons-material';
import { PageHeader } from '../components/PageHeader';
import { productsApi } from '../services/api';
import { Product } from '../types/products';
import { useSnackbar } from '../contexts/SnackbarContext';

export default function Products() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productsApi.getAll(searchQuery);
      setProducts(response.data.results || response.data);
    } catch (err: any) {
      console.error('Failed to fetch products:', err);
      const errorMessage = err.response?.data?.detail || 'Failed to load products';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      await productsApi.delete(selectedProduct.id);
      showSnackbar('Product deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (err: any) {
      console.error('Failed to delete product:', err);
      showSnackbar(err.response?.data?.detail || 'Failed to delete product', 'error');
    }
  };

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const LoadingSkeleton = () => (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <TableRow key={i}>
          <TableCell><Skeleton variant="text" width={40} /></TableCell>
          <TableCell><Skeleton variant="text" width={200} /></TableCell>
          <TableCell><Skeleton variant="text" width={300} /></TableCell>
          <TableCell><Skeleton variant="rectangular" width={100} height={24} /></TableCell>
          <TableCell align="right">
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="circular" width={32} height={32} />
            </Box>
          </TableCell>
        </TableRow>
      ))}
    </>
  );

  return (
    <Box sx={{ bgcolor: 'hsl(var(--background))', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <PageHeader
          title="Products"
          description="Manage your product catalog"
          showSearch
          searchValue={searchQuery}
          searchPlaceholder="Search products..."
          onSearchChange={(e: any) => setSearchQuery(e.target.value)}
          actions={
            <>
              <Tooltip title="Refresh">
                <IconButton
                  onClick={fetchProducts}
                  disabled={loading}
                  sx={{ mr: 1 }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Button
                variant="outlined"
                startIcon={<Assessment />}
                onClick={() => navigate('/products/statistics')}
                sx={{ mr: 2 }}
              >
                Statistics
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/products/create')}
              >
                Add Product
              </Button>
            </>
          }
        />

        {error && !loading && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={fetchProducts}>
                Retry
              </Button>
            }
          >
            {error}
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
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Variants</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <LoadingSkeleton />
                  ) : products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          <Typography variant="h6" color="text.secondary">
                            {searchQuery ? 'No products found' : 'No products yet'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {searchQuery
                              ? 'Try adjusting your search terms'
                              : 'Get started by creating your first product'}
                          </Typography>
                          {!searchQuery && (
                            <Button
                              variant="contained"
                              startIcon={<Add />}
                              onClick={() => navigate('/products/create')}
                              sx={{ mt: 2 }}
                            >
                              Create Product
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow
                        key={product.id}
                        hover
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                        }}
                        onClick={() => navigate(`/products/${product.id}`)}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                            #{product.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {product.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: 400,
                            }}
                          >
                            {product.description || 'No description'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${product.variants_count || 0} variant${product.variants_count !== 1 ? 's' : ''}`}
                            size="small"
                            color={product.variants_count ? 'primary' : 'default'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/products/${product.id}`);
                                }}
                                sx={{
                                  color: 'primary.main',
                                  '&:hover': { bgcolor: 'primary.light', color: 'primary.dark' },
                                }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Product">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/products/${product.id}`);
                                }}
                                sx={{
                                  color: 'info.main',
                                  '&:hover': { bgcolor: 'info.light', color: 'info.dark' },
                                }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Product">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDeleteDialog(product);
                                }}
                                sx={{
                                  color: 'error.main',
                                  '&:hover': { bgcolor: 'error.light', color: 'error.dark' },
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {!loading && products.length > 0 && (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {products.length} product{products.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Delete Product
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone!
          </Alert>
          <Typography>
            Are you sure you want to delete <strong>"{selectedProduct?.name}"</strong>?
          </Typography>
          {selectedProduct && selectedProduct.variants_count && selectedProduct.variants_count > 0 && (
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              Warning: This product has {selectedProduct.variants_count} variant{selectedProduct.variants_count !== 1 ? 's' : ''} that may be affected.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete Product
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
