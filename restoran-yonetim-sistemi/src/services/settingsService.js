// Settings API Service - Backend communication layer
// Prefer environment variable; fallback to Vite dev proxy path
const API_BASE_URL = (import.meta?.env?.VITE_API_BASE_URL) || '/api';

export const settingsService = {
    // Update restaurant settings
    async updateRestaurantSettings(settings) {
        try {
            // Get authentication token
            const token = localStorage.getItem('token');
            
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            };
            
            // Add authorization header if token exists
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            console.log('Making API call to:', `${API_BASE_URL}/settings`);
            console.log('Request body:', settings);
            console.log('Request headers:', headers);

            const response = await fetch(`${API_BASE_URL}/settings`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(settings)
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                let errorMessage = 'Ayarlar güncellenirken bir hata oluştu';
                
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
                console.log('Success response:', responseData);
                return responseData;
            } catch (jsonError) {
                console.log('Response is not JSON, returning success message');
                return { message: 'Ayarlar başarıyla güncellendi' };
            }
        } catch (error) {
            console.error('Settings service error:', error);
            throw new Error(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
        }
    },

    // Get restaurant settings
    async getRestaurantSettings() {
        try {
            // Get authentication token
            const token = localStorage.getItem('token');
            
            const headers = {
                'Accept': 'application/json',
            };
            
            // Add authorization header if token exists
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE_URL}/settings`, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                let errorMessage = 'Ayarlar alınırken bir hata oluştu';
                
                try {
                    const errorText = await response.text();
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
                return {};
            }
        } catch (error) {
            throw new Error(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
        }
    }
};
