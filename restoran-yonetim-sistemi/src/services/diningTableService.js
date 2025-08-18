// Dining Table API Service - Backend communication layer
const API_BASE_URL = (import.meta?.env?.VITE_API_BASE_URL) || '/api';

export const diningTableService = {
    // Get all dining tables
    async getAllTables() {
        try {
            const response = await fetch(`${API_BASE_URL}/dining-tables`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
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
            const response = await fetch(`${API_BASE_URL}/dining-tables/salon/${salonId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
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
            const response = await fetch(`${API_BASE_URL}/dining-tables/available`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
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

            const response = await fetch(`${API_BASE_URL}/dining-tables/${tableId}/status/${backendStatus}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
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
            const response = await fetch(`${API_BASE_URL}/dining-tables/${tableId}/capacity/${capacity}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
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
            const response = await fetch(`${API_BASE_URL}/dining-tables/${tableId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
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
            const response = await fetch(`${API_BASE_URL}/dining-tables`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(tableData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
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
            const response = await fetch(`${API_BASE_URL}/dining-tables/${tableId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(tableData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
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
            const response = await fetch(`${API_BASE_URL}/dining-tables/${tableId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('Table deleted successfully');
            return true;
        } catch (error) {
            console.error('Error deleting table:', error);
            throw error;
        }
    },

    // Get table statuses with occupancy information
    async getTableStatuses() {
        try {
            const response = await fetch(`${API_BASE_URL}/table-statuses`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Table statuses fetched successfully:', result);
            return result;
        } catch (error) {
            console.error('Error fetching table statuses:', error);
            throw error;
        }
    }
};
