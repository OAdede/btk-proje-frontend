// Authentication API Service - Backend communication layer
// Prefer environment variable; fallback to Vite dev proxy path
const API_BASE_URL = (import.meta?.env?.VITE_API_BASE_URL) || '/api';

export const authService = {
    // Login user
    async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                let errorMessage = 'Giriş yapılırken bir hata oluştu';
                // Response gövdesini bir kez oku ve sonra JSON parse etmeyi dene
                try {
                    const errorText = await response.text();
                    console.log('Server error text:', errorText);
                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage = errorData.message || errorData.error || errorMessage;
                        console.log('Server error details (parsed JSON):', errorData);
                    } catch {
                        errorMessage = (errorText && errorText.trim().length > 0) ? errorText : `${errorMessage} (HTTP ${response.status})`;
                    }
                } catch (readErr) {
                    console.log('Could not read error response body:', readErr);
                    errorMessage = `${errorMessage} (HTTP ${response.status})`;
                }
                console.log('Response status:', response.status);
                throw new Error(errorMessage);
            }

            // Başarılı yanıtta gövdeyi bir kere oku, JSON parse etmeyi dene
            const text = await response.text();
            try {
                return JSON.parse(text);
            } catch {
                return text ? { message: text } : {};
            }
        } catch (error) {
            throw new Error(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
        }
    },

    // Request password reset
    async requestPasswordReset(email) {
        try {
            // Frontend URL'sini backend'e gönder (environment variable veya window.location.origin)
            const frontendUrl = process.env.FRONTEND_URL || window.location.origin;

            const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    frontendUrl: frontendUrl // Frontend URL'sini backend'e gönder
                })
            });

            if (!response.ok) {
                let errorMessage = 'Şifre sıfırlama isteği başarısız oldu';

                // Önce response'u text olarak okumaya çalış
                try {
                    const errorText = await response.text();
                    console.log('Server error response:', errorText);

                    // Eğer JSON formatında ise parse etmeye çalış
                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    } catch (jsonError) {
                        // JSON parse edilemezse text'i direkt kullan
                        errorMessage = errorText || errorMessage;
                    }
                } catch (textError) {
                    console.log('Could not read response as text:', textError);
                }

                throw new Error(errorMessage);
            }

            // Başarılı response için JSON parse etmeye çalış
            try {
                const responseData = await response.json();
                return responseData;
            } catch (jsonError) {
                // Eğer response boş ise veya JSON değilse boş obje döndür
                console.log('Response is not JSON, returning empty object');
                return {};
            }
        } catch (error) {
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
                    console.log('Server error response:', errorText);

                    // Eğer JSON formatında ise parse etmeye çalış
                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    } catch (jsonError) {
                        // JSON parse edilemezse text'i direkt kullan
                        errorMessage = errorText || errorMessage;
                    }
                } catch (textError) {
                    console.log('Could not read response as text:', textError);
                }

                throw new Error(errorMessage);
            }

            // Başarılı response için JSON parse etmeye çalış
            try {
                const responseData = await response.json();
                return responseData;
            } catch (jsonError) {
                // Eğer response boş ise veya JSON değilse boş obje döndür
                console.log('Response is not JSON, returning empty object');
                return {};
            }
        } catch (error) {
            throw new Error(error.message || 'Şifre sıfırlama başarısız oldu.');
        }
    },

    // Logout user
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Clear cached profile/info to avoid leaking between accounts
        localStorage.removeItem('profileImage');
        localStorage.removeItem('phoneNumber');
        localStorage.removeItem('email');
        localStorage.removeItem('displayName');
        localStorage.removeItem('displayRole');
        // Clear any authorization headers
        if (typeof window !== 'undefined') {
            delete window.axios?.defaults?.headers?.common?.Authorization;
        }
    },

    // Check if user is authenticated
    isAuthenticated() {
        const token = localStorage.getItem('token');
        return !!token;
    },

    // Get current user from localStorage
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (error) {
                console.error('Error parsing user data:', error);
                return null;
            }
        }
        return null;
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
            const token = localStorage.getItem('token');
            if (!token) {
                return false;
            }

            const response = await fetch(`${API_BASE_URL}/auth/validate`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            return response.ok;
        } catch (error) {
            console.error('Token validation error:', error);
            return false;
        }
    },

    // Check user count for bootstrap process
    async getUserCount() {
        console.log('getUserCount called');
        try {
            const response = await fetch(`${API_BASE_URL}/auth/user-count`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });

            console.log('getUserCount response status:', response.status);

            if (!response.ok) {
                let errorMessage = 'Kullanıcı sayısı kontrolü başarısız oldu';
                try {
                    const errorText = await response.text();
                    console.log('Server error response:', errorText);
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
            console.log('getUserCount response data:', responseData);
            return responseData;
        } catch (error) {
            console.error('getUserCount error:', error);
            throw new Error(error.message || 'Kullanıcı sayısı kontrolü başarısız oldu.');
        }
    },

    // Bootstrap admin - create first admin account
    async bootstrapAdmin(email, name = 'Admin') {
        try {
            // Get frontend URL for the reset link
            const frontendUrl = process.env.FRONTEND_URL || window.location.origin;

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
                    console.log('Server error response:', errorText);
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

            try {
                const responseData = await response.json();
                return responseData;
            } catch (jsonError) {
                console.log('Response is not JSON, returning empty object');
                return {};
            }
        } catch (error) {
            throw new Error(error.message || 'Bootstrap admin oluşturma başarısız oldu.');
        }
    },

    // Change password for logged-in user
    async changePassword(currentPassword, newPassword) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Oturum açmanız gerekiyor');
            }

            const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            if (!response.ok) {
                let errorMessage = 'Şifre değiştirme işlemi başarısız oldu';
                try {
                    const errorText = await response.text();
                    console.log('Change password error response:', errorText);
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
                console.log('Password change response:', responseText);
                
                // Try to parse as JSON first
                try {
                    const responseData = JSON.parse(responseText);
                    console.log('Password changed successfully (JSON response)');
                    return responseData;
                } catch (jsonError) {
                    // If it's not JSON, return the text as a success message
                    console.log('Password changed successfully (text response)');
                    return { message: responseText || 'Şifre başarıyla değiştirildi' };
                }
            } catch (readError) {
                console.log('Could not read success response, but password was changed');
                return { message: 'Şifre başarıyla değiştirildi' };
            }
        } catch (error) {
            console.error('Change password error:', error);
            throw new Error(error.message || 'Şifre değiştirme işlemi başarısız oldu');
        }
    }
};
