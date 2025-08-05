import { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();
    const { resetPassword } = useContext(AuthContext);
    const { colors } = useTheme();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password || !confirmPassword) {
            return setError('Lütfen tüm alanları doldurun.');
        }
        if (password !== confirmPassword) {
            return setError('Şifreler eşleşmiyor.');
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const successMessage = await resetPassword(token, password);
            setMessage(successMessage);

            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            setError(err.message || 'Şifre sıfırlama başarısız oldu.');
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
                        }}>🔑</span>
                    </div>
                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: 800,
                        color: colors.primary,
                        textAlign: 'center',
                        margin: '0 0 8px 0',
                        letterSpacing: '2px'
                    }}>
                        Yeni Şifre Belirle
                    </h1>
                    <p style={{
                        fontSize: '14px',
                        color: colors.textSecondary,
                        textAlign: 'center',
                        margin: '0 0 16px 0',
                        fontWeight: 400
                    }}>
                        Yeni şifrenizi belirleyin
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
                            Yeni Şifre
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                            placeholder="Yeni şifrenizi girin"
                        />
                    </div>
                    
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            color: colors.primary,
                            fontWeight: 500,
                            fontSize: '14px'
                        }}>
                            Şifre Tekrar
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                            placeholder="Şifrenizi tekrar girin"
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
                        {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
