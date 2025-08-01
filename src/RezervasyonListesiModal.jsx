import React from "react";

const RezervasyonListesiModal = ({ masalar, onClose }) => {
  const rezerveMasalar = masalar
    .map((masa, index) => ({ ...masa, masaNo: index + 1 }))
    .filter((masa) => masa.durum === "rezerve");

  return (
    <div
      style={{
        position: "fixed",
        top: "10%",
        left: "30%",
        width: "40%",
        background: "#fff",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 0 12px rgba(0,0,0,0.3)",
        zIndex: 1000,
      }}
    >
      <h2>Rezervasyon Listesi</h2>
      {rezerveMasalar.length === 0 ? (
        <p>Henüz rezerve masa yok.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {rezerveMasalar.map((masa) => (
            <li
              key={masa.masaNo}
              style={{
                marginBottom: "12px",
                background: "#f0f0f0",
                padding: "12px",
                borderRadius: "8px",
              }}
            >
              <strong>Masa {masa.masaNo}</strong> <br />
              👤 {masa.kisi} <br />
              ⏰ Saat: {masa.saat} | 📅 Tarih: {masa.tarih} <br />
              👥 Kişi Sayısı: {masa.kisiSayisi} <br />
              📞 Telefon: {masa.telefon} <br />
              {masa.email && <>✉️ E-mail: {masa.email}</>}
            </li>
          ))}
        </ul>
      )}
      <button onClick={onClose} style={{ marginTop: "20px", padding: "10px 20px" }}>
        Kapat
      </button>
    </div>
  );
};

export default RezervasyonListesiModal;
