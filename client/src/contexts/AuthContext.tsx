import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: number;
  employee_id: string;  // Changed from user_id
  full_name: string;     // Changed from username
  email: string;
  phone?: string;
  is_active: boolean;
  is_superuser: boolean; // Django superuser status
  is_staff: boolean;     // Django staff status
  roles: string[];       // NEW: Array of role names
  permissions: string[]; // NEW: Array of permission codenames
}

interface AuthContextType {
  user: User | null;
  login: (employeeId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (...roles: string[]) => boolean;
  hasPermission: (resource: string, action: string) => boolean;
  hasAnyPermission: (...permissions: Array<[string, string]>) => boolean;
  hasAllPermissions: (...permissions: Array<[string, string]>) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');

    if (accessToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (employeeId: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/login/', {
        employee_id: employeeId,  // Changed from user_id
        password: password,
      });

      const { access, refresh, user: userData } = response.data;

      // Store tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await axios.post('http://localhost:8000/api/auth/logout/', {
          refresh: refreshToken,
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state and storage
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  };

  const hasRole = (...roles: string[]) => {
    if (!user || !user.roles) return false;
    return roles.some(role => user.roles.includes(role));
  };

  const hasPermission = (resource: string, action: string) => {
    if (!user) return false;
    // Superusers have all permissions
    if (user.is_superuser) return true;
    if (!user.permissions) return false;
    const codename = `${resource}.${action}`;
    return user.permissions.includes(codename);
  };

  const hasAnyPermission = (...permissions: Array<[string, string]>) => {
    if (!user) return false;
    // Superusers have all permissions
    if (user.is_superuser) return true;
    if (!user.permissions) return false;
    return permissions.some(([resource, action]) => {
      const codename = `${resource}.${action}`;
      return user.permissions.includes(codename);
    });
  };

  const hasAllPermissions = (...permissions: Array<[string, string]>) => {
    if (!user) return false;
    // Superusers have all permissions
    if (user.is_superuser) return true;
    if (!user.permissions) return false;
    return permissions.every(([resource, action]) => {
      const codename = `${resource}.${action}`;
      return user.permissions.includes(codename);
    });
  };

  const isAuthenticated = !!user;

  if (loading) {
    return null; // or a loading spinner
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated,
      hasRole,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
