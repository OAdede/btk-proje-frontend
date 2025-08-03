import React, { useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TableContext } from "../context/TableContext";

export default function SummaryPage() {
    const { tableId } = useParams();
    const { lastOrders, confirmOrder } = useContext(TableContext);
    const navigate = useNavigate();

    const tableOrder = lastOrders[tableId] || {};

    const totalPrice = Object.values(tableOrder).reduce(
        (sum, item) => sum + item.price * item.count,
        0
    );

    const handleConfirm = () => {
        confirmOrder(tableId);
        navigate("/");
    };

    return (
        <div style={{ padding: 30 }}>
            <h1>Masa {tableId} - Sipariş Özeti</h1>
            {Object.keys(tableOrder).length === 0 ? (
                <div style={{ textAlign: "center" }}>
                    <p>Sepetiniz boş.</p>
                    <button
                        onClick={() => navigate(/order/${tableId})}
                        style={{
                            padding: "10px 20px",
                            marginRight: "10px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: "#007bff",
                            color: "white",
                            cursor: "pointer",
                        }}
                    >
                        Geri Dön
                    </button>
                    <button
                        onClick={() => navigate("/")}
                        style={{
                            padding: "10px 20px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: "#dc3545",
                            color: "white",
                            cursor: "pointer",
                        }}
                    >
                        Çıkış
                    </button>
                </div>
            ) : (

                <>
                    <ul>
                        {Object.entries(tableOrder).map(([id, item]) => (
                            <li key={id}>
                                {item.name} x {item.count} = {item.count * item.price}₺
                            </li>
                        ))}
                    </ul>
                    <p>
                        <strong>Toplam: {totalPrice}₺</strong>
                    </p>
                    <button
                        onClick={handleConfirm}
                        style={{
                            backgroundColor: "green",
                            color: "white",
                            padding: "10px 20px",
                            borderRadius: "8px",
                            border: "none",
                            cursor: "pointer",
                            marginRight: "10px",
                        }}
                    >
                        Siparişi Onayla
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            backgroundColor: "#6c757d",
                            color: "white",
                            padding: "10px 20px",
                            borderRadius: "8px",
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        Geri
                    </button>
                </>
            )}
        </div>
    );
}
