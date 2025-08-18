// Activity Log API Service - Backend communication layer
import httpClient from '../utils/httpClient.js';
const DEBUG = import.meta?.env?.VITE_DEBUG_SERVICES === 'true';

export const activityLogService = {
    async getAll() {
        try {
            const data = await httpClient.requestJson('/activity-logs');
            return Array.isArray(data) ? data : [];
        } catch (e) {
            if (DEBUG) console.error('activityLogService.getAll error:', e);
            return [];
        }
    },

    async getRecent() {
        try {
            const data = await httpClient.requestJson('/activity-logs/recent');
            return Array.isArray(data) ? data : [];
        } catch (e) {
            if (DEBUG) console.error('activityLogService.getRecent error:', e);
            return [];
        }
    },

    async getByUser(userId) {
        if (userId === undefined || userId === null || String(userId).trim() === '') {
            throw new Error('Geçersiz kullanıcı ID');
        }
        try {
            const data = await httpClient.requestJson(`/activity-logs/user/${encodeURIComponent(userId)}`);
            return Array.isArray(data) ? data : [];
        } catch (e) {
            if (DEBUG) console.error('activityLogService.getByUser error:', e);
            return [];
        }
    },

    async getByEntity(entityType, entityId) {
        if (!entityType || entityId === undefined || entityId === null) {
            throw new Error('Geçersiz varlık parametreleri');
        }
        const type = String(entityType).toUpperCase().trim();
        const id = String(entityId).trim();
        try {
            const data = await httpClient.requestJson(`/activity-logs/entity/${encodeURIComponent(type)}/${encodeURIComponent(id)}`);
            return Array.isArray(data) ? data : [];
        } catch (e) {
            if (DEBUG) console.error('activityLogService.getByEntity error:', e);
            return [];
        }
    },

    async getByDateRange(startDate, endDate) {
        if (!startDate || !endDate) {
            throw new Error('Başlangıç ve bitiş tarihleri zorunludur');
        }
        const buildParams = (s, e) => new URLSearchParams({ startDate: s, endDate: e }).toString();
        
        // 1) Try plain YYYY-MM-DD
        try {
            return await httpClient.requestJson(`/activity-logs/date-range?${buildParams(startDate, endDate)}`);
        } catch (firstErr) {
            // 2) Try full datetime bounds
            try {
                const s1 = `${startDate}T00:00:00`;
                const e1 = `${endDate}T23:59:59`;
                return await httpClient.requestJson(`/activity-logs/date-range?${buildParams(s1, e1)}`);
            } catch (secondErr) {
                // 3) Some backends expect space instead of 'T'
                try {
                    const s2 = `${startDate} 00:00:00`;
                    const e2 = `${endDate} 23:59:59`;
                    return await httpClient.requestJson(`/activity-logs/date-range?${buildParams(s2, e2)}`);
                } catch (thirdErr) {
                    if (DEBUG) console.error('activityLogService.getByDateRange error:', thirdErr);
                    return [];
                }
            }
        }
    },

    async getByActionType(actionType) {
        if (!actionType) {
            throw new Error('Aksiyon tipi zorunludur');
        }
        const action = String(actionType).toUpperCase().replace(/\s+/g, '_');
        try {
            const data = await httpClient.requestJson(`/activity-logs/action/${encodeURIComponent(action)}`);
            return Array.isArray(data) ? data : [];
        } catch (e) {
            if (DEBUG) console.error('activityLogService.getByActionType error:', e);
            return [];
        }
    }
};

// Helper to safely extract a human-readable message from details json/text
export function extractLogMessage(details) {
    try {
        if (!details) return '';
        if (typeof details === 'string') {
            // Try to parse if stringified JSON
            try {
                const parsed = JSON.parse(details);
                return parsed.message || details;
            } catch {
                return details;
            }
        }
        if (typeof details === 'object') {
            return details.message || JSON.stringify(details);
        }
        return String(details);
    } catch {
        return '';
    }
}


