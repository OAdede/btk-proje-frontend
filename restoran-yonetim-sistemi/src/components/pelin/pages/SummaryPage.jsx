import React, { useContext, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TableContext } from "../../../context/TableContext";

export default function SummaryPage() {
    const { tableId } = useParams();
    const navigate = useNavigate();
    const { orders, lastOrders, confirmOrder, processPayment } = useContext(TableContext);

    // Bu sayfa iki amaçla kullanılacak:
    // 1. Garson yeni siparişi onaylar (lastOrders kullanılır)
    // 2. Kasiyer mevcut siparişin ödemesini alır (orders kullanılır)

    // Eğer onaylanmamış yeni bir sipariş varsa, onu kullan. Yoksa, mevcut onaylanmış siparişi kullan.
    const isNewOrder = lastOrders[tableId] && Object.keys(lastOrders[tableId]).length > 0;
    const currentOrder = isNewOrder ? lastOrders[tableId] : (orders[tableId] || {});

    const totalPrice = useMemo(() =>
        Object.values(currentOrder).reduce(
            (sum, item) => sum + item.price * item.count,
            0
        ), [currentOrder]);

    const handleConfirm = () => {
        confirmOrder(tableId);
        navigate("/garson"); // Garsonu masalar sayfasına yönlendir
    };

    const handlePayment = () => {
        processPayment(tableId);
        navigate("/kasiyer/home"); // Kasiyeri masalar sayfasına yönlendir
    };

    const pageTitle = isNewOrder ? `Masa ${tableId} - Yeni Sipariş Özeti` : `Masa ${tableId} - Ödeme Ekranı`;

    return (
        <div style={{ padding: 30, maxWidth: '600px', margin: 'auto', border: '1px solid #ddd', borderRadius: '10px' }}>
            <h1>{pageTitle}</h1>

            {Object.keys(currentOrder).length === 0 ? (
                <div style={{ textAlign: "center" }}>
                    <p>Bu masaya ait görüntülenecek bir sipariş yok.</p>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            padding: "10px 20px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: "#007bff",
                            color: "white",
                            cursor: "pointer",
                        }}
                    >
                        Geri Dön
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
                        <button
                            onClick={() => navigate(-1)}
                            style={{
                                backgroundColor: "#6c757d",
                                color: "white",
                                padding: "15px 30px",
                                borderRadius: "8px",
                                border: "none",
                                cursor: "pointer",
                                fontSize: '16px'
                            }}
                        >
                            Geri
                        </button>

                        {isNewOrder ? (
                            <button
                                onClick={handleConfirm}
                                style={{
                                    backgroundColor: "green",
                                    color: "white",
                                    padding: "15px 30px",
                                    borderRadius: "8px",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: '16px'
                                }}
                            >
                                Siparişi Onayla
                            </button>
                        ) : (
                            <button
                                onClick={handlePayment}
                                style={{
                                    backgroundColor: "#28a745",
                                    color: "white",
                                    padding: "15px 30px",
                                    borderRadius: "8px",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: '16px'
                                }}
                            >
                                Ödeme Al
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
