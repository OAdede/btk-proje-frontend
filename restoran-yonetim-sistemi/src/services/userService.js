// User API Service - Fetch user profile information
const API_BASE_URL = (import.meta.env && import.meta.env.VITE_API_BASE_URL) || '/api';

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
  ,

  // Upload/Update user's profile photo
  async uploadUserPhoto(userId, dataUrl) {
    if (userId === undefined || userId === null) {
      throw new Error('Geçersiz kullanıcı ID');
    }
    if (!dataUrl) {
      throw new Error('Yüklenecek fotoğraf bulunamadı');
    }

    // Convert data URL to Blob
    const dataUrlToBlob = async (url) => {
      const res = await fetch(url);
      return await res.blob();
    };

    try {
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const blob = await dataUrlToBlob(dataUrl);
      const form = new FormData();
      form.append('file', blob, 'profile.jpg');

      // Most backends expect multipart at POST or PATCH. We default to POST.
      const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(userId)}/photo`, {
        method: 'POST',
        headers,
        body: form,
      });

      if (!response.ok) {
        let errorMessage = 'Profil fotoğrafı güncellenemedi';
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
        return data; // Backend dönerse yeni user objesi veya bilgi
      } catch {
        return null; // Response body yoksa
      }
    } catch (error) {
      throw new Error(error.message || 'Profil fotoğrafı güncellenemedi.');
    }
  },

  // Update user's phone number
  async updateUserPhone(userId, phoneNumber) {
    if (userId === undefined || userId === null) {
      throw new Error('Geçersiz kullanıcı ID');
    }
    if (!phoneNumber || String(phoneNumber).trim().length === 0) {
      throw new Error('Geçerli bir telefon numarası giriniz');
    }

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(userId)}/phone`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ phoneNumber }),
      });

      if (!response.ok) {
        let errorMessage = 'Telefon numarası güncellenemedi';
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
      throw new Error(error.message || 'Telefon numarası güncellenemedi.');
    }
  },

  // Update user's email address
  async updateUserEmail(userId, email) {
    if (userId === undefined || userId === null) {
      throw new Error('Geçersiz kullanıcı ID');
    }
    if (!email || !email.includes('@')) {
      throw new Error('Geçerli bir e-posta adresi giriniz');
    }

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(userId)}/email`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        let errorMessage = 'E-posta adresi güncellenemedi';
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
      throw new Error(error.message || 'E-posta adresi güncellenemedi.');
    }
  },

  // Update user's profile photo (alias for uploadUserPhoto)
  async updateUserPhoto(userId, photoDataUrl) {
    return this.uploadUserPhoto(userId, photoDataUrl);
  }
};


