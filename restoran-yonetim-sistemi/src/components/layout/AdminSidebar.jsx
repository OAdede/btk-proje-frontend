import React from "react";
import { NavLink } from "react-router-dom";
import "./AdminLayout.css";

const AdminSidebar = () => {
    const handleLogout = () => {
        // Gelecekte logout mantığı buraya eklenecek
        console.log("Çıkış yapıldı");
    };

    return (
        <div className="admin-sidebar">
            <div className="admin-sidebar-header">
                <h2>Admin Paneli</h2>
            </div>
            <nav className="admin-sidebar-nav">
                <NavLink to="/admin/stok" className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
                    Stok Güncelle
                </NavLink>
                <NavLink to="/admin/menu" className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
                    Menü Güncelle
                </NavLink>
                <NavLink to="/admin/personel" className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
                    Personel Ekleme
                </NavLink>
                <NavLink to="/admin/masalar" className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
                    Masa Yönetimi
                </NavLink>
                <NavLink to="/admin/raporlar" className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
                    Raporlar
                </NavLink>
            </nav>
            <button
                className="admin-nav-item admin-logout-btn"
                onClick={handleLogout}
            >
                Çıkış Yap
            </button>
        </div>
    );
};

export default AdminSidebar;
