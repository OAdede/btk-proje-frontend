import React, { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

export default function ReservationModal({ visible, masaNo, onClose, onSubmit, defaultDate, existingReservations = [], shouldClearForm = true }) {
  const { isDarkMode } = useContext(ThemeContext);
  
  // Bugünün tarihini al
  const getTodayDate = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}`;
  };

   const [formData, setFormData] = useState({
    ad: "",
    soyad: "",
    telefon: "",
    email: "",
    tarih: getTodayDate(),
    saat: "12:00",
    kisiSayisi: "2", // Keep consistent with backend expectation
    not: "",
  });
  // Masa kapasitesini al
  const getTableCapacity = (tableNumber) => {
    if (!tableNumber) return 4;
    const capacities = JSON.parse(localStorage.getItem('tableCapacities') || '{}');
    return capacities[tableNumber] || 4;
  };

  const tableCapacity = getTableCapacity(masaNo);

  // Form alanlarını güncelle
  const handleInputChange = (field, value) => {
    console.log(`handleInputChange: ${field} = ${value}`);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('Form submit edildi:', formData);
    
    // Basit validasyon
    if (!formData.ad || !formData.soyad || !formData.telefon || !formData.tarih || !formData.saat) {
      alert('Lütfen tüm zorunlu alanları doldurun!');
      return;
    }
    
    // Geçmiş saat kontrolü
    const selectedDate = new Date(formData.tarih);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate.getTime() === today.getTime()) {
      // Bugün için geçmiş saat kontrolü
      const currentTime = new Date();
      const [hours, minutes] = formData.saat.split(':').map(Number);
      const selectedDateTime = new Date();
      selectedDateTime.setHours(hours, minutes, 0, 0);
      
      if (selectedDateTime <= currentTime) {
        alert('⚠️ Geçmiş saatlerde rezervasyon yapılamaz! Lütfen gelecekteki bir saat seçin.');
        return;
      }
    }
    
    // onSubmit'i çağır
    onSubmit(formData);
    
    // Formu temizle
    if (shouldClearForm) {
      setFormData({
        ad: "",
        soyad: "",
        telefon: "",
        email: "",
        tarih: getTodayDate(),
        saat: "12:00",
        kisiSayisi: "2",
        not: "",
      });
    }
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
    overlayBg: "rgba(0,0,0,0.7)"
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
    overlayBg: "rgba(0,0,0,0.5)"
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
        maxWidth: "500px",
        width: "90%",
        maxHeight: "90vh",
        overflowY: "auto",
        border: `2px solid ${colors.modalBorder}`
      }}>
        <h2 style={{ 
          marginBottom: '20px', 
          color: colors.textColor 
        }}>
          📅 Masa {masaNo} - Yeni Rezervasyon
        </h2>

        {/* Mevcut Rezervasyonlar */}
        {existingReservations.length > 0 && (
          <div style={{
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: isDarkMode ? '#32263A' : '#E5D9F2',
            borderRadius: '8px',
            border: `1px solid ${colors.inputBorder}`
          }}>
            <h4 style={{ color: colors.textColor, marginBottom: '10px' }}>
              ⚠️ Bu Masada Mevcut Rezervasyonlar:
            </h4>
            {existingReservations.map((reservation, index) => (
              <div key={index} style={{
                marginBottom: '10px',
                padding: '10px',
                backgroundColor: isDarkMode ? '#2a2a2a' : '#F5EFFF',
                borderRadius: '6px',
                border: `1px solid ${colors.inputBorder}`
              }}>
                <div style={{
                  fontWeight: 'bold',
                  color: colors.textColor,
                  marginBottom: '5px'
                }}>
                  👤 {reservation.ad} {reservation.soyad}
                </div>
                <div style={{
                  color: colors.labelColor,
                  fontSize: '12px',
                  display: 'flex',
                  gap: '15px',
                  flexWrap: 'wrap'
                }}>
                  <span>📞 {reservation.telefon}</span>
                  <span>🕐 {reservation.saat}</span>
                  <span>👥 {reservation.kisiSayisi} kişi</span>
                  {reservation.not && <span>📝 {reservation.not}</span>}
                </div>
              </div>
            ))}
            <div style={{
              color: colors.labelColor,
              fontSize: '12px',
              fontStyle: 'italic',
              marginTop: '10px',
              padding: '8px',
              backgroundColor: isDarkMode ? '#32263A' : '#F5EFFF',
              borderRadius: '6px'
            }}>
              ⚠️ Bu masaya yeni rezervasyon eklerken 3 saat arayla rezervasyon yapabilirsiniz.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px", flex: 1 }}>
              <label style={{ 
                fontWeight: "bold", 
                color: colors.labelColor, 
                fontSize: "14px" 
              }}>
                Ad: *
              </label>
              <input
                type="text"
                placeholder="Ad"
                value={formData.ad}
                onChange={(e) => handleInputChange('ad', e.target.value)}
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
                Soyad: *
              </label>
              <input
                type="text"
                placeholder="Soyad"
                value={formData.soyad}
                onChange={(e) => handleInputChange('soyad', e.target.value)}
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
              Telefon: *
            </label>
            <input
              type="tel"
              placeholder="5XX XXX XX XX"
              value={formData.telefon}
              onChange={(e) => handleInputChange('telefon', e.target.value)}
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
              placeholder="E-mail adresi"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
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
              Tarih: *
            </label>
            <input
              type="date"
              value={formData.tarih}
              onChange={(e) => handleInputChange('tarih', e.target.value)}
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
          
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ 
              fontWeight: "bold", 
              color: colors.labelColor, 
              fontSize: "14px" 
            }}>
              Saat: *
            </label>
            <input
              type="time"
              value={formData.saat}
              onChange={(e) => handleInputChange('saat', e.target.value)}
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
          
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ 
              fontWeight: "bold", 
              color: colors.labelColor, 
              fontSize: "14px" 
            }}>
              Kişi Sayısı: *
            </label>
            <input
              type="number"
              placeholder={`Maksimum ${tableCapacity} kişi`}
              value={formData.kisiSayisi}
              onChange={(e) => handleInputChange('kisiSayisi', e.target.value)}
              required
              min="1"
              max={tableCapacity}
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
            <div style={{
              fontSize: '12px',
              color: colors.labelColor,
              fontStyle: 'italic',
              marginTop: '5px'
            }}>
              ⚠️ Bu masa {tableCapacity} kişilik. Maksimum {tableCapacity} kişi seçebilirsiniz.
            </div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ 
              fontWeight: "bold", 
              color: colors.labelColor, 
              fontSize: "14px" 
            }}>
              Not (İsteğe bağlı):
            </label>
            <textarea
              placeholder="Özel istekler, doğum günü vb."
              value={formData.not}
              onChange={(e) => handleInputChange('not', e.target.value)}
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
              background: colors.submitButtonBg,
              color: "white",
              border: `2px solid ${colors.submitButtonBorder}`,
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              flex: 1,
              transition: "all 0.3s ease"
            }}>
              ✅ Rezervasyon Oluştur
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
