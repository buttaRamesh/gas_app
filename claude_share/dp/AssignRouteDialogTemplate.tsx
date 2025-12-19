import React, { useState } from 'react';
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

interface AssignRouteDialogTemplateProps {
  open: boolean;
  onClose: () => void;
}

// Sample static data for UI demonstration
const sampleUnassignedRoutes = [
  { id: 1, area_code: 'RT004', area_code_description: 'North District', areas: 5, consumers: 45 },
  { id: 2, area_code: 'RT005', area_code_description: 'East Zone B', areas: 3, consumers: 32 },
  { id: 3, area_code: 'RT006', area_code_description: 'West Commercial Area', areas: 7, consumers: 68 },
  { id: 4, area_code: 'RT007', area_code_description: 'South Residential', areas: 4, consumers: 41 },
  { id: 5, area_code: 'RT008', area_code_description: 'Central Hub', areas: 6, consumers: 55 },
  { id: 6, area_code: 'RT009', area_code_description: 'Industrial Zone', areas: 2, consumers: 28 },
];

const AssignRouteDialogTemplate: React.FC<AssignRouteDialogTemplateProps> = ({
  open,
  onClose,
}) => {
  const theme = useTheme();
  const [selectedRoutes, setSelectedRoutes] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleRouteSelection = (routeId: number) => {
    setSelectedRoutes((prev) =>
      prev.includes(routeId)
        ? prev.filter((id) => id !== routeId)
        : [...prev, routeId]
    );
  };

  const filteredRoutes = sampleUnassignedRoutes.filter(
    (route) =>
      route.area_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.area_code_description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: theme.palette.primary.contrastText,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2,
          px: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.secondary.main, 0.9),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RouteIcon sx={{ color: theme.palette.primary.main, fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Assign Routes
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              Select routes to assign
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: theme.palette.primary.contrastText,
            '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.15) },
          }}
        >
          <CloseIcon />
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
                      {route.areas}
                    </Typography>
                  </Box>

                  {/* Consumers */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <PeopleIcon sx={{ fontSize: 16, color: theme.palette.success.main }} />
                    <Typography variant="body2" fontWeight={600} color="success.main">
                      {route.consumers}
                    </Typography>
                  </Box>
                </Box>
              </Fade>
            );
          })}
        </Box>

        {/* Empty State */}
        {filteredRoutes.length === 0 && (
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
              Try a different search term
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
          disabled={selectedRoutes.length === 0}
          startIcon={<AddTaskIcon />}
          sx={{
            borderRadius: 2,
            px: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            },
            '&.Mui-disabled': {
              background: alpha(theme.palette.primary.main, 0.3),
              color: alpha(theme.palette.primary.contrastText, 0.5),
            },
          }}
        >
          Assign {selectedRoutes.length > 0 ? `(${selectedRoutes.length})` : ''}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignRouteDialogTemplate;
