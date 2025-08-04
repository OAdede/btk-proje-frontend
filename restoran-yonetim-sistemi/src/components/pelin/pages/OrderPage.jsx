import React, { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TableContext } from "../../../context/TableContext"; // YOL GÜNCELLENDİ
import { AuthContext } from "../../../context/AuthContext";


export default function OrderPage() {
    const { tableId } = useParams();
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState("yemekler");
    const [cart, setCart] = useState({});

    const { saveOrder, orders, products, payAndClearTable } = useContext(TableContext);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        setCart({});
    }, [tableId]);

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
            const currentQty = prev[id]?.count || 0;
            const newQty = currentQty + delta;

            if (newQty < 0) return prev;
            if (newQty > product.stock) return prev;

            if (newQty === 0) {
                const newCart = { ...prev };
                delete newCart[id];
                return newCart;
            }

            return { ...prev, [id]: { name: product.name, price: product.price, count: newQty } };
        });
    };

    const handleNext = () => {
        if (Object.keys(cart).length === 0) {
            alert("Lütfen siparişe ürün ekleyin.");
            return;
        }
        saveOrder(tableId, cart);
        navigate(`/kasiyer/summary/${tableId}`);
    };

    const handlePayment = () => {
        payAndClearTable(tableId);
        alert(`Masa ${tableId} için ödeme alındı. Masa boşaltılıyor.`);
        navigate("/kasiyer/home");
    };

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
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
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
                    {products[activeCategory].map((product) => (
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
                                <button onClick={() => handleQuantityChange(product.id, -1)} disabled={product.stock === 0}>-</button>
                                <span>{cart[product.id]?.count || 0}</span>
                                <button onClick={() => handleQuantityChange(product.id, 1)} disabled={product.stock === 0}>+</button>
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

            <div
                style={{
                    flex: 2,
                    border: "1px solid #ccc",
                    borderRadius: 10,
                    padding: 15,
                    backgroundColor: "#fafafa",
                    height: "fit-content",
                    maxHeight: "80vh",
                    overflowY: "auto",
                    position: "sticky",
                    top: "30px",
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
                        <p style={{ fontWeight: "bold", marginTop: 10, fontSize: "1.2em" }}>
                            Toplam Hesap: {totalConfirmedPrice}₺
                        </p>
                        {isCashier && (
                            <button
                                onClick={handlePayment}
                                style={{
                                    width: "100%",
                                    padding: "15px",
                                    fontSize: "18px",
                                    backgroundColor: "#28a745",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                    marginTop: "10px"
                                }}
                            >
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
