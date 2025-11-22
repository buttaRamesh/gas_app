import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Typography, Paper, Container } from '@mui/material';
import {
  BugReport as BugIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
} from '@mui/icons-material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorType: 'chunk' | 'component' | 'unknown';
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorType: 'unknown',
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    // Detect chunk loading errors (frontend server down)
    const isChunkError =
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Importing a module script failed') ||
      error.message.includes('Loading chunk') ||
      error.message.includes('ChunkLoadError');

    return {
      hasError: true,
      error,
      errorType: isChunkError ? 'chunk' : 'component',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Store error in sessionStorage for potential debugging
    try {
      sessionStorage.setItem('last_error', JSON.stringify({
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      }));
    } catch (e) {
      console.error('Failed to store error:', e);
    }
  }

  private handleReload = () => {
    // Clear error state and reload the page
    sessionStorage.removeItem('last_error');
    window.location.reload();
  };

  private handleGoHome = () => {
    // Clear error and navigate to home
    sessionStorage.removeItem('last_error');
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      const { error, errorType } = this.state;

      // Frontend server down - chunk loading failed
      if (errorType === 'chunk') {
        return (
          <Container maxWidth="md" sx={{ py: 8 }}>
            <Paper
              elevation={3}
              sx={{
                p: 6,
                textAlign: 'center',
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
              }}
            >
              <Box sx={{ mb: 4 }}>
                <BugIcon sx={{ fontSize: 100, opacity: 0.9 }} />
              </Box>

              <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
                Frontend Server Offline
              </Typography>

              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                The application couldn't load the required resources.
                <br />
                The frontend development server may be down.
              </Typography>

              <Paper
                sx={{
                  p: 3,
                  mb: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: '#333',
                }}
              >
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 2 }}>
                  <strong>Error:</strong> {error?.message}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please ensure the frontend development server is running.
                </Typography>
              </Paper>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={this.handleReload}
                  startIcon={<RefreshIcon />}
                  sx={{
                    backgroundColor: 'white',
                    color: '#f5576c',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    },
                  }}
                >
                  Reload Page
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={this.handleGoHome}
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

              <Box sx={{ mt: 4, opacity: 0.8 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Troubleshooting Steps:
                </Typography>
                <Typography variant="body2">
                  1. Check if the frontend server is running (npm run dev)
                </Typography>
                <Typography variant="body2">
                  2. Verify the server is running on the correct port
                </Typography>
                <Typography variant="body2">
                  3. Check your network connection
                </Typography>
                <Typography variant="body2">
                  4. Clear your browser cache and reload
                </Typography>
              </Box>
            </Paper>
          </Container>
        );
      }

      // Regular component error
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
              <BugIcon sx={{ fontSize: 100, opacity: 0.9 }} />
            </Box>

            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
              Something Went Wrong
            </Typography>

            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              The application encountered an unexpected error.
            </Typography>

            <Paper
              sx={{
                p: 3,
                mb: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: '#333',
                textAlign: 'left',
              }}
            >
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                <strong>Error:</strong> {error?.message}
              </Typography>
              {this.state.errorInfo && (
                <Box sx={{ mt: 2, maxHeight: '200px', overflow: 'auto' }}>
                  <Typography
                    variant="caption"
                    component="pre"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {this.state.errorInfo.componentStack}
                  </Typography>
                </Box>
              )}
            </Paper>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={this.handleReload}
                startIcon={<RefreshIcon />}
                sx={{
                  backgroundColor: 'white',
                  color: '#667eea',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  },
                }}
              >
                Reload Page
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={this.handleGoHome}
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
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
