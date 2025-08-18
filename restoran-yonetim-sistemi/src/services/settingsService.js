// Settings API Service - Backend communication layer
// Prefer environment variable; fallback to Vite dev proxy path
const API_BASE_URL = (import.meta?.env?.VITE_API_BASE_URL) || '/api';

// Import secure HTTP client and token manager
import httpClient from '../utils/httpClient.js';
import tokenManager from '../utils/tokenManager.js';

export const settingsService = {
    // Update restaurant settings
    async updateRestaurantSettings(settings) {
        try {
            console.log('Making API call to update settings');
            console.log('Request body:', settings);

            const responseData = await httpClient.requestJson('/settings', {
                method: 'PUT',
                body: JSON.stringify(settings)
            });

            console.log('Settings updated successfully:', responseData);
            return responseData;

                throw new Error(errorMessage);
        } catch (error) {
            console.error('Settings service error:', error);
            throw new Error(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
        }
    },

    // Get restaurant settings
    async getRestaurantSettings() {
        try {
            const responseData = await httpClient.requestJson('/settings');
            return responseData;
        } catch (error) {
            throw new Error(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
        }
    }
};
