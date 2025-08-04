import React, { useState, useContext, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TableContext } from "../../../context/TableContext";
import { AuthContext } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";

export default function OrderPage() {
    const { tableId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { colors } = useTheme();
    const [activeCategory, setActiveCategory] = useState("Ana Yemek");
    const [cart, setCart] = useState({});

    const { saveOrder, orders, products, processPayment } = useContext(TableContext);

    const filteredProducts = useMemo(() => {
        if (!products || !products[activeCategory]) return [];
        return products[activeCategory];
    }, [products, activeCategory]);

    useEffect(() => {
        setCart({});
    }, [tableId]);

    const handleQuantityChange = (product, delta) => {
        setCart((prev) => {
            const currentQty = prev[product.id]?.count || 0;
            const newQty = currentQty + delta;

            if (newQty < 0 || newQty > product.stock) return prev;

            const newCart = { ...prev };
            if (newQty === 0) {
                delete newCart[product.id];
            } else {
                newCart[product.id] = { ...product, count: newQty };
            }
            return newCart;
        });
    };

    const handleNext = () => {
        if (Object.keys(cart).length === 0) {
            alert("Lütfen siparişe ürün ekleyin.");
            return;
        }
        saveOrder(tableId, cart);
        navigate(`/${user.role}/summary/${tableId}`);
    };

    const confirmedOrders = orders[tableId] || {};
    const totalConfirmedPrice = Object.values(confirmedOrders).reduce(
        (sum, item) => sum + item.price * item.count,
        0
    );

    const isCashier = user && user.role === 'kasiyer';
    const handlePayment = () => {
        processPayment(tableId);
        alert(`Masa ${tableId} için ödeme alındı.`);
        navigate(`/${user.role}/home`);
    }

    return (
        <div style={{ padding: 30, display: "flex", gap: 50, background: colors.background, color: colors.text }}>
            <div style={{ flex: 3 }}>
                <h2 style={{ marginBottom: 20, color: colors.text }}>Masa {tableId} - Sipariş</h2>

                <div style={{ display: "flex", gap: 10, marginBottom: 30, flexWrap: 'wrap' }}>
                    {Object.keys(products).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            style={{
                                padding: "10px 25px", fontSize: "20px", borderRadius: 12,
                                backgroundColor: activeCategory === cat ? colors.primary : colors.button,
                                color: "#ffffff",
                                border: "none", cursor: "pointer",
                                transition: "all 0.3s ease"
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 20 }}>
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            style={{
                                border: `1px solid ${colors.border}`, borderRadius: 10, padding: 15,
                                backgroundColor: product.stock === 0 ? colors.surface : colors.card,
                                textAlign: "center", opacity: product.stock === 0 ? 0.6 : 1,
                                color: colors.text
                            }}
                        >
                            <h3 style={{ color: colors.text, margin: "0 0 10px 0" }}>{product.name}</h3>
                            <p style={{ color: colors.textSecondary, margin: "0 0 15px 0" }}>{product.price}₺ | Stok: {product.stock}</p>
                            <div style={{ display: "flex", justifyContent: "center", gap: 10, alignItems: "center" }}>
                                <button
                                    onClick={() => handleQuantityChange(product, -1)}
                                    disabled={product.stock === 0}
                                    style={{
                                        background: colors.button,
                                        color: "#ffffff",
                                        border: "none",
                                        borderRadius: "5px",
                                        padding: "5px 10px",
                                        cursor: "pointer",
                                        fontSize: "16px"
                                    }}
                                >-</button>
                                <span style={{ color: colors.text, fontSize: "16px", fontWeight: "bold" }}>{cart[product.id]?.count || 0}</span>
                                <button
                                    onClick={() => handleQuantityChange(product, 1)}
                                    disabled={product.stock === 0 || (cart[product.id]?.count || 0) >= product.stock}
                                    style={{
                                        background: colors.button,
                                        color: "#ffffff",
                                        border: "none",
                                        borderRadius: "5px",
                                        padding: "5px 10px",
                                        cursor: "pointer",
                                        fontSize: "16px"
                                    }}
                                >+</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ textAlign: "right", marginTop: 30 }}>
                    <button onClick={handleNext} style={{
                        padding: "15px 40px",
                        fontSize: "18px",
                        backgroundColor: colors.primary,
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                        marginRight: "10px",
                        transition: "all 0.3s ease"
                    }}>
                        İleri
                    </button>
                    <button onClick={() => navigate(-1)} style={{
                        padding: "15px 40px",
                        fontSize: "18px",
                        backgroundColor: colors.button,
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                        transition: "all 0.3s ease"
                    }}>
                        Geri
                    </button>
                </div>
            </div>

            {/* Onaylanmış Siparişler Bölümü */}
            <div style={{
                flex: 2,
                border: `1px solid ${colors.border}`,
                borderRadius: 10,
                padding: 15,
                backgroundColor: colors.card,
                height: "fit-content",
                maxHeight: "80vh",
                overflowY: "auto",
                position: "sticky",
                top: "30px",
                color: colors.text
            }}>
                <h3 style={{ color: colors.text, marginBottom: 15 }}>Onaylanmış Siparişler</h3>
                {Object.keys(confirmedOrders).length > 0 ? (
                    <>
                        <ul style={{ listStyleType: 'none', padding: 0 }}>
                            {Object.entries(confirmedOrders).map(([id, item]) => (
                                <li key={id} style={{
                                    padding: '8px 0',
                                    borderBottom: `1px solid ${colors.border}`,
                                    color: colors.text
                                }}>
                                    {item.name} x {item.count} = {item.count * item.price}₺
                                </li>
                            ))}
                        </ul>
                        <p style={{
                            fontWeight: "bold",
                            marginTop: 10,
                            fontSize: "1.2em",
                            color: colors.text
                        }}>
                            Toplam Hesap: {totalConfirmedPrice}₺
                        </p>
                        {isCashier && (
                            <button
                                onClick={handlePayment}
                                style={{
                                    width: "100%",
                                    padding: "15px",
                                    fontSize: "18px",
                                    backgroundColor: colors.success,
                                    color: "#ffffff",
                                    border: "none",
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                    marginTop: "10px",
                                    transition: "all 0.3s ease"
                                }}
                            >
                                Ödeme Al ve Masayı Kapat
                            </button>
                        )}
                    </>
                ) : (
                    <p style={{ color: colors.textSecondary }}>Henüz onaylanmış sipariş yok.</p>
                )}
            </div>
        </div>
    );
}
