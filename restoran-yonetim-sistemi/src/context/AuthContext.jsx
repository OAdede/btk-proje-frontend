import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

// Test kullanıcıları güncellendi
const mockUsers = [
    { email: 'admin', password: '1234', role: 'admin', baseRole: 'admin' },
    { email: 'garson', password: '1234', role: 'garson', baseRole: 'garson' },
    { email: 'kasiyer', password: '1234', role: 'kasiyer', baseRole: 'kasiyer' }
];

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(undefined);

    useEffect(() => {
        // Bu useEffect, component ilk yüklendiğinde çalışır ve
        // başlangıçta 'undefined' olan kullanıcı durumunu 'null' (giriş yapılmamış) olarak ayarlar.
        // Bu, uygulamanın "yükleniyor" durumunda takılı kalmasını önler.
        setUser(null);
    }, []);

    const login = async (email, password) => {
        const foundUser = mockUsers.find(u => u.email === email && u.password === password);

        if (foundUser) {
            setUser({
                email: foundUser.email,
                baseRole: foundUser.baseRole,
                role: foundUser.role
            });
            return foundUser.role;
        } else {
            throw new Error('Geçersiz kullanıcı adı veya şifre');
        }
    };

    const logout = () => {
        setUser(null);
    };

    const switchRole = (newRole) => {
        setUser(currentUser => {
            if (currentUser.baseRole === 'admin') {
                return { ...currentUser, role: newRole };
            }
            return currentUser;
        });
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, switchRole }}>
            {children}
        </AuthContext.Provider>
    );
};
