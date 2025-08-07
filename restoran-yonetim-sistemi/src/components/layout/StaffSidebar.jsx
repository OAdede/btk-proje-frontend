import React, { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { TableContext } from "../../context/TableContext";
import "./StaffLayout.css";

const StaffSidebar = () => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme, colors } = useTheme();
    const { reservations, removeReservation } = useContext(TableContext);
    const [showSettings, setShowSettings] = useState(false);
    const [showReservations, setShowReservations] = useState(false);

    // Kat harflerini belirle
    const getFloorLetter = (floorIndex) => {
        if (floorIndex === 0) return 'Z'; // Zemin kat
        return String.fromCharCode(64 + floorIndex); // A, B, C, D...
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Mevcut role göre ana sayfa yolunu belirle
    const homePath = `/${user?.role}/home`;

    return (
        <div className="staff-sidebar">
            <div className="staff-sidebar-header">
                <h2>Personel Paneli</h2>
            </div>
            <nav className="staff-sidebar-nav">
                <NavLink
                    to={homePath}
                    className={({ isActive }) => isActive ? "staff-nav-item active" : "staff-nav-item"}
                >
                    Masalar
                </NavLink>

                {/* SADECE GARSON ROLÜNDE GÖZÜKMESİ İÇİN KISITLAMA */}
                {user?.role === 'garson' && (
                    <NavLink
                        to={`/${user?.role}/orders`}
                        className={({ isActive }) => isActive ? "staff-nav-item active" : "staff-nav-item"}
                    >
                        Siparişlerim
                    </NavLink>
                )}
            </nav>

            {/* Rezervasyonlar Bölümü */}
            <div style={{
                padding: '15px',
                borderTop: `1px solid ${colors.border}`,
                borderBottom: `1px solid ${colors.border}`
            }}>
                <button
                    onClick={() => setShowReservations(!showReservations)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: colors.text,
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <span>📅 Rezervasyonlar</span>
                    <span style={{
                        background: Object.keys(reservations).length > 0 ? colors.success : colors.textSecondary,
                        color: 'white',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold'
                    }}>
                        {Object.keys(reservations).length}
                    </span>
                </button>

                {showReservations && (
                    <div style={{
                        maxHeight: '300px',
                        overflowY: 'auto',
                        marginTop: '10px'
                    }}>
                        {Object.keys(reservations).length === 0 ? (
                            <div style={{
                                color: colors.textSecondary,
                                fontSize: '0.9rem',
                                textAlign: 'center',
                                padding: '10px',
                                fontStyle: 'italic'
                            }}>
                                Henüz rezervasyon yok
                            </div>
                        ) : (
                            Object.entries(reservations).map(([tableId, reservation]) => (
                                <div key={tableId} style={{
                                    background: colors.card,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    marginBottom: '8px',
                                    border: `1px solid ${colors.border}`,
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '8px'
                                    }}>
                                        <div style={{
                                            color: colors.text,
                                            fontWeight: 'bold',
                                            fontSize: '0.9rem'
                                        }}>
                                            Masa {getFloorLetter(parseInt(tableId.split('-')[0]))}{tableId.split('-')[1]}
                                        </div>
                                        <button
                                            onClick={() => removeReservation(tableId)}
                                            style={{
                                                background: colors.danger,
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '20px',
                                                height: '20px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            title="Rezervasyonu İptal Et"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <div style={{
                                        color: colors.textSecondary,
                                        fontSize: '0.8rem',
                                        marginBottom: '4px'
                                    }}>
                                        {reservation.adSoyad}
                                    </div>
                                    <div style={{
                                        color: colors.textSecondary,
                                        fontSize: '0.8rem',
                                        marginBottom: '4px'
                                    }}>
                                        {reservation.tarih} - {reservation.saat}
                                    </div>
                                    <div style={{
                                        color: colors.textSecondary,
                                        fontSize: '0.8rem'
                                    }}>
                                        {reservation.kisiSayisi} kişi
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <div className="staff-sidebar-bottom">
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="staff-settings-btn"
                    style={{
                        background: isDarkMode ? '#513653' : 'linear-gradient(90deg,rgb(83, 34, 112) 0%,rgb(54, 16, 98) 100%)',
                        color: '#513653',
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
