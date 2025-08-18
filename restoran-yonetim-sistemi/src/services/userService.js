// User API Service - Fetch user profile information
import httpClient from '../utils/httpClient.js';
const DEBUG = import.meta?.env?.VITE_DEBUG_SERVICES === 'true';

export const userService = {
  // Fetch user by ID
  async getUserById(userId) {
    if (userId === undefined || userId === null) {
      throw new Error('Geçersiz kullanıcı ID');
    }

    try {
      const data = await httpClient.requestJson(`/users/${encodeURIComponent(userId)}`);
      return data;
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
      const blob = await dataUrlToBlob(dataUrl);
      const form = new FormData();
      form.append('file', blob, 'profile.jpg');

      // Most backends expect multipart at POST or PATCH. We default to POST.
      const response = await httpClient.request(`/users/${encodeURIComponent(userId)}/photo`, {
        method: 'POST',
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
        return data;
      } catch {
        return null;
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
      const response = await httpClient.request(`/users/${encodeURIComponent(userId)}/phone`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
      const response = await httpClient.request(`${encodeURI(`/users/${encodeURIComponent(userId)}/email`)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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


