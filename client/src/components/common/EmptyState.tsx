import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import {
  Inbox as InboxIcon,
  Add as AddIcon,
} from '@mui/icons-material';

export interface EmptyStateProps {
  /** Icon to display */
  icon?: React.ReactNode;
  /** Title/heading for the empty state */
  title?: string;
  /** Description message */
  message: string;
  /** Variant of display */
  variant?: 'default' | 'paper' | 'minimal';
  /** Primary action button */
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: 'contained' | 'outlined' | 'text';
  };
  /** Secondary action button */
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  /** Custom styles */
  sx?: object;
}

/**
 * Standardized empty state component
 *
 * @example
 * ```tsx
 * // Default empty state
 * <EmptyState
 *   message="No consumers found"
 *   action={{
 *     label: 'Add Consumer',
 *     onClick: handleAddConsumer,
 *   }}
 * />
 *
 * // With custom icon and title
 * <EmptyState
 *   icon={<PeopleIcon sx={{ fontSize: 64 }} />}
 *   title="No Users Yet"
 *   message="Get started by creating your first user"
 *   action={{
 *     label: 'Create User',
 *     onClick: handleCreate,
 *     icon: <AddIcon />,
 *   }}
 * />
 *
 * // Paper variant
 * <EmptyState
 *   variant="paper"
 *   title="Empty List"
 *   message="No items to display"
 * />
 *
 * // Minimal variant
 * <EmptyState
 *   variant="minimal"
 *   message="No results found"
 * />
 * ```
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  variant = 'default',
  action,
  secondaryAction,
  sx = {},
}) => {
  // Default icon if none provided
  const displayIcon = icon || <InboxIcon sx={{ fontSize: 64, opacity: 0.5 }} />;

  // Minimal variant - compact display
  if (variant === 'minimal') {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 4,
          px: 2,
          ...sx,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
        {action && (
          <Button
            size="small"
            variant={action.variant || 'text'}
            onClick={action.onClick}
            startIcon={action.icon}
            sx={{ mt: 1 }}
          >
            {action.label}
          </Button>
        )}
      </Box>
    );
  }

  // Paper variant - card-like display
  if (variant === 'paper') {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 6,
          textAlign: 'center',
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.default',
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
          <Box sx={{ color: 'text.secondary' }}>
            {displayIcon}
          </Box>

          {title && (
            <Typography variant="h6" fontWeight={600} color="text.primary">
              {title}
            </Typography>
          )}

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 400 }}
          >
            {message}
          </Typography>

          {(action || secondaryAction) && (
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              {action && (
                <Button
                  variant={action.variant || 'contained'}
                  onClick={action.onClick}
                  startIcon={action.icon || <AddIcon />}
                >
                  {action.label}
                </Button>
              )}
              {secondaryAction && (
                <Button
                  variant="outlined"
                  onClick={secondaryAction.onClick}
                  startIcon={secondaryAction.icon}
                >
                  {secondaryAction.label}
                </Button>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    );
  }

  // Default variant - centered display with dashed border
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: 8,
        px: 3,
        border: '2px dashed',
        borderColor: 'divider',
        borderRadius: 2,
        textAlign: 'center',
        ...sx,
      }}
    >
      <Box sx={{ color: 'text.secondary' }}>
        {displayIcon}
      </Box>

      {title && (
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
      )}

      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
        {message}
      </Typography>

      {(action || secondaryAction) && (
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          {action && (
            <Button
              variant={action.variant || 'contained'}
              onClick={action.onClick}
              startIcon={action.icon || <AddIcon />}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outlined"
              onClick={secondaryAction.onClick}
              startIcon={secondaryAction.icon}
            >
              {secondaryAction.label}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};
