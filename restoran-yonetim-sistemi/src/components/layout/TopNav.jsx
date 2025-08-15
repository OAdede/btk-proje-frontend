import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext';
import './TopNav.css';
import { settingsService } from '../../services/settingsService';
import { personnelService } from '../../services/personnelService';

const TopNav = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const { colors, isDarkMode } = useTheme();
    const [restaurantName, setRestaurantName] = useState('Restoran Yönetim Sistemi');
    const [profileImage, setProfileImage] = useState(localStorage.getItem('profileImage') || '/default-avatar.png');

    // Profil bilgilerini backend'den yükle
    useEffect(() => {
        const loadProfileFromBackend = async () => {
            if (!user?.email) {
                console.log('[TopNavProfile] No user email found');
                return;
            }

            try {
                console.log('[TopNavProfile] Loading profile for:', user.email);
                console.log('[TopNavProfile] Current user object:', user);
                
                // Önce aktif kullanıcılar arasında ara
                let data = null;
                try {
                    console.log('[TopNavProfile] Fetching active users...');
                    const actives = await personnelService.getActiveUsers();
                    console.log('[TopNavProfile] Active users response:', actives);
                    data = (actives || []).find(u => String(u.email || '').toLowerCase() === String(user.email).toLowerCase()) || null;
                    console.log('[TopNavProfile] Found in actives:', data);
                } catch (e) {
                    console.warn('[TopNavProfile] Active users fetch failed:', e?.message);
                }

                // Hâlâ yoksa /users (tüm kullanıcılar) üzerinden dene
                if (!data && user?.email) {
                    try {
                        console.log('[TopNavProfile] Fallback: searching by email in all users');
                        const all = await personnelService.getAllUsers();
                        console.log('[TopNavProfile] All users response:', all);
                        data = (all || []).find(u => String(u.email || '').toLowerCase() === String(user.email).toLowerCase()) || null;
                        console.log('[TopNavProfile] Found in all users:', data);
                    } catch (e) {
                        console.warn('[TopNavProfile] Fallback all users failed:', e?.message);
                    }
                }

                if (!data) {
                    console.log('[TopNavProfile] No user data found in backend, using localStorage fallback');
                    return; // Bulunamadıysa localStorage fallback ile kal
                }

                console.log('[TopNavProfile] User data from backend:', data);

                // Fotoğraf
                if (data.photoBase64) {
                    console.log('[TopNavProfile] Found photoBase64, length:', data.photoBase64.length);
                    const img = `data:image/jpeg;base64,${data.photoBase64}`;
                    setProfileImage(img);
                    localStorage.setItem('profileImage', img);
                    console.log('[TopNavProfile] Photo loaded from base64');
                } else if (data.hasPhoto && data.id) {
                    console.log('[TopNavProfile] Found hasPhoto=true, user ID:', data.id);
                    const imgUrl = `/api/users/${data.id}/photo`;
                    setProfileImage(imgUrl);
                    localStorage.setItem('profileImage', imgUrl);
                    console.log('[TopNavProfile] Photo loaded from API endpoint:', imgUrl);
                } else {
                    console.log('[TopNavProfile] No photo found on profile payload. Available fields:', Object.keys(data));
                    console.log('[TopNavProfile] photoBase64:', data.photoBase64);
                    console.log('[TopNavProfile] hasPhoto:', data.hasPhoto);
                    console.log('[TopNavProfile] id:', data.id);
                }
            } catch (err) {
                console.warn('TopNav profil bilgisi alınamadı:', err.message);
                console.error('Full error:', err);
            }
        };

        // Kullanıcı değiştiğinde ilk olarak default değerlere dön
        console.log('[TopNavProfile] User changed, resetting to defaults');
        setProfileImage('/default-avatar.png');

        // AuthContext'ten gelen bilgileri kullan
        if (user?.profileImage) {
            console.log('[TopNavProfile] Using profileImage from AuthContext:', user.profileImage);
            setProfileImage(user.profileImage);
        }

        // Backend'den profil bilgilerini yükle
        loadProfileFromBackend();
    }, [user]);

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
                                const resolvedName = user?.email || user?.name || storedName || '';
                                const resolveRoleLabel = (r) => {
                                    const val = String(r || '').toLowerCase();
                                    if (val === 'admin') return 'Admin';
                                    if (val === 'garson' || val === 'waiter') return 'Garson';
                                    if (val === 'kasiyer' || val === 'cashier') return 'Kasiyer';
                                    return r || '';
                                };
                                const resolvedRole = resolveRoleLabel(user?.role) || storedRole || '';
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
