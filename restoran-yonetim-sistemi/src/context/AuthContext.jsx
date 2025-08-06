import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const roleMapping = {
    0: 'admin',
    1: 'garson',
    2: 'kasiyer'
};

const getRoleFromId = (id) => roleMapping[id];

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            } catch (error) {
                console.error("Failed to parse user data from local storage:", error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
            }
        }
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post('/api/auth/login', { email, password });
            const data = response.data;

            if (data.success) {
                const userData = {
                    userId: data.userId,
                    roleId: data.roleId,
                    role: getRoleFromId(data.roleId),
                    email: email,
                };

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(userData));

                axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

                setUser(userData);
                return data.roleId;
            } else {
                throw new Error(data.message || 'Geçersiz email veya şifre');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Bir hata oluştu.';
            console.error('Login failed:', errorMessage);
            throw new Error(errorMessage);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const switchRole = (newRole) => {
        setUser(currentUser => {
            if (currentUser && currentUser.roleId === 0) {
                const roleIdMap = Object.entries(roleMapping).reduce((acc, [key, value]) => {
                    acc[value] = parseInt(key, 10);
                    return acc;
                }, {});
                const newRoleId = roleIdMap[newRole];

                if (newRoleId !== undefined) {
                    const updatedUser = { ...currentUser, role: newRole, roleId: newRoleId };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    return updatedUser;
                }
            }
            return currentUser;
        });
    };

    const updateProfileImage = (imageUrl) => {
        setUser(currentUser => {
            if (!currentUser) return null;
            const updatedUser = { ...currentUser, profileImage: imageUrl };
            localStorage.setItem('user', JSON.stringify(updatedUser));
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
            // Geliştirme aşamasında demo veriler - production'da gerçek API çağrısı yapılacak
            console.log('Password reset requested for:', email);
            
            // Simüle edilmiş gecikme
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Demo email kontrolü
            const validEmails = ['admin@example.com', 'user@example.com', 'test@example.com'];
            
            if (!validEmails.includes(email)) {
                throw new Error('Bu e-posta adresi sistemde bulunamadı.');
            }
            
            return 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. E-postanızı kontrol edin.';
            
            /* Production için API çağrısı:
            const response = await axios.post('/api/auth/forgot-password', { email });
            const data = response.data;

            if (data.success) {
                return data.message || 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.';
            } else {
                throw new Error(data.message || 'Şifre sıfırlama isteği başarısız oldu.');
            }
            */
        } catch (error) {
            const errorMessage = error.message || 'Bir hata oluştu.';
            console.error('Password reset request failed:', errorMessage);
            throw new Error(errorMessage);
        }
    };

    const resetPassword = async (token, newPassword) => {
        try {
            // Geliştirme aşamasında demo veriler - production'da gerçek API çağrısı yapılacak
            console.log('Password reset attempted with token:', token);
            
            // Simüle edilmiş gecikme
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Demo token kontrolü
            const validTokens = ['demo-token-123', 'test-token-456'];
            
            if (!validTokens.includes(token)) {
                throw new Error('Geçersiz veya süresi dolmuş token. Lütfen yeni bir şifre sıfırlama isteği gönderin.');
            }
            
            if (newPassword.length < 6) {
                throw new Error('Şifre en az 6 karakter olmalıdır.');
            }
            
            return 'Şifreniz başarıyla güncellendi! Giriş sayfasına yönlendiriliyorsunuz...';
            
            /* Production için API çağrısı:
            const response = await axios.post('/api/auth/reset-password', { 
                token, 
                password: newPassword 
            });
            const data = response.data;

            if (data.success) {
                return data.message || 'Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...';
            } else {
                throw new Error(data.message || 'Şifre sıfırlama başarısız oldu.');
            }
            */
        } catch (error) {
            const errorMessage = error.message || 'Bir hata oluştu.';
            console.error('Password reset failed:', errorMessage);
            throw new Error(errorMessage);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
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
