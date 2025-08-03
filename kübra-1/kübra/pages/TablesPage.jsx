import React, { useState } from "react";
import "./TablesPage.css";

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
    status: "boş"
  })));

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

  const handleTableClick = (tableId, floor) => {
    console.log(`${floor} - Masa ${tableId} tıklandı - Durum değiştirme modalı açılacak`);
    // İleride burada modal açılacak
  };

  const addTable = (floor) => {
    if (floor === "kat1") {
      if (kat1Tables.length >= 8) return; // 8'den fazla masa olmasın
      const newTable = {
        id: kat1Tables.length + 1,
        name: `${kat1Tables.length + 1}`,
        status: "boş"
      };
      setKat1Tables([...kat1Tables, newTable]);
    } else {
      if (kat2Tables.length >= 8) return;
      const newTable = {
        id: kat2Tables.length + 9,
        name: `${kat2Tables.length + 9}`,
        status: "boş"
      };
      setKat2Tables([...kat2Tables, newTable]);
    }
  };

  const removeTable = (tableId, floor) => {
    if (floor === "kat1") {
      setKat1Tables(kat1Tables.filter(table => table.id !== tableId));
    } else {
      setKat2Tables(kat2Tables.filter(table => table.id !== tableId));
    }
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
              onClick={() => handleTableClick(table.id, activeFloor)}
            >
              <div className="table-number">{table.name}</div>
              <div className="table-status">{table.status.charAt(0).toUpperCase() + table.status.slice(1)}</div>
              <button 
                className="remove-table-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTable(table.id, activeFloor);
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TablesPage; 