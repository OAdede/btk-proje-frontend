import React, { useState, useContext } from 'react';
import { TableContext } from '../../context/TableContext';
import ReservationModal from '../../components/reservations/ReservationModal';
import './Dashboard.css';

const Rezervasyon = () => {
    const { reservations, addReservation } = useContext(TableContext);
    const [filter, setFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);

    const handleAddReservation = () => {
        setShowModal(true);
    };

    const handleSubmitReservation = (formData) => {
        if (selectedTable) {
            addReservation(selectedTable, formData);
        } else {
            // Eğer masa seçilmemişse rastgele bir masa ata
            const randomTable = `1-${Math.floor(Math.random() * 8) + 1}`;
            addReservation(randomTable, formData);
        }
        setShowModal(false);
        setSelectedTable(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedTable(null);
    };

    // TableContext'teki reservations objesini array'e çevir
    const reservationsArray = Object.entries(reservations).map(([tableId, reservation]) => ({
        id: tableId,
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
            </div>

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

            {/* Rezervasyon Modal */}
            <ReservationModal
                visible={showModal}
                masaNo={selectedTable ? selectedTable.split('-')[1] : Math.floor(Math.random() * 8) + 1}
                onClose={handleCloseModal}
                onSubmit={handleSubmitReservation}
            />
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