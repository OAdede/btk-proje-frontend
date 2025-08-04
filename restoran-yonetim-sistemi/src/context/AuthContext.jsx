import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // { role: 'garson' | 'kasiyer' | 'admin' }

    const login = (role) => {
        setUser({ role });
        // Gerçek uygulamada burada token vs. de saklanabilir.
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
