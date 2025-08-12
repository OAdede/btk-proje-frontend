import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { getRoleInfoFromToken } from '../utils/jwt';

export const AuthContext = createContext();

const roleMapping = {
    0: 'admin',
    1: 'garson',
    2: 'kasiyer'
};

const getRoleFromId = (id) => roleMapping[id];
const getRoleIdFromName = (name) => {
    if (!name) return undefined;
    const normalized = String(name).toLowerCase();
    if (normalized === 'admin') return 0;
    if (normalized === 'garson') return 1;
    if (normalized === 'kasiyer') return 2;
    return undefined;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Sayfa yüklendiğinde token'dan güvenilir kullanıcı/rol bilgilerini çıkar
        const token = localStorage.getItem('token');
        const savedUser = authService.getCurrentUser();

        if (token) {
            const roleInfo = getRoleInfoFromToken(token);
            // Token'ı header'a ekle
            authService.setAuthHeader(token);

            if (roleInfo.roleId !== undefined || roleInfo.role !== undefined) {
                // savedUser varsa görsel/telefon gibi sadece yardımcı alanları al, rolü token'dan zorla
                const resolvedRoleId = roleInfo.roleId ?? getRoleIdFromName(roleInfo.role);
                const resolvedRole = roleInfo.role ?? getRoleFromId(resolvedRoleId);
                const hydratedUser = {
                    userId: roleInfo.userId ?? savedUser?.userId ?? null,
                    roleId: resolvedRoleId,
                    role: resolvedRole,
                    email: roleInfo.email ?? savedUser?.email ?? '',
                    name: roleInfo.name ?? savedUser?.name ?? '',
                    surname: roleInfo.surname ?? savedUser?.surname ?? '',
                    profileImage: savedUser?.profileImage ?? localStorage.getItem('profileImage') ?? null,
                    phone: savedUser?.phone ?? localStorage.getItem('phoneNumber') ?? '',
                };
                // LocalStorage'daki user manipüle edilmiş olsa bile düzelt
                localStorage.setItem('user', JSON.stringify(hydratedUser));
                setUser(hydratedUser);
                setLoading(false);
                return;
            }

            // Token var ama çözümlenemiyorsa temizle ve login akışına düş
            authService.logout();
            setUser(null);
            setLoading(false);
            return;
        }

        // Token yoksa veya çözümlenemiyorsa kullanıcıyı temizle
        setUser(null);
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const data = await authService.login(email, password);

            if (data.success) {
                // Token'ı kaydet ve rol bilgisini token'dan al
                localStorage.setItem('token', data.token);
                authService.setAuthHeader(data.token);

                const roleInfo = getRoleInfoFromToken(data.token);
                const roleId = roleInfo.roleId ?? data.roleId;
                const userData = {
                    userId: roleInfo.userId ?? data.userId,
                    roleId: roleId,
                    role: roleInfo.role ?? getRoleFromId(roleId),
                    email: roleInfo.email ?? email,
                    name: roleInfo.name ?? (data.name || 'Kullanıcı'),
                    surname: roleInfo.surname ?? (data.surname || ''),
                    profileImage: data.profileImage || localStorage.getItem('profileImage') || null,
                    phone: data.phone || localStorage.getItem('phoneNumber') || '',
                };

                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                setLoading(false);
                return roleId;
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
