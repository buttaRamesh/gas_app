import { Snackbar, Alert } from "@mui/material";
import { useErrorStore } from "../../store/error.store";

const AppErrorSnackbar = () => {
  const { open, message, hideError } = useErrorStore();

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={hideError}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert onClose={hideError} severity="error" variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
};

export default AppErrorSnackbar;
