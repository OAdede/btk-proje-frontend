import React from "react";
import "./Dashboard.css"; // Bu CSS dosyasını daha sonra oluşturacağız

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

const kat1Tables = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  name: `${i + 1}`,
  status: "boş"
}));
const kat2Tables = Array.from({ length: 8 }, (_, i) => ({
  id: i + 9,
  name: `${i + 9}`,
  status: "dolu"
}));

const Dashboard = () => {
  return (
    <div className="home-page">
      <h1>Hoşgeldiniz, Admin!</h1>
      <div className="katlar-wrapper">
        <div className="kat">
          <h2>1. Kat</h2>
          <div className="tables-list-home">
            {kat1Tables.map((table) => (
              <div
                key={table.id}
                className="table-card-home"
                style={{
                  background: statusColors[table.status],
                  color: statusTextColor[table.status]
                }}
              >
                <div className="table-number-home">{table.name}</div>
                <div className="table-status-home">{table.status.charAt(0).toUpperCase() + table.status.slice(1)}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="kat">
          <h2>2. Kat</h2>
          <div className="tables-list-home">
            {kat2Tables.map((table) => (
              <div
                key={table.id}
                className="table-card-home"
                style={{
                  background: statusColors[table.status],
                  color: statusTextColor[table.status]
                }}
              >
                <div className="table-number-home">{table.name}</div>
                <div className="table-status-home">{table.status.charAt(0).toUpperCase() + table.status.slice(1)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
