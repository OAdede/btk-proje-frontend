import React, { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { TableContext } from "../../context/TableContext";
import "./AdminLayout.css";

const AdminSidebar = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme, colors } = useTheme();
    const { reservations } = useContext(TableContext);
    const [showSettings, setShowSettings] = useState(false);

    // Bugünkü rezervasyon sayısını hesapla
    const getTodayReservationsCount = () => {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD formatında bugün
        return Object.values(reservations).filter(reservation => 
            reservation.tarih === today
        ).length;
    };



    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="admin-sidebar">
            <div className="admin-sidebar-header">
                <div className="admin-user-info">
                    <div className="admin-user-name" style={{
                        fontFamily: '00623 Sans Serif Bold, sans-serif',
                        fontWeight: '700',
                        fontSize: '1.4rem'
                    }}>Betül</div>
                    <div className="admin-user-role" style={{
                        fontFamily: '00623 Sans Serif Bold, sans-serif',
                        fontWeight: '700',
                        fontSize: '1.2rem'
                    }}>Admin</div>
                </div>
            </div>
            <nav className="admin-sidebar-nav">
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
                    Ürün Yönetimi
                </NavLink>
                <NavLink
                    to="/admin/personnel"
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
                <NavLink
                    to="/admin/reservations"
                    className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}
                    style={{ position: 'relative' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.2rem' }}>📅</span>
                        <span>Rezervasyonlar</span>
                        {getTodayReservationsCount() > 0 && (
                            <span style={{
                                backgroundColor: '#28a745',
                                color: 'white',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                marginLeft: 'auto'
                            }}>
                                {getTodayReservationsCount()}
                            </span>
                        )}
                    </div>
                </NavLink>
            </nav>



            {/* Alt kısım - Ayarlar ve Çıkış */}
            <div className="admin-sidebar-bottom">
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="admin-settings-btn"
                    style={{
                        background: isDarkMode ? '#2a2a2a' : 'linear-gradient(90deg, #2d8cff 0%, #7f9cf5 100%)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '12px 20px',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        marginBottom: '10px',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <span>⚙️</span>
                    Ayarlar
                </button>

                {showSettings && createPortal(
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 999999
                        }}
                        onClick={() => setShowSettings(false)}
                    >
                                                 <div
                             style={{
                                 background: isDarkMode ? '#2a2a2a' : '#ffffff',
                                 borderRadius: '15px',
                                 padding: '30px',
                                 minWidth: '400px',
                                 maxWidth: '500px',
                                 boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                                 border: `1px solid ${colors.border}`,
                                 position: 'relative'
                             }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowSettings(false)}
                                style={{
                                    position: 'absolute',
                                    top: '15px',
                                    right: '20px',
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    color: colors.danger,
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    width: '30px',
                                    height: '30px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '50%',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(224, 25, 15, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'none';
                                }}
                            >
                                ✕
                            </button>
                                                         <div style={{
                                 fontSize: '1.2rem',
                                 fontWeight: '700',
                                 color: isDarkMode ? '#ffffff' : '#333333',
                                 marginBottom: '20px',
                                 textAlign: 'center'
                             }}>
                                 ⚙️ Ayarlar
                             </div>
                             <div style={{
                                 fontSize: '1rem',
                                 fontWeight: '600',
                                 color: isDarkMode ? '#ffffff' : '#333333',
                                 marginBottom: '15px'
                             }}>
                                 Tema Seçimi
                             </div>
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                                <button
                                    onClick={() => toggleTheme()}
                                    style={{
                                        background: isDarkMode ? colors.success : colors.button,
                                        color: colors.text,
                                        border: 'none',
                                        padding: '12px 20px',
                                        borderRadius: '10px',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                >
                                    {isDarkMode ? '🌙' : '☀️'}
                                    {isDarkMode ? 'Gece Modu' : 'Gündüz Modu'}
                                </button>
                            </div>
                                                         <div style={{
                                 fontSize: '0.9rem',
                                 color: isDarkMode ? '#cccccc' : '#666666',
                                 textAlign: 'center',
                                 fontStyle: 'italic'
                             }}>
                                 Tema tercihiniz kaydedildi ve otomatik olarak uygulanacak.
                             </div>
                        </div>
                    </div>,
                    document.body
                )}
                <button
                    onClick={handleLogout}
                    className="admin-logout-btn"
                    style={{
                        background: colors.danger,
                        color: '#ffffff',
                        border: 'none',
                        padding: '12px 20px',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        width: '100%'
                    }}
                >
                    Çıkış Yap
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
