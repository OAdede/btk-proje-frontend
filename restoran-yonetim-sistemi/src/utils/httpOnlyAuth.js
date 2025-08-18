/**
 * HttpOnly Cookie Authentication Utilities
 * 
 * This module implements secure HttpOnly cookie-based authentication.
 * 
 * SECURITY PRINCIPLES:
 * 1. Tokens stored in HttpOnly cookies (not accessible via JavaScript)
 * 2. Automatic CSRF protection via SameSite=strict
 * 3. Secure flag for HTTPS-only transmission
 * 4. No client-side token storage or manipulation
 * 5. Backend-controlled session management
 * 
 * IMPORTANT: This requires backend cooperation to work properly.
 */

/**
 * Cookie utilities for non-HttpOnly cookies (preferences, etc.)
 * Note: Authentication tokens should NEVER use these functions
 */
export const cookieUtils = {
    /**
     * Set a non-HttpOnly cookie (for preferences, theme, etc.)
     * WARNING: Never use this for authentication tokens!
     */
    set(name, value, options = {}) {
        const defaults = {
            path: '/',
            secure: import.meta.env.PROD, // HTTPS only in production
            sameSite: 'strict'
        };
        
        const config = { ...defaults, ...options };
        
        let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
        
        if (config.maxAge) {
            cookieString += `; Max-Age=${config.maxAge}`;
        }
        
        if (config.expires) {
            cookieString += `; Expires=${config.expires.toUTCString()}`;
        }
        
        if (config.path) {
            cookieString += `; Path=${config.path}`;
        }
        
        if (config.domain) {
            cookieString += `; Domain=${config.domain}`;
        }
        
        if (config.secure) {
            cookieString += '; Secure';
        }
        
        if (config.sameSite) {
            cookieString += `; SameSite=${config.sameSite}`;
        }
        
        document.cookie = cookieString;
    },

    /**
     * Get a non-HttpOnly cookie value
     * Note: This cannot read HttpOnly cookies (which is good for security)
     */
    get(name) {
        const nameEQ = encodeURIComponent(name) + '=';
        const cookies = document.cookie.split(';');
        
        for (let cookie of cookies) {
            let c = cookie.trim();
            if (c.indexOf(nameEQ) === 0) {
                return decodeURIComponent(c.substring(nameEQ.length));
            }
        }
        return null;
    },

    /**
     * Delete a non-HttpOnly cookie
     */
    delete(name, options = {}) {
        this.set(name, '', {
            ...options,
            maxAge: 0,
            expires: new Date(0)
        });
    },

    /**
     * Clear all non-HttpOnly cookies for this domain
     * Note: Cannot clear HttpOnly cookies (backend must do that)
     */
    clearAll() {
        const cookies = document.cookie.split(';');
        
        for (let cookie of cookies) {
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            if (name) {
                this.delete(name);
            }
        }
    }
};

/**
 * HttpOnly Authentication Manager
 * 
 * This class manages authentication state without ever touching tokens directly.
 * All token operations are handled server-side via HttpOnly cookies.
 */
class HttpOnlyAuthManager {
    constructor() {
        this.isAuthenticated = false;
        this.user = null;
        this.authCheckPromise = null;
        this.onAuthChange = null; // Callback for auth state changes
        this.onAuthError = null;  // Callback for auth errors
        
        // Initialize authentication state
        this.initializeAuthState();
    }

    /**
     * Initialize authentication state by checking with backend
     * This is the ONLY way to know if user is authenticated with HttpOnly cookies
     */
    async initializeAuthState() {
        try {
            const authData = await this.validateSession();
            if (authData && authData.user) {
                this.isAuthenticated = true;
                this.user = authData.user;
                this.notifyAuthChange(true);
            } else {
                this.isAuthenticated = false;
                this.user = null;
                this.notifyAuthChange(false);
            }
        } catch (error) {
            console.warn('[HttpOnlyAuth] Failed to initialize auth state:', error.message);
            this.isAuthenticated = false;
            this.user = null;
            this.notifyAuthChange(false);
        }
    }

    /**
     * Login user - backend will set HttpOnly cookie
     */
    async login(credentials) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Essential: Include cookies
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                const errorData = await this.parseErrorResponse(response);
                throw new Error(errorData.message || `Login failed: ${response.status}`);
            }

            const data = await response.json();
            
            // Backend should set HttpOnly cookie automatically
            // We just need to update our local state
            if (data.success && data.user) {
                this.isAuthenticated = true;
                this.user = data.user;
                this.notifyAuthChange(true);
                return data;
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            this.isAuthenticated = false;
            this.user = null;
            this.notifyAuthChange(false);
            throw error;
        }
    }

    /**
     * Logout user - backend will clear HttpOnly cookie
     */
    async logout() {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include', // Include cookies for validation
            });
        } catch (error) {
            console.warn('[HttpOnlyAuth] Logout request failed:', error.message);
        } finally {
            // Always clear local state regardless of backend response
            this.isAuthenticated = false;
            this.user = null;
            this.notifyAuthChange(false);
            
            // Clear any non-HttpOnly cookies
            cookieUtils.clearAll();
        }
    }

    /**
     * Validate current session with backend
     * This is how we check authentication status with HttpOnly cookies
     */
    async validateSession() {
        // Prevent multiple simultaneous validation requests
        if (this.authCheckPromise) {
            return this.authCheckPromise;
        }

        this.authCheckPromise = this.performSessionValidation();
        
        try {
            const result = await this.authCheckPromise;
            return result;
        } finally {
            this.authCheckPromise = null;
        }
    }

    /**
     * Perform the actual session validation
     */
    async performSessionValidation() {
        try {
            const response = await fetch('/api/auth/validate', {
                method: 'GET',
                credentials: 'include', // Include HttpOnly cookies
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Not authenticated
                    return null;
                }
                throw new Error(`Session validation failed: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.warn('[HttpOnlyAuth] Session validation error:', error.message);
            return null;
        }
    }

    /**
     * Get current user information
     */
    async getCurrentUser() {
        try {
            const response = await fetch('/api/auth/me', {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.handleAuthError();
                    return null;
                }
                throw new Error(`Get user failed: ${response.status}`);
            }

            const userData = await response.json();
            this.user = userData;
            return userData;
        } catch (error) {
            console.warn('[HttpOnlyAuth] Get current user failed:', error.message);
            return null;
        }
    }

    /**
     * Make authenticated request (cookies sent automatically)
     */
    async authenticatedFetch(url, options = {}) {
        const requestOptions = {
            ...options,
            credentials: 'include', // Always include cookies
        };

        try {
            const response = await fetch(url, requestOptions);
            
            // Handle authentication errors
            if (response.status === 401) {
                this.handleAuthError();
                throw new Error('Authentication required');
            }
            
            return response;
        } catch (error) {
            if (error.message.includes('Authentication required')) {
                throw error;
            }
            throw new Error(`Request failed: ${error.message}`);
        }
    }

    /**
     * Handle authentication errors (token expired, etc.)
     */
    handleAuthError() {
        this.isAuthenticated = false;
        this.user = null;
        this.notifyAuthChange(false);
        
        if (this.onAuthError) {
            this.onAuthError();
        }
    }

    /**
     * Notify auth state change
     */
    notifyAuthChange(isAuthenticated) {
        if (this.onAuthChange) {
            this.onAuthChange({
                isAuthenticated,
                user: this.user
            });
        }
    }

    /**
     * Parse error response safely
     */
    async parseErrorResponse(response) {
        try {
            return await response.json();
        } catch {
            return { message: `HTTP ${response.status}` };
        }
    }

    /**
     * Set auth change callback
     */
    setAuthChangeCallback(callback) {
        this.onAuthChange = callback;
    }

    /**
     * Set auth error callback
     */
    setAuthErrorCallback(callback) {
        this.onAuthError = callback;
    }

    /**
     * Check if currently authenticated
     */
    getAuthenticationStatus() {
        return {
            isAuthenticated: this.isAuthenticated,
            user: this.user
        };
    }
}

// Create singleton instance
export const httpOnlyAuth = new HttpOnlyAuthManager();
export default httpOnlyAuth;
