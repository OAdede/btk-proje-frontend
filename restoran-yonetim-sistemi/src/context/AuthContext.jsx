import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();

const roleMapping = {
    0: 'admin',
    1: 'garson',
    2: 'kasiyer'
};

const getRoleFromId = (id) => roleMapping[id];

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Sayfa yüklendiğinde localStorage'dan kullanıcı bilgilerini kontrol et
        const savedUser = authService.getCurrentUser();
        const token = localStorage.getItem('token');

        if (savedUser && token) {
            // Token'ı header'a ekle
            authService.setAuthHeader(token);
            setUser(savedUser);
        }

        setLoading(false);
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const data = await authService.login(email, password);

            if (data.success) {
                const userData = {
                    userId: data.userId,
                    roleId: data.roleId,
                    role: getRoleFromId(data.roleId),
                    email: email,
                    name: data.name || 'Selin',
                    surname: data.surname || 'Garson',
                    profileImage: data.profileImage || localStorage.getItem('profileImage') || null,
                    phone: data.phone || localStorage.getItem('phoneNumber') || '',
                };

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(userData));

                // Set authorization header
                authService.setAuthHeader(data.token);

                setUser(userData);
                setLoading(false);
                return data.roleId;
            } else {
                setLoading(false);
                throw new Error(data.message || 'Geçersiz email veya şifre');
            }
        } catch (error) {
            setLoading(false);
            console.error('Login failed:', error.message);

            // Bağlantı hatası kontrolü
            if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
                throw new Error('Backend sunucusuna bağlanılamıyor. Lütfen sunucunun çalıştığından emin olun.');
            }

            throw new Error(error.message);
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const switchRole = (newRole, navigate) => {
        setUser(currentUser => {
            if (!currentUser) return null;

            const roleIdMap = Object.entries(roleMapping).reduce((acc, [key, value]) => {
                acc[value] = parseInt(key, 10);
                return acc;
            }, {});
            const newRoleId = roleIdMap[newRole];

            if (newRoleId !== undefined) {
                const updatedUser = { ...currentUser, role: newRole, roleId: newRoleId };

                if (import.meta.env.DEV) {
                    // Geliştirme modunda sadece state'i güncelle ve yönlendir
                    if (navigate) {
                        const homePath = newRole === 'admin' ? '/admin/dashboard' : `/${newRole}/home`;
                        navigate(homePath);
                    }
                } else {
                    // Production modunda localStorage'a da yaz
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }

                return updatedUser;
            }

            return currentUser;
        });
    };

    const updateProfileImage = (imageUrl) => {
        setUser(currentUser => {
            if (!currentUser) return null;
            const updatedUser = { ...currentUser, profileImage: imageUrl };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            // Profil fotoğrafını localStorage'a da kaydet
            localStorage.setItem('profileImage', imageUrl);
            return updatedUser;
        });
    };

    const updatePhone = (newPhone) => {
        setUser(currentUser => {
            if (!currentUser) return null;
            const updatedUser = { ...currentUser, phone: newPhone };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        });
    };

    const updateEmail = (newEmail) => {
        setUser(currentUser => {
            if (!currentUser) return null;
            const updatedUser = { ...currentUser, email: newEmail };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        });
    };

    const requestPasswordReset = async (email) => {
        try {
            const data = await authService.requestPasswordReset(email);
            return data.message || 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. E-postanızı kontrol edin.';
        } catch (error) {
            console.error('Password reset request failed:', error.message);
            throw new Error(error.message);
        }
    };

    const resetPassword = async (token, newPassword) => {
        try {
            const data = await authService.resetPassword(token, newPassword);
            return data.message || 'Şifreniz başarıyla güncellendi! Giriş sayfasına yönlendiriliyorsunuz...';
        } catch (error) {
            console.error('Password reset failed:', error.message);
            throw new Error(error.message);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            logout,
            switchRole,
            updateProfileImage,
            updatePhone,
            updateEmail,
            requestPasswordReset,
            resetPassword
        }}>
            {children}
        </AuthContext.Provider>
    );
};
