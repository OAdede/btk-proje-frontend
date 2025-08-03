import React from "react";
import "./TablesGrid.css";

// 16 masa, başlangıçta hepsi boş
const tables = Array.from({ length: 16 }, (_, index) => ({
  id: index + 1,
  name: `${index + 1}`,
  status: "boş"
}));

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

const TablesGrid = () => {
  const handleTableClick = (tableId) => {
    console.log(`Masa ${tableId} tıklandı - Durum değiştirme modalı açılacak`);
    // İleride burada modal açılacak
  };

  return (
    <div className="tables-grid">
      <h2>Masalar</h2>
      <div className="tables-list">
        {tables.map((table) => (
          <div
            key={table.id}
            className="table-card"
            style={{
              background: statusColors[table.status],
              color: statusTextColor[table.status]
            }}
            onClick={() => handleTableClick(table.id)}
          >
            <div className="table-number">{table.name}</div>
            <div className="table-status">{table.status.charAt(0).toUpperCase() + table.status.slice(1)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TablesGrid;