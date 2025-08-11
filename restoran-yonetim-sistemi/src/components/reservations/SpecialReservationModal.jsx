import React, { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

export default function SpecialReservationModal({ visible, onClose, onSubmit, defaultDate, existingReservations = [], shouldClearForm = true }) {
  const { isDarkMode } = useContext(ThemeContext);
  const [formData, setFormData] = useState({
    ad: "",
    soyad: "",
    telefon: "",
    email: "",
    tarih: defaultDate || "",
    saat: "",
    personCount: "",
    selectedFloor: null,
    reservationReason: "",
    wholeFloorOption: false,
    floorClosingHours: "4", // Varsayılan 4 saat
    floorClosingAllDay: false, // Tüm gün seçeneği
    specialRequests: "",
    adSoyad: "" // Ad ve soyad birleşimi için
  });

  // Maksimum kat kapatma süresini hesapla
  const getMaxFloorClosingHours = () => {
    if (!formData.saat || !formData.tarih) return 8;
    
    const closingTime = localStorage.getItem('closingTime') || '22:00';
    const [closingHour, closingMinute] = closingTime.split(':').map(Number);
    const [reservationHour, reservationMinute] = formData.saat.split(':').map(Number);
    
    // Rezervasyon saatini dakika cinsinden hesapla
    const reservationTimeInMinutes = reservationHour * 60 + reservationMinute;
    // Kapanış saatini dakika cinsinden hesapla
    const closingTimeInMinutes = closingHour * 60 + closingMinute;
    
    // Maksimum süre = kapanış saati - rezervasyon saati
    const maxHours = Math.floor((closingTimeInMinutes - reservationTimeInMinutes) / 60);
    
    // En az 1 saat, en fazla 8 saat
    return Math.max(1, Math.min(maxHours, 8));
  };

  // Fiyat hesaplama
  const calculatePrice = () => {
    let basePrice = 0;
    let additionalPrice = 0;
    
    // Kişi başına ücret (10+ kişi için): 100₺
    const personCount = parseInt(formData.personCount) || 0;
    if (personCount >= 10) {
      basePrice = personCount * 100; // Kişi başına 100₺
    }
    
    // Tüm katı kapatma seçeneği
    if (formData.wholeFloorOption && formData.selectedFloor !== null && formData.selectedFloor !== "") {
      if (formData.floorClosingAllDay) {
        // Tüm gün: 8000₺ (8 saat x 1000₺)
        additionalPrice = 8000;
      } else {
        // Saatlik ücret: 1000₺/saat
        const hours = parseInt(formData.floorClosingHours) || 4;
        additionalPrice = hours * 1000;
      }
    }
    
    return {
      basePrice,
      additionalPrice,
      totalPrice: basePrice + additionalPrice
    };
  };

  const priceInfo = calculatePrice();

  // Tarih alanını otomatik doldur
  useEffect(() => {
    if (defaultDate) {
      setFormData(prev => ({ ...prev, tarih: defaultDate }));
    }
  }, [defaultDate]);



  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'telefon') {
      // Sadece rakamları al
      const numbers = value.replace(/\D/g, '');
      
      // İlk rakam 5 değilse kabul etme
      if (numbers.length > 0 && numbers[0] !== '5') {
        return;
      }
      
      // Maksimum 10 rakam
      if (numbers.length > 10) {
        return;
      }
      
      // Format: 5XX XXX XX XX
      let formatted = '';
      if (numbers.length > 0) {
        formatted = numbers[0];
        if (numbers.length > 1) {
          formatted += numbers[1];
          if (numbers.length > 2) {
            formatted += numbers[2];
            if (numbers.length > 3) {
              formatted += ' ' + numbers[3];
              if (numbers.length > 4) {
                formatted += numbers[4];
                if (numbers.length > 5) {
                  formatted += numbers[5];
                  if (numbers.length > 6) {
                    formatted += ' ' + numbers[6];
                    if (numbers.length > 7) {
                      formatted += numbers[7];
                      if (numbers.length > 8) {
                        formatted += ' ' + numbers[8];
                        if (numbers.length > 9) {
                          formatted += numbers[9];
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } else if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      // Ad veya soyad değiştiğinde adSoyad alanını güncelle ve büyük harf yap
      if (name === 'ad' || name === 'soyad') {
        setFormData((prev) => {
          const newData = { ...prev, [name]: value };
          // İsim ve soyismin baş harflerini büyük yap
          const capitalizedAd = newData.ad.charAt(0).toUpperCase() + newData.ad.slice(1).toLowerCase();
          const capitalizedSoyad = newData.soyad.charAt(0).toUpperCase() + newData.soyad.slice(1).toLowerCase();
          newData.ad = capitalizedAd;
          newData.soyad = capitalizedSoyad;
          newData.adSoyad = `${capitalizedAd} ${capitalizedSoyad}`.trim();
          return newData;
        });
        return;
      }
      
      // Eğer kat seçimi değişiyorsa, tüm katı kapatma seçeneğini sıfırla
      if (name === 'selectedFloor') {
        setFormData((prev) => ({ 
          ...prev, 
          [name]: value,
          wholeFloorOption: false 
        }));
      } else if (name === 'saat') {
        // Saat değiştiğinde, kat kapatma süresini kontrol et ve gerekirse ayarla
        setFormData((prev) => {
          const newData = { ...prev, [name]: value };
          
          // Eğer kat kapatma seçeneği aktifse, süreleri kontrol et
          if (newData.wholeFloorOption) {
            // Maksimum süreyi hesapla (yeni saat ile)
            const closingTime = localStorage.getItem('closingTime') || '22:00';
            const [closingHour, closingMinute] = closingTime.split(':').map(Number);
            const [reservationHour, reservationMinute] = value.split(':').map(Number);
            
            const reservationTimeInMinutes = reservationHour * 60 + reservationMinute;
            const closingTimeInMinutes = closingHour * 60 + closingMinute;
            const maxHours = Math.max(1, Math.min(Math.floor((closingTimeInMinutes - reservationTimeInMinutes) / 60), 8));
            
            // Eğer tüm gün seçiliyse ama artık mümkün değilse, kapat
            if (newData.floorClosingAllDay && maxHours < 8) {
              newData.floorClosingAllDay = false;
              newData.floorClosingHours = maxHours.toString();
            }
            // Eğer saatlik seçiliyse ve süre aşılıyorsa, ayarla
            else if (!newData.floorClosingAllDay) {
              const currentHours = parseInt(newData.floorClosingHours) || 4;
              if (currentHours > maxHours) {
                newData.floorClosingHours = maxHours.toString();
              }
            }
          }
          
          return newData;
        });
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Telefon numarası validasyonu
    const phoneNumbers = formData.telefon.replace(/\D/g, '');
    if (phoneNumbers.length !== 10 || phoneNumbers[0] !== '5') {
      alert('Lütfen geçerli bir telefon numarası girin (5XX XXX XX XX formatında, 10 haneli)');
      return;
    }
    
    // E-mail validasyonu (eğer e-mail girilmişse)
    if (formData.email && (!formData.email.includes('@') || !formData.email.includes('.com'))) {
      alert('Lütfen geçerli bir e-mail adresi girin (@ ve .com içermeli)');
      return;
    }
    
    // Kişi sayısı validasyonu
    if (parseInt(formData.personCount) < 10) {
      alert('Özel rezervasyonlar için en az 10 kişi gereklidir. Lütfen kişi sayısını 10 veya daha fazla olarak ayarlayın.');
      return;
    }
    
    // Rezervasyon sebebi validasyonu
    if (!formData.reservationReason.trim()) {
      alert('Lütfen rezervasyon sebebini belirtin. Bu alan zorunludur ve özel rezervasyonunuzun amacını açıklamalıdır.');
      return;
    }
    
    // Tarih validasyonu - bugünden önceki tarihleri kabul etme
    const selectedDate = new Date(formData.tarih);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Bugünün başlangıcını al
    
    if (selectedDate < today) {
      alert('Geçmiş tarihler için rezervasyon yapılamaz. Lütfen bugün veya gelecek bir tarih seçin. Seçilen tarih: ' + formData.tarih);
      return;
    }
    
    // Saat validasyonu
    if (!formData.saat) {
      alert('Lütfen önce tarih seçin, sonra saat seçin.');
      return;
    }
    
    // Çalışma saatleri kontrolü
    const openingTime = localStorage.getItem('openingTime') || '09:00';
    const closingTime = localStorage.getItem('closingTime') || '22:00';
    const lastReservationTime = (() => {
      const closingHour = parseInt(closingTime.split(':')[0]);
      const closingMinute = parseInt(closingTime.split(':')[1]);
      let lastHour = closingHour - 3;
      if (lastHour < 0) lastHour = 0;
      return `${lastHour.toString().padStart(2, '0')}:${closingMinute.toString().padStart(2, '0')}`;
    })();

    const [selectedHours, selectedMinutes] = formData.saat.split(':');
    const selectedTimeTotal = parseInt(selectedHours) * 60 + parseInt(selectedMinutes);
    
    const [openingHours, openingMinutes] = openingTime.split(':');
    const openingTimeTotal = parseInt(openingHours) * 60 + parseInt(openingMinutes);
    
    const [lastResHours, lastResMinutes] = lastReservationTime.split(':');
    const lastResTimeTotal = parseInt(lastResHours) * 60 + parseInt(lastResMinutes);

    // Açılış saatinden önce rezervasyon yapılamaz
    if (selectedTimeTotal < openingTimeTotal) {
      alert(`Rezervasyon sadece açılış saatinden (${openingTime}) sonra yapılabilir. Seçilen saat: ${formData.saat}`);
      return;
    }

    // Son rezervasyon saatinden sonra rezervasyon yapılamaz
    if (selectedTimeTotal > lastResTimeTotal) {
      alert(`Rezervasyon en geç ${lastReservationTime} saatine kadar yapılabilir. (Kapanıştan 3 saat önce) Seçilen saat: ${formData.saat}`);
      return;
    }

    // Bugün için saat kontrolü
    if (selectedDate.getTime() === today.getTime()) {
      const currentTime = new Date();
      const selectedTime = new Date();
      const [hours, minutes] = formData.saat.split(':');
      selectedTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      if (selectedTime <= currentTime) {
        const currentTimeStr = currentTime.toTimeString().slice(0, 5);
        alert(`Bugün için sadece şu anki saatten (${currentTimeStr}) sonraki saatler seçilebilir. Seçilen saat: ${formData.saat}`);
        return;
      }
    }
    
    // onSubmit'i çağır
    onSubmit(formData);
    
    // Form temizleme
    setFormData({
      ad: "",
      soyad: "",
      telefon: "",
      email: "",
      tarih: defaultDate || "",
      saat: "",
      personCount: "",
      selectedFloor: null,
      reservationReason: "",
      wholeFloorOption: false,
      floorClosingHours: "4",
      floorClosingAllDay: false,
      specialRequests: "",
      adSoyad: ""
    });
  };

  // Tema renklerini dinamik olarak belirle
  const colors = isDarkMode ? {
    modalBg: "#513653",
    modalBorder: "#473653",
    inputBg: "#32263A",
    inputBorder: "#473653",
    textColor: "#ffffff",
    labelColor: "#ffffff",
    submitButtonBg: "#473653",
    submitButtonBorder: "#513653",
    cancelButtonBg: "#32263A",
    cancelButtonBorder: "#473653",
    overlayBg: "rgba(0,0,0,0.7)",
    specialButtonBg: "#8B4513",
    specialButtonBorder: "#FFD700",
    border: "#473653"
  } : {
    modalBg: "#F5EFFF",
    modalBorder: "#CDC1FF",
    inputBg: "#E5D9F2",
    inputBorder: "#A294F9",
    textColor: "#2D1B69",
    labelColor: "#4A3B76",
    submitButtonBg: "#A294F9",
    submitButtonBorder: "#CDC1FF",
    cancelButtonBg: "#E5D9F2",
    cancelButtonBorder: "#A294F9",
    overlayBg: "rgba(0,0,0,0.5)",
    specialButtonBg: "#D2691E",
    specialButtonBorder: "#FFD700",
    border: "#A294F9"
  };

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: colors.overlayBg,
      zIndex: 9998,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        backgroundColor: colors.modalBg,
        padding: "2rem",
        borderRadius: "15px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        zIndex: 9999,
        maxWidth: "600px",
        width: "90%",
        maxHeight: "90vh",
        overflowY: "auto",
        border: `2px solid ${colors.modalBorder}`
      }}>
        <h2 style={{ 
          marginBottom: '20px', 
          color: colors.textColor,
          textAlign: 'center'
        }}>
          🎉 Özel Rezervasyon (10+ Kişi)
        </h2>

        <div style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: isDarkMode ? '#473653' : '#E5D9F2',
          borderRadius: '10px',
          border: `1px solid ${colors.specialButtonBorder}`,
          textAlign: 'center'
        }}>
          <h3 style={{
            color: colors.textColor,
            fontSize: '16px',
            marginBottom: '10px',
            fontWeight: 'bold'
          }}>
            💡 Özel Rezervasyon Özellikleri:
          </h3>
          <div style={{
            color: colors.labelColor,
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            • 10+ kişilik gruplar için otomatik masa ataması<br/>
            • Kişi başına 100₺ ücret<br/>
            • Kat seçimi imkanı<br/>
            • Tüm katı kapatma seçeneği (1000₺/saat veya 8000₺/gün)<br/>
            • Özel rezervasyon sebebi belirtme
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px", flex: 1 }}>
              <label style={{ 
                fontWeight: "bold", 
                color: colors.labelColor, 
                fontSize: "14px" 
              }}>
                Ad:
              </label>
              <input
                type="text"
                name="ad"
                placeholder="Ad"
                value={formData.ad}
                onChange={handleChange}
                required
                style={{
                  padding: "12px",
                  border: `2px solid ${colors.inputBorder}`,
                  borderRadius: "8px",
                  fontSize: "14px",
                  transition: "border-color 0.3s ease",
                  outline: "none",
                  backgroundColor: colors.inputBg,
                  color: colors.textColor
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px", flex: 1 }}>
              <label style={{ 
                fontWeight: "bold", 
                color: colors.labelColor, 
                fontSize: "14px" 
              }}>
                Soyad:
              </label>
              <input
                type="text"
                name="soyad"
                placeholder="Soyad"
                value={formData.soyad}
                onChange={handleChange}
                required
                style={{
                  padding: "12px",
                  border: `2px solid ${colors.inputBorder}`,
                  borderRadius: "8px",
                  fontSize: "14px",
                  transition: "border-color 0.3s ease",
                  outline: "none",
                  backgroundColor: colors.inputBg,
                  color: colors.textColor
                }}
              />
            </div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ 
              fontWeight: "bold", 
              color: colors.labelColor, 
              fontSize: "14px" 
            }}>
              Telefon:
            </label>
                          <input
                type="tel"
                name="telefon"
                placeholder="5XX XXX XX XX"
                value={formData.telefon}
                onChange={handleChange}
                required
                maxLength="13"
              style={{
                padding: "12px",
                border: `2px solid ${colors.inputBorder}`,
                borderRadius: "8px",
                fontSize: "14px",
                transition: "border-color 0.3s ease",
                outline: "none",
                backgroundColor: colors.inputBg,
                color: colors.textColor
              }}
            />
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ 
              fontWeight: "bold", 
              color: colors.labelColor, 
              fontSize: "14px" 
            }}>
              E-mail (İsteğe bağlı):
            </label>
            <input
              type="email"
              name="email"
              placeholder="E-mail adresi"
              value={formData.email}
              onChange={handleChange}
              style={{
                padding: "12px",
                border: `2px solid ${colors.inputBorder}`,
                borderRadius: "8px",
                fontSize: "14px",
                transition: "border-color 0.3s ease",
                outline: "none",
                backgroundColor: colors.inputBg,
                color: colors.textColor
              }}
            />
          </div>
          
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px", flex: 1 }}>
              <label style={{ 
                fontWeight: "bold", 
                color: colors.labelColor, 
                fontSize: "14px" 
              }}>
                Tarih:
              </label>
              <input
                type="date"
                name="tarih"
                value={formData.tarih}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                style={{
                  padding: "12px",
                  border: `2px solid ${colors.inputBorder}`,
                  borderRadius: "8px",
                  fontSize: "14px",
                  transition: "border-color 0.3s ease",
                  outline: "none",
                  backgroundColor: colors.inputBg,
                  color: colors.textColor
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px", flex: 1 }}>
              <label style={{ 
                fontWeight: "bold", 
                color: colors.labelColor, 
                fontSize: "14px" 
              }}>
                Saat:
              </label>
              <input
                type="time"
                name="saat"
                value={formData.saat}
                onChange={handleChange}
                required
                disabled={!formData.tarih}
                min={(() => {
                  const openingTime = localStorage.getItem('openingTime') || '09:00';
                  if (formData.tarih === new Date().toISOString().split('T')[0]) {
                    const currentTime = new Date().toTimeString().slice(0, 5);
                    const currentTimeTotal = parseInt(currentTime.split(':')[0]) * 60 + parseInt(currentTime.split(':')[1]);
                    const openingTimeTotal = parseInt(openingTime.split(':')[0]) * 60 + parseInt(openingTime.split(':')[1]);
                    return currentTimeTotal > openingTimeTotal ? currentTime : openingTime;
                  }
                  return openingTime;
                })()}
                max={(() => {
                  const closingTime = localStorage.getItem('closingTime') || '22:00';
                  const closingHour = parseInt(closingTime.split(':')[0]);
                  const closingMinute = parseInt(closingTime.split(':')[1]);
                  let lastHour = closingHour - 3;
                  if (lastHour < 0) lastHour = 0;
                  return `${lastHour.toString().padStart(2, '0')}:${closingMinute.toString().padStart(2, '0')}`;
                })()}
                placeholder={formData.tarih ? 
                  (formData.tarih === new Date().toISOString().split('T')[0] ? 
                    "Bugün için uygun saat seçin" : "Saat seçin") : 
                  "Önce tarih seçin"}
                style={{
                  padding: "12px",
                  border: `2px solid ${colors.inputBorder}`,
                  borderRadius: "8px",
                  fontSize: "14px",
                  transition: "border-color 0.3s ease",
                  outline: "none",
                  backgroundColor: formData.tarih ? colors.inputBg : (isDarkMode ? "#2a2a2a" : "#f5f5f5"),
                  color: formData.tarih ? colors.textColor : (isDarkMode ? "#666666" : "#999999"),
                  cursor: formData.tarih ? "text" : "not-allowed"
                }}
              />
            </div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ 
              fontWeight: "bold", 
              color: colors.labelColor, 
              fontSize: "14px" 
            }}>
              Kişi Sayısı (En az 10):
            </label>
            <input
              type="number"
              name="personCount"
              placeholder="Kişi sayısı (min: 10)"
              value={formData.personCount}
              onChange={handleChange}
              required
              min="10"
              max="100"
              style={{
                padding: "12px",
                border: `2px solid ${colors.inputBorder}`,
                borderRadius: "8px",
                fontSize: "14px",
                transition: "border-color 0.3s ease",
                outline: "none",
                backgroundColor: colors.inputBg,
                color: colors.textColor
              }}
            />
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ 
              fontWeight: "bold", 
              color: colors.labelColor, 
              fontSize: "14px" 
            }}>
              Tercih Edilen Kat (İsteğe bağlı):
            </label>
            <select
              name="selectedFloor"
              value={formData.selectedFloor || ""}
              onChange={handleChange}
              style={{
                padding: "12px",
                border: `2px solid ${colors.inputBorder}`,
                borderRadius: "8px",
                fontSize: "14px",
                transition: "border-color 0.3s ease",
                outline: "none",
                backgroundColor: colors.inputBg,
                color: colors.textColor
              }}
            >
              <option value="">Tüm katlar (Otomatik masa ataması)</option>
              <option value="0">Zemin Kat (Giriş katı)</option>
              <option value="1">1. Kat (Orta kat)</option>
              <option value="2">2. Kat (Üst kat)</option>
            </select>
            <small style={{ color: colors.labelColor, fontSize: "12px", fontStyle: "italic" }}>
              Kat seçimi yaparsanız, tüm katı kapatma seçeneği aktif olur
            </small>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ 
              fontWeight: "bold", 
              color: colors.labelColor, 
              fontSize: "14px" 
            }}>
              Rezervasyon Sebebi (Zorunlu):
            </label>
            <input
              type="text"
              name="reservationReason"
              placeholder="Örn: Doğum günü partisi, iş toplantısı, düğün..."
              value={formData.reservationReason}
              onChange={handleChange}
              required
              style={{
                padding: "12px",
                border: `2px solid ${colors.inputBorder}`,
                borderRadius: "8px",
                fontSize: "14px",
                transition: "border-color 0.3s ease",
                outline: "none",
                backgroundColor: colors.inputBg,
                color: colors.textColor
              }}
            />
          </div>
          
                     {/* Fiyat Bilgisi */}
           {(parseInt(formData.personCount) || 0) >= 10 && (
             <div style={{
               padding: '15px',
               backgroundColor: isDarkMode ? '#2d4a3e' : '#e8f5e8',
               borderRadius: '10px',
               border: `2px solid ${isDarkMode ? '#4CAF50' : '#4CAF50'}`,
               marginBottom: '15px'
             }}>
               <h4 style={{
                 color: colors.textColor,
                 fontSize: '16px',
                 marginBottom: '10px',
                 fontWeight: 'bold',
                 textAlign: 'center'
               }}>
                 💰 Fiyat Bilgisi
               </h4>
               <div style={{
                 display: 'flex',
                 justifyContent: 'space-between',
                 marginBottom: '5px'
               }}>
                 <span style={{ color: colors.labelColor }}>Kişi başına ücret (100₺ × {parseInt(formData.personCount) || 0}):</span>
                 <span style={{ color: colors.textColor, fontWeight: 'bold' }}>{priceInfo.basePrice}₺</span>
               </div>
               {priceInfo.additionalPrice > 0 && (
                 <div style={{
                   display: 'flex',
                   justifyContent: 'space-between',
                   marginBottom: '5px'
                 }}>
                   <span style={{ color: colors.labelColor }}>
                     {formData.floorClosingAllDay ? 'Tüm gün kat kapatma ücreti:' : `Kat kapatma ücreti (${formData.floorClosingHours} saat):`}
                   </span>
                   <span style={{ color: colors.textColor, fontWeight: 'bold' }}>{priceInfo.additionalPrice}₺</span>
                 </div>
               )}
               <div style={{
                 display: 'flex',
                 justifyContent: 'space-between',
                 borderTop: `1px solid ${colors.border}`,
                 paddingTop: '5px',
                 marginTop: '5px'
               }}>
                 <span style={{ color: colors.textColor, fontWeight: 'bold' }}>Toplam Ücret:</span>
                 <span style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: '18px' }}>{priceInfo.totalPrice}₺</span>
               </div>
             </div>
           )}

                     <div style={{
            padding: '15px',
            backgroundColor: isDarkMode ? '#473653' : '#E5D9F2',
            borderRadius: '10px',
            border: `2px solid ${colors.specialButtonBorder}`,
            opacity: formData.selectedFloor !== null && formData.selectedFloor !== "" ? 1 : 0.6
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <input
                type="checkbox"
                name="wholeFloorOption"
                checked={formData.wholeFloorOption}
                onChange={handleChange}
                disabled={formData.selectedFloor === null || formData.selectedFloor === ""}
                style={{
                  width: '20px',
                  height: '20px',
                  accentColor: colors.specialButtonBg
                }}
              />
              <label style={{ 
                fontWeight: "bold", 
                color: colors.textColor, 
                fontSize: "16px" 
              }}>
                🏢 Tüm Katı Kapatma Seçeneği
              </label>
            </div>
            
            {formData.wholeFloorOption && formData.selectedFloor !== null && formData.selectedFloor !== "" && (
              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: isDarkMode ? '#32263A' : '#CBC3E3', borderRadius: '8px' }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                   <input
                     type="checkbox"
                     name="floorClosingAllDay"
                     checked={formData.floorClosingAllDay}
                     onChange={handleChange}
                     disabled={getMaxFloorClosingHours() < 8}
                     style={{
                       width: '18px',
                       height: '18px',
                       accentColor: colors.specialButtonBg,
                       opacity: getMaxFloorClosingHours() < 8 ? 0.5 : 1
                     }}
                   />
                   <label style={{ 
                     fontWeight: "bold", 
                     color: getMaxFloorClosingHours() < 8 ? '#999999' : colors.textColor, 
                     fontSize: "14px" 
                   }}>
                     🌅 Tüm Gün (8000₺)
                     {getMaxFloorClosingHours() < 8 && ' - Kullanılamaz'}
                   </label>
                 </div>
                
                                 {!formData.floorClosingAllDay && (
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                     <label style={{ 
                       color: colors.labelColor, 
                       fontSize: "14px",
                       minWidth: '120px'
                     }}>
                       Kapatma Süresi:
                     </label>
                     <select
                       name="floorClosingHours"
                       value={formData.floorClosingHours}
                       onChange={handleChange}
                       style={{
                         padding: "8px",
                         border: `2px solid ${colors.inputBorder}`,
                         borderRadius: "6px",
                         fontSize: "14px",
                         backgroundColor: colors.inputBg,
                         color: colors.textColor,
                         minWidth: '100px'
                       }}
                     >
                       {[1, 2, 3, 4, 5, 6, 7, 8].map(hours => {
                         const maxHours = getMaxFloorClosingHours();
                         const isDisabled = hours > maxHours;
                         return (
                           <option 
                             key={hours} 
                             value={hours}
                             disabled={isDisabled}
                             style={{
                               color: isDisabled ? '#999999' : colors.textColor,
                               backgroundColor: isDisabled ? '#f5f5f5' : colors.inputBg
                             }}
                           >
                             {hours} Saat ({hours * 1000}₺)
                             {isDisabled && ' - Kullanılamaz'}
                           </option>
                         );
                       })}
                     </select>
                   </div>
                 )}
              </div>
            )}
            
            <div style={{
              color: colors.labelColor,
              fontSize: '14px',
              fontStyle: 'italic',
              marginTop: '10px'
            }}>
              {formData.selectedFloor !== null && formData.selectedFloor !== "" 
                ? "Bu seçenek işaretlenirse, seçilen katın tüm masaları sadece sizin grubunuz için ayrılır. Ek ücret uygulanır."
                : "Bu seçenek için önce bir kat seçmelisiniz."
              }
            </div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ 
              fontWeight: "bold", 
              color: colors.labelColor, 
              fontSize: "14px" 
            }}>
              Özel İstekler (İsteğe bağlı):
            </label>
            <textarea
              name="specialRequests"
              placeholder="Özel dekorasyon, menü tercihleri, özel servis istekleri..."
              value={formData.specialRequests}
              onChange={handleChange}
              style={{
                padding: "12px",
                border: `2px solid ${colors.inputBorder}`,
                borderRadius: "8px",
                fontSize: "14px",
                transition: "border-color 0.3s ease",
                outline: "none",
                backgroundColor: colors.inputBg,
                color: colors.textColor,
                minHeight: '80px',
                resize: 'vertical'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" style={{
              background: colors.specialButtonBg,
              color: "white",
              border: `2px solid ${colors.specialButtonBorder}`,
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              flex: 1,
              transition: "all 0.3s ease"
            }}>
              🎉 Özel Rezervasyon Oluştur ({priceInfo.totalPrice}₺)
            </button>
            <button type="button" onClick={onClose} style={{
              background: colors.cancelButtonBg,
              color: colors.textColor,
              border: `2px solid ${colors.cancelButtonBorder}`,
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              flex: 1,
              transition: "all 0.3s ease"
            }}>
              ❌ İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
