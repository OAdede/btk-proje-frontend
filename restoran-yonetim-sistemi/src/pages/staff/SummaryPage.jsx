import React, { useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TableContext } from "../../context/TableContext";
import { AuthContext } from "../../context/AuthContext";

export default function SummaryPage() {
    const { tableId } = useParams();
    const navigate = useNavigate();
    const { lastOrders, confirmOrder, orders } = useContext(TableContext);
    const { user } = useContext(AuthContext);

    if (!user) return <p>Yükleniyor...</p>;

    const newOrderItems = lastOrders[tableId] || {};
    const confirmedOrderItems = orders[tableId] || {};

    const calculateTotal = (items) => {
        return Object.values(items).reduce((sum, item) => sum + item.price * item.count, 0);
    };

    const newOrderTotal = calculateTotal(newOrderItems);
    const confirmedOrderTotal = calculateTotal(confirmedOrderItems);
    const grandTotal = newOrderTotal + confirmedOrderTotal;

    const handleConfirm = () => {
        confirmOrder(tableId);
        navigate("/garson/home");
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Masa {tableId} - Sipariş Özeti</h2>

            {Object.keys(confirmedOrderItems).length > 0 && (
                <div style={styles.card}>
                    <h3>Onaylanmış Siparişler</h3>
                    <ul style={styles.list}>
                        {Object.entries(confirmedOrderItems).map(([id, item]) => (
                            <li key={id} style={styles.listItem}>
                                <span>{item.name} x {item.count}</span>
                                <span>{item.price * item.count}₺</span>
                            </li>
                        ))}
                    </ul>
                    <p style={styles.total}>Ara Toplam: {confirmedOrderTotal}₺</p>
                </div>
            )}

            {Object.keys(newOrderItems).length > 0 && (
                <div style={{ ...styles.card, border: '2px solid #007bff' }}>
                    <h3>Yeni Eklenenler (Onay Bekliyor)</h3>
                    <ul style={styles.list}>
                        {Object.entries(newOrderItems).map(([id, item]) => (
                            <li key={id} style={styles.listItem}>
                                <span>{item.name} x {item.count}</span>
                                <span>{item.price * item.count}₺</span>
                            </li>
                        ))}
                    </ul>
                    <p style={styles.total}>Ara Toplam: {newOrderTotal}₺</p>
                </div>
            )}

            <div style={styles.grandTotalCard}>
                <h3>Genel Toplam: {grandTotal}₺</h3>
            </div>

            <div style={styles.actions}>
                <button onClick={() => navigate(-1)} style={{ ...styles.button, backgroundColor: "#6c757d" }}>
                    Geri
                </button>

                {Object.keys(newOrderItems).length > 0 && (
                    <button onClick={handleConfirm} style={{ ...styles.button, backgroundColor: "#28a745" }}>
                        Siparişi Onayla
                    </button>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: { padding: "2rem" },
    title: { marginBottom: "2rem", textAlign: "center" },
    card: {
        marginBottom: "1.5rem",
        padding: "1.5rem",
        borderRadius: "8px",
        backgroundColor: "#f8f9fa",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
    },
    list: { listStyle: "none", padding: 0 },
    listItem: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "0.5rem",
        borderBottom: '1px solid #eee',
        paddingBottom: '0.5rem'
    },
    total: { fontWeight: "bold", textAlign: "right", marginTop: "1rem" },
    grandTotalCard: {
        marginTop: "2rem",
        padding: "1.5rem",
        borderRadius: "8px",
        backgroundColor: "#e9ecef",
        textAlign: "center",
        fontSize: "1.5rem",
        fontWeight: "bold"
    },
    actions: {
        marginTop: "2rem",
        display: "flex",
        justifyContent: "flex-end",
        gap: "1rem"
    },
    button: {
        padding: "0.8rem 1.5rem",
        fontSize: "1rem",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer"
    }
};
