import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './DevRoleSwitcher.css';

const DevRoleSwitcher = () => {
    const { user, switchRole } = useContext(AuthContext);
    const navigate = useNavigate();

    if (!user) {
        return null;
    }

    const roles = ['admin', 'garson', 'kasiyer'];

    const handleRoleChange = (role) => {
        switchRole(role, navigate);
    };

    return (
        <div className="dev-role-switcher">
            <h4 className="dev-role-switcher-title">Geliştirici Rolleri</h4>
            <div className="dev-role-switcher-buttons">
                {roles.map((role) => (
                    <button
                        key={role}
                        onClick={() => handleRoleChange(role)}
                        className={`dev-role-button ${user.role === role ? 'active' : ''}`}
                    >
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                ))}
            </div>
            <p className="current-role">Aktif Rol: <strong>{user.role}</strong></p>
        </div>
    );
};

export default DevRoleSwitcher;

