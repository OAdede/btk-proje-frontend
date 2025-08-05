import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext';
import './TopNav.css';

const TopNav = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const { isDarkMode, colors } = useTheme();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Tema renklerine göre buton stilleri
    const buttonStyles = isDarkMode ? {
        background: '#513653', // Koyu mor arka plan
        textColor: '#F08080', // Kırmızı-pembe yazı
        borderColor: '#F08080', // Kırmızı-pembe kenarlık
        hoverBackground: '#473653'
    } : {
        background: '#A294F9', // Açık temada mor arka plan
        textColor: '#2D1B69', // Koyu mor yazı
        borderColor: '#2D1B69', // Koyu mor kenarlık
        hoverBackground: '#CDC1FF'
    };

    return (
        <div className="top-nav" style={{ background: colors.sidebar }}>
            <div className="top-nav-left">
                <h2 className="top-nav-title">Restoran Yönetim Sistemi</h2>
            </div>

            {/* Rol değiştirme paneli tamamen kaldırıldı */}

            <div className="top-nav-right">
                {user ? (
                    <>
                        <div className="user-info">
                            <span className="user-name">{user?.email}</span>
                            <span className="user-role">({user?.role})</span>
                        </div>
                        <button 
                            className="logout-btn" 
                            onClick={handleLogout}
                            style={{
                                background: buttonStyles.background,
                                color: buttonStyles.textColor,
                                border: `1px solid ${buttonStyles.borderColor}`,
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = buttonStyles.hoverBackground;
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = buttonStyles.background;
                            }}
                        >
                            Çıkış Yap
                        </button>
                    </>
                ) : (
                    <button className="login-btn" onClick={() => navigate('/login')}>
                        Giriş Yap
                    </button>
                )}
            </div>
        </div>
    );
};

export default TopNav;
