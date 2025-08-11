import React, { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TableContext } from "../../context/TableContext";

export default function OrderPage() {
    const { tableId } = useParams();
    const navigate = useNavigate();
    const { saveOrder, products, lastOrders, updateTableStatus } = useContext(TableContext);

    const [activeCategory, setActiveCategory] = useState("yemekler");
    const [cart, setCart] = useState({});

    useEffect(() => {
        // Sayfa yüklendiğinde masayı rezerve olarak işaretle
        updateTableStatus(tableId, "reserved");
        // Eğer bu masa için daha önceden sepete eklenmiş ama onaylanmamış ürün varsa yükle
        if (lastOrders[tableId]) {
            setCart(lastOrders[tableId]);
        }
    }, [tableId, lastOrders, updateTableStatus]);

    const handleQuantityChange = (product, delta) => {
        const { id, stock } = product;
        setCart((prev) => {
            const currentQty = prev[id]?.count || 0;
            const newQty = currentQty + delta;

            if (newQty < 0) return prev;
            if (newQty > stock) return prev; // Stok kontrolü

            const newCart = { ...prev };
            if (newQty === 0) {
                delete newCart[id];
            } else {
                newCart[id] = { name: product.name, price: product.price, count: newQty };
            }
            return newCart;
        });
    };

    const handleNext = () => {
        saveOrder(tableId, cart);
        navigate(`/kasiyer/summary/${tableId}`);
    };

    return (
        <div style={{ padding: 30 }}>
            <h2 style={{ marginBottom: 20 }}>Masa {tableId} - Yeni Sipariş</h2>

            <div style={{ display: "flex", gap: 20, marginBottom: 30 }}>
                {Object.keys(products).map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        style={{ ...styles.categoryButton, backgroundColor: activeCategory === cat ? "#007bff" : "#ddd", color: activeCategory === cat ? "white" : "black" }}
                    >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>

            <div style={styles.grid}>
                {products[activeCategory].map((product) => (
                    <div key={product.id || crypto.randomUUID()} style={styles.card}>
                        <h3>{product.name}</h3>
                        <p>{product.price}₺ | Stok: {product.stock}</p>
                        <div style={styles.quantityControl}>
                            <button onClick={() => handleQuantityChange(product, -1)}>-</button>
                            <span>{cart[product.id]?.count || 0}</span>
                            <button onClick={() => handleQuantityChange(product, 1)}>+</button>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ textAlign: "right", marginTop: 30 }}>
                <button onClick={() => navigate(-1)} style={{ ...styles.actionButton, backgroundColor: "#6c757d" }}>Geri</button>
                <button onClick={handleNext} style={{ ...styles.actionButton, backgroundColor: "#007bff", marginLeft: "10px" }} disabled={Object.keys(cart).length === 0}>
                    Siparişi Özetle
                </button>
            </div>
        </div>
    );
}

const styles = {
    categoryButton: {
        padding: "10px 25px",
        fontSize: "20px",
        borderRadius: 12,
        border: "none",
        cursor: "pointer",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 20,
    },
    card: {
        border: "1px solid #ccc",
        borderRadius: 10,
        padding: 15,
        backgroundColor: "#f9f9f9",
        textAlign: "center",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
    },
    quantityControl: {
        display: "flex",
        justifyContent: "center",
        gap: 15,
        alignItems: "center",
        fontSize: "1.2rem"
    },
    actionButton: {
        padding: "15px 40px",
        fontSize: "18px",
        color: "white",
        border: "none",
        borderRadius: "10px",
        cursor: "pointer",
    }
};
