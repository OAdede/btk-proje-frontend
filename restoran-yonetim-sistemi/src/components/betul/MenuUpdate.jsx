import React, { useState, useEffect } from "react";
import "./App.css";

const kategoriler = [
  "Tümü",
  "Ana Yemek",
  "Aparatifler",
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
  "Aparatifler": [
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
  // localStorage'dan verileri yükle veya varsayılan değerleri kullan
  const [menu, setMenu] = useState(() => {
    const kayitliMenu = localStorage.getItem('menuData');
    return kayitliMenu ? JSON.parse(kayitliMenu) : varsayilanUrunler;
  });
  
  const [aktifKategori, setAktifKategori] = useState("Tümü");
  const [yeniUrun, setYeniUrun] = useState({ ad: "", fiyat: "" });

  // Menü değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('menuData', JSON.stringify(menu));
    if (onMenuChange) {
      onMenuChange(menu);
    }
  }, [menu, onMenuChange]);

  const tumUrunler = Object.values(menu).flat();
  const gosterilecekUrunler =
    aktifKategori === "Tümü" ? tumUrunler : menu[aktifKategori] || [];

  const getBirim = (kategori) => {
    if (kategori === "İçecekler" || kategori === "Tatlılar") return "adet";
    return "porsiyon";
  };

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
    
    // Stok listesine otomatik ekle
    if (onMenuChange) {
      const stokUrunu = {
        ad: yeniUrun.ad,
        miktar: 50, // Varsayılan miktar
        minStok: 10, // Varsayılan minimum stok
        birim: getBirim(aktifKategori)
      };
      onMenuChange(yeniMenu, stokUrunu, aktifKategori, "ekle");
    }
    
    setYeniUrun({ ad: "", fiyat: "" });
  };

  const urunSil = (index) => {
    if (aktifKategori === "Tümü") return;
    
    const silinecekUrun = menu[aktifKategori][index];
    const yeniMenu = {
      ...menu,
      [aktifKategori]: menu[aktifKategori].filter((_, i) => i !== index),
    };
    setMenu(yeniMenu);
    
    // Stok listesinden otomatik çıkar
    if (onMenuChange) {
      onMenuChange(yeniMenu, silinecekUrun, aktifKategori, "sil");
    }
  };

  const urunDuzenle = (urun, index) => {
    // Fiyat düzenleme modal'ı burada olacak
    // Şimdilik sadece stok senkronizasyonu için hazırlık
  };

  return (
    <div style={{ maxWidth: 800, margin: "32px auto", background: "#f8f9fa", borderRadius: 16, boxShadow: "0 2px 12px #0001", padding: 32 }}>
      <h2 style={{ margin: "0 0 16px 0", color: "#1a3c34", fontWeight: 700 }}>Menü Güncelleme</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {kategoriler.map((kategori) => (
          <button
            key={kategori}
            onClick={() => setAktifKategori(kategori)}
            style={{
              background: aktifKategori === kategori ? "#1a3c34" : "#e0e0e0",
              color: aktifKategori === kategori ? "#fff" : "#1a3c34",
              border: "none",
              borderRadius: 8,
              padding: "8px 18px",
              fontWeight: aktifKategori === kategori ? 700 : 500,
              fontSize: 16,
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: aktifKategori === kategori ? "0 2px 8px #1a3c3422" : "none",
            }}
          >
            {kategori}
          </button>
        ))}
      </div>
      {aktifKategori !== "Tümü" && (
        <div style={{ display: "flex", gap: 12, margin: "20px 0 28px 0" }}>
          <input
            type="text"
            placeholder="Ürün adı"
            value={yeniUrun.ad}
            onChange={e => setYeniUrun({ ...yeniUrun, ad: e.target.value })}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb", fontSize: 15, width: 180 }}
          />
          <input
            type="number"
            placeholder="Fiyat"
            value={yeniUrun.fiyat}
            onChange={e => setYeniUrun({ ...yeniUrun, fiyat: e.target.value })}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb", fontSize: 15, width: 100 }}
          />
          <button onClick={urunEkle} style={{ background: "#1a3c34", color: "#fff", border: "none", borderRadius: 6, padding: "8px 24px", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Ekle</button>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
        {gosterilecekUrunler.map((urun, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", background: "#fff", borderRadius: 10, boxShadow: "0 1px 6px #0001", padding: "12px 20px", gap: 24 }}>
            <div style={{ flex: 1, fontWeight: 600, fontSize: 17, color: "#1a3c34" }}>{urun.ad}</div>
            <div style={{ fontWeight: 600, fontSize: 17, color: "#388e3c", minWidth: 80 }}>{urun.fiyat} ₺</div>
            {aktifKategori !== "Tümü" && (
              <>
                <button onClick={() => urunDuzenle(urun, i)} style={{ background: "#1a3c34", color: "#fff", border: "none", borderRadius: 6, padding: "7px 18px", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Düzenle</button>
                <button onClick={() => urunSil(i)} style={{ background: "#d90429", color: "#fff", border: "none", borderRadius: 6, padding: "7px 18px", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Sil</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuUpdate;