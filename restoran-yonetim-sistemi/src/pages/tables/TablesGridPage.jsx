import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TableContext } from "../../context/TableContext";

export default function TablesGridPage() {
    const navigate = useNavigate();
    const { tableStatus, updateTableStatus } = useContext(TableContext);
    const [selectedFloor, setSelectedFloor] = useState(1);

    const tables = Array.from({ length: 8 }, (_, i) => `${selectedFloor}-${i + 1}`);

    const getColor = (status) => {
        switch (status) {
            case "empty":
                return "#8BC34A"; // yeşil
            case "occupied":
                return "#F44336"; // kırmızı
            case "reserved":
                return "#FFC107"; // sarı
            default:
                return "#8BC34A";
        }
    };

    // Test amaçlı bir masayı rezerve yapalım
    React.useEffect(() => {
        updateTableStatus("1-3", "reserved");
        updateTableStatus("1-5", "occupied");
    }, []);

    const handleTableClick = (tableId) => {
        const status = tableStatus[tableId] || "empty";
        if (status === "occupied") {
            navigate(`/staff/summary/${tableId}`);
        } else {
            navigate(`/staff/order/${tableId}`);
        }
    }

    return (
        <div style={{ padding: "2rem", display: "flex", gap: "2rem", height: '100%' }}>
            <div style={{ flexGrow: 1 }}>
                <h2 style={{ fontWeight: 'bold', fontSize: '2rem', color: '#333' }}>Kat {selectedFloor} - Masa Seçimi</h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
                    {tables.map((tableId) => (
                        <div
                            key={tableId}
                            style={{
                                width: "140px",
                                height: "140px",
                                backgroundColor: getColor(tableStatus[tableId] || "empty"),
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                fontSize: "36px",
                                color: (tableStatus[tableId] === 'reserved' ? 'black' : 'white'),
                                borderRadius: "12px",
                                cursor: "pointer",
                                border: "4px solid #555",
                                userSelect: "none",
                                fontWeight: 'bold',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                            }}
                            onClick={() => handleTableClick(tableId)}
                            title={`Masa ${tableId}`}
                        >
                            {tableId.split("-")[1]}
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ width: "180px", flexShrink: 0 }}>
                <h3 style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#333' }}>Katlar</h3>
                {[1, 2].map((floor) => (
                    <div
                        key={floor}
                        onClick={() => setSelectedFloor(floor)}
                        style={{
                            padding: "1.2rem",
                            marginBottom: "1rem",
                            borderRadius: "10px",
                            backgroundColor: selectedFloor === floor ? "#007bff" : "#e9ecef",
                            color: selectedFloor === floor ? "white" : "black",
                            textAlign: "center",
                            cursor: "pointer",
                            fontWeight: "bold",
                            userSelect: "none",
                            fontSize: '1.1rem',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    >
                        Kat {floor}
                    </div>
                ))}
            </div>
        </div>
    );
}
