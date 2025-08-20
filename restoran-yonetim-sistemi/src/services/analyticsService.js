// Analytics API Service
import httpClient from '../utils/httpClient.js';
const DEBUG = import.meta?.env?.VITE_DEBUG_SERVICES === 'true';

export const analyticsService = {
    // Get top products summary (daily, weekly, monthly, yearly)
    async getTopProductsSummary() {
        try {
            const responseData = await httpClient.requestJson('/analytics/top-products/summary');
            if (DEBUG) console.log('Top products summary loaded');
            return responseData;
        } catch (error) {
            if (DEBUG) console.error('Analytics service error:', error);
            return { daily: [], weekly: [], monthly: [], yearly: [] };
        }
    },

    // Get daily top products from specific daily endpoint
    async getDailyTopProducts(limit = 10) {
        try {
            const responseData = await httpClient.requestJson(`/analytics/top-products/daily?limit=${limit}`);
            if (DEBUG) console.log('Daily top products loaded');
            return responseData;
        } catch (error) {
            if (DEBUG) console.error('Daily top products service error:', error);
            return [];
        }
    },

    // Get weekly top products from specific weekly endpoint
    async getWeeklyTopProducts(limit = 10) {
        try {
            const responseData = await httpClient.requestJson(`/analytics/top-products/weekly?limit=${limit}`);
            if (DEBUG) console.log('Weekly top products loaded');
            return responseData;
        } catch (error) {
            if (DEBUG) console.error('Weekly top products service error:', error);
            return [];
        }
    },

    // Get monthly top products from specific monthly endpoint
    async getMonthlyTopProducts(limit = 10) {
        try {
            const responseData = await httpClient.requestJson(`/analytics/top-products/monthly?limit=${limit}`);
            if (DEBUG) console.log('Monthly top products loaded');
            return responseData;
        } catch (error) {
            if (DEBUG) console.error('Monthly top products service error:', error);
            return [];
        }
    },

    // Get sales by category
    async getSalesByCategory(startDate, endDate = null) {
        try {
            let url = `/daily-sales-summary/sales-by-category?startDate=${startDate}`;
            if (endDate) url += `&endDate=${endDate}`;
            const responseData = await httpClient.requestJson(url);
            if (DEBUG) console.log('Sales by category loaded');
            return responseData;
        } catch (error) {
            if (DEBUG) console.error('Sales by category service error:', error);
            return {};
        }
    },

    // Get all daily sales summaries
    async getAllDailySalesSummaries() {
        try {
            const responseData = await httpClient.requestJson('/daily-sales-summary/daily');
            if (DEBUG) console.log('All daily sales summaries loaded');
            return responseData;
        } catch (error) {
            if (DEBUG) console.error('All daily sales service error:', error);
            return [];
        }
    },

    // Get daily sales summary with date parameter
    async getDailySalesSummary(date) {
        try {
            const responseData = await httpClient.requestJson(`/daily-sales-summary/daily/${date}`);
            if (DEBUG) console.log('Daily sales summary loaded');
            return responseData;
        } catch (error) {
            if (DEBUG) console.error('Daily sales service error:', error);
            return null;
        }
    },

    // Get weekly sales summary with endDate parameter
    async getWeeklySalesSummary(endDate) {
        try {
            const responseData = await httpClient.requestJson(`/daily-sales-summary/weekly/${endDate}`);
            if (DEBUG) console.log('Weekly sales summary loaded');
            return responseData;
        } catch (error) {
            if (DEBUG) console.error('Weekly sales service error:', error);
            return null;
        }
    },

    // Get all weekly sales summaries
    async getAllWeeklySalesSummaries() {
        try {
            const responseData = await httpClient.requestJson('/daily-sales-summary/weekly');
            if (DEBUG) console.log('All weekly sales summaries loaded');
            return responseData;
        } catch (error) {
            if (DEBUG) console.error('All weekly sales service error:', error);
            return [];
        }
    },

    // Get weekly sales data for multiple weeks (for chart display)
    async getWeeklySalesData(endDate) {
        try {
            const responseData = await httpClient.requestJson(`/daily-sales-summary/weekly/${endDate}`);
            if (DEBUG) console.log('Weekly sales data loaded');
            return responseData;
        } catch (error) {
            if (DEBUG) console.error('Weekly sales data service error:', error);
            return null;
        }
    },

    // Get all monthly sales summaries
    async getAllMonthlySalesSummaries() {
        try {
            const responseData = await httpClient.requestJson('/daily-sales-summary/monthly');
            if (DEBUG) console.log('All monthly sales summaries loaded');
            return responseData;
        } catch (error) {
            if (DEBUG) console.error('All monthly sales service error:', error);
            return [];
        }
    },

    // Get all yearly sales summaries
    async getAllYearlySalesSummaries() {
        try {
            const responseData = await httpClient.requestJson('/daily-sales-summary/yearly');
            if (DEBUG) console.log('All yearly sales summaries loaded');
            return responseData;
        } catch (error) {
            if (DEBUG) console.error('All yearly sales service error:', error);
            return [];
        }
    },

    // Get monthly sales summary with year and month parameters
    async getMonthlySalesSummary(year, month) {
        try {
            const responseData = await httpClient.requestJson(`/daily-sales-summary/monthly/${year}/${month}`);
            if (DEBUG) console.log('Monthly sales summary loaded');
            return responseData;
        } catch (error) {
            if (DEBUG) console.error('Monthly sales service error:', error);
            return null;
        }
    },

    // Get sales data for custom date range
    async getDateRangeSalesSummary(startDate, endDate, reportType) {
        try {
            const params = new URLSearchParams({ startDate, endDate, reportType });
            const responseData = await httpClient.requestJson(`/daily-sales-summary/generate/date-range?${params}`);
            if (DEBUG) console.log('Date range sales summary loaded');
            return responseData;
        } catch (error) {
            if (DEBUG) console.error('Date range sales service error:', error);
            return null;
        }
    },

    // Get sales summaries by date range
    async getSalesSummariesByDateRange(startDate, endDate) {
        try {
            const params = new URLSearchParams({ startDate, endDate });
            const responseData = await httpClient.requestJson(`/daily-sales-summary/date-range?${params}`);
            if (DEBUG) console.log('Date range summaries loaded');
            return responseData;
        } catch (error) {
            if (DEBUG) console.error('Date range summaries service error:', error);
            return [];
        }
    },

    // Get employee performance analytics
    async getEmployeePerformance() {
        try {
            const params = new URLSearchParams({ limit: '10', date: new Date().toISOString().split('T')[0] });
            const responseData = await httpClient.requestJson(`/analytics/employee-performance?${params}`);
            if (DEBUG) console.log('Employee performance loaded');
            return responseData;
        } catch (error) {
            if (DEBUG) console.error('Employee performance service error:', error);
            throw error;
        }
    },

    // Manual Summary Generation Methods
    // Generate daily summary for a specific date
    async generateDailySummary(date) {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Accept': 'application/json' };

            if (token) { headers['Authorization'] = `Bearer ${token}`; }

            const response = await fetch(`${API_BASE_URL}/analytics/generate-daily?date=${date}`, {
                method: 'POST',
                headers: headers
            });

            if (!response.ok) {
                console.log(`Generate daily summary API error: ${response.status} ${response.statusText}`);
                return null;
            }

            try {
                const responseData = await response.json();
                console.log('Daily summary generated:', responseData);
                return responseData;
            } catch (jsonError) {
                console.log('Response is not JSON, returning null');
                return null;
            }
        } catch (error) {
            console.error('Generate daily summary service error:', error);
            return null;
        }
    },

    // Generate weekly summary for a specific end date
    async generateWeeklySummary(endDate) {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Accept': 'application/json' };

            if (token) { headers['Authorization'] = `Bearer ${token}`; }

            const response = await fetch(`${API_BASE_URL}/analytics/generate-weekly?endDate=${endDate}`, {
                method: 'POST',
                headers: headers
            });

            if (!response.ok) {
                console.log(`Generate weekly summary API error: ${response.status} ${response.statusText}`);
                return null;
            }

            try {
                const responseData = await response.json();
                console.log('Weekly summary generated:', responseData);
                return responseData;
            } catch (jsonError) {
                console.log('Response is not JSON, returning null');
                return null;
            }
        } catch (error) {
            console.error('Generate weekly summary service error:', error);
            return null;
        }
    },

    // Generate monthly summary for a specific year and month
    async generateMonthlySummary(year, month) {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Accept': 'application/json' };

            if (token) { headers['Authorization'] = `Bearer ${token}`; }

            const response = await fetch(`${API_BASE_URL}/analytics/generate-monthly?year=${year}&month=${month}`, {
                method: 'POST',
                headers: headers
            });

            if (!response.ok) {
                console.log(`Generate monthly summary API error: ${response.status} ${response.statusText}`);
                return null;
            }

            try {
                const responseData = await response.json();
                console.log('Monthly summary generated:', responseData);
                return responseData;
            } catch (jsonError) {
                console.log('Response is not JSON, returning null');
                return null;
            }
        } catch (error) {
            console.error('Generate monthly summary service error:', error);
            return null;
        }
    },

    // Generate yearly summary for a specific year
    async generateYearlySummary(year) {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Accept': 'application/json' };

            if (token) { headers['Authorization'] = `Bearer ${token}`; }

            const response = await fetch(`${API_BASE_URL}/analytics/generate-yearly?year=${year}`, {
                method: 'POST',
                headers: headers
            });

            if (!response.ok) {
                console.log(`Generate yearly summary API error: ${response.status} ${response.statusText}`);
                return null;
            }

            try {
                const responseData = await response.json();
                console.log('Yearly summary generated:', responseData);
                return responseData;
            } catch (jsonError) {
                console.log('Response is not JSON, returning null');
                return null;
            }
        } catch (error) {
            console.error('Generate yearly summary service error:', error);
            return null;
        }
    },

    // Generate all summaries for current timestamp
    async generateAllSummariesForCurrentTime() {
        try {
            const now = new Date();
            const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1; // 1-based month
            
            // Get current week's end date (Sunday)
            const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
            const daysToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
            const currentWeekEndDate = new Date(now);
            currentWeekEndDate.setDate(now.getDate() + daysToSunday);
            const weekEndDate = currentWeekEndDate.toISOString().split('T')[0];

            console.log('Generating summaries for current timestamp:', {
                currentDate,
                weekEndDate,
                currentYear,
                currentMonth
            });

            // Generate all summaries in parallel
            const [dailyResult, weeklyResult, monthlyResult, yearlyResult] = await Promise.allSettled([
                this.generateDailySummary(currentDate),
                this.generateWeeklySummary(weekEndDate),
                this.generateMonthlySummary(currentYear, currentMonth),
                this.generateYearlySummary(currentYear)
            ]);

            const results = {
                daily: dailyResult.status === 'fulfilled' ? dailyResult.value : null,
                weekly: weeklyResult.status === 'fulfilled' ? weeklyResult.value : null,
                monthly: monthlyResult.status === 'fulfilled' ? monthlyResult.value : null,
                yearly: yearlyResult.status === 'fulfilled' ? yearlyResult.value : null
            };

            console.log('All summaries generated:', results);
            return results;
        } catch (error) {
            console.error('Generate all summaries service error:', error);
            return null;
        }
    }
};
