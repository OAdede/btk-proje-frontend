import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

// Test kullanıcıları güncellendi
const mockUsers = [
    { 
        email: 'admin', 
        password: '1234', 
        role: 'admin', 
        baseRole: 'admin',
        name: 'Betül',
        surname: 'Admin',
        phone: '5551234567',
        profileImage: null
    },
    { 
        email: 'garson', 
        password: '1234', 
        role: 'garson', 
        baseRole: 'garson',
        name: 'Ahmet',
        surname: 'Garson',
        phone: '5551234568',
        profileImage: null
    },
    { 
        email: 'kasiyer', 
        password: '1234', 
        role: 'kasiyer', 
        baseRole: 'kasiyer',
        name: 'Ayşe',
        surname: 'Kasiyer',
        phone: '5551234569',
        profileImage: null
    }
];

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // undefined yerine null

    const login = async (email, password) => {
        const foundUser = mockUsers.find(u => u.email === email && u.password === password);

        if (foundUser) {
            setUser({
                email: foundUser.email,
                baseRole: foundUser.baseRole,
                role: foundUser.role,
                name: foundUser.name,
                surname: foundUser.surname,
                phone: foundUser.phone,
                profileImage: foundUser.profileImage
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

    // Profil güncelleme fonksiyonları
    const updateProfileImage = (imageUrl) => {
        setUser(currentUser => ({
            ...currentUser,
            profileImage: imageUrl
        }));
    };

    const updatePhone = (newPhone) => {
        setUser(currentUser => ({
            ...currentUser,
            phone: newPhone
        }));
    };

    const updateEmail = (newEmail) => {
        setUser(currentUser => ({
            ...currentUser,
            email: newEmail
        }));
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            logout, 
            switchRole, 
            updateProfileImage, 
            updatePhone, 
            updateEmail 
        }}>
            {children}
        </AuthContext.Provider>
    );
};
