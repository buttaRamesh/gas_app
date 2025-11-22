import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
  requiredPermission?: string; // Format: "resource.action" (e.g., "consumers.create")
  requiredPermissions?: Array<[string, string]>; // Format: [["resource", "action"], ...]
  requireAllPermissions?: boolean; // If true, user must have ALL permissions in requiredPermissions
}

const ProtectedRoute = ({
  children,
  requiredRoles,
  requiredPermission,
  requiredPermissions,
  requireAllPermissions = false,
}: ProtectedRouteProps) => {
  const { isAuthenticated, hasRole, hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();
  const location = useLocation();

  // If not authenticated, redirect to landing page
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check role-based access (legacy support)
  if (requiredRoles && requiredRoles.length > 0) {
    if (!hasRole(...requiredRoles)) {
      // User doesn't have required role - redirect to access denied
      return <Navigate to="/access-denied" replace />;
    }
  }

  // Check single permission (format: "resource.action")
  if (requiredPermission) {
    const [resource, action] = requiredPermission.split('.');
    if (!hasPermission(resource, action)) {
      // User doesn't have required permission - redirect to access denied
      return <Navigate to="/access-denied" replace />;
    }
  }

  // Check multiple permissions
  if (requiredPermissions && requiredPermissions.length > 0) {
    if (requireAllPermissions) {
      // User must have ALL permissions
      if (!hasAllPermissions(...requiredPermissions)) {
        return <Navigate to="/access-denied" replace />;
      }
    } else {
      // User must have at least ONE permission
      if (!hasAnyPermission(...requiredPermissions)) {
        return <Navigate to="/access-denied" replace />;
      }
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
