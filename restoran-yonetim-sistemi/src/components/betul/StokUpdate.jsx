import React, { useState, useContext } from "react";
import { TableContext } from "../../context/TableContext.jsx";
import "./App.css";

const kategoriler = ["Tümü", "Ana Yemek", "Aparatifler", "Fırın", "Izgaralar", "Kahvaltılıklar", "İçecekler", "Tatlılar"];
const URUN_SAYFASI = 10;

function StokUpdate() {
  const { products, setProducts } = useContext(TableContext);

  const [aktifKategori, setAktifKategori] = useState("Tümü");
  const [mevcutSayfa, setMevcutSayfa] = useState(1);
  const [yeniUrun, setYeniUrun] = useState({ ad: "", miktar: "", minStok: "", birim: "porsiyon", fiyat: "" });
  const [duzenleModal, setDuzenleModal] = useState({ acik: false, urun: null, kategori: "" });

  const tumUrunler = Object.entries(products).flatMap(([kategori, urunler]) =>
    urunler.map(urun => ({ ...urun, kategori }))
  );

  const gosterilecekUrunler = aktifKategori === "Tümü"
    ? tumUrunler
    : products[aktifKategori]?.map(u => ({ ...u, kategori: aktifKategori })) || [];

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
    if (!yeniUrun.ad || !yeniUrun.miktar || !yeniUrun.minStok || !yeniUrun.birim || !yeniUrun.fiyat || !aktifKategori || aktifKategori === "Tümü") return;

    const guncelProducts = { ...products };
    const kategoriUrunleri = guncelProducts[aktifKategori] ? [...guncelProducts[aktifKategori]] : [];

    const yeniUrunObjesi = {
      id: Date.now(), // Basit bir ID
      name: yeniUrun.ad,
      price: Number(yeniUrun.fiyat),
      stock: Number(yeniUrun.miktar),
      minStok: Number(yeniUrun.minStok), // Formdan minStok da alınabilir
      birim: yeniUrun.birim,
    };

    kategoriUrunleri.push(yeniUrunObjesi);
    guncelProducts[aktifKategori] = kategoriUrunleri;
    setProducts(guncelProducts);
    setYeniUrun({ ad: "", miktar: "", minStok: "", birim: "porsiyon", fiyat: "" });
  };

  const urunSil = (urunId, kategori) => {
    const guncelProducts = { ...products };
    guncelProducts[kategori] = guncelProducts[kategori].filter(u => u.id !== urunId);
    setProducts(guncelProducts);
  };

  const handleDuzenleKaydet = (duzenlenmisUrun) => {
    const guncelProducts = { ...products };
    const kategoriUrunleri = [...guncelProducts[duzenlenmisUrun.kategori]];
    const index = kategoriUrunleri.findIndex(u => u.id === duzenlenmisUrun.id);
    if (index !== -1) {
      kategoriUrunleri[index] = {
        id: duzenlenmisUrun.id,
        name: duzenlenmisUrun.ad,
        price: Number(duzenlenmisUrun.fiyat),
        stock: Number(duzenlenmisUrun.miktar),
        minStok: Number(duzenlenmisUrun.minStok),
        birim: duzenlenmisUrun.birim
      };
    }
    guncelProducts[duzenlenmisUrun.kategori] = kategoriUrunleri;
    setProducts(guncelProducts);
    setDuzenleModal({ acik: false, urun: null, kategori: "" });
  };

  return (
    <div style={{ maxWidth: 1000, margin: "32px auto", background: "#f8f9fa", borderRadius: 16, boxShadow: "0 2px 12px #0001", padding: 32 }}>
      <h2 style={{ margin: "0 0 16px 0", color: "#1a3c34", fontWeight: 700 }}>Stok Güncelleme</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {kategoriler.map((kategori) => (
          <button key={kategori} onClick={() => { setAktifKategori(kategori); setMevcutSayfa(1); }} style={{ background: aktifKategori === kategori ? "#1a3c34" : "#e0e0e0", color: aktifKategori === kategori ? "#fff" : "#1a3c34", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
            {kategori}
          </button>
        ))}
      </div>

      {aktifKategori !== "Tümü" && (
        <div style={{ display: "flex", gap: 12, margin: "20px 0 28px 0", flexWrap: "wrap", alignItems: 'center' }}>
          <input type="text" placeholder="Ürün adı" value={yeniUrun.ad} onChange={e => setYeniUrun({ ...yeniUrun, ad: e.target.value })} style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb", fontSize: 15, width: 150 }} />
          <input type="number" placeholder="Fiyat" value={yeniUrun.fiyat} onChange={e => setYeniUrun({ ...yeniUrun, fiyat: e.target.value })} style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb", fontSize: 15, width: 80 }} />
          <input type="number" placeholder="Miktar" value={yeniUrun.miktar} onChange={e => setYeniUrun({ ...yeniUrun, miktar: e.target.value })} style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb", fontSize: 15, width: 80 }} />
          <input type="number" placeholder="Min. Stok" value={yeniUrun.minStok} onChange={e => setYeniUrun({ ...yeniUrun, minStok: e.target.value })} style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb", fontSize: 15, width: 80 }} />
          <select value={yeniUrun.birim} onChange={e => setYeniUrun({ ...yeniUrun, birim: e.target.value })} style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb", fontSize: 15, width: 100 }}>
            <option value="porsiyon">Porsiyon</option>
            <option value="adet">Adet</option>
          </select>
          <button onClick={urunEkle} style={{ background: "#1a3c34", color: "#fff", border: "none", borderRadius: 6, padding: "8px 24px", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Ekle</button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8, minHeight: '550px' }}>
        {mevcutSayfaUrunleri.map((urun) => {
          const durum = stokDurumu(urun.stock, urun.minStok);
          return (
            <div key={urun.id} style={{ display: "flex", alignItems: "center", background: "#fff", borderRadius: 10, boxShadow: "0 1px 6px #0001", padding: "12px 20px", gap: 20 }}>
              <div style={{ flex: 1, fontWeight: 600, fontSize: 17, color: "#1a3c34" }}>{urun.name}</div>
              <div style={{ fontWeight: 600, fontSize: 17, color: "#1a3c34", minWidth: 80 }}>{urun.stock} {urun.birim}</div>
              <div style={{ fontWeight: 600, fontSize: 17, color: "#666", minWidth: 80 }}>Min: {urun.minStok}</div>
              <div style={{ fontWeight: 600, fontSize: 15, color: "#fff", background: durum.renk, padding: "4px 12px", borderRadius: 12, minWidth: 80, textAlign: "center" }}>
                {durum.durum}
              </div>
              <button onClick={() => setDuzenleModal({ acik: true, urun: { ...urun, ad: urun.name, fiyat: urun.price, miktar: urun.stock }, kategori: urun.kategori })} style={{ background: "#1a3c34", color: "#fff", border: "none", borderRadius: 6, padding: "7px 18px", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Düzenle</button>
              <button onClick={() => urunSil(urun.id, urun.kategori)} style={{ background: "#d90429", color: "#fff", border: "none", borderRadius: 6, padding: "7px 18px", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Sil</button>
            </div>
          );
        })}
      </div>

      {duzenleModal.acik && <DuzenleModal urun={duzenleModal.urun} onKaydet={handleDuzenleKaydet} onIptal={() => setDuzenleModal({ acik: false, urun: null, kategori: "" })} />}
    </div>
  );
}

function DuzenleModal({ urun, onKaydet, onIptal }) {
  const [duzenlenenUrun, setDuzenlenenUrun] = useState(urun);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDuzenlenenUrun(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 32, minWidth: 400, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
        <h3 style={{ margin: "0 0 20px 0", color: "#1a3c34" }}>Ürün Bilgilerini Düzenle</h3>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Ürün Adı:</label>
          <input name="ad" value={duzenlenenUrun.ad} onChange={handleChange} style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb", fontSize: 15, width: "100%" }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Fiyat:</label>
          <input name="fiyat" type="number" value={duzenlenenUrun.fiyat} onChange={handleChange} style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb", fontSize: 15, width: "100%" }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Miktar:</label>
          <input name="miktar" type="number" value={duzenlenenUrun.miktar} onChange={handleChange} style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb", fontSize: 15, width: "100%" }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Minimum Stok:</label>
          <input name="minStok" type="number" value={duzenlenenUrun.minStok} onChange={handleChange} style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb", fontSize: 15, width: "100%" }} />
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 20 }}>
          <button onClick={onIptal} style={{ background: "#6c757d", color: "#fff", border: "none", borderRadius: 6, padding: "8px 20px", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>İptal</button>
          <button onClick={() => onKaydet(duzenlenenUrun)} style={{ background: "#1a3c34", color: "#fff", border: "none", borderRadius: 6, padding: "8px 20px", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Kaydet</button>
        </div>
      </div>
    </div>
  );
}

export default StokUpdate;