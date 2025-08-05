import React, { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

export default function ReservationModal({ visible, masaNo, onClose, onSubmit, defaultDate }) {
  const { isDarkMode } = useContext(ThemeContext);
  const [formData, setFormData] = useState({
    adSoyad: "",
    telefon: "",
    email: "",
    tarih: defaultDate || "",
    saat: "",
    kisiSayisi: "",
    not: "",
  });

  // Tarih alanını otomatik doldur
  useEffect(() => {
    if (defaultDate) {
      setFormData(prev => ({ ...prev, tarih: defaultDate }));
    }
  }, [defaultDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      adSoyad: "",
      telefon: "",
      email: "",
      tarih: defaultDate || "",
      saat: "",
      kisiSayisi: "",
      not: "",
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
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ 
              fontWeight: "bold", 
              color: colors.labelColor, 
              fontSize: "14px" 
            }}>
              Ad Soyad:
            </label>
            <input
              type="text"
              name="adSoyad"
              placeholder="Ad Soyad"
              value={formData.adSoyad}
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
              placeholder="Telefon Numarası"
              value={formData.telefon}
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
          
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
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
              Saat:
            </label>
            <input
              type="time"
              name="saat"
              value={formData.saat}
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
          
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ 
              fontWeight: "bold", 
              color: colors.labelColor, 
              fontSize: "14px" 
            }}>
              Kişi Sayısı:
            </label>
            <input
              type="number"
              name="kisiSayisi"
              placeholder="Kişi sayısı"
              value={formData.kisiSayisi}
              onChange={handleChange}
              required
              min="1"
              max="20"
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
              Not (İsteğe bağlı):
            </label>
            <textarea
              name="not"
              placeholder="Özel istekler, doğum günü vb."
              value={formData.not}
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
