import React from 'react';
import { NavLink } from 'react-router-dom';
import './StaffSidebar.css';

const StaffSidebar = () => {
    const handleLogout = () => {
        // TODO: AuthContext'ten gelen logout fonksiyonu buraya bağlanacak
        console.log('Çıkış yapıldı');
    };

    return (
        <div className="staff-sidebar">
            <div className="sidebar-header">
                <h2>Personel Paneli</h2>
            </div>
            <nav className="sidebar-nav">
                <NavLink to="/staff/home" end>Ana Sayfa</NavLink>
                <NavLink to="/staff/tables">Masalar</NavLink>
                <NavLink to="/staff/reservations">Rezervasyonlar</NavLink>
                <button onClick={handleLogout} className="logout-btn">Çıkış Yap</button>
            </nav>
        </div>
    );
};

export default StaffSidebar;
