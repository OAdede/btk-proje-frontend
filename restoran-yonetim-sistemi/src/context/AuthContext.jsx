import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

// Test kullanıcıları
const mockUsers = [
    { email: 'admin@restoran.com', password: '123', role: 'admin' },
    { email: 'garson@restoran.com', password: '123', role: 'garson' },
    { email: 'kasiyer@restoran.com', password: '123', role: 'kasiyer' }
];

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = async (email, password) => {
        // Test kullanıcılarını kontrol et
        const foundUser = mockUsers.find(u => u.email === email && u.password === password);
        
        if (foundUser) {
            setUser({ role: foundUser.role, email: foundUser.email });
            return foundUser.role;
        } else {
            throw new Error('Geçersiz email veya şifre');
        }
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
