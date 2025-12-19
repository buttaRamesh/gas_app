import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Slide,
  FormControlLabel,
  Switch,
  IconButton,
  Typography,
  useTheme,
  Chip,
} from '@mui/material';
import { Edit, Save, Close } from '@mui/icons-material';
import { forwardRef } from 'react';
import type { TransitionProps } from '@mui/material/transitions';
import axiosInstance from '@/api/axiosInstance';

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface CategoryEditActionProps {
  categoryId: number;
  categoryData: {
    name: string;
    description: string;
    is_active: boolean;
  };
  onSuccess?: () => void;
}

const CategoryEditAction = ({ categoryId, categoryData, onSuccess }: CategoryEditActionProps) => {
  const theme = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    if (dialogOpen) {
      setFormData({
        name: categoryData.name || '',
        description: categoryData.description || '',
        is_active: categoryData.is_active ?? true,
      });
    }
  }, [dialogOpen, categoryData]);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (!loading) {
      setDialogOpen(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axiosInstance.patch(`/inventory/categories/${categoryId}/`, formData);

      setSnackbar({
        open: true,
        message: 'Category updated successfully',
        severity: 'success',
      });
      setDialogOpen(false);

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to update category. Please try again.';

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <IconButton
        size="small"
        color="primary"
        onClick={handleOpenDialog}
        disabled={loading}
        sx={{
          '&:hover': {
            backgroundColor: 'primary.light',
          },
        }}
      >
        <Edit fontSize="small" />
      </IconButton>

      <Dialog
        open={dialogOpen}
        onClose={loading ? undefined : handleCloseDialog}
        TransitionComponent={Transition}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: theme.palette.secondary.main,
            color: theme.palette.secondary.contrastText,
            py: 1.5,
            px: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Edit sx={{ fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight={600}>
              Edit Category
            </Typography>
          </Box>
          <IconButton
            onClick={handleCloseDialog}
            disabled={loading}
            sx={{ color: 'inherit', p: 0.5 }}
            size="small"
          >
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 ,py:2}}>
            <TextField
              label="Category Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              fullWidth
              required
              disabled={loading}
              size="small"
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              fullWidth
              multiline
              rows={3}
              disabled={loading}
              size="small"
              placeholder="Enter category description..."
            />

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                borderRadius: 1,
                bgcolor: theme.palette.background.default,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Status
                </Typography>
                <Chip
                  label={formData.is_active ? 'Active' : 'Inactive'}
                  size="small"
                  color={formData.is_active ? 'success' : 'default'}
                />
              </Box>
              <Switch
                checked={formData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                disabled={loading}
                color="success"
                sx={{ transform: 'scale(1.3)' }}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            bgcolor: theme.palette.background.default,
          }}
        >
          <Button
            variant="outlined"
            onClick={handleCloseDialog}
            disabled={loading}
            sx={{
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleSubmit}
            disabled={loading || !formData.name}
            sx={{
              textTransform: 'none',
              minWidth: 100,
            }}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Update'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CategoryEditAction;
