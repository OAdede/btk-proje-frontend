import React, { useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { TableContext } from "../../context/TableContext.jsx";

export default function SummaryPage() {
    const { saveFinalOrder, orders } = useContext(TableContext);

    const { tableId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const updatedOrder = location.state?.updatedOrder || {};
    const orderItems = Object.entries(updatedOrder);

    const total = orderItems.reduce(
        (sum, [id, item]) => sum + item.price * item.count,
        0
    );

    const handleConfirm = () => {
        console.log("Onay sonrası sepet içeriği:", updatedOrder);
        saveFinalOrder(tableId, updatedOrder);
        navigate("/");
    };

    const handleCancel = () => {
        navigate(`/order/${tableId}`);
    };

    return (
        <div style={{ padding: "3rem", maxWidth: "800px", margin: "auto" }}>
            <h2 style={{ marginBottom: "2rem" }}>Masa {tableId} - Sipariş Özeti</h2>

            <div style={{ border: "1px solid #ccc", borderRadius: "10px", padding: "2rem", marginBottom: "2rem" }}>
                <h3 style={{ marginBottom: "1rem" }}>Ürünler</h3>
                {orderItems.length > 0 ? (
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {orderItems.map(([id, item]) => (
                            <li key={id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "18px" }}>
                                <span>{item.name} x {item.count}</span>
                                <span>{item.price * item.count} ₺</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Henüz siparişiniz yok.</p>
                )}
            </div>

            <div style={{ textAlign: "right", fontSize: "24px", fontWeight: "bold", marginBottom: "2rem" }}>
                Toplam: {total} ₺
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                <button
                    onClick={handleConfirm}
                    style={{
                        padding: "15px 40px",
                        fontSize: "18px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                    }}
                >
                    Siparişi Onayla
                </button>
                <button
                    onClick={handleCancel}
                    style={{
                        padding: "15px 40px",
                        fontSize: "18px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                    }}
                >
                    İptal Et
                </button>
            </div>
        </div>
    );
}
