import React, { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TableContext } from "../../context/TableContext.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";
import NoteModal from "../../components/shared/NoteModal.jsx";
import './OrderPage.css'; // Stil dosyasını import et

export default function OrderPage() {
    const { tableId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [activeCategory, setActiveCategory] = useState("Ana Yemek");
    const [cart, setCart] = useState({});

    // Modal state'leri
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [selectedProductForNote, setSelectedProductForNote] = useState(null);

    const {
        saveFinalOrder,
        orders,
        products,
        ingredients,
        tables,
        processPayment,
        decreaseConfirmedOrderItem,
        increaseConfirmedOrderItem,
        refreshProductAvailability,
        isRefreshingAvailability,
        availabilityNotification
    } = useContext(TableContext);

    // Masa ID'sinden orders verilerini almak için yardımcı fonksiyon
    const getOrderForTable = (tableId) => {
        // Önce backend table ID'sini bul
        const backendTable = tables.find(t => String(t?.tableNumber ?? t?.id) === tableId);
        if (!backendTable) return null;
        
        // Backend table ID'si ile orders'dan sipariş ara
        const backendTableId = String(backendTable.id);
        const order = orders[backendTableId];
        
        // Tamamlanmış siparişleri döndürme
        if (order && order.isCompleted === true) {
            console.log(`Tamamlanmış sipariş ${order.id} masada gösterilmeyecek`);
            return null;
        }
        
        return order || null;
    };

    // UI'de gelen tableId masa numarası olabilir; backend id ile de deneyelim
    const confirmedOrders = (() => {
        const order = getOrderForTable(tableId);
        if (order?.items) return order.items;
        return {};
    })();

    useEffect(() => {
        const order = getOrderForTable(tableId);
        const existingItems = order?.items || {};
        // Her bir ürün için 'note' alanı olduğundan emin ol
        const normalized = Object.keys(existingItems).reduce((acc, key) => {
            const item = existingItems[key];
            acc[key] = { ...item, note: item.note || '' };
            return acc;
        }, {});
        setCart(normalized);
    }, [tableId, orders, tables]);

    // Sayfa yüklendiğinde stok durumunu güncelle
    useEffect(() => {
        refreshProductAvailability();
    }, []);

    const handleQuantityChange = (product, delta) => {
        const initialOrderCount = confirmedOrders[product.id]?.count || 0;
        const availableStock = product.stock + initialOrderCount;

        setCart((prevCart) => {
            const currentItem = prevCart[product.id] || { ...product, count: 0, note: '' };
            const newQty = currentItem.count + delta;

            if (newQty < 0 || newQty > availableStock) {
                if (newQty > availableStock) {
                    alert(`Stok yetersiz! Bu üründen en fazla ${availableStock} adet sipariş edebilirsiniz.`);
                }
                return prevCart;
            }

            const newCart = { ...prevCart };
            if (newQty === 0 && !initialOrderCount) { // Eğer ürün daha önce onaylanmamışsa ve sayısı 0 ise sepetten sil
                delete newCart[product.id];
            } else { // Değilse miktarını güncelle
                newCart[product.id] = { ...currentItem, count: newQty };
            }
            return newCart;
        });
    };

    const handleEditNote = (productId) => {
        setSelectedProductForNote(productId);
        setIsNoteModalOpen(true);
    };

    const handleSaveNote = (note) => {
        const productId = selectedProductForNote;

        setCart(prev => {
            const newCart = { ...prev };
            const itemToUpdate = newCart[productId];

            if (itemToUpdate) {
                newCart[productId] = { ...itemToUpdate, note: note };
            } else {
                // Bu durum, sadece onaylanmış bir ürünün notunu değiştirmek istediğimizde oluşur.
                // Notu değiştirilen ürünü `cart` state'ine ekleyerek değişikliği takip edelim.
                newCart[productId] = { ...confirmedOrders[productId], note: note };
            }
            return newCart;
        });

        setIsNoteModalOpen(false);
        setSelectedProductForNote(null);
    };

    const handleNext = () => {
        // İleri butonuna basıldığında, cart'taki son durumu kaydet
        saveFinalOrder(tableId, cart);
        navigate(`/${user.role}/summary/${tableId}`);
    };

    // **[FIX]** TOPLAM TUTAR HESAPLAMASI DÜZELTİLDİ
    // Artık sadece onaylanmışları değil, sepetteki (cart state'i) tüm ürünleri hesaba katıyoruz.
    const currentTotalPrice = Object.values(cart).reduce(
        (sum, item) => sum + (item.price * item.count),
        0
    );

    const isCashier = user && user.role === 'kasiyer';

    const handlePayment = () => {
        processPayment(tableId);
        alert(`Masa ${tableId} için ödeme alındı.`);
        navigate(`/${user.role}/home`);
    };

    const quickNotes = ["Soğansız", "Acılı", "Az Pişmiş", "Sos Ayrı", "Ekstra Peynir", "İçecek Buzsuz"];

    return (
        <>
            <NoteModal
                isOpen={isNoteModalOpen}
                onClose={() => setIsNoteModalOpen(false)}
                onSave={handleSaveNote}
                currentNote={(cart[selectedProductForNote])?.note || ''}
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
                        <h2 className="order-page-title">Masa {tableId} - Sipariş</h2>
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
                                className={`category-button ${activeCategory === cat ? 'active' : ''}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="product-grid">
                        {(products[activeCategory] || []).map((product) => {
                            const initialOrderCount = confirmedOrders[product.id]?.count || 0;
                            const cartCount = cart[product.id]?.count || 0;
                            const displayStock = product.stock + initialOrderCount - cartCount;

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
                                <div key={product.id || crypto.randomUUID()} className={`product-card ${stockStatus}`}>
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
                                </div>
                            );
                        })}
                    </div>
                    <div className="action-buttons">
                        <button onClick={() => navigate(-1)} className="btn-back">Geri</button>
                        <button onClick={handleNext} className="btn-next">İleri</button>
                    </div>
                </div>
                <div className="sidebar-cart">
                    <h3 className="sidebar-title">Sipariş Sepeti</h3>
                    {Object.keys(cart).length > 0 && Object.values(cart).some(item => item.count > 0) ? (
                        <>
                            <ul className="cart-list">
                                {Object.values(cart).map((item) => {
                                    if (item.count === 0) return null;
                                    const isConfirmed = confirmedOrders[item.id] && confirmedOrders[item.id].count === item.count && confirmedOrders[item.id].note === item.note;
                                    return (
                                        <li key={item.id || crypto.randomUUID()} className={`cart-item ${isConfirmed ? 'confirmed' : ''}`}>
                                            <div className="cart-item-details">
                                                <span className="cart-item-name">{item.name}</span>
                                                {item.note && <span className="cart-item-note">Not: {item.note}</span>}
                                                <span className="cart-item-pricing">{item.count} x {item.price}₺ = {item.price * item.count}₺</span>
                                            </div>
                                            <div className="cart-item-controls">
                                                {/* Sepet içindeki ürünlerin adedini doğrudan cart state'i üzerinden artırıp azaltıyoruz */}
                                                <button onClick={() => handleQuantityChange(item, -1)} className="cart-item-quantity-btn">-</button>
                                                <span className="cart-item-quantity">{item.count}</span>
                                                <button onClick={() => handleQuantityChange(item, 1)} className="cart-item-quantity-btn">+</button>
                                                <button onClick={() => handleEditNote(item.id)} className="note-button">Not</button>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                            <p className="total-price">
                                <span>Toplam Hesap:</span>
                                <span>{currentTotalPrice}₺</span>
                            </p>

                            {isCashier && currentTotalPrice > 0 && (
                                <button onClick={handlePayment} className="payment-button">
                                    Ödeme Al ve Masayı Kapat
                                </button>
                            )}
                        </>
                    ) : (
                        <p className="empty-cart-message">Sepet boş.</p>
                    )}
                </div>
            </div>
        </>
    );
}