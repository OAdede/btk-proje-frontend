import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import './TopNav.css';

const TopNav = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const switchToRole = (role) => {
        // Kullanıcının mevcut rolünü geçici olarak değiştir
        if (role === 'admin') {
            navigate('/admin/dashboard');
        } else if (role === 'garson') {
            // Garson için orders sayfaları
            navigate('/staff/home');
        } else if (role === 'kasiyer') {
            // Kasiyer için Pelin'in sayfaları
            navigate('/kasiyer/home');
        }
    };

    return (
        <div className="top-nav">
            <div className="top-nav-left">
                <h2 className="top-nav-title">Restoran Yönetim Sistemi</h2>
            </div>
            
            <div className="top-nav-center">
                <div className="role-switcher">
                    <button 
                        className={`role-btn ${!user || user?.role === 'admin' ? 'active' : ''}`}
                        onClick={() => switchToRole('admin')}
                    >
                        Admin
                    </button>
                    <button 
                        className={`role-btn ${user?.role === 'garson' ? 'active' : ''}`}
                        onClick={() => switchToRole('garson')}
                    >
                        Garson
                    </button>
                    <button 
                        className={`role-btn ${user?.role === 'kasiyer' ? 'active' : ''}`}
                        onClick={() => switchToRole('kasiyer')}
                    >
                        Kasiyer
                    </button>
                </div>
            </div>

            <div className="top-nav-right">
                {user ? (
                    <>
                        <div className="user-info">
                            <span className="user-name">{user?.name || 'Kullanıcı'}</span>
                            <span className="user-role">({user?.role || 'Rol'})</span>
                        </div>
                        <button className="logout-btn" onClick={handleLogout}>
                            Çıkış Yap
                        </button>
                    </>
                ) : (
                    <button className="login-btn" onClick={() => navigate('/login')}>
                        Giriş Yap
                    </button>
                )}
            </div>
        </div>
    );
};

export default TopNav; 