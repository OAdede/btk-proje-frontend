import React, { useState, useEffect } from "react";
import "./StokUpdate.css";

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

function StokUpdate() {
  // localStorage'dan menü verilerini yükle
  const [menu, setMenu] = useState(() => {
    const kayitliMenu = localStorage.getItem('menuData');
    return kayitliMenu ? JSON.parse(kayitliMenu) : varsayilanUrunler;
  });

  // Stok verilerini menüden oluştur
  const [stok, setStok] = useState(() => {
    const kayitliStok = localStorage.getItem('stokData');
    if (kayitliStok) {
      return JSON.parse(kayitliStok);
    } else {
      // Menüden stok verilerini oluştur
      const yeniStok = {};
      Object.keys(menu).forEach(kategori => {
        yeniStok[kategori] = menu[kategori].map(urun => ({
          ad: urun.ad,
          miktar: Math.floor(Math.random() * 50) + 10, // Rastgele miktar
          minStok: Math.floor(Math.random() * 10) + 5, // Rastgele minimum stok
          birim: kategori === "İçecekler" || kategori === "Tatlılar" ? "adet" : "porsiyon"
        }));
      });
      return yeniStok;
    }
  });

  const [aktifKategori, setAktifKategori] = useState("Aperatif");
  const [yeniUrun, setYeniUrun] = useState({ ad: "", miktar: "", minStok: "", birim: "" });
  const [duzenleModal, setDuzenleModal] = useState({ acik: false, urun: null, index: -1, kategori: "" });
  const [duzenleMiktar, setDuzenleMiktar] = useState("");
  const [duzenleMinStok, setDuzenleMinStok] = useState("");

  // Stok değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('stokData', JSON.stringify(stok));
  }, [stok]);

  const tumUrunler = Object.values(stok).flat();
  const gosterilecekUrunler =
    aktifKategori === "Tümü" ? tumUrunler : stok[aktifKategori] || [];

  const stokDurumu = (miktar, minStok) => {
    if (miktar <= 0) return { durum: "Tükendi", renk: "#d90429" };
    if (miktar <= minStok) return { durum: "Kritik", renk: "#ff6b35" };
    return { durum: "Yeterli", renk: "#38b000" };
  };

  const getBirim = (kategori) => {
    if (kategori === "İçecekler" || kategori === "Tatlılar") return "adet";
    return "porsiyon";
  };

  const urunEkle = () => {
    if (!yeniUrun.ad || !yeniUrun.miktar || !yeniUrun.minStok || !aktifKategori || aktifKategori === "Tümü") return;

    const yeniStok = {
      ...stok,
      [aktifKategori]: [
        ...(stok[aktifKategori] || []),
        { 
          ...yeniUrun, 
          miktar: Number(yeniUrun.miktar),
          minStok: Number(yeniUrun.minStok),
          birim: yeniUrun.birim || getBirim(aktifKategori)
        },
      ],
    };

    setStok(yeniStok);
    setYeniUrun({ ad: "", miktar: "", minStok: "", birim: "" });
  };

  const urunSil = (index) => {
    if (aktifKategori === "Tümü") return;
    
    const yeniStok = {
      ...stok,
      [aktifKategori]: stok[aktifKategori].filter((_, i) => i !== index),
    };
    setStok(yeniStok);
  };

  const urunDuzenle = (urun, index) => {
    setDuzenleModal({ acik: true, urun, index, kategori: aktifKategori });
    setDuzenleMiktar(urun.miktar.toString());
    setDuzenleMinStok(urun.minStok.toString());
  };

  const miktarKaydet = () => {
    if (!duzenleModal.acik || duzenleModal.index === -1) return;

    const yeniStok = { ...stok };
    yeniStok[duzenleModal.kategori][duzenleModal.index] = {
      ...duzenleModal.urun,
      miktar: Number(duzenleMiktar),
      minStok: Number(duzenleMinStok),
    };

    setStok(yeniStok);
    setDuzenleModal({ acik: false, urun: null, index: -1, kategori: "" });
  };

  return (
    <div style={{ maxWidth: 1200, margin: "32px auto", background: "#f8f9fa", borderRadius: 16, boxShadow: "0 2px 12px #0001", padding: 32 }}>
      <h2 style={{ margin: "0 0 16px 0", color: "#1a3c34", fontWeight: 700 }}>Stok Güncelleme</h2>

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
              name="miktar"
              type="number"
              value={yeniUrun.miktar}
              onChange={(e) => setYeniUrun({ ...yeniUrun, miktar: e.target.value })}
              placeholder="Miktar"
              style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb" }}
            />
            <input
              name="minStok"
              type="number"
              value={yeniUrun.minStok}
              onChange={(e) => setYeniUrun({ ...yeniUrun, minStok: e.target.value })}
              placeholder="Min. Stok"
              style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb" }}
            />
            <select
              name="birim"
              value={yeniUrun.birim}
              onChange={(e) => setYeniUrun({ ...yeniUrun, birim: e.target.value })}
              style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb" }}
            >
              <option value="">Birim Seçin</option>
              <option value="porsiyon">Porsiyon</option>
              <option value="adet">Adet</option>
              <option value="kg">Kg</option>
              <option value="kutu">Kutu</option>
            </select>
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

      {/* Stok Listesi */}
      <div style={{ display: "grid", gap: 16 }}>
        {gosterilecekUrunler.map((urun, index) => {
          const durum = stokDurumu(urun.miktar, urun.minStok);
          return (
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
                  {urun.miktar} {urun.birim} | Min: {urun.minStok}
                </p>
              </div>
              
              <div style={{ textAlign: "center" }}>
                <span
                  style={{
                    background: durum.renk,
                    color: "#fff",
                    padding: "4px 12px",
                    borderRadius: 20,
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}
                >
                  {durum.durum}
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
          );
        })}
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
                <label style={{ display: "block", marginBottom: 4, color: "#1a3c34" }}>Miktar:</label>
                <input
                  type="number"
                  value={duzenleMiktar}
                  onChange={(e) => setDuzenleMiktar(e.target.value)}
                  style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #bbb" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 4, color: "#1a3c34" }}>Min. Stok:</label>
                <input
                  type="number"
                  value={duzenleMinStok}
                  onChange={(e) => setDuzenleMinStok(e.target.value)}
                  style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #bbb" }}
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={miktarKaydet}
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

export default StokUpdate; 