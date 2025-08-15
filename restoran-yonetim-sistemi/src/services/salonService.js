// Salon API Service - Backend communication layer
const API_BASE_URL = 'http://localhost:5174/api';

export const salonService = {
  async createSalon(salonData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/salons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(salonData)
      });

      const contentType = response.headers.get('content-type') || '';
      let data;
      
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const message = typeof data === 'string' ? data : data?.message || `HTTP ${response.status}`;
        throw new Error(message);
      }

      return data;
    } catch (error) {
      console.error('Salon oluşturma hatası:', error);
      throw error;
    }
  },

  async getSalons() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/salons`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const contentType = response.headers.get('content-type') || '';
      let data;
      
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const message = typeof data === 'string' ? data : data?.message || `HTTP ${response.status}`;
        throw new Error(message);
      }

      return data;
    } catch (error) {
      console.error('Salonları getirme hatası:', error);
      throw error;
    }
  },

  async deleteSalon(salonId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/salons/${salonId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type') || '';
        let data;
        
        if (contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        const message = typeof data === 'string' ? data : data?.message || `HTTP ${response.status}`;
        throw new Error(message);
      }

      return true;
    } catch (error) {
      console.error('Salon silme hatası:', error);
      throw error;
    }
  }
};
