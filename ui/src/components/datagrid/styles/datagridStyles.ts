/**
 * datagridStyles - Centralized styling for DataGrid component
 *
 * Provides consistent theming across all DataGrid instances
 */
import type { Theme } from '@mui/material';
import type { SxProps } from '@mui/system';

/**
 * Professional DataGrid styles with blue theme and zebra striping
 */
export const datagridStyles: SxProps<Theme> = (theme) => ({
  width: '100%',
  height: '100%',

  // Column header styling
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: '#f8f9fa',
    borderBottom: `3px solid ${theme.palette.secondary.main}`,
    fontWeight: 600,
    fontSize: '0.875rem',
    color: theme.palette.text.primary,

    '& .MuiDataGrid-columnHeader': {
      '&:focus, &:focus-within': {
        outline: 'none',
      },
    },

    '& .MuiDataGrid-columnHeaderTitle': {
      fontWeight: 700,
      color: theme.palette.primary.main,
    },
  },

  // Row styling with zebra striping
  '& .MuiDataGrid-row': {
    animation: 'fadeIn 150ms ease-in',
    '&:nth-of-type(odd)': {
      backgroundColor: '#ffffff',
    },
    '&:nth-of-type(even)': {
      backgroundColor: '#f8fafc',
    },
    '&:hover': {
      backgroundColor: '#e3f2fd !important',
      cursor: 'pointer',
    },
  },

  '@keyframes fadeIn': {
    from: {
      opacity: 0,
      transform: 'translateY(-3px)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },

  '& .MuiDataGrid-virtualScroller': {
    overflow: 'auto !important',
    transition: 'opacity 100ms ease-in-out',
  },

  '& .MuiDataGrid-virtualScrollerContent': {
    transition: 'opacity 100ms ease-in-out',
  },

  '& .MuiDataGrid-cell': {
    fontWeight: 450,
    lineHeight: 1.5,
    display: 'flex',
    alignItems: 'center',

    '& *': {
      fontWeight: 'inherit',
    },
  },

  '& .monospace-cell': {
    fontFamily: "'Roboto Mono', 'JetBrains Mono', 'Courier New', monospace",
    fontWeight: 550,
    letterSpacing: '0.01em',
  },

  // Footer styling
  '& .MuiDataGrid-footerContainer': {
    backgroundColor: '#f8f9fa',
    borderTop: `2px solid ${theme.palette.primary.main}`,
    padding: '12px 16px',
    minHeight: '56px',
  },

  '& .MuiTablePagination-displayedRows': {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: theme.palette.text.secondary,
  },

  '& .MuiTablePagination-selectLabel': {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: theme.palette.text.secondary,
  },

  '& .MuiTablePagination-select': {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: theme.palette.primary.main,
    borderRadius: '6px',
    padding: '4px 8px',
    '&:hover': {
      backgroundColor: '#e3f2fd',
    },
  },

  '& .MuiDataGrid-footerContainer .MuiIconButton-root': {
    color: theme.palette.primary.main,
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#e3f2fd',
      transform: 'scale(1.1)',
    },
    '&.Mui-disabled': {
      color: theme.palette.action.disabled,
    },
  },
});
