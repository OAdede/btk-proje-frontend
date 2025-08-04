import React, { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import "./StaffLayout.css";

// Bu Sidebar hem Garson hem Kasiyer için ortak olacak.
const StaffSidebar = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme, colors } = useTheme();
    const [showSettings, setShowSettings] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="staff-sidebar" style={{ background: colors.sidebar }}>
            <div className="staff-sidebar-header">
                <h2>Personel Paneli</h2>
            </div>
            <nav className="staff-sidebar-nav">
                {/* 
                  "Ana Sayfa" kaldırıldı. 
                  "Masalar" linki, garson/kasiyer ana sayfası olan WaiterHome'a yönlendiriyor.
                */}
                <NavLink
                    to="/kasiyer/home"
                    className={({ isActive }) => isActive ? "staff-nav-item active" : "staff-nav-item"}
                >
                    Masalar
                </NavLink>
            </nav>
            
            {/* Alt kısım - Ayarlar ve Çıkış */}
            <div className="staff-sidebar-bottom">
                {/* Ayarlar Butonu */}
                                       <button
                           onClick={() => setShowSettings(!showSettings)}
                           className="staff-settings-btn"
                           style={{
                               background: isDarkMode ? colors.button : 'linear-gradient(90deg, #2d8cff 0%, #7f9cf5 100%)',
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

                {/* Tema Değiştirme Modal */}
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
                                background: colors.card,
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
                            {/* Kapatma Butonu */}
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

                            {/* Modal İçeriği */}
                            <div style={{
                                fontSize: '1.2rem',
                                fontWeight: '700',
                                color: colors.text,
                                marginBottom: '20px',
                                textAlign: 'center'
                            }}>
                                ⚙️ Ayarlar
                            </div>

                            <div style={{
                                fontSize: '1rem',
                                fontWeight: '600',
                                color: colors.text,
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
                                color: colors.textSecondary,
                                textAlign: 'center',
                                fontStyle: 'italic'
                            }}>
                                Tema tercihiniz kaydedildi ve otomatik olarak uygulanacak.
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

                {/* Çıkış Yap Butonu */}
                <button
                    onClick={handleLogout}
                    className="staff-logout-btn"
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

export default StaffSidebar;
