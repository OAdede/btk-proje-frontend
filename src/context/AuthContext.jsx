import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userRole, setUserRole] = useState(null); // 'garson', 'kasiyer', 'admin'

    const login = (role) => {
        setUserRole(role);
        // Gerçek bir uygulamada burada token vs. localStorage'a kaydedilebilir.
    };

    const logout = () => {
        setUserRole(null);
    };

    return (
        <AuthContext.Provider value={{ userRole, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
