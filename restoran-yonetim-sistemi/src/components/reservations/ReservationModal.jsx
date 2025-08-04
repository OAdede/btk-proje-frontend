import React, { useState } from "react";

export default function ReservationModal({ visible, masaNo, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    adSoyad: "",
    telefon: "",
    email: "", // E-mail alanı eklendi
    tarih: "",
    saat: "",
    kisiSayisi: "",
    not: "",
  });

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
      email: "", // temizle
      tarih: "",
      saat: "",
      kisiSayisi: "",
      not: "",
    });
  };

  if (!visible) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2>+ Yeni Rezervasyon</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="adSoyad"
            placeholder="Ad Soyad"
            value={formData.adSoyad}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="telefon"
            placeholder="Telefon"
            value={formData.telefon}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="E-mail (İsteğe bağlı)"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="date"
            name="tarih"
            value={formData.tarih}
            onChange={handleChange}
            required
          />
          <input
            type="time"
            name="saat"
            value={formData.saat}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="kisiSayisi"
            placeholder="Kişi Sayısı"
            value={formData.kisiSayisi}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="not"
            placeholder="Not (Doğum günü vb.)"
            value={formData.not}
            onChange={handleChange}
          />
          <div style={{ marginTop: "10px" }}>
            <button type="submit">Oluştur</button>
            <button type="button" onClick={onClose} style={{ marginLeft: "10px" }}>
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Arkaplan (modal dışında kalan karartı)
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.5)",
  zIndex: 9998,
};

// Modal kutusunun kendisi
const modalStyle = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "white",
  padding: "2rem",
  borderRadius: "10px",
  boxShadow: "0 0 10px rgba(0,0,0,0.3)",
  zIndex: 9999,
};
