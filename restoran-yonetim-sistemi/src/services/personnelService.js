// Personnel API Service - Backend communication layer
const API_BASE_URL = 'http://192.168.232.113:8080/api';

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
            
            // Create request data with photo as string
            const requestData = {
                name: personnelData.name.trim(),
                email: personnelData.email.trim(),
                password: personnelData.password,
                phoneNumber: personnelData.phone.trim(),
                photoBase64: personnelData.photo || "string", // Try different field name
                createdAt: new Date().toISOString(),
                roleName: roleName
            };

            console.log('Sending request data:', {
                name: requestData.name,
                email: requestData.email,
                phoneNumber: requestData.phoneNumber,
                roleName: requestData.roleName,
                hasPhoto: !!personnelData.photo
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
                // Expected response format:
                // {
                //   "id": 0,
                //   "name": "string",
                //   "email": "string",
                //   "phoneNumber": "string",
                //   "photoBase64": "string",
                //   "createdAt": "2025-08-11T10:36:56.302Z",
                //   "roles": ["string"]
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
                // Expected response format:
                // [
                //   {
                //     "id": 0,
                //     "name": "string",
                //     "email": "string",
                //     "phoneNumber": "string",
                //     "photoBase64": "string",
                //     "createdAt": "2025-08-11T11:31:16.378Z",
                //     "roles": [0]
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
