import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { requestPasswordReset } = useContext(AuthContext);
  const { colors } = useTheme();

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
      const successMessage = await requestPasswordReset(email);
      setMessage(successMessage);
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
      background: `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.background} 100%)`,
      fontFamily: 'Inter, Segoe UI, Arial, sans-serif'
    }}>
      <div style={{
        padding: '40px',
        minWidth: 350,
        maxWidth: 420,
        borderRadius: '20px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.13)',
        background: colors.cardBackground,
        backdropFilter: 'blur(2px)',
        border: `1px solid ${colors.border}`
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
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: '0 4px 16px 0 rgba(167, 139, 250, 0.3)'
          }}>
            <span style={{
              color: colors.text,
              fontWeight: 800,
              fontSize: '24px',
              letterSpacing: '2px'
            }}>🔒</span>
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 800,
            color: colors.primary,
            textAlign: 'center',
            margin: '0 0 8px 0',
            letterSpacing: '2px'
          }}>
            Şifremi Unuttum
          </h1>
          <p style={{
            fontSize: '14px',
            color: colors.textSecondary,
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
              color: colors.primary,
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
                background: colors.surfaceBackground,
                border: `1px solid ${colors.border}`,
                color: colors.text,
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
              background: colors.danger + '20',
              color: colors.danger,
              textAlign: 'center',
              fontSize: '14px',
              border: `1px solid ${colors.danger}40`
            }}>
              {error}
            </div>
          )}
          
          {message && (
            <div style={{
              margin: '16px 0',
              padding: '12px 16px',
              borderRadius: '8px',
              background: colors.success + '20',
              color: colors.success,
              textAlign: 'center',
              fontSize: '14px',
              border: `1px solid ${colors.success}40`
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
              background: loading ? colors.textMuted : `linear-gradient(90deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
              color: colors.text,
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
              color: colors.primary,
              background: colors.surfaceBackground,
              textDecoration: 'none',
              textAlign: 'center',
              fontSize: '14px',
              border: `1px solid ${colors.border}`,
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
