/**
 * Authentication Mode Toggle
 * 
 * This utility allows switching between legacy token authentication 
 * and secure HttpOnly cookie authentication based on configuration.
 */

import { AuthContext, AuthProvider } from './AuthContext.jsx';
import { SecureAuthContext, SecureAuthProvider } from './SecureAuthContext.jsx';

// Check if HttpOnly mode is enabled
const USE_HTTPONLY_AUTH = import.meta?.env?.VITE_USE_HTTPONLY_AUTH === 'true';

/**
 * Dynamic Authentication Provider
 * Switches between legacy and HttpOnly authentication based on configuration
 */
export const DynamicAuthProvider = USE_HTTPONLY_AUTH ? SecureAuthProvider : AuthProvider;

/**
 * Dynamic Authentication Context
 * Uses the appropriate context based on authentication mode
 */
export const DynamicAuthContext = USE_HTTPONLY_AUTH ? SecureAuthContext : AuthContext;

/**
 * Hook to use authentication (automatically selects correct implementation)
 */
export function useAuth() {
    if (USE_HTTPONLY_AUTH) {
        // Use secure HttpOnly authentication
        const { useSecureAuth } = require('./SecureAuthContext.jsx');
        return useSecureAuth();
    } else {
        // Use legacy token authentication
        const { useContext } = require('react');
        const context = useContext(AuthContext);
        if (!context) {
            throw new Error('useAuth must be used within an AuthProvider');
        }
        return context;
    }
}

/**
 * Get authentication configuration info
 */
export function getAuthConfig() {
    return {
        mode: USE_HTTPONLY_AUTH ? 'httponly' : 'legacy',
        secure: USE_HTTPONLY_AUTH,
        description: USE_HTTPONLY_AUTH 
            ? 'HttpOnly cookies - Maximum security' 
            : 'Legacy token storage - Development mode'
    };
}

export default {
    DynamicAuthProvider,
    DynamicAuthContext,
    useAuth,
    getAuthConfig
};
