// User API Service - Fetch user profile information
const API_BASE_URL = (import.meta?.env?.VITE_API_BASE_URL) || '/api';

export const userService = {
  // Fetch user by ID
  async getUserById(userId) {
    if (userId === undefined || userId === null) {
      throw new Error('Geçersiz kullanıcı ID');
    }

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Accept': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        let errorMessage = 'Kullanıcı bilgileri alınamadı';
        try {
          const errorText = await response.text();
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        } catch {}
        throw new Error(errorMessage);
      }

      try {
        const data = await response.json();
        return data;
      } catch {
        return null;
      }
    } catch (error) {
      throw new Error(error.message || 'Kullanıcı bilgileri alınamadı.');
    }
  }
};


