import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TableContext } from "../../../context/TableContext";
import { AuthContext } from "../../../context/AuthContext";

export default function WaiterHome() {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { tableStatus } = useContext(TableContext);
    const [selectedFloor, setSelectedFloor] = useState(1);

    const tables = Array.from({ length: 8 }, (_, i) => `${selectedFloor}-${i + 1}`);

    const handleTableClick = (tableId) => {
        // Kullanıcının mevcut rolüne göre doğru sipariş sayfasına yönlendir.
        // Bu, /garson/order/... veya /kasiyer/order/... olabilir.
        navigate(`/${user.role}/order/${tableId}`);
    };

    const getColor = (status) => {
        switch (status) {
            case "empty":
            case "bos": // Eski verilerle uyumluluk için
                return "#8BC34A"; // yeşil
            case "occupied":
            case "dolu": // Eski verilerle uyumluluk için
                return "#F44336"; // kırmızı
            case "reserved":
                return "#FFEB3B"; // sarı
            default:
                return "#8BC34A";
        }
    };

    return (
        <div style={{ padding: "2rem", display: "flex", gap: "2rem" }}>
            <div style={{ flexGrow: 1 }}>
                <h2>Kat {selectedFloor} - Masa Seçimi</h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                    {tables.map((tableId) => (
                        <div
                            key={tableId}
                            style={{
                                width: "100px",
                                height: "100px",
                                backgroundColor: getColor(tableStatus[tableId] || "empty"),
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                fontSize: "24px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                border: "2px solid #333",
                                userSelect: "none",
                            }}
                            onClick={() => handleTableClick(tableId)}
                            title={`Masa ${tableId}`}
                        >
                            {tableId.split("-")[1]}
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ width: "120px" }}>
                <h3>Katlar</h3>
                {[1, 2].map((floor) => (
                    <div
                        key={floor}
                        onClick={() => setSelectedFloor(floor)}
                        style={{
                            padding: "1rem",
                            marginBottom: "1rem",
                            borderRadius: "8px",
                            backgroundColor: selectedFloor === floor ? "#2196F3" : "#e0e0e0",
                            color: selectedFloor === floor ? "white" : "black",
                            textAlign: "center",
                            cursor: "pointer",
                            fontWeight: "bold",
                            userSelect: "none",
                        }}
                    >
                        Kat {floor}
                    </div>
                ))}
            </div>
        </div>
    );
}
