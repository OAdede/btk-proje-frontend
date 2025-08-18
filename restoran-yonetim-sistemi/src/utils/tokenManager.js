/**
 * Centralized Token Management Utility
 * 
 * This utility provides secure token management with automatic expiration checking,
 * centralized storage, and preparation for future security enhancements.
 * 
 * Benefits:
 * - Single source of truth for token operations
 * - Automatic expiration validation
 * - Easy to add refresh token logic later
 * - Consistent error handling
 * - Preparation for secure storage migration
 */

import { isTokenExpired } from './jwt.js';

// Configuration for token management
const TOKEN_CONFIG = {
    // Storage keys
    TOKEN_KEY: 'token',
    USER_KEY: 'user',
    REFRESH_TOKEN_KEY: 'refreshToken', // For future use
    
    // Security settings
    AUTO_LOGOUT_ON_EXPIRED: true,
    LOG_TOKEN_OPERATIONS: import.meta.env.DEV, // Only log in development
};

/**
 * TokenManager class - Centralized token operations
 */
class TokenManager {
    constructor() {
        this.onTokenExpired = null; // Callback for when token expires
        this.onAuthError = null;    // Callback for auth errors
    }

    /**
     * Get the current token with automatic expiration checking
     * @returns {string|null} Valid token or null if expired/missing
     */
    getToken() {
        try {
            const token = localStorage.getItem(TOKEN_CONFIG.TOKEN_KEY);
            
            if (!token) {
                if (TOKEN_CONFIG.LOG_TOKEN_OPERATIONS) {
                    console.log('[TokenManager] No token found');
                }
                return null;
            }

            // Check if token is expired
            if (isTokenExpired(token)) {
                if (TOKEN_CONFIG.LOG_TOKEN_OPERATIONS) {
                    console.warn('[TokenManager] Token expired, removing from storage');
                }
                
                // Auto-cleanup expired token
                this.clearToken();
                
                // Notify app of token expiration
                if (this.onTokenExpired) {
                    this.onTokenExpired();
                }
                
                return null;
            }

            return token;
        } catch (error) {
            console.error('[TokenManager] Error getting token:', error);
            return null;
        }
    }

    /**
     * Set a new token with validation
     * @param {string} token - JWT token to store
     * @returns {boolean} Success status
     */
    setToken(token) {
        try {
            if (!token || typeof token !== 'string') {
                console.error('[TokenManager] Invalid token provided');
                return false;
            }

            // Validate token is not expired before storing
            if (isTokenExpired(token)) {
                console.error('[TokenManager] Cannot store expired token');
                return false;
            }

            localStorage.setItem(TOKEN_CONFIG.TOKEN_KEY, token);
            
            if (TOKEN_CONFIG.LOG_TOKEN_OPERATIONS) {
                console.log('[TokenManager] Token stored successfully');
            }
            
            return true;
        } catch (error) {
            console.error('[TokenManager] Error setting token:', error);
            return false;
        }
    }

    /**
     * Check if user is authenticated (has valid token)
     * @returns {boolean} Authentication status
     */
    isAuthenticated() {
        return this.getToken() !== null;
    }

    /**
     * Get authorization header for API requests
     * @returns {object|null} Headers object or null if no valid token
     */
    getAuthHeader() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : null;
    }

    /**
     * Get authorization headers with common headers
     * @param {object} additionalHeaders - Extra headers to include
     * @returns {object} Complete headers object
     */
    getHeaders(additionalHeaders = {}) {
        const baseHeaders = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...additionalHeaders
        };

        const authHeader = this.getAuthHeader();
        return authHeader ? { ...baseHeaders, ...authHeader } : baseHeaders;
    }

    /**
     * Clear token and related data
     */
    clearToken() {
        try {
            localStorage.removeItem(TOKEN_CONFIG.TOKEN_KEY);
            localStorage.removeItem(TOKEN_CONFIG.USER_KEY);
            // Clear other auth-related data
            localStorage.removeItem('profileImage');
            localStorage.removeItem('phoneNumber');
            localStorage.removeItem('email');
            localStorage.removeItem('displayName');
            localStorage.removeItem('displayRole');
            
            if (TOKEN_CONFIG.LOG_TOKEN_OPERATIONS) {
                console.log('[TokenManager] Token and related data cleared');
            }
        } catch (error) {
            console.error('[TokenManager] Error clearing token:', error);
        }
    }

    /**
     * Attempt to refresh the token using refresh token
     * @returns {Promise<boolean>} Success status
     */
    async refreshToken() {
        try {
            const refreshToken = localStorage.getItem(TOKEN_CONFIG.REFRESH_TOKEN_KEY);
            
            if (!refreshToken) {
                if (TOKEN_CONFIG.LOG_TOKEN_OPERATIONS) {
                    console.log('[TokenManager] No refresh token available');
                }
                return false;
            }

            const API_BASE_URL = (import.meta?.env?.VITE_API_BASE_URL) || '/api';
            const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${refreshToken}`
                }
            });

            if (!response.ok) {
                if (TOKEN_CONFIG.LOG_TOKEN_OPERATIONS) {
                    console.warn('[TokenManager] Refresh token failed:', response.status);
                }
                // Clear invalid refresh token
                localStorage.removeItem(TOKEN_CONFIG.REFRESH_TOKEN_KEY);
                return false;
            }

            const data = await response.json();
            
            if (data.token) {
                // Store new token
                const success = this.setToken(data.token);
                
                // Store new refresh token if provided
                if (data.refreshToken) {
                    localStorage.setItem(TOKEN_CONFIG.REFRESH_TOKEN_KEY, data.refreshToken);
                }
                
                if (TOKEN_CONFIG.LOG_TOKEN_OPERATIONS) {
                    console.log('[TokenManager] Token refreshed successfully');
                }
                
                return success;
            }
            
            return false;
        } catch (error) {
            console.error('[TokenManager] Token refresh error:', error);
            // Clear potentially invalid refresh token
            localStorage.removeItem(TOKEN_CONFIG.REFRESH_TOKEN_KEY);
            return false;
        }
    }

    /**
     * Check if token is close to expiration and attempt refresh
     * @param {number} thresholdMinutes - Minutes before expiration to trigger refresh
     * @returns {Promise<boolean>} Whether token is valid after check
     */
    async checkAndRefreshToken(thresholdMinutes = 5) {
        const token = this.getToken();
        
        if (!token) {
            return false;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Math.floor(Date.now() / 1000);
            const timeUntilExpiry = payload.exp - now;
            const thresholdSeconds = thresholdMinutes * 60;

            // If token expires within threshold, attempt refresh
            if (timeUntilExpiry < thresholdSeconds) {
                if (TOKEN_CONFIG.LOG_TOKEN_OPERATIONS) {
                    console.log(`[TokenManager] Token expires in ${timeUntilExpiry}s, attempting refresh`);
                }
                return await this.refreshToken();
            }

            return true; // Token is still valid
        } catch (error) {
            console.error('[TokenManager] Error checking token expiration:', error);
            return false;
        }
    }

    /**
     * Handle token expiration (called automatically or manually)
     */
    handleTokenExpiration() {
        if (TOKEN_CONFIG.LOG_TOKEN_OPERATIONS) {
            console.warn('[TokenManager] Handling token expiration');
        }
        
        this.clearToken();
        
        // Notify the app (AuthContext can listen to this)
        if (this.onTokenExpired) {
            this.onTokenExpired();
        }
    }

    /**
     * Set callback for token expiration events
     * @param {function} callback - Function to call when token expires
     */
    onTokenExpiredCallback(callback) {
        this.onTokenExpired = callback;
    }

    /**
     * Set callback for authentication errors
     * @param {function} callback - Function to call on auth errors
     */
    onAuthErrorCallback(callback) {
        this.onAuthError = callback;
    }

    /**
     * Get token info for debugging (safe - doesn't expose full token)
     * @returns {object} Safe token information
     */
    getTokenInfo() {
        const token = localStorage.getItem(TOKEN_CONFIG.TOKEN_KEY);
        if (!token) return { exists: false };

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Math.floor(Date.now() / 1000);
            
            return {
                exists: true,
                expired: isTokenExpired(token),
                expiresAt: payload.exp,
                expiresIn: payload.exp - now,
                issuer: payload.iss,
                // Don't expose sensitive data
                preview: `${token.substring(0, 10)}...${token.substring(token.length - 10)}`
            };
        } catch (error) {
            return { 
                exists: true, 
                error: 'Invalid token format',
                preview: `${token.substring(0, 10)}...`
            };
        }
    }
}

// Create singleton instance
const tokenManager = new TokenManager();

// Export singleton instance and class for testing
export default tokenManager;
export { TokenManager };

/**
 * Legacy compatibility functions - USE THESE for gradual migration
 * These functions provide the same interface as the old scattered code
 * but use the centralized TokenManager internally.
 */

/**
 * @deprecated Use tokenManager.getToken() instead
 */
export const getToken = () => tokenManager.getToken();

/**
 * @deprecated Use tokenManager.isAuthenticated() instead  
 */
export const isAuthenticated = () => tokenManager.isAuthenticated();

/**
 * @deprecated Use tokenManager.getAuthHeader() instead
 */
export const getAuthHeader = () => tokenManager.getAuthHeader();

/**
 * @deprecated Use tokenManager.getHeaders() instead
 */
export const getAuthHeaders = (additionalHeaders = {}) => tokenManager.getHeaders(additionalHeaders);
