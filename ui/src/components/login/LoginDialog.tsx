import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useSnackbar } from "@/contexts/SnackbarContext";
import { useAuthStore } from "@/store/auth.store";
import { applyServerValidationErrorsToForm } from "@/utils/applyServerValidationErrorsToForm";

const loginSchema = z.object({
  employee_id: z.string().min(1, "Employee ID is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const { showSnackbar } = useSnackbar();
  const login = useAuthStore((s) => s.login);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      employee_id: "",
      password: "",
    },
  });

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      reset();
      setShowPassword(false);
      setLoading(false);
    }
  }, [open, reset]);

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);

    try {
      await login(values.employee_id, values.password);

      showSnackbar("Login successful", "success");
      onOpenChange(false);

      // navigate to dashboard
      window.location.href = "/dashboard";
    } catch (err: any) {
      if (err?.status === 422 && err?.errors) {
        applyServerValidationErrorsToForm<LoginFormValues>(err.errors, setError);
      } else {
        showSnackbar(err?.message ?? "Login failed", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => onOpenChange(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            minHeight: 480,
          }}
        >
          {/* LEFT TEXT CONTENT PANEL */}
          <Box
            sx={{
              flex: 1,
              bgcolor: "primary.main",
              color: "white",
              py: 6,
              px: 5,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              textAlign: { xs: "center", md: "left" },
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 2,
                lineHeight: 1.3,
              }}
            >
              Welcome to  
              <br /> Lalitha Gas Agency
            </Typography>

            <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
              Manage LPG cylinder distribution, customer service  
              and staff operations — all from one dashboard.
            </Typography>

            <Box>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                ✔ Trusted by 10,000+ customers
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                ✔ 10+ years of reliable service
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                ✔ Secure staff portal access
              </Typography>
            </Box>
          </Box>

          {/* RIGHT LOGIN FORM PANEL */}
          <Box
            sx={{
              flex: 1,
              p: 6,
              bgcolor: "background.paper",
              position: "relative",
            }}
          >
            <IconButton
              sx={{ position: "absolute", top: 12, right: 12 }}
              onClick={() => onOpenChange(false)}
            >
              <CloseIcon />
            </IconButton>

            <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
              Staff Login
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Enter your credentials to access the dashboard
            </Typography>

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              {/* Employee ID */}
              <Controller
                name="employee_id"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Employee ID"
                    fullWidth
                    disabled={loading}
                    error={!!errors.employee_id}
                    helperText={errors.employee_id?.message}
                    sx={{ mb: 2 }}
                  />
                )}
              />

              {/* Password */}
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Password"
                    fullWidth
                    type={showPassword ? "text" : "password"}
                    disabled={loading}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    sx={{ mb: 2 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword((v) => !v)}
                            size="small"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  bgcolor: "secondary.main",
                  color: "black",
                  height: 48,
                  fontWeight: 600,
                  textTransform: "none",
                  "&:hover": { bgcolor: "secondary.dark" },
                }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : "Login"}
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
