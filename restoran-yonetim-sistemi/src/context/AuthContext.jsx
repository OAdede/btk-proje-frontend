import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { getRoleInfoFromToken } from '../utils/jwt';
import tokenManager from '../utils/tokenManager';
import secureStorage from '../utils/secureStorage';

export const AuthContext = createContext();

const DEBUG_AUTH = import.meta?.env?.VITE_DEBUG_AUTH === 'true';

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

// Helper functions for secure user data storage
const setUserData = (userData) => {
    // SECURITY: Store user data with encryption for PII
    secureStorage.setItem('user', userData);
    if (DEBUG_AUTH) console.log('[AuthContext] User data stored securely');
};

const getUserData = () => {
    // SECURITY: Retrieve user data from secure storage with fallback
    let userData = secureStorage.getItem('user');
    
    // Migration: Check legacy localStorage
    if (!userData) {
        const legacyUserStr = localStorage.getItem('user');
        if (legacyUserStr) {
            try {
                userData = JSON.parse(legacyUserStr);
                // Migrate to secure storage
                setUserData(userData);
                localStorage.removeItem('user');
                if (DEBUG_AUTH) console.log('[AuthContext] Migrated user data to secure storage');
            } catch (error) {
                console.error('[AuthContext] Error parsing legacy user data:', error);
            }
        }
    }
    
    return userData;
};

const clearUserData = () => {
    // SECURITY: Clear user data from all storage locations
    secureStorage.removeItem('user');
    secureStorage.removeItem('profileImage');
    secureStorage.removeItem('phone');
    secureStorage.removeItem('phoneNumber');
    localStorage.removeItem('user'); // Legacy cleanup
    localStorage.removeItem('profileImage');
    localStorage.removeItem('phoneNumber');
    if (DEBUG_AUTH) console.log('[AuthContext] All user data cleared securely');
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Set up token expiration callback
        tokenManager.onTokenExpiredCallback(() => {
            if (DEBUG_AUTH) console.warn('[AuthContext] Token expired, logging out user');
            setUser(null);
        });

        // Sayfa yüklendiğinde token'dan güvenilir kullanıcı/rol bilgilerini çıkar
        const token = tokenManager.getToken(); // This now validates expiration automatically
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
                    profileImage: savedUser?.profileImage ?? secureStorage.getItem('profileImage') ?? null,
                    phone: savedUser?.phone ?? secureStorage.getItem('phoneNumber') ?? '',
                };
                // SECURITY: Store user data securely with encryption
                setUserData(hydratedUser);
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
    }, []); // Remove user dependency to prevent infinite loop

    // Separate useEffect for auto-refresh that only runs when component mounts
    useEffect(() => {
        // Set up automatic token refresh checking (every 5 minutes)
        const refreshInterval = setInterval(async () => {
            const currentToken = tokenManager.getToken();
            if (currentToken) { // Only check if there's a token
                const isValid = await tokenManager.checkAndRefreshToken(5); // Refresh if expires within 5 minutes
                if (!isValid) {
                    console.warn('[AuthContext] Token refresh failed, logging out user');
                    setUser(null);
                }
            }
        }, 5 * 60 * 1000); // Check every 5 minutes

        // Cleanup function to clear interval
        return () => {
            clearInterval(refreshInterval);
        };
    }, []); // Only run once on mount

    const login = async (email, password) => {
        setLoading(true);
        try {
            if (DEBUG_AUTH) console.log('[AuthContext] Starting login process');
            const data = await authService.login(email, password);
            if (DEBUG_AUTH) console.log('[AuthContext] Backend response received:', { success: data.success, hasToken: !!data.token });

            if (data.success) {
                // Use tokenManager to store token securely
                if (DEBUG_AUTH) console.log('[AuthContext] Storing token securely...');
                const tokenStored = tokenManager.setToken(data.token);
                if (!tokenStored) {
                    throw new Error('Token geçersiz veya süresi dolmuş');
                }
                if (DEBUG_AUTH) console.log('[AuthContext] Token stored successfully');
                
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
                    profileImage: data.profileImage || secureStorage.getItem('profileImage') || null,
                    phone: data.phone || secureStorage.getItem('phoneNumber') || '',
                };

                // SECURITY: Store user data securely
                if (DEBUG_AUTH) console.log('[AuthContext] Setting user data...');
                setUserData(userData);
                setUser(userData);
                setLoading(false);
                if (DEBUG_AUTH) console.log('[AuthContext] Login completed successfully');
                
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
                    // Production modunda secure storage'a da yaz
                    setUserData(updatedUser);
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
            // SECURITY: Store user data and profile image securely
            setUserData(updatedUser);
            secureStorage.setItem('profileImage', imageUrl);
            return updatedUser;
        });
    };

    const updatePhone = (newPhone) => {
        setUser(currentUser => {
            if (!currentUser) return null;
            const updatedUser = { ...currentUser, phone: newPhone };
            // SECURITY: Store user data securely
            setUserData(updatedUser);
            return updatedUser;
        });
    };

    const updateEmail = (newEmail) => {
        setUser(currentUser => {
            if (!currentUser) return null;
            const updatedUser = { ...currentUser, email: newEmail };
            // SECURITY: Store user data securely
            setUserData(updatedUser);
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
