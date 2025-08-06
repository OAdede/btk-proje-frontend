import React, { useContext, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TableContext } from "../../context/TableContext";
import { AuthContext } from "../../context/AuthContext";

export default function SummaryPage() {
    const { tableId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { orders, saveFinalOrder } = useContext(TableContext);

    const currentOrder = orders[tableId] || {};

    const totalPrice = useMemo(() =>
        Object.values(currentOrder).reduce(
            (sum, item) => sum + item.price * item.count,
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
        <div style={{ padding: 30, maxWidth: '600px', margin: 'auto', border: '1px solid #ddd', borderRadius: '10px' }}>
            <h1>{pageTitle}</h1>

            {Object.keys(currentOrder).length === 0 ? (
                <div style={{ textAlign: "center" }}>
                    <p>Bu masaya ait görüntülenecek bir sipariş yok.</p>
                    <button onClick={() => navigate(`/${user.role}/home`)} style={{ padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "#007bff", color: "white", cursor: "pointer" }}>
                        Masalara Dön
                    </button>
                </div>
            ) : (
                <>
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        {Object.entries(currentOrder).map(([id, item]) => (
                            <li key={id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                                <span>{item.name} x {item.count}</span>
                                <span>{item.count * item.price}₺</span>
                            </li>
                        ))}
                    </ul>
                    <p style={{ textAlign: 'right', fontSize: '1.2em', fontWeight: 'bold', marginTop: '20px' }}>
                        <strong>Toplam: {totalPrice}₺</strong>
                    </p>
                    <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
                        <button onClick={handleGoBack} style={{ backgroundColor: "#6c757d", color: "white", padding: "15px 30px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: '16px' }}>
                            Geri
                        </button>
                        <button
                            onClick={handleConfirm}
                            style={{ backgroundColor: "green", color: "white", padding: "15px 30px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: '16px' }}
                        >
                            Siparişleri Onayla
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
