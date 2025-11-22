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
  Settings,
  Add,
  Map,
  ViewModule,
  Group,
  People,
  Inventory,
  Category,
  Shield,
  BarChart,
  History,
  LibraryBooks,
  UploadFile,
  Storefront,
  Label,
  Style,
  Business,
  Store,
  Cable,
  AccountBalance,
  LocalOffer,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

interface AppSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

// Navigation configuration
interface NavSubItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  permission?: { resource: string; action: string };
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  permission?: { resource: string; action: string };
  badge?: string;
  children?: NavSubItem[];
}

const navigationConfig: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Home sx={{ color: '#fbbf24' }} />,
    path: '/dashboard',
  },
  {
    id: 'routes',
    label: 'Routes',
    icon: <LocalShipping sx={{ color: '#fbbf24' }} />,
    permission: { resource: 'routes', action: 'view' },
    children: [
      {
        id: 'routes-all',
        label: 'All Routes',
        icon: <ViewModule fontSize="small" />,
        path: '/routes',
      },
      {
        id: 'routes-add',
        label: 'Add Route',
        icon: <Add fontSize="small" />,
        path: '/routes/new',
        permission: { resource: 'routes', action: 'create' },
      },
      {
        id: 'route-areas',
        label: 'Route Areas',
        icon: <Map fontSize="small" />,
        path: '/route-areas',
      },
      {
        id: 'routes-statistics',
        label: 'Statistics',
        icon: <BarChart fontSize="small" />,
        path: '/routes/statistics',
      },
      {
        id: 'routes-history',
        label: 'History',
        icon: <History fontSize="small" />,
        path: '/routes/history',
      },
      {
        id: 'routes-consumers',
        label: 'Consumers by Route',
        icon: <People fontSize="small" />,
        path: '/routes/consumers',
      },
    ],
  },
  {
    id: 'delivery-persons',
    label: 'Delivery Persons',
    icon: <Group sx={{ color: '#fbbf24' }} />,
    permission: { resource: 'delivery_persons', action: 'view' },
    children: [
      {
        id: 'delivery-persons-all',
        label: 'All Delivery Persons',
        icon: <ViewModule fontSize="small" />,
        path: '/delivery-persons',
      },
      {
        id: 'delivery-persons-add',
        label: 'Add Delivery Person',
        icon: <Add fontSize="small" />,
        path: '/delivery-persons/create',
        permission: { resource: 'delivery_persons', action: 'create' },
      },
      {
        id: 'delivery-persons-statistics',
        label: 'Statistics',
        icon: <BarChart fontSize="small" />,
        path: '/delivery-persons/statistics',
      },
      {
        id: 'delivery-persons-consumers',
        label: 'Consumers by Person',
        icon: <People fontSize="small" />,
        path: '/delivery-persons/consumers',
      },
    ],
  },
  {
    id: 'consumers',
    label: 'Consumers',
    icon: <People sx={{ color: '#fbbf24' }} />,
    permission: { resource: 'consumers', action: 'view' },
    children: [
      {
        id: 'consumers-all',
        label: 'All Consumers',
        icon: <ViewModule fontSize="small" />,
        path: '/consumers',
      },
      {
        id: 'consumers-add',
        label: 'Add Consumer',
        icon: <Add fontSize="small" />,
        path: '/consumers/create',
        permission: { resource: 'consumers', action: 'create' },
      },
      {
        id: 'consumers-kyc',
        label: 'KYC Pending',
        icon: <History fontSize="small" />,
        path: '/consumers/kyc-pending',
      },
      {
        id: 'consumers-statistics',
        label: 'Statistics',
        icon: <BarChart fontSize="small" />,
        path: '/consumers/statistics',
      },
    ],
  },
  {
    id: 'orderbook',
    label: 'Order Book',
    icon: <LibraryBooks sx={{ color: '#fbbf24' }} />,
    permission: { resource: 'order_books', action: 'view' },
    children: [
      {
        id: 'orderbook-all',
        label: 'All Orders',
        icon: <ViewModule fontSize="small" />,
        path: '/orderbook',
      },
      {
        id: 'orderbook-upload',
        label: 'Bulk Upload',
        icon: <UploadFile fontSize="small" />,
        path: '/orderbook/upload',
      },
      {
        id: 'orderbook-upload-history',
        label: 'Upload History',
        icon: <History fontSize="small" />,
        path: '/orderbook/upload-history',
      },
      {
        id: 'orderbook-settings',
        label: 'Field Settings',
        icon: <Settings fontSize="small" />,
        path: '/orderbook/settings',
      },
      {
        id: 'orderbook-statistics',
        label: 'Statistics',
        icon: <BarChart fontSize="small" />,
        path: '/orderbook/statistics',
      },
    ],
  },
  {
    id: 'products',
    label: 'Products',
    icon: <Inventory sx={{ color: '#fbbf24' }} />,
    permission: { resource: 'products', action: 'view' },
    children: [
      {
        id: 'products-all',
        label: 'All Products',
        icon: <ViewModule fontSize="small" />,
        path: '/products',
      },
      {
        id: 'products-add',
        label: 'Add Product',
        icon: <Add fontSize="small" />,
        path: '/products/create',
        permission: { resource: 'products', action: 'create' },
      },
      {
        id: 'products-units',
        label: 'Units',
        icon: <ViewModule fontSize="small" />,
        path: '/units',
        permission: { resource: 'units', action: 'view' },
      },
      {
        id: 'products-add-variant',
        label: 'Add Variant',
        icon: <Add fontSize="small" />,
        path: '/variants/create',
        permission: { resource: 'variants', action: 'create' },
      },
      {
        id: 'products-statistics',
        label: 'Statistics',
        icon: <BarChart fontSize="small" />,
        path: '/products/statistics',
      },
    ],
  },
  {
    id: 'lookups',
    label: 'Lookups',
    icon: <Category sx={{ color: '#fbbf24' }} />,
    permission: { resource: 'lookups', action: 'view' },
    children: [
      {
        id: 'lookups-consumer-categories',
        label: 'Consumer Categories',
        icon: <Label fontSize="small" />,
        path: '/lookups/consumer-categories',
      },
      {
        id: 'lookups-consumer-types',
        label: 'Consumer Types',
        icon: <Style fontSize="small" />,
        path: '/lookups/consumer-types',
      },
      {
        id: 'lookups-dct-types',
        label: 'DCT Types',
        icon: <Business fontSize="small" />,
        path: '/lookups/dct-types',
      },
      {
        id: 'lookups-market-types',
        label: 'Market Types',
        icon: <Store fontSize="small" />,
        path: '/lookups/market-types',
      },
      {
        id: 'lookups-connection-types',
        label: 'Connection Types',
        icon: <Cable fontSize="small" />,
        path: '/lookups/connection-types',
      },
      {
        id: 'lookups-bpl-types',
        label: 'BPL Types',
        icon: <AccountBalance fontSize="small" />,
        path: '/lookups/bpl-types',
      },
      {
        id: 'lookups-schemes',
        label: 'Schemes',
        icon: <LocalOffer fontSize="small" />,
        path: '/lookups/schemes',
      },
    ],
  },
  {
    id: 'user-management',
    label: 'User Management',
    icon: <Shield sx={{ color: '#fbbf24' }} />,
    permission: { resource: 'users', action: 'view' },
    children: [
      {
        id: 'users',
        label: 'All Users',
        icon: <ViewModule fontSize="small" />,
        path: '/users',
      },
      {
        id: 'roles',
        label: 'Roles',
        icon: <Shield fontSize="small" />,
        path: '/roles',
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings sx={{ color: '#fbbf24' }} />,
    path: '/settings',
  },
];

export function AppSidebar({ collapsed = false }: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = useAuth();

  // State for collapsible groups - using Map for dynamic state management
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navigationConfig.forEach((item) => {
      if (item.children) {
        // Auto-open if any child path matches current location
        initial[item.id] = item.children.some((child) => location.pathname.startsWith(child.path));
      }
    });
    return initial;
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isActive = (path: string) => location.pathname === path;
  const isPathActive = (paths: string[]) => paths.some((path) => location.pathname.startsWith(path));

  if (collapsed) {
    return null;
  }

  // Button style helper
  const getButtonStyle = (active: boolean) => ({
    mb: 1.5,
    borderRadius: 2,
    bgcolor: active ? 'rgba(251,191,36,0.2)' : 'rgba(251,191,36,0.1)',
    color: 'white',
    border: '1px solid rgba(251,191,36,0.3)',
    '&:hover': {
      bgcolor: 'rgba(251,191,36,0.15)',
      boxShadow: '0 0 20px rgba(251,191,36,0.2)',
    },
  });

  const subItemStyle = {
    pl: 4,
    borderRadius: 1.5,
    color: 'white',
    '&:hover': { bgcolor: 'rgba(251,191,36,0.1)' },
  };

  // Render a navigation item
  const renderNavItem = (item: NavItem) => {
    // Check permissions
    if (item.permission && !hasPermission(item.permission.resource, item.permission.action)) {
      return null;
    }

    // Get active state
    const paths = item.children ? item.children.map((c) => c.path) : item.path ? [item.path] : [];
    const active = item.path ? isActive(item.path) : isPathActive(paths);

    // Simple navigation item (no children)
    if (!item.children) {
      return (
        <ListItemButton
          key={item.id}
          onClick={() => item.path && navigate(item.path)}
          sx={getButtonStyle(active)}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
          <ListItemText primary={<Typography fontWeight="600">{item.label}</Typography>} />
        </ListItemButton>
      );
    }

    // Collapsible navigation item (with children)
    return (
      <Box key={item.id}>
        <ListItemButton onClick={() => toggleSection(item.id)} sx={getButtonStyle(active)}>
          <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
          <ListItemText primary={<Typography fontWeight="600">{item.label}</Typography>} />
          {item.badge && (
            <Chip
              label={item.badge}
              size="small"
              sx={{
                bgcolor: '#fbbf24',
                color: '#78350f',
                fontWeight: 700,
                fontSize: '0.7rem',
                mr: 1,
              }}
            />
          )}
          {openSections[item.id] ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openSections[item.id]} timeout="auto" unmountOnExit>
          <List
            component="div"
            disablePadding
            sx={{ bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2, mb: 1, p: 0.5 }}
          >
            {item.children.map((child) => {
              // Check child permissions
              if (child.permission && !hasPermission(child.permission.resource, child.permission.action)) {
                return null;
              }

              return (
                <ListItemButton key={child.id} onClick={() => navigate(child.path)} sx={subItemStyle}>
                  {child.icon && <ListItemIcon sx={{ color: '#fcd34d', minWidth: 40 }}>{child.icon}</ListItemIcon>}
                  <ListItemText primary={<Typography variant="body2">{child.label}</Typography>} />
                </ListItemButton>
              );
            })}
          </List>
        </Collapse>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        width: 300,
        height: 'calc(100vh - 64px)',
        bgcolor: '#1c1917',
        position: 'fixed',
        left: 0,
        top: '64px',
        overflow: 'auto',
        zIndex: 1200,
      }}
    >
      {/* Luxury Gold Header */}
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #78350f 0%, #92400e 100%)',
          color: 'white',
          position: 'relative',
          borderBottom: '2px solid #d97706',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Avatar
          sx={{
            width: 60,
            height: 60,
            bgcolor: '#fbbf24',
            color: '#78350f',
            boxShadow: '0 4px 14px rgba(251,191,36,0.5)',
          }}
        >
          <Storefront sx={{ fontSize: 32 }} />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h6"
            fontWeight="800"
            sx={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.2,
            }}
          >
            Lalitha Gas
          </Typography>
          <Typography variant="caption" sx={{ color: '#fcd34d', display: 'block' }}>
            Distribution Agency
          </Typography>
        </Box>
      </Box>


      {/* Navigation List */}
      <List sx={{ p: 2, pb: 20 }}>
        {navigationConfig.map((item) => renderNavItem(item))}
      </List>
    </Box>
  );
}
