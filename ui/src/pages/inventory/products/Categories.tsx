import { useState, useMemo, useCallback } from "react";
import { Box } from "@mui/material";
import SmartDataGrid from "@/components/datagrid/SmartDataGrid";
import { getCategoryColumns } from "./categoryColumns";
import CategoryDialog from "./components/CategoryDialog";
import CategoryDeleteDialog from "./components/CategoryDeleteDialog";

export default function Categories() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Dialog state
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    category: any | null;
  }>({
    open: false,
    category: null,
  });

  // Delete state
  const [deleteState, setDeleteState] = useState<{
    open: boolean;
    category: any | null;
  }>({
    open: false,
    category: null,
  });

  const handleOpenCreate = () => {
    setDialogState({ open: true, category: null });
  };

  const handleOpenEdit = useCallback((category: any) => {
    setDialogState({ open: true, category });
  }, []);

  const handleOpenDelete = useCallback((category: any) => {
    setDeleteState({ open: true, category });
  }, []);

  const handleCloseDialog = () => {
    setDialogState({ open: false, category: null });
  };

  const handleCloseDelete = () => {
    setDeleteState({ open: false, category: null });
  };

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Get columns with actions
  const columns = useMemo(() => {
    return getCategoryColumns({
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
        endpoint="/inventory/categories/"
        columns={columns}
        toolbarOptions={{
          showNew: true,
          onNew: handleOpenCreate,
        }}
      />

      {/* Centralized Create/Edit Dialog */}
      {dialogState.open && (
        <CategoryDialog
          open={dialogState.open}
          onClose={handleCloseDialog}
          category={dialogState.category}
          onSuccess={handleSuccess}
        />
      )}

      {/* Centralized Delete Dialog */}
      {deleteState.open && deleteState.category && (
        <CategoryDeleteDialog
          open={deleteState.open}
          onClose={handleCloseDelete}
          categoryId={deleteState.category.id}
          categoryName={deleteState.category.name}
          onSuccess={handleSuccess}
        />
      )}
    </Box>
  );
}
