import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Container,
  Box,
  Button,
  TextField,
  Grid,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";
import { ArrowBack as BackIcon, Save as SaveIcon } from "@mui/icons-material";
import { PageHeader } from "../../components/PageHeader";
import { addressesApi } from "../../services/api";
import { useSnackbar } from "../../contexts/SnackbarContext";

const addressSchema = z.object({
  house_no: z.string().max(50).optional(),
  house_name_flat_number: z.string().max(100).optional(),
  housing_complex_building: z.string().max(100).optional(),
  street_road_name: z.string().max(150).optional(),
  land_mark: z.string().max(150).optional(),
  city_town_village: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  pin_code: z.string().max(10).optional(),
  address_text: z.string().optional(),
  content_type: z.coerce.number().int().positive("Content type is required"),
  object_id: z.coerce.number().int().positive("Object ID is required"),
});

type AddressFormData = z.infer<typeof addressSchema>;

const AddressForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      house_no: "",
      house_name_flat_number: "",
      housing_complex_building: "",
      street_road_name: "",
      land_mark: "",
      city_town_village: "",
      district: "",
      pin_code: "",
      address_text: "",
      content_type: "" as any,
      object_id: "" as any,
    },
  });

  useEffect(() => {
    if (isEditMode) {
      fetchAddress();
    }
  }, [id]);

  const fetchAddress = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await addressesApi.getById(parseInt(id));
      reset(response.data);
    } catch (error) {
      showSnackbar("Failed to fetch address", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: AddressFormData) => {
    try {
      setSubmitting(true);

      if (isEditMode && id) {
        await addressesApi.update(parseInt(id), data);
        showSnackbar("Address updated successfully", "success");
      } else {
        await addressesApi.create(data);
        showSnackbar("Address created successfully", "success");
      }

      navigate("/addresses");
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.message ||
        `Failed to ${isEditMode ? "update" : "create"} address`,
        "error"
      );
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <PageHeader
        title={isEditMode ? "Edit Address" : "Add New Address"}
        description={isEditMode ? "Update address information" : "Create a new address"}
        actions={
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate("/addresses")}
          >
            Back to Addresses
          </Button>
        }
      />

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* House Number */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="House Number"
                {...register("house_no")}
                error={!!errors.house_no}
                helperText={errors.house_no?.message}
              />
            </Grid>

            {/* House/Flat Name */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Flat or Building Name"
                {...register("house_name_flat_number")}
                error={!!errors.house_name_flat_number}
                helperText={errors.house_name_flat_number?.message}
              />
            </Grid>

            {/* Housing Complex */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Complex Name"
                {...register("housing_complex_building")}
                error={!!errors.housing_complex_building}
                helperText={errors.housing_complex_building?.message}
              />
            </Grid>

            {/* Street Name */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Street/Road Name"
                {...register("street_road_name")}
                error={!!errors.street_road_name}
                helperText={errors.street_road_name?.message}
              />
            </Grid>

            {/* Landmark */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nearby Landmark"
                {...register("land_mark")}
                error={!!errors.land_mark}
                helperText={errors.land_mark?.message}
              />
            </Grid>

            {/* City/Town/Village */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City/Town/Village"
                {...register("city_town_village")}
                error={!!errors.city_town_village}
                helperText={errors.city_town_village?.message}
              />
            </Grid>

            {/* District */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="District"
                {...register("district")}
                error={!!errors.district}
                helperText={errors.district?.message}
              />
            </Grid>

            {/* Pin Code */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Pin Code"
                {...register("pin_code")}
                error={!!errors.pin_code}
                helperText={errors.pin_code?.message}
              />
            </Grid>

            {/* Full Address Text */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Full Address Text"
                {...register("address_text")}
                error={!!errors.address_text}
                helperText={errors.address_text?.message || "Optional: Complete address as a single text"}
              />
            </Grid>

            {/* Content Type - Hidden for now or can be exposed */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Content Type ID"
                type="number"
                {...register("content_type")}
                error={!!errors.content_type}
                helperText={errors.content_type?.message || "Content type ID for generic relation"}
                required
              />
            </Grid>

            {/* Object ID - Hidden for now or can be exposed */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Object ID"
                type="number"
                {...register("object_id")}
                error={!!errors.object_id}
                helperText={errors.object_id?.message || "Related object ID"}
                required
              />
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/addresses")}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : isEditMode ? "Update Address" : "Create Address"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default AddressForm;
