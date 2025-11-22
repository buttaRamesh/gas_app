import React from 'react';
import { Box, CircularProgress, Typography, LinearProgress } from '@mui/material';

export interface LoadingStateProps {
  /** Loading message to display (optional) */
  message?: string;
  /** Variant of the loading indicator */
  variant?: 'circular' | 'linear' | 'minimal';
  /** Size of circular progress */
  size?: number;
  /** Whether to show fullscreen loading (centers in viewport) */
  fullscreen?: boolean;
  /** Custom height for the loading container */
  height?: string | number;
  /** Custom styles */
  sx?: object;
}

/**
 * Standardized loading state component
 *
 * @example
 * ```tsx
 * // Circular spinner with message
 * <LoadingState message="Loading data..." />
 *
 * // Linear progress bar
 * <LoadingState variant="linear" message="Processing..." />
 *
 * // Minimal spinner (no message)
 * <LoadingState variant="minimal" />
 *
 * // Fullscreen loading
 * <LoadingState fullscreen message="Initializing application..." />
 * ```
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message,
  variant = 'circular',
  size = 40,
  fullscreen = false,
  height,
  sx = {},
}) => {
  // Linear variant - just shows progress bar
  if (variant === 'linear') {
    return (
      <Box sx={{ width: '100%', ...sx }}>
        <LinearProgress />
        {message && (
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mt: 2 }}
          >
            {message}
          </Typography>
        )}
      </Box>
    );
  }

  // Minimal variant - small centered spinner
  if (variant === 'minimal') {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 2,
          ...sx,
        }}
      >
        <CircularProgress size={size} />
      </Box>
    );
  }

  // Circular variant (default) - centered with optional message
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        py: fullscreen ? 0 : 8,
        px: 2,
        minHeight: fullscreen ? '100vh' : height || 'auto',
        ...sx,
      }}
    >
      <CircularProgress size={size} />
      {message && (
        <Typography
          variant="body1"
          color="text.secondary"
          align="center"
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};
