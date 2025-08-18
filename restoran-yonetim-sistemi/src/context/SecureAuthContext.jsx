/**
 * Secure Authentication Context - HttpOnly Cookie Based
 * 
 * This context provides authentication state without storing tokens client-side.
 * All authentication is handled via secure HttpOnly cookies set by the backend.
 * 
 * Security Benefits:
 * - No client-side token storage (immune to XSS)
 * - Automatic token transmission via cookies
 * - Backend-controlled session management
 * - CSRF protection via SameSite cookies
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import httpOnlyAuth from '../utils/httpOnlyAuth.js';

export const SecureAuthContext = createContext();

const DEBUG_AUTH = import.meta?.env?.VITE_DEBUG_AUTH === 'true';

const roleMapping = {
    0: 'admin',
    1: 'garson',
    2: 'kasiyer'
};

const getRoleFromId = (id) => roleMapping[id];

/**
 * Secure Authentication Provider
 * No client-side token storage - uses HttpOnly cookies
 */
export function SecureAuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Initialize authentication state on app load
    useEffect(() => {
        validateAndInitializeAuth();
    }, []);

    /**
     * Validate authentication status without client-side tokens
     */
    const validateAndInitializeAuth = async () => {
        try {
            setLoading(true);
            
            // Backend validates HttpOnly cookie and returns user data
            const userData = await httpOnlyAuth.getCurrentUser();
            
            if (userData && userData.userId) {
                setUser(userData);
                setIsAuthenticated(true);
                if (DEBUG_AUTH) console.log('[SecureAuthContext] User authenticated via HttpOnly cookie');
            } else {
                setUser(null);
                setIsAuthenticated(false);
                if (DEBUG_AUTH) console.log('[SecureAuthContext] No valid authentication found');
            }
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
            if (DEBUG_AUTH) console.log('[SecureAuthContext] Authentication validation failed:', error.message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Secure login - backend sets HttpOnly cookie
     */
    const login = async (email, password) => {
        setLoading(true);
        try {
            if (DEBUG_AUTH) console.log('[SecureAuthContext] Starting secure login process');
            
            const response = await httpOnlyAuth.login({ email, password });
            
            if (response.success) {
                // Get user data from backend (cookie is automatically set)
                const userData = await httpOnlyAuth.getCurrentUser();
                
                if (userData) {
                    setUser(userData);
                    setIsAuthenticated(true);
                    setLoading(false);
                    
                    if (DEBUG_AUTH) console.log('[SecureAuthContext] Secure login completed successfully');
                    return userData.roleId;
                } else {
                    throw new Error('Kullanıcı bilgileri alınamadı');
                }
            } else {
                setLoading(false);
                throw new Error(response.message || 'Geçersiz email veya şifre');
            }
        } catch (error) {
            setLoading(false);
            setUser(null);
            setIsAuthenticated(false);
            
            console.error('Secure login failed:', error.message);
            
            // Handle connection errors
            if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
                throw new Error('Backend sunucusuna bağlanılamıyor. Lütfen sunucunun çalıştığından emin olun.');
            }
            
            throw new Error(error.message);
        }
    };

    /**
     * Secure logout - backend clears HttpOnly cookie
     */
    const logout = async () => {
        try {
            await httpOnlyAuth.logout();
        } catch (error) {
            if (DEBUG_AUTH) console.warn('[SecureAuthContext] Logout error:', error.message);
        } finally {
            // Always clear local state regardless of backend response
            setUser(null);
            setIsAuthenticated(false);
            if (DEBUG_AUTH) console.log('[SecureAuthContext] User logged out');
        }
    };

    /**
     * Check if user has specific role
     */
    const hasRole = (requiredRole) => {
        if (!user) return false;
        
        const userRole = typeof user.role === 'string' ? user.role : getRoleFromId(user.roleId);
        return userRole === requiredRole;
    };

    /**
     * Check if user is admin
     */
    const isAdmin = () => hasRole('admin');

    /**
     * Refresh user data (useful after profile updates)
     */
    const refreshUser = async () => {
        try {
            const userData = await httpOnlyAuth.getCurrentUser();
            if (userData) {
                setUser(userData);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            if (DEBUG_AUTH) console.warn('[SecureAuthContext] User refresh failed:', error.message);
        }
    };

    const contextValue = {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        hasRole,
        isAdmin,
        refreshUser,
        validateAndInitializeAuth
    };

    return (
        <SecureAuthContext.Provider value={contextValue}>
            {children}
        </SecureAuthContext.Provider>
    );
}

/**
 * Hook to use secure authentication context
 */
export function useSecureAuth() {
    const context = useContext(SecureAuthContext);
    if (!context) {
        throw new Error('useSecureAuth must be used within a SecureAuthProvider');
    }
    return context;
}

export default SecureAuthContext;
