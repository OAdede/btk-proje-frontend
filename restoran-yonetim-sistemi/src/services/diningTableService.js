// Dining Table API Service - Backend communication layer
// Using secure HTTP client with automatic authentication

// Import secure HTTP client and token manager
import httpClient from '../utils/httpClient.js';
import tokenManager from '../utils/tokenManager.js';

export const diningTableService = {
    // Get all dining tables
    async getAllTables() {
        try {
            const result = await httpClient.requestJson('dining-tables');
            console.log('Tables fetched successfully:', result);
            return result;
        } catch (error) {
            console.error('Error fetching tables:', error);
            throw error;
        }
    },

    // Get tables by salon
    async getTablesBySalon(salonId) {
        try {
            const result = await httpClient.requestJson(`dining-tables/salon/${salonId}`);
            console.log('Tables by salon fetched successfully:', result);
            return result;
        } catch (error) {
            console.error('Error fetching tables by salon:', error);
            throw error;
        }
    },

    // Get available tables
    async getAvailableTables() {
        try {
            const result = await httpClient.requestJson('dining-tables/available');
            console.log('Available tables fetched successfully:', result);
            return result;
        } catch (error) {
            console.error('Error fetching available tables:', error);
            throw error;
        }
    },

    // Update table status
    async updateTableStatus(tableId, status) {
        try {
            // Normalize status to backend enum
            const mapStatus = (s) => {
                if (!s) return 'AVAILABLE';
                const v = String(s).toLowerCase();
                if (v === 'empty' || v === 'bos' || v === 'available') return 'AVAILABLE';
                if (v === 'occupied' || v === 'dolu') return 'OCCUPIED';
                if (v === 'reserved' || v === 'rezerve') return 'RESERVED';
                return String(s).toUpperCase();
            };
            const backendStatus = mapStatus(status);

            const result = await httpClient.request(`dining-tables/${tableId}/status/${backendStatus}`, {
                method: 'PATCH'
            });
            console.log('Table status updated successfully:', result);
            return result;
        } catch (error) {
            console.error('Error updating table status:', error);
            throw error;
        }
    },

    // Update table capacity
    async updateTableCapacity(tableId, capacity) {
        try {
            const result = await httpClient.request(`dining-tables/${tableId}/capacity/${capacity}`, {
                method: 'PATCH'
            });
            console.log('Table capacity updated successfully:', result);
            return result;
        } catch (error) {
            console.error('Error updating table capacity:', error);
            throw error;
        }
    },

    // Get table by ID
    async getTableById(tableId) {
        try {
            const result = await httpClient.requestJson(`dining-tables/${tableId}`);
            console.log('Table fetched successfully:', result);
            return result;
        } catch (error) {
            console.error('Error fetching table:', error);
            throw error;
        }
    },

    // Create new table
    async createTable(tableData) {
        try {
            const result = await httpClient.requestJson('dining-tables', {
                method: 'POST',
                body: JSON.stringify(tableData)
            });
            console.log('Table created successfully:', result);
            return result;
        } catch (error) {
            console.error('Error creating table:', error);
            throw error;
        }
    },

    // Update table
    async updateTable(tableId, tableData) {
        try {
            const result = await httpClient.requestJson(`dining-tables/${tableId}`, {
                method: 'PUT',
                body: JSON.stringify(tableData)
            });
            console.log('Table updated successfully:', result);
            return result;
        } catch (error) {
            console.error('Error updating table:', error);
            throw error;
        }
    },

    // Delete table
    async deleteTable(tableId) {
        try {
            await httpClient.request(`dining-tables/${tableId}`, {
                method: 'DELETE'
            });
            console.log('Table deleted successfully');
            return true;
        } catch (error) {
            console.error('Error deleting table:', error);
            throw error;
        }
    }
};
