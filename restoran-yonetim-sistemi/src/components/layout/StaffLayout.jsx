import React from 'react';
import { Outlet } from 'react-router-dom';
import StaffSidebar from './StaffSidebar'; // Yeni kenar çubuğunu import et
import './StaffLayout.css';

const StaffLayout = () => {
    return (
        <div className="app-layout"> {/* AdminLayout ile aynı sınıf adını kullanarak genel stilleri paylaşabiliriz */}
            <StaffSidebar />
            <main className="main-content">
                <div className="page-container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default StaffLayout;
