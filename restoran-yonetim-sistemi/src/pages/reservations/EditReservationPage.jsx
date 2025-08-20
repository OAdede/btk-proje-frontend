import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TableContext } from '../../context/TableContext';
import { useTheme } from '../../context/ThemeContext';

const EditReservationPage = () => {
    const { reservationId } = useParams();
    const navigate = useNavigate();
    const { reservations, updateReservation } = useContext(TableContext);
    const { isDarkMode, colors } = useTheme();
    
    const [formData, setFormData] = useState({
        ad: '',
        soyad: '',
        telefon: '',
        tarih: '',
        saat: '',
        kisiSayisi: '',
        not: ''
    });

    const [errors, setErrors] = useState({});

    // Mevcut rezervasyon verilerini yükle
    useEffect(() => {
        console.log('EditReservationPage - reservationId:', reservationId);
        console.log('EditReservationPage - reservations:', reservations);
        console.log('EditReservationPage - target reservation:', reservations[reservationId]);
        
        if (reservations[reservationId]) {
            const reservation = reservations[reservationId];
            console.log('EditReservationPage - loading reservation data:', reservation);
            
            setFormData({
                ad: reservation.ad || '',
                soyad: reservation.soyad || '',
                telefon: reservation.telefon || '',
                tarih: reservation.tarih || '',
                saat: reservation.saat || '',
                kisiSayisi: reservation.kisiSayisi || '',
                not: reservation.not || ''
            });
        } else {
            console.log('EditReservationPage - reservation not found for reservationId:', reservationId);
        }
    }, [reservationId, reservations]);

    // Telefon numarası formatlaması
    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 0 && value[0] !== '5') {
            value = '5' + value.substring(1);
        }
        
        if (value.length > 0) {
            value = value.substring(0, 11);
            if (value.length >= 3) {
                value = value.substring(0, 3) + ' ' + value.substring(3);
            }
            if (value.length >= 7) {
                value = value.substring(0, 7) + ' ' + value.substring(7);
            }
            if (value.length >= 10) {
                value = value.substring(0, 10) + ' ' + value.substring(10);
            }
        }
        
        setFormData(prev => ({ ...prev, telefon: value }));
    };

    // Form değişikliklerini handle et
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'telefon') {
            handlePhoneChange(e);
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        
        // Hata mesajını temizle
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Form validasyonu
    const validateForm = () => {
        const newErrors = {};

        if (!formData.ad.trim()) newErrors.ad = 'Ad gereklidir';
        if (!formData.soyad.trim()) newErrors.soyad = 'Soyad gereklidir';
        
        if (!formData.telefon.trim()) {
            newErrors.telefon = 'Telefon numarası gereklidir';
        } else if (!/^5\d{2} \d{3} \d{2} \d{2}$/.test(formData.telefon)) {
            newErrors.telefon = 'Geçerli telefon formatı: 5XX XXX XX XX';
        }

        if (!formData.tarih) {
            newErrors.tarih = 'Tarih gereklidir';
        } else {
            const selectedDate = new Date(formData.tarih);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                newErrors.tarih = 'Geçmiş tarih seçilemez';
            }
        }

        if (!formData.saat) {
            newErrors.saat = 'Saat gereklidir';
        } else if (formData.tarih) {
            const selectedDate = new Date(formData.tarih);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate.getTime() === today.getTime()) {
                const currentTime = new Date();
                const selectedTime = new Date(`2000-01-01T${formData.saat}`);
                
                if (selectedTime < currentTime) {
                    newErrors.saat = 'Geçmiş saat seçilemez';
                }
            }
        }

        if (!formData.kisiSayisi) {
            newErrors.kisiSayisi = 'Kişi sayısı gereklidir';
        } else if (parseInt(formData.kisiSayisi) < 1) {
            newErrors.kisiSayisi = 'Kişi sayısı en az 1 olmalıdır';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Form gönderimi
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            // Rezervasyonu güncelle
            updateReservation(reservationId, formData);
            
            // Başarı mesajı göster ve sayfaya geri dön - DEVRE DIŞI
            // alert('✅ Rezervasyon başarıyla güncellendi!');
            navigate('/admin/reservations');
        }
    };

    // Stiller
    const styles = {
        page: {
            padding: "20px",
            minHeight: "100vh",
            backgroundColor: isDarkMode ? colors.background : "#f5f5f5"
        },
        container: {
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: colors.card,
            borderRadius: "15px",
            padding: "30px",
            boxShadow: isDarkMode ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.1)",
            border: `1px solid ${colors.border}`
        },
        title: {
            fontSize: "2rem",
            color: colors.text,
            fontWeight: 600,
            marginBottom: "30px",
            textAlign: "center"
        },
        form: {
            display: "flex",
            flexDirection: "column",
            gap: "20px"
        },
        formGroup: {
            display: "flex",
            flexDirection: "column",
            gap: "8px"
        },
        label: {
            fontSize: "1rem",
            fontWeight: 500,
            color: colors.text
        },
        input: {
            padding: "12px",
            borderRadius: "8px",
            border: `1px solid ${colors.border}`,
            fontSize: "1rem",
            backgroundColor: colors.background,
            color: colors.text,
            outline: "none"
        },
        error: {
            color: colors.danger,
            fontSize: "0.9rem",
            marginTop: "4px"
        },
        buttonGroup: {
            display: "flex",
            gap: "15px",
            marginTop: "20px"
        },
        saveButton: {
            flex: 1,
            padding: "12px 24px",
            backgroundColor: colors.success,
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.3s ease"
        },
        cancelButton: {
            flex: 1,
            padding: "12px 24px",
            backgroundColor: colors.danger,
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.3s ease"
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <h1 style={styles.title}>✏️ Rezervasyon Düzenle</h1>
                
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Ad *</label>
                        <input
                            type="text"
                            name="ad"
                            value={formData.ad}
                            onChange={handleChange}
                            style={{
                                ...styles.input,
                                borderColor: errors.ad ? colors.danger : colors.border
                            }}
                            placeholder="Müşteri adı"
                        />
                        {errors.ad && <div style={styles.error}>{errors.ad}</div>}
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Soyad *</label>
                        <input
                            type="text"
                            name="soyad"
                            value={formData.soyad}
                            onChange={handleChange}
                            style={{
                                ...styles.input,
                                borderColor: errors.soyad ? colors.danger : colors.border
                            }}
                            placeholder="Müşteri soyadı"
                        />
                        {errors.soyad && <div style={styles.error}>{errors.soyad}</div>}
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Telefon *</label>
                        <input
                            type="text"
                            name="telefon"
                            value={formData.telefon}
                            onChange={handleChange}
                            style={{
                                ...styles.input,
                                borderColor: errors.telefon ? colors.danger : colors.border
                            }}
                            placeholder="5XX XXX XX XX"
                            maxLength="13"
                        />
                        {errors.telefon && <div style={styles.error}>{errors.telefon}</div>}
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Tarih *</label>
                        <input
                            type="date"
                            name="tarih"
                            value={formData.tarih}
                            onChange={handleChange}
                            style={{
                                ...styles.input,
                                borderColor: errors.tarih ? colors.danger : colors.border
                            }}
                            min={new Date().toISOString().split('T')[0]}
                        />
                        {errors.tarih && <div style={styles.error}>{errors.tarih}</div>}
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Saat *</label>
                        <input
                            type="time"
                            name="saat"
                            value={formData.saat}
                            onChange={handleChange}
                            style={{
                                ...styles.input,
                                borderColor: errors.saat ? colors.danger : colors.border
                            }}
                            disabled={!formData.tarih}
                        />
                        {errors.saat && <div style={styles.error}>{errors.saat}</div>}
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Kişi Sayısı *</label>
                        <input
                            type="number"
                            name="kisiSayisi"
                            value={formData.kisiSayisi}
                            onChange={handleChange}
                            style={{
                                ...styles.input,
                                borderColor: errors.kisiSayisi ? colors.danger : colors.border
                            }}
                            placeholder="Kaç kişi?"
                            min="1"
                            max="20"
                        />
                        {errors.kisiSayisi && <div style={styles.error}>{errors.kisiSayisi}</div>}
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Not</label>
                        <textarea
                            name="not"
                            value={formData.not}
                            onChange={handleChange}
                            style={{
                                ...styles.input,
                                minHeight: "80px",
                                resize: "vertical"
                            }}
                            placeholder="Özel istekler, notlar..."
                        />
                    </div>

                    <div style={styles.buttonGroup}>
                        <button
                            type="button"
                            onClick={() => navigate('/admin/reservations')}
                            style={styles.cancelButton}
                        >
                            ❌ İptal
                        </button>
                        <button
                            type="submit"
                            style={styles.saveButton}
                        >
                            💾 Kaydet
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditReservationPage;
