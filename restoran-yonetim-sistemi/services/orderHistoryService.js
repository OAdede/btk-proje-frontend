// Sipariş geçmişi verilerini çeker
const API_BASE_URL = (import.meta?.env?.VITE_API_BASE_URL) || '/api';

export async function fetchAllOrders() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/orders`, {
      headers: {
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Sipariş geçmişi alınırken hata:', error);
    if (error.response) {
      throw new Error(`Sunucu hatası: ${error.response.status} - ${error.response.statusText}`);
    } else if (error.request) {
      throw new Error('Sunucuya ulaşılamıyor. Backend çalışıyor mu?');
    } else {
      throw new Error('İstek yapılandırma hatası: ' + error.message);
    }
  }
}
