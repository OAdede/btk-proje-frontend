/**
 * Secure HTTP Client with Authentication Interceptors
 * 
 * This module provides a centralized HTTP client that automatically:
 * - Adds authentication headers
 * - Handles token expiration
 * - Provides consistent error handling
 * - Logs requests in development
 * 
 * Benefits:
 * - No more manual token handling in services
 * - Automatic 401 error handling
 * - Consistent API base URL management
 * - Easy to add retry logic and other features
 */

import tokenManager from './tokenManager.js';

// API Configuration
const API_CONFIG = {
    baseURL: import.meta?.env?.VITE_API_BASE_URL || '/api',
    timeout: 10000, // 10 seconds
    retryAttempts: 2,
    logRequests: import.meta.env.DEV,
};

/**
 * Custom HTTP Client class
 */
class HttpClient {
    constructor() {
        this.onAuthError = null;
        this.requestInterceptors = [];
        this.responseInterceptors = [];
    }

    /**
     * Set callback for authentication errors (401, 403)
     * @param {function} callback - Function to handle auth errors
     */
    onAuthErrorCallback(callback) {
        this.onAuthError = callback;
    }

    /**
     * Build complete URL
     * @param {string} endpoint - API endpoint
     * @returns {string} Complete URL
     */
    buildUrl(endpoint) {
        const baseUrl = API_CONFIG.baseURL.endsWith('/') 
            ? API_CONFIG.baseURL.slice(0, -1) 
            : API_CONFIG.baseURL;
        const cleanEndpoint = endpoint.startsWith('/') 
            ? endpoint 
            : `/${endpoint}`;
        
        return `${baseUrl}${cleanEndpoint}`;
    }

    /**
     * Apply request interceptors
     * @param {object} options - Request options
     * @returns {object} Modified options
     */
    applyRequestInterceptors(options) {
        let modifiedOptions = { ...options };
        
        // Apply authentication headers automatically
        const authHeaders = tokenManager.getHeaders(modifiedOptions.headers);
        modifiedOptions.headers = authHeaders;

        // Apply custom interceptors
        this.requestInterceptors.forEach(interceptor => {
            modifiedOptions = interceptor(modifiedOptions);
        });

        return modifiedOptions;
    }

    /**
     * Apply response interceptors
     * @param {Response} response - Fetch response
     * @param {object} options - Original request options
     * @returns {Response} Modified response
     */
    async applyResponseInterceptors(response, options) {
        // Handle authentication errors globally
        if (response.status === 401) {
            if (API_CONFIG.logRequests) {
                console.warn('[HttpClient] Authentication error (401)');
            }
            
            // Clear expired/invalid token
            tokenManager.handleTokenExpiration();
            
            // Notify app of auth error
            if (this.onAuthError) {
                this.onAuthError(response, options);
            }
        }

        // Apply custom response interceptors
        let modifiedResponse = response;
        for (const interceptor of this.responseInterceptors) {
            modifiedResponse = await interceptor(modifiedResponse, options);
        }

        return modifiedResponse;
    }

    /**
     * Core request method
     * @param {string} endpoint - API endpoint
     * @param {object} options - Request options
     * @returns {Promise<Response>} Fetch response
     */
    async request(endpoint, options = {}) {
        const url = this.buildUrl(endpoint);
        
        // Apply interceptors
        const requestOptions = this.applyRequestInterceptors({
            method: 'GET',
            ...options,
        });

        // If body is FormData or Blob, do not set Content-Type (browser will handle boundary)
        if (requestOptions.body && (requestOptions.body instanceof FormData || requestOptions.body instanceof Blob)) {
            if (requestOptions.headers && 'Content-Type' in requestOptions.headers) {
                try { delete requestOptions.headers['Content-Type']; } catch {}
            }
        }

        if (API_CONFIG.logRequests) {
            // Redact sensitive headers
            const redactedHeaders = { ...(requestOptions.headers || {}) };
            if (redactedHeaders.Authorization) {
                redactedHeaders.Authorization = 'Bearer ********';
            }
            console.log(`[HttpClient] ${requestOptions.method} ${url}`, {
                headers: redactedHeaders,
                hasBody: Boolean(requestOptions.body)
            });
        }

        try {
            // Implement timeout and basic retry with exponential backoff
            const attemptRequest = async (attempt = 0) => {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
                try {
                    const response = await fetch(url, { ...requestOptions, signal: controller.signal });
                    clearTimeout(timeoutId);
                    // Retry on transient 5xx errors
                    if (response.status >= 500 && response.status < 600 && attempt < API_CONFIG.retryAttempts) {
                        const delay = 300 * Math.pow(2, attempt);
                        if (API_CONFIG.logRequests) console.warn(`[HttpClient] ${response.status}, retrying in ${delay}ms (attempt ${attempt + 1})`);
                        await new Promise(r => setTimeout(r, delay));
                        return attemptRequest(attempt + 1);
                    }
                    return response;
                } catch (err) {
                    clearTimeout(timeoutId);
                    // Retry on abort (timeout) or network errors
                    const isAbort = err?.name === 'AbortError';
                    const isNetwork = !('status' in (err || {}));
                    if ((isAbort || isNetwork) && attempt < API_CONFIG.retryAttempts) {
                        const delay = 300 * Math.pow(2, attempt);
                        if (API_CONFIG.logRequests) console.warn(`[HttpClient] ${isAbort ? 'timeout' : 'network error'}, retrying in ${delay}ms (attempt ${attempt + 1})`);
                        await new Promise(r => setTimeout(r, delay));
                        return attemptRequest(attempt + 1);
                    }
                    throw err;
                }
            };

            // Make the request
            const response = await attemptRequest(0);
            
            // Apply response interceptors
            const interceptedResponse = await this.applyResponseInterceptors(response, requestOptions);
            
            if (API_CONFIG.logRequests) {
                console.log(`[HttpClient] Response ${interceptedResponse.status}`, interceptedResponse);
            }

            return interceptedResponse;
        } catch (error) {
            if (API_CONFIG.logRequests) {
                console.error(`[HttpClient] Request failed: ${requestOptions.method} ${url}`, error?.message || error);
            }
            throw error;
        }
    }

    /**
     * GET request
     */
    async get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    /**
     * POST request
     */
    async post(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    /**
     * PUT request
     */
    async put(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    /**
     * DELETE request
     */
    async delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }

    /**
     * PATCH request
     */
    async patch(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    /**
     * Request with JSON response parsing
     * @param {string} endpoint - API endpoint
     * @param {object} options - Request options
     * @returns {Promise<any>} Parsed JSON response
     */
    async requestJson(endpoint, options = {}) {
        const response = await this.request(endpoint, options);
        
        if (!response.ok) {
            // Try to extract error message from response
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.text();
                try {
                    const parsedError = JSON.parse(errorData);
                    errorMessage = parsedError.message || parsedError.error || errorMessage;
                } catch {
                    errorMessage = errorData || errorMessage;
                }
            } catch {
                // Use default error message
            }
            
            throw new Error(errorMessage);
        }

        try {
            return await response.json();
        } catch (error) {
            // Response is not JSON, return empty object
            console.warn('[HttpClient] Response is not JSON');
            return {};
        }
    }

    /**
     * Add request interceptor
     * @param {function} interceptor - Function that modifies request options
     */
    addRequestInterceptor(interceptor) {
        this.requestInterceptors.push(interceptor);
    }

    /**
     * Add response interceptor
     * @param {function} interceptor - Function that modifies response
     */
    addResponseInterceptor(interceptor) {
        this.responseInterceptors.push(interceptor);
    }
}

// Create singleton instance
const httpClient = new HttpClient();

// Export singleton and class
export default httpClient;
export { HttpClient };

/**
 * Convenience functions for common patterns
 */

/**
 * Make a GET request and return JSON
 */
export const apiGet = (endpoint, options = {}) => 
    httpClient.requestJson(endpoint, { ...options, method: 'GET' });

/**
 * Make a POST request and return JSON
 */
export const apiPost = (endpoint, data, options = {}) => 
    httpClient.requestJson(endpoint, { 
        ...options, 
        method: 'POST',
        body: JSON.stringify(data)
    });

/**
 * Make a PUT request and return JSON
 */
export const apiPut = (endpoint, data, options = {}) => 
    httpClient.requestJson(endpoint, { 
        ...options, 
        method: 'PUT',
        body: JSON.stringify(data)
    });

/**
 * Make a DELETE request and return JSON
 */
export const apiDelete = (endpoint, options = {}) => 
    httpClient.requestJson(endpoint, { ...options, method: 'DELETE' });
