import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext';
import './TopNav.css';
import { settingsService } from '../../services/settingsService';
import { userService } from '../../services/userService';
import { personnelService } from '../../services/personnelService';

const TopNav = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const { colors, isDarkMode } = useTheme();
    const [restaurantName, setRestaurantName] = useState('Restoran Yönetim Sistemi');
    const [profileImage, setProfileImage] = useState('/default-avatar.png');
    const [displayName, setDisplayName] = useState('');
    const [displayRole, setDisplayRole] = useState('');

    // Kullanıcı profilini yükle (önce AuthContext, sonra backend id ile, yoksa email ile arama)
    useEffect(() => {
        const initFromAuth = () => {
            // İsim ve rolü anında göster (backend gelene kadar)
            const nameFromAuth = user?.name || (user?.email ? user.email.split('@')[0] : '') || 'Kullanıcı';
            const roleFromAuth = (() => {
                if (!user?.role) return '';
                const r = String(user.role).toLowerCase();
                if (r === 'admin') return 'Admin';
                if (r === 'garson' || r === 'waiter') return 'Garson';
                if (r === 'kasiyer' || r === 'cashier') return 'Kasiyer';
                return user.role;
            })();
            setDisplayName(nameFromAuth);
            setDisplayRole(roleFromAuth);
            if (user?.profileImage) setProfileImage(user.profileImage);
        };

        const resolveFromApi = async () => {
            try {
                const id = user?.userId;
                let data = null;

                // Sadece sayısal id ile /users/{id} dene
                const isNumericId = id !== undefined && id !== null && String(id).match(/^\d+$/);
                if (isNumericId) {
                    try {
                        data = await userService.getUserById(id);
                    } catch (e) {
                        console.warn('[TopNav Profile] Fetch by id failed:', e?.message);
                    }
                }

                // ID yoksa veya bulunamazsa email ile aktif/pasif listelerde ara
                if (!data && user?.email) {
                    try {
    
                        const [actives, inactives] = await Promise.all([
                            personnelService.getActiveUsers(),
                            personnelService.getInactiveUsers(),
                        ]);
                        const all = [...(actives || []), ...(inactives || [])];
                        data = all.find(u => String(u.email || '').toLowerCase() === String(user.email).toLowerCase()) || null;
                    } catch { }
                }

                // Hâlâ yoksa /users (tüm kullanıcılar) üzerinden dene
                if (!data && user?.email) {
                    try {

                        const all = await personnelService.getAllUsers();
                        data = (all || []).find(u => String(u.email || '').toLowerCase() === String(user.email).toLowerCase()) || null;
                    } catch (e) {
                        console.warn('[TopNav Profile] Fallback all users failed:', e?.message);
                    }
                }

                if (!data) return; // Bulunamadıysa AuthContext fallback ile kal

                // İsim
                const name = data.name || user?.name || displayName || 'Kullanıcı';
                setDisplayName(name);
                localStorage.setItem('displayName', name);

                // Rol
                const roleLabel = (() => {
                    const roles = Array.isArray(data.roles) ? data.roles : [];
                    const first = roles[0];
                    if (first === 0 || user?.role === 'admin') return 'Admin';
                    if (first === 1 || user?.role === 'garson' || user?.role === 'waiter') return 'Garson';
                    if (first === 2 || user?.role === 'kasiyer' || user?.role === 'cashier') return 'Kasiyer';
                    return displayRole || user?.role || 'Kullanıcı';
                })();
                setDisplayRole(roleLabel);
                localStorage.setItem('displayRole', roleLabel);

                // Fotoğraf
                if (data.photoBase64) {
                    const img = `data:image/jpeg;base64,${data.photoBase64}`;
                    setProfileImage(img);
                    localStorage.setItem('profileImage', img);
                } else if (data.hasPhoto && data.id) {
                    const imgUrl = `/api/users/${data.id}/photo`;
                    setProfileImage(imgUrl);
                    localStorage.setItem('profileImage', imgUrl);
                } else {
                    console.log('[TopNav Profile] No photo found on profile payload');
                }
            } catch (err) {
                console.warn('TopNav profil bilgisi alınamadı:', err.message);
            }
        };

        // Kullanıcı değiştiğinde ilk olarak default değerlere dön
        setProfileImage('/default-avatar.png');
        setDisplayName('');
        setDisplayRole('');

        initFromAuth();
        resolveFromApi();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                                onError={(e) => {
                                    e.target.src = '/default-avatar.png';
                                }}
                            />
                            <span className="user-name" style={{ color: colors.text }}>{displayName || 'Kullanıcı'}</span>
                            <span className="user-role" style={{ color: colors.textSecondary }}>({displayRole || 'Rol Belirtilmemiş'})</span>
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
