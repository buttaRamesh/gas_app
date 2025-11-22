import { useState, useCallback } from 'react';

export interface UseDialogOptions<T = any> {
  /** Initial open state */
  initialOpen?: boolean;
  /** Callback when dialog opens */
  onOpen?: (data?: T) => void;
  /** Callback when dialog closes */
  onClose?: () => void;
}

export interface UseDialogReturn<T = any> {
  /** Whether dialog is open */
  isOpen: boolean;
  /** Data associated with dialog */
  data: T | null;
  /** Open dialog with optional data */
  open: (data?: T) => void;
  /** Close dialog */
  close: () => void;
  /** Toggle dialog state */
  toggle: () => void;
}

/**
 * Custom hook for managing dialog state
 * Eliminates repetitive dialog state management code
 *
 * @example
 * ```tsx
 * // Simple dialog
 * const deleteDialog = useDialog();
 *
 * <Button onClick={deleteDialog.open}>Delete</Button>
 * <Dialog open={deleteDialog.isOpen} onClose={deleteDialog.close}>
 *   <DialogContent>...</DialogContent>
 * </Dialog>
 *
 * // Dialog with data
 * const editDialog = useDialog<Product>();
 *
 * <Button onClick={() => editDialog.open(product)}>Edit</Button>
 * <Dialog open={editDialog.isOpen} onClose={editDialog.close}>
 *   <DialogContent>Editing: {editDialog.data?.name}</DialogContent>
 * </Dialog>
 * ```
 */
export function useDialog<T = any>(
  options: UseDialogOptions<T> = {}
): UseDialogReturn<T> {
  const { initialOpen = false, onOpen, onClose } = options;

  const [isOpen, setIsOpen] = useState(initialOpen);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback(
    (dialogData?: T) => {
      setData(dialogData ?? null);
      setIsOpen(true);
      onOpen?.(dialogData);
    },
    [onOpen]
  );

  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
    // Clear data after a short delay to allow exit animations
    setTimeout(() => setData(null), 200);
  }, [onClose]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
  };
}
