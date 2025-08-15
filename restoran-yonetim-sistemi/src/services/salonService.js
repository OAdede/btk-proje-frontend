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

<<<<<<< HEAD
      return data;
    } catch (error) {
      console.error('Salon oluşturma hatası:', error);
      throw error;
=======
    // Get salon by ID
    async getSalonById(salonId) {
        try {
            const response = await fetch(`${API_BASE_URL}/salons/${salonId}`, {
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
            console.log('Salon fetched successfully:', result);
            return result;
        } catch (error) {
            console.error('Error fetching salon:', error);
            throw error;
        }
    },

    // Create new salon
    async createSalon(salonData) {
        try {
            // Ensure required fields are present
            if (!salonData.name) {
                throw new Error('Salon name is required');
            }

            // Prepare the data for backend
            const backendData = {
                name: salonData.name.trim()
            };

            console.log('Creating salon with data:', backendData);

            const response = await fetch(`${API_BASE_URL}/salons`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(backendData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Backend error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            console.log('Salon created successfully:', result);
            return result;
        } catch (error) {
            console.error('Error creating salon:', error);
            throw error;
        }
    },

    // Update salon
    async updateSalon(salonId, salonData) {
        try {
            // Ensure required fields are present
            if (!salonData.name) {
                throw new Error('Salon name is required');
            }

            // Prepare the data for backend
            const backendData = {
                name: salonData.name.trim()
            };

            console.log('Updating salon with data:', salonId, backendData);

            const response = await fetch(`${API_BASE_URL}/salons/${salonId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(backendData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Backend error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            console.log('Salon updated successfully:', result);
            return result;
        } catch (error) {
            console.error('Error updating salon:', error);
            throw error;
        }
    },

    // Delete salon
    async deleteSalon(salonId) {
        try {
            console.log('Deleting salon:', salonId);

            const response = await fetch(`${API_BASE_URL}/salons/${salonId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Backend error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            console.log('Salon deleted successfully');
            return true;
        } catch (error) {
            console.error('Error deleting salon:', error);
            throw error;
        }
>>>>>>> 78644f60a7f8f70c0238a5ac37d61126c1b27569
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
