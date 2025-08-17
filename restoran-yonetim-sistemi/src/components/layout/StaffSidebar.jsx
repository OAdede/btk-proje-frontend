import React, { useContext, useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom"; // useLocation eklendi
import { createPortal } from "react-dom";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { TableContext } from "../../context/TableContext";
import "./StaffLayout.css";
import { authService } from "../../services/authService";
import { userService } from "../../services/userService";
import { personnelService } from "../../services/personnelService";

const StaffSidebar = () => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation(); // location hook'u eklendi
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { isDarkMode, toggleTheme, colors } = useTheme();
    const tableContext = useContext(TableContext);
    const reservations = tableContext?.reservations || {};
    const removeReservation = tableContext?.removeReservation || (() => { });
    const [showSettings, setShowSettings] = useState(false);
    const [showProfileSettings, setShowProfileSettings] = useState(false);
    const [profileImage, setProfileImage] = useState('/default-avatar.png');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [displayRole, setDisplayRole] = useState('');
    
    // Kullanıcı profilini yükle (önce AuthContext, sonra backend id ile, yoksa email ile arama)
    useEffect(() => {
        const initFromAuth = () => {
            console.log('[Profile] AuthContext.user:', user);
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
            if (user?.email) setEmail(user.email);
            if (user?.phone) setPhoneNumber(user.phone);
            if (user?.profileImage) setProfileImage(user.profileImage);
        };

        const resolveFromApi = async () => {
            try {
                const id = user?.userId;
                let data = null;

                // Sadece sayısal id ile /users/{id} dene
                const isNumericId = id !== undefined && id !== null && String(id).match(/^\d+$/);
                if (isNumericId) {
                    console.log('[Profile] Fetching by numeric id:', id);
                    try {
                        data = await userService.getUserById(id);
                    } catch (e) {
                        console.warn('[Profile] Fetch by id failed:', e?.message);
                    }
                }

                // ID yoksa veya bulunamazsa email ile aktif/pasif listelerde ara
                if (!data && user?.email) {
                    try {
                        console.log('[Profile] Searching by email in active/inactive lists:', user.email);
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
                        console.log('[Profile] Fallback: searching by email in all users');
                        const all = await personnelService.getAllUsers();
                        data = (all || []).find(u => String(u.email || '').toLowerCase() === String(user.email).toLowerCase()) || null;
                    } catch (e) {
                        console.warn('[Profile] Fallback all users failed:', e?.message);
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
                    console.log('[Profile] No photo found on profile payload');
                }

                // İletişim
                if (data.phoneNumber) {
                    setPhoneNumber(data.phoneNumber);
                    localStorage.setItem('phoneNumber', data.phoneNumber);
                }
                if (data.email) {
                    setEmail(data.email);
                    localStorage.setItem('email', data.email);
                }
            } catch (err) {
                console.warn('Profil bilgisi alınamadı:', err.message);
            }
        };

        // Kullanıcı değiştiğinde ilk olarak default değerlere dön
        setProfileImage('/default-avatar.png');
        setDisplayName('');
        setDisplayRole('');
        setEmail('');
        setPhoneNumber('');

        initFromAuth();
        resolveFromApi();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const [showPhoneVerification, setShowPhoneVerification] = useState(false);
    const [showEmailVerification, setShowEmailVerification] = useState(false);
    const [phoneVerificationCode, setPhoneVerificationCode] = useState('');
    const [emailVerificationCode, setEmailVerificationCode] = useState('');
    const [tempPhone, setTempPhone] = useState('');
    const [tempEmail, setTempEmail] = useState('');
    const [tempProfileImage, setTempProfileImage] = useState(null);
    const [showProfileImageConfirm, setShowProfileImageConfirm] = useState(false);
    
    // Change Password Modal States
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [tempImage, setTempImage] = useState(null);

    const getFloorLetter = (floorIndex) => {
        if (floorIndex === 0) return 'Z';
        return String.fromCharCode(64 + floorIndex);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    // Fotoğraf modalını açma
    const openPhotoModal = () => {
        setShowPhotoModal(true);
        setTempImage(null);
    };

    // Fotoğraf modalını kapatma
    const closePhotoModal = () => {
        setShowPhotoModal(false);
        setTempImage(null);
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
    };

    // Kamera açma
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setCameraStream(stream);
        } catch (error) {
            // alert yerine özel bir modal veya mesaj kutusu kullanılmalı
            alert('Kamera erişimi sağlanamadı: ' + error.message);
        }
    };

    // Kamera kapatma
    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
    };

    // Fotoğraf çekme
    const capturePhoto = () => {
        if (cameraStream) {
            const video = document.getElementById('camera-video');
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            const imageData = canvas.toDataURL('image/jpeg');
            setTempImage(imageData);
            stopCamera();
        }
    };

    // Dosyadan fotoğraf seçme
    const handlePhotoUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = e.target.result;
                setTempImage(imageData);
            };
            reader.readAsDataURL(file);
        }
    };

    // Fotoğrafı kabul etme
    const acceptPhoto = () => {
        if (tempImage) {
            setTempProfileImage(tempImage);
            setShowProfileImageConfirm(true);
        }
        closePhotoModal();
    };

    // Fotoğrafı reddetme
    const rejectPhoto = () => {
        setTempImage(null);
    };

    // Profil fotoğrafını onaylama
    const confirmProfileImage = async () => {
        if (!tempProfileImage) return;
        const isNumeric = (val) => val !== undefined && val !== null && /^\d+$/.test(String(val));

        const findUserIdByEmail = async (email) => {
            if (!email) return null;
            try {
                const [actives, inactives] = await Promise.all([
                    personnelService.getActiveUsers(),
                    personnelService.getInactiveUsers(),
                ]);
                const all = [...(actives || []), ...(inactives || [])];
                const found = all.find(u => String(u.email || '').toLowerCase() === String(email).toLowerCase());
                if (found?.id !== undefined) return found.id;
            } catch { }
            try {
                const all = await personnelService.getAllUsers();
                const found = (all || []).find(u => String(u.email || '').toLowerCase() === String(email).toLowerCase());
                if (found?.id !== undefined) return found.id;
            } catch { }
            return null;
        };

        try {
            let targetId = user?.userId;
            if (!isNumeric(targetId)) {
                targetId = await findUserIdByEmail(user?.email);
            }
            if (!isNumeric(targetId)) throw new Error('Kullanıcı ID bulunamadı');
            // Backend'e yükle
            await userService.uploadUserPhoto(targetId, tempProfileImage);
            // Başarılı ise UI güncelle
            setProfileImage(tempProfileImage);
            localStorage.setItem('profileImage', tempProfileImage);
            setTempProfileImage(null);
            setShowProfileImageConfirm(false);
            alert('Profil fotoğrafı başarıyla güncellendi!');
        } catch (e) {
            alert(e.message || 'Profil fotoğrafı güncellenemedi');
        }
    };

    // Profil fotoğrafını iptal etme
    const cancelProfileImage = () => {
        setTempProfileImage(null);
        setShowProfileImageConfirm(false);
    };

    // Telefon numarası değiştirme
    const handlePhoneChange = () => {
        if (!tempPhone || tempPhone.length !== 11 || !tempPhone.startsWith('0')) {
            alert('Lütfen telefon numarasını 0 ile başlayacak ve 11 hane olacak şekilde giriniz.');
            return;
        }
        if (tempPhone && tempPhone.length === 11 && tempPhone.startsWith('0')) {
            setShowPhoneVerification(true);
            // SMS doğrulama kodu gönder (simülasyon)
            const code = Math.floor(100000 + Math.random() * 900000);
            alert(`SMS doğrulama kodu: ${code}`);
        }
    };

    // Telefon doğrulama
    const verifyPhone = async () => {
        const expectedCode = '123456';
        if (phoneVerificationCode === expectedCode) {
            try {
                const isNumeric = (val) => val !== undefined && val !== null && /^\d+$/.test(String(val));
                const findUserIdByEmail = async (email) => {
                    if (!email) return null;
                    try {
                        const [actives, inactives] = await Promise.all([
                            personnelService.getActiveUsers(),
                            personnelService.getInactiveUsers(),
                        ]);
                        const all = [...(actives || []), ...(inactives || [])];
                        const found = all.find(u => String(u.email || '').toLowerCase() === String(user.email).toLowerCase());
                        if (found?.id !== undefined) return found.id;
                    } catch { }
                    try {
                        const all = await personnelService.getAllUsers();
                        const found = (all || []).find(u => String(u.email || '').toLowerCase() === String(user.email).toLowerCase());
                        if (found?.id !== undefined) return found.id;
                    } catch { }
                    return null;
                };

                let targetId = user?.userId;
                if (!isNumeric(targetId)) {
                    targetId = await findUserIdByEmail(user?.email);
                }
                if (!isNumeric(targetId)) throw new Error('Kullanıcı ID bulunamadı');

                await userService.updateUserPhone(targetId, tempPhone);

                setPhoneNumber(tempPhone);
                localStorage.setItem('phoneNumber', tempPhone);
                setShowPhoneVerification(false);
                setTempPhone('');
                setPhoneVerificationCode('');
                alert('Telefon numarası başarıyla güncellendi!');
            } catch (e) {
                alert(e.message || 'Telefon numarası güncellenemedi');
            }
        } else {
            alert(`Yanlış doğrulama kodu! Doğru kod: ${expectedCode}`);
        }
    };

    // E-posta değiştirme
    const handleEmailChange = () => {
        if (tempEmail && tempEmail.includes('@')) {
            setShowEmailVerification(true);
            // E-posta doğrulama kodu gönder (simülasyon)
            const code = Math.floor(100000 + Math.random() * 900000);
            // alert yerine özel bir modal veya mesaj kutusu kullanılmalı
            alert(`E-posta doğrulama kodu: ${code}`);
        } else if (!tempEmail) {
            alert('Lütfen e-posta adresi girin');
        } else {
            alert('Geçerli bir e-posta adresi girin');
        }
    };

    // E-posta doğrulama
    const verifyEmail = async () => {
        const expectedCode = '123456';
        if (emailVerificationCode === expectedCode) {
            try {
                const isNumeric = (val) => val !== undefined && val !== null && /^\d+$/.test(String(val));
                const findUserIdByEmail = async (email) => {
                    if (!email) return null;
                    try {
                        const [actives, inactives] = await Promise.all([
                            personnelService.getActiveUsers(),
                            personnelService.getInactiveUsers(),
                        ]);
                        const all = [...(actives || []), ...(inactives || [])];
                        const found = all.find(u => String(u.email || '').toLowerCase() === String(user.email).toLowerCase());
                        if (found?.id !== undefined) return found.id;
                    } catch { }
                    try {
                        const all = await personnelService.getAllUsers();
                        const found = (all || []).find(u => String(u.email || '').toLowerCase() === String(user.email).toLowerCase());
                        if (found?.id !== undefined) return found.id;
                    } catch { }
                    return null;
                };

                let targetId = user?.userId;
                if (!isNumeric(targetId)) {
                    targetId = await findUserIdByEmail(user?.email);
                }
                if (!isNumeric(targetId)) throw new Error('Kullanıcı ID bulunamadı');

                await userService.updateUserEmail(targetId, tempEmail);

                setEmail(tempEmail);
                localStorage.setItem('email', tempEmail);
                setShowEmailVerification(false);
                setTempEmail('');
                setEmailVerificationCode('');
                alert('E-posta adresi başarıyla güncellendi!');
            } catch (e) {
                alert(e.message || 'E-posta adresi güncellenemedi');
            }
        } else {
            alert(`Yanlış doğrulama kodu! Doğru kod: ${expectedCode}`);
        }
    };

    const homePath = `/${user?.role}/home`;

    // Stok durumunu görmeye yetkili roller
    const canViewStock = user?.role === 'garson' || user?.role === 'kasiyer';
    // Rezervasyonları görmeye yetkili roller
    const canViewReservations = user?.role === 'garson' || user?.role === 'kasiyer';

    // Change Password Functions
    const openChangePasswordModal = () => {
        setShowChangePassword(true);
        setPasswordError('');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const closeChangePasswordModal = () => {
        setShowChangePassword(false);
        setPasswordError('');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const handleChangePassword = async () => {
        setPasswordError('');

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError('Tüm alanları doldurunuz');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('Yeni şifreler eşleşmiyor');
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError('Yeni şifre en az 6 karakter olmalıdır');
            return;
        }

        if (currentPassword === newPassword) {
            setPasswordError('Yeni şifre mevcut şifreden farklı olmalıdır');
            return;
        }

        setPasswordLoading(true);

        try {
            await authService.changePassword(currentPassword, newPassword);
            alert('Şifreniz başarıyla değiştirildi!');
            closeChangePasswordModal();
        } catch (error) {
            console.error('Change password error:', error);
            setPasswordError(error.message || 'Şifre değiştirme başarısız oldu');
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <>
            {/* Mobil toggle butonu */}
            <button
                className="mobile-sidebar-toggle"
                onClick={toggleSidebar}
                style={{
                    position: 'fixed',
                    top: '90px',
                    left: '20px',
                    zIndex: 1001,
                    background: '#10B981',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    cursor: 'pointer',
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
            >
                <span style={{ fontSize: '1.5rem', color: 'white' }}>
                    {isSidebarOpen ? '✕' : '☰'}
                </span>
            </button>

            {/* Overlay */}
            {isSidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={closeSidebar}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 999,
                        display: 'none'
                    }}
                />
            )}

            <div className={`staff-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="staff-sidebar-header">
                    <h2>Personel Paneli</h2>
                </div>

                {/* YENİ EKLENEN KISIM: Profil bilgileri */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '20px',
                        backgroundColor: colors.card,
                        borderRadius: '15px',
                        margin: '10px 15px',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                        border: `1px solid ${colors.border}`
                    }}
                >
                    <img
                        src={profileImage}
                        alt="Profil"
                        style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: `3px solid ${colors.primary}`,
                            marginBottom: '10px'
                        }}
                        onError={(e) => {
                            e.target.src = '/default-avatar.png';
                        }}
                    />
                    <div
                        style={{
                            fontSize: '1.2rem',
                            fontWeight: '700',
                            color: colors.text,
                            textAlign: 'center'
                        }}
                    >
                        {displayName || 'Kullanıcı'}
                    </div>
                    <div
                        style={{
                            fontSize: '0.9rem',
                            color: colors.textSecondary,
                            textAlign: 'center',
                            fontWeight: '500',
                            marginTop: '5px'
                        }}
                    >
                        {displayRole || 'Rol Belirtilmemiş'}
                    </div>
                </div>

                <nav className="staff-sidebar-nav">
                    <NavLink
                        to={homePath}
                        className={({ isActive }) => isActive ? "staff-nav-item active" : "staff-nav-item"}
                    >
                        Masalar
                    </NavLink>

                    {user?.role === 'garson' && (
                        <NavLink
                            to={`/${user?.role}/orders`}
                            className={({ isActive }) => isActive ? "staff-nav-item active" : "staff-nav-item"}
                        >
                            Siparişlerim
                        </NavLink>
                    )}
                    {user?.role === "kasiyer" && (
                        <div
                            onClick={() => navigate('/kasiyer/fast-order')}
                            className={location.pathname === '/kasiyer/fast-order' ? "staff-nav-item active" : "staff-nav-item"}
                        >
                            🧾 Hızlı Sipariş
                        </div>
                    )}
                    {/* YENİ EKLENDİ: Rezervasyonları görüntüleme menüsü */}
                    {canViewReservations && (
                        <NavLink
                            to={`/${user?.role}/reservations`}
                            className={({ isActive }) => isActive ? "staff-nav-item active" : "staff-nav-item"}
                        >
                            📅 Rezervasyonlar
                        </NavLink>
                    )}

                    {/* GÜNCELLENDİ: Stok durumu menüsü artık kasiyer ve garsonlar için görünür */}
                    {canViewStock && (
                        <NavLink
                            to={`/${user?.role}/stock`}
                            className={({ isActive }) => isActive ? "staff-nav-item active" : "staff-nav-item"}
                        >
                            Stok Durumu
                        </NavLink>
                    )}
                </nav>

                {/* Bu bölüm kullanıcı isteği üzerine kaldırıldı. */}

                <div className="staff-sidebar-bottom">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="staff-settings-btn"
                        style={{
                            background: isDarkMode ? '#513653' : 'linear-gradient(90deg,rgb(83, 34, 112) 0%,rgb(54, 16, 98) 100%)',
                            color: isDarkMode ? '#eee' : '#fff',
                            border: 'none',
                            padding: '12px 20px',
                            borderRadius: '10px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            marginBottom: '10px',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <span>⚙️</span>
                        Ayarlar
                    </button>

                    {showSettings && createPortal(
                        <div
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0, 0, 0, 0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 999999
                            }}
                            onClick={() => setShowSettings(false)}
                        >
                            <div
                                style={{
                                    background: isDarkMode ? '#2a2a2a' : '#ffffff',
                                    borderRadius: '15px',
                                    padding: '30px',
                                    minWidth: '400px',
                                    maxWidth: '500px',
                                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                                    border: `1px solid ${colors.border}`,
                                    position: 'relative'
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => setShowSettings(false)}
                                    style={{
                                        position: 'absolute',
                                        top: '15px',
                                        right: '20px',
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '24px',
                                        color: colors.danger,
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        width: '30px',
                                        height: '30px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '50%',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(224, 25, 15, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'none';
                                    }}
                                >
                                    ✕
                                </button>

                                <div style={{
                                    fontSize: '1.2rem',
                                    fontWeight: '700',
                                    color: isDarkMode ? '#ffffff' : '#333333',
                                    marginBottom: '20px',
                                    textAlign: 'center'
                                }}>
                                    ⚙️ Ayarlar
                                </div>

                                <div style={{
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    color: isDarkMode ? '#ffffff' : '#333333',
                                    marginBottom: '15px'
                                }}>
                                    Tema Seçimi
                                </div>

                                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                                    <button
                                        onClick={() => toggleTheme()}
                                        style={{
                                            background: isDarkMode ? colors.success : colors.button,
                                            color: colors.text,
                                            border: 'none',
                                            padding: '12px 20px',
                                            borderRadius: '10px',
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    >
                                        {isDarkMode ? '🌙' : '☀️'}
                                        {isDarkMode ? 'Gece Modu' : 'Gündüz Modu'}
                                    </button>
                                </div>

                                {/* Profil Ayarları Butonu */}
                                <div style={{ marginBottom: '20px' }}>
                                    <button
                                        onClick={() => {
                                            setShowProfileSettings(true);
                                            setShowSettings(false);
                                            // Mevcut değerleri temp değişkenlerine kopyala
                                            setTempPhone('');
                                            setTempEmail('');
                                            // Doğrulama modlarını sıfırla
                                            setShowPhoneVerification(false);
                                            setShowEmailVerification(false);
                                            setPhoneVerificationCode('');
                                            setEmailVerificationCode('');
                                        }}
                                        style={{
                                            background: 'linear-gradient(90deg, #ff6b6b 0%, #ee5a24 100%)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '12px 20px',
                                            borderRadius: '10px',
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    >
                                        👤 Profil Ayarları
                                    </button>
                                </div>

                                <div style={{
                                    fontSize: '0.9rem',
                                    color: isDarkMode ? '#cccccc' : '#666666',
                                    textAlign: 'center',
                                    fontStyle: 'italic'
                                }}>
                                    Tema tercihiniz kaydedildi ve otomatik olarak uygulanacak.
                                </div>
                            </div>
                        </div>,
                        document.body
                    )}

                    {/* Profil Ayarları Modal */}
                    {showProfileSettings && createPortal(
                        <div
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0, 0, 0, 0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 999999
                            }}
                            onClick={() => {
                                setShowProfileSettings(false);
                                // Temp değişkenlerini sıfırla
                                setTempPhone('');
                                setTempEmail('');
                                setTempProfileImage(null);
                                setShowPhoneVerification(false);
                                setShowEmailVerification(false);
                                setPhoneVerificationCode('');
                                setEmailVerificationCode('');
                            }}
                        >
                            <div
                                style={{
                                    background: isDarkMode ? '#2a2a2a' : '#ffffff',
                                    borderRadius: '15px',
                                    padding: '30px',
                                    minWidth: '500px',
                                    maxWidth: '600px',
                                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                                    border: `1px solid ${colors.border}`,
                                    position: 'relative',
                                    maxHeight: '80vh',
                                    overflowY: 'auto'
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <button
                                        onClick={() => {
                                            setShowProfileSettings(false);
                                            setShowSettings(true);
                                            // Temp değişkenlerini sıfırla
                                            setTempPhone('');
                                            setTempEmail('');
                                            setTempProfileImage(null);
                                            setShowPhoneVerification(false);
                                            setShowEmailVerification(false);
                                            setPhoneVerificationCode('');
                                            setEmailVerificationCode('');
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '18px',
                                            color: isDarkMode ? '#ffffff' : '#333333',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.color = '#007bff';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.color = isDarkMode ? '#ffffff' : '#333333';
                                        }}
                                    >
                                        ← Geri
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowProfileSettings(false);
                                            // Temp değişkenlerini sıfırla
                                            setTempPhone('');
                                            setTempEmail('');
                                            setTempProfileImage(null);
                                            setShowPhoneVerification(false);
                                            setShowEmailVerification(false);
                                            setPhoneVerificationCode('');
                                            setEmailVerificationCode('');
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: '15px',
                                            right: '20px',
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '24px',
                                            color: colors.danger,
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            width: '30px',
                                            height: '30px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '50%',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = 'rgba(224, 25, 15, 0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = 'none';
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: isDarkMode ? '#ffffff' : '#333333',
                                    marginBottom: '30px',
                                    textAlign: 'center'
                                }}>
                                    👤 Profil Ayarları
                                </div>

                                {/* Profil Fotoğrafı */}
                                <div style={{ marginBottom: '25px' }}>
                                    <label style={{
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        color: isDarkMode ? '#ffffff' : '#333333',
                                        marginBottom: '10px',
                                        display: 'block'
                                    }}>
                                        Profil Fotoğrafı
                                    </label>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '20px',
                                        marginBottom: '15px'
                                    }}>
                                        <img
                                            src={tempProfileImage || profileImage}
                                            alt="Profil"
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: '3px solid #ddd'
                                            }}
                                            onError={(e) => {
                                                e.target.src = '/default-avatar.png';
                                            }}
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <button
                                                onClick={openPhotoModal}
                                                style={{
                                                    background: '#513653',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '8px 16px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                📷 Fotoğraf Ekle
                                            </button>
                                            {showProfileImageConfirm && (
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <button
                                                        onClick={confirmProfileImage}
                                                        style={{
                                                            background: '#28a745',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '8px 16px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.9rem',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                    >
                                                        ✅ Onayla
                                                    </button>
                                                    <button
                                                        onClick={cancelProfileImage}
                                                        style={{
                                                            background: '#dc3545',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '8px 16px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.9rem',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                    >
                                                        ❌ İptal
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* İsim Soyisim (Değiştirilemez) */}
                                <div style={{ marginBottom: '25px' }}>
                                    <label style={{ fontSize: '1rem', fontWeight: '600', color: isDarkMode ? '#ffffff' : '#333333', marginBottom: '10px', display: 'block' }}>
                                        İsim Soyisim
                                    </label>
                                    <input
                                        type="text"
                                        value={displayName || 'Kullanıcı'}
                                        disabled
                                        style={{
                                            background: isDarkMode ? '#3a3a3a' : '#f8f9fa',
                                            color: isDarkMode ? '#888' : '#666',
                                            border: `1px solid ${isDarkMode ? '#555' : '#ddd'}`,
                                            padding: '12px',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            width: '100%',
                                            cursor: 'not-allowed'
                                        }}
                                    />
                                    <small style={{ color: '#888', fontSize: '0.8rem' }}>
                                        İsim soyisim değiştirilemez
                                    </small>
                                </div>

                                {/* Rol (Gösterilir ama değiştirilemez) */}
                                <div style={{ marginBottom: '25px' }}>
                                    <label style={{ fontSize: '1rem', fontWeight: '600', color: isDarkMode ? '#ffffff' : '#333333', marginBottom: '10px', display: 'block' }}>
                                        Rol
                                    </label>
                                    <input
                                        type="text"
                                        value={displayRole || 'Rol Belirtilmemiş'}
                                        disabled
                                        style={{
                                            background: isDarkMode ? '#3a3a3a' : '#f8f9fa',
                                            color: isDarkMode ? '#888' : '#666',
                                            border: `1px solid ${isDarkMode ? '#555' : '#ddd'}`,
                                            padding: '12px',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            width: '100%',
                                            cursor: 'not-allowed'
                                        }}
                                    />
                                </div>

                                {/* Telefon Numarası */}
                                <div style={{ marginBottom: '25px' }}>
                                    <label style={{ fontSize: '1rem', fontWeight: '600', color: isDarkMode ? '#ffffff' : '#333333', marginBottom: '10px', display: 'block' }}>
                                        Telefon Numarası
                                    </label>
                                    {showPhoneVerification ? (
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <input
                                                type="text"
                                                placeholder="Doğrulama kodunu girin"
                                                value={phoneVerificationCode}
                                                onChange={(e) => setPhoneVerificationCode(e.target.value)}
                                                style={{
                                                    background: isDarkMode ? '#3a3a3a' : '#f8f9fa',
                                                    color: isDarkMode ? '#eee' : '#333',
                                                    border: `1px solid ${isDarkMode ? '#555' : '#ddd'}`,
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    fontSize: '1rem',
                                                    flex: 1
                                                }}
                                            />
                                            <button
                                                onClick={verifyPhone}
                                                style={{
                                                    background: '#28a745',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '12px 20px',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '1rem'
                                                }}
                                            >
                                                Doğrula
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <input
                                                type="text"
                                                placeholder="Yeni telefon numaranızı girin"
                                                value={tempPhone}
                                                onChange={(e) => setTempPhone(e.target.value)}
                                                style={{
                                                    background: isDarkMode ? '#3a3a3a' : '#f8f9fa',
                                                    color: isDarkMode ? '#eee' : '#333',
                                                    border: `1px solid ${isDarkMode ? '#555' : '#ddd'}`,
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    fontSize: '1rem',
                                                    flex: 1
                                                }}
                                            />
                                            <button
                                                onClick={handlePhoneChange}
                                                style={{
                                                    background: '#007bff',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '12px 20px',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '1rem'
                                                }}
                                            >
                                                Değiştir
                                            </button>
                                        </div>
                                    )}
                                    <small style={{ color: '#888', fontSize: '0.8rem', marginTop: '5px', display: 'block' }}>
                                        Mevcut: {phoneNumber || 'Belirtilmemiş'}
                                    </small>
                                </div>

                                {/* E-posta Adresi */}
                                <div style={{ marginBottom: '25px' }}>
                                    <label style={{ fontSize: '1rem', fontWeight: '600', color: isDarkMode ? '#ffffff' : '#333333', marginBottom: '10px', display: 'block' }}>
                                        E-posta Adresi
                                    </label>
                                    {showEmailVerification ? (
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <input
                                                type="text"
                                                placeholder="Doğrulama kodunu girin"
                                                value={emailVerificationCode}
                                                onChange={(e) => setEmailVerificationCode(e.target.value)}
                                                style={{
                                                    background: isDarkMode ? '#3a3a3a' : '#f8f9fa',
                                                    color: isDarkMode ? '#eee' : '#333',
                                                    border: `1px solid ${isDarkMode ? '#555' : '#ddd'}`,
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    fontSize: '1rem',
                                                    flex: 1
                                                }}
                                            />
                                            <button
                                                onClick={verifyEmail}
                                                style={{
                                                    background: '#28a745',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '12px 20px',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '1rem'
                                                }}
                                            >
                                                Doğrula
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <input
                                                type="text"
                                                placeholder="Yeni e-posta adresinizi girin"
                                                value={tempEmail}
                                                onChange={(e) => setTempEmail(e.target.value)}
                                                style={{
                                                    background: isDarkMode ? '#3a3a3a' : '#f8f9fa',
                                                    color: isDarkMode ? '#eee' : '#333',
                                                    border: `1px solid ${isDarkMode ? '#555' : '#ddd'}`,
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    fontSize: '1rem',
                                                    flex: 1
                                                }}
                                            />
                                            <button
                                                onClick={handleEmailChange}
                                                style={{
                                                    background: '#007bff',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '12px 20px',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '1rem'
                                                }}
                                            >
                                                Değiştir
                                            </button>
                                        </div>
                                    )}
                                    <small style={{ color: '#888', fontSize: '0.8rem', marginTop: '5px', display: 'block' }}>
                                        Mevcut: {email || 'Belirtilmemiş'}
                                    </small>
                                </div>

                                {/* Şifre Değiştir */}
                                <div style={{ marginBottom: '25px' }}>
                                    <label style={{
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        color: isDarkMode ? '#ffffff' : '#333333',
                                        marginBottom: '10px',
                                        display: 'block'
                                    }}>
                                        Şifre
                                    </label>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <button
                                            onClick={openChangePasswordModal}
                                            style={{
                                                background: '#007bff',
                                                color: 'white',
                                                border: 'none',
                                                padding: '12px 20px',
                                                borderRadius: '8px',
                                                fontSize: '1rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            🔒 Şifre Değiştir
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>,
                        document.body
                    )}

                    {/* Şifre Değiştir Modal */}
                    {showChangePassword && createPortal(
                        <div
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0, 0, 0, 0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 999999
                            }}
                            onClick={closeChangePasswordModal}
                        >
                            <div
                                style={{
                                    background: isDarkMode ? '#2d2d30' : '#ffffff',
                                    borderRadius: '12px',
                                    padding: '30px',
                                    width: '90%',
                                    maxWidth: '500px',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                                    border: isDarkMode ? '1px solid #555' : 'none',
                                    position: 'relative'
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Modal Header */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '25px'
                                }}>
                                    <h3 style={{
                                        margin: 0,
                                        color: isDarkMode ? '#ffffff' : '#333333',
                                        fontSize: '1.4rem',
                                        fontWeight: '600'
                                    }}>
                                        🔒 Şifre Değiştir
                                    </h3>
                                    <button
                                        onClick={closeChangePasswordModal}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '24px',
                                            color: colors.danger,
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            width: '30px',
                                            height: '30px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '50%',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>

                                {/* Current Password */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        color: isDarkMode ? '#ffffff' : '#333333',
                                        marginBottom: '8px',
                                        display: 'block'
                                    }}>
                                        Mevcut Şifre
                                    </label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Mevcut şifrenizi girin"
                                        style={{
                                            background: isDarkMode ? '#3a3a3a' : '#ffffff',
                                            color: isDarkMode ? '#ffffff' : '#333333',
                                            border: `1px solid ${isDarkMode ? '#555' : '#ddd'}`,
                                            padding: '12px',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            width: '100%',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>

                                {/* New Password */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        color: isDarkMode ? '#ffffff' : '#333333',
                                        marginBottom: '8px',
                                        display: 'block'
                                    }}>
                                        Yeni Şifre
                                    </label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Yeni şifrenizi girin (en az 6 karakter)"
                                        style={{
                                            background: isDarkMode ? '#3a3a3a' : '#ffffff',
                                            color: isDarkMode ? '#ffffff' : '#333333',
                                            border: `1px solid ${isDarkMode ? '#555' : '#ddd'}`,
                                            padding: '12px',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            width: '100%',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>

                                {/* Confirm New Password */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        color: isDarkMode ? '#ffffff' : '#333333',
                                        marginBottom: '8px',
                                        display: 'block'
                                    }}>
                                        Yeni Şifre (Tekrar)
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Yeni şifrenizi tekrar girin"
                                        style={{
                                            background: isDarkMode ? '#3a3a3a' : '#ffffff',
                                            color: isDarkMode ? '#ffffff' : '#333333',
                                            border: `1px solid ${isDarkMode ? '#555' : '#ddd'}`,
                                            padding: '12px',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            width: '100%',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>

                                {/* Error Message */}
                                {passwordError && (
                                    <div style={{
                                        color: colors.danger,
                                        fontSize: '0.9rem',
                                        marginBottom: '15px',
                                        textAlign: 'center',
                                        fontWeight: '500'
                                    }}>
                                        {passwordError}
                                    </div>
                                )}

                                {/* Buttons */}
                                <div style={{
                                    display: 'flex',
                                    gap: '15px',
                                    justifyContent: 'flex-end'
                                }}>
                                    <button
                                        onClick={closeChangePasswordModal}
                                        disabled={passwordLoading}
                                        style={{
                                            background: isDarkMode ? '#555' : '#6c757d',
                                            color: 'white',
                                            border: 'none',
                                            padding: '12px 20px',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            cursor: passwordLoading ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        İptal
                                    </button>
                                    <button
                                        onClick={handleChangePassword}
                                        disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                                        style={{
                                            background: (passwordLoading || !currentPassword || !newPassword || !confirmPassword) ? '#6c757d' : '#007bff',
                                            color: 'white',
                                            border: 'none',
                                            padding: '12px 20px',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            cursor: (passwordLoading || !currentPassword || !newPassword || !confirmPassword) ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {passwordLoading ? 'Değiştiriliyor...' : 'Şifre Değiştir'}
                                    </button>
                                </div>
                            </div>
                        </div>,
                        document.body
                    )}

                    {/* Fotoğraf Ekleme Modal */}
                    {showPhotoModal && createPortal(
                        <div
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0, 0, 0, 0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 999999
                            }}
                            onClick={closePhotoModal}
                        >
                            <div
                                style={{
                                    background: isDarkMode ? '#2a2a2a' : '#ffffff',
                                    borderRadius: '15px',
                                    padding: '30px',
                                    minWidth: '400px',
                                    maxWidth: '500px',
                                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                                    border: `1px solid ${colors.border}`,
                                    position: 'relative'
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div style={{
                                    fontSize: '1.2rem',
                                    fontWeight: '700',
                                    color: isDarkMode ? '#ffffff' : '#333333',
                                    marginBottom: '20px',
                                    textAlign: 'center'
                                }}>
                                    📷 Profil Fotoğrafı
                                </div>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '15px'
                                }}>
                                    <button
                                        onClick={startCamera}
                                        style={{
                                            background: '#513653',
                                            color: 'white',
                                            border: 'none',
                                            padding: '12px 20px',
                                            borderRadius: '10px',
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            width: '100%'
                                        }}
                                    >
                                        Kamera İle Fotoğraf Çek
                                    </button>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                        style={{ display: 'none' }}
                                        id="file-upload"
                                    />
                                    <label htmlFor="file-upload" style={{
                                        background: '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        padding: '12px 20px',
                                        borderRadius: '10px',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        width: '100%',
                                        textAlign: 'center'
                                    }}>
                                        Dosyadan Fotoğraf Yükle
                                    </label>
                                </div>

                                {cameraStream && (
                                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                        <video id="camera-video" autoPlay playsInline style={{ width: '100%', borderRadius: '10px', border: `1px solid ${colors.border}` }} ref={videoRef => { if (videoRef) videoRef.srcObject = cameraStream; }} />
                                        <button
                                            onClick={capturePhoto}
                                            style={{
                                                marginTop: '15px',
                                                background: '#28a745',
                                                color: 'white',
                                                border: 'none',
                                                padding: '12px 20px',
                                                borderRadius: '10px',
                                                fontSize: '1rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            Fotoğraf Çek
                                        </button>
                                    </div>
                                )}

                                {tempImage && (
                                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                        <img src={tempImage} alt="Çekilen Fotoğraf" style={{ width: '100%', borderRadius: '10px', border: `1px solid ${colors.border}` }} />
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '15px' }}>
                                            <button
                                                onClick={acceptPhoto}
                                                style={{
                                                    background: '#28a745',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '12px 20px',
                                                    borderRadius: '10px',
                                                    fontSize: '1rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                ✅ Kabul Et
                                            </button>
                                            <button
                                                onClick={rejectPhoto}
                                                style={{
                                                    background: '#dc3545',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '12px 20px',
                                                    borderRadius: '10px',
                                                    fontSize: '1rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                ❌ Reddet
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>,
                        document.body
                    )}

                    {/* Onay Ekranı */}
                    {showProfileImageConfirm && createPortal(
                        <div
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0, 0, 0, 0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 999999
                            }}
                            onClick={cancelProfileImage}
                        >
                            <div
                                style={{
                                    background: colors.card,
                                    borderRadius: '15px',
                                    padding: '30px',
                                    minWidth: '400px',
                                    maxWidth: '500px',
                                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                                    border: `1px solid ${colors.border}`,
                                    position: 'relative',
                                    textAlign: 'center'
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 style={{ color: colors.text, marginBottom: '20px' }}>Bu fotoğrafı profil resmi yapmak istediğinize emin misiniz?</h3>
                                <img src={tempProfileImage} alt="Yeni Profil" style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '5px solid #28a745', marginBottom: '20px' }} />
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                                    <button
                                        onClick={confirmProfileImage}
                                        style={{
                                            background: '#28a745',
                                            color: 'white',
                                            border: 'none',
                                            padding: '12px 20px',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            fontSize: '1rem',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Evet, Onayla
                                    </button>
                                    <button
                                        onClick={cancelProfileImage}
                                        style={{
                                            background: '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            padding: '12px 20px',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            fontSize: '1rem',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Hayır, İptal
                                    </button>
                                </div>
                            </div>
                        </div>,
                        document.body
                    )}

                    <button
                        onClick={handleLogout}
                        className="staff-logout-btn"
                        style={{
                            background: colors.danger,
                            color: '#ffffff',
                            border: 'none',
                            padding: '12px 20px',
                            borderRadius: '10px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            width: '100%'
                        }}
                    >
                        Çıkış Yap
                    </button>
                </div>
            </div>
        </>
    );
};

export default StaffSidebar;
