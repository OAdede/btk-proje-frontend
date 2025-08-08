// Authentication API Service - Backend communication layer
const API_BASE_URL = 'http://192.168.232.113:8080/api';

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
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                    console.log('Server error details:', errorData);
                } catch (parseError) {
                    try {
                        const errorText = await response.text();
                        console.log('Server error text:', errorText);
                        errorMessage = errorText || errorMessage;
                    } catch (textError) {
                        console.log('Could not parse error response as text:', textError);
                    }
                }
                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);
                throw new Error(errorMessage);
            }

            const responseData = await response.json();
            return responseData;
        } catch (error) {
            throw new Error(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
        }
    },

    // Request password reset
    async requestPasswordReset(email) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email })
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
    }
};
