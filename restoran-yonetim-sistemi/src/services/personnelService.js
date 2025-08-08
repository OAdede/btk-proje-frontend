// Personnel API Service - Backend communication layer
const API_BASE_URL = 'http://192.168.232.113:8080/api';

export const personnelService = {
    // Register new personnel
    async registerPersonnel(personnelData) {
        try {
            const requestData = {
                name: personnelData.name.trim(),
                email: personnelData.email.trim(),
                password: personnelData.password,
                phoneNumber: personnelData.phone.trim(),
                photoUrl: "https://example.com/default-photo.jpg", // Default URL to avoid base64 length issues
                createdAt: new Date().toISOString()
            };

            console.log('Sending request data:', requestData);

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

                // Try to read the error response as text first
                try {
                    const errorText = await response.text();
                    console.log('Server error response:', errorText);

                    // Parse as JSON if possible
                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage = errorData.message || errorData.error || errorMessage;
                        console.log('Server error details:', errorData);
                    } catch (jsonError) {
                        // If JSON parsing fails, use the text directly
                        errorMessage = errorText || errorMessage;
                    }
                } catch (textError) {
                    console.log('Could not read response as text:', textError);
                }

                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);
                throw new Error(errorMessage);
            }

            // Try to parse successful response as JSON
            try {
                const responseData = await response.json();
                return responseData;
            } catch (jsonError) {
                // Return empty object if response is empty or not JSON
                console.log('Response is not JSON, returning empty object');
                return {};
            }
        } catch (error) {
            throw new Error(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
        }
    },

    // Other methods like getAllPersonnel, updatePersonnelStatus, deletePersonnel, and updatePersonnel are unchanged
};
