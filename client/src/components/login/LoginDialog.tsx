import {
  Dialog,
  DialogTitle,
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { LocalFireDepartment } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const loginSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LoginDialog = ({ open, onOpenChange }: LoginDialogProps) => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { login } = useAuth();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      employeeId: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await login(data.employeeId, data.password);
      showSnackbar("Login Successful - Welcome back to Lalitha Gas Agency", "success");
      onOpenChange(false);
      navigate("/dashboard");
    } catch (error: any) {
      showSnackbar(error.message || "Login failed. Please check your credentials.", "error");
    } finally {
      setIsLoading(false);
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
          borderRadius: 2,
          overflow: "hidden",
        },
      }}
    >
      <Box sx={{ display: "flex", minHeight: 500 }}>
        {/* Left side - Orange background with content */}
        <Box
          sx={{
            flex: 1,
            bgcolor: "#F59E0B",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            p: 6,
            color: "white",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              mb: 3,
              fontWeight: 500,
            }}
          >
            Your trusted partner for
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 6,
            }}
          >
            Quality LPG Solutions
          </Typography>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: "rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 4,
            }}
          >
            <LocalFireDepartment sx={{ color: "white", fontSize: 40 }} />
          </Box>
          <Box>
            <Typography fontWeight={600} variant="body1">Serving 10,000+ Customers</Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              10+ Years of Excellence
            </Typography>
          </Box>
        </Box>

        {/* Right side - Login Form */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            bgcolor: "background.paper",
            p: 6,
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <Box
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  p: 1,
                  borderRadius: 1.5,
                }}
              >
                <LocalFireDepartment sx={{ color: "white", fontSize: 24 }} />
              </Box>
              <Typography variant="h6" fontWeight={700}>
                Lalitha Gas Agency
              </Typography>
            </Box>
            <DialogTitle sx={{ p: 0, mb: 1 }}>
              <Typography variant="h5" fontWeight={700}>
                Staff Portal
              </Typography>
            </DialogTitle>
            <Typography color="text.secondary">
              Enter your credentials to access the dashboard
            </Typography>
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Controller
                name="employeeId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Employee ID"
                    type="text"
                    placeholder="Enter your employee ID (e.g., admin)"
                    fullWidth
                    disabled={isLoading}
                    error={!!errors.employeeId}
                    helperText={errors.employeeId?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 48,
                        "&.Mui-focused fieldset": {
                          borderColor: "#F59E0B",
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#F59E0B",
                      },
                    }}
                  />
                )}
              />
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    fullWidth
                    disabled={isLoading}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 48,
                        "&.Mui-focused fieldset": {
                          borderColor: "#F59E0B",
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#F59E0B",
                      },
                    }}
                  />
                )}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={isLoading}
                sx={{
                  height: 48,
                  fontSize: "1rem",
                  bgcolor: "#F59E0B",
                  "&:hover": {
                    bgcolor: "#D97706"
                  }
                }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
              </Button>
            </Box>
          </form>

          <Box
            sx={{
              mt: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button
              size="small"
              sx={{
                color: "text.secondary",
                textTransform: "none",
                "&:hover": {
                  color: "text.primary",
                },
              }}
            >
              Register
            </Button>
            <Button
              size="small"
              sx={{
                color: "text.secondary",
                textTransform: "none",
                "&:hover": {
                  color: "text.primary",
                },
              }}
            >
              Forgot Password?
            </Button>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
};

export default LoginDialog;
