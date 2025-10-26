import { useNavigate } from "react-router-dom";
import { Container, Box, Typography, Card, CardContent, CardActionArea } from '@mui/material';
import {
  LocalShipping as RoutesIcon,
  People as ConsumersIcon,
  Person as DeliveryPersonIcon,
  Inventory as ProductsIcon,
  Place as AreasIcon,
  Analytics as StatsIcon,
} from '@mui/icons-material';

const dashboardCards = [
  {
    title: 'Routes',
    description: 'Manage delivery routes and assignments',
    icon: RoutesIcon,
    path: '/routes',
    colorVar: 'var(--primary)',
  },
  {
    title: 'Route Areas',
    description: 'Configure and manage route areas',
    icon: AreasIcon,
    path: '/route-areas',
    colorVar: 'var(--primary-light)',
  },
  {
    title: 'Consumers',
    description: 'Manage consumer information',
    icon: ConsumersIcon,
    path: '/consumers',
    colorVar: 'var(--primary-dark)',
  },
  {
    title: 'Delivery Persons',
    description: 'Manage delivery personnel',
    icon: DeliveryPersonIcon,
    path: '/delivery-persons',
    colorVar: 'var(--primary)',
  },
  {
    title: 'Products',
    description: 'Manage product inventory',
    icon: ProductsIcon,
    path: '/products',
    colorVar: 'var(--secondary)',
  },
  {
    title: 'Statistics',
    description: 'View analytics and reports',
    icon: StatsIcon,
    path: '/routes/statistics',
    colorVar: 'var(--accent)',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'hsl(var(--background))', py: 4 }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 3,
          }}
        >
          {dashboardCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <Box key={card.title}>
                <Card
                  sx={{
                    background: 'linear-gradient(145deg, hsl(var(--card)) 0%, hsla(var(--card-gradient-end), 0.05) 100%)',
                    border: '1px solid hsla(var(--primary), 0.2)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 24px hsla(var(--primary), 0.3)`,
                      border: '1px solid hsla(var(--primary), 0.4)',
                    },
                  }}
                >
                  <CardActionArea 
                    onClick={() => navigate(card.path)}
                    sx={{ p: 3 }}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 0 }}>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, hsl(${card.colorVar}) / 0.2, hsl(${card.colorVar}) / 0.05)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 16px',
                          border: `2px solid hsl(${card.colorVar})`,
                        }}
                      >
                        <IconComponent 
                          sx={{ 
                            fontSize: 32,
                            color: `hsl(${card.colorVar})`,
                          }} 
                        />
                      </Box>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600,
                          color: 'hsl(var(--primary))',
                          mb: 1,
                        }}
                      >
                        {card.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ color: 'hsl(var(--muted-foreground))' }}
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
  );
}
