    const addReservation = async (tableId, reservationData) => {
        try {
            const backendReservation = await apiCall('/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...reservationData, tableId })
            });

            const reservationId = backendReservation.id || crypto.randomUUID();
            const newReservation = {
                id: reservationId,
                tableId,
                ...reservationData,
                createdAt: backendReservation.createdAt || new Date().toISOString(),
                backendId: backendReservation.id,
            };

            setReservations(prev => ({
                ...prev,
                [reservationId]: newReservation
            }));
            await updateTableStatus(tableId, "reserved");

            // Sidebar güncelleme için localStorage'a kaydet
            const updatedReservations = {
                ...reservations,
                [reservationId]: newReservation
            };
            saveToLocalStorage("reservations", updatedReservations);
            
            // Başarı mesajı göster
            console.log("Rezervasyon başarıyla eklendi:", newReservation);
            
            return reservationId;
        } catch (error) {
            console.error('Failed to create reservation in backend:', error);
            setError(`Rezervasyon oluşturulurken hata oluştu: ${error.message}`);
        }
    };
