import React, { useState, useContext, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TableContext } from "../../../context/TableContext";
import { AuthContext } from "../../../context/AuthContext";

export default function OrderPage() {
    const { tableId } = useParams();
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState("yemekler");
    const [cart, setCart] = useState({});

    // TableContext'ten güncel fonksiyonları ve state'leri al
    const { saveOrder, orders, products, processPayment } = useContext(TableContext);
    const { user } = useContext(AuthContext);

    // Aktif kategoriye göre ürünleri filtrele
    const filteredProducts = useMemo(() => {
        if (!products || !products[activeCategory]) return [];
        return products[activeCategory];
    }, [products, activeCategory]);

    useEffect(() => {
        // Masa değiştiğinde sepeti sıfırla
        setCart({});
    }, [tableId]);

    // Ürün miktarını değiştirme
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

    // "İleri" butonuna basıldığında
    const handleNext = () => {
        if (Object.keys(cart).length === 0) {
            alert("Lütfen siparişe ürün ekleyin.");
            return;
        }
        saveOrder(tableId, cart);
        navigate(`/kasiyer/summary/${tableId}`);
    };

    // Onaylanmış siparişleri ve toplam tutarı hesapla
    const confirmedOrders = orders[tableId] || {};
    const totalConfirmedPrice = Object.values(confirmedOrders).reduce(
        (sum, item) => sum + item.price * item.count,
        0
    );

    const isCashier = user && user.role === 'kasiyer';

    return (
        <div style={{ padding: 30, display: "flex", gap: 50 }}>
            <div style={{ flex: 3 }}>
                <h2 style={{ marginBottom: 20 }}>Masa {tableId} - Sipariş</h2>

                {/* Kategori Butonları */}
                <div style={{ display: "flex", gap: 20, marginBottom: 30 }}>
                    {Object.keys(products).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            style={{
                                padding: "10px 25px", fontSize: "20px", borderRadius: 12,
                                backgroundColor: activeCategory === cat ? "#007bff" : "#ddd",
                                color: activeCategory === cat ? "white" : "black",
                                border: "none", cursor: "pointer",
                            }}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Ürün Listesi */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 20 }}>
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            style={{
                                border: "1px solid #ccc", borderRadius: 10, padding: 15,
                                backgroundColor: product.stock === 0 ? "#e0e0e0" : "#f9f9f9",
                                textAlign: "center", opacity: product.stock === 0 ? 0.6 : 1,
                            }}
                        >
                            <h3>{product.name}</h3>
                            <p>{product.price}₺ | Stok: {product.stock}</p>
                            <div style={{ display: "flex", justifyContent: "center", gap: 10, alignItems: "center" }}>
                                <button onClick={() => handleQuantityChange(product, -1)} disabled={product.stock === 0}>-</button>
                                <span>{cart[product.id]?.count || 0}</span>
                                <button onClick={() => handleQuantityChange(product, 1)} disabled={product.stock === 0 || (cart[product.id]?.count || 0) >= product.stock}>+</button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* İleri ve Geri Butonları */}
                <div style={{ textAlign: "right", marginTop: 30 }}>
                    <button onClick={handleNext} style={{ padding: "15px 40px", fontSize: "18px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", marginRight: "10px" }}>
                        İleri
                    </button>
                    <button onClick={() => navigate(-1)} style={{ padding: "15px 40px", fontSize: "18px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "10px", cursor: "pointer" }}>
                        Geri
                    </button>
                </div>
            </div>

            {/* Onaylanmış Siparişler Bölümü */}
            <div style={{ flex: 2, border: "1px solid #ccc", borderRadius: 10, padding: 15, backgroundColor: "#fafafa", height: "fit-content", maxHeight: "80vh", overflowY: "auto", position: "sticky", top: "30px" }}>
                <h3>Onaylanmış Siparişler</h3>
                {Object.keys(confirmedOrders).length > 0 ? (
                    <>
                        <ul style={{ listStyleType: 'none', padding: 0 }}>
                            {Object.entries(confirmedOrders).map(([id, item]) => (
                                <li key={id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                                    {item.name} x {item.count} = {item.count * item.price}₺
                                </li>
                            ))}
                        </ul>
                        <p style={{ fontWeight: "bold", marginTop: 10, fontSize: "1.2em" }}>
                            Toplam Hesap: {totalConfirmedPrice}₺
                        </p>
                        {isCashier && (
                            <button
                                onClick={() => processPayment(tableId)}
                                style={{
                                    width: "100%", padding: "15px", fontSize: "18px",
                                    backgroundColor: "#28a745", color: "white", border: "none",
                                    borderRadius: "10px", cursor: "pointer", marginTop: "10px"
                                }}
                            >
                                Ödeme Al ve Masayı Kapat
                            </button>
                        )}
                    </>
                ) : (
                    <p>Henüz onaylanmış sipariş yok.</p>
                )}
            </div>
        </div>
    );
}
