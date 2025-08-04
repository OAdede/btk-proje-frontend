import React from 'react';
import { Outlet } from 'react-router-dom';
import StaffSidebar from './StaffSidebar';
import TopNav from './TopNav';
import { useTheme } from '../../context/ThemeContext';
import './StaffLayout.css';

const StaffLayout = () => {
    const { colors } = useTheme();

    return (
        <div className="staff-layout" style={{ background: colors.background }}>
            <TopNav />
            <div className="staff-content-wrapper">
                <StaffSidebar />
                <main className="staff-main-content" style={{ background: colors.card }}>
                    {/* Garson ve Kasiyer panellerinin alt sayfaları burada render edilecek */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default StaffLayout;
