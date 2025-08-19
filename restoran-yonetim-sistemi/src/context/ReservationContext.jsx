import React, { createContext, useContext, useState, useEffect } from 'react';
import { reservationService } from '../services/reservationService';

const ReservationContext = createContext();

export const useReservations = () => {
    const context = useContext(ReservationContext);
    if (!context) {
        throw new Error('useReservations must be used within a ReservationProvider');
    }
    return context;
};

export const ReservationProvider = ({ children }) => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Component mount olduğunda rezervasyonları yükle
    useEffect(() => {
        loadReservations();
    }, []);

    // Backend'den rezervasyonları yükle
    const loadReservations = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await reservationService.getAllReservations();
            setReservations(data);
        } catch (error) {
            console.error('Rezervasyonlar yüklenirken hata:', error);
            setError(error.message);
            // Hata durumunda boş array kullan
            setReservations([]);
        } finally {
            setLoading(false);
        }
    };

    // Yeni rezervasyon ekle
    const addReservation = async (tableId, formData) => {
        try {
            setLoading(true);
            setError(null);
            
            // userId'yi localStorage'dan al
            const userId = parseInt(localStorage.getItem('userId')) || 1;
            
            console.log('addReservation çağrıldı:', { tableId, formData, userId });
            
            
            // Backend'e gönderilecek veriyi hazırla
            const reservationData = {
                tableId: numericTableId, // Backend'de masa numarası olarak gönder, masa ID'sine çevrilecek
                customerName: `${formData.ad} ${formData.soyad}`.trim(), // character varying
                email: formData.email || '', // character varying (email alanı)
                customerPhone: formData.telefon, // character varying
                personCount: parseInt(formData.personCount) || 1, // integer (person_count alanı)
                reservationDate: formData.tarih, // Tarih - backend'de LocalDate olarak işlenecek
                reservationTime: formData.saat, // Saat - backend'de LocalTime olarak işlenecek
                specialRequests: formData.not || '', // special_requests - character varying
                statusId: 1, // integer - backend'de 1L olarak işlenecek
                createdBy: userId // integer
            };

            console.log('Backend\'e gönderilecek veri:', reservationData);

            const newReservation = await reservationService.createReservation(reservationData);
            
            // State'i güncelle
            setReservations(prev => [newReservation, ...prev]);
            
            return newReservation;
        } catch (error) {
            console.error('Rezervasyon ekleme hatası:', error);
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Rezervasyon güncelle
    const updateReservation = async (reservationId, formData) => {
        try {
            setLoading(true);
            setError(null);
            
            const updatedReservation = await reservationService.updateReservation(reservationId, formData);
            
            // State'i güncelle
            setReservations(prev => 
                prev.map(res => 
                    res.id === reservationId ? updatedReservation : res
                )
            );
            
            return updatedReservation;
        } catch (error) {
            console.error('Rezervasyon güncelleme hatası:', error);
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Rezervasyon sil
    const removeReservation = async (reservationId) => {
        try {
            setLoading(true);
            setError(null);
            
            await reservationService.deleteReservation(reservationId);
            
            // State'i güncelle
            setReservations(prev => prev.filter(res => res.id !== reservationId));

            // Backend'den masaları tazele (UI rengini anında güncellemek için)
            try {
                if (typeof window !== 'undefined') {
                    // TableContext içindeki fetchData tetiklemesi yoksa, rezervasyon sağlayıcısında doğrudan masaları yükleme olmayabilir
                    const event = new CustomEvent('refresh-tables');
                    window.dispatchEvent(event);
                }
            } catch (e) {
                console.warn('refresh-tables event dispatch failed (ignored):', e);
            }
        } catch (error) {
            console.error('Rezervasyon silme hatası:', error);
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Rezervasyon iptal et
    const cancelReservation = async (reservationId) => {
        try {
            setLoading(true);
            setError(null);
            
            const cancelledReservation = await reservationService.cancelReservation(reservationId);
            
            // State'i güncelle
            setReservations(prev => 
                prev.map(res => 
                    res.id === reservationId ? cancelledReservation : res
                )
            );
            
            return cancelledReservation;
        } catch (error) {
            console.error('Rezervasyon iptal hatası:', error);
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Rezervasyonu tamamla
    const completeReservation = async (reservationId) => {
        try {
            setLoading(true);
            setError(null);
            
            const completedReservation = await reservationService.completeReservation(reservationId);
            
            // State'i güncelle
            setReservations(prev => 
                prev.map(res => 
                    res.id === reservationId ? completedReservation : res
                )
            );
            
            return completedReservation;
        } catch (error) {
            console.error('Rezervasyon tamamlama hatası:', error);
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Rezervasyonu no-show olarak işaretle
    const markAsNoShow = async (reservationId) => {
        try {
            setLoading(true);
            setError(null);
            
            const noShowReservation = await reservationService.markAsNoShow(reservationId);
            
            // State'i güncelle
            setReservations(prev => 
                prev.map(res => 
                    res.id === reservationId ? noShowReservation : res
                )
            );
            
            return noShowReservation;
        } catch (error) {
            console.error('No-show işaretleme hatası:', error);
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Son rezervasyonları getir
    const getRecentReservations = (limit = 5) => {
        return reservations.slice(0, limit);
    };

    // Bugünkü rezervasyonları getir
    const getTodayReservations = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const todayReservations = await reservationService.getTodayReservations();
            return todayReservations;
        } catch (error) {
            console.error('Bugünkü rezervasyon getirme hatası:', error);
            setError(error.message);
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Tarih aralığında rezervasyonları getir
    const getReservationsByDateRange = async (startDate, endDate) => {
        try {
            setLoading(true);
            setError(null);
            
            const rangeReservations = await reservationService.getReservationsByDateRange(startDate, endDate);
            return rangeReservations;
        } catch (error) {
            console.error('Tarih aralığı rezervasyon getirme hatası:', error);
            setError(error.message);
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Salon bazında rezervasyonları getir
    const getReservationsBySalon = async (salonId) => {
        try {
            setLoading(true);
            setError(null);
            
            const salonReservations = await reservationService.getReservationsBySalon(salonId);
            return salonReservations;
        } catch (error) {
            console.error('Salon rezervasyon getirme hatası:', error);
            setError(error.message);
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Rezervasyonları yenile
    const refreshReservations = () => {
        loadReservations();
    };

    // Hata mesajını temizle
    const clearError = () => {
        setError(null);
    };

    // ==================== HELPER METHODS ====================

    // Table ID'den kat numarasını al
    const getFloorFromTableId = (tableId) => {
        if (!tableId) return 0;
        
        const id = parseInt(tableId);
        if (id <= 8) {
            return 0; // Zemin kat
        } else if (id <= 16) {
            return 1; // 1. kat
        } else if (id <= 24) {
            return 2; // 2. kat
        }
        return 0;
    };

    const value = {
        // State
        reservations,
        loading,
        error,
        
        // Actions
        addReservation,
        updateReservation,
        removeReservation,
        cancelReservation,
        completeReservation,
        markAsNoShow,
        
        // Queries
        getRecentReservations,
        getTodayReservations,
        getReservationsByDateRange,
        getReservationsBySalon,
        
        // Utilities
        refreshReservations,
        clearError
    };

    return (
        <ReservationContext.Provider value={value}>
            {children}
        </ReservationContext.Provider>
    );
};
