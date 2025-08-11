// Personnel API Service - Backend communication layer
const API_BASE_URL = 'http://192.168.232.113:8080/api';

// Role mapping from Turkish to English
const roleMapping = {
  'garson': 'waiter',
  'kasiyer': 'cashier',
  'mutfak': 'kitchen',
  'müdür': 'manager',
  'admin': 'admin'
};

export const personnelService = {
    // Register new personnel
    async registerPersonnel(personnelData) {
        try {
            // Map Turkish role to English roleName
            const roleName = roleMapping[personnelData.role] || 'waiter';
            
            // Create request data without photo for now
            const requestData = {
                name: personnelData.name.trim(),
                email: personnelData.email.trim(),
                password: personnelData.password,
                phoneNumber: personnelData.phone.trim(),
                createdAt: new Date().toISOString(),
                roleName: roleName
            };

            console.log('Sending request data:', {
                name: requestData.name,
                email: requestData.email,
                phoneNumber: requestData.phoneNumber,
                roleName: requestData.roleName
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
                //   "photoUrl": "string",
                //   "createdAt": "2025-08-11T07:35:28.967Z",
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
};
