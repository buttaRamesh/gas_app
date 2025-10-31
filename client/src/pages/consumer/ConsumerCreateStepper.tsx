import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray, Controller } from "react-hook-form";
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
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  FormHelperText,
  IconButton,
  Divider,
  Card,
  CardContent,
  Alert,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  ArrowForward as NextIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { PageHeader } from "../../components/PageHeader";
import { consumersApi, lookupsApi, schemesApi, addressesApi, contactsApi, contentTypesApi } from "../../services/api";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { AddressFormFields } from "../../components/AddressFormFields";
import { ContactFormFields } from "../../components/ContactFormFields";
import type { ConsumerCategory, ConsumerType, BPLType, DCTType, Scheme } from "../../types/consumers";

// Schema for the entire form
const consumerCreateSchema = z.object({
  // Step 1: Basic Info (Required)
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

  // Step 2: Addresses (Optional)
  addresses: z.array(z.object({
    house_no: z.string().max(50).optional(),
    house_name_flat_number: z.string().max(100).optional(),
    housing_complex_building: z.string().max(100).optional(),
    street_road_name: z.string().max(150).optional(),
    land_mark: z.string().max(150).optional(),
    city_town_village: z.string().max(100).optional(),
    district: z.string().max(100).optional(),
    pin_code: z.string().max(10).optional(),
    address_text: z.string().optional(),
  })).optional(),

  // Step 3: Contacts (Optional)
  contacts: z.array(z.object({
    mobile_number: z.string().max(15).optional(),
    phone_number: z.string().max(15).optional(),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
  })).optional(),
});

type ConsumerCreateFormData = z.infer<typeof consumerCreateSchema>;

const steps = ["Basic Information", "Addresses", "Contacts", "Review & Submit"];

const ConsumerCreateStepper = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Lookups
  const [categories, setCategories] = useState<ConsumerCategory[]>([]);
  const [types, setTypes] = useState<ConsumerType[]>([]);
  const [bplTypes, setBplTypes] = useState<BPLType[]>([]);
  const [dctTypes, setDctTypes] = useState<DCTType[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>([]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
    getValues,
  } = useForm<ConsumerCreateFormData>({
    resolver: zodResolver(consumerCreateSchema),
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
      addresses: [],
      contacts: [],
    },
  });

  const { fields: addressFields, append: appendAddress, remove: removeAddress } = useFieldArray({
    control,
    name: "addresses",
  });

  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({
    control,
    name: "contacts",
  });

  useEffect(() => {
    fetchLookups();
  }, []);

  const fetchLookups = async () => {
    try {
      const [categoriesRes, typesRes, bplTypesRes, dctTypesRes, schemesRes] = await Promise.all([
        lookupsApi.getConsumerCategories(),
        lookupsApi.getConsumerTypes(),
        lookupsApi.getBPLTypes(),
        lookupsApi.getDCTTypes(),
        schemesApi.getAll(),
      ]);
      setCategories(categoriesRes.data.results || categoriesRes.data);
      setTypes(typesRes.data.results || typesRes.data);
      setBplTypes(bplTypesRes.data.results || bplTypesRes.data);
      setDctTypes(dctTypesRes.data.results || dctTypesRes.data);
      setSchemes(schemesRes.data.results || schemesRes.data);
    } catch (error) {
      showSnackbar("Failed to fetch lookup data", "error");
      console.error(error);
    }
  };

  const handleNext = async () => {
    // Validate current step before proceeding
    let fieldsToValidate: any[] = [];

    if (activeStep === 0) {
      // Step 1: Basic Info - validate required fields
      fieldsToValidate = [
        "consumer_number",
        "consumer_name",
        "category",
        "consumer_type",
        "opting_status",
      ];
    }

    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const onSubmit = async (data: ConsumerCreateFormData) => {
    try {
      setSubmitting(true);

      // Create consumer first
      const consumerData = {
        consumer_number: data.consumer_number,
        consumer_name: data.consumer_name,
        father_name: data.father_name,
        mother_name: data.mother_name,
        spouse_name: data.spouse_name,
        ration_card_num: data.ration_card_num,
        blue_book: data.blue_book || null,
        lpg_id: data.lpg_id || null,
        is_kyc_done: data.is_kyc_done,
        category: data.category,
        consumer_type: data.consumer_type,
        bpl_type: data.bpl_type || null,
        dct_type: data.dct_type || null,
        opting_status: data.opting_status,
        scheme: data.scheme || null,
      };

      const consumerResponse = await consumersApi.create(consumerData);
      const consumerId = consumerResponse.data.id;

      // Get content_type ID for consumer model
      const contentTypeResponse = await contentTypesApi.getByModel('consumer');
      const consumerContentType = contentTypeResponse.data.content_type_id;

      // Create addresses if any
      if (data.addresses && data.addresses.length > 0) {
        for (const address of data.addresses) {
          await addressesApi.create({
            ...address,
            content_type: consumerContentType,
            object_id: consumerId,
          });
        }
      }

      // Create contacts if any
      if (data.contacts && data.contacts.length > 0) {
        for (const contact of data.contacts) {
          await contactsApi.create({
            ...contact,
            content_type: consumerContentType,
            object_id: consumerId,
          });
        }
      }

      showSnackbar("Consumer created successfully!", "success");
      navigate(`/consumers/${consumerId}`);
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.message || "Failed to create consumer",
        "error"
      );
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <Step1BasicInfo />;
      case 1:
        return <Step2Addresses />;
      case 2:
        return <Step3Contacts />;
      case 3:
        return <Step4Review />;
      default:
        return null;
    }
  };

  // Step 1: Basic Information
  const Step1BasicInfo = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Consumer Basic Information
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Please provide the basic consumer details. Fields marked with * are required.
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          required
          label="Consumer Number"
          {...register("consumer_number")}
          error={!!errors.consumer_number}
          helperText={errors.consumer_number?.message}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          required
          label="Consumer Name"
          {...register("consumer_name")}
          error={!!errors.consumer_name}
          helperText={errors.consumer_name?.message}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Father's Name"
          {...register("father_name")}
          error={!!errors.father_name}
          helperText={errors.father_name?.message}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Mother's Name"
          {...register("mother_name")}
          error={!!errors.mother_name}
          helperText={errors.mother_name?.message}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Spouse Name"
          {...register("spouse_name")}
          error={!!errors.spouse_name}
          helperText={errors.spouse_name?.message}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Ration Card Number"
          {...register("ration_card_num")}
          error={!!errors.ration_card_num}
          helperText={errors.ration_card_num?.message}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          type="number"
          label="Blue Book Number"
          {...register("blue_book")}
          error={!!errors.blue_book}
          helperText={errors.blue_book?.message}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          type="number"
          label="LPG ID"
          {...register("lpg_id")}
          error={!!errors.lpg_id}
          helperText={errors.lpg_id?.message}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth required error={!!errors.category}>
          <InputLabel>Category</InputLabel>
          <Select {...register("category")} label="Category">
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
        <FormControl fullWidth required error={!!errors.consumer_type}>
          <InputLabel>Consumer Type</InputLabel>
          <Select {...register("consumer_type")} label="Consumer Type">
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

      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!errors.bpl_type}>
          <InputLabel>BPL Type</InputLabel>
          <Select {...register("bpl_type")} label="BPL Type">
            <MenuItem value="">None</MenuItem>
            {bplTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!errors.dct_type}>
          <InputLabel>DCT Type</InputLabel>
          <Select {...register("dct_type")} label="DCT Type">
            <MenuItem value="">None</MenuItem>
            {dctTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth required error={!!errors.opting_status}>
          <InputLabel>Opting Status</InputLabel>
          <Select {...register("opting_status")} label="Opting Status">
            <MenuItem value="OPT_IN">Opted In</MenuItem>
            <MenuItem value="OPT_OUT">Opted Out</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!errors.scheme}>
          <InputLabel>Scheme</InputLabel>
          <Select {...register("scheme")} label="Scheme">
            <MenuItem value="">None</MenuItem>
            {schemes.map((scheme) => (
              <MenuItem key={scheme.id} value={scheme.id}>
                {scheme.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Controller
              name="is_kyc_done"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
          }
          label="KYC Completed"
        />
      </Grid>
    </Grid>
  );

  // Step 2: Addresses
  const Step2Addresses = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Consumer Addresses (Optional)
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Add one or more addresses for this consumer. You can skip this step and add addresses later.
      </Typography>

      {addressFields.length === 0 && (
        <Alert severity="info" sx={{ my: 2 }}>
          No addresses added yet. Click "Add Address" to add an address.
        </Alert>
      )}

      {addressFields.map((field, index) => (
        <Card key={field.id} sx={{ mb: 3, mt: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="bold">
                Address {index + 1}
              </Typography>
              <IconButton
                color="error"
                onClick={() => removeAddress(index)}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
            <Grid container spacing={2}>
              <AddressFormFields
                control={control}
                errors={errors}
                prefix={`addresses.${index}`}
              />
            </Grid>
          </CardContent>
        </Card>
      ))}

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => appendAddress({
          house_no: "",
          house_name_flat_number: "",
          housing_complex_building: "",
          street_road_name: "",
          land_mark: "",
          city_town_village: "",
          district: "",
          pin_code: "",
          address_text: "",
        })}
        sx={{ mt: 2 }}
      >
        Add Address
      </Button>
    </Box>
  );

  // Step 3: Contacts
  const Step3Contacts = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Consumer Contacts (Optional)
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Add one or more contact methods for this consumer. You can skip this step and add contacts later.
      </Typography>

      {contactFields.length === 0 && (
        <Alert severity="info" sx={{ my: 2 }}>
          No contacts added yet. Click "Add Contact" to add a contact.
        </Alert>
      )}

      {contactFields.map((field, index) => (
        <Card key={field.id} sx={{ mb: 3, mt: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="bold">
                Contact {index + 1}
              </Typography>
              <IconButton
                color="error"
                onClick={() => removeContact(index)}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
            <Grid container spacing={2}>
              <ContactFormFields
                control={control}
                errors={errors}
                prefix={`contacts.${index}`}
              />
            </Grid>
          </CardContent>
        </Card>
      ))}

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => appendContact({
          mobile_number: "",
          phone_number: "",
          email: "",
        })}
        sx={{ mt: 2 }}
      >
        Add Contact
      </Button>
    </Box>
  );

  // Step 4: Review
  const Step4Review = () => {
    const formData = getValues();

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Review & Submit
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Please review all information before submitting.
        </Typography>

        <Card sx={{ mt: 3, mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Basic Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Consumer Number:
                </Typography>
                <Typography variant="body1">{formData.consumer_number}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Consumer Name:
                </Typography>
                <Typography variant="body1">{formData.consumer_name}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Category:
                </Typography>
                <Typography variant="body1">
                  {categories.find((c) => c.id === Number(formData.category))?.name || "-"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Type:
                </Typography>
                <Typography variant="body1">
                  {types.find((t) => t.id === Number(formData.consumer_type))?.name || "-"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Opting Status:
                </Typography>
                <Typography variant="body1">{formData.opting_status}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  KYC Status:
                </Typography>
                <Typography variant="body1">
                  {formData.is_kyc_done ? "Completed" : "Pending"}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Addresses ({formData.addresses?.length || 0})
            </Typography>
            {formData.addresses && formData.addresses.length > 0 ? (
              formData.addresses.map((addr, idx) => (
                <Box key={idx} sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Address {idx + 1}:
                  </Typography>
                  <Typography variant="body1">
                    {[
                      addr.house_no,
                      addr.street_road_name,
                      addr.city_town_village,
                      addr.district,
                      addr.pin_code,
                    ]
                      .filter(Boolean)
                      .join(", ") || "Not specified"}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No addresses added
              </Typography>
            )}
          </CardContent>
        </Card>

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Contacts ({formData.contacts?.length || 0})
            </Typography>
            {formData.contacts && formData.contacts.length > 0 ? (
              formData.contacts.map((contact, idx) => (
                <Box key={idx} sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Contact {idx + 1}:
                  </Typography>
                  <Typography variant="body1">
                    {[contact.mobile_number, contact.phone_number, contact.email]
                      .filter(Boolean)
                      .join(", ") || "Not specified"}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No contacts added
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg">
      <PageHeader
        title="Create New Consumer"
        description="Follow the steps to create a new consumer"
        actions={
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate("/consumers")}
          >
            Cancel
          </Button>
        }
      />

      <Paper sx={{ p: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ minHeight: 400, mb: 4 }}>
            {renderStepContent()}
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<BackIcon />}
            >
              Back
            </Button>

            <Box sx={{ display: "flex", gap: 2 }}>
              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<NextIcon />}
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting}
                  startIcon={<SaveIcon />}
                >
                  {submitting ? "Creating..." : "Create Consumer"}
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default ConsumerCreateStepper;
