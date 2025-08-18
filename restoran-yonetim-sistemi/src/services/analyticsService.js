// Analytics API Service
const API_BASE_URL = (import.meta?.env?.VITE_API_BASE_URL) || '/api';

// Import secure HTTP client and token manager
import httpClient from '../utils/httpClient.js';
import tokenManager from '../utils/tokenManager.js';

export const analyticsService = {
    // Get top products summary (daily, weekly, monthly, yearly)
    async getTopProductsSummary() {
        try {
            const responseData = await httpClient.requestJson('/analytics/top-products/summary');
            console.log('Top products summary loaded:', responseData);
            return responseData;
        } catch (error) {
            console.error('Analytics service error:', error);
            // Return fallback data structure
            return { daily: [], weekly: [], monthly: [], yearly: [] };
        }
    },

    // Get daily top products from specific daily endpoint
    async getDailyTopProducts(limit = 10) {
        try {
            const responseData = await httpClient.requestJson(`/analytics/top-products/daily?limit=${limit}`);
            console.log('Daily top products loaded:', responseData);
            return responseData;
        } catch (error) {
            console.error('Daily top products service error:', error);
            return [];
        }
    },

    // Get weekly top products from specific weekly endpoint
    async getWeeklyTopProducts(limit = 10) {
        try {
            const responseData = await httpClient.requestJson(`/analytics/top-products/weekly?limit=${limit}`);
            console.log('Weekly top products loaded:', responseData);
            return responseData;
        } catch (error) {
            console.error('Weekly top products service error:', error);
            return [];
        }
    },

    // Get monthly top products from specific monthly endpoint
    async getMonthlyTopProducts(limit = 10) {
        try {
            const responseData = await httpClient.requestJson(`/analytics/top-products/monthly?limit=${limit}`);
            console.log('Monthly top products loaded:', responseData);
            return responseData;
        } catch (error) {
            console.error('Monthly top products service error:', error);
            return [];
        }
    },

    // Get sales by category
    async getSalesByCategory(startDate, endDate = null) {
        try {
            let url = `/daily-sales-summary/sales-by-category?startDate=${startDate}`;
            if (endDate) {
                url += `&endDate=${endDate}`;
            }

            const responseData = await httpClient.requestJson(url);
            console.log('Sales by category loaded:', responseData);
            return responseData;
        } catch (error) {
            console.error('Sales by category service error:', error);
            return {};
        }
    },

    // Get all daily sales summaries
    async getAllDailySalesSummaries() {
        try {
            const responseData = await httpClient.requestJson('/daily-sales-summary/daily');
            console.log('All daily sales summaries loaded:', responseData);
            return responseData;
        } catch (error) {
            console.error('All daily sales service error:', error);
            return [];
        }
    },

    // Get daily sales summary with date parameter
    async getDailySalesSummary(date) {
        try {
            const responseData = await httpClient.requestJson(`/daily-sales-summary/daily/${date}`);
            console.log('Daily sales summary loaded:', responseData);
            return responseData;
        } catch (error) {
            console.error('Daily sales service error:', error);
            return null;
        }
    },

    // Get weekly sales summary with endDate parameter
    async getWeeklySalesSummary(endDate) {
        try {
            const token = tokenManager.getToken();
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

    // Get all weekly sales summaries
    async getAllWeeklySalesSummaries() {
        try {
            const token = tokenManager.getToken();
            const headers = { 'Accept': 'application/json' };

            if (token) { headers['Authorization'] = `Bearer ${token}`; }

            const response = await fetch(`${API_BASE_URL}/daily-sales-summary/weekly`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                console.log(`All weekly sales API error: ${response.status} ${response.statusText}`);
                return [];
            }

            try {
                const responseData = await response.json();
                console.log('All weekly sales summaries loaded:', responseData);
                return responseData;
            } catch (jsonError) {
                console.log('Response is not JSON, returning empty array');
                return [];
            }
        } catch (error) {
            console.error('All weekly sales service error:', error);
            return [];
        }
    },

    // Get weekly sales data for multiple weeks (for chart display)
    async getWeeklySalesData(endDate) {
        try {
            const token = tokenManager.getToken();
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

    // Get all monthly sales summaries
    async getAllMonthlySalesSummaries() {
        try {
            const token = tokenManager.getToken();
            const headers = { 'Accept': 'application/json' };

            if (token) { headers['Authorization'] = `Bearer ${token}`; }

            const response = await fetch(`${API_BASE_URL}/daily-sales-summary/monthly`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                console.log(`All monthly sales API error: ${response.status} ${response.statusText}`);
                return [];
            }

            try {
                const responseData = await response.json();
                console.log('All monthly sales summaries loaded:', responseData);
                return responseData;
            } catch (jsonError) {
                console.log('Response is not JSON, returning empty array');
                return [];
            }
        } catch (error) {
            console.error('All monthly sales service error:', error);
            return [];
        }
    },

    // Get all yearly sales summaries
    async getAllYearlySalesSummaries() {
        try {
            const token = tokenManager.getToken();
            const headers = { 'Accept': 'application/json' };

            if (token) { headers['Authorization'] = `Bearer ${token}`; }

            const response = await fetch(`${API_BASE_URL}/daily-sales-summary/yearly`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                console.log(`All yearly sales API error: ${response.status} ${response.statusText}`);
                return [];
            }

            try {
                const responseData = await response.json();
                console.log('All yearly sales summaries loaded:', responseData);
                return responseData;
            } catch (jsonError) {
                console.log('Response is not JSON, returning empty array');
                return [];
            }
        } catch (error) {
            console.error('All yearly sales service error:', error);
            return [];
        }
    },

    // Get monthly sales summary with year and month parameters
    async getMonthlySalesSummary(year, month) {
        try {
            const token = tokenManager.getToken();
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
            const token = tokenManager.getToken();
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
    },

    // Get sales summaries by date range
    async getSalesSummariesByDateRange(startDate, endDate) {
        try {
            const token = tokenManager.getToken();
            const headers = { 'Accept': 'application/json' };

            if (token) { headers['Authorization'] = `Bearer ${token}`; }

            const params = new URLSearchParams({
                startDate: startDate,
                endDate: endDate
            });

            const response = await fetch(`${API_BASE_URL}/daily-sales-summary/date-range?${params}`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                console.log(`Date range summaries API error: ${response.status} ${response.statusText}`);
                return [];
            }

            try {
                const responseData = await response.json();
                console.log('Date range summaries loaded:', responseData);
                return responseData;
            } catch (jsonError) {
                console.log('Response is not JSON, returning empty array');
                return [];
            }
        } catch (error) {
            console.error('Date range summaries service error:', error);
            return [];
        }
    },

    // Get employee performance analytics
    async getEmployeePerformance() {
        try {
            const token = tokenManager.getToken();
            const headers = { 'Accept': 'application/json' };

            if (token) { headers['Authorization'] = `Bearer ${token}`; }

            // Try different parameter combinations to see what works
            const params = new URLSearchParams({
                // Add common parameters that might be required
                limit: '10',
                date: new Date().toISOString().split('T')[0]
            });

            const response = await fetch(`${API_BASE_URL}/analytics/employee-performance?${params}`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                console.log(`Employee performance API error: ${response.status} ${response.statusText}`);
                
                // Try to get error details from response
                try {
                    const errorData = await response.text();
                    console.log('Error response body:', errorData);
                } catch (e) {
                    console.log('Could not read error response body');
                }
                
                throw new Error(`Employee performance API error: ${response.status} ${response.statusText}`);
            }

            try {
                const responseData = await response.json();
                console.log('Employee performance loaded:', responseData);
                return responseData;
            } catch (jsonError) {
                console.log('Response is not JSON, returning empty object');
                return {};
            }
        } catch (error) {
            console.error('Employee performance service error:', error);
            throw error; // Re-throw the error so the component can handle it
        }
    }
};
