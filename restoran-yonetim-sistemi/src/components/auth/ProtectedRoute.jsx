import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import tokenManager from '../../utils/tokenManager';

const ProtectedRoute = ({ children, requiredRole, allowedRoles = [] }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [hasValidAccess, setHasValidAccess] = useState(false);

  useEffect(() => {
    const validateAccess = async () => {
      setIsValidating(true);
      
      try {
        // Check if token exists and is valid
        const token = tokenManager.getToken();
        if (!token) {
          setHasValidAccess(false);
          setIsValidating(false);
          return;
        }

        // Check if user is loaded and has valid role
        if (user && (user.roleId !== null && user.roleId !== undefined)) {
          // Check role-based access
          const userRole = user.role || getRoleFromId(user.roleId);
          
          let hasAccess = false;
          
          if (requiredRole) {
            // Specific role required
            hasAccess = (userRole === requiredRole) || (user.roleId === getRoleIdFromName(requiredRole));
          } else if (allowedRoles.length > 0) {
            // Multiple roles allowed
            hasAccess = allowedRoles.includes(userRole) || 
                       allowedRoles.some(role => user.roleId === getRoleIdFromName(role));
          } else {
            // Any authenticated user allowed
            hasAccess = true;
          }

          setHasValidAccess(hasAccess);
        } else {
          setHasValidAccess(false);
        }
      } catch (error) {
        console.error('Error validating access:', error);
        setHasValidAccess(false);
      } finally {
        setIsValidating(false);
      }
    };

    if (!loading) {
      validateAccess();
    }
  }, [user, loading, requiredRole, allowedRoles]);

  // Helper functions for role mapping
  const getRoleFromId = (id) => {
    const roleMapping = { 0: 'admin', 1: 'garson', 2: 'kasiyer' };
    return roleMapping[id];
  };

  const getRoleIdFromName = (name) => {
    if (!name) return undefined;
    const normalized = String(name).toLowerCase();
    if (normalized === 'admin') return 0;
    if (normalized === 'garson') return 1;
    if (normalized === 'kasiyer') return 2;
    return undefined;
  };

  // Show loading while validating
  if (loading || isValidating) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '16px',
        color: '#666'
      }}>
        Yetkilendirme kontrol ediliyor...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user || !hasValidAccess) {
    // Save the attempted location for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated and authorized
  return children;
};

export default ProtectedRoute;
