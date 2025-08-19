import React, { useContext, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TableContext } from "../../context/TableContext";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function SummaryPage() {
    const { tableId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { orders, saveFinalOrder, tables } = useContext(TableContext);
    const { colors } = useTheme();

    // UI'de gelen tableId masa numarası olabilir; backend id ile eşleştir
    const currentOrder = (() => {
        // Önce direkt table ID ile dene
        if (orders?.[tableId]?.items) return orders[tableId].items;
        
        // Eğer bulunamazsa, table number ile backend table ID eşleşmesi yap
        if (tables && tables.length > 0) {
            const backendTable = tables.find(t => String(t?.tableNumber ?? t?.number) === String(tableId));
            if (backendTable && orders?.[String(backendTable.id)]?.items) {
                return orders[String(backendTable.id)].items;
            }
        }
        
        return {};
    })();

    const totalPrice = useMemo(() =>
        Object.values(currentOrder).reduce(
            (sum, item) => sum + (Number(item.price) || 0) * (Number(item.count) || 0),
            0
        ), [currentOrder]);

    const handleConfirm = () => {
        saveFinalOrder(tableId, currentOrder);
        alert('Sipariş başarıyla onaylandı!');
        navigate(`/${user.role}/home`);
    };

    const handleGoBack = () => {
        navigate(`/${user.role}/order/${tableId}`);
    };

    const pageTitle = `Masa ${tableId} - Sipariş Özeti`;

    return (
        <div style={{
            padding: 30,
            maxWidth: '600px',
            margin: 'auto',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            backgroundColor: colors.cardBackground,
            border: `1px solid ${colors.border}`,
            borderRadius: '10px',
            color: colors.text,
            boxShadow: `0 4px 12px ${colors.shadow}`
        }}>
            <h1 style={{
                textAlign: 'center',
                marginBottom: '30px',
                color: colors.text
            }}>{pageTitle}</h1>

            {Object.keys(currentOrder).length === 0 ? (
                <div style={{ textAlign: "center" }}>
                    <p style={{ color: colors.text }}>Bu masaya ait görüntülenecek bir sipariş yok.</p>
                    <button
                        onClick={() => navigate(`/${user.role}/home`)}
                        style={{
                            padding: "10px 20px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: colors.primary,
                            color: "white",
                            cursor: "pointer",
                            transition: "all 0.3s ease"
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = colors.buttonHover;
                            e.target.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = colors.primary;
                            e.target.style.transform = "translateY(0)";
                        }}
                    >
                        Masalara Dön
                    </button>
                </div>
            ) : (
                <>
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        {Object.entries(currentOrder).map(([id, item]) => (
                            <li key={id} style={{
                                padding: '15px 0',
                                borderBottom: `1px solid ${colors.border}`,
                                color: colors.text
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '600', color: colors.text }}>{item.name} x {item.count}</span>
                                    <span style={{ fontWeight: '500', color: colors.success }}>{item.count * item.price}₺</span>
                                </div>
                                {item.note && (
                                    <p style={{
                                        fontSize: '0.9em',
                                        color: colors.textSecondary,
                                        marginTop: '8px',
                                        paddingLeft: '10px',
                                        borderLeft: `3px solid ${colors.primary}`,
                                        background: colors.surfaceBackground,
                                        padding: '8px',
                                        borderRadius: '4px'
                                    }}>
                                        <strong>Not:</strong> {item.note}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                    <p style={{
                        textAlign: 'right',
                        fontSize: '1.2em',
                        fontWeight: 'bold',
                        marginTop: '20px',
                        color: colors.text
                    }}>
                        <strong>Toplam: <span style={{ color: colors.success }}>{totalPrice}₺</span></strong>
                    </p>
                    <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
                        <button
                            onClick={handleGoBack}
                            style={{
                                backgroundColor: "#6c757d",
                                color: "white",
                                padding: "15px 30px",
                                borderRadius: "8px",
                                border: "none",
                                cursor: "pointer",
                                fontSize: '16px',
                                transition: "all 0.3s ease"
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
                                backgroundColor: colors.success,
                                color: "white",
                                padding: "15px 30px",
                                borderRadius: "8px",
                                border: "none",
                                cursor: "pointer",
                                fontSize: '16px',
                                transition: "all 0.3s ease"
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = "#059669";
                                e.target.style.transform = "translateY(-1px)";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = colors.success;
                                e.target.style.transform = "translateY(0)";
                            }}
                        >
                            Siparişleri Onayla
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
