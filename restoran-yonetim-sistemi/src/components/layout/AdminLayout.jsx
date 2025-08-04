import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import './AdminLayout.css';

const AdminLayout = () => {
    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-main-content">
                {/* Alt route'lar (Stok, Menu, Personel vb.) burada render edilecek */}
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
