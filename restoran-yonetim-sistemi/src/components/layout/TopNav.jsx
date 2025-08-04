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
                        <button className="logout-btn" onClick={handleLogout}>
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
