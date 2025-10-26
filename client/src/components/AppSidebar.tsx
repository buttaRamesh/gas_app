import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Collapse,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Home,
  LocalShipping,
  ExpandLess,
  ExpandMore,
  Route,
  LocationOn,
  Settings,
  BarChart,
  History,
  Add,
  Map,
  ViewModule,
  Menu as MenuIcon,
  Storefront,
  Person,
  Group,
  Inventory,
  Straighten,
} from '@mui/icons-material';

interface AppSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AppSidebar({ collapsed = false, onToggleCollapse }: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for collapsible groups
  const [productsOpen, setProductsOpen] = useState(true);
  const [unitsOpen, setUnitsOpen] = useState(false);
  const [variantsOpen, setVariantsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  
  // Determine current section
  const getCurrentSection = () => {
    if (location.pathname.startsWith('/routes')) return 'routes';
    if (location.pathname.startsWith('/route-areas')) return 'route-areas';
    if (location.pathname.startsWith('/delivery-persons')) return 'delivery-persons';
    if (location.pathname.startsWith('/products') || location.pathname.startsWith('/units') || location.pathname.startsWith('/variants')) return 'products';
    if (location.pathname.startsWith('/settings')) return 'settings';
    return 'dashboard';
  };

  const currentSection = getCurrentSection();

  return (
    <Box sx={{ 
      width: collapsed ? 80 : 280, 
      height: '100vh', 
      bgcolor: 'hsl(var(--sidebar-background))',
      position: 'fixed',
      left: 0,
      top: 0,
      transition: 'width 0.3s ease',
      overflowY: 'auto',
      overflowX: 'hidden',
      zIndex: 1200,
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        bgcolor: 'rgba(0,0,0,0.1)',
      },
      '&::-webkit-scrollbar-thumb': {
        bgcolor: 'hsl(var(--sidebar-primary))',
        borderRadius: '4px',
      },
    }}>
      <Box sx={{ 
        p: 3,
        background: 'linear-gradient(135deg, hsl(var(--sidebar-accent)) 0%, hsl(var(--sidebar-background)) 100%)',
        color: 'hsl(var(--sidebar-foreground))',
        position: 'relative',
        borderBottom: '2px solid hsl(var(--sidebar-primary))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: collapsed ? 'center' : 'flex-start',
      }}>
        {!collapsed && (
          <>
            <Avatar sx={{ 
              width: 60, 
              height: 60, 
              mb: 2,
              bgcolor: 'hsl(var(--sidebar-primary))',
              color: 'hsl(var(--sidebar-primary-foreground))',
              boxShadow: '0 4px 14px hsla(var(--sidebar-primary), 0.5)'
            }}>
              <Storefront sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography variant="h5" fontWeight="800" sx={{ 
              background: 'linear-gradient(135deg, hsl(var(--sidebar-primary)) 0%, hsl(var(--primary-light)) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5
            }}>
              UKB Gas Agency
            </Typography>
            <Typography variant="caption" sx={{ color: 'hsl(var(--primary-light))' }}>
              Gas Cylinder Management
            </Typography>
          </>
        )}
        {collapsed && (
          <Avatar sx={{ 
            width: 48, 
            height: 48,
            bgcolor: 'hsl(var(--sidebar-primary))',
            color: 'hsl(var(--sidebar-primary-foreground))',
            boxShadow: '0 4px 14px hsla(var(--sidebar-primary), 0.5)'
          }}>
            <Storefront sx={{ fontSize: 28 }} />
          </Avatar>
        )}
      </Box>

      <Box sx={{ 
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1,
      }}>
        <ListItemButton
          onClick={onToggleCollapse}
          sx={{
            minHeight: 40,
            width: 40,
            borderRadius: 1,
            bgcolor: 'hsla(var(--sidebar-primary), 0.1)',
            color: 'hsl(var(--sidebar-primary))',
            '&:hover': {
              bgcolor: 'hsla(var(--sidebar-primary), 0.2)',
            }
          }}
        >
          <MenuIcon />
        </ListItemButton>
      </Box>

      <List sx={{ p: 2 }}>
        {/* Back to Dashboard - Always visible when not on dashboard */}
        {currentSection !== 'dashboard' && (
          <ListItemButton 
            onClick={() => navigate('/')}
            sx={{ 
              mb: 2,
              borderRadius: 2,
              bgcolor: 'hsla(var(--sidebar-primary), 0.1)',
              color: 'hsl(var(--sidebar-foreground))',
              border: '1px solid hsla(var(--sidebar-primary), 0.3)',
              '&:hover': { 
                bgcolor: 'hsla(var(--sidebar-primary), 0.15)',
                boxShadow: '0 0 20px hsla(var(--sidebar-primary), 0.2)'
              }
            }}
          >
            <ListItemIcon><Home sx={{ color: 'hsl(var(--sidebar-primary))' }} /></ListItemIcon>
            {!collapsed && <ListItemText primary={<Typography fontWeight="600">← Back to Dashboard</Typography>} />}
          </ListItemButton>
        )}

        {/* Dashboard View */}
        {currentSection === 'dashboard' && (
          <>
            <ListItemButton 
              onClick={() => navigate('/routes')}
              sx={{ 
                mb: 1.5,
                borderRadius: 2,
                bgcolor: 'hsla(var(--sidebar-primary), 0.1)',
                color: 'hsl(var(--sidebar-foreground))',
                border: '1px solid hsla(var(--sidebar-primary), 0.3)',
                '&:hover': { 
                  bgcolor: 'hsla(var(--sidebar-primary), 0.15)',
                  boxShadow: '0 0 20px hsla(var(--sidebar-primary), 0.2)'
                }
              }}
            >
              <ListItemIcon><LocalShipping sx={{ color: 'hsl(var(--sidebar-primary))' }} /></ListItemIcon>
              {!collapsed && (
                <>
                  <ListItemText primary={<Typography fontWeight="600">Routes & Areas</Typography>} />
                  <Chip 
                    label="Main" 
                    size="small" 
                    sx={{ 
                      bgcolor: 'hsl(var(--sidebar-primary))',
                      color: 'hsl(var(--sidebar-primary-foreground))',
                      fontWeight: 700,
                      fontSize: '0.7rem'
                    }} 
                  />
                </>
              )}
            </ListItemButton>

            <ListItemButton 
              onClick={() => navigate('/delivery-persons')}
              sx={{ 
                mb: 1.5,
                borderRadius: 2,
                bgcolor: 'hsla(var(--sidebar-primary), 0.1)',
                color: 'hsl(var(--sidebar-foreground))',
                border: '1px solid hsla(var(--sidebar-primary), 0.3)',
                '&:hover': { 
                  bgcolor: 'hsla(var(--sidebar-primary), 0.15)',
                  boxShadow: '0 0 20px hsla(var(--sidebar-primary), 0.2)'
                }
              }}
            >
              <ListItemIcon><Group sx={{ color: 'hsl(var(--sidebar-primary))' }} /></ListItemIcon>
              {!collapsed && <ListItemText primary={<Typography fontWeight="600">Delivery Persons</Typography>} />}
            </ListItemButton>

            <ListItemButton 
              onClick={() => navigate('/products')}
              sx={{ 
                mb: 1.5,
                borderRadius: 2,
                bgcolor: 'hsla(var(--sidebar-primary), 0.1)',
                color: 'hsl(var(--sidebar-foreground))',
                border: '1px solid hsla(var(--sidebar-primary), 0.3)',
                '&:hover': { 
                  bgcolor: 'hsla(var(--sidebar-primary), 0.15)',
                  boxShadow: '0 0 20px hsla(var(--sidebar-primary), 0.2)'
                }
              }}
            >
              <ListItemIcon><Inventory sx={{ color: 'hsl(var(--sidebar-primary))' }} /></ListItemIcon>
              {!collapsed && <ListItemText primary={<Typography fontWeight="600">Products</Typography>} />}
            </ListItemButton>

            <ListItemButton 
              onClick={() => navigate('/settings')}
              sx={{ 
                mb: 1.5,
                borderRadius: 2,
                bgcolor: 'hsla(var(--sidebar-primary), 0.1)',
                color: 'hsl(var(--sidebar-foreground))',
                border: '1px solid hsla(var(--sidebar-primary), 0.3)',
                '&:hover': { 
                  bgcolor: 'hsla(var(--sidebar-primary), 0.15)',
                  boxShadow: '0 0 20px hsla(var(--sidebar-primary), 0.2)'
                }
              }}
            >
              <ListItemIcon><Settings sx={{ color: 'hsl(var(--sidebar-primary))' }} /></ListItemIcon>
              {!collapsed && <ListItemText primary={<Typography fontWeight="600">Settings</Typography>} />}
            </ListItemButton>
          </>
        )}

        {/* Routes Section */}
        {(currentSection === 'routes' || currentSection === 'route-areas') && (
          <>
            <Box sx={{ mb: 2, px: 2 }}>
              {!collapsed && (
                <Typography variant="h6" fontWeight="700" sx={{ color: 'hsl(var(--sidebar-primary))' }}>
                  Routes & Areas
                </Typography>
              )}
            </Box>

            <ListItemButton 
              onClick={() => navigate('/routes')}
              sx={{ 
                mb: 1.5,
                borderRadius: 2,
                bgcolor: isActive('/routes') ? 'hsla(var(--sidebar-primary), 0.15)' : 'hsla(var(--sidebar-primary), 0.1)',
                color: 'hsl(var(--sidebar-foreground))',
                border: '1px solid hsla(var(--sidebar-primary), 0.3)',
                '&:hover': { 
                  bgcolor: 'hsla(var(--sidebar-primary), 0.15)',
                  boxShadow: '0 0 20px hsla(var(--sidebar-primary), 0.2)'
                }
              }}
            >
              <ListItemIcon><Route sx={{ color: 'hsl(var(--sidebar-primary))' }} /></ListItemIcon>
              {!collapsed && <ListItemText primary={<Typography fontWeight="600">All Routes</Typography>} />}
            </ListItemButton>

            <ListItemButton 
              onClick={() => navigate('/routes/new')}
              sx={{ 
                mb: 1.5,
                borderRadius: 2,
                bgcolor: isActive('/routes/new') ? 'hsla(var(--sidebar-primary), 0.15)' : 'hsla(var(--sidebar-primary), 0.1)',
                color: 'hsl(var(--sidebar-foreground))',
                border: '1px solid hsla(var(--sidebar-primary), 0.3)',
                '&:hover': { 
                  bgcolor: 'hsla(var(--sidebar-primary), 0.15)',
                  boxShadow: '0 0 20px hsla(var(--sidebar-primary), 0.2)'
                }
              }}
            >
              <ListItemIcon><Add sx={{ color: 'hsl(var(--sidebar-primary))' }} /></ListItemIcon>
              {!collapsed && <ListItemText primary={<Typography fontWeight="600">Create Route</Typography>} />}
            </ListItemButton>

            <ListItemButton 
              onClick={() => navigate('/routes/statistics')}
              sx={{ 
                mb: 1.5,
                borderRadius: 2,
                bgcolor: isActive('/routes/statistics') ? 'hsla(var(--sidebar-primary), 0.15)' : 'hsla(var(--sidebar-primary), 0.1)',
                color: 'hsl(var(--sidebar-foreground))',
                border: '1px solid hsla(var(--sidebar-primary), 0.3)',
                '&:hover': { 
                  bgcolor: 'hsla(var(--sidebar-primary), 0.15)',
                  boxShadow: '0 0 20px hsla(var(--sidebar-primary), 0.2)'
                }
              }}
            >
              <ListItemIcon><BarChart sx={{ color: 'hsl(var(--sidebar-primary))' }} /></ListItemIcon>
              {!collapsed && <ListItemText primary={<Typography fontWeight="600">Statistics</Typography>} />}
            </ListItemButton>

            <ListItemButton 
              onClick={() => navigate('/routes/history')}
              sx={{ 
                mb: 2,
                borderRadius: 2,
                bgcolor: isActive('/routes/history') ? 'hsla(var(--sidebar-primary), 0.15)' : 'hsla(var(--sidebar-primary), 0.1)',
                color: 'hsl(var(--sidebar-foreground))',
                border: '1px solid hsla(var(--sidebar-primary), 0.3)',
                '&:hover': { 
                  bgcolor: 'hsla(var(--sidebar-primary), 0.15)',
                  boxShadow: '0 0 20px hsla(var(--sidebar-primary), 0.2)'
                }
              }}
            >
              <ListItemIcon><History sx={{ color: 'hsl(var(--sidebar-primary))' }} /></ListItemIcon>
              {!collapsed && <ListItemText primary={<Typography fontWeight="600">History</Typography>} />}
            </ListItemButton>

            <ListItemButton 
              onClick={() => navigate('/route-areas')}
              sx={{ 
                mb: 1.5,
                borderRadius: 2,
                bgcolor: isActive('/route-areas') ? 'hsla(var(--sidebar-primary), 0.15)' : 'hsla(var(--sidebar-primary), 0.1)',
                color: 'hsl(var(--sidebar-foreground))',
                border: '1px solid hsla(var(--sidebar-primary), 0.3)',
                '&:hover': { 
                  bgcolor: 'hsla(var(--sidebar-primary), 0.15)',
                  boxShadow: '0 0 20px hsla(var(--sidebar-primary), 0.2)'
                }
              }}
            >
              <ListItemIcon><Map sx={{ color: 'hsl(var(--sidebar-primary))' }} /></ListItemIcon>
              {!collapsed && <ListItemText primary={<Typography fontWeight="600">All Route Areas</Typography>} />}
            </ListItemButton>

            <ListItemButton 
              onClick={() => navigate('/route-areas/new')}
              sx={{ 
                mb: 1.5,
                borderRadius: 2,
                bgcolor: isActive('/route-areas/new') ? 'hsla(var(--sidebar-primary), 0.15)' : 'hsla(var(--sidebar-primary), 0.1)',
                color: 'hsl(var(--sidebar-foreground))',
                border: '1px solid hsla(var(--sidebar-primary), 0.3)',
                '&:hover': { 
                  bgcolor: 'hsla(var(--sidebar-primary), 0.15)',
                  boxShadow: '0 0 20px hsla(var(--sidebar-primary), 0.2)'
                }
              }}
            >
              <ListItemIcon><Add sx={{ color: 'hsl(var(--sidebar-primary))' }} /></ListItemIcon>
              {!collapsed && <ListItemText primary={<Typography fontWeight="600">Create Route Area</Typography>} />}
            </ListItemButton>
          </>
        )}

        {/* Delivery Persons Section */}
        {currentSection === 'delivery-persons' && (
          <>
            <Box sx={{ mb: 2, px: 2 }}>
              {!collapsed && (
                <Typography variant="h6" fontWeight="700" sx={{ color: 'hsl(var(--sidebar-primary))' }}>
                  Delivery Persons
                </Typography>
              )}
            </Box>

            <ListItemButton 
              onClick={() => navigate('/delivery-persons')}
              sx={{ 
                mb: 1.5,
                borderRadius: 2,
                bgcolor: isActive('/delivery-persons') ? 'hsla(var(--sidebar-primary), 0.15)' : 'hsla(var(--sidebar-primary), 0.1)',
                color: 'hsl(var(--sidebar-foreground))',
                border: '1px solid hsla(var(--sidebar-primary), 0.3)',
                '&:hover': { 
                  bgcolor: 'hsla(var(--sidebar-primary), 0.15)',
                  boxShadow: '0 0 20px hsla(var(--sidebar-primary), 0.2)'
                }
              }}
            >
              <ListItemIcon><Group sx={{ color: 'hsl(var(--sidebar-primary))' }} /></ListItemIcon>
              {!collapsed && <ListItemText primary={<Typography fontWeight="600">All Delivery Persons</Typography>} />}
            </ListItemButton>

            <ListItemButton 
              onClick={() => navigate('/delivery-persons/create')}
              sx={{ 
                mb: 1.5,
                borderRadius: 2,
                bgcolor: isActive('/delivery-persons/create') ? 'hsla(var(--sidebar-primary), 0.15)' : 'hsla(var(--sidebar-primary), 0.1)',
                color: 'hsl(var(--sidebar-foreground))',
                border: '1px solid hsla(var(--sidebar-primary), 0.3)',
                '&:hover': { 
                  bgcolor: 'hsla(var(--sidebar-primary), 0.15)',
                  boxShadow: '0 0 20px hsla(var(--sidebar-primary), 0.2)'
                }
              }}
            >
              <ListItemIcon><Add sx={{ color: 'hsl(var(--sidebar-primary))' }} /></ListItemIcon>
              {!collapsed && <ListItemText primary={<Typography fontWeight="600">Add Delivery Person</Typography>} />}
            </ListItemButton>

            <ListItemButton 
              onClick={() => navigate('/delivery-persons/statistics')}
              sx={{ 
                mb: 1.5,
                borderRadius: 2,
                bgcolor: isActive('/delivery-persons/statistics') ? 'hsla(var(--sidebar-primary), 0.15)' : 'hsla(var(--sidebar-primary), 0.1)',
                color: 'hsl(var(--sidebar-foreground))',
                border: '1px solid hsla(var(--sidebar-primary), 0.3)',
                '&:hover': { 
                  bgcolor: 'hsla(var(--sidebar-primary), 0.15)',
                  boxShadow: '0 0 20px hsla(var(--sidebar-primary), 0.2)'
                }
              }}
            >
              <ListItemIcon><BarChart sx={{ color: 'hsl(var(--sidebar-primary))' }} /></ListItemIcon>
              {!collapsed && <ListItemText primary={<Typography fontWeight="600">Statistics</Typography>} />}
            </ListItemButton>
          </>
        )}

        {/* Products Section */}
        {currentSection === 'products' && (
          <>
            <Box sx={{ mb: 2, px: 2 }}>
              {!collapsed && (
                <Typography variant="h6" fontWeight="700" sx={{ color: 'hsl(var(--sidebar-primary))' }}>
                  Products Management
                </Typography>
              )}
            </Box>

            {/* Products Group */}
            <ListItemButton 
              onClick={() => setProductsOpen(!productsOpen)}
              sx={{ 
                mb: 0.5,
                borderRadius: 2,
                bgcolor: 'hsla(var(--sidebar-primary), 0.05)',
                color: 'hsl(var(--sidebar-foreground))',
                border: '1px solid hsla(var(--sidebar-primary), 0.2)',
                '&:hover': { 
                  bgcolor: 'hsla(var(--sidebar-primary), 0.1)',
                }
              }}
            >
              <ListItemIcon><Inventory sx={{ color: 'hsl(var(--sidebar-primary))' }} /></ListItemIcon>
              {!collapsed && (
                <>
                  <ListItemText primary={<Typography fontWeight="600">Products</Typography>} />
                  {productsOpen ? <ExpandLess /> : <ExpandMore />}
                </>
              )}
            </ListItemButton>

            <Collapse in={productsOpen && !collapsed} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton 
                  onClick={() => navigate('/products/create')}
                  sx={{ 
                    pl: 4,
                    mb: 0.5,
                    borderRadius: 2,
                    bgcolor: isActive('/products/create') ? 'hsla(var(--sidebar-primary), 0.15)' : 'transparent',
                    color: 'hsl(var(--sidebar-foreground))',
                    '&:hover': { 
                      bgcolor: 'hsla(var(--sidebar-primary), 0.1)',
                    }
                  }}
                >
                  <ListItemIcon><Add sx={{ color: 'hsl(var(--sidebar-primary))', fontSize: 20 }} /></ListItemIcon>
                  <ListItemText primary={<Typography fontSize="0.9rem">Create</Typography>} />
                </ListItemButton>

                <ListItemButton 
                  onClick={() => navigate('/products')}
                  sx={{ 
                    pl: 4,
                    mb: 0.5,
                    borderRadius: 2,
                    bgcolor: isActive('/products') ? 'hsla(var(--sidebar-primary), 0.15)' : 'transparent',
                    color: 'hsl(var(--sidebar-foreground))',
                    '&:hover': { 
                      bgcolor: 'hsla(var(--sidebar-primary), 0.1)',
                    }
                  }}
                >
                  <ListItemIcon><ViewModule sx={{ color: 'hsl(var(--sidebar-primary))', fontSize: 20 }} /></ListItemIcon>
                  <ListItemText primary={<Typography fontSize="0.9rem">List All</Typography>} />
                </ListItemButton>
              </List>
            </Collapse>

            {/* Units Group */}
            <ListItemButton 
              onClick={() => setUnitsOpen(!unitsOpen)}
              sx={{ 
                mb: 0.5,
                mt: 1,
                borderRadius: 2,
                bgcolor: 'hsla(var(--sidebar-primary), 0.05)',
                color: 'hsl(var(--sidebar-foreground))',
                border: '1px solid hsla(var(--sidebar-primary), 0.2)',
                '&:hover': { 
                  bgcolor: 'hsla(var(--sidebar-primary), 0.1)',
                }
              }}
            >
              <ListItemIcon><Straighten sx={{ color: 'hsl(var(--sidebar-primary))' }} /></ListItemIcon>
              {!collapsed && (
                <>
                  <ListItemText primary={<Typography fontWeight="600">Units</Typography>} />
                  {unitsOpen ? <ExpandLess /> : <ExpandMore />}
                </>
              )}
            </ListItemButton>

            <Collapse in={unitsOpen && !collapsed} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton 
                  onClick={() => navigate('/units/create')}
                  sx={{ 
                    pl: 4,
                    mb: 0.5,
                    borderRadius: 2,
                    bgcolor: isActive('/units/create') ? 'hsla(var(--sidebar-primary), 0.15)' : 'transparent',
                    color: 'hsl(var(--sidebar-foreground))',
                    '&:hover': { 
                      bgcolor: 'hsla(var(--sidebar-primary), 0.1)',
                    }
                  }}
                >
                  <ListItemIcon><Add sx={{ color: 'hsl(var(--sidebar-primary))', fontSize: 20 }} /></ListItemIcon>
                  <ListItemText primary={<Typography fontSize="0.9rem">Create</Typography>} />
                </ListItemButton>

                <ListItemButton 
                  onClick={() => navigate('/units')}
                  sx={{ 
                    pl: 4,
                    mb: 0.5,
                    borderRadius: 2,
                    bgcolor: isActive('/units') ? 'hsla(var(--sidebar-primary), 0.15)' : 'transparent',
                    color: 'hsl(var(--sidebar-foreground))',
                    '&:hover': { 
                      bgcolor: 'hsla(var(--sidebar-primary), 0.1)',
                    }
                  }}
                >
                  <ListItemIcon><ViewModule sx={{ color: 'hsl(var(--sidebar-primary))', fontSize: 20 }} /></ListItemIcon>
                  <ListItemText primary={<Typography fontSize="0.9rem">List All</Typography>} />
                </ListItemButton>
              </List>
            </Collapse>

            {/* Product Variants Group */}
            <ListItemButton 
              onClick={() => setVariantsOpen(!variantsOpen)}
              sx={{ 
                mb: 0.5,
                mt: 1,
                borderRadius: 2,
                bgcolor: 'hsla(var(--sidebar-primary), 0.05)',
                color: 'hsl(var(--sidebar-foreground))',
                border: '1px solid hsla(var(--sidebar-primary), 0.2)',
                '&:hover': { 
                  bgcolor: 'hsla(var(--sidebar-primary), 0.1)',
                }
              }}
            >
              <ListItemIcon><Inventory sx={{ color: 'hsl(var(--sidebar-primary))' }} /></ListItemIcon>
              {!collapsed && (
                <>
                  <ListItemText primary={<Typography fontWeight="600">Product Variants</Typography>} />
                  {variantsOpen ? <ExpandLess /> : <ExpandMore />}
                </>
              )}
            </ListItemButton>

            <Collapse in={variantsOpen && !collapsed} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton 
                  onClick={() => navigate('/variants/create')}
                  sx={{ 
                    pl: 4,
                    mb: 0.5,
                    borderRadius: 2,
                    bgcolor: isActive('/variants/create') ? 'hsla(var(--sidebar-primary), 0.15)' : 'transparent',
                    color: 'hsl(var(--sidebar-foreground))',
                    '&:hover': { 
                      bgcolor: 'hsla(var(--sidebar-primary), 0.1)',
                    }
                  }}
                >
                  <ListItemIcon><Add sx={{ color: 'hsl(var(--sidebar-primary))', fontSize: 20 }} /></ListItemIcon>
                  <ListItemText primary={<Typography fontSize="0.9rem">Create</Typography>} />
                </ListItemButton>

                <ListItemButton 
                  onClick={() => navigate('/products')}
                  sx={{ 
                    pl: 4,
                    mb: 0.5,
                    borderRadius: 2,
                    bgcolor: 'transparent',
                    color: 'hsl(var(--sidebar-foreground))',
                    '&:hover': { 
                      bgcolor: 'hsla(var(--sidebar-primary), 0.1)',
                    }
                  }}
                >
                  <ListItemIcon><ViewModule sx={{ color: 'hsl(var(--sidebar-primary))', fontSize: 20 }} /></ListItemIcon>
                  <ListItemText primary={<Typography fontSize="0.9rem">List All</Typography>} />
                </ListItemButton>

                <ListItemButton 
                  onClick={() => navigate('/products/statistics')}
                  sx={{ 
                    pl: 4,
                    mb: 0.5,
                    borderRadius: 2,
                    bgcolor: isActive('/products/statistics') ? 'hsla(var(--sidebar-primary), 0.15)' : 'transparent',
                    color: 'hsl(var(--sidebar-foreground))',
                    '&:hover': { 
                      bgcolor: 'hsla(var(--sidebar-primary), 0.1)',
                    }
                  }}
                >
                  <ListItemIcon><BarChart sx={{ color: 'hsl(var(--sidebar-primary))', fontSize: 20 }} /></ListItemIcon>
                  <ListItemText primary={<Typography fontSize="0.9rem">Statistics</Typography>} />
                </ListItemButton>
              </List>
            </Collapse>
          </>
        )}

        {/* Settings Section */}
        {currentSection === 'settings' && (
          <>
            <Box sx={{ mb: 2, px: 2 }}>
              {!collapsed && (
                <Typography variant="h6" fontWeight="700" sx={{ color: 'hsl(var(--sidebar-primary))' }}>
                  Settings
                </Typography>
              )}
            </Box>

            <ListItemButton 
              onClick={() => navigate('/settings')}
              sx={{ 
                mb: 1.5,
                borderRadius: 2,
                bgcolor: 'hsla(var(--sidebar-primary), 0.15)',
                color: 'hsl(var(--sidebar-foreground))',
                border: '1px solid hsla(var(--sidebar-primary), 0.3)',
                '&:hover': { 
                  bgcolor: 'hsla(var(--sidebar-primary), 0.15)',
                  boxShadow: '0 0 20px hsla(var(--sidebar-primary), 0.2)'
                }
              }}
            >
              <ListItemIcon><Settings sx={{ color: 'hsl(var(--sidebar-primary))' }} /></ListItemIcon>
              {!collapsed && <ListItemText primary={<Typography fontWeight="600">General Settings</Typography>} />}
            </ListItemButton>
          </>
        )}
      </List>
    </Box>
  );
}