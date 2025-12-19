import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUnit, updateUnit, Unit } from '@/api/inventory';
import { toast } from 'sonner';

const unitSchema = z.object({
  short_name: z.string().min(1, 'Short name is required').max(10, 'Short name must be 10 characters or less'),
  description: z.string().optional(),
  is_active: z.boolean(),
});

type UnitFormData = z.infer<typeof unitSchema>;

interface UnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit?: Unit | null;
}

export const UnitDialog: React.FC<UnitDialogProps> = ({
  open,
  onOpenChange,
  unit,
}) => {
  const queryClient = useQueryClient();
  const isEditing = !!unit;

  const form = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      short_name: '',
      description: '',
      is_active: true,
    },
  });

  useEffect(() => {
    if (unit) {
      form.reset({
        short_name: unit.short_name,
        description: unit.description || '',
        is_active: unit.is_active,
      });
    } else {
      form.reset({
        short_name: '',
        description: '',
        is_active: true,
      });
    }
  }, [unit, form]);

  const createMutation = useMutation({
    mutationFn: createUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      toast.success('Unit created successfully');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Failed to create unit');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Unit> }) =>
      updateUnit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      toast.success('Unit updated successfully');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Failed to update unit');
    },
  });

  const onSubmit = (data: UnitFormData) => {
    const payload = {
      short_name: data.short_name,
      description: data.description || null,
      is_active: data.is_active,
    };

    if (isEditing && unit) {
      updateMutation.mutate({ id: unit.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground px-4 py-2">
          <DialogTitle className="text-sm font-semibold">
            {isEditing ? 'Edit Unit' : 'Add New Unit'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
            <FormField
              control={form.control}
              name="short_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., KG, LTR, NOS" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter unit description..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active Status</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Enable or disable this unit
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="secondary" disabled={isLoading}>
                {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
