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
  InputAdornment,
  useTheme,
  alpha,
  Fade,
  Zoom,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Route as RouteIcon,
  Check as CheckIcon,
  LocationOn as LocationIcon,
  AddTask as AddTaskIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import deliveryPersonsApi from '../../../api/deliveryPersons';
import type { UnassignedRoute } from '../../../api/deliveryPersons';

interface AssignRouteDialogProps {
  open: boolean;
  onClose: () => void;
  deliveryPersonId: number;
  onSuccess: (selectedRouteIds: number[]) => void;
}

const AssignRouteDialog: React.FC<AssignRouteDialogProps> = ({
  open,
  onClose,
  deliveryPersonId,
  onSuccess,
}) => {
  const theme = useTheme();
  const [selectedRoutes, setSelectedRoutes] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [routes, setRoutes] = useState<UnassignedRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchUnassignedRoutes();
      setSelectedRoutes([]);
      setSearchTerm('');
    }
  }, [open]);

  const fetchUnassignedRoutes = async () => {
    setLoading(true);
    try {
      const data = await deliveryPersonsApi.getUnassignedRoutes();
      setRoutes(data);
    } catch (error) {
      console.error('Failed to fetch unassigned routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRouteSelection = (routeId: number) => {
    setSelectedRoutes((prev) =>
      prev.includes(routeId)
        ? prev.filter((id) => id !== routeId)
        : [...prev, routeId]
    );
  };

  const filteredRoutes = routes.filter(
    (route) =>
      route.area_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.area_code_description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssign = async () => {
    if (selectedRoutes.length === 0) return;

    setSubmitting(true);
    try {
      onSuccess(selectedRoutes);
      onClose();
    } catch (error) {
      console.error('Failed to assign routes:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: theme.palette.background.default,
        },
      }}
    >
      {/* Header */}
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
            <RouteIcon sx={{ color: theme.palette.primary.contrastText, fontSize: 18 }} />
          </Box>
          <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '0.95rem' }}>
            Assign Routes
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: theme.palette.secondary.contrastText,
            '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.15) },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Search Bar */}
        <Box
          sx={{
            p: 2,
            bgcolor: theme.palette.background.paper,
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <TextField
            placeholder="Search routes..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: theme.palette.background.default,
                borderRadius: 2,
              },
            }}
          />
          {selectedRoutes.length > 0 && (
            <Zoom in>
              <Box
                sx={{
                  px: 2,
                  py: 0.75,
                  borderRadius: 2,
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  whiteSpace: 'nowrap',
                }}
              >
                <CheckIcon sx={{ fontSize: 16 }} />
                {selectedRoutes.length} selected
              </Box>
            </Zoom>
          )}
        </Box>

        {/* Table Header */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 100px 100px',
            alignItems: 'center',
            px: 2,
            py: 1.5,
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Route
          </Typography>
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>
            Areas
          </Typography>
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>
            Consumers
          </Typography>
        </Box>

        {/* Routes List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              maxHeight: 350,
              overflow: 'auto',
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
                borderRadius: 3,
              },
            }}
          >
            {filteredRoutes.map((route, index) => {
              const isSelected = selectedRoutes.includes(route.id);
              return (
                <Fade in timeout={150 + index * 30} key={route.id}>
                  <Box
                    onClick={() => toggleRouteSelection(route.id)}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 100px 100px',
                      alignItems: 'center',
                      px: 2,
                      py: 1.5,
                      cursor: 'pointer',
                      bgcolor: isSelected
                        ? alpha(theme.palette.primary.main, 0.1)
                        : index % 2 === 0
                          ? theme.palette.background.default
                          : theme.palette.background.paper,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      borderLeft: isSelected ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: isSelected
                          ? alpha(theme.palette.primary.main, 0.15)
                          : alpha(theme.palette.primary.main, 0.05),
                      },
                    }}
                  >
                    {/* Route Info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 1.5,
                          bgcolor: isSelected
                            ? theme.palette.primary.main
                            : alpha(theme.palette.primary.main, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <RouteIcon
                          sx={{
                            fontSize: 18,
                            color: isSelected
                              ? theme.palette.primary.contrastText
                              : theme.palette.primary.main
                          }}
                        />
                      </Box>
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          color={isSelected ? 'primary.main' : 'text.primary'}
                        >
                          {route.area_code}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                          {route.area_code_description}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Areas */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      <LocationIcon sx={{ fontSize: 16, color: theme.palette.info.main }} />
                      <Typography variant="body2" fontWeight={600} color="info.main">
                        -
                      </Typography>
                    </Box>

                    {/* Consumers */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      <PeopleIcon sx={{ fontSize: 16, color: theme.palette.success.main }} />
                      <Typography variant="body2" fontWeight={600} color="success.main">
                        {route.consumer_count}
                      </Typography>
                    </Box>
                  </Box>
                </Fade>
              );
            })}
          </Box>
        )}

        {/* Empty State */}
        {!loading && filteredRoutes.length === 0 && (
          <Box
            sx={{
              py: 6,
              textAlign: 'center',
            }}
          >
            <SearchIcon sx={{ fontSize: 48, color: theme.palette.text.disabled, mb: 1 }} />
            <Typography variant="body1" color="text.secondary" fontWeight={500}>
              No routes found
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {searchTerm ? 'Try a different search term' : 'All routes are assigned'}
            </Typography>
          </Box>
        )}
      </DialogContent>

      {/* Footer */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          bgcolor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
          gap: 1.5,
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
          {filteredRoutes.length} routes available
        </Typography>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={submitting}
          sx={{
            borderRadius: 2,
            px: 3,
            borderColor: theme.palette.divider,
            color: theme.palette.text.secondary,
            '&:hover': {
              borderColor: theme.palette.text.secondary,
              bgcolor: 'transparent',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="secondary"
          disabled={selectedRoutes.length === 0 || submitting}
          startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <AddTaskIcon />}
          onClick={handleAssign}
          sx={{
            borderRadius: 2,
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
          {submitting ? 'Assigning...' : `Assign ${selectedRoutes.length > 0 ? `(${selectedRoutes.length})` : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignRouteDialog;
