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

    // Get daily sales summary with date parameter
    async getDailySalesSummary(date) {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Accept': 'application/json' };

            if (token) { headers['Authorization'] = `Bearer ${token}`; }

            const response = await fetch(`${API_BASE_URL}/daily-sales-summary/daily/${date}`, {
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
                return responseData;
            } catch (jsonError) {
                console.log('Response is not JSON, returning null');
                return null;
            }
        } catch (error) {
            console.error('Daily sales service error:', error);
            return null;
        }
    },

    // Get weekly sales summary with endDate parameter
    async getWeeklySalesSummary(endDate) {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Accept': 'application/json' };

            if (token) { headers['Authorization'] = `Bearer ${token}`; }

            const response = await fetch(`${API_BASE_URL}/daily-sales-summary/weekly/${endDate}`, {
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
                return responseData;
            } catch (jsonError) {
                console.log('Response is not JSON, returning null');
                return null;
            }
        } catch (error) {
            console.error('Weekly sales service error:', error);
            return null;
        }
    },

    // Get weekly sales data for multiple weeks (for chart display)
    async getWeeklySalesData(endDate) {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Accept': 'application/json' };

            if (token) { headers['Authorization'] = `Bearer ${token}`; }

            const response = await fetch(`${API_BASE_URL}/daily-sales-summary/weekly/${endDate}`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                console.log(`Weekly sales data API error: ${response.status} ${response.statusText}`);
                return null;
            }

            try {
                const responseData = await response.json();
                console.log('Weekly sales data loaded:', responseData);
                return responseData;
            } catch (jsonError) {
                console.log('Response is not JSON, returning null');
                return null;
            }
        } catch (error) {
            console.error('Weekly sales data service error:', error);
            return null;
        }
    },

    // Get monthly sales summary with year and month parameters
    async getMonthlySalesSummary(year, month) {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Accept': 'application/json' };

            if (token) { headers['Authorization'] = `Bearer ${token}`; }

            const response = await fetch(`${API_BASE_URL}/daily-sales-summary/monthly/${year}/${month}`, {
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
                return responseData;
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
