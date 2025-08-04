import React from "react";
import { NavLink } from "react-router-dom";
import "./AdminLayout.css";

const AdminSidebar = () => {

    return (
        <div className="admin-sidebar">
            <div className="admin-sidebar-header">
                <div className="admin-user-info">
                    <div className="admin-user-name">Betül</div>
                    <div className="admin-user-role">Admin</div>
                </div>
            </div>
            <nav className="admin-sidebar-nav">
                {/* NavLink, URL'ye göre aktif linki otomatik olarak stillendirir */}
                <NavLink
                    to="/admin/dashboard"
                    className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}
                >
                    Ana Sayfa
                </NavLink>
                <NavLink
                    to="/admin/stock"
                    className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}
                >
                    Stok Güncelleme
                </NavLink>

                <NavLink
                    to="/admin/products"
                    className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}
                >
                    Menü Güncelleme
                </NavLink>
                <NavLink
                    to="/admin/personel"
                    className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}
                >
                    Personel
                </NavLink>


                <NavLink
                    to="/admin/reports"
                    className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}
                >
                    Rapor
                </NavLink>
                {/* Diğer admin linkleri buraya eklenebilir */}
            </nav>
        </div>
    );
};

export default AdminSidebar;
