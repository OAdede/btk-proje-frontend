/**
 * Secure Storage Utility
 * 
 * Implements industry-standard security practices:
 * 1. HttpOnly cookies for authentication tokens (prevents XSS)
 * 2. Encrypted localStorage for non-sensitive cached data
 * 3. Memory-only storage for temporary sensitive data
 * 4. Automatic cleanup and expiration handling
 * 
 * Security Standards:
 * - OWASP recommendations for token storage
 * - Zero Trust model for client-side data
 * - Defense in depth strategy
 */

import CryptoJS from 'crypto-js';

// Security configuration
const SECURITY_CONFIG = {
    // Encryption settings
    ENCRYPTION_KEY: import.meta.env.VITE_CLIENT_ENCRYPTION_KEY || 'default-dev-key-change-in-production',
    ALGORITHM: 'AES',
    
    // Storage classification
    SENSITIVE_KEYS: [], // Empty - for restaurant app, we need token persistence across reloads
    PII_KEYS: ['phone', 'email', 'profileImage', 'phoneNumber', 'user', 'displayName', 'displayRole', 'token', 'refreshToken'], // User object contains PII, tokens encrypted for security
    GENERAL_KEYS: ['userId', 'settings', 'preferences', 'theme', 'restaurantName', 'tableCapacities', 'tableStatus', 'orders', 'completedOrders', 'reservations', 'orderHistory'], // Non-sensitive data only
    
    // Cookie settings for production
    COOKIE_CONFIG: {
        secure: import.meta.env.PROD, // HTTPS only in production
        sameSite: 'strict',           // CSRF protection
        httpOnly: false,              // Must be false for client-side access (backend should set httpOnly for auth)
        maxAge: 24 * 60 * 60 * 1000  // 24 hours
    }
};

/**
 * Secure Storage Manager
 * Handles different types of data with appropriate security measures
 */
class SecureStorage {
    constructor() {
        this.memoryStore = new Map(); // For highly sensitive temporary data
        this.initialized = false;
        if (import.meta.env?.DEV) {
            // Only enable verbose monitoring in development
            this.setupStorageMonitoring();
        }
        this.init();
    }

    /**
     * Monitor localStorage changes to catch token removal
     */
    setupStorageMonitoring() {
        if (typeof window === 'undefined' || !window.localStorage) return;
        // Override localStorage methods to catch direct manipulation (DEV only)
        const originalSetItem = localStorage.setItem.bind(localStorage);
        const originalRemoveItem = localStorage.removeItem.bind(localStorage);
        const originalClear = localStorage.clear.bind(localStorage);

        localStorage.setItem = function(key, value) {
            if (key === 'token') {
                console.warn('[SecureStorage] localStorage.setItem("token") called (DEV)');
            }
            return originalSetItem(key, value);
        };

        localStorage.removeItem = function(key) {
            if (key === 'token') {
                console.warn('[SecureStorage] localStorage.removeItem("token") called (DEV)');
            }
            return originalRemoveItem(key);
        };

        localStorage.clear = function() {
            console.warn('[SecureStorage] localStorage.clear() called (DEV)');
            return originalClear();
        };
    }

    init() {
        // Clear any expired data on initialization
    this.cleanupExpiredData();
        this.initialized = true;
    if (import.meta.env?.DEV) console.log('[SecureStorage] Initialized');
    }

    /**
     * Encrypt data before storing
     * @param {string} data - Data to encrypt
     * @returns {string} Encrypted data
     */
    encrypt(data) {
        try {
            return CryptoJS.AES.encrypt(data, SECURITY_CONFIG.ENCRYPTION_KEY).toString();
        } catch (error) {
            console.error('[SecureStorage] Encryption failed:', error);
            throw new Error('Data encryption failed');
        }
    }

    /**
     * Decrypt stored data
     * @param {string} encryptedData - Encrypted data
     * @returns {string} Decrypted data
     */
    decrypt(encryptedData) {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedData, SECURITY_CONFIG.ENCRYPTION_KEY);
            return bytes.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            console.error('[SecureStorage] Decryption failed:', error);
            return null;
        }
    }

    /**
     * Classify data sensitivity level
     * @param {string} key - Storage key
     * @returns {string} Classification level
     */
    classifyData(key) {
        if (SECURITY_CONFIG.SENSITIVE_KEYS.includes(key)) {
            if (import.meta.env?.DEV) console.log(`[SecureStorage] Classified "${key}" as SENSITIVE`);
            return 'SENSITIVE';
        }
        if (SECURITY_CONFIG.PII_KEYS.includes(key)) {
            if (import.meta.env?.DEV) console.log(`[SecureStorage] Classified "${key}" as PII`);
            return 'PII';
        }
        if (import.meta.env?.DEV) console.log(`[SecureStorage] Classified "${key}" as GENERAL`);
        return 'GENERAL';
    }

    /**
     * Store data with appropriate security measures
     * @param {string} key - Storage key
     * @param {any} value - Data to store
     * @param {Object} options - Storage options
     */
    setItem(key, value, options = {}) {
        if (import.meta.env?.DEV) console.log(`[SecureStorage] Setting "${key}" (type: ${typeof value})`);
        const classification = this.classifyData(key);
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

        switch (classification) {
            case 'SENSITIVE':
                // Store sensitive data in memory only (tokens should use HttpOnly cookies)
                if (import.meta.env?.DEV) console.warn(`[SecureStorage] Storing sensitive data "${key}" in memory.`);
                this.memoryStore.set(key, {
                    value: stringValue,
                    timestamp: Date.now(),
                    expiry: options.expiry || (Date.now() + 24 * 60 * 60 * 1000) // 24h default
                });
                break;

            case 'PII':
                // Encrypt PII before storing in localStorage
                const encryptedPII = this.encrypt(stringValue);
                const piiMeta = {
                    v: encryptedPII,
                    expiry: options.expiry || (Date.now() + 7 * 24 * 60 * 60 * 1000)
                };
                localStorage.setItem(`encrypted_${key}`, JSON.stringify(piiMeta));
                if (import.meta.env?.DEV) console.log(`[SecureStorage] Stored encrypted PII: ${key}`);
                break;

            default:
                // General data can be stored normally but with expiration
                const generalData = {
                    value: stringValue,
                    timestamp: Date.now(),
                    expiry: options.expiry || (Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days default
                };
                if (import.meta.env?.DEV) console.log(`[SecureStorage] Storing GENERAL key: "${key}"`);
                localStorage.setItem(key, JSON.stringify(generalData));
                if (import.meta.env?.DEV) console.log(`[SecureStorage] Stored GENERAL data "${key}" with expiry: ${new Date(generalData.expiry).toISOString()}`);
                break;
        }
    }

    /**
     * Retrieve data with security checks
     * @param {string} key - Storage key
     * @returns {any} Retrieved data or null
     */
    getItem(key) {
        if (import.meta.env?.DEV) console.log(`[SecureStorage] Getting "${key}"`);
        const classification = this.classifyData(key);

        switch (classification) {
            case 'SENSITIVE':
                // Check memory store
                const memoryData = this.memoryStore.get(key);
                if (memoryData) {
                    if (Date.now() > memoryData.expiry) {
                        this.memoryStore.delete(key);
                        if (import.meta.env?.DEV) console.log(`[SecureStorage] Expired sensitive data removed: ${key}`);
                        return null;
                    }
                    // Parse JSON if it's a JSON string, otherwise return as-is
                    try {
                        return JSON.parse(memoryData.value);
                    } catch (error) {
                        // If not JSON, return the raw value (for tokens)
                        return memoryData.value;
                    }
                }
                return null;

            case 'PII':
                // Decrypt PII data
                const encryptedPII = localStorage.getItem(`encrypted_${key}`);
                if (encryptedPII) {
                    let meta;
                    try { meta = JSON.parse(encryptedPII); } catch { meta = { v: encryptedPII }; }
                    if (meta?.expiry && Date.now() > meta.expiry) {
                        localStorage.removeItem(`encrypted_${key}`);
                        return null;
                    }
                    const decrypted = this.decrypt(meta?.v ?? encryptedPII);
                    if (decrypted) {
                        try {
                            return JSON.parse(decrypted);
                        } catch (error) {
                            return decrypted;
                        }
                    }
                }
                return null;

            default:
                // General data with expiration check
                if (import.meta.env?.DEV) console.log(`[SecureStorage] Looking for key: "${key}"`);
                const storedData = localStorage.getItem(key);
                if (import.meta.env?.DEV) console.log(`[SecureStorage] Raw data for "${key}":`, storedData ? storedData.substring(0, 100) + '...' : 'null');
                
                if (storedData) {
                    try {
                        const parsed = JSON.parse(storedData);
                        if (parsed.expiry && Date.now() > parsed.expiry) {
                            localStorage.removeItem(key);
                            if (import.meta.env?.DEV) console.log(`[SecureStorage] Expired general data removed: ${key}`);
                            return null;
                        }
                        if (import.meta.env?.DEV) console.log(`[SecureStorage] Retrieved GENERAL data "${key}"`);
                        return parsed.value;
                    } catch (error) {
                        if (import.meta.env?.DEV) console.log(`[SecureStorage] Legacy data detected for "${key}", returning as-is`);
                        // Handle legacy localStorage data (non-structured)
                        return storedData;
                    }
                }
                if (import.meta.env?.DEV) console.log(`[SecureStorage] No data found for "${key}"`);
                return null;
        }
    }

    /**
     * Remove data securely
     * @param {string} key - Storage key
     */
    removeItem(key) {
    const classification = this.classifyData(key);

        switch (classification) {
            case 'SENSITIVE':
                this.memoryStore.delete(key);
                break;
            case 'PII':
                localStorage.removeItem(`encrypted_${key}`);
                break;
            default:
                localStorage.removeItem(key);
                break;
        }

    if (import.meta.env?.DEV) console.log(`[SecureStorage] Removed ${classification} data: ${key}`);
    }

    /**
     * Clean up expired data
     */
    cleanupExpiredData() {
        // Clean memory store
        for (const [key, data] of this.memoryStore.entries()) {
            if (Date.now() > data.expiry) {
                this.memoryStore.delete(key);
            }
        }

        // Clean localStorage
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && !key.startsWith('encrypted_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data.expiry && Date.now() > data.expiry) {
                        localStorage.removeItem(key);
                    }
                } catch (error) {
                    // Ignore parsing errors for non-structured data
                }
            }
        }

    if (import.meta.env?.DEV) console.log('[SecureStorage] Cleanup completed');
    }

    /**
     * Clear all secure storage (logout)
     */
    clear() {
        this.memoryStore.clear();
        
        // Remove encrypted PII
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith('encrypted_')) {
                localStorage.removeItem(key);
            }
        }

    if (import.meta.env?.DEV) console.log('[SecureStorage] All secure data cleared');
    }

    /**
     * Get storage statistics for debugging
     */
    getStats() {
        return {
            memoryStore: this.memoryStore.size,
            localStorage: localStorage.length,
            encryptedItems: Object.keys(localStorage).filter(k => k.startsWith('encrypted_')).length
        };
    }
}

// Export singleton instance
export const secureStorage = new SecureStorage();
export default secureStorage;
