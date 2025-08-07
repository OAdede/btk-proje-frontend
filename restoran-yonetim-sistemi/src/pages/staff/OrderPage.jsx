import React, { useState, useContext, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TableContext } from "../../context/TableContext.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";

export default function OrderPage() {
    const { tableId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { colors } = useTheme();

    const [activeCategory, setActiveCategory] = useState("Ana Yemek");
    const [cart, setCart] = useState({});

    const {
        saveFinalOrder,
        orders,
        products,
        processPayment,
        decreaseConfirmedOrderItem,
        increaseConfirmedOrderItem
    } = useContext(TableContext);

    const confirmedOrders = orders[tableId] || {};

    // ✅ Benzersiz sipariş key'i
    const orderKey = useMemo(() => {
        const itemIds = Object.keys(confirmedOrders || {}).sort().join("-");
        return `${tableId}-${itemIds}`;
    }, [tableId, confirmedOrders]);

    const localNoteKey = `generalNote-${orderKey}`;

    const [generalNote, setGeneralNote] = useState(() => {
        return localStorage.getItem(localNoteKey) || '';
    });

    useEffect(() => {
        localStorage.setItem(localNoteKey, generalNote);
    }, [generalNote, localNoteKey]);

    useEffect(() => {
        const existingOrder = orders[tableId] || {};
        setCart(existingOrder);
    }, [tableId, orders]);

    const handleQuantityChange = (product, delta) => {
        const initialOrderCount = orders[tableId]?.[product.id]?.count || 0;
        const availableStock = product.stock + initialOrderCount;

        setCart((prevCart) => {
            const currentItem = prevCart[product.id] || { ...product, count: 0 };
            const newQty = currentItem.count + delta;
            if (newQty < 0 || newQty > availableStock) {
                alert(`Stok yetersiz! Bu üründen en fazla ${availableStock} adet sipariş edebilirsiniz.`);
                return prevCart;
            }

            const newCart = { ...prevCart };
            if (newQty === 0 && !initialOrderCount) {
                delete newCart[product.id];
            } else {
                newCart[product.id] = { ...product, count: newQty };
            }
            return newCart;
        });
    };

    const handleNext = () => {
        saveFinalOrder(tableId, cart);
        navigate(`/${user.role}/summary/${tableId}`);
    };

    const totalConfirmedPrice = Object.values(confirmedOrders).reduce(
        (sum, item) => sum + item.price * item.count,
        0
    );

    const isCashier = user && user.role === 'kasiyer';

    const handlePayment = () => {
        processPayment(tableId);
        alert(`Masa ${tableId} için ödeme alındı.\nNot: ${generalNote || 'Yok'}`);
        localStorage.removeItem(localNoteKey);
        navigate(`/${user.role}/home`);
    };

    const categoryButtonStyle = (cat) => ({
        padding: "12px 28px",
        fontSize: "1rem",
        fontWeight: "600",
        borderRadius: "12px",
        border: "none",
        cursor: "pointer",
        transition: "all 0.3s ease",
        backgroundColor: activeCategory === cat ? colors.primary : '#e9ecef',
        color: activeCategory === cat ? '#ffffff' : '#343a40',
    });

    const quantityButtonStyle = {
        background: '#343a40',
        color: "#ffffff",
        border: "none",
        borderRadius: "8px",
        width: "32px",
        height: "32px",
        fontSize: "1.2rem",
        fontWeight: 'bold',
        cursor: "pointer",
        transition: "background-color 0.2s ease",
    };

    return (
        <div style={{ padding: '2rem', display: "flex", gap: '3rem', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
            <div style={{ flex: 3 }}>
                <h2 style={{ marginBottom: '1.5rem', color: '#212529', fontSize: '2rem' }}>Masa {tableId} - Sipariş</h2>
                <div style={{ display: "flex", gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    {products && Object.keys(products).map((cat) => (
                        <button key={cat} onClick={() => setActiveCategory(cat)} style={categoryButtonStyle(cat)}>
                            {cat}
                        </button>
                    ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: '1.5rem' }}>
                    {(products[activeCategory] || []).map((product) => {
                        const initialOrderCount = orders[tableId]?.[product.id]?.count || 0;
                        const displayStock = product.stock + initialOrderCount - (cart[product.id]?.count || 0);

                        return (
                            <div key={product.id} style={{
                                border: `1px solid #dee2e6`,
                                borderRadius: '12px',
                                padding: '1rem',
                                backgroundColor: displayStock === 0 ? '#f8f9fa' : '#ffffff',
                                textAlign: "center",
                                opacity: displayStock === 0 ? 0.7 : 1,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            }}>
                                <h3 style={{ color: '#212529', margin: "0 0 0.5rem 0", fontSize: '1.25rem' }}>{product.name}</h3>
                                <p style={{ color: '#6c757d', margin: "0 0 1rem 0" }}>{product.price}₺ | Stok: {displayStock}</p>
                                <div style={{ display: "flex", justifyContent: "center", gap: '1rem', alignItems: "center" }}>
                                    <button onClick={() => handleQuantityChange(product, -1)} style={quantityButtonStyle}>-</button>
                                    <span style={{ color: '#212529', fontSize: "1.2rem", fontWeight: "bold" }}>{cart[product.id]?.count || 0}</span>
                                    <button onClick={() => handleQuantityChange(product, 1)} style={quantityButtonStyle}>+</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', gap: '1rem' }}>
                    <button onClick={() => navigate(-1)} style={{ padding: "1rem 2.5rem", fontSize: "1rem", fontWeight: '600', backgroundColor: '#6c757d', color: "#ffffff", border: "none", borderRadius: "10px", cursor: "pointer", transition: "all 0.3s ease" }}>Geri</button>
                    <button onClick={handleNext} style={{ padding: "1rem 2.5rem", fontSize: "1rem", fontWeight: '600', backgroundColor: colors.primary, color: "#ffffff", border: "none", borderRadius: "10px", cursor: "pointer", transition: "all 0.3s ease" }}>İleri</button>
                </div>
            </div>
            <div style={{
                flex: 2,
                border: `1px solid #dee2e6`,
                borderRadius: '12px',
                padding: '1.5rem',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                height: "fit-content",
                maxHeight: "80vh",
                overflowY: "auto",
                position: "sticky",
                top: "2rem",
            }}>
                <h3 style={{ color: '#212529', marginBottom: '1.5rem', borderBottom: '1px solid #dee2e6', paddingBottom: '1rem' }}>Onaylanmış Siparişler</h3>
                {Object.keys(confirmedOrders).length > 0 ? (
                    <>
                        <ul style={{ listStyle: "none", padding: 0 }}>
                            {Object.values(confirmedOrders).map((item) => (
                                <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <span style={{ fontWeight: "600", color: '#495057' }}>{item.name}</span>
                                        <span style={{ color: '#212529', marginLeft: '10px', display: 'block', fontSize: '0.9rem' }}>{item.count} x {item.price}₺ = {item.price * item.count}₺</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <button onClick={() => decreaseConfirmedOrderItem(tableId, item)} style={{ ...quantityButtonStyle, width: '28px', height: '28px' }}>-</button>
                                        <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{item.count}</span>
                                        <button onClick={() => increaseConfirmedOrderItem(tableId, item)} style={{ ...quantityButtonStyle, width: '28px', height: '28px' }}>+</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <p style={{
                            fontWeight: "bold", marginTop: '1.5rem', fontSize: "1.25rem", color: '#212529',
                            borderTop: '1px solid #dee2e6', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between'
                        }}>
                            <span>Toplam Hesap:</span>
                            <span>{totalConfirmedPrice}₺</span>
                        </p>

                        {/* 📝 Not Alanı */}
                        <div style={{ marginTop: '1.5rem' }}>
                            <label htmlFor="generalNote" style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem', color: '#495057' }}>Genel Not</label>
                            <textarea
                                id="generalNote"
                                value={generalNote}
                                onChange={(e) => setGeneralNote(e.target.value)}
                                placeholder="Not ekle (örn: Acılı olsun, servis hızlı gelsin...)"
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #ced4da',
                                    fontSize: '1rem',
                                    resize: 'none',
                                }}
                            />
                            <button
                                onClick={() => {
                                    localStorage.setItem(localNoteKey, generalNote);
                                    alert("Not kaydedildi.");
                                }}
                                style={{
                                    marginTop: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.95rem',
                                    fontWeight: '600',
                                    backgroundColor: '#0d6efd',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Notu Kaydet
                            </button>
                        </div>

                        {isCashier && (
                            <button onClick={handlePayment} style={{
                                width: "100%", padding: "1rem", fontSize: "1rem", fontWeight: '600',
                                backgroundColor: colors.success, color: "#ffffff", border: "none",
                                borderRadius: "10px", cursor: "pointer", marginTop: "1rem",
                                transition: "all 0.3s ease"
                            }}>
                                Ödeme Al ve Masayı Kapat
                            </button>
                        )}
                    </>
                ) : (
                    <p style={{ color: '#6c757d' }}>Henüz onaylanmış sipariş yok.</p>
                )}
            </div>
        </div>
    );
}
