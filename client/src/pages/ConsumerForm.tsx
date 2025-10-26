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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  FormHelperText,
} from "@mui/material";
import { ArrowBack as BackIcon, Save as SaveIcon } from "@mui/icons-material";
import { PageHeader } from "../components/PageHeader";
import { consumersApi, lookupsApi, schemesApi } from "../services/api";
import { useSnackbar } from "../contexts/SnackbarContext";
import type { ConsumerCategory, ConsumerType, BPLType, DCTType, Scheme } from "../types/consumers";

const consumerSchema = z.object({
  consumer_number: z.string().min(1, "Consumer number is required").max(50),
  consumer_name: z.string().min(1, "Consumer name is required").max(200),
  father_name: z.string().max(200).optional(),
  mother_name: z.string().max(200).optional(),
  spouse_name: z.string().max(200).optional(),
  ration_card_num: z.string().max(50).optional(),
  blue_book: z.coerce.number().int().positive().optional().or(z.literal("")),
  lpg_id: z.coerce.number().int().positive().optional().or(z.literal("")),
  is_kyc_done: z.boolean(),
  category: z.coerce.number().int().positive("Category is required"),
  consumer_type: z.coerce.number().int().positive("Consumer type is required"),
  bpl_type: z.coerce.number().int().positive().optional().or(z.literal("")),
  dct_type: z.coerce.number().int().positive().optional().or(z.literal("")),
  opting_status: z.enum(["OPT_IN", "OPT_OUT", "PENDING"]),
  scheme: z.coerce.number().int().positive().optional().or(z.literal("")),
});

type ConsumerFormData = z.infer<typeof consumerSchema>;

const ConsumerForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Lookups
  const [categories, setCategories] = useState<ConsumerCategory[]>([]);
  const [types, setTypes] = useState<ConsumerType[]>([]);
  const [bplTypes, setBplTypes] = useState<BPLType[]>([]);
  const [dctTypes, setDctTypes] = useState<DCTType[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ConsumerFormData>({
    resolver: zodResolver(consumerSchema),
    defaultValues: {
      consumer_number: "",
      consumer_name: "",
      father_name: "",
      mother_name: "",
      spouse_name: "",
      ration_card_num: "",
      blue_book: "" as any,
      lpg_id: "" as any,
      is_kyc_done: false,
      category: "" as any,
      consumer_type: "" as any,
      bpl_type: "" as any,
      dct_type: "" as any,
      opting_status: "PENDING",
      scheme: "" as any,
    },
  });

  const isKycDone = watch("is_kyc_done");

  useEffect(() => {
    fetchLookups();
    if (isEditMode) {
      fetchConsumer();
    }
  }, [id]);

  const fetchLookups = async () => {
    try {
      const [categoriesRes, typesRes, bplTypesRes, dctTypesRes, schemesRes] = await Promise.all([
        lookupsApi.getConsumerCategories(),
        lookupsApi.getConsumerTypes(),
        lookupsApi.getBPLTypes(),
        lookupsApi.getDCTTypes(),
        schemesApi.getAll(),
      ]);
      setCategories(categoriesRes.data);
      setTypes(typesRes.data);
      setBplTypes(bplTypesRes.data);
      setDctTypes(dctTypesRes.data);
      setSchemes(schemesRes.data.results || schemesRes.data);
    } catch (error) {
      showSnackbar("Failed to fetch lookup data", "error");
      console.error(error);
    }
  };

  const fetchConsumer = async () => {
    try {
      setLoading(true);
      const response = await consumersApi.getById(Number(id));
      const consumer = response.data;

      reset({
        consumer_number: consumer.consumer_number,
        consumer_name: consumer.consumer_name,
        father_name: consumer.father_name || "",
        mother_name: consumer.mother_name || "",
        spouse_name: consumer.spouse_name || "",
        ration_card_num: consumer.ration_card_num || "",
        blue_book: consumer.blue_book || ("" as any),
        lpg_id: consumer.lpg_id || ("" as any),
        is_kyc_done: consumer.is_kyc_done,
        category: consumer.category,
        consumer_type: consumer.consumer_type,
        bpl_type: consumer.bpl_type || ("" as any),
        dct_type: consumer.dct_type || ("" as any),
        opting_status: consumer.opting_status,
        scheme: consumer.scheme || ("" as any),
      });
    } catch (error) {
      showSnackbar("Failed to fetch consumer", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ConsumerFormData) => {
    try {
      setSubmitting(true);

      // Clean up empty optional fields
      const payload: any = { ...data };
      if (!payload.father_name) delete payload.father_name;
      if (!payload.mother_name) delete payload.mother_name;
      if (!payload.spouse_name) delete payload.spouse_name;
      if (!payload.ration_card_num) delete payload.ration_card_num;
      if (!payload.blue_book || payload.blue_book === "") delete payload.blue_book;
      if (!payload.lpg_id || payload.lpg_id === "") delete payload.lpg_id;
      if (!payload.bpl_type || payload.bpl_type === "") delete payload.bpl_type;
      if (!payload.dct_type || payload.dct_type === "") delete payload.dct_type;
      if (!payload.scheme || payload.scheme === "") delete payload.scheme;

      if (isEditMode) {
        await consumersApi.update(Number(id), payload);
        showSnackbar("Consumer updated successfully", "success");
      } else {
        await consumersApi.create(payload);
        showSnackbar("Consumer created successfully", "success");
      }

      navigate("/consumers");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to save consumer";
      showSnackbar(errorMessage, "error");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <PageHeader
        title={isEditMode ? "Edit Consumer" : "Create Consumer"}
        description={isEditMode ? "Update consumer information" : "Add a new consumer to the system"}
        actions={
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate("/consumers")}
          >
            Back
          </Button>
        }
      />

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Consumer Number"
                {...register("consumer_number")}
                error={!!errors.consumer_number}
                helperText={errors.consumer_number?.message}
                disabled={submitting}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Consumer Name"
                {...register("consumer_name")}
                error={!!errors.consumer_name}
                helperText={errors.consumer_name?.message}
                disabled={submitting}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Father's Name"
                {...register("father_name")}
                error={!!errors.father_name}
                helperText={errors.father_name?.message}
                disabled={submitting}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Mother's Name"
                {...register("mother_name")}
                error={!!errors.mother_name}
                helperText={errors.mother_name?.message}
                disabled={submitting}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Spouse Name"
                {...register("spouse_name")}
                error={!!errors.spouse_name}
                helperText={errors.spouse_name?.message}
                disabled={submitting}
              />
            </Grid>

            {/* Category & Type */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Category & Type
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.category}>
                <InputLabel required>Category</InputLabel>
                <Select
                  {...register("category")}
                  label="Category"
                  disabled={submitting}
                  defaultValue=""
                >
                  <MenuItem value="">Select Category</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.category && (
                  <FormHelperText>{errors.category.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.consumer_type}>
                <InputLabel required>Consumer Type</InputLabel>
                <Select
                  {...register("consumer_type")}
                  label="Consumer Type"
                  disabled={submitting}
                  defaultValue=""
                >
                  <MenuItem value="">Select Type</MenuItem>
                  {types.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.consumer_type && (
                  <FormHelperText>{errors.consumer_type.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>BPL Type</InputLabel>
                <Select
                  {...register("bpl_type")}
                  label="BPL Type"
                  disabled={submitting}
                  defaultValue=""
                >
                  <MenuItem value="">None</MenuItem>
                  {bplTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>DCT Type</InputLabel>
                <Select
                  {...register("dct_type")}
                  label="DCT Type"
                  disabled={submitting}
                  defaultValue=""
                >
                  <MenuItem value="">None</MenuItem>
                  {dctTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Scheme</InputLabel>
                <Select
                  {...register("scheme")}
                  label="Scheme"
                  disabled={submitting}
                  defaultValue=""
                >
                  <MenuItem value="">None</MenuItem>
                  {schemes.map((scheme) => (
                    <MenuItem key={scheme.id} value={scheme.id}>
                      {scheme.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Government IDs */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Government IDs
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Ration Card Number"
                {...register("ration_card_num")}
                error={!!errors.ration_card_num}
                helperText={errors.ration_card_num?.message}
                disabled={submitting}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Blue Book Number"
                type="number"
                {...register("blue_book")}
                error={!!errors.blue_book}
                helperText={errors.blue_book?.message}
                disabled={submitting}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="LPG ID"
                type="number"
                {...register("lpg_id")}
                error={!!errors.lpg_id}
                helperText={errors.lpg_id?.message}
                disabled={submitting}
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Status
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Opting Status</InputLabel>
                <Select
                  {...register("opting_status")}
                  label="Opting Status"
                  disabled={submitting}
                  defaultValue="PENDING"
                >
                  <MenuItem value="OPT_IN">Opt In</MenuItem>
                  <MenuItem value="OPT_OUT">Opt Out</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isKycDone}
                    onChange={(e) => setValue("is_kyc_done", e.target.checked)}
                    disabled={submitting}
                  />
                }
                label="KYC Done"
              />
            </Grid>

            {/* Actions */}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/consumers")}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={submitting}
                >
                  {isEditMode ? "Update" : "Create"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default ConsumerForm;
