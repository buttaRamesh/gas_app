/**
 * DataGridSlots - Custom slot components for MUI DataGrid
 *
 * Provides NoRowsOverlay and LoadingOverlay components
 */
import React from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

interface NoRowsOverlayProps {
  hasQuickFilter: boolean;
}

/**
 * Empty state overlay shown when no data is available
 */
export function NoRowsOverlay({ hasQuickFilter }: NoRowsOverlayProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 2,
        py: 8,
      }}
    >
      <InboxIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
      <Typography variant="h6" color="text.secondary">
        No data found
      </Typography>
      <Typography variant="body2" color="text.disabled">
        {hasQuickFilter
          ? 'Try adjusting your search or filters'
          : 'No records to display'}
      </Typography>
    </Box>
  );
}

/**
 * Loading overlay shown while data is being fetched
 */
export function LoadingOverlay() {
  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'hidden' }}>
      {[...Array(8)].map((_, index) => (
        <Skeleton
          key={index}
          variant="rectangular"
          height={42}
          sx={{ mb: 1, borderRadius: 1 }}
          animation="wave"
        />
      ))}
    </Box>
  );
}
