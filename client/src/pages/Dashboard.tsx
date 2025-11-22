import { useNavigate } from "react-router-dom";
import { Container, Box, Typography, Card, CardContent, CardActionArea } from '@mui/material';
import {
  LocalShipping as RoutesIcon,
  People as ConsumersIcon,
  Person as DeliveryPersonIcon,
  Inventory as ProductsIcon,
  Place as AreasIcon,
  Analytics as StatsIcon,
  Receipt as LogsIcon,
  ManageAccounts as UsersIcon,
  Book as OrderBookIcon,
  Shield as RolesIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';
import { AppToolbar } from '@/components/AppToolbar';
import { colors } from '@/theme';

const dashboardCards = [
  {
    title: 'Routes',
    description: 'Manage delivery routes and assignments',
    icon: RoutesIcon,
    path: '/routes',
    colorVar: 'var(--primary)',
    requiredPermission: 'routes.view',
  },
  {
    title: 'Route Areas',
    description: 'Configure and manage route areas',
    icon: AreasIcon,
    path: '/route-areas',
    colorVar: 'var(--primary-light)',
    requiredPermission: 'route_areas.view',
  },
  {
    title: 'Consumers',
    description: 'Manage consumer information',
    icon: ConsumersIcon,
    path: '/consumers',
    colorVar: 'var(--primary-dark)',
    requiredPermission: 'consumers.view',
  },
  {
    title: 'Delivery Persons',
    description: 'Manage delivery personnel',
    icon: DeliveryPersonIcon,
    path: '/delivery-persons',
    colorVar: 'var(--primary)',
    requiredPermission: 'delivery_persons.view',
  },
  {
    title: 'Order Book',
    description: 'Track pending deliveries and upload orders',
    icon: OrderBookIcon,
    path: '/orderbook',
    colorVar: 'var(--accent)',
    requiredPermission: 'order_books.view',
  },
  {
    title: 'Products',
    description: 'Manage product inventory',
    icon: ProductsIcon,
    path: '/products',
    colorVar: 'var(--secondary)',
    requiredPermission: 'products.view',
  },
  {
    title: 'Statistics',
    description: 'View analytics and reports',
    icon: StatsIcon,
    path: '/routes/statistics',
    colorVar: 'var(--accent)',
    requiredPermission: 'statistics.view',
  },
  {
    title: 'Request Logs',
    description: 'View API request logs and errors',
    icon: LogsIcon,
    path: '/logs/requests',
    colorVar: 'var(--secondary)',
    requiredPermission: 'logs.view',
  },
  {
    title: 'User Management',
    description: 'Manage system users',
    icon: UsersIcon,
    path: '/users',
    colorVar: 'var(--primary)',
    requiredPermission: 'users.view',
  },
  {
    title: 'Role Management',
    description: 'Manage roles and permissions',
    icon: RolesIcon,
    path: '/roles',
    colorVar: 'var(--accent)',
    requiredPermission: 'roles.view',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();

  // Filter dashboard cards based on user permissions
  const visibleCards = useMemo(() => {
    if (!user) return [];

    return dashboardCards.filter(card => {
      if (!card.requiredPermission) return true;
      const [resource, action] = card.requiredPermission.split('.');
      return hasPermission(resource, action);
    });
  }, [user, hasPermission]);

  return (
    <>
      <AppToolbar />
      <Box sx={{ minHeight: '100vh', bgcolor: colors.dashboard.background.light, py: 4, pt: 12 }}>
        <Container maxWidth="lg">
        {/* Welcome Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              background: `linear-gradient(135deg, ${colors.dashboard.brown.dark} 0%, ${colors.dashboard.brown.main} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            Welcome back, {user?.full_name}
          </Typography>
          <Typography variant="body1" sx={{ color: colors.dashboard.text.muted }}>
            Quick access to your dashboard modules
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 3,
          }}
        >
          {visibleCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <Box key={card.title}>
                <Card
                  sx={{
                    background: colors.cardGradients.gold.background,
                    border: `2px solid ${colors.cardGradients.gold.border}`,
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '180px', // Reduced height
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 32px rgba(251,191,36,0.4)',
                      border: `2px solid ${colors.cardGradients.gold.borderHover}`,
                      '& .card-icon-bg': {
                        transform: 'scale(1.1)',
                        background: `linear-gradient(135deg, ${colors.dashboard.brown.light} 0%, ${colors.dashboard.brown.lighter} 100%)`,
                      },
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => navigate(card.path)}
                    sx={{ p: 3, height: '100%' }}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 0 }}>
                      <Box
                        className="card-icon-bg"
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, rgba(251,191,36,0.3) 0%, rgba(245,158,11,0.2) 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 12px',
                          border: `3px solid ${colors.dashboard.brown.light}`,
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 12px rgba(251,191,36,0.2)',
                        }}
                      >
                        <IconComponent
                          sx={{
                            fontSize: 32,
                            color: colors.dashboard.brown.main,
                          }}
                        />
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          background: `linear-gradient(135deg, ${colors.dashboard.brown.dark} 0%, ${colors.dashboard.brown.main} 100%)`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          mb: 0.5,
                          fontSize: '1.1rem',
                        }}
                      >
                        {card.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: colors.dashboard.text.muted,
                          fontWeight: 500,
                          fontSize: '0.85rem',
                        }}
                      >
                        {card.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Box>
            );
          })}
        </Box>
      </Container>
    </Box>
    </>
  );
}
