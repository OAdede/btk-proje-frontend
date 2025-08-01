import React from "react";

export default function AdminDashboard() {
  // Geçici tıklama fonksiyonu
  const handleClick = (action) => {
    // Sonradan doldurulacak
    alert(`${action} butonuna tıklandı (şimdilik işlevsiz)`);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f5f5",
      fontFamily: "sans-serif"
    }}>
      {/* Üst Bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "24px"
      }}>
        {/* Sol üst: Kullanıcı bilgisi */}
        <div>
          <div style={{ fontWeight: "bold", fontSize: "1.2em" }}>Betül</div>
          <div style={{ fontSize: "0.9em", color: "#888" }}>admin</div>
        </div>
        {/* Sağ üst: Çıkış */}
        <button
          style={{
            background: "#e53935",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            padding: "8px 16px",
            cursor: "pointer"
          }}
          onClick={() => handleClick("Çıkış Yap")}
        >
          Çıkış Yap
        </button>
      </div>
      {/* Ana Butonlar */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "24px",
        justifyContent: "center",
        marginTop: "60px"
      }}>
        <button className="admin-btn" onClick={() => handleClick("Menü Güncelle")}>Menü Güncelle</button>
        <button className="admin-btn" onClick={() => handleClick("Rapor")}>Rapor</button>
        <button className="admin-btn" onClick={() => handleClick("Personel Ekle")}>Personel Ekle</button>
        <button className="admin-btn" onClick={() => handleClick("Şifre Değiştir")}>Şifre Değiştir</button>
        <button className="admin-btn" onClick={() => handleClick("Masa Ekle")}>Masa Ekle</button>
        <button className="admin-btn" onClick={() => handleClick("Stok Güncelle")}>Stok Güncelle</button>
      </div>
      {/* Buton Stili */}
      <style>{`
        .admin-btn {
          min-width: 180px;
          min-height: 60px;
          font-size: 1.1em;
          background: #1976d2;
          color: #fff;
          border: none;
          border-radius: 8px;
          margin: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .admin-btn:hover {
          background: #1565c0;
        }
      `}</style>
    </div>
  );
}