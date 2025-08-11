import React, { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { TableContext } from "../../context/TableContext";
import "./AdminLayout.css";

const AdminSidebar = () => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { isDarkMode, toggleTheme, colors } = useTheme();
    const tableContext = useContext(TableContext);
    const reservations = tableContext?.reservations || {};
    const [showSettings, setShowSettings] = useState(false);
    const [showProfileSettings, setShowProfileSettings] = useState(false);
    const [profileImage, setProfileImage] = useState(localStorage.getItem('profileImage') || '/default-avatar.png');
    const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem('phoneNumber') || '');
    const [email, setEmail] = useState(localStorage.getItem('email') || '');
    const [showPhoneVerification, setShowPhoneVerification] = useState(false);
    const [showEmailVerification, setShowEmailVerification] = useState(false);
    const [phoneVerificationCode, setPhoneVerificationCode] = useState('');
    const [emailVerificationCode, setEmailVerificationCode] = useState('');
    const [tempPhone, setTempPhone] = useState('');
    const [tempEmail, setTempEmail] = useState('');
    const [tempProfileImage, setTempProfileImage] = useState(null);
    const [showProfileImageConfirm, setShowProfileImageConfirm] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [tempImage, setTempImage] = useState(null);

    // Bugünkü rezervasyon sayısını hesapla
    const getTodayReservationsCount = () => {
        if (!reservations || Object.keys(reservations).length === 0) {
            return 0;
        }
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD formatında bugün
        return Object.values(reservations).filter(reservation =>
            reservation.tarih === today
        ).length;
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
    const confirmProfileImage = () => {
        if (tempProfileImage) {
            setProfileImage(tempProfileImage);
            localStorage.setItem('profileImage', tempProfileImage);
            setTempProfileImage(null);
            setShowProfileImageConfirm(false);
            alert('Profil fotoğrafı başarıyla güncellendi!');
        }
    };

    // Profil fotoğrafını iptal etme
    const cancelProfileImage = () => {
        setTempProfileImage(null);
        setShowProfileImageConfirm(false);
    };

    // Telefon numarası değiştirme
    const handlePhoneChange = () => {
        if (tempPhone && tempPhone.length === 10) {
            setShowPhoneVerification(true);
            // SMS doğrulama kodu gönder (simülasyon)
            const code = Math.floor(100000 + Math.random() * 900000);
            alert(`SMS doğrulama kodu: ${code}`);
        }
    };

    // Telefon doğrulama
    const verifyPhone = () => {
        // Simülasyon için rastgele kod oluştur ve kontrol et
        const expectedCode = '123456'; // Sabit kod
        if (phoneVerificationCode === expectedCode) {
            setPhoneNumber(tempPhone);
            localStorage.setItem('phoneNumber', tempPhone);
            setShowPhoneVerification(false);
            setTempPhone('');
            setPhoneVerificationCode('');
            alert('Telefon numarası başarıyla güncellendi!');
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

    return (
        <>
            {/* Mobil toggle butonu */}
            <button
                className="mobile-sidebar-toggle"
                onClick={toggleSidebar}
                style={{
                    position: 'fixed',
                    top: '20px',
                    left: '20px',
                    zIndex: 1001,
                    background: '#A294F9',
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

            <div className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="admin-sidebar-header">
                    <div className="admin-user-info" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <img
                            src={profileImage}
                            alt="Profil"
                            style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '2px solid #fff',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                            }}
                        />
                        <div>
                            <div className="admin-user-name" style={{
                                fontFamily: '00623 Sans Serif Bold, sans-serif',
                                fontWeight: '700',
                                fontSize: '1.4rem'
                            }}>Betül</div>
                            <div className="admin-user-role" style={{
                                fontFamily: '00623 Sans Serif Bold, sans-serif',
                                fontWeight: '700',
                                fontSize: '1.2rem'
                            }}>Admin</div>
                        </div>
                    </div>
                </div>
                <nav className="admin-sidebar-nav">
                    <NavLink
                        to="/admin/dashboard"
                        className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.2rem' }}>📍</span>
                            <span>Ana Sayfa</span>
                        </div>
                    </NavLink>
                    <NavLink
                        to="/admin/personnel"
                        className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.2rem' }}>👤</span>
                            <span>Personel</span>
                        </div>
                    </NavLink>
                    <NavLink
                        to="/admin/reports"
                        className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.2rem' }}>📊</span>
                            <span>Rapor</span>
                        </div>
                    </NavLink>
                    <NavLink
                        to="/admin/stock"
                        className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}
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
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.2rem' }}>📅</span>
                            <span>Rezervasyonlar</span>
                            {getTodayReservationsCount() > 0 && (
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
                                    fontWeight: 'bold',
                                    marginLeft: 'auto'
                                }}>
                                    {getTodayReservationsCount()}
                                </span>
                            )}
                        </div>
                    </NavLink>
                    <NavLink
                        to="/admin/restaurant-settings"
                        className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.2rem' }}>🏪</span>
                            <span>Restoran Yönetimi</span>
                        </div>
                    </NavLink>
                    <NavLink
                        to="/admin/order-history"
                        className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.2rem' }}>📋</span>
                            <span>Sipariş Geçmişi</span>
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
                                        value="Betül"
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
                                        value="Admin"
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
                                            placeholder="5XX XXX XX XX"
                                            value={tempPhone || phoneNumber}
                                            onChange={(e) => setTempPhone(e.target.value)}
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
                                            onClick={handlePhoneChange}
                                            disabled={!tempPhone || tempPhone.length !== 10}
                                            style={{
                                                background: tempPhone && tempPhone.length === 10 ? '#28a745' : '#6c757d',
                                                color: 'white',
                                                border: 'none',
                                                padding: '12px 20px',
                                                borderRadius: '8px',
                                                fontSize: '1rem',
                                                fontWeight: '600',
                                                cursor: tempPhone && tempPhone.length === 10 ? 'pointer' : 'not-allowed',
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
