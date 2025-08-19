// Sipariş geçmişi verilerini çeker (centralized httpClient)
import httpClient from '../src/utils/httpClient.js';

export async function fetchAllOrders() {
  try {
    // Base URL and auth are handled by httpClient
    const data = await httpClient.requestJson('/orders');
    return data;
  } catch (error) {
    console.error('Sipariş geçmişi alınırken hata:', error);
    const msg = String(error?.message || 'Bilinmeyen hata');
    if (/\b(401|403)\b|unauthorized|forbidden/i.test(msg)) {
      throw new Error('Yetkisiz erişim: Sipariş geçmişi için izniniz yok.');
    }
    throw new Error(msg);
  }
}
