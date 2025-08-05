import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';

export default function WaiterLayout() {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div>
            <header style={{ backgroundColor: '#f1f1f1', padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <h3>Garson Paneli</h3>
                <div>
                    <span>{user?.fullName}</span>
                    <button onClick={handleLogout} style={{ marginLeft: '1rem' }}>Çıkış Yap</button>
                </div>
            </header>

            <main style={{ padding: '1rem' }}>
                <Outlet />
            </main>
        </div>
    );
}
