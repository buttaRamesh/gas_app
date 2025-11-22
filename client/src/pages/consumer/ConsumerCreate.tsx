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
} from '@mui/material';
import {
  Person as PersonIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  Assignment as AssignmentIcon,
  Cable as CableIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
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
  dob: string;
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

const steps = ['Personal Information', 'Identifications', 'Contact Information', 'Address Details'];

const optingStatusOptions = [
  { value: 'OPT_IN', label: 'Opt In' },
  { value: 'OPT_OUT', label: 'Opt Out' },
  { value: 'PENDING', label: 'Pending' },
];

export default function ConsumerCreate() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [createdConsumerId, setCreatedConsumerId] = useState<number | null>(null);

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
    dob: '',
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


  const handleNext = () => {
    // Validation before moving to next step
    if (activeStep === 0) {
      if (!personalInfo.consumer_name) {
        showSnackbar('Consumer name is required', 'error');
        return;
      }
    }
    // Steps 1-3: All steps are required to go through, but individual fields may be optional
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
        consumer_number: additionalInfo.consumer_number.trim() || undefined,
        person_name: personalInfo.consumer_name,
        father_name: personalInfo.father_name.trim() || undefined,
        mother_name: personalInfo.mother_name.trim() || undefined,
        spouse_name: personalInfo.spouse_name.trim() || undefined,
        dob: personalInfo.dob || undefined,
        category: additionalInfo.category && additionalInfo.category.toString().trim() ? Number(additionalInfo.category) : undefined,
        consumer_type: additionalInfo.consumer_type && additionalInfo.consumer_type.toString().trim() ? Number(additionalInfo.consumer_type) : undefined,
        blue_book: additionalInfo.blue_book && additionalInfo.blue_book.toString().trim() ? Number(additionalInfo.blue_book) : undefined,
        lpg_id: additionalInfo.lpg_id && additionalInfo.lpg_id.toString().trim() ? Number(additionalInfo.lpg_id) : undefined,
        is_kyc_done: additionalInfo.is_kyc_done,
        bpl_type: additionalInfo.bpl_type && additionalInfo.bpl_type.toString().trim() ? Number(additionalInfo.bpl_type) : undefined,
        dct_type: additionalInfo.dct_type && additionalInfo.dct_type.toString().trim() ? Number(additionalInfo.dct_type) : undefined,
        opting_status: additionalInfo.opting_status,
        scheme: additionalInfo.scheme && additionalInfo.scheme.toString().trim() ? Number(additionalInfo.scheme) : undefined,
      };

      // Add nested address if any field is filled
      const hasAddressData = Object.values(addressInfo).some(value => value.trim() !== '');
      if (hasAddressData) {
        payload.address = {
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

      // Create consumer with nested address and contact in single API call
      const response = await consumersApi.create(payload);
      setCreatedConsumerId(response.data.id);

      showSnackbar('Consumer created successfully!', 'success');
      setActiveStep(steps.length);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create consumer';
      showSnackbar(errorMessage, 'error');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setCreatedConsumerId(null);
    setPersonalInfo({
      consumer_name: '',
      father_name: '',
      mother_name: '',
      spouse_name: '',
      dob: '',
    });
    setAddressInfo({
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
    setContactInfo({
      email: '',
      phone_number: '',
      mobile_number: '',
    });
    setAdditionalInfo({
      ration_card_num: '',
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
                  Enter the consumer's personal details
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

              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={personalInfo.dob}
                onChange={(e) => setPersonalInfo({ ...personalInfo, dob: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
                InputLabelProps={{ shrink: true }}
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
                  <AssignmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Identification Documents
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Provide identification details
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
                  How can we reach this consumer? (Required)
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
                  <HomeIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Address Details
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Provide the complete address information
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

      default:
        return 'Unknown step';
    }
  };

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
          <Box sx={{ mb: 4, textAlign: 'center' }}>
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
              New Consumer Registration
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Complete all required steps to register a new consumer.
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === steps.length ? (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Consumer Created Successfully!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                The consumer has been registered in the system.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                {createdConsumerId && (
                  <Button
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => navigate(`/consumers/${createdConsumerId}`)}
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
                )}
                <Button
                  variant="contained"
                  onClick={handleReset}
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
                  Create Another Consumer
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

                <Box sx={{ display: 'flex', gap: 2 }}>
                  {activeStep === steps.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={submitting}
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
                      {submitting ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
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
              </Box>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
