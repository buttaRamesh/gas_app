import { useState, useMemo, useCallback } from "react";
import { Box } from "@mui/material";
import SmartDataGrid from "@/components/datagrid/SmartDataGrid";
import { getProductColumns } from "./productsColumns";
import ProductDialog from "./components/ProductDialog";
import ProductDeleteDialog from "./components/ProductDeleteDialog";

export default function Products() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Dialog state
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    product: any | null;
  }>({
    open: false,
    product: null,
  });

  // Delete state
  const [deleteState, setDeleteState] = useState<{
    open: boolean;
    product: any | null;
  }>({
    open: false,
    product: null,
  });

  const handleOpenCreate = () => {
    setDialogState({ open: true, product: null });
  };

  const handleOpenEdit = useCallback((product: any) => {
    setDialogState({ open: true, product });
  }, []);

  const handleOpenDelete = useCallback((product: any) => {
    setDeleteState({ open: true, product });
  }, []);

  const handleCloseDialog = () => {
    setDialogState({ open: false, product: null });
  };

  const handleCloseDelete = () => {
    setDeleteState({ open: false, product: null });
  };

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Get columns with actions
  const columns = useMemo(() => {
    return getProductColumns({
      showActions: true,
      onEdit: handleOpenEdit,
      onDelete: handleOpenDelete,
    });
  }, [handleOpenEdit, handleOpenDelete]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <SmartDataGrid
        key={refreshKey}
        endpoint="/inventory/products/"
        columns={columns}
        toolbarOptions={{
          showNew: true,
          onNew: handleOpenCreate,
        }}
      />

      {/* Centralized Create/Edit Dialog */}
      {dialogState.open && (
        <ProductDialog
          open={dialogState.open}
          onClose={handleCloseDialog}
          product={dialogState.product}
          onSuccess={handleSuccess}
        />
      )}

      {/* Centralized Delete Dialog */}
      {deleteState.open && deleteState.product && (
        <ProductDeleteDialog
          open={deleteState.open}
          onClose={handleCloseDelete}
          productId={deleteState.product.id}
          productName={deleteState.product.name}
          onSuccess={handleSuccess}
        />
      )}
    </Box>
  );
}
