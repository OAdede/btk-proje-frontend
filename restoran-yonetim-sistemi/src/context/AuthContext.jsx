import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

// Backend simülasyonu için sahte veritabanı
const mockUsers = [
    { id: 1, email: 'admin@restoran.com', password: '123', role: 'admin', name: 'Yönetici Admin' },
    { id: 2, email: 'kasiyer@restoran.com', password: '123', role: 'kasiyer', name: 'Ayşe Kasa' },
    { id: 3, email: 'garson@restoran.com', password: '123', role: 'garson', name: 'Ali Veli' },
];

// Sahte API çağrısını simüle eden yardımcı fonksiyon
const fakeApiCall = (duration = 500) => new Promise(resolve => setTimeout(resolve, duration));

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Sayfa yenilendiğinde kullanıcı oturumunu kontrol et
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Kullanıcı verisi okunurken hata:", error);
            localStorage.removeItem('user');
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        await fakeApiCall();
        const foundUser = mockUsers.find(u => u.email === email && u.password === password);

        if (foundUser) {
            const userData = { id: foundUser.id, email: foundUser.email, role: foundUser.role, name: foundUser.name };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return userData.role;
        } else {
            throw new Error('E-posta veya şifre hatalı.');
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const requestPasswordReset = async (email) => {
        await fakeApiCall();
        console.log(`Şifre sıfırlama isteği backend'e gönderildi: ${email}`);
        // Her zaman başarılı mesajı göstererek kullanıcıların hangi e-postaların kayıtlı olduğunu anlamasını engelle
        return `Eğer ${email} adresi sistemimizde kayıtlıysa, şifre sıfırlama linki gönderildi.`;
    };

    const resetPassword = async (token, password) => {
        await fakeApiCall();
        console.log(`Yeni şifre (${password}) backend'e gönderildi. Token: ${token}`);
        if (!token || token === 'invalid_token') {
            throw new Error('Geçersiz veya süresi dolmuş link.');
        }
        return 'Şifreniz başarıyla güncellendi.';
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, requestPasswordReset, resetPassword }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
