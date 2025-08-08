import React, { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { TableContext } from "../../context/TableContext";
import "./StaffLayout.css";

const StaffSidebar = () => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme, colors } = useTheme();
    const { reservations, removeReservation } = useContext(TableContext);
    const [showSettings, setShowSettings] = useState(false);
    // Rezervasyon listesini göstermek için kullanılan state kaldırıldı
    const [showProfileSettings, setShowProfileSettings] = useState(false);
    const [profileImage, setProfileImage] = useState(localStorage.getItem('profileImage') || '/default-avatar.png');
    const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem('phoneNumber') || '');
    const [email, setEmail] = useState(localStorage.getItem('email') || (user ? user.email : ''));
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
    

    const getFloorLetter = (floorIndex) => {
        if (floorIndex === 0) return 'Z';
        return String.fromCharCode(64 + floorIndex);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
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
    const confirmProfileImage = () => {
        if (tempProfileImage) {
            setProfileImage(tempProfileImage);
            localStorage.setItem('profileImage', tempProfileImage);
            setTempProfileImage(null);
            setShowProfileImageConfirm(false);
            // alert yerine özel bir modal veya mesaj kutusu kullanılmalı
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
            // alert yerine özel bir modal veya mesaj kutusu kullanılmalı
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
            // alert yerine özel bir modal veya mesaj kutusu kullanılmalı
            alert('Telefon numarası başarıyla güncellendi!');
        } else {
            // alert yerine özel bir modal veya mesaj kutusu kullanılmalı
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
            // alert yerine özel bir modal veya mesaj kutusu kullanılmalı
            alert('E-posta adresi başarıyla güncellendi!');
        } else {
            // alert yerine özel bir modal veya mesaj kutusu kullanılmalı
            alert(`Yanlış doğrulama kodu! Doğru kod: ${expectedCode}`);
        }
    };

    const homePath = `/${user?.role}/home`;

    // Stok durumunu görmeye yetkili roller
    const canViewStock = user?.role === 'garson' || user?.role === 'kasiyer';
    // Rezervasyonları görmeye yetkili roller
    const canViewReservations = user?.role === 'garson' || user?.role === 'kasiyer';


    return (
        <div className="staff-sidebar">
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
                />
                <div
                    style={{
                        fontSize: '1.2rem',
                        fontWeight: '700',
                        color: colors.text,
                        textAlign: 'center'
                    }}
                >
                    {user ? user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1) : 'Kullanıcı'}
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
                    {user ? (user.role === 'garson' ? 'Garson' : user.role === 'kasiyer' ? 'Kasiyer' : 'Yönetici') : 'Rol Belirtilmemiş'}
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
                    <NavLink
                        to="/kasiyer/fast-order"
                        className={({ isActive }) =>
                            isActive ? "staff-nav-item active" : "staff-nav-item"
                        }
                    >
                        🧾 Hızlı Sipariş
                    </NavLink>
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
                                background: colors.card,
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
                                color: colors.text,
                                marginBottom: '20px',
                                textAlign: 'center'
                            }}>
                                ⚙️ Ayarlar
                            </div>

                            <div style={{
                                fontSize: '1rem',
                                fontWeight: '600',
                                color: colors.text,
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
                                color: colors.textSecondary,
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
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
                                <label style={{ fontSize: '1rem', fontWeight: '600', color: isDarkMode ? '#ffffff' : '#333333', marginBottom: '10px', display: 'block' }}>
                                    Profil Fotoğrafı
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '15px' }}>
                                    <img
                                        src={tempProfileImage || profileImage}
                                        alt="Profil"
                                        style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #ddd' }}
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
                                    value={user ? user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1) : 'Kullanıcı'}
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
                                    value={user ? (user.role === 'garson' ? 'Garson' : 'Kasiyer') : ''}
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
    );
};

export default StaffSidebar;
