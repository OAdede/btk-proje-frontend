import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TableContext } from "../../context/TableContext";
import { AuthContext } from "../../context/AuthContext";
import NoteModal from "../../components/shared/NoteModal";
import "./OrderPage.css"; // Aynı stilleri kullanabiliriz

export default function FastOrderPage() {
  const navigate = useNavigate();
  const { products, processPayment, saveFinalOrder, refreshProductAvailability, isRefreshingAvailability, availabilityNotification } = useContext(TableContext);
  const { user } = useContext(AuthContext);

  const [cart, setCart] = useState({});
  const [activeCategory, setActiveCategory] = useState("Ana Yemek");

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [selectedProductForNote, setSelectedProductForNote] = useState(null);

  const fakeTableId = "fast"; // Hızlı siparişler için sabit ID

  // Sayfa yüklendiğinde stok durumunu güncelle
  useEffect(() => {
    refreshProductAvailability();
  }, []);

  const handleQuantityChange = (product, delta) => {
    const currentItem = cart[product.id] || { ...product, count: 0, note: "" };
    const newQty = currentItem.count + delta;

    if (newQty < 0 || newQty > product.stock) {
      if (newQty > product.stock) {
        alert(`Stok yetersiz! Maksimum ${product.stock} adet eklenebilir.`);
      }
      return;
    }

    const newCart = { ...cart };
    if (newQty === 0) {
      delete newCart[product.id];
    } else {
      newCart[product.id] = { ...product, count: newQty };
    }

    setCart(newCart);
  };

  const handleEditNote = (productId) => {
    setSelectedProductForNote(productId);
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = (note) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[selectedProductForNote]) {
        updated[selectedProductForNote].note = note;
      }
      return updated;
    });
    setIsNoteModalOpen(false);
    setSelectedProductForNote(null);
  };

  const handleConfirmFastOrder = () => {
    saveFinalOrder(fakeTableId, cart);
    alert("Hızlı sipariş oluşturuldu ve ödeme alındı.");
    setCart({});
    navigate(`/${user.role}/home`);
  };

  const currentTotalPrice = Object.values(cart).reduce(
    (sum, item) => sum + item.count * item.price,
    0
  );

  const quickNotes = ["Soğansız", "Acılı", "Az Pişmiş", "Sos Ayrı", "Ekstra Peynir", "İçecek Buzsuz"];

  return (
    <>
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={handleSaveNote}
        currentNote={(cart[selectedProductForNote]?.note || "")}
        quickNotes={quickNotes}
      />
      
      {/* Notification Display */}
      {availabilityNotification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '12px 20px',
          backgroundColor: availabilityNotification.type === 'success' ? '#28a745' : '#dc3545',
          color: 'white',
          borderRadius: '4px',
          zIndex: 1000,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          fontSize: '14px'
        }}>
          {availabilityNotification.message}
        </div>
      )}
      
      <div className="order-page-container">
        <div className="order-main-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="order-page-title">Hızlı Sipariş</h2>
            <button 
              onClick={refreshProductAvailability}
              disabled={isRefreshingAvailability}
              style={{
                padding: '8px 16px',
                backgroundColor: isRefreshingAvailability ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isRefreshingAvailability ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
              title="Stok durumunu güncelle"
            >
              {isRefreshingAvailability ? '⏳ Güncelleniyor...' : '🔄 Stok Güncelle'}
            </button>
          </div>
          <div className="category-buttons">
            {products && Object.keys(products).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`category-button ${activeCategory === cat ? "active" : ""}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="product-grid">
            {(products[activeCategory] || []).map((product) => {
              const cartCount = cart[product.id]?.count || 0;
              const displayStock = product.stock - cartCount;

              // Stok durumuna göre stil ve mesaj belirle
              let stockStatus = '';
              let stockMessage = '';
              let stockColor = '';
              
              if (displayStock <= 0) {
                  stockStatus = 'out-of-stock';
                  stockMessage = 'Tükendi';
                  stockColor = '#dc3545';
              } else if (displayStock <= 3) {
                  stockStatus = 'low-stock';
                  stockMessage = `Son ${displayStock} adet`;
                  stockColor = '#ffc107';
              } else {
                  stockMessage = `${displayStock} adet`;
                  stockColor = '#28a745';
              }

              return (
                <div key={product.id} className={`product-card ${stockStatus}`}>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-details">{product.price}₺</p>
                    <p className="stock-info" style={{ 
                        color: stockColor, 
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        margin: '4px 0'
                    }}>
                        📦 {stockMessage}
                    </p>
                    {product.description && (
                        <p className="product-description">{product.description}</p>
                    )}
                  </div>
                  <div className="quantity-controls">
                    <button 
                        onClick={() => handleQuantityChange(product, -1)} 
                        className="quantity-button"
                        disabled={cartCount <= 0}
                    >-</button>
                    <span className="quantity-display">{cartCount}</span>
                    <button 
                        onClick={() => handleQuantityChange(product, 1)} 
                        className="quantity-button"
                        disabled={displayStock <= 0}
                    >+</button>
                  </div>
                  {cartCount > 0 && (
                    <button onClick={() => handleEditNote(product.id)} className="note-button">
                      Not
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <div className="action-buttons">
            <button onClick={() => navigate(-1)} className="btn-back">Geri</button>
            <button
              onClick={handleConfirmFastOrder}
              className="btn-next"
              disabled={Object.keys(cart).length === 0}
            >
              Siparişi Onayla ve Ödeme al

            </button>
          </div>
        </div>
        <div className="sidebar-cart">
          <h3 className="sidebar-title">Sipariş Sepeti</h3>
          {Object.keys(cart).length > 0 ? (
            <>
              <ul className="cart-list">
                {Object.values(cart).map((item) => (
                  <li key={item.id} className="cart-item">
                    <div className="cart-item-details">
                      <span className="cart-item-name">{item.name}</span>
                      {item.note && <span className="cart-item-note">Not: {item.note}</span>}
                      <span className="cart-item-pricing">{item.count} x {item.price}₺ = {item.count * item.price}₺</span>
                    </div>
                    <div className="cart-item-controls">
                      <button onClick={() => handleQuantityChange(item, -1)} className="cart-item-quantity-btn">-</button>
                      <span className="cart-item-quantity">{item.count}</span>
                      <button onClick={() => handleQuantityChange(item, 1)} className="cart-item-quantity-btn">+</button>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="total-price">
                <span>Toplam:</span>
                <span>{currentTotalPrice}₺</span>
              </p>
            </>
          ) : (
            <p className="empty-cart-message">Sepet boş.</p>
          )}
        </div>
      </div>
    </>
  );
}
 