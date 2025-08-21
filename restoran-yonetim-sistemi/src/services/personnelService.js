// Personnel API Service - Backend communication layer
// Prefer environment variable; fallback to Vite dev proxy path
const API_BASE_URL = (import.meta?.env?.VITE_API_BASE_URL) || '/api';

// Role mapping for backend (0=admin, 1=waiter, 2=cashier)
const roleMapping = {
  'garson': 'waiter',
  'kasiyer': 'cashier',
  'müdür': 'manager',
  'waiter': 'waiter',
  'cashier': 'cashier',
  'manager': 'manager',
  'admin': 'admin'
};

export const personnelService = {
    // Register new personnel
    async registerPersonnel(personnelData) {
        try {
            // Map role to backend format
            const roleName = roleMapping[personnelData.role] || 'waiter';
            
            console.log('Role mapping:', {
                originalRole: personnelData.role,
                mappedRole: roleName,
                backendExpected: ['admin', 'waiter', 'cashier', 'manager'],
                fullPersonnelData: personnelData
            });
            
            // Generate a temporary strong password to satisfy backend validation
            const generateTempPassword = () => {
                const lower = 'abcdefghijklmnopqrstuvwxyz';
                const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                const nums = '0123456789';
                const specials = '@$!%*?&';
                const all = lower + upper + nums + specials;
                const pick = (set) => set[Math.floor(Math.random() * set.length)];
                // Ensure complexity: at least one from each
                const chars = [pick(lower), pick(upper), pick(nums), pick(specials)];
                // Fill remaining to length 12
                for (let i = 0; i < 8; i++) chars.push(pick(all));
                // Shuffle
                for (let i = chars.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [chars[i], chars[j]] = [chars[j], chars[i]];
                }
                return chars.join('');
            };
            const tempPassword = generateTempPassword();

            // Create request data with temporary password (user will set their own via email reset)
            const requestData = {
                name: personnelData.name.trim(),
                email: personnelData.email.trim(),
                password: tempPassword,
                phoneNumber: personnelData.phone.trim(),
                photo: null,
                roleName: roleName
            };

            console.log('Sending request data:', {
                name: requestData.name,
                email: requestData.email,
                phoneNumber: requestData.phoneNumber,
                roleName: requestData.roleName,
                originalRole: personnelData.role,
                hasPhoto: false,
                includesPassword: true,
                tempPasswordLength: tempPassword.length
            });

            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                let errorMessage = 'Personel eklenirken bir hata oluştu';

                try {
                    const errorText = await response.text();
                    console.log('Server error response:', errorText);

                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    } catch {
                        errorMessage = errorText || errorMessage;
                    }
                } catch (textError) {
                    console.log('Could not read response as text:', textError);
                }

                throw new Error(errorMessage);
            }

            try {
                const responseData = await response.json();
                console.log('Registration response:', responseData);
                return responseData;
            } catch (jsonError) {
                console.log('Response is not JSON, returning empty object');
                return {};
            }
        } catch (error) {
            throw new Error(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
        }
    },

    // Get all users
    async getAllUsers() {
        try {
            const token = localStorage.getItem('token');

            const headers = {
                'Accept': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                let errorMessage = 'Kullanıcılar yüklenirken bir hata oluştu';

                try {
                    const errorText = await response.text();
                    console.log('Server error response:', errorText);

                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    } catch {
                        errorMessage = errorText || errorMessage;
                    }
                } catch (textError) {
                    console.log('Could not read response as text:', textError);
                }

                throw new Error(errorMessage);
            }

            try {
                const responseData = await response.json();
                console.log('Users loaded successfully:', responseData.length, 'users');

                if (responseData.length > 0) {
                    console.log('Sample user data:', {
                        id: responseData[0].id,
                        name: responseData[0].name,
                        hasPhoto: responseData[0].hasPhoto,
                        photoBase64: responseData[0].photoBase64 ? 'exists' : 'null',
                        isActive: responseData[0].isActive,
                        roles: responseData[0].roles
                    });
                }

                return responseData;
            } catch (jsonError) {
                console.log('Response is not JSON, returning empty array');
                return [];
            }
        } catch (error) {
            throw new Error(error.message || 'Kullanıcılar yüklenirken bir hata oluştu.');
        }
    },

    // Get only active users
    async getActiveUsers() {
        try {
            const token = localStorage.getItem('token');

            const headers = {
                'Accept': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE_URL}/users/active`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                let errorMessage = 'Aktif kullanıcılar yüklenirken bir hata oluştu';
                try {
                    const errorText = await response.text();
                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    } catch {
                        errorMessage = errorText || errorMessage;
                    }
                } catch {}
                throw new Error(errorMessage);
            }

            try {
                const responseData = await response.json();
                return Array.isArray(responseData) ? responseData : [];
            } catch {
                return [];
            }
        } catch (error) {
            throw new Error(error.message || 'Aktif kullanıcılar yüklenirken bir hata oluştu.');
        }
    },

    // Get only inactive users
    async getInactiveUsers() {
        try {
            const token = localStorage.getItem('token');

            const headers = {
                'Accept': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE_URL}/users/inactive`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                let errorMessage = 'Pasif kullanıcılar yüklenirken bir hata oluştu';
                try {
                    const errorText = await response.text();
                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    } catch {
                        errorMessage = errorText || errorMessage;
                    }
                } catch {}
                throw new Error(errorMessage);
            }

            try {
                const responseData = await response.json();
                return Array.isArray(responseData) ? responseData : [];
            } catch {
                return [];
            }
        } catch (error) {
            throw new Error(error.message || 'Pasif kullanıcılar yüklenirken bir hata oluştu.');
        }
    },

    // Toggle user's active status
    async setUserActiveStatus(userId, active) {
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Accept': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(userId)}/active?active=${encodeURIComponent(Boolean(active))}`, {
                method: 'PATCH',
                headers: headers
            });

            if (!response.ok) {
                let errorMessage = 'Kullanıcı durumu güncellenirken bir hata oluştu';
                try {
                    const errorText = await response.text();
                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    } catch {
                        errorMessage = errorText || errorMessage;
                    }
                } catch {}
                throw new Error(errorMessage);
            }

            try {
                const responseData = await response.json();
                return responseData;
            } catch {
                return { id: userId, isActive: Boolean(active) };
            }
        } catch (error) {
            throw new Error(error.message || 'Kullanıcı durumu güncellenirken bir hata oluştu.');
        }
    },
};
