import React, { useState, useEffect, useContext } from 'react';
import { useTheme } from '../../context/ThemeContext';
import WarningModal from '../../components/common/WarningModal';
import { settingsService } from '../../services/settingsService';

const RestaurantSettings = () => {
    const { isDarkMode, colors } = useTheme();
    const [restaurantName, setRestaurantName] = useState('Restoran Yönetim Sistemi');
    const [openingTime, setOpeningTime] = useState('09:00');
    const [closingTime, setClosingTime] = useState('22:00');
    const [lastReservationCutoffMinutes, setLastReservationCutoffMinutes] = useState(180); // Default 3 hours
    const [showNameModal, setShowNameModal] = useState(false);
    const [tempRestaurantName, setTempRestaurantName] = useState('');
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [isInitializing, setIsInitializing] = useState(true);
    const [isSavingTimes, setIsSavingTimes] = useState(false);
    const [timeSaveError, setTimeSaveError] = useState('');

    // Load settings from backend on component mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                setIsInitializing(true);
                const settings = await settingsService.getRestaurantSettings();
                
                if (settings.restaurantName) {
                    setRestaurantName(settings.restaurantName);
                    localStorage.setItem('restaurantName', settings.restaurantName);
                    // Update TopNav via custom event
                    window.dispatchEvent(new CustomEvent('restaurantNameChanged', {
                        detail: { name: settings.restaurantName }
                    }));
                }
                
                if (settings.openTime) {
                    setOpeningTime(settings.openTime);
                    localStorage.setItem('openingTime', settings.openTime);
                }
                
                if (settings.closeTime) {
                    setClosingTime(settings.closeTime);
                    localStorage.setItem('closingTime', settings.closeTime);
                }

                if (settings.lastReservationCutoffMinutes) {
                    setLastReservationCutoffMinutes(settings.lastReservationCutoffMinutes);
                    localStorage.setItem('lastReservationCutoffMinutes', settings.lastReservationCutoffMinutes);
                }
            } catch (error) {
                console.error('Error loading settings:', error);
                // Fallback to localStorage if API fails
                const cachedName = localStorage.getItem('restaurantName');
                const cachedOpening = localStorage.getItem('openingTime');
                const cachedClosing = localStorage.getItem('closingTime');
                const cachedCutoff = localStorage.getItem('lastReservationCutoffMinutes');
                
                if (cachedName) setRestaurantName(cachedName);
                if (cachedOpening) setOpeningTime(cachedOpening);
                if (cachedClosing) setClosingTime(cachedClosing);
                if (cachedCutoff) setLastReservationCutoffMinutes(parseInt(cachedCutoff) || 180);
            } finally {
                setIsInitializing(false);
            }
        };

        loadSettings();
    }, []);

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
    const handleOpeningTimeChange = async (newTime) => {
        if (validateTime(newTime, closingTime)) {
            setOpeningTime(newTime);
            localStorage.setItem('openingTime', newTime);
            
            // Save to backend
            await saveTimeSettings({ openTime: newTime });
        } else {
            setWarningMessage('Açılış saati kapanış saatinden sonra olamaz!');
            setShowWarningModal(true);
        }
    };

    // Kapanış saati değiştiğinde
    const handleClosingTimeChange = async (newTime) => {
        if (validateTime(openingTime, newTime)) {
            setClosingTime(newTime);
            localStorage.setItem('closingTime', newTime);
            
            // Save to backend
            await saveTimeSettings({ closeTime: newTime });
        } else {
            setWarningMessage('Kapanış saati açılış saatinden önce olamaz!');
            setShowWarningModal(true);
        }
    };

    // Son rezervasyon cutoff süresini değiştir
    const handleCutoffChange = async (newCutoffMinutes) => {
        if (newCutoffMinutes >= 0 && newCutoffMinutes <= 1440) { // Max 24 hours
            setLastReservationCutoffMinutes(newCutoffMinutes);
            localStorage.setItem('lastReservationCutoffMinutes', newCutoffMinutes);
            
            // Save to backend
            await saveTimeSettings({ lastReservationCutoffMinutes: newCutoffMinutes });
        } else {
            setWarningMessage('Son rezervasyon cutoff süresi 0-1440 dakika arasında olmalıdır!');
            setShowWarningModal(true);
        }
    };

    // Time settings'i backend'e kaydet
    const saveTimeSettings = async (timeSettings) => {
        try {
            setIsSavingTimes(true);
            setTimeSaveError('');
            
            await settingsService.updateRestaurantSettings(timeSettings);

        } catch (error) {
            console.error('Error saving time settings:', error);
            setTimeSaveError('Zaman ayarları kaydedilirken bir hata oluştu: ' + error.message);
        } finally {
            setIsSavingTimes(false);
        }
    };

    // Restoran ismi değiştirme modalını aç
    const openNameModal = () => {
        setTempRestaurantName(restaurantName);
        setShowNameModal(true);
    };

    // Restoran ismini kaydet
    const saveRestaurantName = async () => {
        if (!tempRestaurantName.trim()) {
            return;
        }

        setIsLoading(true);
        setSaveError('');

        try {
            // Call API to update restaurant settings
            await settingsService.updateRestaurantSettings({
                restaurantName: tempRestaurantName.trim()
            });

            // Update local state and localStorage on success
            setRestaurantName(tempRestaurantName.trim());
            localStorage.setItem('restaurantName', tempRestaurantName.trim());
            
            // Update TopNav via custom event
            window.dispatchEvent(new CustomEvent('restaurantNameChanged', {
                detail: { name: tempRestaurantName.trim() }
            }));
            
            setShowNameModal(false);
        } catch (error) {
            console.error('Error saving restaurant name:', error);
            
            // Check if it's a network/API unavailable error
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                setSaveError('API bağlantısı kurulamadı. Lütfen backend servisinin çalıştığından emin olun.');
            } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                setSaveError('Yetkilendirme hatası. Lütfen tekrar giriş yapın.');
            } else if (error.message.includes('404') || error.message.includes('Not Found')) {
                setSaveError('API endpoint bulunamadı. Backend\'de /api/settings endpoint\'i tanımlanmalı.');
            } else {
                setSaveError(error.message || 'Restoran ismi kaydedilirken bir hata oluştu');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Son rezervasyon saatini hesapla (cutoff dakikasına göre)
    const getLastReservationTime = () => {
        const closingHour = parseInt(closingTime.split(':')[0]);
        const closingMinute = parseInt(closingTime.split(':')[1]);
        
        let totalMinutes = closingHour * 60 + closingMinute - lastReservationCutoffMinutes;
        if (totalMinutes < 0) totalMinutes = 0;
        
        const lastHour = Math.floor(totalMinutes / 60);
        const lastMinute = totalMinutes % 60;
        
        return `${lastHour.toString().padStart(2, '0')}:${lastMinute.toString().padStart(2, '0')}`;
    };

    // Cutoff dakikasını saat:dakika formatında göster
    const formatCutoffTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    // Saat:dakika formatındaki string'i dakikaya çevir
    const parseTimeToMinutes = (timeString) => {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
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

            {isInitializing ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '200px',
                    fontSize: '1.2rem',
                    color: colors.textSecondary
                }}>
                    ⏳ Ayarlar yükleniyor...
                </div>
            ) : (
                <div style={styles.settingsContainer}>
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
                        
                        {timeSaveError && (
                            <div style={{
                                backgroundColor: '#fee',
                                color: '#c33',
                                padding: '10px',
                                borderRadius: '8px',
                                marginBottom: '15px',
                                border: '1px solid #fcc'
                            }}>
                                ❌ {timeSaveError}
                            </div>
                        )}
                        
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Açılış Saati:</label>
                            <input
                                type="time"
                                value={openingTime}
                                onChange={(e) => handleOpeningTimeChange(e.target.value)}
                                style={styles.timeInput}
                                disabled={isSavingTimes}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Kapanış Saati:</label>
                            <input
                                type="time"
                                value={closingTime}
                                onChange={(e) => handleClosingTimeChange(e.target.value)}
                                style={styles.timeInput}
                                disabled={isSavingTimes}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Son Rezervasyon Kesim Süresi:</label>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <input
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={Math.floor(lastReservationCutoffMinutes / 60)}
                                    onChange={(e) => {
                                        const hours = parseInt(e.target.value) || 0;
                                        const minutes = lastReservationCutoffMinutes % 60;
                                        const totalMinutes = hours * 60 + minutes;
                                        handleCutoffChange(totalMinutes);
                                    }}
                                    style={{
                                        ...styles.timeInput,
                                        width: '80px',
                                        textAlign: 'center'
                                    }}
                                    disabled={isSavingTimes}
                                    placeholder="0"
                                />
                                <span style={{ color: colors.text, fontWeight: '500' }}>:</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={lastReservationCutoffMinutes % 60}
                                    onChange={(e) => {
                                        const minutes = parseInt(e.target.value) || 0;
                                        const hours = Math.floor(lastReservationCutoffMinutes / 60);
                                        const totalMinutes = hours * 60 + minutes;
                                        handleCutoffChange(totalMinutes);
                                    }}
                                    style={{
                                        ...styles.timeInput,
                                        width: '80px',
                                        textAlign: 'center'
                                    }}
                                    disabled={isSavingTimes}
                                    placeholder="00"
                                />
                                <span style={{ 
                                    color: colors.textSecondary, 
                                    fontSize: '14px',
                                    marginLeft: '10px'
                                }}>
                                    saat : dakika
                                </span>
                            </div>
                            <div style={{
                                fontSize: '12px',
                                color: colors.textSecondary,
                                marginTop: '5px',
                                fontStyle: 'italic'
                            }}>
                                Kapanış saatinden ne kadar önce son rezervasyon alınacağını belirler
                            </div>
                        </div>
                        <div style={styles.infoBox}>
                            <p style={styles.infoText}>
                                ⏰ <strong>Açılış:</strong> {openingTime} | <strong>Kapanış:</strong> {closingTime}
                            </p>
                            <p style={styles.infoText}>
                                📅 <strong>Son Rezervasyon Saati:</strong> {getLastReservationTime()} 
                                (Kapanıştan {formatCutoffTime(lastReservationCutoffMinutes)} önce)
                            </p>
                            <p style={styles.infoText}>
                                💡 Rezervasyonlar sadece çalışma saatleri içinde yapılabilir.
                            </p>
                        </div>
                    </div>

                    {/* Remove the separate cutoff card since it's now integrated above */}

                </div>
            )}


            {/* Restoran İsmi Değiştirme Modal */}
            {showNameModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: colors.card,
                        padding: '30px',
                        borderRadius: '15px',
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
                        
                        {saveError && (
                            <div style={{
                                backgroundColor: '#fee',
                                color: '#c33',
                                padding: '10px',
                                borderRadius: '8px',
                                marginBottom: '15px',
                                border: '1px solid #fcc'
                            }}>
                                ❌ {saveError}
                            </div>
                        )}
                        
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Yeni Restoran İsmi:</label>
                            <input
                                type="text"
                                value={tempRestaurantName}
                                onChange={(e) => setTempRestaurantName(e.target.value)}
                                placeholder="Restoran ismini girin..."
                                style={styles.input}
                                autoFocus
                                disabled={isLoading}
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
                                disabled={isLoading}
                                style={{
                                    background: colors.border,
                                    color: colors.text,
                                    border: 'none',
                                    padding: '12px 25px',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s ease',
                                    fontWeight: '500',
                                    opacity: isLoading ? 0.6 : 1
                                }}
                            >
                                ❌ İptal
                            </button>
                            <button
                                onClick={saveRestaurantName}
                                disabled={isLoading}
                                style={{
                                    background: isLoading ? '#999' : colors.primary,
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 25px',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s ease',
                                    fontWeight: '500',
                                    opacity: isLoading ? 0.6 : 1
                                }}
                            >
                                {isLoading ? '⏳ Kaydediliyor...' : '✅ Kaydet'}
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
