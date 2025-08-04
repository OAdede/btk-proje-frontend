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

  // Stok verilerini localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('stokData', JSON.stringify(stok));
  }, [stok]);

  // Gösterilecek ürünleri hesapla
  const gosterilecekUrunler = aktifKategori === "Tümü" 
    ? Object.values(stok).flat() 
    : stok[aktifKategori] || [];

  const stokDurumu = (miktar, minStok) => {
    if (miktar > minStok * 2) return { durum: "Yeterli", renk: "#4caf50", class: "yeterli" };
    if (miktar > minStok) return { durum: "Az", renk: "#ff9800", class: "az" };
    return { durum: "Kritik", renk: "#f44336", class: "kritik" };
  };

  const getBirim = (kategori) => {
    return kategori === "İçecekler" || kategori === "Tatlılar" ? "adet" : "porsiyon";
  };

  const urunEkle = () => {
    if (!yeniUrun.ad || !yeniUrun.miktar || !yeniUrun.minStok || !yeniUrun.birim) {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }

    const yeniStokData = { ...stok };
    if (!yeniStokData[aktifKategori]) {
      yeniStokData[aktifKategori] = [];
    }

    yeniStokData[aktifKategori].push({
      ad: yeniUrun.ad,
      miktar: Number(yeniUrun.miktar),
      minStok: Number(yeniUrun.minStok),
      birim: yeniUrun.birim,
    });

    setStok(yeniStokData);
    setYeniUrun({ ad: "", miktar: "", minStok: "", birim: "" });
  };

  const urunSil = (index) => {
    if (window.confirm("Bu ürünü silmek istediğinizden emin misiniz?")) {
      const yeniStok = { ...stok };
      yeniStok[aktifKategori].splice(index, 1);
      setStok(yeniStok);
    }
  };

  const urunDuzenle = (urun, index) => {
    setDuzenleModal({ acik: true, urun, index, kategori: aktifKategori });
    setDuzenleMiktar(urun.miktar.toString());
    setDuzenleMinStok(urun.minStok.toString());
  };

  const miktarKaydet = () => {
    if (!duzenleMiktar || !duzenleMinStok) {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }

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
    <div className="stok-container">
      <h2 className="stok-title">Stok Güncelleme</h2>

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
              name="miktar"
              type="number"
              value={yeniUrun.miktar}
              onChange={(e) => setYeniUrun({ ...yeniUrun, miktar: e.target.value })}
              placeholder="Miktar"
            />
            <input
              name="minStok"
              type="number"
              value={yeniUrun.minStok}
              onChange={(e) => setYeniUrun({ ...yeniUrun, minStok: e.target.value })}
              placeholder="Min. Stok"
            />
            <select
              name="birim"
              value={yeniUrun.birim}
              onChange={(e) => setYeniUrun({ ...yeniUrun, birim: e.target.value })}
            >
              <option value="">Birim Seçin</option>
              <option value="porsiyon">Porsiyon</option>
              <option value="adet">Adet</option>
              <option value="kg">Kg</option>
              <option value="kutu">Kutu</option>
            </select>
            <button onClick={urunEkle} className="urun-ekle-btn">
              Ekle
            </button>
          </div>
        </div>
      )}

      {/* Stok Listesi */}
      <div className="urun-listesi">
        {gosterilecekUrunler.map((urun, index) => {
          const durum = stokDurumu(urun.miktar, urun.minStok);
          return (
            <div key={`${aktifKategori}-${index}`} className="urun-item">
              <div className="urun-info">
                <div className="urun-ad">{urun.ad}</div>
                <div className="urun-detay">
                  {urun.miktar} {urun.birim} | Min: {urun.minStok}
                </div>
              </div>
              
              <div className={`urun-stok ${durum.class}`}>
                {durum.durum}
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
          );
        })}
      </div>

      {/* Düzenleme Modal */}
      {duzenleModal.acik && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Ürün Düzenle: {duzenleModal.urun?.ad}</h3>
            <div>
              <label>Miktar:</label>
              <input
                type="number"
                value={duzenleMiktar}
                onChange={(e) => setDuzenleMiktar(e.target.value)}
              />
            </div>
            <div>
              <label>Min. Stok:</label>
              <input
                type="number"
                value={duzenleMinStok}
                onChange={(e) => setDuzenleMinStok(e.target.value)}
              />
            </div>
            <div className="modal-buttons">
              <button onClick={miktarKaydet} className="modal-btn kaydet">
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

export default StokUpdate; 