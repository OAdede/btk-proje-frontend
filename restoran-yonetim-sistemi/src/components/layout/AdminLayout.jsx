import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import TopNav from './TopNav';
import { useTheme } from '../../context/ThemeContext';
import './AdminLayout.css';

const AdminLayout = () => {
    const { colors } = useTheme();

    return (
        <div className="admin-layout" style={{ background: colors.background }}>
            <TopNav />
            <div className="admin-content-wrapper">
                <AdminSidebar />
                <main className="admin-main-content" style={{ background: colors.card }}>
                    {/* Alt route'lar (Stok, Menu, Personel vb.) burada render edilecek */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
