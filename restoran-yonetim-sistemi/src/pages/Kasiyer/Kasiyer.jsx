// src/pages/Kasiyer/Kasiyer.jsx

import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { TableContext } from "../../context/TableContext";

export default function Kasiyer() {
    const { tableStatus, orders } = useContext(TableContext);
    const navigate = useNavigate();

    // Sadece ödeme alınması gereken (kırmızı) masaları filtrele
    const occupiedTables = Object.keys(tableStatus).filter(
        (tableId) => tableStatus[tableId] === "occupied"
    );

    return (
        <div style={{ padding: "2rem" }}>
            <h2 style={{ marginBottom: "1rem" }}>Kasiyer Paneli - Ödeme Al</h2>

            {occupiedTables.length === 0 ? (
                <p style={{ fontSize: "18px", color: "#555" }}>
                    Şu anda ödeme bekleyen masa yok.
                </p>
            ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                    {occupiedTables.map((tableId) => {
                        const orderItems = orders[tableId] || {};
                        const total = Object.values(orderItems).reduce(
                            (sum, item) => sum + item.count * item.price,
                            0
                        );

                        return (
                            <div
                                key={tableId}
                                style={{
                                    border: "1px solid #ccc",
                                    borderRadius: "8px",
                                    padding: "1rem",
                                    minWidth: "240px",
                                    backgroundColor: "#f4f4f4",
                                    boxShadow: "2px 2px 8px rgba(0,0,0,0.1)",
                                }}
                            >
                                <h3 style={{ marginBottom: "0.5rem" }}>Masa {tableId}</h3>

                                <ul style={{ paddingLeft: "1.2rem", marginBottom: "1rem" }}>
                                    {Object.entries(orderItems).map(([id, item]) => (
                                        <li key={id}>
                                            {item.name} x {item.count} ={" "}
                                            {item.count * item.price}₺
                                        </li>
                                    ))}
                                </ul>

                                <p style={{ fontWeight: "bold", marginBottom: "1rem" }}>
                                    Toplam: {total}₺
                                </p>

                                <button
                                    onClick={() => navigate(`/kasiyer/odeme/${tableId}`)}
                                    style={{
                                        backgroundColor: "green",
                                        color: "white",
                                        padding: "10px 20px",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontSize: "16px",
                                    }}
                                >
                                    Ödeme Al
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
