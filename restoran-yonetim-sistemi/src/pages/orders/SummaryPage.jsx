import React, { useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TableContext } from "../../context/TableContext";
import { useTheme } from "../../context/ThemeContext";

export default function SummaryPage() {
    const { tableId } = useParams();
    const navigate = useNavigate();
    const { lastOrders, confirmOrder, clearTable, orders } = useContext(TableContext);
    const { isDarkMode, colors } = useTheme();

    const newOrderItems = lastOrders[tableId] || {};
    const confirmedOrderItems = orders[tableId] || {};

    const calculateTotal = (items) => {
        return Object.values(items).reduce((sum, item) => sum + item.price * item.count, 0);
    }

    const newOrderTotal = calculateTotal(newOrderItems);
    const confirmedOrderTotal = calculateTotal(confirmedOrderItems);
    const grandTotal = newOrderTotal + confirmedOrderTotal;

    const handleConfirm = () => {
        confirmOrder(tableId);
        navigate("/garson/home");
    };

    const handleClearTable = () => {
        clearTable(tableId);
        navigate("/garson/home");
    }

    const styles = {
        container: { 
            padding: "2rem",
            backgroundColor: colors.background,
            color: colors.text,
            minHeight: "100vh"
        },
        title: { 
            marginBottom: "2rem", 
            textAlign: "center",
            color: colors.text
        },
        card: {
            marginBottom: "1.5rem",
            padding: "1.5rem",
            borderRadius: "8px",
            backgroundColor: colors.cardBackground,
            boxShadow: `0 2px 4px ${colors.shadow}`,
            border: `1px solid ${colors.border}`,
            color: colors.text
        },
        list: { 
            listStyle: "none", 
            padding: 0 
        },
        listItem: { 
            display: "flex", 
            justifyContent: "space-between", 
            marginBottom: "0.5rem", 
            borderBottom: `1px solid ${colors.border}`, 
            paddingBottom: "0.5rem",
            color: colors.text
        },
        total: { 
            fontWeight: "bold", 
            textAlign: "right", 
            marginTop: "1rem",
            color: colors.text
        },
        grandTotalCard: {
            marginTop: "2rem",
            padding: "1.5rem",
            borderRadius: "8px",
            backgroundColor: colors.surfaceBackground,
            textAlign: "center",
            fontSize: "1.5rem",
            fontWeight: "bold",
            border: `1px solid ${colors.border}`,
            color: colors.text
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
            color: "#ffffff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            transition: "all 0.3s ease"
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Masa {tableId} - Sipariş Özeti</h2>

            {Object.keys(confirmedOrderItems).length > 0 && (
                <div style={styles.card}>
                    <h3 style={{ color: colors.text }}>Onaylanmış Siparişler</h3>
                    <ul style={styles.list}>
                        {Object.entries(confirmedOrderItems).map(([id, item]) => (
                            <li key={id} style={styles.listItem}>
                                <span>{item.name} x {item.count}</span>
                                <span style={{ color: colors.success }}>{item.price * item.count}₺</span>
                            </li>
                        ))}
                    </ul>
                    <p style={styles.total}>Ara Toplam: <span style={{ color: colors.success }}>{confirmedOrderTotal}₺</span></p>
                </div>
            )}

            {Object.keys(newOrderItems).length > 0 && (
                <div style={{ 
                    ...styles.card, 
                    border: `2px solid ${colors.primary}`,
                    backgroundColor: colors.accentBackground
                }}>
                    <h3 style={{ color: colors.text }}>Yeni Eklenenler (Onay Bekliyor)</h3>
                    <ul style={styles.list}>
                        {Object.entries(newOrderItems).map(([id, item]) => (
                            <li key={id} style={styles.listItem}>
                                <span>{item.name} x {item.count}</span>
                                <span style={{ color: colors.success }}>{item.price * item.count}₺</span>
                            </li>
                        ))}
                    </ul>
                    <p style={styles.total}>Ara Toplam: <span style={{ color: colors.success }}>{newOrderTotal}₺</span></p>
                </div>
            )}

            <div style={styles.grandTotalCard}>
                <h3 style={{ color: colors.text }}>Genel Toplam: <span style={{ color: colors.success }}>{grandTotal}₺</span></h3>
            </div>

            <div style={styles.actions}>
                <button 
                    onClick={() => navigate(-1)} 
                    style={{ 
                        ...styles.button, 
                        backgroundColor: "#6c757d" 
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#5a6268";
                        e.target.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#6c757d";
                        e.target.style.transform = "translateY(0)";
                    }}
                >
                    Geri
                </button>
                <button 
                    onClick={handleConfirm} 
                    style={{ 
                        ...styles.button, 
                        backgroundColor: colors.success,
                        opacity: Object.keys(newOrderItems).length === 0 ? 0.5 : 1
                    }} 
                    disabled={Object.keys(newOrderItems).length === 0}
                    onMouseEnter={(e) => {
                        if (Object.keys(newOrderItems).length > 0) {
                            e.target.style.backgroundColor = "#059669";
                            e.target.style.transform = "translateY(-1px)";
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (Object.keys(newOrderItems).length > 0) {
                            e.target.style.backgroundColor = colors.success;
                            e.target.style.transform = "translateY(0)";
                        }
                    }}
                >
                    Yeni Siparişi Onayla
                </button>
                <button 
                    onClick={handleClearTable} 
                    style={{ 
                        ...styles.button, 
                        backgroundColor: colors.danger 
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#dc2626";
                        e.target.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = colors.danger;
                        e.target.style.transform = "translateY(0)";
                    }}
                >
                    Hesabı Kapat & Masayı Temizle
                </button>
            </div>
        </div>
    );
}
