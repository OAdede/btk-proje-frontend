import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext';
import './TopNav.css';

const TopNav = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const { colors } = useTheme();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="top-nav" style={{ background: colors.cardBackground, borderBottom: `1px solid ${colors.border}` }}>
            <div className="top-nav-left">
                <h2 className="top-nav-title" style={{ color: colors.text }}>Restoran Yönetim Sistemi</h2>
            </div>

            <div className="top-nav-right">
                {user ? (
                    <>
                        <div className="user-info">
                            <span className="user-name" style={{ color: colors.text }}>{user?.email}</span>
                            <span className="user-role" style={{ color: colors.textSecondary }}>({user?.role})</span>
                        </div>
                        <button className="logout-btn" onClick={handleLogout} style={{ background: colors.danger, color: 'white' }}>
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
