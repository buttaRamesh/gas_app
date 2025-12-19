import { useState, useMemo, useCallback } from "react";
import { Box } from "@mui/material";
import SmartDataGrid from "@/components/datagrid/SmartDataGrid";
import { getUnitColumns } from "./unitsColumns";
import UnitDialog from "./components/UnitDialog";
import UnitDeleteDialog from "./components/UnitDeleteDialog";

export default function Units() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Dialog state
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    unit: any | null;
  }>({
    open: false,
    unit: null,
  });

  // Delete state
  const [deleteState, setDeleteState] = useState<{
    open: boolean;
    unit: any | null;
  }>({
    open: false,
    unit: null,
  });

  const handleOpenCreate = () => {
    setDialogState({ open: true, unit: null });
  };

  const handleOpenEdit = useCallback((unit: any) => {
    setDialogState({ open: true, unit });
  }, []);

  const handleOpenDelete = useCallback((unit: any) => {
    setDeleteState({ open: true, unit });
  }, []);

  const handleCloseDialog = () => {
    setDialogState({ open: false, unit: null });
  };

  const handleCloseDelete = () => {
    setDeleteState({ open: false, unit: null });
  };

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Get columns with actions
  const columns = useMemo(() => {
    return getUnitColumns({
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
        endpoint="/inventory/units/"
        columns={columns}
        toolbarOptions={{
          showNew: true,
          onNew: handleOpenCreate,
        }}
      />

      {/* Centralized Create/Edit Dialog */}
      {dialogState.open && (
        <UnitDialog
          open={dialogState.open}
          onClose={handleCloseDialog}
          unit={dialogState.unit}
          onSuccess={handleSuccess}
        />
      )}

      {/* Centralized Delete Dialog */}
      {deleteState.open && deleteState.unit && (
        <UnitDeleteDialog
          open={deleteState.open}
          onClose={handleCloseDelete}
          unitId={deleteState.unit.id}
          unitName={deleteState.unit.short_name}
          onSuccess={handleSuccess}
        />
      )}
    </Box>
  );
}
