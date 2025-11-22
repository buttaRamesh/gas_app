import { Box, Button, Typography, Paper } from '@mui/material';
import {
  ErrorOutline as ErrorIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface ErrorFallbackProps {
  error?: Error | null;
  message?: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
}

export const ErrorFallback = ({
  error,
  message = 'Failed to load data',
  onRetry,
  showHomeButton = true,
}: ErrorFallbackProps) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        p: 3,
      }}
    >
      <Paper
        elevation={2}
        sx={{
          p: 4,
          textAlign: 'center',
          maxWidth: '500px',
          borderRadius: 2,
          border: '1px solid #ffebee',
          backgroundColor: '#fafafa',
        }}
      >
        <ErrorIcon sx={{ fontSize: 64, color: '#f44336', mb: 2 }} />

        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
          Oops! Something went wrong
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {message}
        </Typography>

        {error && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 3,
              p: 2,
              backgroundColor: '#fff',
              borderRadius: 1,
              border: '1px solid #e0e0e0',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              textAlign: 'left',
              overflow: 'auto',
            }}
          >
            {error.message}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          {onRetry && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
            >
              Try Again
            </Button>
          )}

          {showHomeButton && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
            >
              Go Home
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

// Empty state component for when no data is available
interface EmptyStateProps {
  message?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState = ({
  message = 'No data available',
  icon,
  action,
}: EmptyStateProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '300px',
        p: 3,
      }}
    >
      {icon || <ErrorIcon sx={{ fontSize: 64, color: '#9e9e9e', mb: 2 }} />}

      <Typography variant="h6" color="text.secondary" gutterBottom>
        {message}
      </Typography>

      {action && (
        <Button
          variant="contained"
          color="primary"
          onClick={action.onClick}
          sx={{ mt: 2 }}
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
};
