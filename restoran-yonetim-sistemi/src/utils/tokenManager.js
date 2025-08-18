/**
 * Centralized Token Management Utility - SECURITY ENHANCED
 * 
 * This utility provides secure token management following industry standards:
 * - Memory-only storage for tokens (prevents XSS access)
 * - Encrypted storage for sensitive data
 * - Preparation for HttpOnly cookie migration
 * - Automatic expiration validation
 * - Defense against common web vulnerabilities
 * 
 * Security Standards Implemented:
 * - OWASP Token Storage Guidelines
 * - Zero Trust client-side storage model
 * - Defense in depth strategy
 */

import { isTokenExpired, decodeJwtPayload } from './jwt.js';
import secureStorage from './secureStorage.js';

// Configuration for token management
const TOKEN_CONFIG = {
    // Storage keys
    TOKEN_KEY: 'token',
    USER_KEY: 'user',
    REFRESH_TOKEN_KEY: 'refreshToken',
    
    // Security settings
    AUTO_LOGOUT_ON_EXPIRED: true,
    // Only log token operations if explicitly enabled
    LOG_TOKEN_OPERATIONS: (import.meta?.env?.VITE_DEBUG_AUTH === 'true'),
    
    // Migration flags
    USE_SECURE_STORAGE: true,          // Enable secure storage
    PREFER_MEMORY_FOR_TOKENS: true,    // Keep tokens in memory only
    PREPARE_HTTPONLY_MIGRATION: false  // Future: prepare for HttpOnly cookies
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
     * SECURITY: Uses secure memory storage to prevent XSS token theft
     * @returns {string|null} Valid token or null if expired/missing
     */
    getToken() {
        try {
            // Priority: Memory storage (most secure) -> Secure storage -> Legacy localStorage
            let token = null;
            
            if (TOKEN_CONFIG.USE_SECURE_STORAGE) {
                if (TOKEN_CONFIG.LOG_TOKEN_OPERATIONS) console.log('[TokenManager] Retrieving token from secure storage');
                token = secureStorage.getItem(TOKEN_CONFIG.TOKEN_KEY);
                if (TOKEN_CONFIG.LOG_TOKEN_OPERATIONS) console.log('[TokenManager] SecureStorage returned: ', Boolean(token));
            }
            
            // Fallback to legacy localStorage for backwards compatibility
            if (!token) {
                token = localStorage.getItem(TOKEN_CONFIG.TOKEN_KEY);
                if (token && TOKEN_CONFIG.USE_SECURE_STORAGE) {
                    // Migrate to secure storage
                    this.setToken(token);
                    localStorage.removeItem(TOKEN_CONFIG.TOKEN_KEY);
                    console.log('[TokenManager] Migrated token to secure storage');
                }
            }
            
            if (!token) {
                // Only log "No token found" if we're not in a login/startup context
                // Reduce console noise during normal app initialization
                if (TOKEN_CONFIG.LOG_TOKEN_OPERATIONS && window.location?.pathname !== '/login') {
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
     * Set a new token with validation and secure storage
     * SECURITY: Stores in memory-only storage to prevent XSS access
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

            if (TOKEN_CONFIG.USE_SECURE_STORAGE) {
                // Store in secure storage with expiration
                secureStorage.setItem(TOKEN_CONFIG.TOKEN_KEY, token, {
                    expiry: this.getTokenExpiry(token)
                });
                
                // Remove from localStorage if it exists (cleanup legacy storage)
                localStorage.removeItem(TOKEN_CONFIG.TOKEN_KEY);
                
                if (TOKEN_CONFIG.LOG_TOKEN_OPERATIONS) {
                    console.log('[TokenManager] ✅ Token stored successfully in secure storage');
                }
            } else {
                // Legacy localStorage storage
                localStorage.setItem(TOKEN_CONFIG.TOKEN_KEY, token);
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
            const refreshToken = secureStorage.getItem(TOKEN_CONFIG.REFRESH_TOKEN_KEY) || localStorage.getItem(TOKEN_CONFIG.REFRESH_TOKEN_KEY);
            
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
                try { secureStorage.removeItem(TOKEN_CONFIG.REFRESH_TOKEN_KEY); } catch {}
                try { localStorage.removeItem(TOKEN_CONFIG.REFRESH_TOKEN_KEY); } catch {}
                return false;
            }

            const data = await response.json();
            
            if (data.token) {
                // Store new token
                const success = this.setToken(data.token);
                
                // Store new refresh token if provided
                if (data.refreshToken) {
                    const payload = decodeJwtPayload(data.refreshToken);
                    const expiry = payload?.exp ? payload.exp * 1000 : (Date.now() + 30 * 24 * 60 * 60 * 1000);
                    secureStorage.setItem(TOKEN_CONFIG.REFRESH_TOKEN_KEY, data.refreshToken, { expiry });
                    try { localStorage.removeItem(TOKEN_CONFIG.REFRESH_TOKEN_KEY); } catch {}
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
            try { secureStorage.removeItem(TOKEN_CONFIG.REFRESH_TOKEN_KEY); } catch {}
            try { localStorage.removeItem(TOKEN_CONFIG.REFRESH_TOKEN_KEY); } catch {}
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
            const payload = decodeJwtPayload(token);
            const now = Math.floor(Date.now() / 1000);
            const timeUntilExpiry = (payload?.exp ?? 0) - now;
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
     * Extract expiry timestamp from JWT token
     * @param {string} token - JWT token
     * @returns {number} Expiry timestamp in milliseconds
     */
    getTokenExpiry(token) {
        try {
            const payload = decodeJwtPayload(token);
            return payload.exp * 1000; // Convert to milliseconds
        } catch (error) {
            console.error('[TokenManager] Error extracting token expiry:', error);
            return Date.now() + (24 * 60 * 60 * 1000); // Default 24h
        }
    }

    /**
     * Clear token from all storage locations
     * SECURITY: Ensures complete cleanup across all storage types
     */
    clearToken() {
        try {
            if (TOKEN_CONFIG.USE_SECURE_STORAGE) {
                try { secureStorage.removeItem(TOKEN_CONFIG.TOKEN_KEY); } catch {}
                try { secureStorage.removeItem(TOKEN_CONFIG.REFRESH_TOKEN_KEY); } catch {}
            }
            // Also clear from localStorage (legacy cleanup)
            try { localStorage.removeItem(TOKEN_CONFIG.TOKEN_KEY); } catch {}
            try { localStorage.removeItem(TOKEN_CONFIG.REFRESH_TOKEN_KEY); } catch {}
            
            if (TOKEN_CONFIG.LOG_TOKEN_OPERATIONS) {
                console.log('[TokenManager] Token and refresh token cleared');
            }
        } catch (error) {
            console.error('[TokenManager] Error clearing token:', error);
        }
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
        const token = this.getToken(); // Use secure getToken method
        if (!token) return { exists: false };

        try {
            const payload = decodeJwtPayload(token);
            const now = Math.floor(Date.now() / 1000);
            
            return {
                exists: true,
                expired: isTokenExpired(token),
                expiresAt: payload?.exp,
                expiresIn: (payload?.exp ?? 0) - now,
                issuer: payload?.iss,
                storageType: TOKEN_CONFIG.USE_SECURE_STORAGE ? 'secure-memory' : 'localStorage',
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
