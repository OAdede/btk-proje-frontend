import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { TableContext } from "../../context/TableContext"; // YOL GÜNCELLENDİ
import "./TablesPage.css";

const TablesPage = () => {
    const navigate = useNavigate();
    // CONTEXT'TEN DOĞRU VERİLER ALINDI
    const { tableStatus, tables } = useContext(TableContext);
    const [activeFloor, setActiveFloor] = useState("kat1");


    const kat1Tables = Array.from({ length: 8 }, (_, i) => ({ id: `${i + 1}`, name: `${i + 1}` }));
    const kat2Tables = Array.from({ length: 8 }, (_, i) => ({ id: `${i + 9}`, name: `${i + 9}` }));

    // RENKLER YENİ STATÜLERE GÖRE GÜNCELLENDİ
    const statusColors = {
        "bos": "#4caf50",
        "dolu": "#f44336",
        "rezerve": "#ffeb3b"
    };

    const statusTextColor = {
        "bos": "#fff",
        "dolu": "#fff",
        "rezerve": "#222"
    };

    const handleTableClick = (tableId) => {
        // Yönlendirme artık göreceli yola göre doğru çalışacak
        navigate(`../order/${tableId}`);
    };

    // METİNLER YENİ STATÜLERE GÖRE GÜNCELLENDİ
    const getStatusText = (status) => {
        switch (status) {
            case "bos": return "Boş";
            case "dolu": return "Dolu";
            case "rezerve": return "Rezerve";
            default: return "Boş";
        }
    }

    // Calculate occupancy using current table status as a proxy
    const getTableOccupancy = (tableId) => {
        const backendTable = tables?.find(t => String(t?.tableNumber ?? t?.id) === String(tableId));
        if (!backendTable) return null;
        const capacity = backendTable?.capacity || 4;
        const statusName = String(
            backendTable?.status?.name ?? backendTable?.statusName ?? backendTable?.status_name ?? ''
        ).toLowerCase();
        let rate = 0;
        if (statusName === 'occupied') rate = 100;
        else if (statusName === 'reserved') rate = 60;
        else rate = 0;
        return { rate, people: null, capacity };
    };

    const currentTables = activeFloor === "kat1" ? kat1Tables : kat2Tables;

    return (
        <div className="tables-page">
            <h1>Masa Yönetimi</h1>
            <div className="floor-selector">
                <button
                    className={`floor-btn ${activeFloor === "kat1" ? "active" : ""}`}
                    onClick={() => setActiveFloor("kat1")}
                >
                    Kat 1
                </button>
                <button
                    className={`floor-btn ${activeFloor === "kat2" ? "active" : ""}`}
                    onClick={() => setActiveFloor("kat2")}
                >
                    Kat 2
                </button>
            </div>

            <div className="tables-grid">
                <h2>{activeFloor === "kat1" ? "Kat 1" : "Kat 2"} Masaları</h2>
                <div className="tables-list">
                    {currentTables.map((table) => {
                        // Statü okunması basitleştirildi
                        const status = tableStatus[table.id] || "bos";
                        return (
                            <div
                                key={table.id || crypto.randomUUID()}
                                className="table-card"
                                style={{
                                    background: statusColors[status],
                                    color: statusTextColor[status]
                                }}
                                onClick={() => handleTableClick(table.id)}
                            >
                                <div className="table-number">{table.name}</div>
                                <div className="table-status">{getStatusText(status)}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TablesPage;
