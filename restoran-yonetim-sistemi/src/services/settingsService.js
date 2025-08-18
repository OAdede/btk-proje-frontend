// Settings API Service - Backend communication layer
// Prefer environment variable; fallback to Vite dev proxy path
import httpClient from '../utils/httpClient.js';
const DEBUG = import.meta?.env?.VITE_DEBUG_SERVICES === 'true';

export const settingsService = {
    // Update restaurant settings
    async updateRestaurantSettings(settings) {
        try {
            if (DEBUG) console.log('Making API call to update settings');

            const responseData = await httpClient.requestJson('/settings', {
                method: 'PUT',
                body: JSON.stringify(settings)
            });

            if (DEBUG) console.log('Settings updated successfully');
            return responseData;
        } catch (error) {
            if (DEBUG) console.error('Settings service error:', error);
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
