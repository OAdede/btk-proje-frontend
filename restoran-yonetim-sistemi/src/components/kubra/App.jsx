import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import TablesPage from "./pages/TablesPage";
import ProductsPage from "./pages/ProductsPage";
import ReservationsPage from "./pages/ReservationsPage";
import ReportsPage from "./pages/ReportsPage";
import "./App.css";

// Bu dosya artık bir Router içermemeli, çünkü bu görev ana App.jsx'te yapılıyor.
// Bu bileşen, Garson Paneli'nin kendi içindeki sayfa düzenini yönetir.
function GarsonPanel() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        {/*
          Buradaki Routes, ana App.jsx'teki /garson/* yolunun altındaki
          iç yönlendirmeleri yönetecek. Ancak şimdilik basitleştirmek için
          ana sayfasını (HomePage) her zaman gösterecek şekilde ayarlıyoruz.
          Daha sonra bu iç yönlendirmeleri detaylandırabiliriz.
        */}
        <HomePage />
      </div>
    </div>
  );
}

export default GarsonPanel;
