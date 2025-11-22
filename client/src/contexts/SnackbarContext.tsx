import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

interface SnackbarContextType {
  showSnackbar: (message: string, severity?: AlertColor, duration?: number) => void;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within SnackbarProvider');
  }
  return context;
};

interface SnackbarProviderProps {
  children: React.ReactNode;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
  duration: number;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
    duration: 4000,
  });

  const showSnackbar = useCallback((
    msg: string,
    sev: AlertColor = 'success',
    duration: number = 4000
  ) => {
    setSnackbar({
      open: true,
      message: msg,
      severity: sev,
      duration,
    });
  }, []);

  const showError = useCallback((msg: string) => {
    showSnackbar(msg, 'error', 6000); // Errors stay longer
  }, [showSnackbar]);

  const showSuccess = useCallback((msg: string) => {
    showSnackbar(msg, 'success', 4000);
  }, [showSnackbar]);

  const showWarning = useCallback((msg: string) => {
    showSnackbar(msg, 'warning', 5000);
  }, [showSnackbar]);

  const showInfo = useCallback((msg: string) => {
    showSnackbar(msg, 'info', 4000);
  }, [showSnackbar]);

  const handleClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <SnackbarContext.Provider value={{
      showSnackbar,
      showError,
      showSuccess,
      showWarning,
      showInfo,
    }}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: '100%',
            maxWidth: '500px',
            wordWrap: 'break-word',
            '& .MuiAlert-message': {
              width: '100%',
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};
