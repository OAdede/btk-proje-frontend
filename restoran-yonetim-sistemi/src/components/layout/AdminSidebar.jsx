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
                    to="/admin/rezervasyon"
                    className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}
                >
                    Rezervasyon
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
                    to="/admin/orders"
                    className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}
                >
                    Sipariş Geçmişi
                </NavLink>
                <NavLink
                    to="/admin/reservations"
                    className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}
                >
                    Rezervasyonlar
                </NavLink>
                <NavLink
                    to="/admin/reports"
                    className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}
                >
                    Rapor
                </NavLink>
                {/* Diğer admin linkleri buraya eklenebilir */}
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
