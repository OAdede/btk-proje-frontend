import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

// Başlangıç kullanıcıları (veritabanı simülasyonu)
const initialUsers = {
    'admin': { password: '123', role: 'admin', status: 'Aktif' },
    'kasiyer': { password: '123', role: 'kasiyer', status: 'Aktif' },
    'garson': { password: '123', role: 'garson', status: 'Aktif' },
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState(() => {
        // Personel listesini localStorage'dan al, yoksa initialUsers ile başlat
        // Bu, PersonelEkleme sayfasındaki verilerle tutarlılık sağlar.
        const savedPersonnel = localStorage.getItem('personnelData');
        // Bu kısım daha sonra gerçek personel listesiyle entegre edilecek.
        // Şimdilik basit bir birleştirme yapalım.
        return savedPersonnel ? JSON.parse(savedPersonnel) : initialUsers;
    });

    // Gerçekte bu personel listesiyle senkronize olmalı.
    // Şimdilik bu context'in kendi kullanıcı listesi olacak.

    const login = (username, password) => {
        // Bu fonksiyon hem kullanıcı adı hem de e-posta ile çalışabilir.
        let foundUser = null;
        let userRole = null;

        for (const role in users) {
            const userArray = users[role];
            if (Array.isArray(userArray)) {
                const matchedUser = userArray.find(u => (u.ad === username || u.email === username) && u.password === password && u.status === 'Aktif');
                if (matchedUser) {
                    foundUser = matchedUser;
                    userRole = role.toLowerCase();
                    break;
                }
            }
        }

        if (foundUser) {
            setUser({ role: userRole, name: foundUser.ad });
            return userRole;
        }

        // Eski basit kullanıcılar için kontrol
        const legacyUser = initialUsers[username];
        if (legacyUser && legacyUser.password === password) {
            setUser({ role: legacyUser.role, name: username });
            return legacyUser.role;
        }

        return null;
    };

    const logout = () => {
        setUser(null);
    };

    const requestPasswordReset = (email) => {
        // Backend simülasyonu: Kullanıcıyı e-postaya göre bul ve token oluştur.
        console.log(`${email} için şifre sıfırlama isteği alındı.`);
        // Gerçekte burada backend'e istek atılır ve backend mail gönderir.
        const token = Math.random().toString(36).substr(2);
        const resetLink = `${window.location.origin}/reset-password/${token}`;
        console.log(`%cSıfırlama Linki (Simülasyon):`, 'color: green; font-weight: bold;');
        console.log(resetLink);
        // Burada kullanıcıya bir token atanabilir ve state güncellenebilir.
        return true; // Başarılı simülasyonu
    };

    const resetPassword = (token, newPassword) => {
        // Backend simülasyonu: Token'a sahip kullanıcıyı bul ve şifresini güncelle.
        console.log(`Şifre, token '${token}' için güncelleniyor.`);
        // Gerçekte: setUsers state'i güncellenir.
        // Örnek: Kullanıcıyı token ile bul, şifresini değiştir ve durumunu 'Aktif' yap.
        return true; // Başarılı simülasyonu
    };


    return (
        <AuthContext.Provider value={{ user, users, login, logout, requestPasswordReset, resetPassword }}>
            {children}
        </AuthContext.Provider>
    );
};