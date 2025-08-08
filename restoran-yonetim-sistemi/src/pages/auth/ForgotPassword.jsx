import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Açık tema renkleri (sabit)
  const lightColors = {
    background: '#F5EFFF',
    cardBackground: '#CBC3E3',
    surfaceBackground: '#E5D9F2',
    primary: '#A294F9',
    accent: '#CDC1FF',
    text: '#1A0B3D', // Daha koyu mor - daha okunabilir
    textSecondary: '#2D1B69', // Daha koyu - daha okunabilir
    border: '#CDC1FF',
    danger: '#EF4444',
    success: '#10B981',
    textMuted: '#4A3B76' // Daha koyu - daha okunabilir
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Lütfen e-posta adresinizi girin.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Backend'e gönderilecek request formatı: { "email": "string" }
      const response = await authService.requestPasswordReset(email);

      // Backend'den gelen response: {}
      // Başarılı durumda kullanıcıya bilgi mesajı göster
      setMessage('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. E-postanızı kontrol edin.');
    } catch (err) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${lightColors.primary}20 0%, ${lightColors.background} 100%)`,
      fontFamily: 'Inter, Segoe UI, Arial, sans-serif'
    }}>
      <div style={{
        padding: '40px',
        minWidth: 350,
        maxWidth: 420,
        borderRadius: '20px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.13)',
        background: lightColors.cardBackground,
        backdropFilter: 'blur(2px)',
        border: `1px solid ${lightColors.border}`
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{
            width: 70,
            height: 70,
            background: `linear-gradient(135deg, ${lightColors.primary} 0%, ${lightColors.accent} 100%)`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: '0 4px 16px 0 rgba(167, 139, 250, 0.3)'
          }}>
            <span style={{
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '24px',
              letterSpacing: '2px'
            }}>🔒</span>
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 800,
            color: lightColors.primary,
            textAlign: 'center',
            margin: '0 0 8px 0',
            letterSpacing: '2px'
          }}>
            Şifremi Unuttum
          </h1>
          <p style={{
            fontSize: '14px',
            color: lightColors.textSecondary,
            textAlign: 'center',
            margin: '0 0 16px 0',
            fontWeight: 400
          }}>
            E-posta adresinizi girin, şifre sıfırlama bağlantısı göndereceğiz
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#374151', // Koyu gri
              fontWeight: 500,
              fontSize: '14px'
            }}>
              E-posta Adresi
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                background: lightColors.surfaceBackground,
                border: `1px solid ${lightColors.border}`,
                color: lightColors.text,
                fontSize: '14px',
                fontWeight: 500,
                boxSizing: 'border-box'
              }}
              placeholder="E-posta adresinizi girin"
            />
          </div>

          {error && (
            <div style={{
              margin: '16px 0',
              padding: '12px 16px',
              borderRadius: '8px',
              background: lightColors.danger + '20',
              color: lightColors.danger,
              textAlign: 'center',
              fontSize: '14px',
              border: `1px solid ${lightColors.danger}40`
            }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{
              margin: '16px 0',
              padding: '12px 16px',
              borderRadius: '8px',
              background: lightColors.success + '20',
              color: lightColors.success,
              textAlign: 'center',
              fontSize: '14px',
              border: `1px solid ${lightColors.success}40`
            }}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 24px',
              marginTop: '16px',
              fontWeight: 700,
              letterSpacing: '1px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px 0 rgba(167, 139, 250, 0.2)',
              background: loading ? lightColors.textMuted : `linear-gradient(90deg, ${lightColors.primary} 0%, ${lightColors.accent} 100%)`,
              color: '#ffffff',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısı Gönder'}
          </button>

          <Link
            to="/login"
            style={{
              display: 'block',
              width: '100%',
              padding: '12px 24px',
              marginTop: '8px',
              borderRadius: '12px',
              fontWeight: 500,
              color: lightColors.primary,
              background: lightColors.surfaceBackground,
              textDecoration: 'none',
              textAlign: 'center',
              fontSize: '14px',
              border: `1px solid ${lightColors.border}`,
              boxSizing: 'border-box'
            }}
          >
            Giriş Sayfasına Dön
          </Link>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
