import React, { ReactNode } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  DialogProps,
} from '@mui/material';
import { gradients, shadows } from '@/theme';

export interface FormDialogProps {
  /** Controls dialog visibility */
  open: boolean;
  /** Handler for closing the dialog */
  onClose: () => void;
  /** Dialog title text */
  title: string;
  /** Handler for form submission */
  onSubmit: () => Promise<void> | void;
  /** Loading state during submission */
  loading?: boolean;
  /** Maximum width of dialog */
  maxWidth?: DialogProps['maxWidth'];
  /** Text for submit button */
  submitLabel?: string;
  /** Text for cancel button */
  cancelLabel?: string;
  /** Form content */
  children: ReactNode;
  /** Whether to show gradient header */
  showGradientHeader?: boolean;
  /** Whether submit button should be disabled */
  disableSubmit?: boolean;
  /** Full width dialog */
  fullWidth?: boolean;
}

/**
 * Reusable form dialog component with consistent styling
 * Used across all edit/create dialogs in the application
 */
export const FormDialog: React.FC<FormDialogProps> = ({
  open,
  onClose,
  title,
  onSubmit,
  loading = false,
  maxWidth = 'sm',
  submitLabel = 'Save Changes',
  cancelLabel = 'Cancel',
  children,
  showGradientHeader = true,
  disableSubmit = false,
  fullWidth = true,
}) => {
  const handleSubmit = async () => {
    await onSubmit();
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: showGradientHeader ? shadows.dialog : undefined,
        },
      }}
    >
      <DialogTitle
        sx={
          showGradientHeader
            ? {
                background: gradients.primary,
                color: 'white',
                fontWeight: 700,
                fontSize: '1.5rem',
                py: 2.5,
              }
            : {
                fontWeight: 700,
                fontSize: '1.5rem',
                py: 2.5,
              }
        }
      >
        {title}
      </DialogTitle>

      <DialogContent
        sx={{
          pt: 5,
          pb: 3,
          px: 3,
          py:3,
        }}
      >
        {children}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          {cancelLabel}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || disableSubmit}
          sx={{
            background: gradients.primary,
            color: 'white',
            fontWeight: 600,
            px: 3,
            py: 1,
            boxShadow: shadows.primary,
            '&:hover': {
              background: gradients.primaryHover,
              boxShadow: shadows.primaryHover,
            },
            '&.Mui-disabled': {
              background: 'rgba(0, 0, 0, 0.12)',
              color: 'rgba(0, 0, 0, 0.26)',
            },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
