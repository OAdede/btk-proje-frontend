import React, { useState, useContext } from "react";
import { TableContext } from "../../context/TableContext";
import { AuthContext } from "../../context/AuthContext.jsx";
import './StokUpdate.css';

const URUN_SAYFASI = 10;

function StokUpdate() {
  const { products, ingredients, addProduct, deleteProduct, updateProduct, deleteProductIngredient, updateIngredientStock, addProductIngredient } = useContext(TableContext);
  const { user } = useContext(AuthContext);

  const [aktifSekme, setAktifSekme] = useState("urunler");
  const [aktifKategori, setAktifKategori] = useState("Tümü");
  const [mevcutSayfa, setMevcutSayfa] = useState(1);
  const [yeniUrun, setYeniUrun] = useState({ name: "", price: "", description: "", recipe: [] });
  const [duzenleModal, setDuzenleModal] = useState({ acik: false, urun: null });
  const [icerikGuncelleModal, setIcerikGuncelleModal] = useState({ acik: false, icerik: null, yeniMiktar: '' });
  const [yeniIcerik, setYeniIcerik] = useState({ ingredientId: "", quantity: "" });
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [yeniModalIcerik, setYeniModalIcerik] = useState({ ingredientId: "", quantity: "" });

  const isAdmin = user.role === 'admin';

  const kategoriler = ["Tümü", ...Object.keys(products)];

  const getProductStockStatus = (product) => {
    if (!product.recipe || product.recipe.length === 0) {
      return { durum: "Tanımsız", renk: 'var(--info)' };
    }

    let isCritical = false;
    for (const item of product.recipe) {
      const ingredient = ingredients[item.ingredientId];
      if (!ingredient) {
        return { durum: "Eksik İçerik", renk: 'var(--danger)' };
      }
      if (ingredient.stockQuantity < item.quantity) {
        return { durum: "Tükendi", renk: 'var(--danger)' };
      }
      if (ingredient.stockQuantity < ingredient.minStock + item.quantity) {
        isCritical = true;
      }
    }

    if (isCritical) {
      return { durum: "Kritik", renk: 'var(--warning)' };
    }

    return { durum: "Yeterli", renk: 'var(--success)' };
  };

  const gosterilecekUrunler =
    aktifKategori === "Tümü"
      ? Object.values(products).flat().map(product => ({ ...product, category: product.category }))
      : products[aktifKategori]?.map(product => ({ ...product, category: aktifKategori })) || [];

  const sonUrunIndex = mevcutSayfa * URUN_SAYFASI;
  const ilkUrunIndex = sonUrunIndex - URUN_SAYFASI;
  const mevcutSayfaUrunleri = gosterilecekUrunler.slice(ilkUrunIndex, sonUrunIndex);
  const toplamSayfaSayisi = Math.ceil(gosterilecekUrunler.length / URUN_SAYFASI);

  const urunEkle = () => {
    if (!yeniUrun.name || !yeniUrun.price || !aktifKategori || aktifKategori === "Tümü" || !yeniUrun.description || yeniUrun.recipe.length === 0) {
      alert("Lütfen tüm alanları doldurun ve ürün tarifini ekleyin.");
      return;
    }
    const productData = {
      name: yeniUrun.name,
      price: Number(yeniUrun.price),
      description: yeniUrun.description,
      recipe: yeniUrun.recipe,
    };
    addProduct(aktifKategori, productData);
    setYeniUrun({ name: "", price: "", description: "", recipe: [] });
  };

  const urunSil = async (urun) => {
    if (window.confirm(`${urun.name} ürününü silmek istediğinizden emin misiniz?`)) {
      setIsDeleting(true);
      try {
        await deleteProduct(urun.category, urun.id);
        console.log(`Ürün ${urun.name} başarıyla silindi.`);
      } catch (error) {
        console.error('Ürün silinirken hata:', error);
        alert(`Ürün silinirken hata: ${error.message}`);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const urunDuzenle = (urun) => {
    setDuzenleModal({ acik: true, urun: { ...urun, recipe: urun.recipe || [] } });
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
  };

  const handleAddRecipeItem = () => {
    if (yeniIcerik.ingredientId && yeniIcerik.quantity) {
      setYeniUrun(prev => ({
        ...prev,
        recipe: [...prev.recipe, { ingredientId: parseInt(yeniIcerik.ingredientId), quantity: Number(yeniIcerik.quantity) }]
      }));
      setYeniIcerik({ ingredientId: "", quantity: "" });
    }
  };
  
  const handleRemoveNewRecipeItem = (index) => {
      setYeniUrun(prev => ({
          ...prev,
          recipe: prev.recipe.filter((_, i) => i !== index)
      }));
  };
  
  const handleIngredientQuantityChange = (ingredientId, event) => {
    const newQuantity = parseFloat(event.target.value);
    setDuzenleModal(prev => {
      const updatedRecipe = prev.urun.recipe.map(item => 
          item.ingredientId === ingredientId ? { ...item, quantity: isNaN(newQuantity) ? '' : newQuantity } : item
      );
      return { ...prev, urun: { ...prev.urun, recipe: updatedRecipe } };
    });
  };

  const handleDeleteModalIngredient = async (ingredientId) => {
    await deleteProductIngredient(duzenleModal.urun.id, ingredientId);
    
    setDuzenleModal(prev => {
      const updatedRecipe = prev.urun.recipe.filter(item => item.ingredientId !== ingredientId);
      return { ...prev, urun: { ...prev.urun, recipe: updatedRecipe } };
    });
  };

  const handleAddModalIngredient = async () => {
    if (yeniModalIcerik.ingredientId && yeniModalIcerik.quantity) {
        const newIngredientData = {
            productId: duzenleModal.urun.id,
            ingredientId: parseInt(yeniModalIcerik.ingredientId),
            quantity: parseFloat(yeniModalIcerik.quantity),
        };
        
        await addProductIngredient(duzenleModal.urun.id, newIngredientData);
        
        setDuzenleModal(prev => {
            const updatedRecipe = [...(prev.urun.recipe || []), { 
                ingredientId: newIngredientData.ingredientId, 
                quantity: newIngredientData.quantity 
            }];
            return { ...prev, urun: { ...prev.urun, recipe: updatedRecipe } };
        });

        setYeniModalIcerik({ ingredientId: "", quantity: "" });
    }
  };

  const sonrakiSayfa = () => setMevcutSayfa(prev => Math.min(prev + 1, toplamSayfaSayisi));
  const oncekiSayfa = () => setMevcutSayfa(prev => Math.max(prev - 1, 1));
  const sayfaDegistir = (sayfa) => setMevcutSayfa(sayfa);
    
  const getIngredientStatus = (ingredient) => {
    if (ingredient.stockQuantity === 0) {
      return { durum: "Tükendi", renk: 'var(--danger)' };
    }
    if (ingredient.stockQuantity <= ingredient.minStock) {
      return { durum: "Kritik", renk: 'var(--warning)' };
    }
    return { durum: "Yeterli", renk: 'var(--success)' };
  };
    
  const handleOpenIngredientModal = (ingredient) => {
    setIcerikGuncelleModal({ acik: true, icerik: ingredient, yeniMiktar: ingredient.stockQuantity });
  };

  const handleIngredientStockUpdate = async () => {
    if (!icerikGuncelleModal.icerik || !icerikGuncelleModal.yeniMiktar) return;
        
    const { icerik, yeniMiktar } = icerikGuncelleModal;
    const amount = Number(yeniMiktar) - icerik.stockQuantity;
        
    try {
      await updateIngredientStock(icerik.id, amount);
      setIcerikGuncelleModal({ acik: false, icerik: null, yeniMiktar: '' });
    } catch (error) {
      console.error('Stok güncellenirken bir hata oluştu:', error);
      alert('Stok güncellenirken bir hata oluştu.');
    }
  };
    
  return (
    <div className="stok-update-container">
      <h2 className="stok-update-title">Ürün & Stok Yönetimi</h2>

      <div className="tab-buttons">
          <button
              onClick={() => setAktifSekme("urunler")}
              className={`tab-button ${aktifSekme === 'urunler' ? 'active' : ''}`}
          >
              Ürünler
          </button>
          <button
              onClick={() => setAktifSekme("icerikler")}
              className={`tab-button ${aktifSekme === 'icerikler' ? 'active' : ''}`}
          >
              İçerikler
          </button>
      </div>

      {aktifSekme === "urunler" ? (
        <>
            <div className="category-filter-buttons">
                {kategoriler.map((kategori) => (
                    <button
                        key={kategori}
                        onClick={() => {
                            setAktifKategori(kategori);
                            setMevcutSayfa(1);
                        }}
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
                    <textarea
                        placeholder="Açıklama"
                        value={yeniUrun.description}
                        onChange={e => setYeniUrun({ ...yeniUrun, description: e.target.value })}
                        rows="3"
                        className="product-description-input"
                    />
                    <div className="recipe-form">
                        <select
                            value={yeniIcerik.ingredientId}
                            onChange={e => setYeniIcerik({ ...yeniIcerik, ingredientId: e.target.value })}
                        >
                            <option value="">İçerik Seçin</option>
                            {Object.values(ingredients).map(ing => (
                                <option key={ing.id} value={ing.id}>{ing.name}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            placeholder="Miktar"
                            value={yeniIcerik.quantity}
                            onChange={e => setYeniIcerik({ ...yeniIcerik, quantity: e.target.value })}
                        />
                        <button type="button" onClick={handleAddRecipeItem}>Tarife Ekle</button>
                    </div>
                    {yeniUrun.recipe.length > 0 && (
                        <div className="recipe-list">
                            <strong>Tarif:</strong>
                            <ul>
                                {yeniUrun.recipe.map((item, index) => (
                                    <li key={index} className="modal-recipe-item">
                                        <span>{ingredients[item.ingredientId]?.name}: {item.quantity} {ingredients[item.ingredientId]?.unit}</span>
                                        <button onClick={() => handleRemoveNewRecipeItem(index)}>Sil</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <button onClick={urunEkle} className="add-product-button">
                        Ekle
                    </button>
                </div>
            )}

            <div className="product-list">
                {mevcutSayfaUrunleri.length > 0 ? (
                    mevcutSayfaUrunleri.map((urun) => {
                        const durum = getProductStockStatus(urun);
                        return (
                            <div key={urun.id} className="product-list-item">
                                <div className="item-details">
                                    <div className="item-name">{urun.name}</div>
                                    <div className="item-price">{urun.price} ₺</div>
                                    <div className="item-recipe">
                                        <strong>Tarif:</strong>
                                        {urun.recipe && urun.recipe.length > 0 ? (
                                            <ul>
                                                {urun.recipe.map((item, index) => (
                                                    <li key={index}>
                                                        {ingredients[item.ingredientId]?.name}: {item.quantity} {ingredients[item.ingredientId]?.unit}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span>Tarif bulunamadı.</span>
                                        )}
                                    </div>
                                </div>
                                <div className="item-status-and-actions">
                                    <div className="item-status" style={{ backgroundColor: durum.renk }}>
                                        {durum.durum}
                                    </div>
                                    {isAdmin && (
                                        <div className="item-actions">
                                            <button onClick={() => urunDuzenle(urun)} className="edit-button">
                                                Düzenle
                                            </button>
                                            <button
                                                onClick={() => urunSil(urun)}
                                                className="delete-button"
                                                disabled={isDeleting}
                                            >
                                                {isDeleting ? 'Siliniyor...' : 'Sil'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="no-products-message">Bu kategoride ürün bulunamadı.</p>
                )}
            </div>

            {toplamSayfaSayisi > 1 && (
                <div className="pagination-buttons">
                    <button onClick={oncekiSayfa} disabled={mevcutSayfa === 1}>&laquo;</button>
                    {Array.from({ length: toplamSayfaSayisi }, (_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => sayfaDegistir(index + 1)}
                            className={mevcutSayfa === index + 1 ? 'active' : ''}
                        >
                            {index + 1}
                        </button>
                    ))}
                    <button onClick={sonrakiSayfa} disabled={mevcutSayfa === toplamSayfaSayisi}>&raquo;</button>
                </div>
            )}

            {isAdmin && duzenleModal.acik && (
                <div className="edit-modal-overlay">
                    <div className="edit-modal-content">
                        <h3>Ürün Bilgilerini Düzenle</h3>
                        <div className="edit-modal-form">
                            <div className="modal-item-name">{duzenleModal.urun?.name}</div>
                            <label>Fiyat:</label>
                            <input
                                type="number"
                                value={duzenleModal.urun.price}
                                onChange={e => handleModalChange('price', Number(e.target.value))}
                            />
                        </div>

                        <div className="modal-recipe-section">
                            <div className="item-recipe">
                                <strong>Tarif:</strong>
                                {duzenleModal.urun.recipe && duzenleModal.urun.recipe.length > 0 ? (
                                    <ul>
                                        {duzenleModal.urun.recipe.map((item, index) => (
                                            <li key={index} className="modal-recipe-item">
                                                <span>
                                                    {ingredients[item.ingredientId]?.name}
                                                </span>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={e => handleIngredientQuantityChange(item.ingredientId, e)}
                                                    className="recipe-quantity-input"
                                                />
                                                <span>
                                                    {ingredients[item.ingredientId]?.unit}
                                                </span>
                                                <button 
                                                    onClick={() => handleDeleteModalIngredient(item.ingredientId)}
                                                    className="delete-button"
                                                >
                                                    Sil
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <span>Tarif bulunamadı.</span>
                                )}
                            </div>

                            <div className="recipe-add-form">
                                <strong>Tarife Malzeme Ekle:</strong>
                                <div className="recipe-form">
                                    <select
                                        value={yeniModalIcerik.ingredientId}
                                        onChange={e => setYeniModalIcerik({ ...yeniModalIcerik, ingredientId: e.target.value })}
                                    >
                                        <option value="">İçerik Seçin</option>
                                        {Object.values(ingredients).map(ing => (
                                            <option key={ing.id} value={ing.id}>{ing.name}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        placeholder="Miktar"
                                        value={yeniModalIcerik.quantity}
                                        onChange={e => setYeniModalIcerik({ ...yeniModalIcerik, quantity: e.target.value })}
                                    />
                                    <button type="button" onClick={handleAddModalIngredient} className="modal-add-ingredient-button">Ekle</button>
                                </div>
                            </div>
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
        </>
      ) : (
        <div className="ingredient-list">
            {Object.values(ingredients).length > 0 ? (
                Object.values(ingredients).map((ingredient) => {
                    const durum = getIngredientStatus(ingredient);
                    return (
                        <div key={ingredient.id} className="ingredient-list-item">
                            <div className="item-name">{ingredient.name}</div>
                            <div className="item-stock">{ingredient.stockQuantity} {ingredient.unit}</div>
                            <div className="item-min-stock">Min: {ingredient.minStock} {ingredient.unit}</div>
                            <div className="item-status" style={{ backgroundColor: durum.renk }}>
                                {durum.durum}
                            </div>
                            {isAdmin && (
                                <div className="item-actions">
                                    <button
                                        onClick={() => handleOpenIngredientModal(ingredient)}
                                        className="edit-button"
                                    >
                                        Stok Güncelle
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })
            ) : (
                <p className="no-products-message">Hiç içerik bulunamadı.</p>
            )}
        </div>
      )}
      
      {isAdmin && icerikGuncelleModal.acik && (
        <div className="edit-modal-overlay">
            <div className="edit-modal-content">
                <h3>İçerik Stoğunu Güncelle</h3>
                <div className="edit-modal-form">
                    <div className="modal-item-name">{icerikGuncelleModal.icerik?.name}</div>
                    <label>Yeni Stok Miktarı ({icerikGuncelleModal.icerik?.unit}):</label>
                    <input
                        type="number"
                        value={icerikGuncelleModal.yeniMiktar}
                        onChange={e => setIcerikGuncelleModal(prev => ({ ...prev, yeniMiktar: e.target.value }))}
                    />
                </div>
                <div className="edit-modal-actions">
                    <button
                        onClick={() => setIcerikGuncelleModal({ acik: false, icerik: null, yeniMiktar: '' })}
                        className="cancel-button"
                    >
                        İptal
                    </button>
                    <button onClick={handleIngredientStockUpdate} className="save-button">
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
