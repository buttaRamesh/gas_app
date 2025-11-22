import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import {
  Block as BlockIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
} from '@mui/icons-material';

export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)',
          }}
        >
          <BlockIcon
            sx={{
              fontSize: 120,
              color: 'error.main',
              mb: 3,
              opacity: 0.8,
            }}
          />

          <Typography
            variant="h3"
            fontWeight={700}
            gutterBottom
            color="error.main"
          >
            Access Denied
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            You don't have permission to access this page
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            If you believe this is an error, please contact your system administrator
            to request the necessary permissions.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              size="large"
            >
              Go Back
            </Button>
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/dashboard')}
              size="large"
              sx={{
                bgcolor: 'primary.main',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              Go to Dashboard
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
