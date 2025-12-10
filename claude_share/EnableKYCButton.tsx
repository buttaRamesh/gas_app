import { Button, CircularProgress } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";

interface EnableKYCButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  size?: "small" | "medium" | "large";
}

const EnableKYCButton = ({
  onClick,
  disabled = false,
  loading = false,
  size = "small",
}: EnableKYCButtonProps) => {
  return (
    <Button
      variant="contained"
      color="success"
      size={size}
      onClick={onClick}
      disabled={disabled || loading}
      startIcon={
        loading ? (
          <CircularProgress size={16} color="inherit" />
        ) : (
          <CheckCircle />
        )
      }
      sx={{
        textTransform: "none",
        fontWeight: 600,
        borderRadius: 1.5,
        px: size === "small" ? 1.5 : 2,
        py: size === "small" ? 0.5 : 1,
        boxShadow: 2,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: 4,
        },
        "&:active": {
          transform: "translateY(0)",
        },
        "&:disabled": {
          opacity: 0.7,
        },
      }}
    >
      Enable KYC
    </Button>
  );
};

export default EnableKYCButton;
