import React from 'react';
import { NavLink } from 'react-router-dom';
import './AdminSidebar.css';

const AdminSidebar = () => {
    const handleLogout = () => {
        // TODO: Buraya AuthContext'ten gelen logout fonksiyonu bağlanacak
        console.log('Çıkış yapıldı');
    };

    return (
        <div className="admin-sidebar">
            <div className="sidebar-header">
                <h2>Admin Paneli</h2>
            </div>
            <nav className="sidebar-nav">
                {/* Gösterge Paneli linki "Ana Sayfa" olarak güncellendi ve hedefi dashboard */}
                <NavLink to="/admin/dashboard" end>Ana Sayfa</NavLink>
                {/* Stok Yönetimi linki kaldırıldı, daha sonra eklenebilir. */}
                <NavLink to="/admin/tables">Masalar</NavLink>
                {/* Ürün Yönetimi linki eklendi */}
                <NavLink to="/admin/products">Ürün Yönetimi</NavLink>
                {/* Rezervasyonlar linki eklendi */}
                <NavLink to="/admin/reservations">Rezervasyonlar</NavLink>
                <NavLink to="/admin/reports">Raporlar</NavLink>
                {/* Personel Yönetimi linki "Personel" olarak güncellendi */}
                <NavLink to="/admin/personnel">Personel</NavLink>
                <button onClick={handleLogout} className="logout-btn">Çıkış Yap</button>
            </nav>
        </div>
    );
};

export default AdminSidebar;
