// Salon API Service - Backend communication layer
import httpClient from '../utils/httpClient.js';
const DEBUG = import.meta?.env?.VITE_DEBUG_SERVICES === 'true';

export const salonService = {
    // Get all salons
    async getAllSalons() {
        try {
            const result = await httpClient.requestJson('/salons');
            if (DEBUG) console.log('Salons fetched successfully');
            return result;
        } catch (error) {
            console.error('Error fetching salons:', error);
            throw error;
        }
    },

    // Get salon by ID
    async getSalonById(salonId) {
        try {
            const result = await httpClient.requestJson(`/salons/${salonId}`);
            if (DEBUG) console.log('Salon fetched successfully');
            return result;
        } catch (error) {
            console.error('Error fetching salon:', error);
            throw error;
        }
    },

    // Create new salon
    async createSalon(salonData) {
        try {
            const name = String(salonData?.name || '').trim();
            if (!name) throw new Error('Salon adı zorunludur');
            const doRequest = async (payload) => {
                if (DEBUG) console.log('Sending salon payload');
                return httpClient.request(`/salons`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify(payload)
                });
            };

            // Try with name and capacity first (backend requires capacity)
            let response = await doRequest({ name, capacity: 100 });

            if (!response.ok) {
                // Log detailed error for debugging
                const errorText = await response.text();
                if (DEBUG) console.error('Backend error response status:', response.status);

                // Parse server message
                let status = response.status;
                let data; try { data = JSON.parse(errorText); } catch { data = { message: errorText }; }
                const messages = [];
                if (data) {
                    if (data.message) messages.push(data.message);
                    if (data.error && data.error !== data.message) messages.push(data.error);
                    const fieldErrors = data.errors || data.fieldErrors || data.violations || [];
                    if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
                        fieldErrors.forEach((e) => {
                            const field = e.field || e.property || e.fieldName || e.path || '';
                            const msg = e.defaultMessage || e.message || e.reason || JSON.stringify(e);
                            messages.push(field ? `${field}: ${msg}` : msg);
                        });
                    }
                }

                // If backend requires a code/prefix, retry silently with an auto code
                const combined = (messages.join(' ') || '').toLowerCase();
                const needsCode = status === 400 && (combined.includes('code') || combined.includes('prefix'));
                if (needsCode) {
                    const autoCode = (name.charAt(0) || 'S').toUpperCase().replace(/[^A-ZÇĞİÖŞÜ]/g, 'S').slice(0, 1);
                    if (DEBUG) console.log('Backend requires code, retrying');
                    response = await doRequest({ name, code: autoCode, capacity: 100 });
                }

                if (!response.ok) {
                    // Build readable error
                    let errText = `HTTP error! status: ${response.status}`;
                    try {
                        const txt = await response.text();
                        const json = (() => { try { return JSON.parse(txt); } catch { return { message: txt }; } })();
                        const msgs = [];
                        if (json) {
                            if (json.message) msgs.push(json.message);
                            if (json.error && json.error !== json.message) msgs.push(json.error);
                            const fErrs = json.errors || json.fieldErrors || json.violations || [];
                            if (Array.isArray(fErrs)) {
                                fErrs.forEach(e => {
                                    const field = e.field || e.property || e.fieldName || '';
                                    const msg = e.defaultMessage || e.message || e.reason || JSON.stringify(e);
                                    msgs.push(field ? `${field}: ${msg}` : msg);
                                });
                            }
                        }
                        if (msgs.length > 0) errText = msgs.join('\n');
                    } catch {}
                    throw new Error(errText);
                }
            }

            const result = await response.json();
            if (DEBUG) console.log('Salon created successfully');
            return result;
        } catch (error) {
            console.error('Error creating salon:', error);
            throw error;
        }
    },

    // Update salon
    async updateSalon(salonId, salonData) {
        try {
            const response = await httpClient.request(`/salons/${salonId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(salonData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (DEBUG) console.log('Salon updated successfully');
            return result;
        } catch (error) {
            console.error('Error updating salon:', error);
            throw error;
        }
    },

    // Delete salon
    async deleteSalon(salonId) {
        try {
            const response = await httpClient.request(`/salons/${salonId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            if (DEBUG) console.log('Salon deleted successfully');
            return true;
        } catch (error) {
            console.error('Error deleting salon:', error);
            throw error;
        }
    }
};
