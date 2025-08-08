import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // şifreyi göster gizle burdan yapılıcak
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

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
    danger: '#EF4444'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email ve şifre zorunludur.');
      return;
    }

    try {
      const roleId = await login(email, password);

      if (roleId !== null && roleId !== undefined) {
        if (roleId === 0) {
          navigate('/admin/dashboard');
        } else if (roleId === 1) {
          navigate('/garson/home');
        } else if (roleId === 2) {
          navigate('/kasiyer/home');
        } else {
          // Varsayılan bir rota veya hata yönetimi
          navigate('/');
        }
      }
    } catch (err) {
      setError(err.message || 'Giriş sırasında bir hata oluştu.');
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
            boxShadow: '0 4px 16px 0 rgba(167, 139, 250, 0.3)',
            overflow: 'hidden'
          }}>
            <img
              src="/logo-dark.png"
              alt="Restoran Yönetim Sistemi Logo"
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%'
              }}
            />
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 800,
            color: lightColors.primary,
            textAlign: 'center',
            margin: '0 0 8px 0',
            letterSpacing: '2px'
          }}>
            Giriş Yap
          </h1>
          <p style={{
            fontSize: '14px',
            color: lightColors.textSecondary,
            textAlign: 'center',
            margin: '0 0 16px 0',
            fontWeight: 400
          }}>
            ŞeftaliPos Sistemine Hoş Geldiniz
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
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
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
              placeholder="Email adresinizi girin"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#374151', // Koyu gri
              fontWeight: 500,
              fontSize: '14px'
            }}>
              Şifre
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{
                  width: '100%',
                  padding: '12px 45px 12px 16px',
                  borderRadius: '12px',
                  background: lightColors.surfaceBackground,
                  border: `1px solid ${lightColors.border}`,
                  color: lightColors.text,
                  fontSize: '14px',
                  fontWeight: 500,
                  boxSizing: 'border-box'
                }}
                placeholder="Şifrenizi girin"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: lightColors.textSecondary,
                  fontSize: '18px',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? (
                  // Gizle ikonu (göz kapalı)
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  // Göster ikonu (göz açık)
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
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

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px 24px',
              marginTop: '16px',
              fontWeight: 700,
              letterSpacing: '1px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px 0 rgba(167, 139, 250, 0.2)',
              background: `linear-gradient(90deg, ${lightColors.primary} 0%, ${lightColors.accent} 100%)`,
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Giriş Yap
          </button>

          <Link
            to="/forgot-password"
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
            Şifremi Unuttum
          </Link>
        </form>
      </div>
    </div>
  );
}

export default Login;
