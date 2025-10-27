import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
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
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { PageHeader } from "../components/PageHeader";
import { AddressFormFields } from "../components/AddressFormFields";
import { ContactFormFields } from "../components/ContactFormFields";
import { consumersApi, lookupsApi, schemesApi, addressesApi, contactsApi, contentTypesApi } from "../services/api";
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

const addressSchema = z.object({
  house_no: z.string().max(50).optional(),
  house_name_flat_number: z.string().max(100).optional(),
  housing_complex_building: z.string().max(200).optional(),
  street_road_name: z.string().max(200).optional(),
  land_mark: z.string().max(200).optional(),
  city_town_village: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  pin_code: z.string().max(10).optional(),
  address_text: z.string().optional(),
});

const contactSchema = z.object({
  mobile_number: z.string().max(15).optional(),
  phone_number: z.string().max(15).optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

type ConsumerFormData = z.infer<typeof consumerSchema>;
type AddressFormData = z.infer<typeof addressSchema>;
type ContactFormData = z.infer<typeof contactSchema>;

const ConsumerForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  // Lookups
  const [categories, setCategories] = useState<ConsumerCategory[]>([]);
  const [types, setTypes] = useState<ConsumerType[]>([]);
  const [bplTypes, setBplTypes] = useState<BPLType[]>([]);
  const [dctTypes, setDctTypes] = useState<DCTType[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>([]);

  // Addresses and Contacts
  const [addresses, setAddresses] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [contentTypeId, setContentTypeId] = useState<number | null>(null);

  // Dialog states
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [editingContact, setEditingContact] = useState<any | null>(null);

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

  // Address form
  const addressForm = useForm<AddressFormData>({
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
    },
  });

  // Contact form
  const contactForm = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      mobile_number: "",
      phone_number: "",
      email: "",
    },
  });

  const isKycDone = watch("is_kyc_done");

  useEffect(() => {
    fetchLookups();
    fetchContentType();
    if (isEditMode) {
      fetchConsumer();
    }
  }, [id]);

  useEffect(() => {
    if (isEditMode && contentTypeId) {
      fetchAddresses();
      fetchContacts();
    }
  }, [contentTypeId]);

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

  const fetchContentType = async () => {
    try {
      const response = await contentTypesApi.getByModel("consumer");
      setContentTypeId(response.data.content_type_id);
    } catch (error) {
      console.error("Failed to fetch content type:", error);
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

  const fetchAddresses = async () => {
    if (!id || !contentTypeId) return;
    try {
      const response = await addressesApi.getAll();
      const consumerAddresses = response.data.results.filter(
        (addr: any) => addr.object_id === Number(id) && addr.content_type === contentTypeId
      );
      setAddresses(consumerAddresses);
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    }
  };

  const fetchContacts = async () => {
    if (!id || !contentTypeId) return;
    try {
      const response = await contactsApi.getAll();
      const consumerContacts = response.data.results.filter(
        (contact: any) => contact.object_id === Number(id) && contact.content_type === contentTypeId
      );
      setContacts(consumerContacts);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
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

  // Address handlers
  const handleAddAddress = () => {
    setEditingAddress(null);
    addressForm.reset({
      house_no: "",
      house_name_flat_number: "",
      housing_complex_building: "",
      street_road_name: "",
      land_mark: "",
      city_town_village: "",
      district: "",
      pin_code: "",
      address_text: "",
    });
    setAddressDialogOpen(true);
  };

  const handleEditAddress = (address: any) => {
    setEditingAddress(address);
    addressForm.reset({
      house_no: address.house_no || "",
      house_name_flat_number: address.house_name_flat_number || "",
      housing_complex_building: address.housing_complex_building || "",
      street_road_name: address.street_road_name || "",
      land_mark: address.land_mark || "",
      city_town_village: address.city_town_village || "",
      district: address.district || "",
      pin_code: address.pin_code || "",
      address_text: address.address_text || "",
    });
    setAddressDialogOpen(true);
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      await addressesApi.delete(addressId);
      showSnackbar("Address deleted successfully", "success");
      fetchAddresses();
    } catch (error) {
      showSnackbar("Failed to delete address", "error");
      console.error(error);
    }
  };

  const handleSaveAddress = async (data: AddressFormData) => {
    if (!contentTypeId || !id) return;
    try {
      const payload = {
        ...data,
        content_type: contentTypeId,
        object_id: Number(id),
      };

      if (editingAddress) {
        await addressesApi.update(editingAddress.id, payload);
        showSnackbar("Address updated successfully", "success");
      } else {
        await addressesApi.create(payload);
        showSnackbar("Address added successfully", "success");
      }

      setAddressDialogOpen(false);
      fetchAddresses();
    } catch (error) {
      showSnackbar("Failed to save address", "error");
      console.error(error);
    }
  };

  // Contact handlers
  const handleAddContact = () => {
    setEditingContact(null);
    contactForm.reset({
      mobile_number: "",
      phone_number: "",
      email: "",
    });
    setContactDialogOpen(true);
  };

  const handleEditContact = (contact: any) => {
    setEditingContact(contact);
    contactForm.reset({
      mobile_number: contact.mobile_number || "",
      phone_number: contact.phone_number || "",
      email: contact.email || "",
    });
    setContactDialogOpen(true);
  };

  const handleDeleteContact = async (contactId: number) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;
    try {
      await contactsApi.delete(contactId);
      showSnackbar("Contact deleted successfully", "success");
      fetchContacts();
    } catch (error) {
      showSnackbar("Failed to delete contact", "error");
      console.error(error);
    }
  };

  const handleSaveContact = async (data: ContactFormData) => {
    if (!contentTypeId || !id) return;
    try {
      const payload = {
        ...data,
        content_type: contentTypeId,
        object_id: Number(id),
      };

      if (editingContact) {
        await contactsApi.update(editingContact.id, payload);
        showSnackbar("Contact updated successfully", "success");
      } else {
        await contactsApi.create(payload);
        showSnackbar("Contact added successfully", "success");
      }

      setContactDialogOpen(false);
      fetchContacts();
    } catch (error) {
      showSnackbar("Failed to save contact", "error");
      console.error(error);
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

      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)} sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tab label="Basic Information" />
          {isEditMode && <Tab label={`Addresses (${addresses.length})`} />}
          {isEditMode && <Tab label={`Contacts (${contacts.length})`} />}
        </Tabs>
      </Paper>

      {currentTab === 0 && (
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
      )}

      {/* Addresses Tab */}
      {currentTab === 1 && isEditMode && (
        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h6">Addresses</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddAddress}>
              Add Address
            </Button>
          </Box>

          {addresses.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
              No addresses added yet. Click "Add Address" to create one.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {addresses.map((address) => (
                <Grid item xs={12} md={6} key={address.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ mb: 2 }}>
                        {address.house_no && (
                          <Typography variant="body2">
                            <strong>House No:</strong> {address.house_no}
                          </Typography>
                        )}
                        {address.house_name_flat_number && (
                          <Typography variant="body2">
                            <strong>House Name/Flat:</strong> {address.house_name_flat_number}
                          </Typography>
                        )}
                        {address.housing_complex_building && (
                          <Typography variant="body2">
                            <strong>Building:</strong> {address.housing_complex_building}
                          </Typography>
                        )}
                        {address.street_road_name && (
                          <Typography variant="body2">
                            <strong>Street/Road:</strong> {address.street_road_name}
                          </Typography>
                        )}
                        {address.land_mark && (
                          <Typography variant="body2">
                            <strong>Landmark:</strong> {address.land_mark}
                          </Typography>
                        )}
                        {address.city_town_village && (
                          <Typography variant="body2">
                            <strong>City/Town:</strong> {address.city_town_village}
                          </Typography>
                        )}
                        {address.district && (
                          <Typography variant="body2">
                            <strong>District:</strong> {address.district}
                          </Typography>
                        )}
                        {address.pin_code && (
                          <Typography variant="body2">
                            <strong>PIN Code:</strong> {address.pin_code}
                          </Typography>
                        )}
                        {address.address_text && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {address.address_text}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                    <CardActions>
                      <IconButton size="small" color="primary" onClick={() => handleEditAddress(address)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteAddress(address.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      )}

      {/* Contacts Tab */}
      {currentTab === 2 && isEditMode && (
        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h6">Contacts</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddContact}>
              Add Contact
            </Button>
          </Box>

          {contacts.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
              No contacts added yet. Click "Add Contact" to create one.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {contacts.map((contact) => (
                <Grid item xs={12} md={6} key={contact.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ mb: 2 }}>
                        {contact.mobile_number && (
                          <Typography variant="body2">
                            <strong>Mobile:</strong> {contact.mobile_number}
                          </Typography>
                        )}
                        {contact.phone_number && (
                          <Typography variant="body2">
                            <strong>Phone:</strong> {contact.phone_number}
                          </Typography>
                        )}
                        {contact.email && (
                          <Typography variant="body2">
                            <strong>Email:</strong> {contact.email}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                    <CardActions>
                      <IconButton size="small" color="primary" onClick={() => handleEditContact(contact)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteContact(contact.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      )}

      {/* Address Dialog */}
      <Dialog open={addressDialogOpen} onClose={() => setAddressDialogOpen(false)} maxWidth="md" fullWidth>
        <form onSubmit={addressForm.handleSubmit(handleSaveAddress)}>
          <DialogTitle>{editingAddress ? "Edit Address" : "Add Address"}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <AddressFormFields
                control={addressForm.control}
                errors={addressForm.formState.errors}
              />
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddressDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onClose={() => setContactDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={contactForm.handleSubmit(handleSaveContact)}>
          <DialogTitle>{editingContact ? "Edit Contact" : "Add Contact"}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <ContactFormFields
                control={contactForm.control}
                errors={contactForm.formState.errors}
              />
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setContactDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default ConsumerForm;
