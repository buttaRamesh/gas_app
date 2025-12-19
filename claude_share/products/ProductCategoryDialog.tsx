import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProductCategory, updateProductCategory, ProductCategory } from '@/api/inventory';
import { toast } from 'sonner';

interface ProductCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: ProductCategory | null;
}

export function ProductCategoryDialog({ open, onOpenChange, category }: ProductCategoryDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = !!category;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
  });

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

  const createMutation = useMutation({
    mutationFn: createProductCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productCategories'] });
      toast.success('Category created successfully');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Failed to create category');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProductCategory> }) =>
      updateProductCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productCategories'] });
      toast.success('Category updated successfully');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Failed to update category');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      name: formData.name,
      description: formData.description || null,
      is_active: formData.is_active,
    };

    if (isEditing && category) {
      updateMutation.mutate({ id: category.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground px-4 py-2">
          <DialogTitle className="text-sm font-semibold">
            {isEditing ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 p-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Category Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Cylinder, Regulator, Stove"
              required
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter category description..."
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-muted/30">
            <div className="space-y-0.5">
              <Label htmlFor="is_active" className="text-sm font-medium">
                Active Status
              </Label>
              <p className="text-xs text-muted-foreground">
                Inactive categories won't appear in product forms
              </p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="secondary" disabled={isLoading || !formData.name.trim()}>
              {isLoading ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
