import React, { useState, useEffect } from "react";

export default function ReservationModal({ visible, masaNo, onClose, onSubmit, defaultDate }) {
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

  if (!visible) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={{ marginBottom: '20px', color: '#ffffff' }}>
          📅 Masa {masaNo} - Yeni Rezervasyon
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Ad Soyad:</label>
            <input
              type="text"
              name="adSoyad"
              placeholder="Ad Soyad"
              value={formData.adSoyad}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>
          
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Telefon:</label>
            <input
              type="tel"
              name="telefon"
              placeholder="Telefon Numarası"
              value={formData.telefon}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>
          
          <div style={inputGroupStyle}>
            <label style={labelStyle}>E-mail (İsteğe bağlı):</label>
            <input
              type="email"
              name="email"
              placeholder="E-mail adresi"
              value={formData.email}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
          
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Tarih:</label>
            <input
              type="date"
              name="tarih"
              value={formData.tarih}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>
          
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Saat:</label>
            <input
              type="time"
              name="saat"
              value={formData.saat}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>
          
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Kişi Sayısı:</label>
            <input
              type="number"
              name="kisiSayisi"
              placeholder="Kişi sayısı"
              value={formData.kisiSayisi}
              onChange={handleChange}
              required
              min="1"
              max="20"
              style={inputStyle}
            />
          </div>
          
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Not (İsteğe bağlı):</label>
            <textarea
              name="not"
              placeholder="Özel istekler, doğum günü vb."
              value={formData.not}
              onChange={handleChange}
              style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" style={submitButtonStyle}>
              ✅ Rezervasyon Oluştur
            </button>
            <button type="button" onClick={onClose} style={cancelButtonStyle}>
              ❌ İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Stil tanımları - Koyu tema renkleri
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.7)",
  zIndex: 9998,
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const modalStyle = {
  backgroundColor: "#513653",
  padding: "2rem",
  borderRadius: "15px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
  zIndex: 9999,
  maxWidth: "500px",
  width: "90%",
  maxHeight: "90vh",
  overflowY: "auto",
  border: "2px solid #473653"
};

const inputGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "5px"
};

const labelStyle = {
  fontWeight: "bold",
  color: "#ffffff",
  fontSize: "14px"
};

const inputStyle = {
  padding: "12px",
  border: "2px solid #473653",
  borderRadius: "8px",
  fontSize: "14px",
  transition: "border-color 0.3s ease",
  outline: "none",
  backgroundColor: "#32263A",
  color: "#ffffff",
  placeholder: {
    color: "#a0a0a0"
  }
};

const submitButtonStyle = {
  background: "#473653",
  color: "white",
  border: "2px solid #513653",
  padding: "12px 24px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
  flex: 1,
  transition: "all 0.3s ease",
  "&:hover": {
    background: "#513653"
  }
};

const cancelButtonStyle = {
  background: "#32263A",
  color: "white",
  border: "2px solid #473653",
  padding: "12px 24px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
  flex: 1,
  transition: "all 0.3s ease",
  "&:hover": {
    background: "#473653"
  }
};
