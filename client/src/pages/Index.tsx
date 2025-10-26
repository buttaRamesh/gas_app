import { useNavigate } from "react-router-dom";
import { Container, Box, Typography, Button } from '@mui/material';
import { 
  LocalShipping as RoutesIcon,
  Settings as SettingsIcon,
  ViewModule as DemoIcon,
} from '@mui/icons-material';

export default function Index() {
  const navigate = useNavigate();

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: 'grey.100',
    }}>
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              color: 'text.primary',
            }}
          >
            UKB Gas Agency Portal
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ mb: 6 }}
          >
            Gas Cylinder Management System
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<RoutesIcon />}
              onClick={() => navigate('/routes')}
              sx={{ 
                px: 4,
                py: 1.5,
                bgcolor: 'primary.main',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              Routes Management
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<SettingsIcon />}
              onClick={() => navigate('/settings')}
              sx={{ px: 4, py: 1.5 }}
            >
              Settings
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<DemoIcon />}
              onClick={() => navigate('/demo')}
              sx={{ px: 4, py: 1.5 }}
            >
              View Layout Demo
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
