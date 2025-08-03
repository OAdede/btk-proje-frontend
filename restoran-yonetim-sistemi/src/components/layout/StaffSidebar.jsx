import React from "react";
import { NavLink } from "react-router-dom";
import "./StaffLayout.css";

// Bu Sidebar hem Garson hem Kasiyer için ortak olacak.
// İleride kullanıcı rolüne göre linkler gösterilip gizlenebilir.
const StaffSidebar = () => {
    const handleLogout = () => {
        console.log("Çıkış yapıldı");
    };

    return (
        <div className="staff-sidebar">
            <div className="staff-sidebar-header">
                <h2>Personel Paneli</h2>
            </div>
            <nav className="staff-sidebar-nav">
                {/* Garson Sayfaları */}
                <NavLink
                    to="/garson/masalar"
                    className={({ isActive }) => isActive ? "staff-nav-item active" : "staff-nav-item"}
                >
                    Masalar
                </NavLink>
                <NavLink
                    to="/garson/urunler"
                    className={({ isActive }) => isActive ? "staff-nav-item active" : "staff-nav-item"}
                >
                    Ürünler
                </NavLink>
                <NavLink
                    to="/garson/rezervasyonlar"
                    className={({ isActive }) => isActive ? "staff-nav-item active" : "staff-nav-item"}
                >
                    Rezervasyonlar
                </NavLink>
            </nav>
            <button
                className="staff-nav-item staff-logout-btn"
                onClick={handleLogout}
            >
                Çıkış Yap
            </button>
        </div>
    );
};

export default StaffSidebar;
