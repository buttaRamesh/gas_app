import { Box, Tabs, Tab, useTheme } from '@mui/material';
import {
  Person as PersonIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  Assignment as AssignmentIcon,
  Add as AddIcon,
  Cable as ConnectionIcon,
  Route as RouteIcon,
} from '@mui/icons-material';
import type { TabValue } from '../types';

interface ConsumerTabsProps {
  value: TabValue;
  onChange: (value: TabValue) => void;
}

export function ConsumerTabs({ value, onChange }: ConsumerTabsProps) {
  const theme = useTheme();

  const handleChange = (_event: React.SyntheticEvent, newValue: TabValue) => {
    onChange(newValue);
  };

  return (
    <Box
      sx={{
        borderBottom: 2,
        borderColor: 'rgba(102, 126, 234, 0.1)',
        bgcolor: 'white',
      }}
    >
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
              color: theme.palette.primary.main,
            },
            '&.Mui-selected': {
              color: theme.palette.primary.main,
            },
          },
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
            background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
          },
        }}
      >
        <Tab label="Personal" icon={<PersonIcon />} iconPosition="start" />
        <Tab label="Address" icon={<HomeIcon />} iconPosition="start" />
        <Tab label="Contact" icon={<PhoneIcon />} iconPosition="start" />
        <Tab label="Identifications" icon={<AssignmentIcon />} iconPosition="start" />
        <Tab label="Additional" icon={<AddIcon />} iconPosition="start" />
        <Tab label="Connections" icon={<ConnectionIcon />} iconPosition="start" />
        <Tab label="Route" icon={<RouteIcon />} iconPosition="start" />
      </Tabs>
    </Box>
  );
}
