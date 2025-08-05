import React, { useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TableContext } from "../../context/TableContext.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";

export default function SummaryPage() {
    const { orders, confirmOrder, lastOrders, clearLastOrder } = useContext(TableContext);
    const { user } = useContext(AuthContext);
    const { tableId } = useParams();
    const navigate = useNavigate();

    if (!user) return <p>Yükleniyor...</p>;

    const confirmedOrderItems = orders[tableId] || {};
    const newOrderItems = lastOrders[tableId] || {};

    const calculateTotal = (items) => {
        if (!items || Object.keys(items).length === 0) return 0;
        return Object.values(items).reduce((sum, item) => sum + item.price * item.count, 0);
    };

    const confirmedOrderTotal = calculateTotal(confirmedOrderItems);
    const newOrderTotal = calculateTotal(newOrderItems);
    const grandTotal = confirmedOrderTotal + newOrderTotal;

    const handleConfirm = () => {
        confirmOrder(tableId);
        navigate(`/garson/home`);
    };

    const handleBack = () => {
        // Kullanıcı geri dönmek isterse, onaylanmamış siparişleri temizle
        clearLastOrder(tableId);
        navigate(`/staff/order/${tableId}`);
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
                                <span>{(item.price * item.count).toFixed(2)}₺</span>
                            </li>
                        ))}
                    </ul>
                    <p style={styles.total}>Ara Toplam: {confirmedOrderTotal.toFixed(2)}₺</p>
                </div>
            )}

            {Object.keys(newOrderItems).length > 0 && (
                <div style={{ ...styles.card, border: '2px solid #007bff' }}>
                    <h3>Yeni Eklenenler (Onay Bekliyor)</h3>
                    <ul style={styles.list}>
                        {Object.entries(newOrderItems).map(([id, item]) => (
                            <li key={id} style={styles.listItem}>
                                <span>{item.name} x {item.count}</span>
                                <span>{(item.price * item.count).toFixed(2)}₺</span>
                            </li>
                        ))}
                    </ul>
                    <p style={styles.total}>Ara Toplam: {newOrderTotal.toFixed(2)}₺</p>
                </div>
            )}

            {grandTotal > 0 &&
                <div style={styles.grandTotalCard}>
                    <h3>Genel Toplam: {grandTotal.toFixed(2)}₺</h3>
                </div>
            }

            <div style={styles.actions}>
                <button onClick={handleBack} style={{ ...styles.button, backgroundColor: "#6c757d" }}>
                    Siparişe Geri Dön
                </button>

                {Object.keys(newOrderItems).length > 0 && (
                    <button onClick={handleConfirm} style={{ ...styles.button, backgroundColor: "#28a745" }}>
                        Yeni Siparişleri Onayla
                    </button>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: { padding: "2rem", maxWidth: "800px", margin: "auto", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
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
        paddingBottom: '0.5rem',
        fontSize: "18px"
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
        justifyContent: "space-between",
        gap: "1rem"
    },
    button: {
        padding: "0.8rem 1.5rem",
        fontSize: "1rem",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontWeight: 'bold'
    }
};