import { AppBar, Toolbar, Typography, Box, Button, Avatar } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

export function AppToolbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await api.post('/auth/logout/', { refresh: refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    logout();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: 1300,
        background: 'linear-gradient(135deg, #78350f 0%, #92400e 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
        {/* Left side - User full name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: '#fbbf24',
              color: '#78350f',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(251,191,36,0.3)',
            }}
          >
            {user.full_name?.charAt(0) || 'U'}
          </Avatar>
          <Typography
            variant="h6"
            fontWeight={600}
            sx={{
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            {user.full_name}
          </Typography>
        </Box>

        {/* Right side - Employee ID and Logout */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box
            sx={{
              px: 2,
              py: 0.5,
              bgcolor: 'rgba(251,191,36,0.2)',
              borderRadius: 2,
              border: '1px solid rgba(251,191,36,0.4)',
            }}
          >
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ color: '#fcd34d' }}
            >
              ID: {user.employee_id}
            </Typography>
          </Box>
          <Button
            onClick={handleLogout}
            variant="outlined"
            startIcon={<LogoutIcon />}
            sx={{
              borderColor: '#fbbf24',
              color: '#fbbf24',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                borderColor: '#f59e0b',
                bgcolor: 'rgba(251,191,36,0.15)',
                boxShadow: '0 0 15px rgba(251,191,36,0.3)',
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
