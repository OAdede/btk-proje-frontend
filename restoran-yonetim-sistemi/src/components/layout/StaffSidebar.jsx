import React from "react";
import { NavLink } from "react-router-dom";
import "./StaffLayout.css";

// Bu Sidebar hem Garson hem Kasiyer için ortak olacak.
const StaffSidebar = () => {

    return (
        <div className="staff-sidebar">
            <div className="staff-sidebar-header">
                <h2>Personel Paneli</h2>
            </div>
            <nav className="staff-sidebar-nav">
                {/* 
                  "Ana Sayfa" kaldırıldı. 
                  "Masalar" linki, garson/kasiyer ana sayfası olan WaiterHome'a yönlendiriyor.
                */}
                <NavLink
                    to="/kasiyer/home"
                    className={({ isActive }) => isActive ? "staff-nav-item active" : "staff-nav-item"}
                >
                    Masalar
                </NavLink>
            </nav>
        </div>
    );
};

export default StaffSidebar;
