import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Slide,
} from "@mui/material";
import { Warning, CheckCircle, Close } from "@mui/icons-material";
import { forwardRef } from "react";
import type { TransitionProps } from "@mui/material/transitions";

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface EnableKYCConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  consumerName: string;
  consumerNumber?: string;
  loading?: boolean;
}

const EnableKYCConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  consumerName,
  consumerNumber,
  loading = false,
}: EnableKYCConfirmationDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      TransitionComponent={Transition}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
        },
      }}
    >
      {/* Header with warning icon */}
      <Box
        sx={{
          bgcolor: "warning.light",
          py: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            bgcolor: "warning.main",
            borderRadius: "50%",
            width: 56,
            height: 56,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: 2,
          }}
        >
          <Warning sx={{ fontSize: 32, color: "warning.contrastText" }} />
        </Box>
      </Box>

      <DialogTitle
        sx={{
          textAlign: "center",
          fontWeight: 700,
          fontSize: "1.25rem",
          pt: 2,
          pb: 1,
        }}
      >
        Enable KYC Confirmation
      </DialogTitle>

      <DialogContent sx={{ textAlign: "center", px: 3, pb: 2 }}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Are you sure you want to enable KYC for
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 700,
            color: "primary.main",
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          {consumerName}
        </Typography>
        {consumerNumber && (
          <Typography
            variant="body2"
            sx={{
              mt: 0.5,
              fontWeight: 600,
              color: "text.secondary",
            }}
          >
            ({consumerNumber})
          </Typography>
        )}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2, fontSize: "0.85rem" }}
        >
          This action will mark the consumer as KYC verified and cannot be
          undone.
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 1,
          gap: 1.5,
          justifyContent: "center",
        }}
      >
        <Button
          variant="outlined"
          color="secondary"
          onClick={onClose}
          disabled={loading}
          startIcon={<Close />}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
            minWidth: 120,
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={onConfirm}
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <CheckCircle />
            )
          }
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
            minWidth: 120,
            boxShadow: 2,
            "&:hover": {
              boxShadow: 4,
            },
          }}
        >
          {loading ? "Enabling..." : "Confirm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnableKYCConfirmationDialog;
