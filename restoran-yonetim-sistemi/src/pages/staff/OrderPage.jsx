import React, { useState, useContext, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { TableContext } from "../../context/TableContext.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";
import NoteModal from "../../components/shared/NoteModal.jsx";
import './OrderPage.css'; // Stil dosyasını import et

const DEBUG_ORDER = (import.meta?.env?.VITE_DEBUG_ORDER === 'true');

export default function OrderPage() {
    const { tableId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useContext(AuthContext);

    const [activeCategory, setActiveCategory] = useState("Ana Yemek");
    const [cart, setCart] = useState({});

    // Modal state'leri
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [selectedProductForNote, setSelectedProductForNote] = useState(null);

    const {
        saveFinalOrder,
        finalizeOrder,
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
            if (DEBUG_ORDER) console.log(`Tamamlanmış sipariş ${order.id} masada gösterilmeyecek`);
            return null;
        }
        
        return order || null;
    };

    // UI'de gelen tableId masa numarası olabilir; backend id ile eşleştir
    const confirmedOrders = (() => {
        const order = getOrderForTable(tableId);
        if (order?.items) return order.items;
        return {};
    })();

    useEffect(() => {
        // Önce Summary'den dönen cart verisini kontrol et
        const restoreCart = location.state?.restoreCart;
        if (restoreCart) {
            if (DEBUG_ORDER) console.log("OrderPage: Restoring cart from Summary", restoreCart);
            setCart(restoreCart);
            // Navigation state'i temizle
            navigate(location.pathname, { replace: true });
            return;
        }
        
        // Normal durum: Backend'den mevcut sipariş verilerini yükle
        const order = getOrderForTable(tableId);
        const existingItems = order?.items || {};
        // Her bir ürün için 'note' alanı olduğundan emin ol
        const normalized = Object.keys(existingItems).reduce((acc, key) => {
            const item = existingItems[key];
            acc[key] = { ...item, note: item.note || '' };
            return acc;
        }, {});
        if (DEBUG_ORDER) console.log("OrderPage: Loading cart from backend", normalized);
        setCart(normalized);
    }, [tableId, orders, tables, location.state]);

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
            
            // Eğer miktar 0 ise ürünü sepetten tamamen kaldır
            if (newQty === 0) {
                delete newCart[product.id];
            } else {
                // Miktar 0'dan büyükse ürünü güncelle
                newCart[product.id] = {
                    ...currentItem,
                    count: newQty
                };
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
        // Sepettaki değişiklikleri doğrudan Summary sayfasına geç
        // Backend'e kaydetme işlemini Summary'de onaylama anında yap
        navigate(`/${user.role}/summary/${tableId}`, { 
            state: { 
                cartData: cart,
                skipBackendSync: true // Backend senkronizasyonunu atla
            } 
        });
    };

    // **[FIX]** TOPLAM TUTAR HESAPLAMASI DÜZELTİLDİ
    // Artık sadece onaylanmışları değil, sepetteki (cart state'i) tüm ürünleri hesaba katıyoruz.
    const currentTotalPrice = Object.values(cart).reduce(
        (sum, item) => sum + (item.price * item.count),
        0
    );

    const isCashier = user && user.role === 'kasiyer';

    const handlePayment = async () => {
        try {
            if (DEBUG_ORDER) console.log("Cashier: Starting payment process");
            
            // Step 1: Check if there are unsaved changes in the cart
            const currentOrder = getOrderForTable(tableId);
            const databaseItems = currentOrder?.items || {};
            const cartItems = cart;
            
            // Compare cart with database to see if there are changes
            const hasChanges = (() => {
                const cartKeys = Object.keys(cartItems);
                const dbKeys = Object.keys(databaseItems);
                
                if (DEBUG_ORDER) console.log("Cashier: Comparing cart vs database", {
                    cartItems: cartKeys.length,
                    databaseItems: dbKeys.length,
                    cartProducts: cartKeys,
                    dbProducts: dbKeys
                });
                
                // Different number of items
                if (cartKeys.length !== dbKeys.length) {
                    if (DEBUG_ORDER) console.log("Cashier: Different number of items detected");
                    return true;
                }
                
                // Check each item for quantity differences
                for (const productId of cartKeys) {
                    const cartItem = cartItems[productId];
                    const dbItem = databaseItems[productId];
                    
                    if (!dbItem || cartItem.count !== dbItem.count) {
                        if (DEBUG_ORDER) console.log(`Cashier: Quantity change detected for product ${productId}:`, {
                            cartCount: cartItem.count,
                            dbCount: dbItem?.count || 0
                        });
                        return true;
                    }
                    
                    // Check for note changes
                    if ((cartItem.note || '') !== (dbItem.note || '')) {
                        if (DEBUG_ORDER) console.log(`Cashier: Note change detected for product ${productId}`);
                        return true;
                    }
                }
                
                if (DEBUG_ORDER) console.log("Cashier: No changes detected between cart and database");
                return false;
            })();
            
            // Step 2: Determine if we need to save the order
            const needsOrderCreation = Object.keys(databaseItems).length === 0 && Object.keys(cartItems).length > 0;
            const needsOrderUpdate = hasChanges && Object.keys(databaseItems).length > 0;
            
            if (DEBUG_ORDER) console.log("Cashier: Order state analysis", {
                needsOrderCreation,
                needsOrderUpdate,
                hasChanges,
                cartItemsCount: Object.keys(cartItems).length,
                databaseItemsCount: Object.keys(databaseItems).length
            });
            
            // Step 2a: Handle order creation for empty tables
            if (needsOrderCreation) {
                if (DEBUG_ORDER) console.log("Cashier: Creating new order for empty table");
                await saveFinalOrder(tableId, cartItems);
                
                // Wait for state update after order creation - longer delay for reliability
                if (DEBUG_ORDER) console.log("Cashier: New order created, waiting for state update...");
                await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
                
                if (DEBUG_ORDER) console.log("Cashier: Order created, proceeding to finalization");
                
            // Step 2b: Handle order updates for existing orders  
            } else if (needsOrderUpdate) {
                if (DEBUG_ORDER) console.log("Cashier: Updating existing order with changes");
                await saveFinalOrder(tableId, cartItems);
                
                if (DEBUG_ORDER) console.log("Cashier: Order updated, proceeding to finalization");
                
            // Step 2c: Check if there's anything to process
            } else if (Object.keys(databaseItems).length === 0) {
                // No cart items and no database items - nothing to process
                alert("Sipariş verilecek ürün bulunamadı.");
                return;
            } else {
                // Order exists and no changes needed - proceed directly to finalization
                if (DEBUG_ORDER) console.log("Cashier: No changes needed, proceeding directly to finalization");
            }
            
            // Step 3: Finalize the order (process stock changes)
            // Note: At this point, an order should exist either from before or just created above
            if (DEBUG_ORDER) console.log("Cashier: Finalizing order to process stock");
            await finalizeOrder(tableId);
            
            // Step 4: Process payment
            if (DEBUG_ORDER) console.log("Cashier: Processing payment");
            await processPayment(tableId);
            
            alert(`Masa ${tableId} için ödeme alındı ve masa kapatıldı.`);
            navigate(`/${user.role}/home`);
        } catch (error) {
            console.error("Payment process error:", error);
            alert(`Ödeme işlemi sırasında hata oluştu: ${error.message}`);
        }
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
                        <button onClick={() => navigate(`/${user.role}/home`)} className="btn-back">Ana Sayfa</button>
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