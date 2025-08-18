// Reservation API Service - Backend communication layer
const API_BASE_URL = (import.meta?.env?.VITE_API_BASE_URL) || '/api';
import httpClient from '../utils/httpClient.js';
import tokenManager from '../utils/tokenManager.js';
import secureStorage from '../utils/secureStorage.js';
const DEBUG = import.meta?.env?.VITE_DEBUG_SERVICES === 'true';

// SECURITY: Helper to get current user ID from secure storage
const getCurrentUserId = () => {
  const userData = secureStorage.getItem('user');
  if (userData) {
    return userData.userId;
  }
  // Fallback: try to get from legacy localStorage (migration support)
  const legacyUserId = localStorage.getItem('userId');
  if (legacyUserId) {
    localStorage.removeItem('userId'); // Clean up legacy storage
    return legacyUserId;
  }
  return null;
};

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
  if (DEBUG) console.log('reservationService.createReservation called');

      const requestBody = {
        tableId: toBigInt(reservationData.tableId),                       // bigint
        customerName: `${reservationData.ad ?? ''} ${reservationData.soyad ?? ''}`.trim(), // character varying
        customerPhone: reservationData.telefon,                        // character varying
        reservationTime: buildLocalDateTime(reservationData.tarih, reservationData.saat), // timestamp with timezone
        specialRequest: reservationData.not ?? '',                     // character varying
        statusId: toInt(reservationData.statusId, 1),                 // integer
        createdBy: toBigInt(reservationData.createdBy ?? getCurrentUserId(), 1) // bigint
      };

  if (DEBUG) console.log('requestBody built for reservation');

      // Son bir zorunlu alan kontrolü (null/undefined yakala)
      const required = ['tableId', 'customerName', 'customerPhone', 'reservationTime', 'createdBy'];
      for (const k of required) {
        if (requestBody[k] === null || requestBody[k] === undefined || requestBody[k] === '') {
          console.error(`❌ Zorunlu alan eksik: ${k} = ${requestBody[k]}`);
          throw new Error(`CLIENT_VALIDATION: Zorunlu alan eksik: ${k}`);
        }
      }

  if (DEBUG) console.log('All required fields present, sending to backend');

      // Use httpClient for automatic auth handling and better error management
      const result = await httpClient.requestJson('/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

  if (DEBUG) console.log('Reservation created successfully');
      return result;
    } catch (error) {
  if (DEBUG) console.error('Reservation create error:', error);
      throw error;
    }
  },

  // Get all reservations
  async getAllReservations() {
    return await httpClient.requestJson('/reservations');
  },

  // Get all reservations (alias for getAllReservations)
  async getReservations() {
    return this.getAllReservations();
  },

  // Get reservation by ID
  async getReservationById(id) {
    return await httpClient.requestJson(`/reservations/${id}`);
  },

  // Get reservations by table
  async getReservationsByTable(tableId) {
    try {
      return await httpClient.requestJson(`/reservations/table/${tableId}`);
    } catch (error) {
      if (DEBUG) console.error('Error fetching reservations by table:', error);
      throw error;
    }
  },

  // Get reservations by salon
  async getReservationsBySalon(salonId) {
    try {
      return await httpClient.requestJson(`/reservations/salon/${salonId}`);
    } catch (error) {
      if (DEBUG) console.error('Error fetching reservations by salon:', error);
      throw error;
    }
  },

  // Get today's reservations
  async getTodayReservations() {
    try {
      return await httpClient.requestJson(`/reservations/today`);
    } catch (error) {
      if (DEBUG) console.error("Error fetching today's reservations:", error);
      throw error;
    }
  },

  // Get reservations by status
  async getReservationsByStatus(statusId) {
    try {
      return await httpClient.requestJson(`/reservations/status/${statusId}`);
    } catch (error) {
      if (DEBUG) console.error('Error fetching reservations by status:', error);
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
        createdBy: toBigInt(reservationData.createdBy ?? getCurrentUserId(), 1) // bigint
      };

      const result = await httpClient.requestJson(`/reservations/${reservationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      if (DEBUG) console.log('Reservation updated successfully');
      return result;
    } catch (error) {
      if (DEBUG) console.error('Error updating reservation:', error);
      throw error;
    }
  },

  // Cancel reservation
  async cancelReservation(reservationId) {
    try {
  const result = await httpClient.requestJson(`/reservations/${reservationId}/cancel`, {
        method: 'PUT'
      });
  if (DEBUG) console.log('Reservation cancelled successfully');
      return result;
    } catch (error) {
  if (DEBUG) console.error('Error cancelling reservation:', error);
      throw error;
    }
  },

  // Complete reservation
  async completeReservation(reservationId) {
    try {
  const result = await httpClient.requestJson(`/reservations/${reservationId}/complete`, {
        method: 'PUT'
      });
  if (DEBUG) console.log('Reservation completed successfully');
      return result;
    } catch (error) {
  if (DEBUG) console.error('Error completing reservation:', error);
      throw error;
    }
  },

  // Mark reservation as no-show
  async markAsNoShow(reservationId) {
    try {
      const result = await httpClient.requestJson(`/reservations/${reservationId}/no-show`, {
        method: 'PUT'
      });
      if (DEBUG) console.log('Reservation marked as no-show successfully');
      return result;
    } catch (error) {
      if (DEBUG) console.error('Error marking reservation as no-show:', error);
      throw error;
    }
  },

  // Delete reservation
  async deleteReservation(reservationId) {
    try {
      await httpClient.request(`/reservations/${reservationId}`, { method: 'DELETE' });
      if (DEBUG) console.log('Reservation deleted successfully');
      return true;
    } catch (error) {
      if (DEBUG) console.error('Error deleting reservation:', error);
      throw error;
    }
  },

  // Get reservations by date range
  async getReservationsByDateRange(startDate, endDate) {
    try {
      const params = new URLSearchParams({ startDate, endDate });
      return await httpClient.requestJson(`/reservations/date-range?${params}`);
    } catch (error) {
      if (DEBUG) console.error('Error fetching reservations by date range:', error);
      throw error;
    }
  }
};
