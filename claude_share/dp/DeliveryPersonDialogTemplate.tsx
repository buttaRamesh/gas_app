import React from 'react';
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
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Route as RouteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';

interface DeliveryPersonDialogTemplateProps {
  open: boolean;
  onClose: () => void;
  mode?: 'add' | 'view' | 'edit';
}

// Sample static data for UI demonstration
const sampleRoutes = [
  { id: 1, area_code: 'RT001', area_code_description: 'Downtown Area' },
  { id: 2, area_code: 'RT002', area_code_description: 'Suburb Zone A' },
  { id: 3, area_code: 'RT003', area_code_description: 'Industrial District' },
];

const DeliveryPersonDialogTemplate: React.FC<DeliveryPersonDialogTemplateProps> = ({
  open,
  onClose,
  mode = 'add',
}) => {
  const theme = useTheme();

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';

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
      {/* Enhanced Title Bar with Gradient */}
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: theme.palette.primary.contrastText,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 1.5,
          px: 2.5,
          minHeight: 'unset',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${alpha(theme.palette.secondary.main, 0.3)})`,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: alpha(theme.palette.common.white, 0.2),
              backdropFilter: 'blur(10px)',
            }}
          >
            {getTitleIcon()}
          </Avatar>
          <Typography variant="h6" fontWeight={600} sx={{ letterSpacing: '-0.02em' }}>
            {getTitle()}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: theme.palette.primary.contrastText,
            bgcolor: alpha(theme.palette.common.white, 0.1),
            '&:hover': {
              bgcolor: alpha(theme.palette.common.white, 0.2),
              transform: 'rotate(90deg)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Content */}
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
            defaultValue={isViewMode || isEditMode ? 'John' : ''}
            fullWidth
            size="small"
            variant="outlined"
            disabled={isViewMode}
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
            defaultValue={isViewMode || isEditMode ? 'Smith' : ''}
            fullWidth
            size="small"
            variant="outlined"
            disabled={isViewMode}
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
            defaultValue={isViewMode || isEditMode ? '9876543210' : ''}
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
            defaultValue={isViewMode || isEditMode ? '04412345678' : ''}
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
            defaultValue={isViewMode || isEditMode ? 'john.smith@example.com' : ''}
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
          {(isViewMode || isEditMode) && (
            <Button
              size="small"
              startIcon={<AddIcon />}
              variant="outlined"
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

        {(isViewMode || isEditMode) ? (
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
            {sampleRoutes.map((route, index) => (
              <Chip
                key={route.id}
                label={`${route.area_code} - ${route.area_code_description}`}
                onDelete={isEditMode ? () => {} : undefined}
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
        ) : (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            fullWidth
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              borderStyle: 'dashed',
              borderWidth: 2,
              py: 1.5,
              '&:hover': {
                borderWidth: 2,
                borderStyle: 'dashed',
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              },
            }}
          >
            Click to Assign Routes
          </Button>
        )}
      </DialogContent>

      {/* Enhanced Actions Footer */}
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
            startIcon={<EditIcon />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
              '&:hover': {
                boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.5)}`,
              },
            }}
          >
            Edit
          </Button>
        ) : (
          <Button
            variant="contained"
            startIcon={mode === 'add' ? <PersonAddIcon /> : <SaveIcon />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
              '&:hover': {
                boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.5)}`,
              },
            }}
          >
            {mode === 'add' ? 'Add Delivery Person' : 'Save Changes'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DeliveryPersonDialogTemplate;
