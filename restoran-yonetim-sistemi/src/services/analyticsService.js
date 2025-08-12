// Analytics API Service
const API_BASE_URL = (import.meta?.env?.VITE_API_BASE_URL) || '/api';

export const analyticsService = {
    // Get top products summary (daily, weekly, monthly, yearly)
    async getTopProductsSummary() {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Accept': 'application/json' };

            if (token) { headers['Authorization'] = `Bearer ${token}`; }

            const response = await fetch(`${API_BASE_URL}/analytics/top-products/summary`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                console.log(`Analytics API error: ${response.status} ${response.statusText}`);
                return { daily: [], weekly: [], monthly: [], yearly: [] };
            }

            try {
                const responseData = await response.json();
                console.log('Top products summary loaded:', responseData);
                return responseData;
            } catch (jsonError) {
                console.log('Response is not JSON, returning empty object');
                return { daily: [], weekly: [], monthly: [], yearly: [] };
            }
        } catch (error) {
            console.error('Analytics service error:', error);
            throw new Error(error.message || 'Analytics verileri yüklenirken bir hata oluştu.');
        }
    },

    // Get daily sales summary
    async getDailySalesSummary(date) {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Accept': 'application/json' };

            if (token) { headers['Authorization'] = `Bearer ${token}`; }

            const response = await fetch(`${API_BASE_URL}/daily-sales-summary/daily`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                console.log(`Daily sales API error: ${response.status} ${response.statusText}`);
                return null;
            }

            try {
                const responseData = await response.json();
                console.log('Daily sales summary loaded:', responseData);
                
                // API array döndürüyor, ilk elemanı al veya null döndür
                if (Array.isArray(responseData) && responseData.length > 0) {
                    return responseData[0]; // İlk daily sales raporunu döndür
                } else {
                    console.log('No daily sales data found in response');
                    return null;
                }
            } catch (jsonError) {
                console.log('Response is not JSON, returning null');
                return null;
            }
        } catch (error) {
            console.error('Daily sales service error:', error);
            return null;
        }
    },

    // Get weekly sales summary
    async getWeeklySalesSummary() {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Accept': 'application/json' };

            if (token) { headers['Authorization'] = `Bearer ${token}`; }

            const response = await fetch(`${API_BASE_URL}/daily-sales-summary/weekly`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                console.log(`Weekly sales API error: ${response.status} ${response.statusText}`);
                return null;
            }

            try {
                const responseData = await response.json();
                console.log('Weekly sales summary loaded:', responseData);
                
                // API array döndürüyor, ilk elemanı al veya null döndür
                if (Array.isArray(responseData) && responseData.length > 0) {
                    return responseData[0]; // İlk weekly sales raporunu döndür
                } else {
                    console.log('No weekly sales data found in response');
                    return null;
                }
            } catch (jsonError) {
                console.log('Response is not JSON, returning null');
                return null;
            }
        } catch (error) {
            console.error('Weekly sales service error:', error);
            return null;
        }
    },

    // Get monthly sales summary
    async getMonthlySalesSummary() {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Accept': 'application/json' };

            if (token) { headers['Authorization'] = `Bearer ${token}`; }

            const response = await fetch(`${API_BASE_URL}/daily-sales-summary/monthly`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                console.log(`Monthly sales API error: ${response.status} ${response.statusText}`);
                return null;
            }

            try {
                const responseData = await response.json();
                console.log('Monthly sales summary loaded:', responseData);
                
                // API array döndürüyor, ilk elemanı al veya null döndür
                if (Array.isArray(responseData) && responseData.length > 0) {
                    return responseData[0]; // İlk monthly sales raporunu döndür
                } else {
                    console.log('No monthly sales data found in response');
                    return null;
                }
            } catch (jsonError) {
                console.log('Response is not JSON, returning null');
                return null;
            }
        } catch (error) {
            console.error('Monthly sales service error:', error);
            return null;
        }
    }
};
