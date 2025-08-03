import React, { useState } from "react";
import ReservationModal from "./ReservationModal";
import RezervasyonListesiModal from "./RezervasyonListesiModal";
import MenuUpdate from "./MenuUpdate";
import StokUpdate from "./StokUpdate";
import PersonelEkleme from "./PersonelEkleme";


const MASA_SAYISI = 8; // Örnek olarak 8 masa

function App() {
  // Masaların durumu: "bos", "dolu", "rezerve"
  const [masalar, setMasalar] = useState(
    Array(MASA_SAYISI).fill({
      durum: "bos",
      kisi: "",
      saat: "",
      kisiSayisi: "",
      tarih: "",
    })
  );
  
  const [rezervasyonModu, setRezervasyonModu] = useState(false);
  const [rezervasyonListesiAcik, setRezervasyonListesiAcik] = useState(false);
  const [acikMasaIndex, setAcikMasaIndex] = useState(null); // Hangi masa için modal açık
  const [aktifSayfa, setAktifSayfa] = useState("anasayfa");
  const [menuData, setMenuData] = useState(null);

  const handleMenuChange = (yeniMenu, stokUrunu, kategori, islem) => {
    setMenuData(yeniMenu);
    // Burada stok güncelleme işlemleri yapılabilir
  };


  // Rezervasyon modunu aç/kapat
  const rezervasyonModunuAc = () => setRezervasyonModu(true);
  const rezervasyonModunuKapat = () => setRezervasyonModu(false);

  // Masa rezerve et
  const masaRezerveEt = (masaIndex, formData) => {
    const yeniMasalar = [...masalar];
    yeniMasalar[masaIndex] = {
      durum: "rezerve",
      kisi: formData.adSoyad,
      saat: formData.saat,
      kisiSayisi: formData.kisiSayisi,
      tarih: formData.tarih,
      telefon: formData.telefon,
      email: formData.email || "", // isteğe bağlı
    };
    setMasalar(yeniMasalar);
  };
  
  
  
  

  // Rezervasyon iptal et
  const rezervasyonIptalEt = (index) => {
    if (masalar[index] === "rezerve") {
      const yeniMasalar = [...masalar];
      yeniMasalar[index] = "bos";
      setMasalar(yeniMasalar);
    }
  };

  // Çıkış yap fonksiyonu (şimdilik alert)
  const cikisYap = () => {
    alert("Çıkış yapıldı!");
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f5f5f5" }}>
      {/* Sol Menü */}
      <div
        style={{
          width: "250px",
          background: "#22223b",
          color: "#fff",
          padding: "30px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        {/* Kullanıcı Bilgisi */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ fontSize: "1.3rem", fontWeight: "bold" }}>Betül</div>
          <div style={{ fontSize: "0.9rem", color: "#b5b5b5" }}>Admin</div>
        </div>
        {/* Menü Butonları */}
        <button style={menuBtnStyle} onClick={() => setAktifSayfa("menu")}>Menü Güncelleme</button>
        <button style={menuBtnStyle}>Rapor</button>
        <button style={menuBtnStyle} onClick={() => setAktifSayfa("personel")}>Personel Ekleme</button>
        <button style={menuBtnStyle}>Şifre Değiştirme</button>
        <button style={menuBtnStyle}>Masa Ekle</button>
        <button style={menuBtnStyle} onClick={() => setAktifSayfa("stok")}>Stok Güncelle</button>
        <button style={menuBtnStyle} onClick={() => setRezervasyonListesiAcik(true)}>
  Rezervasyon
</button>

      </div>
      {/* Ana İçerik */}
      <div
        style={{
          flex: 1,
          padding: "40px",
          background: "#fff",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {aktifSayfa === "menu" ? (
          <MenuUpdate onMenuChange={handleMenuChange} />
        ) : aktifSayfa === "stok" ? (
          <StokUpdate menuData={menuData} onMenuChange={handleMenuChange} />
        ) : aktifSayfa === "personel" ? (
          <PersonelEkleme />
        ) : (
          // Burada eski ana ekranı gösterecek kodlar
          <>
            {/* Üstteki butonlar */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 30 }}>
              <button
                style={rezervasyonBtnStyle}
                onClick={rezervasyonModunuAc}
                disabled={rezervasyonModu}
              >
                Rezervasyon Yap
              </button>
              <button style={cikisBtnStyle} onClick={cikisYap}>
                Çıkış Yap
              </button>
            </div>
            {/* Masalar */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "30px",
                justifyContent: "flex-start",
                alignItems: "flex-start",
              }}
            >
              {masalar.map((masa, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <button
                    style={{
                      ...masaBtnStyle,
                      background:
                        masa.durum === "bos"
                          ? "#38b000"
                          : masa.durum === "dolu"
                          ? "#d90429"
                          : "#ffd60a",
                      color: masa.durum === "dolu" ? "#fff" : "#222",
                      border: masa.durum === "rezerve" ? "2px solid #222" : "none",
                    }}
                    disabled={masa.durum === "dolu"}
                  >
                    Masa {i + 1}
                  </button>
                  {/* Rezervasyon modunda + işareti */}
                  {rezervasyonModu && masa.durum === "bos" && (

                    <button
                    onClick={() => setAcikMasaIndex(i)}
                    style={plusBtnStyle}
                    title="Rezerve Et"
                  >
                    +
                  </button>
                  
                  )}
                  {/* Rezerve masada - butonu */}
                  {masa.durum === "rezerve" && (
                    <button
                      onClick={() => rezervasyonIptalEt(i)}
                      style={minusBtnStyle}
                      title="Rezervasyon İptal"
                    >
                      –
                    </button>
                  )}
                </div>
              ))}
            </div>
            {/* Modal Bileşeni */}
            <ReservationModal
              visible={acikMasaIndex !== null}
              masaNo={acikMasaIndex + 1}
              onClose={() => setAcikMasaIndex(null)}
              onSubmit={(formData) => {
                masaRezerveEt(acikMasaIndex, formData);
                setAcikMasaIndex(null);
                setRezervasyonModu(false);
              }}
            />
            {rezervasyonListesiAcik && (
      <RezervasyonListesiModal
        masalar={masalar}
        onClose={() => setRezervasyonListesiAcik(false)}
      />
    )}
          </>
        )}
      </div>
    </div>
  );
}


// Menü butonları için stil
const menuBtnStyle = {
  width: "100%",
  padding: "12px 0",
  marginBottom: "15px",
  background: "#4a4e69",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontSize: "1rem",
  cursor: "pointer",
  textAlign: "left",
  paddingLeft: "15px",
  transition: "background 0.2s",
};

// Rezervasyon butonu stili
const rezervasyonBtnStyle = {
  background: "#38b000",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontSize: "1.1rem",
  padding: "12px 24px",
  cursor: "pointer",
  fontWeight: "bold",
  marginRight: "10px",
};

// Çıkış butonu stili
const cikisBtnStyle = {
  background: "#d90429",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontSize: "1.1rem",
  padding: "12px 24px",
  cursor: "pointer",
  fontWeight: "bold",
};

// Masa butonu stili
const masaBtnStyle = {
  width: "160px",
  height: "90px",
  fontSize: "1.3rem",
  borderRadius: "16px",
  border: "none",
  marginBottom: "10px",
  position: "relative",
  transition: "background 0.2s",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

// + butonu stili
const plusBtnStyle = {
  position: "absolute",
  top: "-12px",
  right: "-12px",
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  background: "#fff",
  color: "#38b000",
  border: "2px solid #38b000",
  fontSize: "2rem",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2,
};

// - butonu stili
const minusBtnStyle = {
  position: "absolute",
  top: "-12px",
  right: "-12px",
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  background: "#fff",
  color: "#ffd60a",
  border: "2px solid #ffd60a",
  fontSize: "2rem",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2,
};

export default App;