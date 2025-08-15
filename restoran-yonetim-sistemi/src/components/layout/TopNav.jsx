import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext';
import './TopNav.css';
import { settingsService } from '../../services/settingsService';

const TopNav = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const { colors, isDarkMode } = useTheme();
    const [restaurantName, setRestaurantName] = useState('Restoran Yönetim Sistemi');

    // Restoran ismini backend'den al
    useEffect(() => {
        const loadRestaurantName = async () => {
            try {
                const settings = await settingsService.getRestaurantSettings();
                if (settings.restaurantName) {
                    setRestaurantName(settings.restaurantName);
                    localStorage.setItem('restaurantName', settings.restaurantName);
                }
            } catch (error) {
                console.error('Error loading restaurant name:', error);
                // Fallback to localStorage if API fails
                const cachedName = localStorage.getItem('restaurantName');
                if (cachedName) setRestaurantName(cachedName);
            }
        };

        loadRestaurantName();
    }, []);

    // localStorage değişikliklerini ve custom event'leri dinle
    useEffect(() => {
        const handleStorageChange = () => {
            const name = localStorage.getItem('restaurantName') || 'Restoran Yönetim Sistemi';
            setRestaurantName(name);
        };

        const handleRestaurantNameChange = (event) => {
            setRestaurantName(event.detail.name);
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('restaurantNameChanged', handleRestaurantNameChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('restaurantNameChanged', handleRestaurantNameChange);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="top-nav" style={{ background: colors.cardBackground, borderBottom: `1px solid ${colors.border}` }}>
            <div className="top-nav-center">
                <img
                    src={isDarkMode ? "/logo-dark.png" : "/logo-light.png"}
                    alt="Logo"
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        marginRight: '15px'
                    }}
                />
                <h2 className="top-nav-title" style={{ color: colors.text }}>{restaurantName}</h2>
            </div>

            <div className="top-nav-right">
                {user ? (
                    <>
                        <div className="user-info">
                            {(() => {
                                const storedName = localStorage.getItem('displayName');
                                const storedRole = localStorage.getItem('displayRole');
                                const storedProfileImage = localStorage.getItem('profileImage');
                                const resolvedName = user?.email || user?.name || storedName || '';
                                const resolveRoleLabel = (r) => {
                                    const val = String(r || '').toLowerCase();
                                    if (val === 'admin') return 'Admin';
                                    if (val === 'garson' || val === 'waiter') return 'Garson';
                                    if (val === 'kasiyer' || val === 'cashier') return 'Kasiyer';
                                    return r || '';
                                };
                                const resolvedRole = resolveRoleLabel(user?.role) || storedRole || '';
                                const profileImage = user?.profileImage || storedProfileImage || '/default-avatar.png';
                                return (
                                    <>
                                        <img
                                            src={profileImage}
                                            alt="Profil"
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: `2px solid ${colors.border}`,
                                                marginRight: '12px'
                                            }}
                                        />
                                        <span className="user-name" style={{ color: colors.text }}>{resolvedName}</span>
                                        <span className="user-role" style={{ color: colors.textSecondary }}>({resolvedRole})</span>
                                    </>
                                );
                            })()}
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
