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
<<<<<<< Updated upstream
    if (!yeniUrun.ad || !yeniUrun.fiyat || !aktifKategori || aktifKategori === "Tümü") {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }
    
=======
    if (!yeniUrun.ad || !yeniUrun.fiyat || !aktifKategori || aktifKategori === "Tümü") return;

<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
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
    if (window.confirm("Bu ürünü silmek istediğinizden emin misiniz?")) {
      const yeniMenu = { ...menu };
      yeniMenu[aktifKategori].splice(index, 1);
      setMenu(yeniMenu);
    }
  };

  const urunDuzenle = (urun, index) => {
    setDuzenleModal({ acik: true, urun, index, kategori: aktifKategori });
    setDuzenleAd(urun.ad);
    setDuzenleFiyat(urun.fiyat.toString());
  };

  const fiyatKaydet = () => {
    if (!duzenleAd || !duzenleFiyat) {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }
    
    const yeniMenu = { ...menu };
    yeniMenu[duzenleModal.kategori][duzenleModal.index] = {
      ad: duzenleAd,
      fiyat: Number(duzenleFiyat),
    };
    setMenu(yeniMenu);
    setDuzenleModal({ acik: false, urun: null, index: -1, kategori: "" });
  };

  return (
<<<<<<< Updated upstream
    <div className="menu-container">
      <h2 className="menu-title">Menü Güncelleme</h2>
=======
    <div style={{ maxWidth: 1200, margin: "32px auto", background: "#f8f9fa", borderRadius: 16, boxShadow: "0 2px 12px #0001", padding: 32 }}>
      <h2 style={{ margin: "0 0 16px 0", color: "#1a3c34", fontWeight: 700 }}>Menü Güncelleme</h2>
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
      
      {/* Kategori Filtresi */}
      <div className="kategori-filter">
        {kategoriler.map((kategori) => (
          <button
            key={kategori}
            onClick={() => setAktifKategori(kategori)}
            className={aktifKategori === kategori ? "active" : ""}
          >
            {kategori}
          </button>
        ))}
      </div>
      
      {/* Yeni Ürün Ekleme Formu */}
      {aktifKategori !== "Tümü" && (
        <div className="yeni-urun-form">
          <h3 className="yeni-urun-title">Yeni Ürün Ekle</h3>
          <div className="urun-form">
            <input
              name="ad"
              value={yeniUrun.ad}
              onChange={(e) => setYeniUrun({ ...yeniUrun, ad: e.target.value })}
              placeholder="Ürün adı"
            />
            <input
              name="fiyat"
              type="number"
              value={yeniUrun.fiyat}
              onChange={(e) => setYeniUrun({ ...yeniUrun, fiyat: e.target.value })}
              placeholder="Fiyat (₺)"
            />
            <button onClick={urunEkle} className="urun-ekle-btn">
              Ekle
            </button>
          </div>
        </div>
      )}
      
      {/* Menü Listesi */}
      <div className="urun-listesi">
        {gosterilecekUrunler.map((urun, index) => (
          <div key={`${aktifKategori}-${index}`} className="urun-item">
            <div className="urun-info">
              <div className="urun-ad">{urun.ad}</div>
              <div className="urun-fiyat">
                {urun.fiyat} ₺ | {urun.kategori}
              </div>
            </div>
            
            <div className="urun-kategori">
              Aktif
            </div>
            
            <div className="urun-actions">
              <button
                onClick={() => urunDuzenle(urun, index)}
                className="urun-btn duzenle"
              >
                Düzenle
              </button>
              <button
                onClick={() => urunSil(index)}
                className="urun-btn sil"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Düzenleme Modal */}
      {duzenleModal.acik && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Ürün Düzenle: {duzenleModal.urun?.ad}</h3>
            <div>
              <label>Ürün Adı:</label>
              <input
                type="text"
                value={duzenleAd}
                onChange={(e) => setDuzenleAd(e.target.value)}
              />
            </div>
            <div>
              <label>Fiyat (₺):</label>
              <input
                type="number"
                value={duzenleFiyat}
                onChange={(e) => setDuzenleFiyat(e.target.value)}
              />
            </div>
            <div className="modal-buttons">
              <button onClick={fiyatKaydet} className="modal-btn kaydet">
                Kaydet
              </button>
              <button 
                onClick={() => setDuzenleModal({ acik: false, urun: null, index: -1, kategori: "" })}
                className="modal-btn iptal"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MenuUpdate;