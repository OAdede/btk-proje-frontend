import React, { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TableContext } from "../../../context/TableContext.jsx";
import { AuthContext } from "../../../context/AuthContext";

export default function OrderPage() {
    const { tableId } = useParams();
    const navigate = useNavigate();
    const { saveOrder, orders, products, payAndClearTable } = useContext(TableContext);
    const { user } = useContext(AuthContext);

    const allCategories = ["Tümü", ...Object.keys(products)];
    const [activeCategory, setActiveCategory] = useState("Tümü");
    const [cart, setCart] = useState({});

    useEffect(() => {
        setCart({});
    }, [tableId]);

    const getProductById = (id) => {
        for (const category in products) {
            const product = products[category].find(p => p.id === id);
            if (product) return product;
        }
        return null;
    };

    const handleQuantityChange = (id, delta) => {
        const product = getProductById(id);
        if (!product) return;

        setCart((prev) => {
            const currentQty = prev[id]?.count || 0;
            const newQty = currentQty + delta;

            if (newQty < 0 || newQty > product.stock) return prev;

            const newCart = { ...prev };
            if (newQty === 0) {
                delete newCart[id];
            } else {
                newCart[id] = { ...product, count: newQty };
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
        navigate(`../summary/${tableId}`);
    };

    const handlePayment = () => {
        payAndClearTable(tableId);
        alert(`Masa ${tableId} için ödeme alındı. Masa boşaltılıyor.`);
        navigate("/kasiyer");
    };

    const confirmedOrders = orders[tableId] || {};
    const totalConfirmedPrice = Object.values(confirmedOrders).reduce(
        (sum, item) => sum + item.price * item.count,
        0
    );

    const isCashier = user && user.role === 'kasiyer';

    const displayedProducts = activeCategory === "Tümü"
        ? Object.values(products).flat()
        : products[activeCategory] || [];

    return (
        <div style={{ padding: 30, display: "flex", gap: 50 }}>
            <div style={{ flex: 3 }}>
                <h2 style={{ marginBottom: 20 }}>Masa {tableId} - Sipariş</h2>

                <div style={{ display: "flex", gap: 10, marginBottom: 30, flexWrap: "wrap" }}>
                    {allCategories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            style={{
                                padding: "10px 20px",
                                fontSize: "16px",
                                borderRadius: 12,
                                backgroundColor: activeCategory === cat ? "#007bff" : "#ddd",
                                color: activeCategory === cat ? "white" : "black",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                        gap: 20,
                    }}
                >
                    {displayedProducts.map((product) => (
                        <div
                            key={product.id}
                            style={{
                                border: "1px solid #ccc",
                                borderRadius: 10,
                                padding: 15,
                                backgroundColor: product.stock === 0 ? "#e0e0e0" : "#f9f9f9",
                                textAlign: "center",
                                opacity: product.stock === 0 ? 0.6 : 1,
                            }}
                        >
                            <h3>{product.name}</h3>
                            <p>{product.price}₺ | Stok: {product.stock}</p>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: 10,
                                    alignItems: "center",
                                }}
                            >
                                <button onClick={() => handleQuantityChange(product.id, -1)} disabled={product.stock === 0}>-</button>
                                <span>{cart[product.id]?.count || 0}</span>
                                <button onClick={() => handleQuantityChange(product.id, 1)} disabled={product.stock === 0}>+</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ textAlign: "right", marginTop: 30 }}>
                    <button onClick={handleNext} style={{ padding: "15px 40px", fontSize: "18px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", marginRight: "10px" }}>
                        İleri
                    </button>
                    <button onClick={() => navigate(-1)} style={{ padding: "15px 40px", fontSize: "18px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "10px", cursor: "pointer" }}>
                        Geri
                    </button>
                </div>
            </div>

            <div style={{ flex: 2, border: "1px solid #ccc", borderRadius: 10, padding: 15, backgroundColor: "#fafafa", height: "fit-content", maxHeight: "80vh", overflowY: "auto", position: "sticky", top: "30px" }}>
                <h3>Onaylanmış Siparişler</h3>
                {Object.keys(confirmedOrders).length > 0 ? (
                    <>
                        <ul>
                            {Object.entries(confirmedOrders).map(([id, item]) => (
                                <li key={id}>
                                    {item.name} x {item.count} = {item.count * item.price}₺
                                </li>
                            ))}
                        </ul>
                        <p style={{ fontWeight: "bold", marginTop: 10, fontSize: "1.2em" }}>
                            Toplam Hesap: {totalConfirmedPrice}₺
                        </p>
                        {isCashier && (
                            <button onClick={handlePayment} style={{ width: "100%", padding: "15px", fontSize: "18px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", marginTop: "10px" }}>
                                Ödeme Al
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