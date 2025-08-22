import React, { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { TableContext } from "../../context/TableContext";
import "./AdminLayout.css";
import { userService } from "../../services/userService";
import { personnelService } from "../../services/personnelService";
import { authService } from "../../services/authService";

const AdminSidebar = () => {
    const { logout, user, updatePhone } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const { isDarkMode, toggleTheme, colors } = useTheme();
    const tableContext = useContext(TableContext);
    const reservations = tableContext?.reservations || {};
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
                    try {
                        data = await userService.getUserById(id);
                    } catch (e) {
                        console.warn('[Profile] Fetch by id failed:', e?.message);
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
    const [phoneError, setPhoneError] = useState('');
    const [tempEmail, setTempEmail] = useState('');
    const [tempProfileImage, setTempProfileImage] = useState(null);
    const [showProfileImageConfirm, setShowProfileImageConfirm] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);

    // Change Password Modal States
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [tempImage, setTempImage] = useState(null);

    // Sayfa değişikliklerinde sidebar'ı kapat
    const handleNavClick = () => {
        setIsSidebarOpen(false);
    };

    // Sidebar durumuna göre body class'ını güncelle
    useEffect(() => {
        if (isSidebarOpen) {
            document.body.classList.add('sidebar-open');
        } else {
            document.body.classList.remove('sidebar-open');
        }
    }, [isSidebarOpen]);

    // Bugünkü rezervasyon sayısını hesapla
    const getTodayReservationsCount = () => {
        if (!reservations || Object.keys(reservations).length === 0) {
            return 0;
        }
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD formatında bugün

        // Normal rezervasyonları say
        const normalReservations = Object.values(reservations).filter(reservation =>
            reservation.tarih === today && !reservation.specialReservation
        ).length;

        // Özel rezervasyonları grupla (aynı kişi, tarih, saat olanları 1 olarak say)
        const specialReservations = Object.values(reservations).filter(reservation =>
            reservation.tarih === today && reservation.specialReservation
        );

        // Özel rezervasyonları grupla
        const specialGroups = {};
        specialReservations.forEach(reservation => {
            const groupKey = `${reservation.ad}_${reservation.soyad}_${reservation.telefon}_${reservation.tarih}_${reservation.saat}`;
            if (!specialGroups[groupKey]) {
                specialGroups[groupKey] = true;
            }
        });

        const uniqueSpecialReservations = Object.keys(specialGroups).length;

        return normalReservations + uniqueSpecialReservations;
    };

    // Bugünkü özel rezervasyon sayısını hesapla (ünlem işareti için)
    const getTodaySpecialReservationsCount = () => {
        if (!reservations || Object.keys(reservations).length === 0) {
            return 0;
        }
        const today = new Date().toISOString().split('T')[0];

        const specialReservations = Object.values(reservations).filter(reservation =>
            reservation.tarih === today && reservation.specialReservation
        );

        // Özel rezervasyonları grupla
        const specialGroups = {};
        specialReservations.forEach(reservation => {
            const groupKey = `${reservation.ad}_${reservation.soyad}_${reservation.telefon}_${reservation.tarih}_${reservation.saat}`;
            if (!specialGroups[groupKey]) {
                specialGroups[groupKey] = true;
            }
        });

        return Object.keys(specialGroups).length;
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

    // Profil fotoğrafı değiştirme
    const handleProfileImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = e.target.result;
                setTempProfileImage(imageData);
                setShowProfileImageConfirm(true);
            };
            reader.readAsDataURL(file);
        }
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

                let targetId = user?.userId;
                if (!isNumeric(targetId)) {
                    targetId = await findUserIdByEmail(user?.email);
                }
                if (!isNumeric(targetId)) throw new Error('Kullanıcı ID bulunamadı');

                await userService.updateUserPhone(targetId, tempPhone);

                setPhoneNumber(tempPhone);
                localStorage.setItem('phoneNumber', tempPhone);
                if (typeof updatePhone === 'function') {
                    updatePhone(tempPhone);
                }
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
            alert(`E-posta doğrulama kodu: ${code}`);
        }
    };

    // E-posta doğrulama
    const verifyEmail = () => {
        // Simülasyon için sabit kod kontrol et
        const expectedCode = '123456'; // Sabit kod
        if (emailVerificationCode === expectedCode) {
            setEmail(tempEmail);
            localStorage.setItem('email', tempEmail);
            setShowEmailVerification(false);
            setTempEmail('');
            setEmailVerificationCode('');
            alert('E-posta adresi başarıyla güncellendi!');
        } else {
            alert(`Yanlış doğrulama kodu! Doğru kod: ${expectedCode}`);
        }
    };

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

    // Detect viewport to decide hamburger visibility
    useEffect(() => {
        const onResize = () => {
            setIsMobile(window.innerWidth <= 1024);
            if (window.innerWidth > 1024) {
                setIsSidebarOpen(false);
            }
        };
        onResize();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    return (
        <>
            {/* Hamburger menü butonu - only for tablet/mobile */}
            {isMobile && (
                <button
                    className="hamburger-menu-btn"
                    onClick={toggleSidebar}
                    style={{
                        position: 'fixed',
                        top: '90px',
                        left: '20px',
                        zIndex: 1001,
                        background: isDarkMode ? colors.primary : '#A294F9',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '15px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                        transition: 'all 0.3s ease',
                        border: `2px solid ${isDarkMode ? colors.border : '#CDC1FF'}`
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.1)';
                        e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
                    }}
                >
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '3px',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <span style={{
                            width: '20px',
                            height: '3px',
                            background: 'white',
                            borderRadius: '2px',
                            transition: 'all 0.3s ease',
                            transform: isSidebarOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
                        }}></span>
                        <span style={{
                            width: '20px',
                            height: '3px',
                            background: 'white',
                            borderRadius: '2px',
                            transition: 'all 0.3s ease',
                            opacity: isSidebarOpen ? '0' : '1'
                        }}></span>
                        <span style={{
                            width: '20px',
                            height: '3px',
                            background: 'white',
                            borderRadius: '2px',
                            transition: 'all 0.3s ease',
                            transform: isSidebarOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none'
                        }}></span>
                    </div>
                </button>
            )}

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
                        background: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.6)',
                        zIndex: 999,
                        backdropFilter: 'blur(3px)',
                        transition: 'all 0.3s ease'
                    }}
                />
            )}

            <div className={`admin-sidebar ${isMobile ? (isSidebarOpen ? 'open' : 'closed') : ''}`}>
                <div className="admin-sidebar-header">
                    <div className="admin-user-info" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        marginLeft: isSidebarOpen ? '60px' : '0px',
                        transition: 'margin-left 0.3s ease'
                    }}>

                        <div className="admin-user-info">
                            <img
                                src={profileImage}
                                alt="Profil"
                                style={{
                                    width: '35px',
                                    height: '35px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '2px solid #fff',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                    marginRight: '12px'
                                }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div className="admin-user-name" style={{
                                    fontFamily: '00623 Sans Serif Bold, sans-serif',
                                    fontWeight: '600',
                                    fontSize: '0.85rem',
                                    color: isDarkMode ? '#ffffff' : '#1A0B3D',
                                    marginBottom: '2px',
                                    lineHeight: '1.1'
                                }}>{displayName || 'Kullanıcı'}</div>
                                <div className="admin-user-role" style={{
                                    fontFamily: '00623 Sans Serif Bold, sans-serif',
                                    fontWeight: '500',
                                    fontSize: '0.7rem',
                                    color: isDarkMode ? '#e0e0e0' : '#2D1B69',
                                    lineHeight: '1.1'
                                }}>{displayRole || 'Kullanıcı'}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <nav className="admin-sidebar-nav">
                    <NavLink
                        to="/admin/dashboard"
                        className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}
                        onClick={handleNavClick}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.2rem' }}>📍</span>
                            <span>Ana Sayfa</span>
                        </div>
                    </NavLink>
                    <NavLink
                        to="/admin/personnel"
                        className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}
                        onClick={handleNavClick}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.2rem' }}>👤</span>
                            <span>Personel</span>
                        </div>
                    </NavLink>
                    <NavLink
                        to="/admin/reports"
                        className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}
                        onClick={handleNavClick}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.2rem' }}>📊</span>
                            <span>Rapor</span>
                        </div>
                    </NavLink>
                    <NavLink
                        to="/admin/stock"
                        className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}
                        onClick={handleNavClick}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.2rem' }}>🍽</span>
                            <span>Ürün Yönetimi</span>
                        </div>
                    </NavLink>
                    <NavLink
                        to="/admin/reservations"
                        className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}
                        style={{ position: 'relative' }}
                        onClick={handleNavClick}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.2rem' }}>📅</span>
                            <span>Rezervasyonlar</span>
                            {(getTodayReservationsCount() - getTodaySpecialReservationsCount() > 0 || getTodaySpecialReservationsCount() > 0) && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    marginLeft: 'auto'
                                }}>
                                    {/* Normal rezervasyon sayısı */}
                                    {getTodayReservationsCount() - getTodaySpecialReservationsCount() > 0 && (
                                        <span style={{
                                            backgroundColor: '#28a745',
                                            color: 'white',
                                            borderRadius: '50%',
                                            width: '20px',
                                            height: '20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {getTodayReservationsCount() - getTodaySpecialReservationsCount()}
                                        </span>
                                    )}

                                    {/* Özel rezervasyon sayısı (ünlem işareti ile) */}
                                    {getTodaySpecialReservationsCount() > 0 && (
                                        <span style={{
                                            backgroundColor: '#dc3545',
                                            color: 'white',
                                            borderRadius: '50%',
                                            width: '24px',
                                            height: '24px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.9rem',
                                            fontWeight: 'bold',
                                            border: '2px solid #ffc107',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                        }}>
                                            !{getTodaySpecialReservationsCount()}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </NavLink>
                    <NavLink
                        to="/admin/restaurant-settings"
                        className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}
                        onClick={handleNavClick}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.2rem' }}>🏪</span>
                            <span>Restoran Yönetimi</span>
                        </div>
                    </NavLink>
                    <NavLink
                        to="/admin/order-history"
                        className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}
                        onClick={handleNavClick}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.2rem' }}>📋</span>
                            <span>Sipariş Geçmişi</span>
                        </div>
                    </NavLink>

                    <NavLink
                        to="/admin/activity-logs"
                        className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}
                        onClick={handleNavClick}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.2rem' }}>🧭</span>
                            <span>Aktivite Logları</span>
                        </div>
                    </NavLink>
                </nav>



                {/* Alt kısım - Ayarlar ve Çıkış */}
                <div className="admin-sidebar-bottom">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="admin-settings-btn"
                        style={{
                            background: isDarkMode ? '#2a2a2a' : '#513653',
                            color: '#ffffff',
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
                            onClick={() => setShowProfileSettings(false)}
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
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '20px'
                                }}>
                                    <button
                                        onClick={() => {
                                            setShowProfileSettings(false);
                                            setShowSettings(true);
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
                                        onClick={() => setShowProfileSettings(false)}
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
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {user?.role === 'admin' ? (
                                                <>
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
                                                </>
                                            ) : (
                                                <div style={{
                                                    color: isDarkMode ? '#888' : '#666',
                                                    fontSize: '0.9rem',
                                                    fontStyle: 'italic'
                                                }}>
                                                    Sadece admin profil fotoğrafını güncelleyebilir
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* İsim Soyisim (Değiştirilemez) */}
                                <div style={{ marginBottom: '25px' }}>
                                    <label style={{
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        color: isDarkMode ? '#ffffff' : '#333333',
                                        marginBottom: '10px',
                                        display: 'block'
                                    }}>
                                        İsim Soyisim
                                    </label>
                                    <input
                                        type="text"
                                        value={displayName || ''}
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
                                    <label style={{
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        color: isDarkMode ? '#ffffff' : '#333333',
                                        marginBottom: '10px',
                                        display: 'block'
                                    }}>
                                        Rol
                                    </label>
                                    <input
                                        type="text"
                                        value={displayRole || ''}
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
                                    <label style={{
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        color: isDarkMode ? '#ffffff' : '#333333',
                                        marginBottom: '10px',
                                        display: 'block'
                                    }}>
                                        Telefon Numarası
                                    </label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="tel"
                                            placeholder="0 5XX XXX XX XX"
                                            value={tempPhone || phoneNumber}
                                            onChange={(e) => {
                                                const onlyDigits = e.target.value.replace(/[^0-9]/g, '');
                                                setTempPhone(onlyDigits);
                                                if (onlyDigits && (!onlyDigits.startsWith('0') || onlyDigits.length !== 11)) {
                                                    setPhoneError('Telefon 0 ile başlamalı ve 11 hane olmalı');
                                                } else {
                                                    setPhoneError('');
                                                }
                                            }}
                                            style={{
                                                background: isDarkMode ? '#3a3a3a' : '#ffffff',
                                                color: isDarkMode ? '#ffffff' : '#333333',
                                                border: `1px solid ${isDarkMode ? '#555' : '#ddd'}`,
                                                padding: '12px',
                                                borderRadius: '8px',
                                                fontSize: '1rem',
                                                flex: 1
                                            }}
                                        />
                                        {phoneError && (
                                            <div style={{ color: '#dc3545', fontSize: '0.85rem', alignSelf: 'center' }}>{phoneError}</div>
                                        )}
                                        <button
                                            onClick={handlePhoneChange}
                                            disabled={!tempPhone}
                                            style={{
                                                background: tempPhone ? '#28a745' : '#6c757d',
                                                color: 'white',
                                                border: 'none',
                                                padding: '12px 20px',
                                                borderRadius: '8px',
                                                fontSize: '1rem',
                                                fontWeight: '600',
                                                cursor: tempPhone ? 'pointer' : 'not-allowed',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            Değiştir
                                        </button>
                                    </div>
                                </div>

                                {/* E-posta */}
                                <div style={{ marginBottom: '25px' }}>
                                    <label style={{
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        color: isDarkMode ? '#ffffff' : '#333333',
                                        marginBottom: '10px',
                                        display: 'block'
                                    }}>
                                        E-posta Adresi
                                    </label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="email"
                                            placeholder="ornek@email.com"
                                            value={tempEmail || email}
                                            onChange={(e) => setTempEmail(e.target.value)}
                                            style={{
                                                background: isDarkMode ? '#3a3a3a' : '#ffffff',
                                                color: isDarkMode ? '#ffffff' : '#333333',
                                                border: `1px solid ${isDarkMode ? '#555' : '#ddd'}`,
                                                padding: '12px',
                                                borderRadius: '8px',
                                                fontSize: '1rem',
                                                flex: 1
                                            }}
                                        />
                                        <button
                                            onClick={handleEmailChange}
                                            disabled={!tempEmail || !tempEmail.includes('@')}
                                            style={{
                                                background: tempEmail && tempEmail.includes('@') ? '#007bff' : '#6c757d',
                                                color: 'white',
                                                border: 'none',
                                                padding: '12px 20px',
                                                borderRadius: '8px',
                                                fontSize: '1rem',
                                                fontWeight: '600',
                                                cursor: tempEmail && tempEmail.includes('@') ? 'pointer' : 'not-allowed',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            Değiştir
                                        </button>
                                    </div>
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

                    {/* Telefon Doğrulama Modal */}
                    {showPhoneVerification && createPortal(
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
                            onClick={() => setShowPhoneVerification(false)}
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
                                    fontSize: '1.3rem',
                                    fontWeight: '700',
                                    color: isDarkMode ? '#ffffff' : '#333333',
                                    marginBottom: '20px',
                                    textAlign: 'center'
                                }}>
                                    📱 SMS Doğrulama
                                </div>
                                <p style={{
                                    color: isDarkMode ? '#cccccc' : '#666666',
                                    marginBottom: '20px',
                                    textAlign: 'center'
                                }}>
                                    {tempPhone} numarasına gönderilen 6 haneli doğrulama kodunu girin
                                </p>
                                <input
                                    type="text"
                                    placeholder="000000"
                                    value={phoneVerificationCode}
                                    onChange={(e) => setPhoneVerificationCode(e.target.value)}
                                    maxLength={6}
                                    style={{
                                        background: isDarkMode ? '#3a3a3a' : '#ffffff',
                                        color: isDarkMode ? '#ffffff' : '#333333',
                                        border: `1px solid ${isDarkMode ? '#555' : '#ddd'}`,
                                        padding: '15px',
                                        borderRadius: '8px',
                                        fontSize: '1.2rem',
                                        width: '100%',
                                        textAlign: 'center',
                                        letterSpacing: '5px',
                                        marginBottom: '20px'
                                    }}
                                />
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <button
                                        onClick={verifyPhone}
                                        style={{
                                            background: '#28a745',
                                            color: 'white',
                                            border: 'none',
                                            padding: '12px 24px',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            flex: 1
                                        }}
                                    >
                                        Doğrula
                                    </button>
                                    <button
                                        onClick={() => setShowPhoneVerification(false)}
                                        style={{
                                            background: '#6c757d',
                                            color: 'white',
                                            border: 'none',
                                            padding: '12px 24px',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            flex: 1
                                        }}
                                    >
                                        İptal
                                    </button>
                                </div>
                            </div>
                        </div>,
                        document.body
                    )}

                    {/* E-posta Doğrulama Modal */}
                    {showEmailVerification && createPortal(
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
                            onClick={() => setShowEmailVerification(false)}
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
                                    fontSize: '1.3rem',
                                    fontWeight: '700',
                                    color: isDarkMode ? '#ffffff' : '#333333',
                                    marginBottom: '20px',
                                    textAlign: 'center'
                                }}>
                                    📧 E-posta Doğrulama
                                </div>
                                <p style={{
                                    color: isDarkMode ? '#cccccc' : '#666666',
                                    marginBottom: '20px',
                                    textAlign: 'center'
                                }}>
                                    {tempEmail} adresine gönderilen 6 haneli doğrulama kodunu girin
                                </p>
                                <input
                                    type="text"
                                    placeholder="000000"
                                    value={emailVerificationCode}
                                    onChange={(e) => setEmailVerificationCode(e.target.value)}
                                    maxLength={6}
                                    style={{
                                        background: isDarkMode ? '#3a3a3a' : '#ffffff',
                                        color: isDarkMode ? '#ffffff' : '#333333',
                                        border: `1px solid ${isDarkMode ? '#555' : '#ddd'}`,
                                        padding: '15px',
                                        borderRadius: '8px',
                                        fontSize: '1.2rem',
                                        width: '100%',
                                        textAlign: 'center',
                                        letterSpacing: '5px',
                                        marginBottom: '20px'
                                    }}
                                />
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <button
                                        onClick={verifyEmail}
                                        style={{
                                            background: '#007bff',
                                            color: 'white',
                                            border: 'none',
                                            padding: '12px 24px',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            flex: 1
                                        }}
                                    >
                                        Doğrula
                                    </button>
                                    <button
                                        onClick={() => setShowEmailVerification(false)}
                                        style={{
                                            background: '#6c757d',
                                            color: 'white',
                                            border: 'none',
                                            padding: '12px 24px',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            flex: 1
                                        }}
                                    >
                                        İptal
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
                                width: '100vw',
                                height: '100vh',
                                background: 'rgba(0, 0, 0, 0.8)',
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
                                    padding: '2rem',
                                    borderRadius: '15px',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                    zIndex: 1000000,
                                    maxWidth: '500px',
                                    width: '90%',
                                    textAlign: 'center',
                                    border: `1px solid ${isDarkMode ? '#4a4a4a' : '#e0e0e0'}`
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Kapatma butonu */}
                                <button
                                    onClick={closePhotoModal}
                                    style={{
                                        position: 'absolute',
                                        top: '15px',
                                        right: '20px',
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '24px',
                                        color: '#dc3545',
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
                                        e.target.style.background = 'rgba(220, 53, 69, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'none';
                                    }}
                                >
                                    ✕
                                </button>

                                <h3 style={{ margin: '0 0 20px 0', color: isDarkMode ? '#ffffff' : '#333333', fontSize: '1.5rem' }}>Fotoğraf Ekle</h3>

                                {/* Fotoğraf önizlemesi */}
                                {tempImage && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <img
                                            src={tempImage}
                                            alt="Önizleme"
                                            style={{
                                                width: '200px',
                                                height: '200px',
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: '3px solid #ddd',
                                                margin: '0 auto'
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Kamera görüntüsü */}
                                {cameraStream && !tempImage && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <video
                                            id="camera-video"
                                            autoPlay
                                            playsInline
                                            style={{
                                                width: '300px',
                                                height: '225px',
                                                borderRadius: '8px',
                                                margin: '0 auto'
                                            }}
                                            ref={(video) => {
                                                if (video && cameraStream) {
                                                    video.srcObject = cameraStream;
                                                }
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Butonlar */}
                                {!tempImage && !cameraStream && (
                                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '20px' }}>
                                        <button
                                            onClick={startCamera}
                                            style={{
                                                background: '#007bff',
                                                color: 'white',
                                                border: 'none',
                                                padding: '10px 20px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            📷 Kamera ile Çek
                                        </button>
                                        <label style={{
                                            background: '#28a745',
                                            color: 'white',
                                            border: 'none',
                                            padding: '10px 20px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            📁 Dosyadan Seç
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePhotoUpload}
                                                style={{ display: 'none' }}
                                            />
                                        </label>
                                    </div>
                                )}

                                {/* Kamera butonları */}
                                {cameraStream && !tempImage && (
                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
                                        <button
                                            onClick={capturePhoto}
                                            style={{
                                                background: '#28a745',
                                                color: 'white',
                                                border: 'none',
                                                padding: '10px 20px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            📸 Fotoğraf Çek
                                        </button>
                                        <button
                                            onClick={stopCamera}
                                            style={{
                                                background: '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                padding: '10px 20px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '14px'
                                            }}
                                        >
                                            ❌ İptal
                                        </button>
                                    </div>
                                )}

                                {/* Kabul/Ret butonları */}
                                {tempImage && (
                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                        <button
                                            onClick={acceptPhoto}
                                            style={{
                                                background: '#28a745',
                                                color: 'white',
                                                border: 'none',
                                                padding: '10px 20px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
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
                                                padding: '10px 20px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            ❌ Reddet
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>,
                        document.body
                    )}

                    <button
                        onClick={handleLogout}
                        className="admin-logout-btn"
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

export default AdminSidebar;
