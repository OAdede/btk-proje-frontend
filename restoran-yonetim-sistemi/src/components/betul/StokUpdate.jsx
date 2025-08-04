import React, { useState, useEffect } from "react";
import "./App.css";

const varsayilanStokUrunleri = {
  "Ana Yemek": [
    { ad: "Et Döner", miktar: 50, minStok: 10, birim: "porsiyon" },
    { ad: "Döner Beyti Sarma", miktar: 30, minStok: 5, birim: "porsiyon" },
    { ad: "Tereyağlı İskender", miktar: 25, minStok: 8, birim: "porsiyon" },
    { ad: "Pilav Üstü Döner", miktar: 40, minStok: 12, birim: "porsiyon" },
    { ad: "SSK Dürüm Döner", miktar: 35, minStok: 7, birim: "porsiyon" },
  ],
  "Aparatifler": [
    { ad: "Çiğköfte", miktar: 20, minStok: 5, birim: "porsiyon" },
    { ad: "Soğan Halkası", miktar: 15, minStok: 3, birim: "porsiyon" },
    { ad: "Patates Kızartması", miktar: 30, minStok: 8, birim: "porsiyon" },
    { ad: "Börek Çeşitleri", miktar: 25, minStok: 6, birim: "porsiyon" },
    { ad: "Salata Çeşitleri", miktar: 18, minStok: 4, birim: "porsiyon" },
  ],
  "Fırın": [
    { ad: "Kuşbaşılı Pide", miktar: 12, minStok: 3, birim: "porsiyon" },
    { ad: "Karışık Pide", miktar: 15, minStok: 4, birim: "porsiyon" },
    { ad: "Kaşarlı Pide", miktar: 20, minStok: 5, birim: "porsiyon" },
    { ad: "Kıymalı Pide", miktar: 18, minStok: 4, birim: "porsiyon" },
    { ad: "Lahmacun", miktar: 30, minStok: 8, birim: "porsiyon" },
  ],
  "Izgaralar": [
    { ad: "Patlıcan Kebap", miktar: 15, minStok: 5, birim: "porsiyon" },
    { ad: "Special Kebap", miktar: 20, minStok: 6, birim: "porsiyon" },
    { ad: "Beyti Sarma", miktar: 18, minStok: 5, birim: "porsiyon" },
    { ad: "Tavuk Pirzola", miktar: 22, minStok: 7, birim: "porsiyon" },
    { ad: "Izgara Köfte", miktar: 25, minStok: 8, birim: "porsiyon" },
  ],
  "Kahvaltılıklar": [
    { ad: "Kahvaltı Tabağı", miktar: 10, minStok: 3, birim: "porsiyon" },
    { ad: "Serpme Kahvaltı", miktar: 8, minStok: 2, birim: "porsiyon" },
    { ad: "Menemen", miktar: 15, minStok: 5, birim: "porsiyon" },
    { ad: "Kuymak", miktar: 12, minStok: 4, birim: "porsiyon" },
    { ad: "Avakado yumurta", miktar: 20, minStok: 6, birim: "porsiyon" },
  ],
  "İçecekler": [
    { ad: "Kola", miktar: 48, minStok: 12, birim: "adet" },
    { ad: "Fanta", miktar: 45, minStok: 10, birim: "adet" },
    { ad: "Sprite", miktar: 42, minStok: 10, birim: "adet" },
    { ad: "Tea", miktar: 60, minStok: 15, birim: "adet" },
    { ad: "Ayran", miktar: 35, minStok: 8, birim: "adet" },
    { ad: "Su", miktar: 100, minStok: 20, birim: "adet" },
  ],
  "Tatlılar": [
    { ad: "Künefe", miktar: 15, minStok: 5, birim: "adet" },
    { ad: "Baklava", miktar: 20, minStok: 6, birim: "adet" },
    { ad: "Sütlaç", miktar: 25, minStok: 8, birim: "adet" },
    { ad: "Kazandibi", miktar: 18, minStok: 5, birim: "adet" },
    { ad: "Tiramisu", miktar: 12, minStok: 4, birim: "adet" },
    { ad: "Cheesecake", miktar: 10, minStok: 3, birim: "adet" },
  ],
};

const kategoriler = ["Tümü", "Ana Yemek", "Aparatifler", "Fırın", "Izgaralar", "Kahvaltılıklar", "İçecekler", "Tatlılar"];

const URUN_SAYFASI = 10; // Sayfa başına gösterilecek ürün sayısı

function StokUpdate({ menuData, onMenuChange }) {
  const [stok, setStok] = useState(() => {
    const kayitliStok = localStorage.getItem('stokData');
    return kayitliStok ? JSON.parse(kayitliStok) : varsayilanStokUrunleri;
  });

  const [aktifKategori, setAktifKategori] = useState("Tümü");
  const [mevcutSayfa, setMevcutSayfa] = useState(1); // Sayfalama için state
  const [yeniUrun, setYeniUrun] = useState({ ad: "", miktar: "", minStok: "", birim: "" });
  const [duzenleModal, setDuzenleModal] = useState({ acik: false, urun: null, index: -1, kategori: "" });
  const [duzenleMiktar, setDuzenleMiktar] = useState("");
  const [duzenleMinStok, setDuzenleMinStok] = useState("");

  useEffect(() => {
    localStorage.setItem('stokData', JSON.stringify(stok));
  }, [stok]);

  useEffect(() => {
    setMevcutSayfa(1); // Kategori değiştiğinde ilk sayfaya dön
  }, [aktifKategori]);

  const tumUrunler = Object.entries(stok).flatMap(([kategori, urunler]) =>
    urunler.map(urun => ({ ...urun, kategori }))
  );

  const gosterilecekUrunler =
    aktifKategori === "Tümü"
      ? tumUrunler
      : stok[aktifKategori]?.map(u => ({ ...u, kategori: aktifKategori })) || [];

  // Sayfalama mantığı
  const sonUrunIndex = mevcutSayfa * URUN_SAYFASI;
  const ilkUrunIndex = sonUrunIndex - URUN_SAYFASI;
  const mevcutSayfaUrunleri = gosterilecekUrunler.slice(ilkUrunIndex, sonUrunIndex);
  const toplamSayfaSayisi = Math.ceil(gosterilecekUrunler.length / URUN_SAYFASI);

  const stokDurumu = (miktar, minStok) => {
    if (miktar <= 0) return { durum: "Tükendi", renk: "#d90429" };
    if (miktar <= minStok) return { durum: "Kritik", renk: "#ff6b35" };
    return { durum: "Yeterli", renk: "#38b000" };
  };

  const urunEkle = () => {
    if (!yeniUrun.ad || !yeniUrun.miktar || !yeniUrun.minStok || !yeniUrun.birim || !aktifKategori || aktifKategori === "Tümü") return;

    const guncelStok = { ...stok };
    const kategoriUrunleri = guncelStok[aktifKategori] ? [...guncelStok[aktifKategori]] : [];

    kategoriUrunleri.push({
      ...yeniUrun,
      miktar: Number(yeniUrun.miktar),
      minStok: Number(yeniUrun.minStok)
    });

    guncelStok[aktifKategori] = kategoriUrunleri;
    setStok(guncelStok);
    setYeniUrun({ ad: "", miktar: "", minStok: "", birim: "" });
  };

  const urunSil = (urunAdi, kategori) => {
    const guncelStok = { ...stok };
    guncelStok[kategori] = guncelStok[kategori].filter(u => u.ad !== urunAdi);
    setStok(guncelStok);
  };

  const urunDuzenle = (urun, kategori) => {
    const urunIndex = stok[kategori].findIndex(u => u.ad === urun.ad);
    setDuzenleModal({ acik: true, urun, index: urunIndex, kategori });
    setDuzenleMiktar(urun.miktar.toString());
    setDuzenleMinStok(urun.minStok.toString());
  };

  const miktarKaydet = () => {
    if (!duzenleMiktar || !duzenleMinStok || !duzenleModal.kategori || duzenleModal.index === -1) return;
    const yeniStok = { ...stok };
    yeniStok[duzenleModal.kategori][duzenleModal.index].miktar = Number(duzenleMiktar);
    yeniStok[duzenleModal.kategori][duzenleModal.index].minStok = Number(duzenleMinStok);
    setStok(yeniStok);
    setDuzenleModal({ acik: false, urun: null, index: -1, kategori: "" });
  };

  const handlePageChange = (sayfaNumarasi) => {
    setMevcutSayfa(sayfaNumarasi);
  };

  return (
    <div style={{ maxWidth: 1000, margin: "32px auto", background: "#f8f9fa", borderRadius: 16, boxShadow: "0 2px 12px #0001", padding: 32 }}>
      <h2 style={{ margin: "0 0 16px 0", color: "#1a3c34", fontWeight: 700 }}>Stok Güncelleme</h2>
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
        <div style={{ display: "flex", gap: 12, margin: "20px 0 28px 0", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Ürün adı"
            value={yeniUrun.ad}
            onChange={e => setYeniUrun({ ...yeniUrun, ad: e.target.value })}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb", fontSize: 15, width: 150 }}
          />
          <input
            type="number"
            placeholder="Miktar"
            value={yeniUrun.miktar}
            onChange={e => setYeniUrun({ ...yeniUrun, miktar: e.target.value })}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb", fontSize: 15, width: 80 }}
          />
          <input
            type="number"
            placeholder="Min. Stok"
            value={yeniUrun.minStok}
            onChange={e => setYeniUrun({ ...yeniUrun, minStok: e.target.value })}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb", fontSize: 15, width: 80 }}
          />
          <select
            value={yeniUrun.birim}
            onChange={e => setYeniUrun({ ...yeniUrun, birim: e.target.value })}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb", fontSize: 15, width: 100 }}
          >
            <option value="">Birim</option>
            <option value="porsiyon">porsiyon</option>
            <option value="adet">adet</option>
            <option value="kg">kg</option>
            <option value="litre">litre</option>
          </select>
          <button onClick={urunEkle} style={{ background: "#1a3c34", color: "#fff", border: "none", borderRadius: 6, padding: "8px 24px", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Ekle</button>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8, minHeight: '550px' }}>
        {mevcutSayfaUrunleri.map((urun, i) => {
          const durum = stokDurumu(urun.miktar, urun.minStok);
          return (
            <div key={`${urun.ad}-${i}`} style={{ display: "flex", alignItems: "center", background: "#fff", borderRadius: 10, boxShadow: "0 1px 6px #0001", padding: "12px 20px", gap: 20 }}>
              <div style={{ flex: 1, fontWeight: 600, fontSize: 17, color: "#1a3c34" }}>{urun.ad}</div>
              <div style={{ fontWeight: 600, fontSize: 17, color: "#1a3c34", minWidth: 80 }}>{urun.miktar} {urun.birim}</div>
              <div style={{ fontWeight: 600, fontSize: 17, color: "#666", minWidth: 80 }}>Min: {urun.minStok}</div>
              <div style={{
                fontWeight: 600,
                fontSize: 15,
                color: "#fff",
                background: durum.renk,
                padding: "4px 12px",
                borderRadius: 12,
                minWidth: 80,
                textAlign: "center"
              }}>
                {durum.durum}
              </div>
              <>
                <button onClick={() => urunDuzenle(urun, urun.kategori)} style={{ background: "#1a3c34", color: "#fff", border: "none", borderRadius: 6, padding: "7px 18px", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Düzenle</button>
                <button onClick={() => urunSil(urun.ad, urun.kategori)} style={{ background: "#d90429", color: "#fff", border: "none", borderRadius: 6, padding: "7px 18px", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Sil</button>
              </>
            </div>
          );
        })}
      </div>

      {/* Sayfalama Butonları */}
      {toplamSayfaSayisi > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 24 }}>
          <button
            onClick={() => handlePageChange(mevcutSayfa - 1)}
            disabled={mevcutSayfa === 1}
            style={{ ...paginationButtonStyle, opacity: mevcutSayfa === 1 ? 0.5 : 1 }}
          >
            Önceki
          </button>
          {Array.from({ length: toplamSayfaSayisi }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              style={{
                ...paginationButtonStyle,
                background: mevcutSayfa === i + 1 ? "#1a3c34" : "#e0e0e0",
                color: mevcutSayfa === i + 1 ? "#fff" : "#1a3c34",
              }}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(mevcutSayfa + 1)}
            disabled={mevcutSayfa === toplamSayfaSayisi}
            style={{ ...paginationButtonStyle, opacity: mevcutSayfa === toplamSayfaSayisi ? 0.5 : 1 }}
          >
            Sonraki
          </button>
        </div>
      )}

      {/* Düzenleme Modal */}
      {duzenleModal.acik && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 12,
            padding: 32,
            minWidth: 400,
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
          }}>
            <h3 style={{ margin: "0 0 20px 0", color: "#1a3c34" }}>Stok Bilgilerini Düzenle</h3>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{duzenleModal.urun?.ad}</div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Miktar:</label>
                <input
                  type="number"
                  placeholder="Yeni miktar"
                  value={duzenleMiktar}
                  onChange={e => setDuzenleMiktar(e.target.value)}
                  style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb", fontSize: 15, width: "100%" }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Minimum Stok:</label>
                <input
                  type="number"
                  placeholder="Minimum stok"
                  value={duzenleMinStok}
                  onChange={e => setDuzenleMinStok(e.target.value)}
                  style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb", fontSize: 15, width: "100%" }}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button onClick={() => {
                setDuzenleModal({ acik: false, urun: null, index: -1, kategori: "" });
                setDuzenleMiktar("");
                setDuzenleMinStok("");
              }} style={{ background: "#6c757d", color: "#fff", border: "none", borderRadius: 6, padding: "8px 20px", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>İptal</button>
              <button onClick={miktarKaydet} style={{ background: "#1a3c34", color: "#fff", border: "none", borderRadius: 6, padding: "8px 20px", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const paginationButtonStyle = {
  border: "none",
  borderRadius: 8,
  padding: "8px 16px",
  fontWeight: 600,
  fontSize: 15,
  cursor: "pointer",
  transition: "all 0.2s",
};

export default StokUpdate;
