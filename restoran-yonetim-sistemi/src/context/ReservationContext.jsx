import React, { createContext, useContext, useState } from 'react';

const ReservationContext = createContext();

export const useReservations = () => {
    const context = useContext(ReservationContext);
    if (!context) {
        throw new Error('useReservations must be used within a ReservationProvider');
    }
    return context;
};

export const ReservationProvider = ({ children }) => {
    const [reservations, setReservations] = useState([
        { id: 1, masaNo: 5, adSoyad: 'Ali Veli', telefon: '555 123 4567', tarih: '2024-08-15', saat: '19:30', kisiSayisi: 4, not: 'Pencere kenarı isteniyor.' },
        { id: 2, masaNo: 2, adSoyad: 'Ayşe Yılmaz', telefon: '555 987 6543', tarih: '2024-08-15', saat: '20:00', kisiSayisi: 2, not: 'Doğum günü kutlaması.' },
        { id: 3, masaNo: 8, adSoyad: 'Fatma Kaya', telefon: '555 111 2233', tarih: '2024-08-16', saat: '18:45', kisiSayisi: 5, not: '' },
    ]);

    const addReservation = (formData) => {
        const newReservation = {
            id: Date.now(),
            masaNo: Math.floor(Math.random() * 10) + 1,
            ...formData
        };
        setReservations(prev => [newReservation, ...prev]);
    };

    const deleteReservation = (id) => {
        setReservations(prev => prev.filter(res => res.id !== id));
    };

    const getRecentReservations = (limit = 5) => {
        return reservations.slice(0, limit);
    };

    const value = {
        reservations,
        addReservation,
        deleteReservation,
        getRecentReservations
    };

    return (
        <ReservationContext.Provider value={value}>
            {children}
        </ReservationContext.Provider>
    );
}; 