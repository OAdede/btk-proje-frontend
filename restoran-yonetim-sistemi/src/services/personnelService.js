// Personnel API Service - Backend communication layer
// Prefer environment variable; fallback to Vite dev proxy path
const API_BASE_URL = (import.meta?.env?.VITE_API_BASE_URL) || '/api';

// Role mapping from Turkish to English
const roleMapping = {
  'garson': 'waiter',
  'kasiyer': 'cashier',
  'müdür': 'manager',
  'admin': 'admin'
};

export const personnelService = {
    // Register new personnel
    async registerPersonnel(personnelData) {
        try {
            // Map Turkish role to English roleName
            const roleName = roleMapping[personnelData.role] || 'waiter';
            
            // Create request data without photo (photo functionality removed)
            const requestData = {
                name: personnelData.name.trim(),
                email: personnelData.email.trim(),
                password: personnelData.password,
                phoneNumber: personnelData.phone.trim(),
                photo: null, // No photo sent
                createdAt: new Date().toISOString(),
                roleName: roleName
            };

            console.log('Sending request data:', {
                name: requestData.name,
                email: requestData.email,
                phoneNumber: requestData.phoneNumber,
                roleName: requestData.roleName,
                hasPhoto: false
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
                // Expected response format:
                // {
                //   "id": 0,
                //   "name": "string",
                //   "email": "string",
                //   "phoneNumber": "string",
                //   "hasPhoto": true,
                //   "createdAt": "2025-08-11T10:36:56.302Z",
                //   "roles": [0],
                //   "isActive": true
                // }
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
            // Get token from localStorage
            const token = localStorage.getItem('token');
            
            const headers = {
                'Accept': 'application/json',
            };

            // Add authorization header if token exists
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
                
                // Log sample user data for debugging
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
                
                // Expected response format:
                // [
                //   {
                //     "id": 0,
                //     "name": "string",
                //     "email": "string",
                //     "phoneNumber": "string",
                //     "hasPhoto": true,
                //     "createdAt": "2025-08-11T11:31:16.378Z",
                //     "roles": [0],
                //     "isActive": true
                //   }
                // ]
                return responseData;
            } catch (jsonError) {
                console.log('Response is not JSON, returning empty array');
                return [];
            }
        } catch (error) {
            throw new Error(error.message || 'Kullanıcılar yüklenirken bir hata oluştu.');
        }
    },
};
