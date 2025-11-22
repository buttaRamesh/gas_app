import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  CloudOff as ServerOffIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface ServerErrorInfo {
  type: 'backend_down' | 'server_error';
  message: string;
  status?: number;
  timestamp: string;
}

const ServerError = () => {
  const navigate = useNavigate();
  const [errorInfo, setErrorInfo] = useState<ServerErrorInfo | null>(null);
  const [checking, setChecking] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('offline');

  useEffect(() => {
    // Load error info from session storage
    const storedError = sessionStorage.getItem('server_error');
    if (storedError) {
      try {
        setErrorInfo(JSON.parse(storedError));
      } catch (e) {
        console.error('Failed to parse error info:', e);
      }
    }
  }, []);

  const checkServerStatus = async () => {
    setChecking(true);
    setServerStatus('checking');

    try {
      // Try to ping the backend health endpoint
      await axios.get('http://127.0.0.1:8000/api/health/', {
        timeout: 5000,
      });

      // Server is back online
      setServerStatus('online');
      sessionStorage.removeItem('server_error');

      // Redirect to home after a brief delay
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      // Server still offline
      setServerStatus('offline');
    } finally {
      setChecking(false);
    }
  };

  const handleGoHome = () => {
    sessionStorage.removeItem('server_error');
    navigate('/');
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ mb: 4 }}>
          <ServerOffIcon sx={{ fontSize: 100, opacity: 0.9 }} />
        </Box>

        <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
          {errorInfo?.type === 'backend_down' ? 'Server Offline' : 'Server Error'}
        </Typography>

        <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
          {errorInfo?.message || 'Unable to connect to the server'}
        </Typography>

        {serverStatus === 'checking' && (
          <Alert severity="info" sx={{ mb: 3, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={20} />
              <Typography>Checking server status...</Typography>
            </Box>
          </Alert>
        )}

        {serverStatus === 'online' && (
          <Alert severity="success" sx={{ mb: 3, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
            <Typography>Server is back online! Redirecting...</Typography>
          </Alert>
        )}

        {serverStatus === 'offline' && !checking && (
          <Alert severity="error" sx={{ mb: 3, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
            <Typography>Server is still offline. Please try again later.</Typography>
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={checkServerStatus}
            disabled={checking}
            startIcon={checking ? <CircularProgress size={20} /> : <RefreshIcon />}
            sx={{
              backgroundColor: 'white',
              color: '#667eea',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              },
              '&:disabled': {
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
              },
            }}
          >
            {checking ? 'Checking...' : 'Check Server Status'}
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={handleGoHome}
            startIcon={<HomeIcon />}
            sx={{
              borderColor: 'white',
              color: 'white',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Go to Home
          </Button>
        </Box>

        {errorInfo?.timestamp && (
          <Typography variant="caption" sx={{ display: 'block', mt: 4, opacity: 0.7 }}>
            Error occurred at: {new Date(errorInfo.timestamp).toLocaleString()}
          </Typography>
        )}
      </Paper>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Troubleshooting Tips:</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          1. Check if the backend server is running on http://127.0.0.1:8000
        </Typography>
        <Typography variant="body2" color="text.secondary">
          2. Verify your network connection
        </Typography>
        <Typography variant="body2" color="text.secondary">
          3. Contact your system administrator if the problem persists
        </Typography>
      </Box>
    </Container>
  );
};

export default ServerError;
