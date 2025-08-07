import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableContext } from '../../context/TableContext';
import { useTheme } from '../../context/ThemeContext';
import ReservationModal from '../../components/reservations/ReservationModal';

const ReservationsPage = () => {
    const navigate = useNavigate();
    const { reservations, addReservation, removeReservation } = useContext(TableContext);
    const { isDarkMode, colors } = useTheme();
    const [filter, setFilter] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [reservationToDelete, setReservationToDelete] = useState(null);
    const [showReservationModal, setShowReservationModal] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);
    const [showTableSelectionModal, setShowTableSelectionModal] = useState(false);
    const [selectedFloor, setSelectedFloor] = useState(0);

    // Gerçek rezervasyon verilerini kullan
    const actualReservations = reservations;

    // Bugünün tarihini al
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    // Kat adını al
    const getFloorName = (floorNumber) => {
        return floorNumber === 0 ? "Zemin" : `Kat ${floorNumber}`;
    };

    // Masa numarasını al
    const getTableNumber = (floorNumber, tableIndex) => {
        const floorPrefix = floorNumber === 0 ? "Z" : String.fromCharCode(65 + floorNumber - 1);
        return `${floorPrefix}${tableIndex + 1}`;
    };

    const handleAddReservation = () => {
        setShowTableSelectionModal(true);
    };

    const handleTableSelection = (floorNumber, tableIndex) => {
        const tableNumber = getTableNumber(floorNumber, tableIndex);
        setSelectedTable(tableNumber);
        setShowTableSelectionModal(false);
        setShowReservationModal(true);
    };

    const handleReservationClose = () => {
        setShowReservationModal(false);
        setSelectedTable(null);
    };

    const handleReservationSubmit = (formData) => {
        addReservation(selectedTable, formData);
        setShowReservationModal(false);
        setSelectedTable(null);
    };



    const handleEditReservation = (reservation) => {
        navigate(`/admin/reservations/edit/${reservation.id}`);
    };

    const handleDeleteReservation = (reservation) => {
        setReservationToDelete(reservation);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (reservationToDelete) {
            removeReservation(reservationToDelete.id);
            setShowDeleteModal(false);
            setReservationToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setReservationToDelete(null);
    };

    // Rezervasyonları masa numarası ve rezervasyon verileriyle birlikte düzenle
    const reservationsList = Object.entries(actualReservations).map(([reservationId, reservation]) => ({
        id: reservationId,
        masaNo: reservation.tableId,
        ...reservation
    }));

    // Debug için rezervasyon verilerini konsola yazdır
    console.log('Reservations count:', Object.keys(reservations).length);
    console.log('ReservationsList count:', reservationsList.length);
    console.log('Raw reservations data:', reservations);
    console.log('ReservationsList data:', reservationsList);

    const filteredReservations = reservationsList.filter(res => {
        // Eski rezervasyonlarda 'soy' alanı kullanılmış, yeni rezervasyonlarda 'soyad'
        const lastName = res.soyad || res.soy || '';
        const fullName = `${res.ad || ''} ${lastName}`.trim();
        return fullName.toLowerCase().includes(filter.toLowerCase()) ||
               (res.telefon && res.telefon.includes(filter));
    });

    // Stiller fonksiyonu - dinamik renkler için
    const getStyles = () => ({
        page: {
            padding: "20px",
            minHeight: "100vh",
            backgroundColor: isDarkMode ? colors.background : "#f5f5f5"
        },
        header: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            backgroundColor: colors.card,
            padding: "20px",
            borderRadius: "10px",
            boxShadow: isDarkMode ? "0 2px 4px rgba(0,0,0,0.3)" : "0 2px 4px rgba(0,0,0,0.1)",
            border: `1px solid ${colors.border}`
        },
        title: {
            fontSize: "1.8rem",
            color: colors.text,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            margin: 0
        },
        badge: {
            backgroundColor: colors.success,
            color: "white",
            borderRadius: "50%",
            width: "30px",
            height: "30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.9rem",
            fontWeight: "bold"
        },
        addButton: {
            backgroundColor: isDarkMode ? "#4a4a4a" : colors.button,
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            fontWeight: 500,
            cursor: "pointer",
            fontSize: "1rem",
            transition: "all 0.3s ease"
        },
        filterContainer: {
            marginBottom: "20px",
            backgroundColor: colors.card,
            padding: "20px",
            borderRadius: "10px",
            boxShadow: isDarkMode ? "0 2px 4px rgba(0,0,0,0.3)" : "0 2px 4px rgba(0,0,0,0.1)",
            border: `1px solid ${colors.border}`
        },
        filterInput: {
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: `1px solid ${colors.border}`,
            fontSize: "1rem",
            outline: "none",
            backgroundColor: colors.background,
            color: colors.text
        },
        listContainer: {
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            backgroundColor: colors.card,
            padding: "20px",
            borderRadius: "10px",
            boxShadow: isDarkMode ? "0 2px 4px rgba(0,0,0,0.3)" : "0 2px 4px rgba(0,0,0,0.1)",
            minHeight: "200px",
            border: `1px solid ${colors.border}`
        },
        card: {
            backgroundColor: isDarkMode ? colors.background : "#f8f9fa",
            borderRadius: "10px",
            padding: "20px",
            boxShadow: isDarkMode ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.1)",
            border: `1px solid ${colors.border}`,
            marginBottom: "10px"
        },
        cardHeader: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
            paddingBottom: "10px",
            borderBottom: `2px solid ${colors.border}`
        },
        cardBody: {
            fontSize: "1rem",
            color: colors.text,
            lineHeight: "1.6"
        }
    });

    const styles = getStyles();

    return (
        <div style={styles.page}>
                         <div style={styles.header}>
                 <h1 style={styles.title}>
                     📅 Rezervasyonlar
                     <span style={styles.badge}>{reservationsList.length}</span>
                 </h1>
                                 <div style={{ display: 'flex', gap: '10px' }}>
                     <button 
                         onClick={handleAddReservation} 
                         style={styles.addButton}
                         onMouseEnter={(e) => {
                             e.target.style.transform = 'translateY(-2px)';
                             e.target.style.boxShadow = isDarkMode ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 4px 12px rgba(0, 0, 0, 0.2)';
                         }}
                         onMouseLeave={(e) => {
                             e.target.style.transform = 'translateY(0)';
                             e.target.style.boxShadow = 'none';
                         }}
                     >
                         + Yeni Rezervasyon Ekle
                     </button>
                 </div>
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
                {reservationsList.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px", color: colors.textSecondary }}>
                        <h3>📅 Henüz rezervasyon bulunmuyor</h3>
                        <p>Yeni rezervasyon eklemek için yukarıdaki butonu kullanabilirsiniz.</p>
                    </div>
                ) : filteredReservations.length > 0 ? (
                    filteredReservations.map(res => (
                        <div key={res.id} style={styles.card}>
                            <div style={styles.cardHeader}>
                                                                 <strong style={{ color: colors.text }}>Masa {res.masaNo} - {res.ad || ''} {res.soyad || res.soy || ''}</strong>
                                                                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                     <span style={{ color: colors.textSecondary }}>{res.tarih} • {res.saat}</span>
                                     <button
                                         onClick={() => handleEditReservation(res)}
                                         style={{
                                             background: isDarkMode ? '#4a90e2' : colors.button,
                                             color: 'white',
                                             border: 'none',
                                             padding: '6px 12px',
                                             borderRadius: '6px',
                                             fontSize: '0.8rem',
                                             cursor: 'pointer',
                                             transition: 'all 0.3s ease'
                                         }}
                                         onMouseEnter={(e) => {
                                             e.target.style.transform = 'translateY(-1px)';
                                             e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
                                         }}
                                         onMouseLeave={(e) => {
                                             e.target.style.transform = 'translateY(0)';
                                             e.target.style.boxShadow = 'none';
                                         }}
                                     >
                                         ✏️ Düzenle
                                     </button>
                                     <button
                                         onClick={() => handleDeleteReservation(res)}
                                         style={{
                                             background: colors.error || '#dc3545',
                                             color: 'white',
                                             border: 'none',
                                             padding: '6px 12px',
                                             borderRadius: '6px',
                                             fontSize: '0.8rem',
                                             cursor: 'pointer',
                                             transition: 'all 0.3s ease'
                                         }}
                                         onMouseEnter={(e) => {
                                             e.target.style.transform = 'translateY(-1px)';
                                             e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
                                         }}
                                         onMouseLeave={(e) => {
                                             e.target.style.transform = 'translateY(0)';
                                             e.target.style.boxShadow = 'none';
                                         }}
                                     >
                                         🗑️ Sil
                                     </button>
                                 </div>
                            </div>
                            <div style={styles.cardBody}>
                                <p>📞 {res.telefon || 'Telefon yok'}</p>
                                <p>👥 {res.kisiSayisi || '0'} Kişi</p>
                                {res.not && <p>📝 Not: {res.not}</p>}
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: "center", padding: "40px", color: colors.textSecondary }}>
                        <h3>🔍 Arama sonucu bulunamadı</h3>
                        <p>Arama kriterlerine uygun rezervasyon bulunamadı.</p>
                    </div>
                                 )}
             </div>

             {/* Silme Onay Modalı */}
             {showDeleteModal && (
                 <div style={{
                     position: 'fixed',
                     top: 0,
                     left: 0,
                     right: 0,
                     bottom: 0,
                     backgroundColor: 'rgba(0, 0, 0, 0.5)',
                     display: 'flex',
                     justifyContent: 'center',
                     alignItems: 'center',
                     zIndex: 1000
                 }}>
                     <div style={{
                         backgroundColor: colors.card,
                         padding: '30px',
                         borderRadius: '15px',
                         boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                         maxWidth: '400px',
                         width: '90%',
                         border: `1px solid ${colors.border}`
                     }}>
                         <h3 style={{
                             color: colors.text,
                             marginBottom: '20px',
                             fontSize: '1.3rem',
                             textAlign: 'center'
                         }}>
                             ⚠️ Rezervasyon Silme
                         </h3>
                         <p style={{
                             color: colors.textSecondary,
                             marginBottom: '25px',
                             textAlign: 'center',
                             lineHeight: '1.5'
                         }}>
                             <strong>{reservationToDelete?.ad || ''} {reservationToDelete?.soyad || reservationToDelete?.soy || ''}</strong> adlı kişinin rezervasyonunu silmek istediğinizden emin misiniz?
                         </p>
                         <div style={{
                             display: 'flex',
                             gap: '15px',
                             justifyContent: 'center'
                         }}>
                             <button
                                 onClick={cancelDelete}
                                 style={{
                                     background: colors.border,
                                     color: colors.text,
                                     border: 'none',
                                     padding: '12px 25px',
                                     borderRadius: '8px',
                                     fontSize: '1rem',
                                     cursor: 'pointer',
                                     transition: 'all 0.3s ease',
                                     fontWeight: '500'
                                 }}
                                 onMouseEnter={(e) => {
                                     e.target.style.transform = 'translateY(-2px)';
                                     e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                                 }}
                                 onMouseLeave={(e) => {
                                     e.target.style.transform = 'translateY(0)';
                                     e.target.style.boxShadow = 'none';
                                 }}
                             >
                                 ❌ Hayır
                             </button>
                             <button
                                 onClick={confirmDelete}
                                 style={{
                                     background: colors.error || '#dc3545',
                                     color: 'white',
                                     border: 'none',
                                     padding: '12px 25px',
                                     borderRadius: '8px',
                                     fontSize: '1rem',
                                     cursor: 'pointer',
                                     transition: 'all 0.3s ease',
                                     fontWeight: '500'
                                 }}
                                 onMouseEnter={(e) => {
                                     e.target.style.transform = 'translateY(-2px)';
                                     e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                                 }}
                                 onMouseLeave={(e) => {
                                     e.target.style.transform = 'translateY(0)';
                                     e.target.style.boxShadow = 'none';
                                 }}
                             >
                                 ✅ Evet, Sil
                             </button>
                         </div>
                     </div>
                 </div>
             )}

             {/* Kat/Masa Seçim Modal */}
             {showTableSelectionModal && (
                 <div style={{
                     position: 'fixed',
                     top: 0,
                     left: 0,
                     width: '100vw',
                     height: '100vh',
                     backgroundColor: 'rgba(0,0,0,0.7)',
                     zIndex: 9998,
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center'
                 }}>
                     <div style={{
                         backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
                         padding: '2rem',
                         borderRadius: '15px',
                         boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                         zIndex: 9999,
                         maxWidth: '600px',
                         width: '90%',
                         textAlign: 'center',
                         border: `1px solid ${isDarkMode ? '#4a4a4a' : '#e0e0e0'}`
                     }}>
                         <h3 style={{ 
                             color: isDarkMode ? '#ffffff' : '#333333', 
                             marginBottom: '20px',
                             fontSize: '1.5rem'
                         }}>
                             🏢 Kat ve Masa Seçimi
                         </h3>
                         
                         {/* Kat Seçimi */}
                         <div style={{ marginBottom: '20px' }}>
                             <h4 style={{ 
                                 color: isDarkMode ? '#cccccc' : '#666666', 
                                 marginBottom: '10px'
                             }}>
                                 Kat Seçin:
                             </h4>
                             <div style={{
                                 display: 'flex',
                                 gap: '10px',
                                 justifyContent: 'center',
                                 flexWrap: 'wrap'
                             }}>
                                 {[0, 1, 2].map((floor) => (
                                     <button
                                         key={floor}
                                         onClick={() => setSelectedFloor(floor)}
                                         style={{
                                                                                           background: selectedFloor === floor ? (isDarkMode ? colors.primary : '#513653') : (isDarkMode ? '#4a4a4a' : '#f0f0f0'),
                                             color: selectedFloor === floor ? 'white' : (isDarkMode ? '#ffffff' : '#333333'),
                                             border: 'none',
                                             padding: '10px 20px',
                                             borderRadius: '8px',
                                             cursor: 'pointer',
                                             fontSize: '14px',
                                             fontWeight: 'bold',
                                             transition: 'all 0.3s ease'
                                         }}
                                     >
                                         {getFloorName(floor)}
                                     </button>
                                 ))}
                             </div>
                         </div>

                         {/* Masa Seçimi */}
                         <div style={{ marginBottom: '20px' }}>
                             <h4 style={{ 
                                 color: isDarkMode ? '#cccccc' : '#666666', 
                                 marginBottom: '10px'
                             }}>
                                 {getFloorName(selectedFloor)} - Masa Seçin:
                             </h4>
                             <div style={{
                                 display: 'grid',
                                 gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                                 gap: '10px',
                                 maxWidth: '400px',
                                 margin: '0 auto'
                             }}>
                                 {[0, 1, 2, 3, 4, 5, 6, 7].map((tableIndex) => (
                                     <button
                                         key={tableIndex}
                                         onClick={() => handleTableSelection(selectedFloor, tableIndex)}
                                         style={{
                                             background: colors.success,
                                             color: 'white',
                                             border: 'none',
                                             padding: '15px 10px',
                                             borderRadius: '8px',
                                             cursor: 'pointer',
                                             fontSize: '14px',
                                             fontWeight: 'bold',
                                             transition: 'all 0.3s ease'
                                         }}
                                         onMouseEnter={(e) => {
                                             e.target.style.transform = 'scale(1.05)';
                                             e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                                         }}
                                         onMouseLeave={(e) => {
                                             e.target.style.transform = 'scale(1)';
                                             e.target.style.boxShadow = 'none';
                                         }}
                                     >
                                         {getTableNumber(selectedFloor, tableIndex)}
                                     </button>
                                 ))}
                             </div>
                         </div>

                         {/* İptal Butonu */}
                         <button
                             onClick={() => setShowTableSelectionModal(false)}
                             style={{
                                 background: isDarkMode ? '#4a4a4a' : '#e0e0e0',
                                 color: isDarkMode ? '#ffffff' : '#333333',
                                 border: 'none',
                                 padding: '12px 24px',
                                 borderRadius: '8px',
                                 cursor: 'pointer',
                                 fontSize: '16px',
                                 fontWeight: 'bold',
                                 transition: 'all 0.3s ease'
                             }}
                         >
                             ❌ İptal
                         </button>
                     </div>
                 </div>
             )}

             {/* Rezervasyon Modal */}
             <ReservationModal
                 visible={showReservationModal}
                 masaNo={selectedTable}
                 onClose={handleReservationClose}
                 onSubmit={handleReservationSubmit}
                 defaultDate={getTodayDate()}
             />
         </div>
     );
 };

export default ReservationsPage;
