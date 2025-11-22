import { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Typography,
  Paper,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Card,
  CardContent,
  Stack,
  Container,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  ArrowBack as BackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { consumersApi } from '../../services/api';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { useConsumerLookups } from '../../hooks';
import type { OptingStatus } from '../../types/consumers';
import { gradients } from '@/theme';

interface PersonalInfo {
  consumer_name: string;
  father_name: string;
  mother_name: string;
  spouse_name: string;
}

interface AddressInfo {
  house_no: string;
  house_name_flat_number: string;
  housing_complex_building: string;
  street_road_name: string;
  land_mark: string;
  city_town_village: string;
  district: string;
  pin_code: string;
  address_text: string;
}

interface ContactInfo {
  email: string;
  phone_number: string;
  mobile_number: string;
}

interface IdentificationInfo {
  ration_card_num: string;
  aadhar_num: string;
  pan_num: string;
}

interface AdditionalInfo {
  consumer_number: string;
  blue_book: string;
  lpg_id: string;
  is_kyc_done: boolean;
  category: number | string;
  consumer_type: number | string;
  bpl_type: number | string;
  dct_type: number | string;
  opting_status: OptingStatus;
  scheme: number | string;
}

const steps = ['Personal Information', 'Address Details', 'Contact Information', 'Identifications', 'Additional Details'];

const optingStatusOptions = [
  { value: 'OPT_IN', label: 'Opt In' },
  { value: 'OPT_OUT', label: 'Opt Out' },
  { value: 'PENDING', label: 'Pending' },
];

export default function ConsumerEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [existingAddressId, setExistingAddressId] = useState<number | null>(null);
  const [existingContactId, setExistingContactId] = useState<number | null>(null);
  const [existingIdentificationId, setExistingIdentificationId] = useState<number | null>(null);

  // Use centralized lookup hook
  const {
    categories,
    types,
    bplTypes,
    dctTypes,
    schemes,
    loading: lookupsLoading,
  } = useConsumerLookups();

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    consumer_name: '',
    father_name: '',
    mother_name: '',
    spouse_name: '',
  });

  const [addressInfo, setAddressInfo] = useState<AddressInfo>({
    house_no: '',
    house_name_flat_number: '',
    housing_complex_building: '',
    street_road_name: '',
    land_mark: '',
    city_town_village: '',
    district: '',
    pin_code: '',
    address_text: '',
  });

  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: '',
    phone_number: '',
    mobile_number: '',
  });

  const [identificationInfo, setIdentificationInfo] = useState<IdentificationInfo>({
    ration_card_num: '',
    aadhar_num: '',
    pan_num: '',
  });

  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfo>({
    consumer_number: '',
    blue_book: '',
    lpg_id: '',
    is_kyc_done: false,
    category: '',
    consumer_type: '',
    bpl_type: '',
    dct_type: '',
    opting_status: 'PENDING',
    scheme: '',
  });

  useEffect(() => {
    if (id) {
      fetchConsumer();
    }
  }, [id]);

  const fetchConsumer = async () => {
    try {
      setLoading(true);
      const response = await consumersApi.getById(Number(id));
      const consumer = response.data;

      // Populate personal info
      setPersonalInfo({
        consumer_name: consumer.consumer_name,
        father_name: consumer.father_name || '',
        mother_name: consumer.mother_name || '',
        spouse_name: consumer.spouse_name || '',
      });

      // Populate address info from first address
      if (consumer.addresses && consumer.addresses.length > 0) {
        const address = consumer.addresses[0];
        setExistingAddressId(address.id);
        setAddressInfo({
          house_no: '',
          house_name_flat_number: '',
          housing_complex_building: '',
          street_road_name: '',
          land_mark: '',
          city_town_village: address.city || '',
          district: '',
          pin_code: address.pin_code || '',
          address_text: address.address_text || '',
        });
      }

      // Populate contact info from first contact
      if (consumer.contacts && consumer.contacts.length > 0) {
        const contact = consumer.contacts[0];
        setExistingContactId(contact.id);
        setContactInfo({
          email: contact.email || '',
          phone_number: contact.phone_number || '',
          mobile_number: contact.mobile_number || '',
        });
      }

      // Populate identification info
      if (consumer.identification) {
        setExistingIdentificationId(consumer.identification.id);
        setIdentificationInfo({
          ration_card_num: consumer.identification.ration_card_num || '',
          aadhar_num: consumer.identification.aadhar_num || '',
          pan_num: consumer.identification.pan_num || '',
        });
      }

      // Populate additional info
      setAdditionalInfo({
        consumer_number: consumer.consumer_number,
        blue_book: consumer.blue_book ? String(consumer.blue_book) : '',
        lpg_id: consumer.lpg_id ? String(consumer.lpg_id) : '',
        is_kyc_done: consumer.is_kyc_done,
        category: consumer.category || '',
        consumer_type: consumer.consumer_type || '',
        bpl_type: consumer.bpl_type || '',
        dct_type: consumer.dct_type || '',
        opting_status: consumer.opting_status,
        scheme: consumer.scheme || '',
      });
    } catch (error) {
      showSnackbar('Failed to fetch consumer', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    // Basic validation before moving to next step
    if (activeStep === 0) {
      if (!personalInfo.consumer_name) {
        showSnackbar('Consumer name is required', 'error');
        return;
      }
    }
    if (activeStep === 4) {
      if (!additionalInfo.consumer_number) {
        showSnackbar('Consumer number is required', 'error');
        return;
      }
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      // Prepare nested payload with consumer, address, contact, and identification
      const payload: any = {
        consumer_number: additionalInfo.consumer_number,
        person_name: personalInfo.consumer_name,
        father_name: personalInfo.father_name.trim() || undefined,
        mother_name: personalInfo.mother_name.trim() || undefined,
        spouse_name: personalInfo.spouse_name.trim() || undefined,
        blue_book: additionalInfo.blue_book && additionalInfo.blue_book.toString().trim() ? Number(additionalInfo.blue_book) : undefined,
        lpg_id: additionalInfo.lpg_id && additionalInfo.lpg_id.toString().trim() ? Number(additionalInfo.lpg_id) : undefined,
        is_kyc_done: additionalInfo.is_kyc_done,
        category: Number(additionalInfo.category),
        consumer_type: Number(additionalInfo.consumer_type),
        bpl_type: additionalInfo.bpl_type && additionalInfo.bpl_type.toString().trim() ? Number(additionalInfo.bpl_type) : undefined,
        dct_type: additionalInfo.dct_type && additionalInfo.dct_type.toString().trim() ? Number(additionalInfo.dct_type) : undefined,
        opting_status: additionalInfo.opting_status,
        scheme: additionalInfo.scheme && additionalInfo.scheme.toString().trim() ? Number(additionalInfo.scheme) : undefined,
      };

      // Add nested address if any field is filled
      const hasAddressData = Object.values(addressInfo).some(value => value.trim() !== '');
      if (hasAddressData) {
        payload.address = {
          ...(existingAddressId && { id: existingAddressId }),
          house_no: addressInfo.house_no.trim() || undefined,
          house_name_flat_number: addressInfo.house_name_flat_number.trim() || undefined,
          housing_complex_building: addressInfo.housing_complex_building.trim() || undefined,
          street_road_name: addressInfo.street_road_name.trim() || undefined,
          land_mark: addressInfo.land_mark.trim() || undefined,
          city_town_village: addressInfo.city_town_village.trim() || undefined,
          district: addressInfo.district.trim() || undefined,
          pin_code: addressInfo.pin_code.trim() || undefined,
          address_text: addressInfo.address_text.trim() || undefined,
        };

        // Clean up undefined values from address
        Object.keys(payload.address).forEach(key => {
          if (payload.address[key] === undefined) {
            delete payload.address[key];
          }
        });
      }

      // Add nested contact if any field is filled
      const hasContactData = contactInfo.email || contactInfo.phone_number || contactInfo.mobile_number;
      if (hasContactData) {
        payload.contact = {
          ...(existingContactId && { id: existingContactId }),
          email: contactInfo.email.trim() || undefined,
          phone_number: contactInfo.phone_number.trim() || undefined,
          mobile_number: contactInfo.mobile_number.trim() || undefined,
        };

        // Clean up undefined values from contact
        Object.keys(payload.contact).forEach(key => {
          if (payload.contact[key] === undefined) {
            delete payload.contact[key];
          }
        });
      }

      // Add nested identification if any field is filled
      const hasIdentificationData = identificationInfo.ration_card_num || identificationInfo.aadhar_num || identificationInfo.pan_num;
      if (hasIdentificationData) {
        payload.identification = {
          ...(existingIdentificationId && { id: existingIdentificationId }),
          ration_card_num: identificationInfo.ration_card_num.trim() || undefined,
          aadhar_num: identificationInfo.aadhar_num.trim() || undefined,
          pan_num: identificationInfo.pan_num.trim() || undefined,
        };

        // Clean up undefined values from identification
        Object.keys(payload.identification).forEach(key => {
          if (payload.identification[key] === undefined) {
            delete payload.identification[key];
          }
        });
      }

      // Clean up undefined values from main payload
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      // Update consumer with nested address and contact in single API call
      await consumersApi.update(Number(id), payload);

      showSnackbar('Consumer updated successfully!', 'success');
      setUpdateSuccess(true);
      setActiveStep(steps.length);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update consumer';
      showSnackbar(errorMessage, 'error');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <Card elevation={0} sx={{ backgroundColor: 'rgba(25, 118, 210, 0.04)', mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Personal Information
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Update the consumer's personal details
                </Typography>
              </CardContent>
            </Card>

            <Stack spacing={3}>
              <TextField
                fullWidth
                required
                label="Consumer Name"
                value={personalInfo.consumer_name}
                onChange={(e) => setPersonalInfo({ ...personalInfo, consumer_name: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
              />

              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                <TextField
                  fullWidth
                  label="Father's Name"
                  value={personalInfo.father_name}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, father_name: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
                />
                <TextField
                  fullWidth
                  label="Mother's Name"
                  value={personalInfo.mother_name}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, mother_name: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
                />
                <TextField
                  fullWidth
                  label="Spouse Name"
                  value={personalInfo.spouse_name}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, spouse_name: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
                />
              </Box>
            </Stack>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Card elevation={0} sx={{ backgroundColor: 'rgba(25, 118, 210, 0.04)', mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <HomeIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Address Details
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Update address information (Note: For full address management, use the main edit form)
                </Typography>
              </CardContent>
            </Card>

            <Stack spacing={3}>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                <TextField
                  fullWidth
                  label="House Number"
                  value={addressInfo.house_no}
                  onChange={(e) => setAddressInfo({ ...addressInfo, house_no: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
                />
                <TextField
                  fullWidth
                  label="Flat or Building Name"
                  value={addressInfo.house_name_flat_number}
                  onChange={(e) => setAddressInfo({ ...addressInfo, house_name_flat_number: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                <TextField
                  fullWidth
                  label="Complex Name"
                  value={addressInfo.housing_complex_building}
                  onChange={(e) => setAddressInfo({ ...addressInfo, housing_complex_building: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
                />
                <TextField
                  fullWidth
                  label="Street Name"
                  value={addressInfo.street_road_name}
                  onChange={(e) => setAddressInfo({ ...addressInfo, street_road_name: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                <TextField
                  fullWidth
                  label="Nearby Landmark"
                  value={addressInfo.land_mark}
                  onChange={(e) => setAddressInfo({ ...addressInfo, land_mark: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
                />
                <TextField
                  fullWidth
                  label="City or Village"
                  value={addressInfo.city_town_village}
                  onChange={(e) => setAddressInfo({ ...addressInfo, city_town_village: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                <TextField
                  fullWidth
                  label="District"
                  value={addressInfo.district}
                  onChange={(e) => setAddressInfo({ ...addressInfo, district: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
                />
                <TextField
                  fullWidth
                  label="Postal Code"
                  value={addressInfo.pin_code}
                  onChange={(e) => setAddressInfo({ ...addressInfo, pin_code: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
                />
              </Box>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Full Address Text"
                value={addressInfo.address_text}
                onChange={(e) => setAddressInfo({ ...addressInfo, address_text: e.target.value })}
                placeholder="Enter the complete address in a single field"
                sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
              />
            </Stack>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Card elevation={0} sx={{ backgroundColor: 'rgba(25, 118, 210, 0.04)', mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Contact Information
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Update contact details (Note: For full contact management, use the main edit form)
                </Typography>
              </CardContent>
            </Card>

            <Stack spacing={3}>
              <TextField
                fullWidth
                type="email"
                label="Email Address"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
              />

              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                <TextField
                  fullWidth
                  label="Mobile Number"
                  value={contactInfo.mobile_number}
                  onChange={(e) => setContactInfo({ ...contactInfo, mobile_number: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
                />
                <TextField
                  fullWidth
                  label="Landline Number"
                  value={contactInfo.phone_number}
                  onChange={(e) => setContactInfo({ ...contactInfo, phone_number: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
                />
              </Box>
            </Stack>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 3 }}>
            <Card elevation={0} sx={{ backgroundColor: 'rgba(25, 118, 210, 0.04)', mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AssignmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Identification Documents
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Update identification details
                </Typography>
              </CardContent>
            </Card>

            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Ration Card Number"
                value={identificationInfo.ration_card_num}
                onChange={(e) => setIdentificationInfo({ ...identificationInfo, ration_card_num: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
              />

              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                <TextField
                  fullWidth
                  label="Aadhar Number"
                  value={identificationInfo.aadhar_num}
                  onChange={(e) => setIdentificationInfo({ ...identificationInfo, aadhar_num: e.target.value })}
                  inputProps={{ maxLength: 12 }}
                  sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
                />
                <TextField
                  fullWidth
                  label="PAN Number"
                  value={identificationInfo.pan_num}
                  onChange={(e) => setIdentificationInfo({ ...identificationInfo, pan_num: e.target.value.toUpperCase() })}
                  inputProps={{ maxLength: 10 }}
                  sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
                />
              </Box>
            </Stack>
          </Box>
        );

      case 4:
        return (
          <Box sx={{ mt: 3 }}>
            <Card elevation={0} sx={{ backgroundColor: 'rgba(25, 118, 210, 0.04)', mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AssignmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Additional Details
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Update LPG, KYC, and categorization information
                </Typography>
              </CardContent>
            </Card>

            {lookupsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Stack spacing={3}>
                <TextField
                  required
                  label="Consumer Number"
                  value={additionalInfo.consumer_number}
                  onChange={(e) => setAdditionalInfo({ ...additionalInfo, consumer_number: e.target.value })}
                  inputProps={{ maxLength: 9 }}
                  sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
                />

                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                  <TextField
                    fullWidth
                    label="Blue Book Number"
                    type="number"
                    value={additionalInfo.blue_book}
                    onChange={(e) => setAdditionalInfo({ ...additionalInfo, blue_book: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
                  />
                  <TextField
                    fullWidth
                    label="LPG ID"
                    type="number"
                    value={additionalInfo.lpg_id}
                    onChange={(e) => setAdditionalInfo({ ...additionalInfo, lpg_id: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
                  />
                </Box>

                <TextField
                  fullWidth
                  select
                  label="Opting Status"
                  value={additionalInfo.opting_status}
                  onChange={(e) => setAdditionalInfo({ ...additionalInfo, opting_status: e.target.value as OptingStatus })}
                  sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
                >
                  {optingStatusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>

                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                  <TextField
                    fullWidth
                    select
                    label="Category"
                    value={additionalInfo.category}
                    onChange={(e) => setAdditionalInfo({ ...additionalInfo, category: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
                  >
                    <MenuItem value="">Select Category</MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    fullWidth
                    select
                    label="Consumer Type"
                    value={additionalInfo.consumer_type}
                    onChange={(e) => setAdditionalInfo({ ...additionalInfo, consumer_type: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
                  >
                    <MenuItem value="">Select Type</MenuItem>
                    {types.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                  <TextField
                    fullWidth
                    select
                    label="BPL Type"
                    value={additionalInfo.bpl_type}
                    onChange={(e) => setAdditionalInfo({ ...additionalInfo, bpl_type: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
                  >
                    <MenuItem value="">None</MenuItem>
                    {bplTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    fullWidth
                    select
                    label="DCT Type"
                    value={additionalInfo.dct_type}
                    onChange={(e) => setAdditionalInfo({ ...additionalInfo, dct_type: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
                  >
                    <MenuItem value="">None</MenuItem>
                    {dctTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                <TextField
                  fullWidth
                  select
                  label="Scheme"
                  value={additionalInfo.scheme}
                  onChange={(e) => setAdditionalInfo({ ...additionalInfo, scheme: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
                >
                  <MenuItem value="">None</MenuItem>
                  {schemes.map((scheme) => (
                    <MenuItem key={scheme.id} value={scheme.id}>
                      {scheme.name}
                    </MenuItem>
                  ))}
                </TextField>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={additionalInfo.is_kyc_done}
                      onChange={(e) => setAdditionalInfo({ ...additionalInfo, is_kyc_done: e.target.checked })}
                      sx={{
                        color: 'primary.main',
                        '&.Mui-checked': { color: 'primary.main' },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      KYC Completed
                    </Typography>
                  }
                />
              </Stack>
            )}
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        height: '100vh',
        background: gradients.purple,
        py: 6,
        px: 2,
        overflow: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={8}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  background: gradients.purple,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                Update Consumer Information
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Modify consumer details across all sections
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={() => navigate(`/consumers/${id}`)}
              sx={{ position: 'absolute', top: 24, right: 24 }}
            >
              Back
            </Button>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === steps.length ? (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Consumer Updated Successfully!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                The consumer information has been updated in the system.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button
                  variant="outlined"
                  startIcon={<VisibilityIcon />}
                  onClick={() => navigate(`/consumers/${id}`)}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderColor: '#667eea',
                    color: '#667eea',
                    '&:hover': {
                      borderColor: '#5568d3',
                      backgroundColor: 'rgba(102, 126, 234, 0.04)',
                    },
                  }}
                >
                  View Consumer
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/consumers')}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    background: gradients.purple,
                    '&:hover': {
                      background: gradients.purpleHover,
                    },
                  }}
                >
                  Back to Consumers List
                </Button>
              </Stack>
            </Box>
          ) : (
            <>
              {renderStepContent(activeStep)}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 5 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{
                    px: 3,
                    py: 1.2,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
                >
                  Back
                </Button>

                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    sx={{
                      px: 4,
                      py: 1.2,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      background: gradients.purple,
                      '&:hover': {
                        background: gradients.purpleHover,
                      },
                    }}
                  >
                    {submitting ? 'Updating...' : 'Update Consumer'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{
                      px: 4,
                      py: 1.2,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      background: gradients.purple,
                      '&:hover': {
                        background: gradients.purpleHover,
                      },
                    }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
