import React, { useState, useContext } from 'react';
import { TableContext } from '../../context/TableContext';
import './Dashboard.css';

const Rezervasyon = () => {
    const { reservations, removeReservation } = useContext(TableContext);
    const [filter, setFilter] = useState('');

    const handleDeleteReservation = (tableId) => {
        console.log('=== REZERVASYON SİLME DEBUG ===');
        console.log('Silinecek tableId:', tableId);
        console.log('TableId tipi:', typeof tableId);
        console.log('Mevcut rezervasyonlar:', reservations);
        console.log('Rezervasyonlar tipi:', typeof reservations);
        console.log('Rezervasyonlar anahtarları:', Object.keys(reservations));
        
        // TableId'nin mevcut olup olmadığını kontrol et
        if (!reservations[tableId]) {
            console.error('HATA: Bu tableId rezervasyonlarda bulunamadı:', tableId);
            console.log('Mevcut anahtarlar:', Object.keys(reservations));
            console.log('Aranan anahtar:', tableId);
            alert('Rezervasyon bulunamadı!');
            return;
        }
        
        if (window.confirm('Bu rezervasyonu silmek istediğinizden emin misiniz?')) {
            console.log('Onay verildi, rezervasyon siliniyor...');
            try {
                removeReservation(tableId);
                console.log('removeReservation fonksiyonu çağrıldı');
                
                // Silme işleminin başarılı olup olmadığını kontrol et
                setTimeout(() => {
                    console.log('Silme sonrası rezervasyonlar:', reservations);
                    console.log('Silme sonrası anahtarlar:', Object.keys(reservations));
                }, 100);
                
            } catch (error) {
                console.error('Silme işleminde hata:', error);
                alert('Rezervasyon silinirken bir hata oluştu!');
            }
        } else {
            console.log('Silme işlemi iptal edildi');
        }
    };

    // TableContext'teki reservations objesini array'e çevir
    const reservationsArray = Object.entries(reservations).map(([tableId, reservation]) => ({
        id: tableId, // Bu tableId olmalı
        tableId: tableId, // Ek olarak tableId'yi de ekleyelim
        masaNo: tableId.split('-')[1], // "1-5" -> "5"
        ...reservation
    }));

    const filteredReservations = reservationsArray.filter(res =>
        res.adSoyad.toLowerCase().includes(filter.toLowerCase()) ||
        res.telefon.includes(filter)
    );

    return (
        <div className="dashboard-container">
            {/* Debug Bilgisi */}
            <div style={{
                background: 'green',
                color: 'white',
                padding: '10px',
                marginBottom: '20px',
                borderRadius: '5px'
            }}>
                Rezervasyon Sayfası: {reservationsArray.length} rezervasyon bulundu
                <br />
                <small>TableId'ler: {Object.keys(reservations).join(', ')}</small>
            </div>

            <div className="dashboard-header">
                <h1>Rezervasyon Yönetimi</h1>
                <p>Restoran rezervasyonlarını görüntüleyin ve yönetin</p>
            </div>

            <div className="dashboard-content">
                <div style={styles.header}>
                    <h2 style={styles.title}>Rezervasyon Listesi</h2>
                </div>

                <div style={styles.filterContainer}>
                    <input
                        type="text"
                        placeholder="İsim veya telefona göre ara..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={styles.filterInput}
                    />
                </div>

                <div style={styles.listContainer}>
                    {filteredReservations.length > 0 ? (
                        filteredReservations.map(res => (
                            <div key={res.id} style={styles.card}>
                                <div style={styles.cardHeader}>
                                    <div style={styles.cardHeaderLeft}>
                                        <strong>Masa {res.masaNo} - {res.adSoyad}</strong>
                                        <span style={styles.dateTime}>{res.tarih} @ {res.saat}</span>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteReservation(res.tableId)}
                                        style={styles.deleteButton}
                                        title="Rezervasyonu Sil"
                                    >
                                        🗑️
                                    </button>
                                </div>
                                <div style={styles.cardBody}>
                                    <p>📞 {res.telefon}</p>
                                    <p>👥 {res.kisiSayisi} Kişi</p>
                                    {res.not && <p>📝 Not: {res.not}</p>}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>Arama kriterlerine uygun rezervasyon bulunamadı.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// Stiller
const styles = {
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
    },
    title: {
        fontSize: "1.5rem",
        color: "#1e293b",
        fontWeight: 600
    },
    filterContainer: {
        marginBottom: "20px",
    },
    filterInput: {
        width: "100%",
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        fontSize: "1rem"
    },
    listContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "15px"
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: "10px",
        padding: "15px 20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        border: "1px solid #e2e8f0",
        transition: "transform 0.2s ease, box-shadow 0.2s ease"
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "10px",
        paddingBottom: "10px",
        borderBottom: "1px solid #f0f0f0"
    },
    cardHeaderLeft: {
        display: "flex",
        flexDirection: "column",
        gap: "4px"
    },
    dateTime: {
        fontSize: "0.85rem",
        color: "#666",
        fontWeight: "normal"
    },
    deleteButton: {
        background: "none",
        border: "none",
        fontSize: "18px",
        cursor: "pointer",
        padding: "4px",
        borderRadius: "4px",
        transition: "background-color 0.2s ease",
        color: "#dc3545"
    },
    cardBody: {
        fontSize: "0.95rem",
        color: "#334155"
    }
}

export default Rezervasyon; 