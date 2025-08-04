import React from "react";
import { NavLink } from "react-router-dom";
import "./StaffLayout.css";

// Bu Sidebar hem Garson hem Kasiyer için ortak olacak.
// İleride kullanıcı rolüne göre linkler gösterilip gizlenebilir.
const StaffSidebar = () => {

    return (
        <div className="staff-sidebar">
            <div className="staff-sidebar-header">
                <h2>Personel Paneli</h2>
            </div>
            <nav className="staff-sidebar-nav">
                {/* Garson ve Kasiyer Sayfaları */}
                <NavLink
                    to="/staff/home"
                    className={({ isActive }) => isActive ? "staff-nav-item active" : "staff-nav-item"}
                >
                    Ana Sayfa
                </NavLink>
                <NavLink
                    to="/staff/tables"
                    className={({ isActive }) => isActive ? "staff-nav-item active" : "staff-nav-item"}
                >
                    Masalar
                </NavLink>
            </nav>
        </div>
    );
};

export default StaffSidebar;
