import React, { useState, useEffect, useContext } from 'react';
import { useTheme } from '../../context/ThemeContext';
import WarningModal from '../../components/common/WarningModal';

const RestaurantSettings = () => {
    const { isDarkMode, colors } = useTheme();
    const [restaurantName, setRestaurantName] = useState(localStorage.getItem('restaurantName') || 'Restoran Yönetim Sistemi');
    const [systemName, setSystemName] = useState(localStorage.getItem('systemName') || 'ŞeftaliPos');
    const [openingTime, setOpeningTime] = useState(localStorage.getItem('openingTime') || '09:00');
    const [closingTime, setClosingTime] = useState(localStorage.getItem('closingTime') || '22:00');
    const [showNameModal, setShowNameModal] = useState(false);
    const [showSystemNameModal, setShowSystemNameModal] = useState(false);
    const [tempRestaurantName, setTempRestaurantName] = useState('');
    const [tempSystemName, setTempSystemName] = useState('');
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');

    // Saat validasyonu
    const validateTime = (opening, closing) => {
        const openingHour = parseInt(opening.split(':')[0]);
        const openingMinute = parseInt(opening.split(':')[1]);
        const closingHour = parseInt(closing.split(':')[0]);
        const closingMinute = parseInt(closing.split(':')[1]);

        const openingTotal = openingHour * 60 + openingMinute;
        const closingTotal = closingHour * 60 + closingMinute;

        if (openingTotal >= closingTotal) {
            return false;
        }

        return true;
    };

    // Açılış saati değiştiğinde
    const handleOpeningTimeChange = (newTime) => {
        if (validateTime(newTime, closingTime)) {
            setOpeningTime(newTime);
            localStorage.setItem('openingTime', newTime);
        } else {
            setWarningMessage('Açılış saati kapanış saatinden sonra olamaz!');
            setShowWarningModal(true);
        }
    };

    // Kapanış saati değiştiğinde
    const handleClosingTimeChange = (newTime) => {
        if (validateTime(openingTime, newTime)) {
            setClosingTime(newTime);
            localStorage.setItem('closingTime', newTime);
        } else {
            setWarningMessage('Kapanış saati açılış saatinden önce olamaz!');
            setShowWarningModal(true);
        }
    };

    // Restoran ismi değiştirme modalını aç
    const openNameModal = () => {
        setTempRestaurantName(restaurantName);
        setShowNameModal(true);
    };

    // Sistem ismi değiştirme modalını aç
    const openSystemNameModal = () => {
        setTempSystemName(systemName);
        setShowSystemNameModal(true);
    };

    // Restoran ismini kaydet
    const saveRestaurantName = () => {
        if (tempRestaurantName.trim()) {
            setRestaurantName(tempRestaurantName.trim());
            localStorage.setItem('restaurantName', tempRestaurantName.trim());
            // TopNav'ı güncellemek için custom event gönder
            window.dispatchEvent(new CustomEvent('restaurantNameChanged', {
                detail: { name: tempRestaurantName.trim() }
            }));
            setShowNameModal(false);
        }
    };

    // Sistem ismini kaydet
    const saveSystemName = () => {
        if (tempSystemName.trim()) {
            setSystemName(tempSystemName.trim());
            localStorage.setItem('systemName', tempSystemName.trim());
            // Login sayfasını güncellemek için custom event gönder
            window.dispatchEvent(new CustomEvent('systemNameChanged', {
                detail: { name: tempSystemName.trim() }
            }));
            setShowSystemNameModal(false);
        }
    };

    // Son rezervasyon saatini hesapla (kapanıştan 3 saat önce)
    const getLastReservationTime = () => {
        const closingHour = parseInt(closingTime.split(':')[0]);
        const closingMinute = parseInt(closingTime.split(':')[1]);
        
        let lastHour = closingHour - 3;
        if (lastHour < 0) lastHour = 0;
        
        return `${lastHour.toString().padStart(2, '0')}:${closingMinute.toString().padStart(2, '0')}`;
    };

    const styles = {
        page: {
            padding: "20px",
            minHeight: "100vh",
            backgroundColor: colors.background,
            color: colors.text
        },
        header: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
            backgroundColor: colors.card,
            padding: "20px",
            borderRadius: "10px",
            boxShadow: isDarkMode ? "0 2px 4px rgba(0,0,0,0.3)" : "0 2px 4px rgba(0,0,0,0.1)",
            border: `1px solid ${colors.border}`
        },
        title: {
            fontSize: "1.8rem",
            color: colors.text,
            fontWeight: 600,
            margin: 0
        },
        settingsContainer: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "20px"
        },
        settingCard: {
            backgroundColor: colors.card,
            padding: "25px",
            borderRadius: "10px",
            boxShadow: isDarkMode ? "0 2px 4px rgba(0,0,0,0.3)" : "0 2px 4px rgba(0,0,0,0.1)",
            border: `1px solid ${colors.border}`
        },
        cardTitle: {
            fontSize: "1.3rem",
            color: colors.text,
            fontWeight: 600,
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px"
        },
        inputGroup: {
            marginBottom: "20px"
        },
        label: {
            display: "block",
            marginBottom: "8px",
            color: colors.textSecondary,
            fontWeight: 500,
            fontSize: "14px"
        },
        input: {
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: `2px solid ${colors.border}`,
            fontSize: "16px",
            outline: "none",
            backgroundColor: colors.background,
            color: colors.text,
            transition: "border-color 0.3s ease"
        },
        timeInput: {
            width: "150px",
            padding: "12px",
            borderRadius: "8px",
            border: `2px solid ${colors.border}`,
            fontSize: "16px",
            outline: "none",
            backgroundColor: colors.background,
            color: colors.text,
            transition: "border-color 0.3s ease"
        },
        button: {
            backgroundColor: colors.primary,
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.3s ease"
        },
        infoBox: {
            backgroundColor: isDarkMode ? '#473653' : '#E5D9F2',
            padding: "15px",
            borderRadius: "8px",
            border: `1px solid ${colors.border}`,
            marginTop: "15px"
        },
        infoText: {
            color: colors.textSecondary,
            fontSize: "14px",
            lineHeight: "1.5",
            margin: 0
        },
        currentName: {
            fontSize: "1.1rem",
            color: colors.text,
            fontWeight: 600,
            marginBottom: "10px"
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <h1 style={styles.title}>🏪 Restoran Yönetimi</h1>
            </div>

            <div style={styles.settingsContainer}>
                {/* Sistem İsmi Ayarları */}
                <div style={styles.settingCard}>
                    <h2 style={styles.cardTitle}>
                        🖥️ Sistem İsmi
                    </h2>
                    <div style={styles.inputGroup}>
                        <div style={styles.currentName}>
                            Mevcut İsim: {systemName}
                        </div>
                        <button 
                            onClick={openSystemNameModal}
                            style={styles.button}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            ✏️ İsmi Değiştir
                        </button>
                    </div>
                    <div style={styles.infoBox}>
                        <p style={styles.infoText}>
                            💡 Sistem ismi değiştirildiğinde, giriş sayfasındaki karşılama mesajında 
                            yeni sistem ismi görünecektir.
                        </p>
                    </div>
                </div>

                {/* Restoran İsmi Ayarları */}
                <div style={styles.settingCard}>
                    <h2 style={styles.cardTitle}>
                        📝 Restoran İsmi
                    </h2>
                    <div style={styles.inputGroup}>
                        <div style={styles.currentName}>
                            Mevcut İsim: {restaurantName}
                        </div>
                        <button 
                            onClick={openNameModal}
                            style={styles.button}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            ✏️ İsmi Değiştir
                        </button>
                    </div>
                    <div style={styles.infoBox}>
                        <p style={styles.infoText}>
                            💡 Restoran ismi değiştirildiğinde, sistem genelinde "Restoran Yönetim Sistemi" 
                            yazan yerlerde yeni isim görünecektir.
                        </p>
                    </div>
                </div>

                {/* Çalışma Saatleri */}
                <div style={styles.settingCard}>
                    <h2 style={styles.cardTitle}>
                        🕐 Çalışma Saatleri
                    </h2>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Açılış Saati:</label>
                        <input
                            type="time"
                            value={openingTime}
                            onChange={(e) => handleOpeningTimeChange(e.target.value)}
                            style={styles.timeInput}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Kapanış Saati:</label>
                        <input
                            type="time"
                            value={closingTime}
                            onChange={(e) => handleClosingTimeChange(e.target.value)}
                            style={styles.timeInput}
                        />
                    </div>
                    <div style={styles.infoBox}>
                        <p style={styles.infoText}>
                            ⏰ <strong>Açılış:</strong> {openingTime} | <strong>Kapanış:</strong> {closingTime}
                        </p>
                        <p style={styles.infoText}>
                            📅 <strong>Son Rezervasyon Saati:</strong> {getLastReservationTime()} 
                            (Kapanıştan 3 saat önce)
                        </p>
                        <p style={styles.infoText}>
                            💡 Rezervasyonlar sadece çalışma saatleri içinde yapılabilir.
                        </p>
                    </div>
                </div>
            </div>

            {/* Sistem İsmi Değiştirme Modal */}
            {showSystemNameModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    zIndex: 10000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        backgroundColor: colors.card,
                        padding: '2rem',
                        borderRadius: '15px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        maxWidth: '500px',
                        width: '90%',
                        border: `2px solid ${colors.border}`
                    }}>
                        <h3 style={{
                            color: colors.text,
                            marginBottom: '20px',
                            fontSize: '1.3rem',
                            textAlign: 'center'
                        }}>
                            🖥️ Sistem İsmi Değiştir
                        </h3>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Yeni Sistem İsmi:</label>
                            <input
                                type="text"
                                value={tempSystemName}
                                onChange={(e) => setTempSystemName(e.target.value)}
                                placeholder="Sistem ismini girin..."
                                style={styles.input}
                                autoFocus
                            />
                        </div>
                        <div style={{
                            display: 'flex',
                            gap: '15px',
                            justifyContent: 'center',
                            marginTop: '25px'
                        }}>
                            <button
                                onClick={() => setShowSystemNameModal(false)}
                                style={{
                                    background: colors.border,
                                    color: colors.text,
                                    border: 'none',
                                    padding: '12px 25px',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    fontWeight: '500'
                                }}
                            >
                                ❌ İptal
                            </button>
                            <button
                                onClick={saveSystemName}
                                style={{
                                    background: colors.primary,
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 25px',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    fontWeight: '500'
                                }}
                            >
                                ✅ Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Restoran İsmi Değiştirme Modal */}
            {showNameModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    zIndex: 10000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        backgroundColor: colors.card,
                        padding: '2rem',
                        borderRadius: '15px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        maxWidth: '500px',
                        width: '90%',
                        border: `2px solid ${colors.border}`
                    }}>
                        <h3 style={{
                            color: colors.text,
                            marginBottom: '20px',
                            fontSize: '1.3rem',
                            textAlign: 'center'
                        }}>
                            📝 Restoran İsmi Değiştir
                        </h3>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Yeni Restoran İsmi:</label>
                            <input
                                type="text"
                                value={tempRestaurantName}
                                onChange={(e) => setTempRestaurantName(e.target.value)}
                                placeholder="Restoran ismini girin..."
                                style={styles.input}
                                autoFocus
                            />
                        </div>
                        <div style={{
                            display: 'flex',
                            gap: '15px',
                            justifyContent: 'center',
                            marginTop: '25px'
                        }}>
                            <button
                                onClick={() => setShowNameModal(false)}
                                style={{
                                    background: colors.border,
                                    color: colors.text,
                                    border: 'none',
                                    padding: '12px 25px',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    fontWeight: '500'
                                }}
                            >
                                ❌ İptal
                            </button>
                            <button
                                onClick={saveRestaurantName}
                                style={{
                                    background: colors.primary,
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 25px',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    fontWeight: '500'
                                }}
                            >
                                ✅ Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Uyarı Modal */}
            <WarningModal
                visible={showWarningModal}
                message={warningMessage}
                onClose={() => setShowWarningModal(false)}
            />
        </div>
    );
};

export default RestaurantSettings;
