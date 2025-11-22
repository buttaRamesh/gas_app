import React from 'react';
import { Box, Alert, Button, Typography, Paper } from '@mui/material';
import {
  Refresh as RefreshIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

export interface ErrorStateProps {
  /** Error message to display */
  message: string;
  /** Variant of error display */
  variant?: 'alert' | 'paper' | 'minimal';
  /** Severity level */
  severity?: 'error' | 'warning' | 'info';
  /** Retry button callback */
  onRetry?: () => void;
  /** Retry button text */
  retryText?: string;
  /** Title for the error (used in paper variant) */
  title?: string;
  /** Custom icon */
  icon?: React.ReactNode;
  /** Custom action buttons */
  actions?: React.ReactNode;
  /** Custom styles */
  sx?: object;
}

/**
 * Standardized error state component
 *
 * @example
 * ```tsx
 * // Simple alert with retry
 * <ErrorState
 *   message="Failed to load data"
 *   onRetry={loadData}
 * />
 *
 * // Paper variant with title
 * <ErrorState
 *   variant="paper"
 *   title="Unable to Connect"
 *   message="Please check your internet connection"
 *   onRetry={handleRetry}
 * />
 *
 * // Warning with custom action
 * <ErrorState
 *   severity="warning"
 *   message="Some data is outdated"
 *   actions={
 *     <Button onClick={refresh}>Update Now</Button>
 *   }
 * />
 *
 * // Minimal inline error
 * <ErrorState
 *   variant="minimal"
 *   message="Invalid input"
 * />
 * ```
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  variant = 'alert',
  severity = 'error',
  onRetry,
  retryText = 'Retry',
  title,
  icon,
  actions,
  sx = {},
}) => {
  // Default icons based on severity
  const defaultIcon = icon || (
    severity === 'error' ? <ErrorIcon sx={{ fontSize: 48 }} /> :
    severity === 'warning' ? <WarningIcon sx={{ fontSize: 48 }} /> :
    <ErrorIcon sx={{ fontSize: 48 }} />
  );

  // Retry button
  const retryButton = onRetry && (
    <Button
      color="inherit"
      size="small"
      onClick={onRetry}
      startIcon={<RefreshIcon />}
    >
      {retryText}
    </Button>
  );

  // Minimal variant - just text with icon
  if (variant === 'minimal') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: severity === 'error' ? 'error.main' :
                 severity === 'warning' ? 'warning.main' :
                 'info.main',
          ...sx,
        }}
      >
        {icon && <Box sx={{ display: 'flex' }}>{icon}</Box>}
        <Typography variant="body2" color="inherit">
          {message}
        </Typography>
        {retryButton}
      </Box>
    );
  }

  // Paper variant - card-like error display
  if (variant === 'paper') {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          textAlign: 'center',
          border: '1px solid',
          borderColor: severity === 'error' ? 'error.light' :
                      severity === 'warning' ? 'warning.light' :
                      'info.light',
          bgcolor: severity === 'error' ? 'error.lighter' :
                  severity === 'warning' ? 'warning.lighter' :
                  'info.lighter',
          borderRadius: 2,
          ...sx,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              color: severity === 'error' ? 'error.main' :
                     severity === 'warning' ? 'warning.main' :
                     'info.main',
              opacity: 0.7,
            }}
          >
            {defaultIcon}
          </Box>

          {title && (
            <Typography
              variant="h6"
              color={severity === 'error' ? 'error.main' :
                     severity === 'warning' ? 'warning.main' :
                     'info.main'}
              fontWeight={600}
            >
              {title}
            </Typography>
          )}

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 500 }}
          >
            {message}
          </Typography>

          {(actions || retryButton) && (
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              {actions || retryButton}
            </Box>
          )}
        </Box>
      </Paper>
    );
  }

  // Alert variant (default) - MUI Alert component
  return (
    <Alert
      severity={severity}
      sx={sx}
      action={actions || retryButton}
    >
      {title && (
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          {title}
        </Typography>
      )}
      {message}
    </Alert>
  );
};
