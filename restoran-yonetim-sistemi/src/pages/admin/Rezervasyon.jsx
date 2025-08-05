import React, { useState } from 'react';
import './Dashboard.css';

// Örnek veri, normalde API'den veya context'ten gelir
const sampleReservations = [
    { id: 1, masaNo: 5, adSoyad: 'Ali Veli', telefon: '555 123 4567', tarih: '2024-08-15', saat: '19:30', kisiSayisi: 4, not: 'Pencere kenarı isteniyor.' },
    { id: 2, masaNo: 2, adSoyad: 'Ayşe Yılmaz', telefon: '555 987 6543', tarih: '2024-08-15', saat: '20:00', kisiSayisi: 2, not: 'Doğum günü kutlaması.' },
    { id: 3, masaNo: 8, adSoyad: 'Fatma Kaya', telefon: '555 111 2233', tarih: '2024-08-16', saat: '18:45', kisiSayisi: 5, not: '' },
];

const Rezervasyon = () => {
    const [reservations, setReservations] = useState(sampleReservations);
    const [filter, setFilter] = useState('');

    const handleAddReservation = () => {
        console.log("Yeni rezervasyon ekleme modalı açılacak...");
        // Burada ReservationModal açılabilir.
    };

    const filteredReservations = reservations.filter(res =>
        res.adSoyad.toLowerCase().includes(filter.toLowerCase()) ||
        res.telefon.includes(filter)
    );

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Rezervasyon Yönetimi</h1>
                <p>Restoran rezervasyonlarını görüntüleyin ve yönetin</p>
            </div>

            <div className="dashboard-content">
                <div style={styles.header}>
                    <h2 style={styles.title}>Rezervasyon Listesi</h2>
                    <button onClick={handleAddReservation} style={styles.addButton}>
                        + Yeni Rezervasyon Ekle
                    </button>
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
                                    <strong>Masa {res.masaNo} - {res.adSoyad}</strong>
                                    <span>{res.tarih} @ {res.saat}</span>
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
    addButton: {
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        padding: "10px 20px",
        borderRadius: "8px",
        fontWeight: 500,
        cursor: "pointer"
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
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10px",
        paddingBottom: "10px",
        borderBottom: "1px solid #f0f0f0"
    },
    cardBody: {
        fontSize: "0.95rem",
        color: "#334155"
    }
}

export default Rezervasyon; 