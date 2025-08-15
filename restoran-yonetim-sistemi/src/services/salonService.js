// src/services/salonService.js
const API_BASE_URL = import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:5174/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const ct = res.headers.get('content-type') || '';
  let data;
  if (ct.includes('application/json')) {
    data = await res.json().catch(() => null);
  } else {
    data = await res.text().catch(() => null);
  }

  if (!res.ok) {
    const msg = typeof data === 'string' ? data : data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export const salonService = {
  getSalons() {
    const token = localStorage.getItem('token');
    return request('/salons', { token });
  },

  getSalonById(salonId) {
    const token = localStorage.getItem('token');
    return request(`/salons/${salonId}`, { token });
  },

  createSalon(salonData) {
    const token = localStorage.getItem('token');
    if (!salonData?.name) throw new Error('Salon name is required');
    if (salonData.capacity == null) throw new Error('Salon capacity is required');
    if (!salonData.description) throw new Error('Salon description is required');
    if (salonData.total_tables == null) throw new Error('Salon total_tables is required');
    const body = {
      name: salonData.name.trim(),
      capacity: Number(salonData.capacity),
      description: salonData.description,
      total_tables: Number(salonData.total_tables),
    };
    if (salonData.id != null) body.id = Number(salonData.id);
    return request('/salons', { method: 'POST', body, token });
  },

  updateSalon(salonId, salonData) {
    const token = localStorage.getItem('token');
    if (!salonData?.name) throw new Error('Salon name is required');
    return request(`/salons/${salonId}`, { method: 'PUT', body: { name: salonData.name.trim() }, token });
  },

  async deleteSalon(salonId) {
    const token = localStorage.getItem('token');
    await request(`/salons/${salonId}`, { method: 'DELETE', token });
    return true;
  },
};
