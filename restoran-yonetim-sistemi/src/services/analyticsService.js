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

                return responseData;
            } catch (jsonError) {

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

                return [];
            }

            try {
                const responseData = await response.json();

                return responseData;
            } catch (jsonError) {

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

                return [];
            }

            try {
                const responseData = await response.json();

                return responseData;
            } catch (jsonError) {

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

                return [];
            }

            try {
                const responseData = await response.json();

                return responseData;
            } catch (jsonError) {

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

                return {};
            }

            try {
                const responseData = await response.json();

                return responseData;
            } catch (jsonError) {

                return {};
            }
        } catch (error) {
            console.error('Sales by category service error:', error);
            return {};
        }
    },

    // Get all daily sales summaries
    async getAllDailySalesSummaries() {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Accept': 'application/json' };

            if (token) { headers['Authorization'] = `Bearer ${token}`; }

            const response = await fetch(`${API_BASE_URL}/daily-sales-summary/daily`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {

                return [];
            }

            try {
                const responseData = await response.json();

                return responseData;
            } catch (jsonError) {

                return [];
            }
        } catch (error) {
            console.error('All daily sales service error:', error);
            return [];
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

                return null;
            }

            try {
                const responseData = await response.json();

                return responseData;
            } catch (jsonError) {

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

                return null;
            }

            try {
                const responseData = await response.json();

                return responseData;
            } catch (jsonError) {

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
            const token = localStorage.getItem('token');
            const headers = { 'Accept': 'application/json' };

            if (token) { headers['Authorization'] = `Bearer ${token}`; }

            const response = await fetch(`${API_BASE_URL}/daily-sales-summary/weekly`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {

                return [];
            }

            try {
                const responseData = await response.json();

                return responseData;
            } catch (jsonError) {

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
            const token = localStorage.getItem('token');
            const headers = { 'Accept': 'application/json' };

            if (token) { headers['Authorization'] = `Bearer ${token}`; }

            const response = await fetch(`${API_BASE_URL}/daily-sales-summary/weekly/${endDate}`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {

                return null;
            }

            try {
                const responseData = await response.json();

                return responseData;
            } catch (jsonError) {

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
            const token = localStorage.getItem('token');
            const headers = { 'Accept': 'application/json' };

            if (token) { headers['Authorization'] = `Bearer ${token}`; }

            const response = await fetch(`${API_BASE_URL}/daily-sales-summary/monthly`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {

                return [];
            }

            try {
                const responseData = await response.json();

                return responseData;
            } catch (jsonError) {

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
            const token = localStorage.getItem('token');
            const headers = { 'Accept': 'application/json' };

            if (token) { headers['Authorization'] = `Bearer ${token}`; }

            const response = await fetch(`${API_BASE_URL}/daily-sales-summary/yearly`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {

                return [];
            }

            try {
                const responseData = await response.json();

                return responseData;
            } catch (jsonError) {

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
            const token = localStorage.getItem('token');
            const headers = { 'Accept': 'application/json' };

            if (token) { headers['Authorization'] = `Bearer ${token}`; }

            const response = await fetch(`${API_BASE_URL}/daily-sales-summary/monthly/${year}/${month}`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {

                return null;
            }

            try {
                const responseData = await response.json();

                return responseData;
            } catch (jsonError) {

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

                return null;
            }

            try {
                const responseData = await response.json();

                return responseData;
            } catch (jsonError) {

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
            const token = localStorage.getItem('token');
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

                return [];
            }

            try {
                const responseData = await response.json();

                return responseData;
            } catch (jsonError) {

                return [];
            }
        } catch (error) {
            console.error('Date range summaries service error:', error);
            return [];
        }
    },

    // Get employee performance analytics
    async getEmployeePerformance(period = 'DAILY') {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Accept': 'application/json' };

            if (token) { headers['Authorization'] = `Bearer ${token}`; }

            const params = new URLSearchParams({
                period: period
            });

            const response = await fetch(`${API_BASE_URL}/analytics/employee-performance?${params}`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {

                throw new Error(`Employee performance API error: ${response.status} ${response.statusText}`);
            }

            try {
                const responseData = await response.json();

                return responseData;
            } catch (jsonError) {

                return {};
            }
        } catch (error) {
            console.error('Employee performance service error:', error);
            throw error; // Re-throw the error so the component can handle it
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

                return null;
            }

            try {
                const responseData = await response.json();

                return responseData;
            } catch (jsonError) {

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

                return null;
            }

            try {
                const responseData = await response.json();

                return responseData;
            } catch (jsonError) {

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

                return null;
            }

            try {
                const responseData = await response.json();

                return responseData;
            } catch (jsonError) {

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

                return null;
            }

            try {
                const responseData = await response.json();

                return responseData;
            } catch (jsonError) {

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


            return results;
        } catch (error) {
            console.error('Generate all summaries service error:', error);
            return null;
        }
    },

    // Get real-time statistics for dashboard
    async getRealtimeStats() {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Accept': 'application/json' };

            if (token) { headers['Authorization'] = `Bearer ${token}`; }

            const response = await fetch(`${API_BASE_URL}/analytics/realtime-stats`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {

                return {
                    todayOrders: 0,
                    todayRevenue: 0,
                    weeklyOrders: 0,
                    weeklyRevenue: 0,
                    monthlyOrders: 0,
                    monthlyRevenue: 0,
                    activeReservations: 0
                };
            }

            try {
                const responseData = await response.json();

                return responseData;
            } catch (jsonError) {

                return {
                    todayOrders: 0,
                    todayRevenue: 0,
                    weeklyOrders: 0,
                    weeklyRevenue: 0,
                    monthlyOrders: 0,
                    monthlyRevenue: 0,
                    activeReservations: 0
                };
            }
        } catch (error) {
            console.error('Real-time stats service error:', error);
            return {
                todayOrders: 0,
                todayRevenue: 0,
                weeklyOrders: 0,
                weeklyRevenue: 0,
                monthlyOrders: 0,
                monthlyRevenue: 0,
                activeReservations: 0
            };
        }
    }
};
