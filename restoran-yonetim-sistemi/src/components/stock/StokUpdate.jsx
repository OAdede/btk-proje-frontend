import React, { useState, useContext } from "react";
import { TableContext } from "../../context/TableContext";
import { useTheme } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext"; // AuthContext'i import ettik

const kategoriler = ["Tümü", "Ana Yemek", "Aparatifler", "Fırın", "Izgaralar", "Kahvaltılıklar", "İçecekler", "Tatlılar"];

const URUN_SAYFASI = 10;

function StokUpdate() {
  const { products, addProduct, deleteProduct, updateProduct } = useContext(TableContext);
  const { isDarkMode } = useTheme();
  const { user } = useContext(AuthContext); // Kullanıcı rolünü alıyoruz

  const [aktifKategori, setAktifKategori] = useState("Tümü");
  const [mevcutSayfa, setMevcutSayfa] = useState(1);
  const [yeniUrun, setYeniUrun] = useState({ name: "", price: "", stock: "", minStock: "" });
  const [duzenleModal, setDuzenleModal] = useState({ acik: false, urun: null });
  
  const isAdmin = user.role === 'admin'; // Admin rolünü kontrol ediyoruz

  // Renk paletleri
  const colors = isDarkMode ? {
    background: "#513653",
    cardBackground: "#473653",
    surfaceBackground: "#32263A",
    text: "#ffffff",
    textSecondary: "#e0e0e0",
    border: "#32263A",
    primary: "#A294F9",
    success: "#10B981",
    danger: "#EF4444",
    warning: "#F59E0B"
  } : {
    background: "#F5EFFF",
    cardBackground: "#E5D9F2",
    surfaceBackground: "#CDC1FF",
    text: "#2D1B69",
    textSecondary: "#4A3B76",
    border: "#A294F9",
    primary: "#A294F9",
    success: "#10B981",
    danger: "#EF4444",
    warning: "#F59E0B"
  };

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
    if (miktar <= 0) return { durum: "Tükendi", renk: colors.danger };
    if (miktar <= minStok) return { durum: "Kritik", renk: colors.warning };
    return { durum: "Yeterli", renk: colors.success };
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
    <div style={{ 
      maxWidth: 1000, 
      margin: "32px auto", 
      background: colors.background, 
      borderRadius: 16, 
      boxShadow: "0 2px 12px rgba(0, 0, 0, 0.3)", 
      padding: 32 
    }}>
      <h2 style={{ 
        margin: "0 0 16px 0", 
        color: colors.text, 
        fontWeight: 700 
      }}>
        Ürün & Stok Yönetimi
      </h2>
      
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {kategoriler.map((kategori) => (
          <button 
            key={kategori} 
            onClick={() => setAktifKategori(kategori)} 
            style={{ 
              background: aktifKategori === kategori ? colors.primary : colors.cardBackground, 
              color: aktifKategori === kategori ? "#ffffff" : colors.text, 
              border: "none", 
              borderRadius: 8, 
              padding: "8px 18px", 
              fontWeight: 700, 
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
          >
            {kategori}
          </button>
        ))}
      </div>
      
      {isAdmin && aktifKategori !== "Tümü" && ( // Sadece admin için görünür
        <div style={{ display: "flex", gap: 12, margin: "20px 0 28px 0", alignItems: "center" }}>
          <input 
            type="text" 
            placeholder="Ürün Adı" 
            value={yeniUrun.name} 
            onChange={e => setYeniUrun({ ...yeniUrun, name: e.target.value })} 
            style={{ 
              padding: 8, 
              borderRadius: 6, 
              border: `1px solid ${colors.border}`, 
              background: colors.surfaceBackground,
              color: colors.text,
              flex: 2 
            }} 
          />
          <input 
            type="number" 
            placeholder="Fiyat (₺)" 
            value={yeniUrun.price} 
            onChange={e => setYeniUrun({ ...yeniUrun, price: e.target.value })} 
            style={{ 
              padding: 8, 
              borderRadius: 6, 
              border: `1px solid ${colors.border}`, 
              background: colors.surfaceBackground,
              color: colors.text,
              flex: 1 
            }} 
          />
          <input 
            type="number" 
            placeholder="Stok" 
            value={yeniUrun.stock} 
            onChange={e => setYeniUrun({ ...yeniUrun, stock: e.target.value })} 
            style={{ 
              padding: 8, 
              borderRadius: 6, 
              border: `1px solid ${colors.border}`, 
              background: colors.surfaceBackground,
              color: colors.text,
              flex: 1 
            }} 
          />
          <input 
            type="number" 
            placeholder="Min. Stok" 
            value={yeniUrun.minStock} 
            onChange={e => setYeniUrun({ ...yeniUrun, minStock: e.target.value })} 
            style={{ 
              padding: 8, 
              borderRadius: 6, 
              border: `1px solid ${colors.border}`, 
              background: colors.surfaceBackground,
              color: colors.text,
              flex: 1 
            }} 
          />
          <button 
            onClick={urunEkle} 
            style={{ 
              background: colors.primary, 
              color: "#ffffff", 
              border: "none", 
              borderRadius: 6, 
              padding: "8px 24px", 
              fontWeight: 600, 
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
          >
            Ekle
          </button>
        </div>
      )}
      
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8, minHeight: '550px' }}>
        {mevcutSayfaUrunleri.map((urun) => {
          const durum = stokDurumu(urun.stock, urun.minStock);
          return (
            <div 
              key={urun.id} 
              style={{ 
                display: "flex", 
                alignItems: "center", 
                background: colors.cardBackground, 
                borderRadius: 10, 
                boxShadow: "0 1px 6px rgba(0, 0, 0, 0.3)", 
                padding: "12px 20px", 
                gap: 20 
              }}
            >
              <div style={{ flex: 3, fontWeight: 600, color: colors.text }}>{urun.name}</div>
              <div style={{ flex: 1, fontWeight: 500, color: colors.text }}>{urun.price} ₺</div>
              <div style={{ flex: 1, fontWeight: 500, color: colors.text }}>{urun.stock} adet</div>
              <div style={{ flex: 1, fontWeight: 500, color: colors.text }}>Min: {urun.minStock}</div>
              <div style={{ 
                flex: 1.5, 
                textAlign: 'center', 
                fontWeight: 600, 
                color: "#ffffff", 
                background: durum.renk, 
                padding: "4px 12px", 
                borderRadius: 12 
              }}>
                {durum.durum}
              </div>
              {isAdmin && ( // Sadece admin için görünür
                <>
                  <button 
                    onClick={() => urunDuzenle(urun)} 
                    style={{ 
                      background: colors.primary, 
                      color: "#ffffff", 
                      border: "none", 
                      borderRadius: 6, 
                      padding: "7px 18px", 
                      fontWeight: 600, 
                      cursor: "pointer",
                      transition: "all 0.3s ease"
                    }}
                  >
                    Düzenle
                  </button>
                  <button 
                    onClick={() => urunSil(urun)} 
                    style={{ 
                      background: colors.danger, 
                      color: "#ffffff", 
                      border: "none", 
                      borderRadius: 6, 
                      padding: "7px 18px", 
                      fontWeight: 600, 
                      cursor: "pointer",
                      transition: "all 0.3s ease"
                    }}
                  >
                    Sil
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
      
      {toplamSayfaSayisi > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 24 }}>
          {/* Sayfalama butonları buraya eklenebilir */}
        </div>
      )}
      
      {isAdmin && duzenleModal.acik && ( // Sadece admin için görünür
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
            background: colors.cardBackground, 
            borderRadius: 12, 
            padding: 32, 
            minWidth: 400, 
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            border: `1px solid ${colors.border}`
          }}>
            <h3 style={{ margin: "0 0 20px 0", color: colors.text }}>Ürün Bilgilerini Düzenle</h3>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 600, marginBottom: 8, color: colors.text }}>{duzenleModal.urun?.name}</div>
              <label style={{ color: colors.text }}>Fiyat:</label>
              <input 
                type="number" 
                value={duzenleModal.urun.price} 
                onChange={e => handleModalChange('price', Number(e.target.value))} 
                style={{ 
                  width: "100%", 
                  padding: 8, 
                  marginBottom: 12,
                  background: colors.surfaceBackground,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 6
                }} 
              />
              <label style={{ color: colors.text }}>Stok:</label>
              <input 
                type="number" 
                value={duzenleModal.urun.stock} 
                onChange={e => handleModalChange('stock', Number(e.target.value))} 
                style={{ 
                  width: "100%", 
                  padding: 8, 
                  marginBottom: 12,
                  background: colors.surfaceBackground,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 6
                }} 
              />
              <label style={{ color: colors.text }}>Min. Stok:</label>
              <input 
                type="number" 
                value={duzenleModal.urun.minStock} 
                onChange={e => handleModalChange('minStock', Number(e.target.value))} 
                style={{ 
                  width: "100%", 
                  padding: 8, 
                  marginBottom: 12,
                  background: colors.surfaceBackground,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 6
                }} 
              />
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button 
                onClick={() => setDuzenleModal({ acik: false, urun: null })} 
                style={{ 
                  background: "#6c757d", 
                  color: "#ffffff", 
                  border: "none", 
                  borderRadius: 6, 
                  padding: "8px 20px", 
                  fontWeight: 600, 
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
              >
                İptal
              </button>
              <button 
                onClick={miktarKaydet} 
                style={{ 
                  background: colors.primary, 
                  color: "#ffffff", 
                  border: "none", 
                  borderRadius: 6, 
                  padding: "8px 20px", 
                  fontWeight: 600, 
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
              >
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
