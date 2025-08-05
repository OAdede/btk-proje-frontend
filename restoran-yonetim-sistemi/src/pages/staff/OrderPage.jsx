import React, { useState, useContext, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TableContext } from "../../context/TableContext.jsx";


export default function OrderPage() {
    const { tableId } = useParams();
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState("yemekler");
    const [cart, setCart] = useState({});
    const { orders, products, cancelOrder } = useContext(TableContext);

    const isExistingOrderRef = useRef(false);

    useEffect(() => {
        const existingOrder = orders[tableId] || {};
        isExistingOrderRef.current = Object.keys(existingOrder).length > 0;

        const initialCart = {};
        Object.entries(existingOrder).forEach(([id, item]) => {
            initialCart[id] = item.count;
        });

        setCart(initialCart);
    }, [tableId, orders]);

    const handleQuantityChange = (id, delta) => {
        let product = null;

        for (const cat of ["yemekler", "icecekler", "tatlilar"]) {
            const found = products[cat].find((p) => p.id === id);
            if (found) {
                product = found;
                break;
            }
        }

        if (!product) return;

        setCart((prev) => {
            const currentQty = prev[id] || 0;
            const newQty = currentQty + delta;

            if (newQty < 0) return prev;

            const prevOrderQty = orders[tableId]?.[id.toString()]?.count || 0;
            if (newQty > product.stock + prevOrderQty) return prev;

            return { ...prev, [id]: newQty };
        });
    };

    const handleNext = () => {
        const finalItems = {};

        Object.entries(cart).forEach(([id, qty]) => {
            if (qty > 0) {
                let product = null;
                for (const cat of ["yemekler", "icecekler", "tatlilar"]) {
                    const found = products[cat].find((p) => p.id === parseInt(id));
                    if (found) {
                        product = found;
                        break;
                    }
                }

                if (product) {
                    finalItems[id] = {
                        name: product.name,
                        price: product.price,
                        count: qty,
                    };
                }
            }
        });

        navigate(`/summary/${tableId}`, { state: { updatedOrder: finalItems } });
    };

    const handleBack = () => {
        if (isExistingOrderRef.current) {
            // SipariÅŸ zaten vardÄ±, iptal etmeden dÃ¶n
            navigate("/");
        } else {
            // Yeni sipariÅŸti, iptal et ve dÃ¶n
            cancelOrder(tableId);
            navigate("/");
        }
    };

    const currentOrders = orders[tableId] || {};

    return (
        <div style={{ padding: 30, display: "flex", gap: 50 }}>
            {/* Sol Panel */}
            <div style={{ flex: 3 }}>
                <h2>Masa {tableId} - Sipariş</h2>

                {/* Kategori SeÃ§imi */}
                <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
                    {["yemekler", "icecekler", "tatlilar"].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            style={{
                                padding: "10px 20px",
                                backgroundColor: activeCategory === cat ? "#007bff" : "#ddd",
                                color: activeCategory === cat ? "white" : "black",
                                borderRadius: 10,
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            {cat === "yemekler"
                                ? "Yemekler"
                                : cat === "icecekler"
                                    ? "İçecekler"
                                    : "Tatlılar"}
                        </button>
                    ))}
                </div>

                {/* ÃœrÃ¼n Listesi */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                    {products[activeCategory].map((product) => {
                        const existingQty = currentOrders[product.id]?.count || 0;
                        const cartQty = cart[product.id] || 0;
                        const availableStock = product.stock + existingQty;
                        const displayStock = availableStock - cartQty;

                        return (
                            <div
                                key={product.id}
                                style={{
                                    padding: 15,
                                    border: "1px solid #ccc",
                                    borderRadius: 10,
                                    textAlign: "center",
                                    backgroundColor: "#f8f8f8",
                                }}
                            >
                                <h3>{product.name}</h3>
                                <p>
                                    {product.price}â‚º | Stok: {displayStock >= 0 ? displayStock : 0}
                                </p>
                                <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                                    <button onClick={() => handleQuantityChange(product.id, -1)}>-</button>
                                    <span>{cart[product.id] || 0}</span>
                                    <button onClick={() => handleQuantityChange(product.id, 1)}>+</button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Ä°leri / Geri ButonlarÄ± */}
                <div style={{ textAlign: "right", marginTop: 30 }}>
                    <button
                        onClick={handleNext}
                        style={{
                            padding: "12px 30px",
                            backgroundColor: "#28a745",
                            color: "white",
                            fontSize: "16px",
                            border: "none",
                            borderRadius: 8,
                            marginRight: 10,
                            cursor: "pointer",
                        }}
                    >
                        Ä°leri
                    </button>
                    <button
                        onClick={handleBack}
                        style={{
                            padding: "12px 30px",
                            backgroundColor: "#6c757d",
                            color: "white",
                            fontSize: "16px",
                            border: "none",
                            borderRadius: 8,
                            cursor: "pointer",
                        }}
                    >
                        Geri
                    </button>
                </div>
            </div>

            {/* SaÄŸ Panel - SipariÅŸ Ã–zeti */}
            <div
                style={{
                    flex: 2,
                    border: "1px solid #ccc",
                    borderRadius: 10,
                    padding: 15,
                    backgroundColor: "#fafafa",
                    maxHeight: "600px",
                    overflowY: "auto",
                }}
            >
                <h3>Mevcut SipariÅŸ</h3>
                {Object.keys(cart).length > 0 ? (
                    <>
                        <ul>
                            {Object.entries(cart).map(([id, count]) => {
                                if (count <= 0) return null;

                                let item = null;
                                for (const cat of ["yemekler", "icecekler", "tatlilar"]) {
                                    const found = products[cat].find((p) => p.id === parseInt(id));
                                    if (found) {
                                        item = found;
                                        break;
                                    }
                                }

                                return item ? (
                                    <li key={id}>
                                        {item.name} x {count} = {item.price * count}â‚º
                                    </li>
                                ) : null;
                            })}
                        </ul>
                        <p style={{ fontWeight: "bold", marginTop: 10 }}>
                            Toplam:{" "}
                            {Object.entries(cart).reduce((total, [id, count]) => {
                                let item = null;
                                for (const cat of ["yemekler", "icecekler", "tatlilar"]) {
                                    const found = products[cat].find((p) => p.id === parseInt(id));
                                    if (found) {
                                        item = found;
                                        break;
                                    }
                                }
                                return total + (item ? item.price * count : 0);
                            }, 0)}â‚º
                        </p>
                    </>
                ) : (
                    <p>Mevcut sipariş yok.</p>
                )}
            </div>
        </div>
    );
}
