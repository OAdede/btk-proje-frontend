import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // İleride logout işlemi burada yapılacak
    console.log("Çıkış yapılıyor...");
    // navigate("/login"); // Login sayfasına yönlendirme
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Admin Paneli</h2>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          Ana Sayfa
        </NavLink>
        <NavLink to="/admin/tables" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          Masalar
        </NavLink>
        <NavLink to="/admin/menu" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          Ürün Yönetimi
        </NavLink>
        <NavLink to="/admin/reservations" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          Rezervasyonlar
        </NavLink>
        <NavLink to="/admin/reports" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          Raporlar
        </NavLink>
        <NavLink to="/admin/personnel" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          Personel
        </NavLink>
        <button className="nav-item logout-btn" onClick={handleLogout}>
          Çıkış Yap
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
