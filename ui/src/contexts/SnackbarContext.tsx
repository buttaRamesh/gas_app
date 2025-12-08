import { createContext, useContext, useState, type ReactNode } from "react";
import type { AlertColor } from "@mui/material";

interface SnackbarContextValue {
  showSnackbar: (message: string, severity?: AlertColor) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | undefined>(undefined);

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  const showSnackbar = (message: string, severity: AlertColor = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <GlobalSnackbar snackbar={snackbar} setSnackbar={setSnackbar} />
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) {
    throw new Error("useSnackbar must be used inside <SnackbarProvider>");
  }
  return ctx;
}

// INTERNAL COMPONENT: MUI Snackbar
import { Snackbar, Alert } from "@mui/material";

function GlobalSnackbar({
  snackbar,
  setSnackbar,
}: {
  snackbar: { open: boolean; message: string; severity: AlertColor };
  setSnackbar: (val: any) => void;
}) {
  const handleClose = () => setSnackbar((s: any) => ({ ...s, open: false }));

  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert onClose={handleClose} severity={snackbar.severity} variant="filled">
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
}
