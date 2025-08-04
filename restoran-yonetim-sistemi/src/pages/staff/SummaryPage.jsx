import React, { useContext, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TableContext } from "../../context/TableContext";
import { AuthContext } from "../../context/AuthContext";

export default function SummaryPage() {
    const { tableId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { orders, lastOrders, confirmOrder } = useContext(TableContext);

    const isNewOrder = lastOrders[tableId] && Object.keys(lastOrders[tableId]).length > 0;
    const currentOrder = isNewOrder ? lastOrders[tableId] : (orders[tableId] || {});

    const totalPrice = useMemo(() =>
        Object.values(currentOrder).reduce(
            (sum, item) => sum + item.price * item.count,
            0
        ), [currentOrder]);

    const handleConfirm = () => {
        confirmOrder(tableId);
        // Onay sonrası aktif role göre doğru ana sayfaya yönlendir
        navigate(`/${user.role}/home`);
    };

    // Kasiyer ise ödeme al butonu gösterilir, değilse sipariş onayı
    const isCashier = user && user.role === 'kasiyer';
    // Garson yeni sipariş onayı yapabilir
    const canConfirm = user && user.role === 'garson' && isNewOrder;

    // Geri butonunun hangi sayfaya döneceğini belirle
    const handleGoBack = () => {
        // Eğer yeni bir sipariş onayı ekranındaysa, sipariş sayfasına dön
        if (isNewOrder) {
            navigate(`/${user.role}/order/${tableId}`);
        } else {
            // Değilse, masaların olduğu ana ekrana dön
            navigate(`/${user.role}/home`);
        }
    };

    const pageTitle = isNewOrder ? `Masa ${tableId} - Yeni Sipariş Özeti` : `Masa ${tableId} - Mevcut Sipariş`;

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

                        {/* Garson yeni siparişi onaylayabilir */}
                        {canConfirm && (
                            <button
                                onClick={handleConfirm}
                                style={{ backgroundColor: "green", color: "white", padding: "15px 30px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: '16px' }}
                            >
                                Siparişi Onayla
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
