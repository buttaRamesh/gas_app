import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Chip,
  useTheme,
  alpha,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Route as RouteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  PersonAdd as PersonAddIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import deliveryPersonsApi from '../../../api/deliveryPersons';
import AssignRouteDialog from './AssignRouteDialog';

interface DeliveryPersonDialogProps {
  open: boolean;
  onClose: () => void;
  mode: 'add' | 'view' | 'edit';
  person?: any;
  onModeChange: (mode: 'add' | 'view' | 'edit') => void;
  onSuccess: () => void;
}

const DeliveryPersonDialog: React.FC<DeliveryPersonDialogProps> = ({
  open,
  onClose,
  mode,
  person,
  onModeChange,
  onSuccess,
}) => {
  const theme = useTheme();
  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isAddMode = mode === 'add';

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    mobile_number: '',
    phone_number: '',
    email: '',
  });
  const [assignedRoutes, setAssignedRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  useEffect(() => {
    if (person) {
      const contact = person.person?.contacts?.[0] || {};
      setFormData({
        first_name: person.person?.first_name || '',
        last_name: person.person?.last_name || '',
        mobile_number: contact.mobile_number || '',
        phone_number: contact.phone_number || '',
        email: contact.email || '',
      });
      setAssignedRoutes(person.assigned_routes || []);
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        mobile_number: '',
        phone_number: '',
        email: '',
      });
      setAssignedRoutes([]);
    }
  }, [person, mode]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (isAddMode) {
        await deliveryPersonsApi.create(formData);
      } else if (isEditMode) {
        await deliveryPersonsApi.update(person.id, formData);
      }
      onSuccess();
    } catch (error: any) {
      console.error('Failed to save delivery person:', error);
      alert(error.response?.data?.detail || 'Failed to save delivery person');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    onModeChange('edit');
  };

  const handleRemoveRoute = async (routeId: number) => {
    if (!isEditMode || !person) return;

    try {
      await deliveryPersonsApi.unassignRoute(person.id, routeId);
      setAssignedRoutes((prev) => prev.filter((r) => r.id !== routeId));
      onSuccess();
    } catch (error: any) {
      console.error('Failed to unassign route:', error);
      alert(error.response?.data?.detail || error.response?.data?.error || 'Failed to unassign route');
    }
  };

  const handleAssignRoutes = async (selectedRouteIds: number[]) => {
    if (!person) return;

    try {
      await deliveryPersonsApi.assignRoutes(person.id, selectedRouteIds);
      // Refresh person data
      const updatedPerson = await deliveryPersonsApi.get(person.id);
      setAssignedRoutes(updatedPerson.assigned_routes || []);
      onSuccess();
    } catch (error: any) {
      console.error('Failed to assign routes:', error);
      alert(error.response?.data?.detail || 'Failed to assign routes');
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'add':
        return 'Add New Delivery Person';
      case 'view':
        return 'Delivery Person Details';
      case 'edit':
        return 'Edit Delivery Person';
      default:
        return 'Delivery Person';
    }
  };

  const getTitleIcon = () => {
    switch (mode) {
      case 'add':
        return <PersonAddIcon />;
      case 'edit':
        return <EditIcon />;
      default:
        return <PersonIcon />;
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: `0 25px 50px -12px ${alpha(theme.palette.primary.main, 0.25)}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
            color: theme.palette.secondary.contrastText,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 1,
            px: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                bgcolor: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {getTitleIcon()}
            </Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '0.95rem' }}>
              {getTitle()}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: theme.palette.secondary.contrastText,
              '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.15) },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3, pb: 2, px: 3 }}>
          {/* Personal Details Section */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 2,
              pb: 1,
              borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <BadgeIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight={600} color="primary">
              Personal Details
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              label="First Name"
              value={formData.first_name}
              onChange={(e) => handleChange('first_name', e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
              disabled={isViewMode}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
                  },
                  '&.Mui-focused': {
                    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}`,
                  },
                },
              }}
            />
            <TextField
              label="Last Name"
              value={formData.last_name}
              onChange={(e) => handleChange('last_name', e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
              disabled={isViewMode}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
                  },
                  '&.Mui-focused': {
                    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}`,
                  },
                },
              }}
            />
          </Box>

          {/* Contact Details Section */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 2,
              pb: 1,
              borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <PhoneIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight={600} color="primary">
              Contact Details
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <TextField
              label="Mobile Number"
              value={formData.mobile_number}
              onChange={(e) => handleChange('mobile_number', e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
              disabled={isViewMode}
              required
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, display: 'flex', color: theme.palette.text.secondary }}>
                    <PhoneIcon fontSize="small" />
                  </Box>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              label="Phone Number"
              value={formData.phone_number}
              onChange={(e) => handleChange('phone_number', e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
              disabled={isViewMode}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              label="Email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
              disabled={isViewMode}
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, display: 'flex', color: theme.palette.text.secondary }}>
                    <EmailIcon fontSize="small" />
                  </Box>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Box>

          {/* Assigned Routes Section */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
              pb: 1,
              borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <RouteIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
              <Typography variant="subtitle1" fontWeight={600} color="primary">
                Assigned Routes
              </Typography>
            </Box>
            {(isViewMode || isEditMode) && person && (
              <Button
                size="small"
                startIcon={<AddIcon />}
                variant="outlined"
                onClick={() => setAssignDialogOpen(true)}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  },
                }}
              >
                Assign More
              </Button>
            )}
          </Box>

          {(isViewMode || isEditMode) && assignedRoutes.length > 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                p: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.03),
                borderRadius: 2,
                border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              {assignedRoutes.map((route, index) => (
                <Chip
                  key={route.id}
                  label={`${route.area_code} - ${route.area_code_description}`}
                  onDelete={isEditMode ? () => handleRemoveRoute(route.id) : undefined}
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    fontWeight: 500,
                    borderRadius: 2,
                    animation: `fadeIn 0.3s ease ${index * 0.1}s both`,
                    '@keyframes fadeIn': {
                      from: { opacity: 0, transform: 'scale(0.9)' },
                      to: { opacity: 1, transform: 'scale(1)' },
                    },
                    '& .MuiChip-deleteIcon': {
                      color: alpha(theme.palette.primary.contrastText, 0.7),
                      '&:hover': {
                        color: theme.palette.error.light,
                      },
                    },
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                    },
                    transition: 'all 0.2s ease',
                  }}
                />
              ))}
            </Box>
          ) : isAddMode ? (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              fullWidth
              disabled
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                borderStyle: 'dashed',
                borderWidth: 2,
                py: 1.5,
                '&:hover': {
                  borderWidth: 2,
                  borderStyle: 'dashed',
                },
              }}
            >
              Routes can be assigned after creating delivery person
            </Button>
          ) : (
            <Box
              sx={{
                p: 2,
                bgcolor: alpha(theme.palette.grey[500], 0.05),
                borderRadius: 2,
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No routes assigned
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            bgcolor: alpha(theme.palette.grey[100], 0.5),
            borderTop: `1px solid ${theme.palette.divider}`,
            gap: 1,
          }}
        >
          <Button
            onClick={onClose}
            color="inherit"
            disabled={loading}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
            }}
          >
            {isViewMode ? 'Close' : 'Cancel'}
          </Button>
          {isViewMode ? (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
                bgcolor: theme.palette.secondary.main,
                color: theme.palette.secondary.contrastText,
                boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.3)}`,
                '&:hover': {
                  bgcolor: theme.palette.secondary.dark,
                  boxShadow: `0 6px 16px ${alpha(theme.palette.secondary.main, 0.4)}`,
                },
              }}
            >
              Edit
            </Button>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              startIcon={
                loading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : mode === 'add' ? (
                  <PersonAddIcon />
                ) : (
                  <SaveIcon />
                )
              }
              onClick={handleSave}
              disabled={loading || !formData.first_name || !formData.last_name || !formData.mobile_number}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
                bgcolor: theme.palette.secondary.main,
                color: theme.palette.secondary.contrastText,
                boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.3)}`,
                '&:hover': {
                  bgcolor: theme.palette.secondary.dark,
                  boxShadow: `0 6px 16px ${alpha(theme.palette.secondary.main, 0.4)}`,
                },
                '&.Mui-disabled': {
                  bgcolor: alpha(theme.palette.secondary.main, 0.3),
                  color: alpha(theme.palette.secondary.contrastText, 0.5),
                },
              }}
            >
              {loading ? 'Saving...' : mode === 'add' ? 'Add Delivery Person' : 'Save Changes'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Assign Route Dialog */}
      {person && (
        <AssignRouteDialog
          open={assignDialogOpen}
          onClose={() => setAssignDialogOpen(false)}
          deliveryPersonId={person.id}
          onSuccess={handleAssignRoutes}
        />
      )}
    </>
  );
};

export default DeliveryPersonDialog;
