import React from 'react';
import { Button, ButtonProps, CircularProgress } from '@mui/material';

export interface GradientButtonProps extends Omit<ButtonProps, 'variant'> {
  /** Button variant style */
  variant?: 'primary' | 'secondary' | 'outlined';
  /** Whether button is in loading state */
  loading?: boolean;
  /** Gradient color scheme */
  gradient?: 'purple-blue' | 'blue-teal' | 'red-orange';
}

/**
 * Reusable button with gradient styling
 * Used across all pages for primary actions
 */
export const GradientButton: React.FC<GradientButtonProps> = ({
  variant = 'primary',
  loading = false,
  gradient = 'purple-blue',
  children,
  disabled,
  ...props
}) => {
  const gradients = {
    'purple-blue': {
      background: 'linear-gradient(135deg, hsl(262 83% 58%), hsl(220 90% 62%))',
      hover: 'linear-gradient(135deg, hsl(262 90% 68%), hsl(220 95% 72%))',
    },
    'blue-teal': {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      hover: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
    },
    'red-orange': {
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      hover: 'linear-gradient(135deg, #e082ea 0%, #e4465b 100%)',
    },
  };

  const getStyles = () => {
    const baseStyles = {
      fontWeight: 600,
      px: 3,
      py: 1.2,
      textTransform: 'none' as const,
      borderRadius: 2,
    };

    if (variant === 'primary') {
      return {
        ...baseStyles,
        background: gradients[gradient].background,
        color: 'white',
        boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
        '&:hover': {
          background: gradients[gradient].hover,
          boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
        },
        '&.Mui-disabled': {
          background: 'rgba(0, 0, 0, 0.12)',
          color: 'rgba(0, 0, 0, 0.26)',
        },
      };
    }

    if (variant === 'secondary') {
      return {
        ...baseStyles,
        background: 'transparent',
        color: 'primary.main',
        border: '2px solid',
        borderColor: 'primary.main',
        '&:hover': {
          backgroundColor: 'rgba(102, 126, 234, 0.08)',
        },
      };
    }

    if (variant === 'outlined') {
      return {
        ...baseStyles,
        borderColor: '#667eea',
        color: '#667eea',
        '&:hover': {
          borderColor: '#5568d3',
          backgroundColor: 'rgba(102, 126, 234, 0.04)',
        },
      };
    }

    return baseStyles;
  };

  return (
    <Button
      {...props}
      disabled={disabled || loading}
      sx={getStyles()}
    >
      {loading ? <CircularProgress size={24} color="inherit" /> : children}
    </Button>
  );
};
