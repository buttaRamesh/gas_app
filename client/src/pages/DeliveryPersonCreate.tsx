import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  Save as SaveIcon,
} from "@mui/icons-material";
import { deliveryPersonsApi } from "@/services/api";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { PageHeader } from "@/components/PageHeader";

const deliveryPersonSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200, "Name must be less than 200 characters"),
});

type DeliveryPersonFormData = z.infer<typeof deliveryPersonSchema>;

export default function DeliveryPersonCreate() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeliveryPersonFormData>({
    resolver: zodResolver(deliveryPersonSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: DeliveryPersonFormData) => {
    try {
      setSubmitting(true);
      const response = await deliveryPersonsApi.create(data);
      showSnackbar("Delivery person created successfully", "success");
      navigate(`/delivery-persons/${response.data.id}`);
    } catch (err: any) {
      console.error("Failed to create delivery person:", err);
      showSnackbar(
        err.response?.data?.name?.[0] || "Failed to create delivery person",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "hsl(var(--background))", py: 4 }}>
      <Container maxWidth={false} sx={{ width: "80%", mx: "auto" }}>
        <PageHeader title="Add Delivery Person" />

        <Card 
          elevation={3}
          sx={{
            background: "linear-gradient(145deg, hsl(var(--card)) 0%, hsla(var(--card-gradient-end), 0.03) 100%)",
            border: "1px solid hsla(var(--primary), 0.15)",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
                <TextField
                  label="Person Name"
                  placeholder="Enter delivery person name"
                  {...register("name")}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  fullWidth
                  required
                  disabled={submitting}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "1rem",
                      fontWeight: 500,
                      "&:hover fieldset": {
                        borderColor: "hsla(var(--primary), 0.5)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "hsl(var(--primary))",
                      },
                    },
                  }}
                />

                <Box sx={{ display: "flex", gap: 2.5, justifyContent: "flex-end", mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/delivery-persons")}
                    disabled={submitting}
                    sx={{
                      px: 3.5,
                      py: 1.25,
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      borderColor: "hsla(var(--primary), 0.4)",
                      color: "hsl(var(--primary))",
                      "&:hover": {
                        borderColor: "hsl(var(--primary))",
                        bgcolor: "hsla(var(--primary), 0.05)",
                      },
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
                    disabled={submitting}
                    sx={{
                      px: 4,
                      py: 1.25,
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      bgcolor: "hsl(var(--primary))",
                      "&:hover": {
                        bgcolor: "hsl(var(--primary-dark))",
                      },
                    }}
                  >
                    {submitting ? "Creating..." : "Create Person"}
                  </Button>
                </Box>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
