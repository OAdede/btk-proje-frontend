// Authentication API Service - Backend communication layer
const API_BASE_URL = (import.meta?.env?.VITE_API_BASE_URL) || '/api';
import tokenManager from '../utils/tokenManager.js';
import httpClient from '../utils/httpClient.js';
import secureStorage from '../utils/secureStorage.js';
const DEBUG = import.meta?.env?.VITE_DEBUG_SERVICES === 'true';

export const authService = {
    // Login user - Using secure httpClient with JSON parsing
    async login(email, password) {
        try {
            // Use httpClient.requestJson for automatic JSON parsing and error handling
            const response = await httpClient.requestJson('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            if (DEBUG) console.log('[AuthService] Login response received');
            return response;
        } catch (error) {
            if (DEBUG) console.error('[AuthService] Login failed:', error.message);
            
            // Handle specific connection errors
            if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
                throw new Error('Backend sunucusuna bağlanılamıyor. Lütfen sunucunun çalıştığından emin olun.');
            }
            
            throw new Error(error.message || 'Giriş yapılırken bir hata oluştu');
        }
    },

    // Request password reset - Using secure httpClient with JSON parsing
    async requestPasswordReset(email) {
        try {
            const frontendUrl = import.meta?.env?.VITE_FRONTEND_URL || window.location.origin;

            const response = await httpClient.requestJson('/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({
                    email,
                    frontendUrl: frontendUrl // Frontend URL'sini backend'e gönder
                })
            });

            if (DEBUG) console.log('[AuthService] Password reset request sent');
            return response || {};
        } catch (error) {
            if (DEBUG) console.error('[AuthService] Password reset failed:', error.message);
            throw new Error(error.message || 'Şifre sıfırlama isteği başarısız oldu.');
        }
    },

    // Reset password with token
    async resetPassword(token, newPassword) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    password: newPassword
                })
            });

            if (!response.ok) {
                let errorMessage = 'Şifre sıfırlama başarısız oldu';

                // Önce response'u text olarak okumaya çalış
                try {
                    const errorText = await response.text();
                    if (DEBUG) console.log('Reset-password error text length:', errorText?.length || 0);
                    // Eğer JSON formatında ise parse etmeye çalış
                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    } catch (jsonError) {
                        // JSON parse edilemezse text'i direkt kullan
                        errorMessage = errorText || errorMessage;
                    }
                } catch {
                }

                throw new Error(errorMessage);
            }

            // Başarılı response için JSON parse etmeye çalış
            try {
                const responseData = await response.json();
                return responseData;
            } catch (jsonError) {
                // Eğer response boş ise veya JSON değilse boş obje döndür
                if (DEBUG) console.log('Response is not JSON, returning empty object');
                return {};
            }
        } catch (error) {
            throw new Error(error.message || 'Şifre sıfırlama başarısız oldu.');
        }
    },

    // Logout user
    logout() {
        // SECURITY: Use centralized secure cleanup
        tokenManager.clearToken();
        secureStorage.clear();
        
        // Clear any authorization headers
        if (typeof window !== 'undefined') {
            delete window.axios?.defaults?.headers?.common?.Authorization;
        }
        
    if (DEBUG) console.log('[AuthService] Complete secure logout performed');
    },

    // Check if user is authenticated
    isAuthenticated() {
        // Use the new tokenManager for proper validation
        return tokenManager.isAuthenticated();
    },

    // Get current user from secure storage
    getCurrentUser() {
        // SECURITY: Use secure storage with fallback migration
        let userData = secureStorage.getItem('user');
        
        // Migration fallback from legacy localStorage
        if (!userData) {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    userData = JSON.parse(userStr);
                    // Migrate to secure storage
                    secureStorage.setItem('user', userData);
                    localStorage.removeItem('user');
                    console.log('[AuthService] Migrated user data to secure storage');
                } catch (error) {
                    console.error('[AuthService] Error parsing legacy user data:', error);
                    return null;
                }
            }
        }
        
        return userData;
    },

    // Set authorization header for axios
    setAuthHeader(token) {
        if (typeof window !== 'undefined' && window.axios) {
            window.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    },

    // Validate token (optional - can be used to check if token is still valid)
    async validateToken() {
        try {
            // Use httpClient for automatic token handling
            const response = await httpClient.get('/auth/validate');
            return response.ok;
        } catch (error) {
            if (DEBUG) console.error('Token validation error:', error);
            return false;
        }
    },

    // Check user count for bootstrap process
    async getUserCount() {
    if (DEBUG) console.log('getUserCount called');
        try {
            const response = await fetch(`${API_BASE_URL}/auth/user-count`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });

            if (DEBUG) console.log('getUserCount response status:', response.status);

            if (!response.ok) {
                let errorMessage = 'Kullanıcı sayısı kontrolü başarısız oldu';
                try {
                    const errorText = await response.text();
                    if (DEBUG) console.log('User-count error text length:', errorText?.length || 0);
                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    } catch (jsonError) {
                        errorMessage = errorText || errorMessage;
                    }
                } catch (textError) {
                    console.log('Could not read response as text:', textError);
                }
                throw new Error(errorMessage);
            }

            const responseData = await response.json();
            if (DEBUG) console.log('getUserCount response data loaded');
            return responseData;
        } catch (error) {
            if (DEBUG) console.error('getUserCount error:', error);
            throw new Error(error.message || 'Kullanıcı sayısı kontrolü başarısız oldu.');
        }
    },

    // Bootstrap admin - create first admin account
    async bootstrapAdmin(email, name = 'Admin') {
        try {
            // Get frontend URL for the reset link
            const frontendUrl = import.meta?.env?.VITE_FRONTEND_URL || window.location.origin;

            const response = await fetch(`${API_BASE_URL}/auth/bootstrap-admin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    name,
                    frontendUrl: frontendUrl
                })
            });

            if (!response.ok) {
                let errorMessage = 'Bootstrap admin oluşturma başarısız oldu';
                try {
                    const errorText = await response.text();
                    if (DEBUG) console.log('Bootstrap-admin error text length:', errorText?.length || 0);
                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    } catch (jsonError) {
                        errorMessage = errorText || errorMessage;
                    }
                } catch {
                }
                throw new Error(errorMessage);
            }

            try {
                const responseData = await response.json();
                return responseData;
            } catch (jsonError) {
                if (DEBUG) console.log('Response is not JSON, returning empty object');
                return {};
            }
        } catch (error) {
            throw new Error(error.message || 'Bootstrap admin oluşturma başarısız oldu.');
        }
    },

    // Change password for logged-in user
    async changePassword(currentPassword, newPassword) {
        try {
            // Check authentication using tokenManager
            if (!tokenManager.isAuthenticated()) {
                throw new Error('Oturum açmanız gerekiyor');
            }

            // Use httpClient for automatic auth header handling
            const response = await httpClient.post('/auth/change-password', {
                currentPassword,
                newPassword
            });

            if (!response.ok) {
                let errorMessage = 'Şifre değiştirme işlemi başarısız oldu';
                try {
                    const errorText = await response.text();
                    if (DEBUG) console.log('Change password error text length:', errorText?.length || 0);
                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    } catch (jsonError) {
                        errorMessage = errorText || errorMessage;
                    }
                } catch (textError) {
                    console.log('Could not read error response:', textError);
                }
                throw new Error(errorMessage);
            }

            // Handle successful response - could be JSON or text
            try {
                const responseText = await response.text();
                
                // Try to parse as JSON first
                try {
                    const responseData = JSON.parse(responseText);
                    return responseData;
                } catch (jsonError) {
                    // If it's not JSON, return the text as a success message
                    return { message: responseText || 'Şifre başarıyla değiştirildi' };
                }
            } catch (readError) {
                return { message: 'Şifre başarıyla değiştirildi' };
            }
        } catch (error) {
            if (DEBUG) console.error('Change password error:', error);
            throw new Error(error.message || 'Şifre değiştirme işlemi başarısız oldu');
        }
    },

    // Verify user role server-side
    async verifyRole(roleName = null) {
        try {
            const token = tokenManager.getToken();
            if (!token) {
                return { authorized: false, message: 'Token bulunamadı' };
            }

            const url = `${API_BASE_URL}/auth/verify-role?roleName=${encodeURIComponent(roleName)}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Handle different HTTP status codes from backend
            if (response.ok) {
                const data = await response.json();
                return {
                    authorized: data.authorized || false,
                    roleId: data.roleId,
                    roleName: data.roleName,
                    redirectPath: data.redirectPath,
                    message: data.message,
                    expiresAt: data.expiresAt
                };
            } else {
                // For 401, 400, 500 status codes, still try to parse response
                try {
                    const errorData = await response.json();
                    return {
                        authorized: false,
                        message: errorData.message || 'Yetkilendirme başarısız',
                        roleName: errorData.roleName
                    };
                } catch (parseError) {
                    return { 
                        authorized: false, 
                        message: `Yetkilendirme başarısız (${response.status})` 
                    };
                }
            }
        } catch (error) {
            if (DEBUG) console.error('Role verification error:', error);
            return { authorized: false, message: 'Yetkilendirme kontrol edilemedi' };
        }
    }
};
