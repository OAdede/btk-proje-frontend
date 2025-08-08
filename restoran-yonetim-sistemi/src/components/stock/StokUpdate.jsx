import React, { useState, useContext } from "react";
import { TableContext } from "../../context/TableContext";
import { AuthContext } from "../../context/AuthContext.jsx";
import './StokUpdate.css'; // Stil dosyasını import et

const kategoriler = ["Tümü", "Ana Yemek", "Aparatifler", "Fırın", "Izgaralar", "Kahvaltılıklar", "İçecekler", "Tatlılar"];
const URUN_SAYFASI = 10;

function StokUpdate() {
  const { products, addProduct, deleteProduct, updateProduct } = useContext(TableContext);
  const { user } = useContext(AuthContext);

  const [aktifKategori, setAktifKategori] = useState("Tümü");
  const [mevcutSayfa, setMevcutSayfa] = useState(1);
  const [yeniUrun, setYeniUrun] = useState({ name: "", price: "", stock: "", minStock: "" });
  const [duzenleModal, setDuzenleModal] = useState({ acik: false, urun: null });

  const isAdmin = user.role === 'admin';

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
    if (miktar <= 0) return { durum: "Tükendi", renk: 'var(--danger)' };
    if (miktar <= minStok) return { durum: "Kritik", renk: 'var(--warning)' };
    return { durum: "Yeterli", renk: 'var(--success)' };
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
    <div className="stok-update-container">
      <h2 className="stok-update-title">Ürün & Stok Yönetimi</h2>

      <div className="category-filter-buttons">
        {kategoriler.map((kategori) => (
          <button
            key={kategori}
            onClick={() => setAktifKategori(kategori)}
            className={`category-filter-button ${aktifKategori === kategori ? 'active' : ''}`}
          >
            {kategori}
          </button>
        ))}
      </div>

      {isAdmin && aktifKategori !== "Tümü" && (
        <div className="add-product-form">
          <input
            type="text"
            placeholder="Ürün Adı"
            value={yeniUrun.name}
            onChange={e => setYeniUrun({ ...yeniUrun, name: e.target.value })}
            className="product-name-input"
          />
          <input
            type="number"
            placeholder="Fiyat (₺)"
            value={yeniUrun.price}
            onChange={e => setYeniUrun({ ...yeniUrun, price: e.target.value })}
            className="product-price-input"
          />
          <input
            type="number"
            placeholder="Stok"
            value={yeniUrun.stock}
            onChange={e => setYeniUrun({ ...yeniUrun, stock: e.target.value })}
            className="product-stock-input"
          />
          <input
            type="number"
            placeholder="Min. Stok"
            value={yeniUrun.minStock}
            onChange={e => setYeniUrun({ ...yeniUrun, minStock: e.target.value })}
            className="product-minstock-input"
          />
          <button onClick={urunEkle} className="add-product-button">
            Ekle
          </button>
        </div>
      )}

      <div className="product-list">
        {mevcutSayfaUrunleri.map((urun) => {
          const durum = stokDurumu(urun.stock, urun.minStock);
          return (
            <div key={urun.id} className="product-list-item">
              <div className="item-name">{urun.name}</div>
              <div className="item-price">{urun.price} ₺</div>
              <div className="item-stock">{urun.stock} adet</div>
              <div className="item-min-stock">Min: {urun.minStock}</div>
              <div className="item-status" style={{ backgroundColor: durum.renk }}>
                {durum.durum}
              </div>
              {isAdmin && (
                <div className="item-actions">
                  <button onClick={() => urunDuzenle(urun)} className="edit-button">
                    Düzenle
                  </button>
                  <button onClick={() => urunSil(urun)} className="delete-button">
                    Sil
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {toplamSayfaSayisi > 1 && (
        <div className="pagination-buttons">
          {/* Sayfalama butonları buraya eklenebilir */}
        </div>
      )}

      {isAdmin && duzenleModal.acik && (
        <div className="edit-modal-overlay">
          <div className="edit-modal-content">
            <h3>Ürün Bilgilerini Düzenle</h3>
            <div className="edit-modal-form">
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{duzenleModal.urun?.name}</div>
              <label>Fiyat:</label>
              <input
                type="number"
                value={duzenleModal.urun.price}
                onChange={e => handleModalChange('price', Number(e.target.value))}
              />
              <label>Stok:</label>
              <input
                type="number"
                value={duzenleModal.urun.stock}
                onChange={e => handleModalChange('stock', Number(e.target.value))}
              />
              <label>Min. Stok:</label>
              <input
                type="number"
                value={duzenleModal.urun.minStock}
                onChange={e => handleModalChange('minStock', Number(e.target.value))}
              />
            </div>
            <div className="edit-modal-actions">
              <button onClick={() => setDuzenleModal({ acik: false, urun: null })} className="cancel-button">
                İptal
              </button>
              <button onClick={miktarKaydet} className="save-button">
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StokUpdate;
