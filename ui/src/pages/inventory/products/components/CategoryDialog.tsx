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
  IconButton,
  Typography,
  useTheme,
  Switch,
} from '@mui/material';
import { Close, Category as CategoryIcon } from '@mui/icons-material';
import inventoryApi from '@/api/inventory';
import type { ProductCategory } from '@/api/inventory';
import { toast } from 'sonner';

interface CategoryDialogProps {
  open: boolean;
  onClose: () => void;
  category?: ProductCategory | null;
  onSuccess?: () => void;
}

export default function CategoryDialog({ open, onClose, category, onSuccess }: CategoryDialogProps) {
  const theme = useTheme();
  const isEditing = !!category;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        is_active: category.is_active,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        is_active: true,
      });
    }
  }, [category, open]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setLoading(true);
    try {
      const data = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        is_active: formData.is_active,
      };

      if (isEditing && category) {
        await inventoryApi.updateCategory(category.id, data);
        toast.success('Category updated successfully');
      } else {
        await inventoryApi.createCategory(data);
        toast.success('Category created successfully');
      }

      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        `Failed to ${isEditing ? 'update' : 'create'} category`;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
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
          py: 1,
          px: 2,
          mb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CategoryIcon sx={{ fontSize: 20 }} />
          <Typography variant="subtitle1" fontWeight={600}>
            {isEditing ? 'Edit Category' : 'Add New Category'}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          disabled={loading}
          sx={{ color: 'inherit', p: 0.5 }}
          size="small"
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 2 }}>
            <TextField
              label="Category Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              fullWidth
              required
              disabled={loading}
              size="small"
              placeholder="e.g., Cylinder, Regulator, Stove"
              inputProps={{ maxLength: 100 }}
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
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
              <Typography variant="subtitle2" fontWeight={600}>
                Active Status
              </Typography>
              <Switch
                checked={formData.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
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
            onClick={onClose}
            disabled={loading}
            sx={{
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            disabled={loading || !formData.name.trim()}
            sx={{
              textTransform: 'none',
              minWidth: 100,
            }}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : isEditing ? (
              'Update'
            ) : (
              'Create'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
