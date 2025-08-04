import React, { useState, useContext } from "react";
import { TableContext } from "../../context/TableContext";

const kategoriler = ["Tümü", "Ana Yemek", "Aparatifler", "Fırın", "Izgaralar", "Kahvaltılıklar", "İçecekler", "Tatlılar"];

const URUN_SAYFASI = 10;

function StokUpdate() {
  const { products, addProduct, deleteProduct, updateProduct } = useContext(TableContext);

  const [aktifKategori, setAktifKategori] = useState("Tümü");
  const [mevcutSayfa, setMevcutSayfa] = useState(1);
  const [yeniUrun, setYeniUrun] = useState({ name: "", price: "", stock: "", minStock: "" });
  const [duzenleModal, setDuzenleModal] = useState({ acik: false, urun: null });

  // DOĞRU FİLTRELEME MANTIĞI:
  // "Tümü" seçiliyse tüm kategorileri birleştirip göster,
  // değilse sadece aktif olan kategorinin ürünlerini göster.
  const gosterilecekUrunler =
    aktifKategori === "Tümü"
      ? Object.entries(products).flatMap(([category, productList]) =>
        productList.map(product => ({ ...product, category }))
      )
      : products[aktifKategori]?.map(product => ({ ...product, category: aktifKategori })) || [];

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
    if (!yeniUrun.name || !yeniUrun.price || !yeniUrun.stock || !yeniUrun.minStock || !aktifKategori || aktifKategori === "Tümü") {
      alert("Lütfen tüm alanları doldurun ve bir kategori seçin.");
      return;
    }
    const productData = {
      name: yeniUrun.name,
      price: Number(yeniUrun.price),
      stock: Number(yeniUrun.stock),
      minStock: Number(yeniUrun.minStock),
    };
    addProduct(aktifKategori, productData);
    setYeniUrun({ name: "", price: "", stock: "", minStock: "" });
  };

  const urunSil = (urun) => {
    if (window.confirm(`${urun.name} ürününü silmek istediğinizden emin misiniz?`)) {
      deleteProduct(urun.category, urun.id);
    }
  };

  const urunDuzenle = (urun) => {
    setDuzenleModal({ acik: true, urun: { ...urun } });
  };

  const miktarKaydet = () => {
    if (!duzenleModal.urun) return;
    updateProduct(duzenleModal.urun.category, duzenleModal.urun);
    setDuzenleModal({ acik: false, urun: null });
  };

  const handleModalChange = (field, value) => {
    setDuzenleModal(prev => ({
      ...prev,
      urun: { ...prev.urun, [field]: value }
    }));
  }

  return (
    <div style={{ maxWidth: 1000, margin: "32px auto", background: "#f8f9fa", borderRadius: 16, boxShadow: "0 2px 12px #0001", padding: 32 }}>
      <h2 style={{ margin: "0 0 16px 0", color: "#1a3c34", fontWeight: 700 }}>Stok Yönetimi</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {kategoriler.map((kategori) => (
          <button key={kategori} onClick={() => setAktifKategori(kategori)} style={{ background: aktifKategori === kategori ? "#1a3c34" : "#e0e0e0", color: aktifKategori === kategori ? "#fff" : "#1a3c34", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 700, cursor: "pointer" }}>
            {kategori}
          </button>
        ))}
      </div>
      {aktifKategori !== "Tümü" && (
        <div style={{ display: "flex", gap: 12, margin: "20px 0 28px 0", alignItems: "center" }}>
          <input type="text" placeholder="Ürün Adı" value={yeniUrun.name} onChange={e => setYeniUrun({ ...yeniUrun, name: e.target.value })} style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb", flex: 2 }} />
          <input type="number" placeholder="Fiyat (₺)" value={yeniUrun.price} onChange={e => setYeniUrun({ ...yeniUrun, price: e.target.value })} style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb", flex: 1 }} />
          <input type="number" placeholder="Stok" value={yeniUrun.stock} onChange={e => setYeniUrun({ ...yeniUrun, stock: e.target.value })} style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb", flex: 1 }} />
          <input type="number" placeholder="Min. Stok" value={yeniUrun.minStock} onChange={e => setYeniUrun({ ...yeniUrun, minStock: e.target.value })} style={{ padding: 8, borderRadius: 6, border: "1px solid #bbb", flex: 1 }} />
          <button onClick={urunEkle} style={{ background: "#1a3c34", color: "#fff", border: "none", borderRadius: 6, padding: "8px 24px", fontWeight: 600, cursor: "pointer" }}>Ekle</button>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8, minHeight: '550px' }}>
        {mevcutSayfaUrunleri.map((urun) => {
          const durum = stokDurumu(urun.stock, urun.minStock);
          return (
            <div key={urun.id} style={{ display: "flex", alignItems: "center", background: "#fff", borderRadius: 10, boxShadow: "0 1px 6px #0001", padding: "12px 20px", gap: 20 }}>
              <div style={{ flex: 3, fontWeight: 600 }}>{urun.name}</div>
              <div style={{ flex: 1, fontWeight: 500 }}>{urun.price} ₺</div>
              <div style={{ flex: 1, fontWeight: 500 }}>{urun.stock} adet</div>
              <div style={{ flex: 1, fontWeight: 500 }}>Min: {urun.minStock}</div>
              <div style={{ flex: 1.5, textAlign: 'center', fontWeight: 600, color: "#fff", background: durum.renk, padding: "4px 12px", borderRadius: 12 }}>{durum.durum}</div>
              <button onClick={() => urunDuzenle(urun)} style={{ background: "#1a3c34", color: "#fff", border: "none", borderRadius: 6, padding: "7px 18px", fontWeight: 600, cursor: "pointer" }}>Düzenle</button>
              <button onClick={() => urunSil(urun)} style={{ background: "#d90429", color: "#fff", border: "none", borderRadius: 6, padding: "7px 18px", fontWeight: 600, cursor: "pointer" }}>Sil</button>
            </div>
          );
        })}
      </div>
      {toplamSayfaSayisi > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 24 }}>
          {/* Sayfalama butonları buraya eklenebilir */}
        </div>
      )}
      {duzenleModal.acik && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 32, minWidth: 400, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
            <h3 style={{ margin: "0 0 20px 0", color: "#1a3c34" }}>Ürün Bilgilerini Düzenle</h3>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{duzenleModal.urun?.name}</div>
              <label>Fiyat:</label><input type="number" value={duzenleModal.urun.price} onChange={e => handleModalChange('price', Number(e.target.value))} style={{ width: "100%", padding: 8, marginBottom: 12 }} />
              <label>Stok:</label><input type="number" value={duzenleModal.urun.stock} onChange={e => handleModalChange('stock', Number(e.target.value))} style={{ width: "100%", padding: 8, marginBottom: 12 }} />
              <label>Min. Stok:</label><input type="number" value={duzenleModal.urun.minStock} onChange={e => handleModalChange('minStock', Number(e.target.value))} style={{ width: "100%", padding: 8, marginBottom: 12 }} />
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button onClick={() => setDuzenleModal({ acik: false, urun: null })} style={{ background: "#6c757d", color: "#fff", border: "none", borderRadius: 6, padding: "8px 20px", fontWeight: 600, cursor: "pointer" }}>İptal</button>
              <button onClick={miktarKaydet} style={{ background: "#1a3c34", color: "#fff", border: "none", borderRadius: 6, padding: "8px 20px", fontWeight: 600, cursor: "pointer" }}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StokUpdate;
