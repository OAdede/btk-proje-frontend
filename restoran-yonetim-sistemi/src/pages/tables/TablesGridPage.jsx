import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TableContext } from "../../context/TableContext";

export default function TablesGridPage() {
    const navigate = useNavigate();
    const { tableStatus, updateTableStatus } = useContext(TableContext);
    const [selectedFloor, setSelectedFloor] = useState(1);

    const tables = Array.from({ length: 8 }, (_, i) => `${selectedFloor}-${i + 1}`);

    const statusInfo = {
        "empty": { text: "Boş", color: "#4caf50", textColor: "#fff" },
        "bos": { text: "Boş", color: "#4caf50", textColor: "#fff" },
        "occupied": { text: "Dolu", color: "#dc3545", textColor: "#fff" },
        "dolu": { text: "Dolu", color: "#dc3545", textColor: "#fff" },
        "reserved": { text: "Rezerve", color: "#ffc107", textColor: "#212529" },
    };

    const getStatus = (tableId) => {
        const status = tableStatus[tableId] || "empty";
        return statusInfo[status] || statusInfo["empty"];
    };



    const handleTableClick = (tableId) => {
        const status = tableStatus[tableId] || "empty";
        if (status === "occupied") {
            navigate(`/staff/summary/${tableId}`);
        } else {
            navigate(`/staff/order/${tableId}`);
        }
    }

    return (
        <div style={{ padding: "2rem", display: "flex", gap: "2rem", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
            <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: "2rem", color: "#343a40", marginBottom: "1.5rem" }}>
                    Kat {selectedFloor} - Masa Seçimi
                </h2>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "1.5rem"
                }}>
                    {tables.map((tableId) => {
                        const status = getStatus(tableId);
                        return (
                            <div
                                key={tableId}
                                style={{
                                    backgroundColor: status.color,
                                    color: status.textColor,
                                    height: "140px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    borderRadius: "12px",
                                    cursor: "pointer",
                                    userSelect: "none",
                                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                }}
                                onClick={() => handleTableClick(tableId)}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                title={`Masa ${tableId}`}
                            >
                                <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
                                    {tableId.split("-")[1]}
                                </div>
                                <div style={{ fontSize: "1rem", marginTop: "0.5rem", fontWeight: "500" }}>
                                    {status.text}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div style={{ width: "150px", flexShrink: 0 }}>
                <h3 style={{ fontSize: "1.25rem", color: "#495057", marginBottom: "1rem" }}>Katlar</h3>
                {[1, 2].map((floor) => (
                    <div
                        key={floor}
                        onClick={() => setSelectedFloor(floor)}
                        style={{
                            padding: "1rem",
                            marginBottom: "1rem",
                            borderRadius: "8px",
                                            backgroundColor: selectedFloor === floor ? "#513653" : "#e9ecef",
                color: selectedFloor === floor ? "white" : "#495057",
                            textAlign: "center",
                            cursor: "pointer",
                            fontWeight: "bold",
                            userSelect: "none",
                            transition: "background-color 0.2s ease",
                        }}
                    >
                        Kat {floor}
                    </div>
                ))}
            </div>
        </div>
    );
}
