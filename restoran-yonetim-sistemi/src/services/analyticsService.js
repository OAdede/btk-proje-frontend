// Analytics API Service
const API_BASE_URL = (import.meta?.env?.VITE_API_BASE_URL) || '/api';

export const analyticsService = {
    // Get top products summary (daily, weekly, monthly, yearly)
    async getTopProductsSummary() {
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Accept': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE_URL}/analytics/top-products/summary`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                let errorMessage = 'Analytics verileri yüklenirken bir hata oluştu';
                
                try {
                    const errorText = await response.text();
                    console.log('Analytics API error response:', errorText);

                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    } catch {
                        errorMessage = errorText || errorMessage;
                    }
                } catch (textError) {
                    console.log('Could not read response as text:', textError);
                }

                throw new Error(errorMessage);
            }

            try {
                const responseData = await response.json();
                console.log('Top products summary loaded:', responseData);
                return responseData;
            } catch (jsonError) {
                console.log('Response is not JSON, returning empty object');
                return {
                    daily: [],
                    weekly: [],
                    monthly: [],
                    yearly: []
                };
            }
        } catch (error) {
            console.error('Analytics service error:', error);
            throw new Error(error.message || 'Analytics verileri yüklenirken bir hata oluştu.');
        }
    }
};
