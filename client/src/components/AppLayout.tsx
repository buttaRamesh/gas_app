import { useState } from 'react';
import { Box } from '@mui/material';
import { AppSidebar } from './AppSidebar';
import { AppToolbar } from './AppToolbar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppToolbar />
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          marginLeft: sidebarCollapsed ? '80px' : '300px',
          marginTop: '64px', // Height of the toolbar
          transition: 'margin-left 0.3s ease',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}