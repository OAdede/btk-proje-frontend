import React, { useState, useEffect } from "react";
import "./MenuUpdate.css";

const kategoriler = [
  "Tümü",
  "Ana Yemek",
  "Aperatif",
  "Fırın",
  "Izgaralar",
  "Kahvaltılıklar",
  "İçecekler",
  "Tatlılar",
];

const varsayilanUrunler = {
  "Ana Yemek": [
    { ad: "Et Döner", fiyat: 535 },
    { ad: "Döner Beyti Sarma", fiyat: 545 },
    { ad: "Tereyağlı İskender", fiyat: 560 },
    { ad: "Pilav Üstü Döner", fiyat: 550 },
    { ad: "SSK Dürüm Döner", fiyat: 560 },
  ],
  "Aperatif": [
    { ad: "Çiğköfte", fiyat: 140 },
    { ad: "Soğan Halkası", fiyat: 130 },
    { ad: "Patates Kızartması", fiyat: 140 },
    { ad: "Börek Çeşitleri", fiyat: 140 },
    { ad: "Salata Çeşitleri", fiyat: 120 },
  ],
  "Fırın": [
    { ad: "Kuşbaşılı Pide", fiyat: 540 },
    { ad: "Karışık Pide", fiyat: 550 },
    { ad: "Kaşarlı Pide", fiyat: 470 },
    { ad: "Kıymalı Pide", fiyat: 490 },
    { ad: "Lahmacun", fiyat: 170 },
  ],
  "Izgaralar": [
    { ad: "Patlıcan Kebap", fiyat: 610 },
    { ad: "Special Kebap", fiyat: 570 },
    { ad: "Beyti Sarma", fiyat: 560 },
    { ad: "Tavuk Pirzola", fiyat: 540 },
    { ad: "Izgara Köfte", fiyat: 550 },
  ],
  "Kahvaltılıklar": [
    { ad: "Kahvaltı Tabağı", fiyat: 450 },
    { ad: "Serpme Kahvaltı", fiyat: 600 },
    { ad: "Menemen", fiyat: 200 },
    { ad: "Kuymak", fiyat: 250 },
    { ad: "Avakado yumurta", fiyat: 130 },
  ],
  "İçecekler": [
    { ad: "Kola", fiyat: 85 },
    { ad: "Fanta", fiyat: 85 },
    { ad: "Sprite", fiyat: 85 },
    { ad: "Tea", fiyat: 85 },
    { ad: "Ayran", fiyat: 75 },
    { ad: "Su", fiyat: 30 },
  ],
  "Tatlılar": [
    { ad: "Künefe", fiyat: 120 },
    { ad: "Baklava", fiyat: 150 },
    { ad: "Sütlaç", fiyat: 80 },
    { ad: "Kazandibi", fiyat: 100 },
    { ad: "Tiramisu", fiyat: 130 },
    { ad: "Cheesecake", fiyat: 140 },
  ],
};

function MenuUpdate({ onMenuChange }) {
  const [menu, setMenu] = useState(() => {
    const kayitliMenu = localStorage.getItem('menuData');
    return kayitliMenu ? JSON.parse(kayitliMenu) : varsayilanUrunler;
  });

  const [aktifKategori, setAktifKategori] = useState("Aperatif");
  const [yeniUrun, setYeniUrun] = useState({ ad: "", fiyat: "" });
  const [duzenleModal, setDuzenleModal] = useState({ acik: false, urun: null, index: -1, kategori: "" });
  const [duzenleAd, setDuzenleAd] = useState("");
  const [duzenleFiyat, setDuzenleFiyat] = useState("");

  useEffect(() => {
    localStorage.setItem('menuData', JSON.stringify(menu));
    if (onMenuChange) {
      onMenuChange(menu);
    }
  }, [menu, onMenuChange]);

  const tumUrunler = Object.entries(menu).flatMap(([kategori, urunler]) => urunler.map(u => ({ ...u, kategori })));
  const gosterilecekUrunler =
    aktifKategori === "Tümü" ? tumUrunler : (menu[aktifKategori] || []).map(u => ({ ...u, kategori: aktifKategori }));

  const urunEkle = () => {
    if (!yeniUrun.ad || !yeniUrun.fiyat || !aktifKategori || aktifKategori === "Tümü") return;

    const yeniMenu = {
      ...menu,
      [aktifKategori]: [
        ...(menu[aktifKategori] || []),
        { ...yeniUrun, fiyat: Number(yeniUrun.fiyat) },
      ],
    };
    setMenu(yeniMenu);
    setYeniUrun({ ad: "", fiyat: "" });
  };

  const urunSil = (index) => {
    if (aktifKategori === "Tümü") return;
    const yeniMenu = {
      ...menu,
      [aktifKategori]: menu[aktifKategori].filter((_, i) => i !== index),
    };
    setMenu(yeniMenu);
  };

  const urunDuzenle = (urun, index) => {
    setDuzenleModal({ acik: true, urun, index, kategori: aktifKategori });
    setDuzenleAd(urun.ad);
    setDuzenleFiyat(urun.fiyat.toString());
  };

  const fiyatKaydet = () => {
    if (!duzenleModal.acik || duzenleModal.index === -1) return;
    const yeniMenu = { ...menu };
    yeniMenu[duzenleModal.kategori][duzenleModal.index] = {
      ad: duzenleAd,
      fiyat: Number(duzenleFiyat),
    };
    setMenu(yeniMenu);
    setDuzenleModal({ acik: false, urun: null, index: -1, kategori: "" });
  };

  return (
    <div style={{ maxWidth: 1200, margin: "32px auto", background: "#f8f9fa", borderRadius: 16, boxShadow: "0 2px 12px #0001", padding: 32 }}>
      <h2 style={{ margin: "0 0 16px 0", color: "#1a3c34", fontWeight: 700 }}>Menü Güncelleme</h2>
      
      {/* Kategori Filtresi */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {kategoriler.map((kategori) => (
          <button
            key={kategori}
            onClick={() => setAktifKategori(kategori)}
            style={{
              background: aktifKategori === kategori ? "#1a3c34" : "#e0e0e0",
              color: aktifKategori === kategori ? "#fff" : "#1a3c34",
              border: "none", borderRadius: 8, padding: "8px 18px", cursor: "pointer",
            }}
          >
            {kategori}
          </button>
        ))}
      </div>
      
      {/* Yeni Ürün Ekleme Formu */}
      {aktifKategori !== "Tümü" && (
        <div style={{ background: "#fff", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 1px 6px #0001" }}>
          <h3 style={{ margin: "0 0 16px 0", color: "#1a3c34" }}>Yeni Ürün Ekle</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <input
              name="ad"
              value={yeniUrun.ad}
              onChange={(e) => setYeniUrun({ ...yeniUrun, ad: e.target.value })}
              placeholder="Ürün adı"
              style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb" }}
            />
            <input
              name="fiyat"
              type="number"
              value={yeniUrun.fiyat}
              onChange={(e) => setYeniUrun({ ...yeniUrun, fiyat: e.target.value })}
              placeholder="Fiyat (₺)"
              style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb" }}
            />
            <button
              onClick={urunEkle}
              style={{
                background: "#1a3c34", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", cursor: "pointer",
              }}
            >
              Ekle
            </button>
          </div>
        </div>
      )}
      
      {/* Menü Listesi */}
      <div style={{ display: "grid", gap: 16 }}>
        {gosterilecekUrunler.map((urun, index) => (
          <div
            key={`${aktifKategori}-${index}`}
            style={{
              background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 6px #0001",
              display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 16, alignItems: "center"
            }}
          >
            <div>
              <h4 style={{ margin: "0 0 4px 0", color: "#1a3c34" }}>{urun.ad}</h4>
              <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                {urun.fiyat} ₺ | {urun.kategori}
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <span
                style={{
                  background: "#38b000",
                  color: "#fff",
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: "12px",
                  fontWeight: "bold"
                }}
              >
                Aktif
              </span>
            </div>
            <button
              onClick={() => urunDuzenle(urun, index)}
              style={{
                background: "#1a3c34", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer",
              }}
            >
              Düzenle
            </button>
            <button
              onClick={() => urunSil(index)}
              style={{
                background: "#d90429", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer",
              }}
            >
              Sil
            </button>
          </div>
        ))}
      </div>
      
      {/* Düzenleme Modal */}
      {duzenleModal.acik && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{
            background: "#fff", borderRadius: 12, padding: 24, minWidth: 400, boxShadow: "0 4px 20px #0002"
          }}>
            <h3 style={{ margin: "0 0 16px 0", color: "#1a3c34" }}>Ürün Düzenle: {duzenleModal.urun?.ad}</h3>
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 4, color: "#1a3c34" }}>Ürün Adı:</label>
                <input
                  type="text"
                  value={duzenleAd}
                  onChange={(e) => setDuzenleAd(e.target.value)}
                  style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #bbb" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 4, color: "#1a3c34" }}>Fiyat (₺):</label>
                <input
                  type="number"
                  value={duzenleFiyat}
                  onChange={(e) => setDuzenleFiyat(e.target.value)}
                  style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #bbb" }}
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={fiyatKaydet}
                  style={{
                    background: "#1a3c34", color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", cursor: "pointer",
                  }}
                >
                  Kaydet
                </button>
                <button
                  onClick={() => setDuzenleModal({ acik: false, urun: null, index: -1, kategori: "" })}
                  style={{
                    background: "#666", color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", cursor: "pointer",
                  }}
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MenuUpdate;