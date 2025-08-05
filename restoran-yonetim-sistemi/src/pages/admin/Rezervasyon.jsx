import React, { useState, useContext } from 'react';
import { TableContext } from '../../context/TableContext';
import './Dashboard.css';

const Rezervasyon = () => {
    const { reservations, removeReservation } = useContext(TableContext);
    const [filter, setFilter] = useState('');

    const handleDeleteReservation = (tableId) => {
        if (!reservations[tableId]) {
            alert('Rezervasyon bulunamadı!');
            return;
        }
        
        if (window.confirm('Bu rezervasyonu silmek istediğinizden emin misiniz?')) {
            try {
                removeReservation(tableId);
            } catch (error) {
                alert('Rezervasyon silinirken bir hata oluştu!');
            }
        }
    };

    // TableContext'teki reservations objesini array'e çevir
    const reservationsArray = Object.entries(reservations).map(([tableId, reservation]) => ({
        id: tableId,
        tableId: tableId,
        masaNo: tableId.split('-')[1], // "1-5" -> "5"
        ...reservation
    }));

    const filteredReservations = reservationsArray.filter(res =>
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
                        <p style={styles.noResults}>Arama kriterlerine uygun rezervasyon bulunamadı.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// Stiller - CSS değişkenleri kullanarak tema desteği
const styles = {
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
    },
    title: {
        fontSize: "1.5rem",
        color: "var(--text)",
        fontWeight: 600
    },
    filterContainer: {
        marginBottom: "20px",
    },
    filterInput: {
        width: "100%",
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid var(--border)",
        fontSize: "1rem",
        backgroundColor: "var(--card)",
        color: "var(--text)",
        outline: "none",
        transition: "border-color 0.2s ease"
    },
    listContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "15px"
    },
    card: {
        backgroundColor: "var(--card)",
        borderRadius: "10px",
        padding: "15px 20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        border: "1px solid var(--border)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        color: "var(--text)"
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "10px",
        paddingBottom: "10px",
        borderBottom: "1px solid var(--border)"
    },
    cardHeaderLeft: {
        display: "flex",
        flexDirection: "column",
        gap: "4px"
    },
    dateTime: {
        fontSize: "0.85rem",
        color: "var(--text-secondary)",
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
        color: "var(--text)"
    },
    noResults: {
        color: "var(--text-secondary)",
        textAlign: "center",
        padding: "20px"
    }
}

export default Rezervasyon; 