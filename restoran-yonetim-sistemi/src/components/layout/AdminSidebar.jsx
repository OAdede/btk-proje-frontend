import React, { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import "./AdminLayout.css";

const AdminSidebar = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme, colors } = useTheme();
    const [showSettings, setShowSettings] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Tema renklerine göre buton stilleri
    const buttonStyles = isDarkMode ? {
        background: '#513653', // Koyu mor arka plan
        textColor: '#F08080', // Kırmızı-pembe yazı
        borderColor: '#F08080', // Kırmızı-pembe kenarlık
        hoverBackground: '#473653'
    } : {
        background: '#A294F9', // Açık temada mor arka plan
        textColor: '#2D1B69', // Koyu mor yazı
        borderColor: '#2D1B69', // Koyu mor kenarlık
        hoverBackground: '#CDC1FF'
    };

    return (
        <div className="admin-sidebar" style={{ background: colors.sidebar }}>
            <div className="admin-sidebar-header">
                <div className="admin-user-info">
                    <div className="admin-user-name" style={{
                        fontFamily: '00623 Sans Serif Bold, sans-serif',
                        fontWeight: '700',
                        fontSize: '1.4rem',
                        color: colors.text
                    }}>Betül</div>
                    <div className="admin-user-role" style={{
                        fontFamily: '00623 Sans Serif Bold, sans-serif',
                        fontWeight: '700',
                        fontSize: '1.2rem',
                        color: colors.textSecondary
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
            </nav>

            {/* Alt kısım - Ayarlar ve Çıkış */}
            <div className="admin-sidebar-bottom">
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="admin-settings-btn"
                    style={{
                        background: buttonStyles.background,
                        color: buttonStyles.textColor,
                        border: `1px solid ${buttonStyles.borderColor}`,
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
                    onMouseEnter={(e) => {
                        e.target.style.background = buttonStyles.hoverBackground;
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = buttonStyles.background;
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
                            background: isDarkMode ? 'rgba(50, 38, 58, 0.9)' : 'rgba(162, 148, 249, 0.9)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 999999
                        }}
                        onClick={() => setShowSettings(false)}
                    >
                        <div
                            style={{
                                background: isDarkMode ? '#513653' : '#F5EFFF',
                                borderRadius: '15px',
                                padding: '30px',
                                minWidth: '400px',
                                maxWidth: '500px',
                                boxShadow: isDarkMode ? '0 10px 30px rgba(50, 38, 58, 0.5)' : '0 10px 30px rgba(162, 148, 249, 0.3)',
                                border: `2px solid ${isDarkMode ? '#473653' : '#CDC1FF'}`,
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
                                    color: isDarkMode ? '#F08080' : '#EF4444',
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
                                    e.target.style.background = isDarkMode ? 'rgba(240, 128, 128, 0.2)' : 'rgba(239, 68, 68, 0.2)';
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
                                color: isDarkMode ? '#ffffff' : '#2D1B69',
                                marginBottom: '20px',
                                textAlign: 'center'
                            }}>
                                ⚙️ Ayarlar
                            </div>
                            <div style={{
                                fontSize: '1rem',
                                fontWeight: '600',
                                color: isDarkMode ? '#e0e0e0' : '#4A3B76',
                                marginBottom: '15px'
                            }}>
                                Tema Seçimi
                            </div>
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                                <button
                                    onClick={() => toggleTheme()}
                                    style={{
                                        background: isDarkMode ? '#473653' : '#A294F9',
                                        color: isDarkMode ? '#ffffff' : '#ffffff',
                                        border: `2px solid ${isDarkMode ? '#53364D' : '#CDC1FF'}`,
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
                                        e.target.style.background = isDarkMode ? '#53364D' : '#CDC1FF';
                                        e.target.style.boxShadow = isDarkMode ? '0 4px 12px rgba(50, 38, 58, 0.4)' : '0 4px 12px rgba(162, 148, 249, 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.background = isDarkMode ? '#473653' : '#A294F9';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                >
                                    {isDarkMode ? '🌙' : '☀️'}
                                    {isDarkMode ? 'Gece Modu' : 'Gündüz Modu'}
                                </button>
                            </div>
                            <div style={{
                                fontSize: '0.9rem',
                                color: isDarkMode ? '#b0b0b0' : '#6B5B8A',
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
                        background: buttonStyles.background,
                        color: buttonStyles.textColor,
                        border: `1px solid ${buttonStyles.borderColor}`,
                        padding: '12px 20px',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = buttonStyles.hoverBackground;
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = buttonStyles.background;
                    }}
                >
                    Çıkış Yap
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
