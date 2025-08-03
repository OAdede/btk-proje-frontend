import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { TableContext } from "../../../context/TableContext"; // Global context'i import et
import "./TablesPage.css";

const TablesPage = () => {
  const navigate = useNavigate();
  const { tableStatus, updateTableStatus } = useContext(TableContext); // Context'ten masaların durumunu al
  const [activeFloor, setActiveFloor] = useState("kat1");

  // Katlardaki masaları tanımla (bu kısım sabit kalabilir veya API'den gelebilir)
  const kat1Tables = Array.from({ length: 8 }, (_, i) => ({ id: `1-${i + 1}`, name: `${i + 1}` }));
  const kat2Tables = Array.from({ length: 8 }, (_, i) => ({ id: `2-${i + 1}`, name: `${i + 9}` }));

  const statusColors = {
    "empty": "#4caf50", // boş
    "occupied": "#f44336", // dolu
    "reserved": "#ffeb3b" // rezerve
  };

  const statusTextColor = {
    "empty": "#fff",
    "occupied": "#fff",
    "reserved": "#222"
  };

  // Masaya tıklandığında sipariş sayfasına yönlendir
  const handleTableClick = (tableId) => {
    navigate(`order/${tableId}`);
  };

  const getStatusText = (status) => {
    switch (status) {
      case "empty": return "Boş";
      case "occupied": return "Dolu";
      case "reserved": return "Rezerve";
      default: return "Boş";
    }
  }

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
            const status = tableStatus[table.id] || "empty";
            return (
              <div
                key={table.id}
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
