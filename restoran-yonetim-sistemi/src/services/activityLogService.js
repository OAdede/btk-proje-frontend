// Activity Log API Service - Backend communication layer
const API_BASE_URL = (import.meta?.env?.VITE_API_BASE_URL) || '/api';

function buildAuthHeaders() {
    const token = localStorage.getItem('token');
    const headers = { 'Accept': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

async function parseJsonOrEmpty(response) {
    try {
        return await response.json();
    } catch {
        return [];
    }
}

async function handleResponse(response, fallback = []) {
    if (!response.ok) {
        let errorMessage = `İstek başarısız: ${response.status}`;
        try {
            const text = await response.text();
            try {
                const data = JSON.parse(text);
                errorMessage = data.message || data.error || errorMessage;
            } catch {
                errorMessage = text || errorMessage;
            }
        } catch { }
        throw new Error(errorMessage);
    }
    return await parseJsonOrEmpty(response) ?? fallback;
}

export const activityLogService = {
    async getAll() {
        const res = await fetch(`${API_BASE_URL}/activity-logs`, {
            method: 'GET',
            headers: buildAuthHeaders()
        });
        return await handleResponse(res, []);
    },

    async getRecent() {
        const res = await fetch(`${API_BASE_URL}/activity-logs/recent`, {
            method: 'GET',
            headers: buildAuthHeaders()
        });
        return await handleResponse(res, []);
    },

    async getByUser(userId) {
        if (userId === undefined || userId === null || String(userId).trim() === '') {
            throw new Error('Geçersiz kullanıcı ID');
        }
        const res = await fetch(`${API_BASE_URL}/activity-logs/user/${encodeURIComponent(userId)}`, {
            method: 'GET',
            headers: buildAuthHeaders()
        });
        return await handleResponse(res, []);
    },

    async getByEntity(entityType, entityId) {
        if (!entityType || entityId === undefined || entityId === null) {
            throw new Error('Geçersiz varlık parametreleri');
        }
        const type = String(entityType).toUpperCase().trim();
        const id = String(entityId).trim();
        const res = await fetch(`${API_BASE_URL}/activity-logs/entity/${encodeURIComponent(type)}/${encodeURIComponent(id)}`, {
            method: 'GET',
            headers: buildAuthHeaders()
        });
        return await handleResponse(res, []);
    },

    async getByDateRange(startDate, endDate) {
        if (!startDate || !endDate) {
            throw new Error('Başlangıç ve bitiş tarihleri zorunludur');
        }
        const headers = buildAuthHeaders();
        const buildUrl = (s, e) => `${API_BASE_URL}/activity-logs/date-range?${new URLSearchParams({ startDate: s, endDate: e }).toString()}`;

        // 1) Try plain YYYY-MM-DD (input type="date" format)
        let res = await fetch(buildUrl(startDate, endDate), { method: 'GET', headers });
        if (res.ok) return await handleResponse(res, []);

        // 2) If backend expects full datetime bounds, try inclusive day range
        if (res.status === 400) {
            const s1 = `${startDate}T00:00:00`;
            const e1 = `${endDate}T23:59:59`;
            res = await fetch(buildUrl(s1, e1), { method: 'GET', headers });
            if (res.ok) return await handleResponse(res, []);
        }

        // 3) Some backends expect space instead of 'T'
        if (res.status === 400) {
            const s2 = `${startDate} 00:00:00`;
            const e2 = `${endDate} 23:59:59`;
            res = await fetch(buildUrl(s2, e2), { method: 'GET', headers });
            if (res.ok) return await handleResponse(res, []);
        }

        // If still failing, surface the original error details
        return await handleResponse(res, []);
    },

    async getByActionType(actionType) {
        if (!actionType) {
            throw new Error('Aksiyon tipi zorunludur');
        }
        const action = String(actionType).toUpperCase().replace(/\s+/g, '_');
        const res = await fetch(`${API_BASE_URL}/activity-logs/action/${encodeURIComponent(action)}`, {
            method: 'GET',
            headers: buildAuthHeaders()
        });
        return await handleResponse(res, []);
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


