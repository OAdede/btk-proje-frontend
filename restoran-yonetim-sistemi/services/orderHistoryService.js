// Sipariş geçmişi verilerini çeker
import axios from 'axios';

export async function fetchAllOrders() {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/orders', {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });
    return response.data;
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
