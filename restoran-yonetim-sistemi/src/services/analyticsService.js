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

    // Get daily top products from specific daily endpoint
    async getDailyTopProducts(limit = 10) {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Accept': 'application/json' };

            if (token) { headers['Authorization'] = `Bearer ${token}`; }

            const response = await fetch(`${API_BASE_URL}/analytics/top-products/daily?limit=${limit}`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                console.log(`Daily top products API error: ${response.status} ${response.statusText}`);
                return [];
            }

            try {
                const responseData = await response.json();
                console.log('Daily top products loaded:', responseData);
                return responseData;
            } catch (jsonError) {
                console.log('Response is not JSON, returning empty array');
                return [];
            }
        } catch (error) {
            console.error('Daily top products service error:', error);
            return [];
        }
    },

    // Get weekly top products from specific weekly endpoint
    async getWeeklyTopProducts(limit = 10) {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Accept': 'application/json' };

            if (token) { headers['Authorization'] = `Bearer ${token}`; }

            const response = await fetch(`${API_BASE_URL}/analytics/top-products/weekly?limit=${limit}`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                console.log(`Weekly top products API error: ${response.status} ${response.statusText}`);
                return [];
            }

            try {
                const responseData = await response.json();
                console.log('Weekly top products loaded:', responseData);
                return responseData;
            } catch (jsonError) {
                console.log('Response is not JSON, returning empty array');
                return [];
            }
        } catch (error) {
            console.error('Weekly top products service error:', error);
            return [];
        }
    },

    // Get monthly top products from specific monthly endpoint
    async getMonthlyTopProducts(limit = 10) {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Accept': 'application/json' };

            if (token) { headers['Authorization'] = `Bearer ${token}`; }

            const response = await fetch(`${API_BASE_URL}/analytics/top-products/monthly?limit=${limit}`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                console.log(`Monthly top products API error: ${response.status} ${response.statusText}`);
                return [];
            }

            try {
                const responseData = await response.json();
                console.log('Monthly top products loaded:', responseData);
                return responseData;
            } catch (jsonError) {
                console.log('Response is not JSON, returning empty array');
                return [];
            }
        } catch (error) {
            console.error('Monthly top products service error:', error);
            return [];
        }
    },

    // Get sales by category
    async getSalesByCategory(startDate, endDate = null) {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Accept': 'application/json' };

            if (token) { headers['Authorization'] = `Bearer ${token}`; }

            let url = `${API_BASE_URL}/daily-sales-summary/sales-by-category?startDate=${startDate}`;
            if (endDate) {
                url += `&endDate=${endDate}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                console.log(`Sales by category API error: ${response.status} ${response.statusText}`);
                return {};
            }

            try {
                const responseData = await response.json();
                console.log('Sales by category loaded:', responseData);
                return responseData;
            } catch (jsonError) {
                console.log('Response is not JSON, returning empty object');
                return {};
            }
        } catch (error) {
            console.error('Sales by category service error:', error);
            return {};
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
    },

    // Get sales data for custom date range
    async getDateRangeSalesSummary(startDate, endDate, reportType) {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Accept': 'application/json' };

            if (token) { headers['Authorization'] = `Bearer ${token}`; }

            const params = new URLSearchParams({
                startDate: startDate,
                endDate: endDate,
                reportType: reportType
            });

            const response = await fetch(`${API_BASE_URL}/daily-sales-summary/generate/date-range?${params}`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                console.log(`Date range sales API error: ${response.status} ${response.statusText}`);
                return null;
            }

            try {
                const responseData = await response.json();
                console.log('Date range sales summary loaded:', responseData);
                return responseData;
            } catch (jsonError) {
                console.log('Response is not JSON, returning null');
                return null;
            }
        } catch (error) {
            console.error('Date range sales service error:', error);
            return null;
        }
    }
};
