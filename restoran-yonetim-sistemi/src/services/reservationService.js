// Reservation API Service - Backend communication layer
const API_BASE_URL = (import.meta?.env?.VITE_API_BASE_URL) || '/api';

export const reservationService = {
    // Create new reservation
    async createReservation(reservationData) {
        try {
            // Backend'in beklediği format
            const requestBody = {
                salonId: parseInt(reservationData.salonId) || 1, // Varsayılan salon ID
                tableId: parseInt(reservationData.tableId),
                customerName: `${reservationData.ad} ${reservationData.soyad}`.trim(),
                customerPhone: reservationData.telefon,
                reservationTime: `${reservationData.tarih}T${reservationData.saat}:00`, // ISO format
                specialRequests: reservationData.not || '',
                statusId: 1, // 1 = confirmed
                createdBy: parseInt(localStorage.getItem('userId')) || 1 // Varsayılan kullanıcı ID
            };

            console.log('Sending reservation request:', requestBody);

            const response = await fetch(`${API_BASE_URL}/reservations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // JWT token
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Backend error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const result = await response.json();
            console.log('Reservation created successfully:', result);
            return result;
        } catch (error) {
            console.error('Error creating reservation:', error);
            throw error;
        }
    },

    // Get all reservations
    async getReservations() {
        try {
            const response = await fetch(`${API_BASE_URL}/reservations`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // JWT token
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error fetching reservations:', error);
            throw error;
        }
    },

    // Get reservations by table
    async getReservationsByTable(tableId) {
        try {
            const response = await fetch(`${API_BASE_URL}/reservations/table/${tableId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // JWT token
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error fetching reservations by table:', error);
            throw error;
        }
    },

    // Get reservations by salon
    async getReservationsBySalon(salonId) {
        try {
            const response = await fetch(`${API_BASE_URL}/reservations/salon/${salonId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // JWT token
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error fetching reservations by salon:', error);
            throw error;
        }
    },

    // Get today's reservations
    async getTodayReservations() {
        try {
            const response = await fetch(`${API_BASE_URL}/reservations/today`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // JWT token
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error fetching today\'s reservations:', error);
            throw error;
        }
    },

    // Get reservations by status
    async getReservationsByStatus(statusId) {
        try {
            const response = await fetch(`${API_BASE_URL}/reservations/status/${statusId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // JWT token
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error fetching reservations by status:', error);
            throw error;
        }
    },

    // Update reservation
    async updateReservation(reservationId, reservationData) {
        try {
            const requestBody = {
                salonId: parseInt(reservationData.salonId) || 1,
                tableId: parseInt(reservationData.tableId),
                customerName: `${reservationData.ad} ${reservationData.soyad}`.trim(),
                customerPhone: reservationData.telefon,
                reservationTime: `${reservationData.tarih}T${reservationData.saat}:00`,
                specialRequests: reservationData.not || '',
                statusId: reservationData.statusId || 1,
                createdBy: parseInt(localStorage.getItem('userId')) || 1
            };

            const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // JWT token
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const result = await response.json();
            console.log('Reservation updated successfully:', result);
            return result;
        } catch (error) {
            console.error('Error updating reservation:', error);
            throw error;
        }
    },

    // Cancel reservation
    async cancelReservation(reservationId) {
        try {
            const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/cancel`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // JWT token
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Reservation cancelled successfully:', result);
            return result;
        } catch (error) {
            console.error('Error cancelling reservation:', error);
            throw error;
        }
    },

    // Complete reservation
    async completeReservation(reservationId) {
        try {
            const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/complete`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // JWT token
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Reservation completed successfully:', result);
            return result;
        } catch (error) {
            console.error('Error completing reservation:', error);
            throw error;
        }
    },

    // Mark reservation as no-show
    async markAsNoShow(reservationId) {
        try {
            const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/no-show`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // JWT token
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Reservation marked as no-show successfully:', result);
            return result;
        } catch (error) {
            console.error('Error marking reservation as no-show:', error);
            throw error;
        }
    },

    // Delete reservation
    async deleteReservation(reservationId) {
        try {
            const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // JWT token
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('Reservation deleted successfully');
            return true;
        } catch (error) {
            console.error('Error deleting reservation:', error);
            throw error;
        }
    },

    // Get reservations by date range
    async getReservationsByDateRange(startDate, endDate) {
        try {
            const response = await fetch(`${API_BASE_URL}/reservations/date-range?startDate=${startDate}&endDate=${endDate}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // JWT token
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error fetching reservations by date range:', error);
            throw error;
        }
    }
};
