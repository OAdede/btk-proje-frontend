import React, { useState } from "react";
import "./TablesPage.css";
import TableStatusModal from "../../components/tables/TableStatusModal";

const TablesPage = () => {
    const [activeFloor, setActiveFloor] = useState("kat1");
    const [kat1Tables, setKat1Tables] = useState(Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        name: `1-${i + 1}`,
        status: "boş"
    })));

    const [kat2Tables, setKat2Tables] = useState(Array.from({ length: 8 }, (_, i) => ({
        id: i + 9,
        name: `2-${i + 1}`,
        status: "dolu"
    })));

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);

    const statusColors = {
        "boş": "#8BC34A",
        "dolu": "#F44336",
        "rezerve": "#FFEB3B"
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

        if (activeFloor === "kat1") {
            setKat1Tables(tableUpdater);
        } else {
            setKat2Tables(tableUpdater);
        }
        handleCloseModal();
    };

    const currentTables = activeFloor === "kat1" ? kat1Tables : kat2Tables;

    return (
        <div className="tables-page-container">
            <div className="tables-section">
                <h1>Masa Yönetimi - Kat {activeFloor === "kat1" ? 1 : 2}</h1>
                <div className="tables-grid-pelin">
                    {currentTables.map((table) => (
                        <div
                            key={table.id}
                            className="table-box"
                            style={{ backgroundColor: statusColors[table.status] }}
                            onClick={() => handleTableClick(table)}
                            title={`Masa ${table.name}`}
                        >
                            {table.name.split("-")[1]}
                        </div>
                    ))}
                </div>
            </div>
            <div className="floor-selection-section">
                <h3>Katlar</h3>
                <div
                    className={`floor-selector-box ${activeFloor === "kat1" ? "active" : ""}`}
                    onClick={() => setActiveFloor("kat1")}
                >
                    Kat 1
                </div>
                <div
                    className={`floor-selector-box ${activeFloor === "kat2" ? "active" : ""}`}
                    onClick={() => setActiveFloor("kat2")}
                >
                    Kat 2
                </div>
            </div>
            <TableStatusModal
                visible={isModalOpen}
                onClose={handleCloseModal}
                onStatusChange={handleStatusChange}
                currentStatus={selectedTable?.status}
            />
        </div>
    );
};

export default TablesPage;
