import React, { useState } from 'react';
import { reservationService } from '../../services/reservationService';
import { authService } from '../../services/authService';

export default function BackendTest() {
    const [testResult, setTestResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('zeynepbalci4321@gmail.com');
    const [password, setPassword] = useState('Zr@1234567');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        setTestResult('Login yapılıyor...');
        
        try {
            const result = await authService.login(email, password);
            setIsAuthenticated(true);
            setTestResult(`✅ Login başarılı!\n${JSON.stringify(result, null, 2)}`);
        } catch (error) {
            setTestResult(`❌ Login hatası:\n${error.message}`);
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    const testBackendConnection = async () => {
        if (!isAuthenticated) {
            setTestResult('❌ Önce login yapmalısınız!');
            return;
        }

        setLoading(true);
        setTestResult('Test başlatılıyor...');
        
        try {
            // Test rezervasyon verisi
            const testData = {
                ad: 'Test',
                soyad: 'Kullanıcı',
                telefon: '5551234567',
                email: 'test@example.com',
                tarih: '2024-12-25',
                saat: '19:00',
                kisiSayisi: '4',
                not: 'Test rezervasyonu',
                tableId: '1',
                salonId: '1'
            };

            setTestResult('Backend\'e rezervasyon gönderiliyor...');
            
            // Backend'e rezervasyon gönder
            const result = await reservationService.createReservation(testData);
            
            setTestResult(`✅ Başarılı! Rezervasyon oluşturuldu:\n${JSON.stringify(result, null, 2)}`);
            
            // Başarılı olduktan sonra rezervasyonları getir
            try {
                const reservations = await reservationService.getReservations();
                setTestResult(prev => prev + `\n\n📋 Toplam ${reservations.length} rezervasyon bulundu.`);
            } catch (error) {
                setTestResult(prev => prev + `\n\n⚠️ Rezervasyonlar getirilemedi: ${error.message}`);
            }
            
        } catch (error) {
            setTestResult(`❌ Hata oluştu:\n${error.message}`);
            console.error('Test error:', error);
        } finally {
            setLoading(false);
        }
    };

    const testGetReservations = async () => {
        if (!isAuthenticated) {
            setTestResult('❌ Önce login yapmalısınız!');
            return;
        }

        setLoading(true);
        setTestResult('Rezervasyonlar getiriliyor...');
        
        try {
            const reservations = await reservationService.getReservations();
            setTestResult(`✅ Başarılı! ${reservations.length} rezervasyon bulundu:\n${JSON.stringify(reservations, null, 2)}`);
        } catch (error) {
            setTestResult(`❌ Hata oluştu:\n${error.message}`);
            console.error('Test error:', error);
        } finally {
            setLoading(false);
        }
    };

    const testGetTodayReservations = async () => {
        if (!isAuthenticated) {
            setTestResult('❌ Önce login yapmalısınız!');
            return;
        }

        setLoading(true);
        setTestResult('Bugünkü rezervasyonlar getiriliyor...');
        
        try {
            const reservations = await reservationService.getTodayReservations();
            setTestResult(`✅ Başarılı! Bugün ${reservations.length} rezervasyon bulundu:\n${JSON.stringify(reservations, null, 2)}`);
        } catch (error) {
            setTestResult(`❌ Hata oluştu:\n${error.message}`);
            console.error('Test error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>🔧 Backend Bağlantı Testi</h2>
            
            <div style={{ marginBottom: '20px' }}>
                <p><strong>Bu sayfa backend bağlantısını test etmek için kullanılır.</strong></p>
                <p>Test etmeden önce backend'in çalıştığından emin olun.</p>
            </div>

            {/* Login Form */}
            {!isAuthenticated && (
                <div style={{ 
                    backgroundColor: '#f0f8ff', 
                    padding: '20px', 
                    borderRadius: '10px', 
                    marginBottom: '20px',
                    border: '2px solid #2196F3'
                }}>
                    <h3>🔐 JWT Authentication</h3>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', flex: 1 }}
                        />
                        <input
                            type="password"
                            placeholder="Şifre"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', flex: 1 }}
                        />
                        <button 
                            onClick={handleLogin}
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#2196F3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Login...' : '🔑 Login'}
                        </button>
                    </div>
                    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                        <strong>Test için:</strong> zeynepbalci4321@gmail.com / Zr@1234567
                    </p>
                </div>
            )}

            {/* Authentication Status */}
            {isAuthenticated && (
                <div style={{ 
                    backgroundColor: '#e8f5e8', 
                    padding: '15px', 
                    borderRadius: '10px', 
                    marginBottom: '20px',
                    border: '2px solid #4CAF50',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h3 style={{ margin: 0, color: '#4CAF50' }}>✅ Authenticated</h3>
                        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                            Token: {localStorage.getItem('token')?.substring(0, 20)}...
                        </p>
                    </div>
                    <button 
                        onClick={() => {
                            authService.logout();
                            setIsAuthenticated(false);
                            setTestResult('Logout yapıldı');
                        }}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        🚪 Logout
                    </button>
                </div>
            )}

            {/* Test Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button 
                    onClick={testBackendConnection}
                    disabled={loading || !isAuthenticated}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: isAuthenticated ? '#4CAF50' : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: (loading || !isAuthenticated) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Test Ediliyor...' : '🚀 Rezervasyon Oluştur Testi'}
                </button>

                <button 
                    onClick={testGetReservations}
                    disabled={loading || !isAuthenticated}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: isAuthenticated ? '#2196F3' : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: (loading || !isAuthenticated) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Test Ediliyor...' : '📋 Tüm Rezervasyonları Getir'}
                </button>

                <button 
                    onClick={testGetTodayReservations}
                    disabled={loading || !isAuthenticated}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: isAuthenticated ? '#FF9800' : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: (loading || !isAuthenticated) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Test Ediliyor...' : '📅 Bugünkü Rezervasyonlar'}
                </button>
            </div>

            <div style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '15px', 
                borderRadius: '5px',
                border: '1px solid #ddd',
                minHeight: '200px',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: '14px'
            }}>
                {testResult || 'Test sonuçları burada görünecek...'}
            </div>

            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '5px' }}>
                <h4>🔍 Test Açıklaması:</h4>
                <ul>
                    <li><strong>Rezervasyon Oluştur Testi:</strong> Backend'e örnek bir rezervasyon gönderir</li>
                    <li><strong>Tüm Rezervasyonları Getir:</strong> Backend'den tüm rezervasyonları çeker</li>
                    <li><strong>Bugünkü Rezervasyonlar:</strong> Sadece bugünkü rezervasyonları getirir</li>
                </ul>
                
                <h4>⚠️ Dikkat Edilecekler:</h4>
                <ul>
                    <li>Backend'in çalışır durumda olduğundan emin olun</li>
                    <li>Vite proxy ayarlarının doğru olduğunu kontrol edin</li>
                    <li>Console'da hata mesajlarını takip edin</li>
                </ul>
            </div>
        </div>
    );
}
