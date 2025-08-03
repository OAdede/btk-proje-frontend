import React, { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TableContext } from "../context/TableContext";

export default function OrderPage() {
    const { tableId } = useParams();
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState("yemekler");
    const [cart, setCart] = useState({});
    const { saveOrder, orders, products } = useContext(TableContext);

    // Aktif sipariş (cart), önceki onaylanmış siparişlerden farklıdır, burada sadece yeni sipariş olarak tutuluyor.
    useEffect(() => {
        // Eğer masa için daha önce kaydedilmiş aktif sipariş varsa (örneğin sepette)
        if (orders[tableId]) {
            // Burada cart’ı sıfırla çünkü yeni sipariş girerken aktif siparişi ayrı tutmak için
            setCart({});
        } else {
            setCart({});
        }
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
            if (newQty > product.stock) return prev;

            return { ...prev, [id]: newQty };
        });
    };

    const handleNext = () => {
        const selectedItems = {};
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
                    selectedItems[id] = {
                        name: product.name,
                        price: product.price,
                        count: qty,
                    };
                }
            }
        });

        // Yeni siparişi kaydet (önceki onaylanmış siparişler ayrı tutulmalı)
        // Burada sadece yeni siparişi saveOrder ile kaydediyoruz,
        // onaylama SummaryPage’de yapılacak.
        saveOrder(tableId, selectedItems);
        navigate(/summary/${tableId});
    };

    // Onaylanmış siparişler (orders)
    const confirmedOrders = orders[tableId] || {};

    // Onaylanmış siparişlerin toplam fiyatı
    const totalConfirmedPrice = Object.values(confirmedOrders).reduce(
        (sum, item) => sum + item.price * item.count,
        0
    );

    return (
        <div style={{ padding: 30, display: "flex", gap: 50 }}>
            <div style={{ flex: 3 }}>
                <h2 style={{ marginBottom: 20 }}>Masa {tableId} - Yeni Sipariş</h2>

                <div style={{ display: "flex", gap: 20, marginBottom: 30 }}>
                    {["yemekler", "icecekler", "tatlilar"].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            style={{
                                padding: "10px 25px",
                                fontSize: "20px",
                                borderRadius: 12,
                                backgroundColor: activeCategory === cat ? "#007bff" : "#ddd",
                                color: activeCategory === cat ? "white" : "black",
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

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 20,
                    }}
                >
                    {products[activeCategory].map((product) => (
                        <div
                            key={product.id}
                            style={{
                                border: "1px solid #ccc",
                                borderRadius: 10,
                                padding: 15,
                                backgroundColor: "#f9f9f9",
                                textAlign: "center",
                            }}
                        >
                            <h3>{product.name}</h3>
                            <p>
                                {product.price}₺ | Stok: {product.stock}
                            </p>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: 10,
                                    alignItems: "center",
                                }}
                            >
                                <button onClick={() => handleQuantityChange(product.id, -1)}>-</button>
                                <span>{cart[product.id] || 0}</span>
                                <button onClick={() => handleQuantityChange(product.id, 1)}>+</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ textAlign: "right", marginTop: 30 }}>
                    <button
                        onClick={handleNext}
                        style={{
                            padding: "15px 40px",
                            fontSize: "18px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "10px",
                            cursor: "pointer",
                            marginRight: "10px",
                        }}
                    >
                        İleri
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            padding: "15px 40px",
                            fontSize: "18px",
                            backgroundColor: "#6c757d",
                            color: "white",
                            border: "none",
                            borderRadius: "10px",
                            cursor: "pointer",
                        }}
                    >
                        Geri
                    </button>
                </div>
            </div>

            {/* Yan tarafta onaylanmış siparişler ve toplam */}
            <div
                style={{
                    flex: 2,
                    border: "1px solid #ccc",
                    borderRadius: 10,
                    padding: 15,
                    backgroundColor: "#fafafa",
                    height: "fit-content",
                    maxHeight: "600px",
                    overflowY: "auto",
                }}
            >
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
                        <p style={{ fontWeight: "bold", marginTop: 10 }}>
                            Toplam: {totalConfirmedPrice}₺
                        </p>
                    </>
                ) : (
                    <p>Henüz onaylanmış sipariş yok.</p>
                )}
            </div>
        </div>
    );
}
