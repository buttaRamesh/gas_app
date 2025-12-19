import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Container,
  TextField,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Tooltip,
  Button,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  ArrowBack as BackIcon,
  Route as RouteIcon,
  Add as AddIcon,
  Cable as ConnectionIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { consumersApi, connectionsApi } from '../../services/api';
import { useSnackbar } from '../../contexts/SnackbarContext';
import type { ConsumerDetail as ConsumerDetailType, ConsumerRouteInfo, Address, Contact, ConnectionDetails, Identification } from '../../types/consumers';

// Define LookupItem type
interface LookupItem {
  id: number;
  name: string;
}
import { FormDialog, DetailInfoRow, GradientButton } from '../../components/common';
import { PersonalInfoFields, IdentificationFields, PersonalInfoData, IdentificationData } from '../../components/forms';
import { useConsumerLookups } from '../../hooks';
import { gradients } from '@/theme';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ConsumerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [value, setValue] = useState(0);
  const [consumer, setConsumer] = useState<ConsumerDetailType | null>(null);
  const [routeInfo, setRouteInfo] = useState<ConsumerRouteInfo | null>(null);
  const [connections, setConnections] = useState<ConnectionDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [routeLoading, setRouteLoading] = useState(true);
  const [connectionsLoading, setConnectionsLoading] = useState(false);

  // Use centralized lookup hook for all lookup data
  const {
    categories,
    types: consumerTypes,
    bplTypes,
    dctTypes,
    schemes,
    connectionTypes,
    products,
    routes,
    loading: lookupsLoading,
  } = useConsumerLookups({
    includeConnectionTypes: true,
    includeProducts: true,
    includeRoutes: true,
  });

  // Dialog states for each tab
  const [personalDialogOpen, setPersonalDialogOpen] = useState(false);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [identificationDialogOpen, setIdentificationDialogOpen] = useState(false);
  const [additionalDialogOpen, setAdditionalDialogOpen] = useState(false);
  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false);
  const [routeDialogOpen, setRouteDialogOpen] = useState(false);
  const [editingConnectionId, setEditingConnectionId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Route assignment
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);

  // Form data for each section
  const [personalData, setPersonalData] = useState({
    person_name: '',
    father_name: '',
    mother_name: '',
    spouse_name: '',
    dob: '',
  });

  const [addressData, setAddressData] = useState<Partial<Address>>({
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

  const [contactData, setContactData] = useState<Partial<Contact>>({
    email: '',
    mobile_number: '',
    phone_number: '',
  });

  const [identificationData, setIdentificationData] = useState<Partial<Identification>>({
    ration_card_num: '',
    aadhar_num: '',
    pan_num: '',
  });

  const [additionalData, setAdditionalData] = useState({
    consumer_number: '',
    blue_book: '',
    lpg_id: '',
    category: 0,
    consumer_type: 0,
    bpl_type: 0,
    dct_type: 0,
    scheme: 0,
  });

  const [connectionData, setConnectionData] = useState({
    sv_number: '',
    sv_date: '',
    connection_type: 0,
    product: 0,
    product_size: '',
    num_of_regulators: 1,
    hist_code_description: '',
  });

  useEffect(() => {
    if (id) {
      fetchConsumer();
      fetchRouteInfo();
      fetchConnections();
    }
  }, [id]);

  // Update form data when consumer data is loaded
  useEffect(() => {
    if (consumer) {
      setPersonalData({
        person_name: consumer.consumer_name || '',
        father_name: consumer.father_name || '',
        mother_name: consumer.mother_name || '',
        dob: consumer.dob || '',
        spouse_name: consumer.spouse_name || '',
      });

      if (consumer.addresses.length > 0) {
        const addr = consumer.addresses[0];
        setAddressData({
          id: addr.id,
          house_no: addr.house_no || '',
          house_name_flat_number: addr.house_name_flat_number || '',
          housing_complex_building: addr.housing_complex_building || '',
          street_road_name: addr.street_road_name || '',
          land_mark: addr.land_mark || '',
          city_town_village: addr.city_town_village || '',
          district: addr.district || '',
          pin_code: addr.pin_code || '',
          address_text: addr.address_text || '',
        });
      }

      if (consumer.contacts.length > 0) {
        setContactData({
          id: consumer.contacts[0].id,
          email: consumer.contacts[0].email || '',
          mobile_number: consumer.contacts[0].mobile_number || '',
          phone_number: consumer.contacts[0].phone_number || '',
        });
      }

      if (consumer.identification) {
        setIdentificationData({
          id: consumer.identification.id,
          ration_card_num: consumer.identification.ration_card_num || '',
          aadhar_num: consumer.identification.aadhar_num || '',
          pan_num: consumer.identification.pan_num || '',
        });
      }

      setAdditionalData({
        consumer_number: consumer.consumer_number || '',
        blue_book: consumer.blue_book?.toString() || '',
        lpg_id: consumer.lpg_id?.toString() || '',
        category: consumer.category || 0,
        consumer_type: consumer.consumer_type || 0,
        bpl_type: consumer.bpl_type || 0,
        dct_type: consumer.dct_type || 0,
        scheme: consumer.scheme || 0,
      });
    }
  }, [consumer]);

  const fetchConsumer = async () => {
    try {
      setLoading(true);
      const response = await consumersApi.getById(Number(id));
      setConsumer(response.data);
      console.log(response.data)
    } catch (error) {
      showSnackbar('Failed to fetch consumer details', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRouteInfo = async () => {
    try {
      setRouteLoading(true);
      const response = await consumersApi.getRoute(Number(id));
      setRouteInfo(response.data);
    } catch (error) {
      console.log('No route assigned to this consumer');
    } finally {
      setRouteLoading(false);
    }
  };

  const fetchConnections = async () => {
    try {
      setConnectionsLoading(true);
      const response = await connectionsApi.getByConsumer(Number(id));
      setConnections(response.data);
    } catch (error) {
      console.log('No connections found for this consumer');
      setConnections([]);
    } finally {
      setConnectionsLoading(false);
    }
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleKycToggle = async () => {
    if (!consumer) return;

    try {
      const response = await consumersApi.updateKycStatus(consumer.id, !consumer.is_kyc_done);
      setConsumer(response.data);
      showSnackbar(
        `KYC status updated to ${!consumer.is_kyc_done ? 'Done' : 'Pending'}`,
        'success'
      );
    } catch (error) {
      showSnackbar('Failed to update KYC status', 'error');
      console.error(error);
    }
  };

  const handleSavePersonal = async () => {
    if (!consumer) return;

    try {
      setSaving(true);
      const payload = {
        consumer_number: consumer.consumer_number,
        person_name: personalData.person_name,
        father_name: personalData.father_name || undefined,
        mother_name: personalData.mother_name || undefined,
        spouse_name: personalData.spouse_name || undefined,
        dob: personalData.dob || undefined,
        category: consumer.category,
        consumer_type: consumer.consumer_type,
        is_kyc_done: consumer.is_kyc_done,
        opting_status: consumer.opting_status,
      };

      await consumersApi.update(consumer.id, payload);
      // Refetch consumer data to get all display fields
      await fetchConsumer();
      setPersonalDialogOpen(false);
      showSnackbar('Personal information updated successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to update personal information', 'error');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!consumer) return;

    try {
      setSaving(true);
      const payload = {
        consumer_number: consumer.consumer_number,
        person_name: consumer.consumer_name,
        category: consumer.category,
        consumer_type: consumer.consumer_type,
        is_kyc_done: consumer.is_kyc_done,
        opting_status: consumer.opting_status,
        address: {
          id: addressData.id,
          house_no: addressData.house_no || undefined,
          house_name_flat_number: addressData.house_name_flat_number || undefined,
          housing_complex_building: addressData.housing_complex_building || undefined,
          street_road_name: addressData.street_road_name || undefined,
          land_mark: addressData.land_mark || undefined,
          city_town_village: addressData.city_town_village || undefined,
          district: addressData.district || undefined,
          pin_code: addressData.pin_code || undefined,
          address_text: addressData.address_text || undefined,
        },
      };

      await consumersApi.update(consumer.id, payload);
      // Refetch consumer data to get all display fields
      await fetchConsumer();
      setAddressDialogOpen(false);
      showSnackbar('Address updated successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to update address', 'error');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveContact = async () => {
    if (!consumer) return;

    try {
      setSaving(true);
      const payload = {
        consumer_number: consumer.consumer_number,
        person_name: consumer.consumer_name,
        category: consumer.category,
        consumer_type: consumer.consumer_type,
        is_kyc_done: consumer.is_kyc_done,
        opting_status: consumer.opting_status,
        contact: {
          id: contactData.id,
          email: contactData.email || undefined,
          mobile_number: contactData.mobile_number || undefined,
          phone_number: contactData.phone_number || undefined,
        },
      };

      await consumersApi.update(consumer.id, payload);
      // Refetch consumer data to get all display fields
      await fetchConsumer();
      setContactDialogOpen(false);
      showSnackbar('Contact information updated successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to update contact information', 'error');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveIdentification = async () => {
    if (!consumer) return;

    try {
      setSaving(true);
      const payload = {
        consumer_number: consumer.consumer_number,
        person_name: consumer.consumer_name,
        is_kyc_done: consumer.is_kyc_done,
        opting_status: consumer.opting_status,
        identification: {
          id: consumer.identification?.id,
          ration_card_num: identificationData.ration_card_num || undefined,
          aadhar_num: identificationData.aadhar_num || undefined,
          pan_num: identificationData.pan_num || undefined,
        },
      };

      await consumersApi.update(consumer.id, payload);
      // Refetch consumer data to get all display fields
      await fetchConsumer();
      setIdentificationDialogOpen(false);
      showSnackbar('Identification details updated successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to update identification details', 'error');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAdditional = async () => {
    if (!consumer) return;

    try {
      setSaving(true);
      const payload = {
        consumer_number: additionalData.consumer_number || consumer.consumer_number,
        person_name: consumer.consumer_name,
        category: additionalData.category || undefined,
        consumer_type: additionalData.consumer_type || undefined,
        bpl_type: additionalData.bpl_type || undefined,
        dct_type: additionalData.dct_type || undefined,
        scheme: additionalData.scheme || undefined,
        is_kyc_done: consumer.is_kyc_done,
        opting_status: consumer.opting_status,
        blue_book: additionalData.blue_book ? parseInt(additionalData.blue_book) : undefined,
        lpg_id: additionalData.lpg_id ? parseInt(additionalData.lpg_id) : undefined,
      };

      await consumersApi.update(consumer.id, payload);
      // Refetch consumer data to get all display fields
      await fetchConsumer();
      setAdditionalDialogOpen(false);
      showSnackbar('Additional details updated successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to update additional details', 'error');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenConnectionDialog = (connection?: ConnectionDetails) => {
    if (connection) {
      // Edit mode
      setEditingConnectionId(connection.id);
      setConnectionData({
        sv_number: connection.sv_number || '',
        sv_date: connection.sv_date || '',
        connection_type: connection.connection_type || 0,
        product: connection.product || 0,
        product_size: connection.product_size?.toString() || '',
        num_of_regulators: connection.num_of_regulators || 1,
        hist_code_description: connection.hist_code_description || '',
      });
    } else {
      // Add mode
      setEditingConnectionId(null);
      setConnectionData({
        sv_number: '',
        sv_date: new Date().toISOString().split('T')[0],
        connection_type: 0,
        product: 0,
        product_size: '',
        num_of_regulators: 1,
        hist_code_description: '',
      });
    }
    setConnectionDialogOpen(true);
  };

  const handleCloseConnectionDialog = () => {
    setConnectionDialogOpen(false);
    setEditingConnectionId(null);
    setConnectionData({
      sv_number: '',
      sv_date: '',
      connection_type: 0,
      product: 0,
      product_size: '',
      num_of_regulators: 1,
      hist_code_description: '',
    });
  };

  const handleSaveConnection = async () => {
    if (!consumer) return;

    // Validation
    if (!connectionData.sv_number || !connectionData.sv_date || !connectionData.connection_type || !connectionData.product) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        consumer: consumer.id,
        sv_number: connectionData.sv_number,
        sv_date: connectionData.sv_date,
        connection_type: connectionData.connection_type,
        product: connectionData.product,
        product_size: connectionData.product_size ? parseFloat(connectionData.product_size) : undefined,
        num_of_regulators: connectionData.num_of_regulators,
        hist_code_description: connectionData.hist_code_description || undefined,
      };

      if (editingConnectionId) {
        // Update existing connection
        await connectionsApi.update(editingConnectionId, payload);
        showSnackbar('Connection updated successfully', 'success');
      } else {
        // Create new connection
        await connectionsApi.create(payload);
        showSnackbar('Connection added successfully', 'success');
      }

      handleCloseConnectionDialog();
      // Refresh connections
      await fetchConnections();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Failed to save connection';
      showSnackbar(errorMessage, 'error');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConnection = async (connectionId: number) => {
    if (!window.confirm('Are you sure you want to delete this connection?')) {
      return;
    }

    try {
      await connectionsApi.delete(connectionId);
      showSnackbar('Connection deleted successfully', 'success');
      // Refresh connections
      await fetchConnections();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Failed to delete connection';
      showSnackbar(errorMessage, 'error');
      console.error(error);
    }
  };

  const handleCloseDialog = (section: 'personal' | 'address' | 'contact' | 'identification' | 'additional') => {
    switch (section) {
      case 'personal':
        setPersonalDialogOpen(false);
        if (consumer) {
          setPersonalData({
            person_name: consumer.consumer_name || '',
            father_name: consumer.father_name || '',
            mother_name: consumer.mother_name || '',
            dob: consumer.dob || '',
            spouse_name: consumer.spouse_name || '',
          });
        }
        break;
      case 'address':
        setAddressDialogOpen(false);
        if (consumer && consumer.addresses.length > 0) {
          const addr = consumer.addresses[0];
          setAddressData({
            id: addr.id,
            house_no: addr.house_no || '',
            house_name_flat_number: addr.house_name_flat_number || '',
            housing_complex_building: addr.housing_complex_building || '',
            street_road_name: addr.street_road_name || '',
            land_mark: addr.land_mark || '',
            city_town_village: addr.city_town_village || '',
            district: addr.district || '',
            pin_code: addr.pin_code || '',
            address_text: addr.address_text || '',
          });
        }
        break;
      case 'contact':
        setContactDialogOpen(false);
        if (consumer && consumer.contacts.length > 0) {
          setContactData({
            id: consumer.contacts[0].id,
            email: consumer.contacts[0].email || '',
            mobile_number: consumer.contacts[0].mobile_number || '',
            phone_number: consumer.contacts[0].phone_number || '',
          });
        }
        break;
      case 'identification':
        setIdentificationDialogOpen(false);
        if (consumer && consumer.identification) {
          setIdentificationData({
            id: consumer.identification.id,
            ration_card_num: consumer.identification.ration_card_num || '',
            aadhar_num: consumer.identification.aadhar_num || '',
            pan_num: consumer.identification.pan_num || '',
          });
        }
        break;
      case 'additional':
        setAdditionalDialogOpen(false);
        if (consumer) {
          setAdditionalData({
            consumer_number: consumer.consumer_number || '',
            blue_book: consumer.blue_book?.toString() || '',
            lpg_id: consumer.lpg_id?.toString() || '',
            category: consumer.category || 0,
            consumer_type: consumer.consumer_type || 0,
            bpl_type: consumer.bpl_type || 0,
            dct_type: consumer.dct_type || 0,
            scheme: consumer.scheme || 0,
          });
        }
        break;
    }
  };

  const handleSaveRoute = async () => {
    if (!selectedRouteId) {
      showSnackbar('Please select a route', 'error');
      return;
    }

    try {
      setSaving(true);

      // Check if route is currently assigned
      if (routeInfo) {
        // Update existing route
        await consumersApi.updateRoute(Number(id), selectedRouteId);
        showSnackbar('Route updated successfully', 'success');
      } else {
        // Assign new route
        await consumersApi.assignRoute(Number(id), selectedRouteId);
        showSnackbar('Route assigned successfully', 'success');
      }

      // Refresh route info
      const response = await consumersApi.getRoute(Number(id));
      setRouteInfo(response.data);
      setRouteDialogOpen(false);
    } catch (error: any) {
      console.error('Failed to save route:', error);
      showSnackbar(error.response?.data?.error || 'Failed to save route', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseRouteDialog = () => {
    setRouteDialogOpen(false);
    setSelectedRouteId(routeInfo?.route_id || null);
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
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

  if (!consumer) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error">Consumer not found</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f8f9ff 0%, #f0f2ff 100%)', py: 4, px: 2 }}>
      <Paper
        elevation={0}
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 20px 60px -15px rgba(102, 126, 234, 0.25)',
          border: '1px solid rgba(102, 126, 234, 0.1)'
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: gradients.primary,
            p: 2.5,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%)',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'rgba(255,255,255,0.25)',
                  backdropFilter: 'blur(10px)',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'white',
                  border: '3px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}
              >
                {getInitials(consumer.consumer_name)}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'white', letterSpacing: '-0.3px' }}>
                  {consumer.consumer_name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mt: 0.3, fontWeight: 500 }}>
                  ID: {consumer.consumer_number || 'Pending'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              {consumer.type_name && (
                <Chip
                  label={consumer.type_name}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.25)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    fontWeight: 600,
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' }
                  }}
                  size="small"
                />
              )}
              {consumer.category_name && (
                <Chip
                  label={consumer.category_name}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.25)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    fontWeight: 600,
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' }
                  }}
                  size="small"
                />
              )}
              {connections.length > 0 && (
                <Chip
                  label={`${connections.length} Connection${connections.length > 1 ? 's' : ''}`}
                  sx={{
                    bgcolor: 'rgba(76,175,80,0.9)',
                    color: 'white',
                    fontWeight: 600,
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': { bgcolor: 'rgba(76,175,80,1)' }
                  }}
                  size="small"
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 2, borderColor: 'rgba(102, 126, 234, 0.1)', bgcolor: 'white' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 2,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                minHeight: 64,
                '&:hover': {
                  color: 'hsl(262 83% 58%)',
                },
                '&.Mui-selected': {
                  color: 'hsl(262 83% 58%)',
                }
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                background: gradients.primary,
              }
            }}
          >
            <Tab label="Personal" icon={<PersonIcon />} iconPosition="start" />
            <Tab label="Address" icon={<HomeIcon />} iconPosition="start" />
            <Tab label="Contact" icon={<PhoneIcon />} iconPosition="start" />
            <Tab label="Identifications" icon={<AssignmentIcon />} iconPosition="start" />
            <Tab label="Additional" icon={<AssignmentIcon />} iconPosition="start" />
            <Tab label="Connections" icon={<ConnectionIcon />} iconPosition="start" />
            <Tab label="Route" icon={<RouteIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Box sx={{ bgcolor: 'white', px: 3 }}>
          <TabPanel value={value} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <Button
                startIcon={<EditIcon />}
                variant="contained"
                onClick={() => setPersonalDialogOpen(true)}
                sx={{
                  background: gradients.primary,
                  color: 'white',
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                    background: gradients.primaryHover,
                  }
                }}
              >
                Edit Personal Info
              </Button>
            </Box>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 3,
                border: '1px solid rgba(102, 126, 234, 0.15)',
                boxShadow: '0 2px 12px rgba(102, 126, 234, 0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <CardContent>
                <DetailInfoRow label="Consumer Number" value={consumer.consumer_number} showDivider />
                <DetailInfoRow label="Consumer Name" value={consumer.consumer_name} showDivider />
                <DetailInfoRow label="Father's Name" value={consumer.father_name} showDivider />
                <DetailInfoRow label="Mother's Name" value={consumer.mother_name} showDivider />
                <DetailInfoRow label="Spouse Name" value={consumer.spouse_name} showDivider />
                <DetailInfoRow label="Date of Birth" value={consumer.dob ? new Date(consumer.dob).toLocaleDateString() : '-'} />
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={value} index={1}>
            {consumer.addresses.length > 0 ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                  <Button
                    startIcon={<EditIcon />}
                    variant="contained"
                    onClick={() => {
                      const addr = consumer.addresses[0];
                      setAddressData({
                        id: addr.id,
                        house_no: addr.house_no || '',
                        house_name_flat_number: addr.house_name_flat_number || '',
                        housing_complex_building: addr.housing_complex_building || '',
                        street_road_name: addr.street_road_name || '',
                        land_mark: addr.land_mark || '',
                        city_town_village: addr.city_town_village || '',
                        district: addr.district || '',
                        pin_code: addr.pin_code || '',
                        address_text: addr.address_text || '',
                      });
                      setAddressDialogOpen(true);
                    }}
                    sx={{
                      background: gradients.primary,
                      color: 'white',
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                        background: gradients.primaryHover,
                      }
                    }}
                  >
                    Edit Address
                  </Button>
                </Box>
                {consumer.addresses[0].address_text && (
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: 3,
                      mb: 2,
                      border: '1px solid rgba(102, 126, 234, 0.15)',
                      boxShadow: '0 2px 12px rgba(102, 126, 234, 0.08)'
                    }}
                  >
                    <CardContent sx={{ bgcolor: 'linear-gradient(to bottom, #f8f9ff, #ffffff)', p: 3 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary', lineHeight: 1.8 }}>
                        {consumer.addresses[0].address_text}
                      </Typography>
                    </CardContent>
                  </Card>
                )}
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    border: '1px solid rgba(102, 126, 234, 0.15)',
                    boxShadow: '0 2px 12px rgba(102, 126, 234, 0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <CardContent>
                    <DetailInfoRow label="House/Door No" value={consumer.addresses[0].house_no} showDivider />
                    <DetailInfoRow label="House Name/Flat Number" value={consumer.addresses[0].house_name_flat_number} showDivider />
                    <DetailInfoRow label="Housing Complex/Building" value={consumer.addresses[0].housing_complex_building} showDivider />
                    <DetailInfoRow label="Street/Road Name" value={consumer.addresses[0].street_road_name} showDivider />
                    <DetailInfoRow label="Landmark" value={consumer.addresses[0].land_mark} showDivider />
                    <DetailInfoRow label="City/Town/Village" value={consumer.addresses[0].city_town_village} showDivider />
                    <DetailInfoRow label="District" value={consumer.addresses[0].district} showDivider />
                    <DetailInfoRow label="Pin Code" value={consumer.addresses[0].pin_code} />
                  </CardContent>
                </Card>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" sx={{ color: 'text.secondary', mb: 3, fontWeight: 500 }}>
                  No address information available
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  onClick={() => {
                    setAddressData({
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
                    setAddressDialogOpen(true);
                  }}
                  sx={{
                    background: gradients.primary,
                    color: 'white',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                      background: gradients.primaryHover,
                    }
                  }}
                >
                  Add Address
                </Button>
              </Box>
            )}
          </TabPanel>

          <TabPanel value={value} index={2}>
            {consumer.contacts.length > 0 ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                  <Button
                    startIcon={<EditIcon />}
                    variant="contained"
                    onClick={() => setContactDialogOpen(true)}
                    sx={{
                      background: gradients.primary,
                      color: 'white',
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                        background: gradients.primaryHover,
                      }
                    }}
                  >
                    Edit Contact
                  </Button>
                </Box>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    border: '1px solid rgba(102, 126, 234, 0.15)',
                    boxShadow: '0 2px 12px rgba(102, 126, 234, 0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <CardContent>
                    <DetailInfoRow label="Email Address" value={consumer.contacts[0].email || '-'} showDivider />
                    <DetailInfoRow label="Mobile Number" value={consumer.contacts[0].mobile_number || '-'} showDivider />
                    <DetailInfoRow label="Landline Number" value={consumer.contacts[0].phone_number || '-'} />
                  </CardContent>
                </Card>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" sx={{ color: 'text.secondary', mb: 3, fontWeight: 500 }}>
                  No contact information available
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  onClick={() => {
                    setContactData({ email: '', mobile_number: '', phone_number: '' });
                    setContactDialogOpen(true);
                  }}
                  sx={{
                    background: gradients.primary,
                    color: 'white',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                      background: gradients.primaryHover,
                    }
                  }}
                >
                  Add Contact
                </Button>
              </Box>
            )}
          </TabPanel>

          <TabPanel value={value} index={3}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <Button
                startIcon={<EditIcon />}
                variant="contained"
                onClick={() => setIdentificationDialogOpen(true)}
                sx={{
                  background: gradients.primary,
                  color: 'white',
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                    background: gradients.primaryHover,
                  }
                }}
              >
                Edit Identifications
              </Button>
            </Box>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 3,
                border: '1px solid rgba(102, 126, 234, 0.15)',
                boxShadow: '0 2px 12px rgba(102, 126, 234, 0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <CardContent>
                <DetailInfoRow label="Ration Card Number" value={consumer.identification?.ration_card_num || '-'} showDivider />
                <DetailInfoRow label="Aadhar Number" value={consumer.identification?.aadhar_num || '-'} showDivider />
                <DetailInfoRow label="PAN Number" value={consumer.identification?.pan_num || '-'} />
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={value} index={4}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <Button
                startIcon={<EditIcon />}
                variant="contained"
                onClick={() => setAdditionalDialogOpen(true)}
                sx={{
                  background: gradients.primary,
                  color: 'white',
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                    background: gradients.primaryHover,
                  }
                }}
              >
                Edit Additional Info
              </Button>
            </Box>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 3,
                border: '1px solid rgba(102, 126, 234, 0.15)',
                boxShadow: '0 2px 12px rgba(102, 126, 234, 0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <CardContent>
                <DetailInfoRow label="Consumer Number" value={consumer.consumer_number || '-'} showDivider />
                <DetailInfoRow label="Blue Book Number" value={consumer.blue_book || '-'} showDivider />
                <DetailInfoRow label="LPG ID" value={consumer.lpg_id || '-'} showDivider />
                <Box sx={{ display: 'flex', py: 1.5, alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ minWidth: 160, fontWeight: 600, color: 'text.secondary' }}>
                    KYC Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {consumer.is_kyc_done ? (
                      <>
                        <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'success.main' }}>
                          Completed
                        </Typography>
                      </>
                    ) : (
                      <>
                        <CancelIcon sx={{ color: 'error.main', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'error.main' }}>
                          Not Completed
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>
                <Divider />
                <DetailInfoRow label="Category" value={consumer.category_name || '-'} showDivider />
                <DetailInfoRow label="Consumer Type" value={consumer.type_name || '-'} showDivider />
                <DetailInfoRow label="BPL Type" value={consumer.bpl_type_name || '-'} showDivider />
                <DetailInfoRow label="DCT Type" value={consumer.dct_type_name || '-'} showDivider />
                <DetailInfoRow label="Scheme" value={consumer.scheme_name || '-'} />
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={value} index={5}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                onClick={() => handleOpenConnectionDialog()}
                sx={{
                  background: gradients.primary,
                  color: 'white',
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                    background: gradients.primaryHover,
                  }
                }}
              >
                Add Connection
              </Button>
            </Box>
            {connectionsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : connections.length > 0 ? (
              <TableContainer
                component={Card}
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  border: '1px solid rgba(102, 126, 234, 0.15)',
                  boxShadow: '0 2px 12px rgba(102, 126, 234, 0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
                  }
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 700 }}>SV Number</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>SV Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Connection Type</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Regulators</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {connections.map((connection) => (
                      <TableRow key={connection.id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{connection.sv_number}</TableCell>
                        <TableCell>{new Date(connection.sv_date).toLocaleDateString()}</TableCell>
                        <TableCell>{connection.connection_type_name}</TableCell>
                        <TableCell>
                          {connection.product_code} - {connection.product_category_name} {connection.product_quantity} {connection.product_unit?.toUpperCase()} ({connection.product_variant_name})
                        </TableCell>
                        <TableCell>{connection.num_of_regulators}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenConnectionDialog(connection)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteConnection(connection.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" sx={{ color: 'text.secondary', mb: 3, fontWeight: 500 }}>
                  No connections available
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  onClick={() => handleOpenConnectionDialog()}
                  sx={{
                    background: gradients.primary,
                    color: 'white',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                      background: gradients.primaryHover,
                    }
                  }}
                >
                  Add Connection
                </Button>
              </Box>
            )}
          </TabPanel>

          <TabPanel value={value} index={6}>
            {routeLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : routeInfo ? (
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Area Code
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          {routeInfo.route_code}
                        </Typography>
                      </Box>
                      <Divider orientation="vertical" flexItem />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Description
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {routeInfo.route_description}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setSelectedRouteId(routeInfo.route_id);
                        setRouteDialogOpen(true);
                      }}
                      sx={{
                        borderColor: '#667eea',
                        color: '#667eea',
                        '&:hover': {
                          borderColor: '#5568d3',
                          backgroundColor: 'rgba(102, 126, 234, 0.04)',
                        },
                      }}
                    >
                      Change Route
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  No route assigned to this consumer
                </Alert>
                {!consumer?.consumer_number && (
                  <Alert severity="warning" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
                    Consumer number is required before assigning a route. Please add the consumer number in Additional Info tab first.
                  </Alert>
                )}
                <Tooltip
                  title={!consumer?.consumer_number ? "Consumer number is required to assign a route" : ""}
                  arrow
                >
                  <span>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      disabled={!consumer?.consumer_number}
                      onClick={() => {
                        setSelectedRouteId(null);
                        setRouteDialogOpen(true);
                      }}
                      sx={{
                        px: 4,
                        py: 1.2,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                        background: consumer?.consumer_number
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : 'rgba(0, 0, 0, 0.12)',
                        '&:hover': consumer?.consumer_number ? {
                          background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                        } : {},
                        '&.Mui-disabled': {
                          color: 'rgba(0, 0, 0, 0.26)',
                        }
                      }}
                    >
                      Assign Route
                    </Button>
                  </span>
                </Tooltip>
              </Box>
            )}
          </TabPanel>
        </Box>
      </Paper>

      {/* Personal Information Edit Dialog */}
      <FormDialog
        open={personalDialogOpen}
        onClose={() => handleCloseDialog('personal')}
        title="Edit Personal Information"
        onSubmit={handleSavePersonal}
        loading={saving}
        maxWidth="sm"
      >
        <Stack spacing={2} pt={4}>
          <TextField
            label="Consumer Number"
            value={consumer?.consumer_number || ''}
            disabled
            fullWidth
          />
          <TextField
            label="Person Name"
            value={personalData.person_name}
            onChange={(e) => setPersonalData({ ...personalData, person_name: e.target.value })}
            required
            fullWidth
          />
          <TextField
            label="Father's Name"
            value={personalData.father_name}
            onChange={(e) => setPersonalData({ ...personalData, father_name: e.target.value })}
            fullWidth
          />
          <TextField
            label="Mother's Name"
            value={personalData.mother_name}
            onChange={(e) => setPersonalData({ ...personalData, mother_name: e.target.value })}
            fullWidth
          />
          <TextField
            label="Spouse Name"
            value={personalData.spouse_name}
            onChange={(e) => setPersonalData({ ...personalData, spouse_name: e.target.value })}
            fullWidth
          />
          <TextField
            label="Date of Birth"
            type="date"
            value={personalData.dob}
            onChange={(e) => setPersonalData({ ...personalData, dob: e.target.value })}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      </FormDialog>

      {/* Address Edit Dialog */}
      <FormDialog
        open={addressDialogOpen}
        onClose={() => handleCloseDialog('address')}
        title={consumer?.addresses.length === 0 ? 'Add Address' : 'Edit Address'}
        onSubmit={handleSaveAddress}
        loading={saving}
        maxWidth="lg"
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, rowGap: 2 ,py:4}}>
          <TextField
            label="House/Door No"
            value={addressData.house_no}
            onChange={(e) => setAddressData({ ...addressData, house_no: e.target.value })}
            fullWidth
            size="small"
          />
          <TextField
            label="House Name/Flat Number"
            value={addressData.house_name_flat_number}
            onChange={(e) => setAddressData({ ...addressData, house_name_flat_number: e.target.value })}
            fullWidth
            size="small"
          />
          <TextField
            label="Housing Complex/Building"
            value={addressData.housing_complex_building}
            onChange={(e) => setAddressData({ ...addressData, housing_complex_building: e.target.value })}
            fullWidth
            size="small"
          />
          <TextField
            label="Street/Road Name"
            value={addressData.street_road_name}
            onChange={(e) => setAddressData({ ...addressData, street_road_name: e.target.value })}
            fullWidth
            size="small"
          />
          <TextField
            label="Landmark"
            value={addressData.land_mark}
            onChange={(e) => setAddressData({ ...addressData, land_mark: e.target.value })}
            fullWidth
            size="small"
          />
          <TextField
            label="City/Town/Village"
            value={addressData.city_town_village}
            onChange={(e) => setAddressData({ ...addressData, city_town_village: e.target.value })}
            fullWidth
            size="small"
          />
          <TextField
            label="District"
            value={addressData.district}
            onChange={(e) => setAddressData({ ...addressData, district: e.target.value })}
            fullWidth
            size="small"
          />
          <TextField
            label="Pin Code"
            value={addressData.pin_code}
            onChange={(e) => setAddressData({ ...addressData, pin_code: e.target.value })}
            fullWidth
            size="small"
          />
          <TextField
            label="Complete Address (Auto-generated or Custom)"
            value={addressData.address_text}
            onChange={(e) => setAddressData({ ...addressData, address_text: e.target.value })}
            multiline
            rows={3}
            fullWidth
            size="small"
            sx={{ gridColumn: '1 / -1' }}
            helperText="This field will be auto-filled from above fields, or you can enter a custom address"
          />
        </Box>
      </FormDialog>

      {/* Contact Edit Dialog */}
      <FormDialog
        open={contactDialogOpen}
        onClose={() => handleCloseDialog('contact')}
        title={consumer?.contacts.length === 0 ? 'Add Contact' : 'Edit Contact'}
        onSubmit={handleSaveContact}
        loading={saving}
        maxWidth="sm"
      >
        <Stack spacing={2} py={4}>
          <TextField
            label="Email Address"
            type="email"
            value={contactData.email}
            onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
            fullWidth
          />
          <TextField
            label="Mobile Number"
            value={contactData.mobile_number}
            onChange={(e) => setContactData({ ...contactData, mobile_number: e.target.value })}
            fullWidth
          />
          <TextField
            label="Landline Number"
            value={contactData.phone_number}
            onChange={(e) => setContactData({ ...contactData, phone_number: e.target.value })}
            fullWidth
          />
        </Stack>
      </FormDialog>

      {/* Identification Edit Dialog */}
      <FormDialog
        open={identificationDialogOpen}
        onClose={() => handleCloseDialog('identification')}
        title="Edit Identifications"
        onSubmit={handleSaveIdentification}
        loading={saving}
        maxWidth="md"
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, rowGap: 2 ,pt:4}}>
          <TextField
            label="Ration Card Number"
            value={identificationData.ration_card_num}
            onChange={(e) => setIdentificationData({ ...identificationData, ration_card_num: e.target.value })}
            fullWidth
            size="small"
          />
          <TextField
            label="Aadhar Number"
            value={identificationData.aadhar_num}
            onChange={(e) => setIdentificationData({ ...identificationData, aadhar_num: e.target.value })}
            fullWidth
            size="small"
            inputProps={{ maxLength: 12 }}
          />
          <TextField
            label="PAN Number"
            value={identificationData.pan_num}
            onChange={(e) => setIdentificationData({ ...identificationData, pan_num: e.target.value.toUpperCase() })}
            fullWidth
            size="small"
            inputProps={{ maxLength: 10 }}
          />
        </Box>
      </FormDialog>

      {/* Additional Details Edit Dialog */}
      <FormDialog
        open={additionalDialogOpen}
        onClose={() => handleCloseDialog('additional')}
        title="Edit Additional Info"
        onSubmit={handleSaveAdditional}
        loading={saving}
        maxWidth="lg"
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, rowGap: 2 ,pt:4}}>
          <TextField
            label="Consumer Number"
            value={additionalData.consumer_number}
            onChange={(e) => setAdditionalData({ ...additionalData, consumer_number: e.target.value })}
            fullWidth
            size="small"
          />
          <TextField
            label="Blue Book Number"
            value={additionalData.blue_book}
            onChange={(e) => setAdditionalData({ ...additionalData, blue_book: e.target.value })}
            fullWidth
            size="small"
            type="number"
          />
          <TextField
            label="LPG ID"
            value={additionalData.lpg_id}
            onChange={(e) => setAdditionalData({ ...additionalData, lpg_id: e.target.value })}
            fullWidth
            size="small"
            type="number"
          />
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={additionalData.category > 0 ? additionalData.category : ''}
              label="Category"
              onChange={(e) => setAdditionalData({ ...additionalData, category: Number(e.target.value) })}
            >
              <MenuItem value="">
                <em>Select Category</em>
              </MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Consumer Type</InputLabel>
            <Select
              value={additionalData.consumer_type > 0 ? additionalData.consumer_type : ''}
              label="Consumer Type"
              onChange={(e) => setAdditionalData({ ...additionalData, consumer_type: Number(e.target.value) })}
            >
              <MenuItem value="">
                <em>Select Consumer Type</em>
              </MenuItem>
              {consumerTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>BPL Type</InputLabel>
            <Select
              value={additionalData.bpl_type > 0 ? additionalData.bpl_type : ''}
              label="BPL Type"
              onChange={(e) => setAdditionalData({ ...additionalData, bpl_type: Number(e.target.value) })}
            >
              <MenuItem value="">
                <em>Select BPL Type</em>
              </MenuItem>
              {bplTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>DCT Type</InputLabel>
            <Select
              value={additionalData.dct_type > 0 ? additionalData.dct_type : ''}
              label="DCT Type"
              onChange={(e) => setAdditionalData({ ...additionalData, dct_type: Number(e.target.value) })}
            >
              <MenuItem value="">
                <em>Select DCT Type</em>
              </MenuItem>
              {dctTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Scheme</InputLabel>
            <Select
              value={additionalData.scheme > 0 ? additionalData.scheme : ''}
              label="Scheme"
              onChange={(e) => setAdditionalData({ ...additionalData, scheme: Number(e.target.value) })}
            >
              <MenuItem value="">
                <em>Select Scheme</em>
              </MenuItem>
              {schemes.map((scheme) => (
                <MenuItem key={scheme.id} value={scheme.id}>
                  {scheme.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </FormDialog>

      {/* Connection Dialog */}
      <FormDialog
        open={connectionDialogOpen}
        onClose={handleCloseConnectionDialog}
        title={editingConnectionId ? 'Edit Connection' : 'Add Connection'}
        onSubmit={handleSaveConnection}
        loading={saving}
        maxWidth="md"
        submitLabel={editingConnectionId ? 'Update Connection' : 'Add Connection'}
      >
        <Stack spacing={3}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 ,pt:4}}>
            <TextField
              label="Service Number"
              value={connectionData.sv_number}
              onChange={(e) => setConnectionData({ ...connectionData, sv_number: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Service Date"
              type="date"
              value={connectionData.sv_date}
              onChange={(e) => setConnectionData({ ...connectionData, sv_date: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Connection Type</InputLabel>
              <Select
                value={connectionData.connection_type || ''}
                label="Connection Type"
                onChange={(e) => setConnectionData({ ...connectionData, connection_type: Number(e.target.value) })}
              >
                <MenuItem value="">
                  <em>Select Connection Type</em>
                </MenuItem>
                {connectionTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Product</InputLabel>
              <Select
                value={connectionData.product || ''}
                label="Product"
                onChange={(e) => setConnectionData({ ...connectionData, product: Number(e.target.value) })}
              >
                <MenuItem value="">
                  <em>Select Product</em>
                </MenuItem>
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <TextField
            label="Number of Regulators"
            type="number"
            value={connectionData.num_of_regulators}
            onChange={(e) => setConnectionData({ ...connectionData, num_of_regulators: parseInt(e.target.value) || 1 })}
            fullWidth
            inputProps={{ min: 1 }}
          />
          <TextField
            label="History/Category Description"
            value={connectionData.hist_code_description}
            onChange={(e) => setConnectionData({ ...connectionData, hist_code_description: e.target.value })}
            fullWidth
            multiline
            rows={1.5}
          />
        </Stack>
      </FormDialog>

      {/* Route Assignment Dialog */}
      <FormDialog
        open={routeDialogOpen}
        onClose={handleCloseRouteDialog}
        title={routeInfo ? 'Change Route' : 'Assign Route'}
        onSubmit={handleSaveRoute}
        loading={saving}
        maxWidth="sm"
        submitLabel={routeInfo ? 'Update Route' : 'Assign Route'}
      >
        <Box sx={{py:4}}>
        <FormControl fullWidth >
          <InputLabel>Select Route</InputLabel>
          <Select
            value={selectedRouteId || ''}
            onChange={(e) => setSelectedRouteId(Number(e.target.value))}
            label="Select Route"
          >
            <MenuItem value="">
              <em>Select a route</em>
            </MenuItem>
            {routes.map((route) => (
              <MenuItem key={route.id} value={route.id}>
                {route.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        </Box>
      </FormDialog>
    </Box>
  );
}
