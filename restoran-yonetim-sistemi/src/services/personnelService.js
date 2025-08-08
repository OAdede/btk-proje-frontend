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
                photoUrl: "https://example.com/default-photo.jpg", // Use default URL to avoid base64 length issues
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

                // Önce response'u text olarak okumaya çalış
                try {
                    const errorText = await response.text();
                    console.log('Server error response:', errorText);

                    // Eğer JSON formatında ise parse etmeye çalış
                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage = errorData.message || errorData.error || errorMessage;
                        console.log('Server error details:', errorData);
                    } catch (jsonError) {
                        // JSON parse edilemezse text'i direkt kullan
                        errorMessage = errorText || errorMessage;
                    }
                } catch (textError) {
                    console.log('Could not read response as text:', textError);
                }

                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);
                throw new Error(errorMessage);
            }

            // Başarılı response için JSON parse etmeye çalış
            try {
                const responseData = await response.json();
                return responseData;
            } catch (jsonError) {
                // Eğer response boş ise veya JSON değilse boş obje döndür
                console.log('Response is not JSON, returning empty object');
                return {};
            }
        } catch (error) {
            throw new Error(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
        }
    },

    // Get all personnel
    async getAllPersonnel() {
        try {
            const response = await fetch(`${API_BASE_URL}/personnel`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Personel listesi alınırken bir hata oluştu');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            throw new Error(error.message || 'Personel listesi alınamadı');
        }
    },

    // Update personnel status
    async updatePersonnelStatus(personnelId, isActive) {
        try {
            const response = await fetch(`${API_BASE_URL}/personnel/${personnelId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ isActive })
            });

            if (!response.ok) {
                throw new Error('Personel durumu güncellenirken bir hata oluştu');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            throw new Error(error.message || 'Personel durumu güncellenemedi');
        }
    },

    // Delete personnel
    async deletePersonnel(personnelId) {
        try {
            const response = await fetch(`${API_BASE_URL}/personnel/${personnelId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Personel silinirken bir hata oluştu');
            }

            return true;
        } catch (error) {
            throw new Error(error.message || 'Personel silinemedi');
        }
    },

    // Update personnel information
    async updatePersonnel(personnelId, personnelData) {
        try {
            const response = await fetch(`${API_BASE_URL}/personnel/${personnelId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(personnelData)
            });

            if (!response.ok) {
                throw new Error('Personel bilgileri güncellenirken bir hata oluştu');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            throw new Error(error.message || 'Personel bilgileri güncellenemedi');
        }
    }
};
