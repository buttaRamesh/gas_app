import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
} from '@mui/material';
import { ArrowBack, Category, Inventory } from '@mui/icons-material';
import { PageHeader } from '../components/PageHeader';
import { productsApi, variantsApi } from '../services/api';
import { ProductStatistics as IProductStatistics, VariantStatistics } from '../types/products';
import { useSnackbar } from '../contexts/SnackbarContext';

export default function ProductStatistics() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [productStats, setProductStats] = useState<IProductStatistics | null>(null);
  const [variantStats, setVariantStats] = useState<VariantStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const [productRes, variantRes] = await Promise.all([
        productsApi.getStatistics(),
        variantsApi.getStatistics(),
      ]);
      setProductStats(productRes.data);
      setVariantStats(variantRes.data);
    } catch (err: any) {
      console.error('Failed to fetch statistics:', err);
      showSnackbar('Failed to load statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: 'hsl(var(--background))', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <PageHeader
          title="Product Statistics"
          description="Overview of products and variants"
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

        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Product Overview */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Card
                elevation={3}
                sx={{
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, hsl(var(--primary)/.1) 0%, hsl(var(--primary)/.05) 100%)',
                  border: '1px solid hsl(var(--primary)/.2)',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Category sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 600 }}>
                        {productStats?.total_products || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Products
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              
              <Card
                elevation={3}
                sx={{
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, hsl(var(--success)/.1) 0%, hsl(var(--success)/.05) 100%)',
                  border: '1px solid hsl(var(--success)/.2)',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Inventory sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 600 }}>
                        {variantStats?.total_variants || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Variants
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Variants by Type */}
            <Box>
              <Card
                elevation={3}
                sx={{
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card)/.95) 100%)',
                  border: '1px solid hsl(var(--border))',
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Variants by Type
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                    {variantStats?.by_type && Object.entries(variantStats.by_type).map(([type, count]) => (
                      <Box key={type}>
                        <Box
                          sx={{
                            p: 2,
                            border: '1px solid hsl(var(--border))',
                            borderRadius: 2,
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            {count}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {type}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Variants by Product */}
            <Box>
              <Card
                elevation={3}
                sx={{
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card)/.95) 100%)',
                  border: '1px solid hsl(var(--border))',
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Variants by Product
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                    {variantStats?.by_product?.map((item) => (
                      <Box key={item.product_id}>
                        <Box
                          sx={{
                            p: 2,
                            border: '1px solid hsl(var(--border))',
                            borderRadius: 2,
                          }}
                        >
                          <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            {item.variant_count}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.product_name}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}
