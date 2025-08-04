import React, { useState } from "react";
import "./TablesPage.css";
import TableStatusModal from "../../components/tables/TableStatusModal";

const TablesPage = () => {
    const [activeFloor, setActiveFloor] = useState("kat1");
    const [kat1Tables, setKat1Tables] = useState(Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        name: `${i + 1}`,
        status: "boş"
    })));

    const [kat2Tables, setKat2Tables] = useState(Array.from({ length: 8 }, (_, i) => ({
        id: i + 9,
        name: `${i + 9}`,
        status: "dolu"
    })));

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);

    const statusColors = {
        "boş": "#4caf50",
        "dolu": "#f44336",
        "rezerve": "#ffeb3b"
    };

    const statusTextColor = {
        "boş": "#fff",
        "dolu": "#fff",
        "rezerve": "#222"
    };

    const handleTableClick = (table) => {
        setSelectedTable(table);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTable(null);
    };

    const handleStatusChange = (newStatus) => {
        const tableUpdater = (tables) =>
            tables.map(t => t.id === selectedTable.id ? { ...t, status: newStatus } : t);

        if (kat1Tables.some(t => t.id === selectedTable.id)) {
            setKat1Tables(tableUpdater);
        } else {
            setKat2Tables(tableUpdater);
        }
        handleCloseModal();
    };

    const addTable = (floor) => {
        if (floor === "kat1") {
            if (kat1Tables.length >= 8) return;
            const newTable = {
                id: (kat1Tables.length > 0 ? Math.max(...kat1Tables.map(t => t.id)) : 0) + 1,
                name: `${(kat1Tables.length > 0 ? Math.max(...kat1Tables.map(t => t.id)) : 0) + 1}`,
                status: "boş"
            };
            setKat1Tables([...kat1Tables, newTable]);
        } else {
            if (kat2Tables.length >= 8) return;
            const newTable = {
                id: (kat2Tables.length > 0 ? Math.max(...kat2Tables.map(t => t.id)) : 8) + 1,
                name: `${(kat2Tables.length > 0 ? Math.max(...kat2Tables.map(t => t.id)) : 8) + 1}`,
                status: "boş"
            };
            setKat2Tables([...kat2Tables, newTable]);
        }
    };

    const removeTable = (tableId) => {
        if (kat1Tables.some(t => t.id === tableId)) {
            setKat1Tables(kat1Tables.filter(table => table.id !== tableId));
        } else {
            setKat2Tables(kat2Tables.filter(table => table.id !== tableId));
        }
    };

    const currentTables = activeFloor === "kat1" ? kat1Tables : kat2Tables;

    return (
        <>
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
                <div className="tables-controls">
                    <button className="add-table-btn" onClick={() => addTable(activeFloor)} disabled={currentTables.length >= 8}>
                        + Masa Ekle
                    </button>
                </div>
                <div className="tables-grid">
                    <h2>{activeFloor === "kat1" ? "Kat 1" : "Kat 2"} Masaları</h2>
                    <div className="tables-list">
                        {currentTables.map((table) => (
                            <div
                                key={table.id}
                                className="table-card"
                                style={{
                                    background: statusColors[table.status],
                                    color: statusTextColor[table.status]
                                }}
                                onClick={() => handleTableClick(table)}
                            >
                                <div className="table-number">{table.name}</div>
                                <div className="table-status">{table.status.charAt(0).toUpperCase() + table.status.slice(1)}</div>
                                <button
                                    className="remove-table-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeTable(table.id);
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <TableStatusModal
                visible={isModalOpen}
                onClose={handleCloseModal}
                onStatusChange={handleStatusChange}
                currentStatus={selectedTable?.status}
            />
        </>
    );
};

export default TablesPage;