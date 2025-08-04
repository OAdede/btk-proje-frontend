import React from "react";
import "./Dashboard.css";
import TablesGrid from "./TablesGrid";

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1>Hoşgeldiniz, Admin!</h1>
      <div className="dashboard-cards small">
        <div className="dashboard-card">
          <h3>Bugünkü Sipariş</h3>
          <p>12</p>
        </div>
        <div className="dashboard-card">
          <h3>Toplam Kazanç</h3>
          <p>1500₺</p>
        </div>
        <div className="dashboard-card">
          <h3>Aktif Rezervasyon</h3>
          <p>3</p>
        </div>
      </div>
      <div className="dashboard-actions">
        <button>Sipariş Ekle</button>
        <button>Ürün Ekle</button>
      </div>
      <TablesGrid />
    </div>
  );
};

export default Dashboard;