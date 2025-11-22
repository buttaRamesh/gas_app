import React, { ReactNode } from 'react';
import { Box, Typography, IconButton, Divider, Tooltip } from '@mui/material';
import { ContentCopy as CopyIcon } from '@mui/icons-material';

export interface DetailInfoRowProps {
  /** Label/title for the info row */
  label: string;
  /** Value to display */
  value: string | number | null | undefined;
  /** Optional icon to display before label */
  icon?: ReactNode;
  /** Whether value should be copyable to clipboard */
  copyable?: boolean;
  /** Whether to show divider after row */
  showDivider?: boolean;
  /** Display variant */
  variant?: 'default' | 'compact';
  /** Custom label width */
  labelWidth?: number | string;
}

/**
 * Reusable component for displaying label-value pairs in detail pages
 * Used in ConsumerDetail, RouteDetail, DeliveryPersonDetail, etc.
 */
export const DetailInfoRow: React.FC<DetailInfoRowProps> = ({
  label,
  value,
  icon,
  copyable = false,
  showDivider = false,
  variant = 'default',
  labelWidth = 160,
}) => {
  const displayValue = value ?? '-';
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (value) {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const padding = variant === 'compact' ? { py: 1 } : { py: 1.5 };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          ...padding,
          alignItems: 'center',
        }}
      >
        {icon && (
          <Box sx={{ mr: 1.5, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
            {icon}
          </Box>
        )}

        <Typography
          variant="body2"
          sx={{
            minWidth: labelWidth,
            fontWeight: 600,
            color: 'text.secondary',
          }}
        >
          {label}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: 'text.primary',
            fontWeight: 500,
            flex: 1,
          }}
        >
          {displayValue}
        </Typography>

        {copyable && value && (
          <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
            <IconButton
              size="small"
              onClick={handleCopy}
              sx={{
                ml: 1,
                color: copied ? 'success.main' : 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {showDivider && <Divider />}
    </>
  );
};
