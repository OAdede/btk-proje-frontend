import React from 'react';
import { Outlet } from 'react-router-dom';
import StaffSidebar from './StaffSidebar';
import TopNav from './TopNav';
import './StaffLayout.css';

const StaffLayout = () => {
    return (
        <div className="staff-layout">
            <TopNav />
            <div className="staff-content-wrapper">
                <StaffSidebar />
                <main className="staff-main-content">
                    {/* Garson ve Kasiyer panellerinin alt sayfaları burada render edilecek */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default StaffLayout;
