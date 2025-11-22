import React, { ReactNode } from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';

export interface StatCardProps {
  /** Icon to display */
  icon: ReactNode;
  /** Color theme for icon background */
  iconColor?: 'info' | 'success' | 'warning' | 'error' | 'primary' | 'secondary';
  /** Main value/number to display */
  value: number | string;
  /** Label/title for the stat */
  label: string;
  /** Optional description text */
  description?: string;
  /** Click handler for the card */
  onClick?: () => void;
  /** Whether card should show hover effect */
  hoverable?: boolean;
  /** Custom elevation */
  elevation?: number;
}

/**
 * Reusable statistic card component
 * Used for displaying metrics in RouteDetail, DeliveryPersonDetail, Routes, etc.
 */
export const StatCard: React.FC<StatCardProps> = ({
  icon,
  iconColor = 'info',
  value,
  label,
  description,
  onClick,
  hoverable = true,
  elevation = 3,
}) => {
  const isClickable = !!onClick;

  return (
    <Card
      elevation={elevation}
      onClick={onClick}
      sx={{
        bgcolor: 'background.paper',
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        ...(hoverable && {
          '&:hover': {
            transform: isClickable ? 'translateY(-4px)' : 'none',
            boxShadow: isClickable ? 6 : elevation,
          },
        }),
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: description ? 2 : 0,
          }}
        >
          <Box
            sx={{
              bgcolor: `${iconColor}.light`,
              p: 1.5,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
              }}
            >
              {value}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontWeight: 500,
              }}
            >
              {label}
            </Typography>
          </Box>
        </Box>

        {description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
              lineHeight: 1.5,
            }}
          >
            {description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
