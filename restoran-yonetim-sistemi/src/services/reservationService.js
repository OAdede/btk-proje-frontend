// Reservation API Service - Backend communication layer
const API_BASE_URL = (import.meta?.env?.VITE_API_BASE_URL) || '/api';

const toInt = (v, defVal = null) => {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : defVal;
};

const toBigInt = (v, defVal = null) => {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : defVal;
};

const buildLocalDateTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) {
    throw new Error('CLIENT_VALIDATION: Tarih ve saat zorunludur.');
  }
  const d = String(dateStr).trim();
  const t = String(timeStr).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
    throw new Error(`CLIENT_VALIDATION: Geçersiz tarih formatı: ${d} (yyyy-MM-dd olmalı)`);
  }
  if (!/^\d{2}:\d{2}$/.test(t)) {
    throw new Error(`CLIENT_VALIDATION: Geçersiz saat formatı: ${t} (HH:mm olmalı)`);
  }
  return `${d}T${t}:00`; // Backend DTO: yyyy-MM-dd'T'HH:mm:ss (PostgreSQL timestamp with timezone)
};

export const reservationService = {
  // Create new reservation
  async createReservation(reservationData) {
    try {
      console.log('🔍 reservationService.createReservation - GELEN VERİ:', reservationData);
      console.log('🔍 Gelen veri tipi:', typeof reservationData);
      console.log('🔍 Gelen veri keys:', Object.keys(reservationData));

      const requestBody = {
        tableId: toBigInt(reservationData.tableId),                       // bigint
        customerName: `${reservationData.ad ?? ''} ${reservationData.soyad ?? ''}`.trim(), // character varying
        customerPhone: reservationData.telefon,                        // character varying
        reservationTime: buildLocalDateTime(reservationData.tarih, reservationData.saat), // timestamp with timezone
        specialRequest: reservationData.not ?? '',                     // character varying
        statusId: toInt(reservationData.statusId, 1),                 // integer
        createdBy: toBigInt(reservationData.createdBy ?? localStorage.getItem('userId'), 1) // bigint
      };

      console.log('🔍 Oluşturulan requestBody:', requestBody);

      // Son bir zorunlu alan kontrolü (null/undefined yakala)
      const required = ['tableId', 'customerName', 'customerPhone', 'reservationTime', 'createdBy'];
      for (const k of required) {
        if (requestBody[k] === null || requestBody[k] === undefined || requestBody[k] === '') {
          console.error(`❌ Zorunlu alan eksik: ${k} = ${requestBody[k]}`);
          throw new Error(`CLIENT_VALIDATION: Zorunlu alan eksik: ${k}`);
        }
      }

      console.log('✅ Tüm zorunlu alanlar mevcut, backend\'e gönderiliyor...');

      const response = await fetch(`${API_BASE_URL}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Rezervasyon başarıyla oluşturuldu:', result);
      return result;
    } catch (error) {
      console.error('❌ Rezervasyon oluşturma hatası:', error);
      throw error;
    }
  },

  // Get all reservations
  async getAllReservations() {
    const response = await fetch(`${API_BASE_URL}/reservations`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  // Get all reservations (alias for getAllReservations)
  async getReservations() {
    return this.getAllReservations();
  },

  // Get reservation by ID
  async getReservationById(id) {
    const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
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
        tableId: toBigInt(reservationData.tableId), // bigint
        customerName: reservationData.customerName || `${reservationData.ad} ${reservationData.soyad}`.trim(), // character varying
        customerPhone: reservationData.customerPhone || reservationData.telefon, // character varying
        reservationTime: reservationData.reservationTime || `${reservationData.tarih}T${reservationData.saat}:00`, // timestamp with timezone
        specialRequest: reservationData.specialRequest || reservationData.not || '', // character varying
        statusId: toInt(reservationData.statusId, 1), // integer
        createdBy: toBigInt(reservationData.createdBy ?? localStorage.getItem('userId'), 1) // bigint
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
