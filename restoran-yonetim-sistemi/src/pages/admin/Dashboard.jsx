import React, { useContext, useState } from "react";
import { TableContext } from "../../context/TableContext";
import { ThemeContext } from "../../context/ThemeContext";
import ReservationModal from "../../components/reservations/ReservationModal";
import "./Dashboard.css";





const Dashboard = () => {
  const { tableStatus, orders, reservations, addReservation, removeReservation, clearAllReservations } = useContext(TableContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [showReservationMode, setShowReservationMode] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showTableDetailsModal, setShowTableDetailsModal] = useState(false);
  const [selectedTableDetails, setSelectedTableDetails] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(1); // Varsayılan olarak 1. kat





  // Bugünün tarihini al (sadece gün-ay formatında)
  const getTodayDate = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}`;
  };

  // Waiter ile aynı masa sistemi
  const tables = Array.from({ length: 8 }, (_, i) => `${selectedFloor}-${i + 1}`);

  const handleReservationClick = (tableId) => {
    setSelectedTable(tableId);
    setShowReservationModal(true);
  };

  const handleTableClick = (table) => {
    if (showReservationMode && table.status === 'empty') {
      // Rezervasyon modunda boş masaya tıklandığında rezervasyon modalını aç
      setSelectedTable(table.id);
      setShowReservationModal(true);
    } else {
      // Normal modda masa detaylarını göster
      setSelectedTableDetails(table);
      setShowTableDetailsModal(true);
    }
  };

  const handleReservationSubmit = (formData) => {
    addReservation(selectedTable, formData);
    setShowReservationModal(false);
    setSelectedTable(null);
    setShowReservationMode(false); // Rezervasyon modunu kapat
    
    // Başarı mesajı göster
    alert(`✅ Masa ${selectedTable} için rezervasyon başarıyla oluşturuldu!\n\nMüşteri: ${formData.adSoyad}\nTarih: ${formData.tarih}\nSaat: ${formData.saat}\nKişi Sayısı: ${formData.kisiSayisi}`);
  };

  const handleReservationClose = () => {
    setShowReservationModal(false);
    setSelectedTable(null);
    // Rezervasyon modalı kapatıldığında rezervasyon modunu da kapat
    if (showReservationMode) {
      setShowReservationMode(false);
    }
  };

  const handleTableDetailsClose = () => {
    setShowTableDetailsModal(false);
    setSelectedTableDetails(null);
  };

  // Rezervasyon silme fonksiyonu
  const handleReservationDelete = () => {
    if (selectedTableDetails && selectedTableDetails.status === 'reserved') {
      removeReservation(selectedTableDetails.id);
      setShowTableDetailsModal(false);
      setSelectedTableDetails(null);
    }
  };



  const calculateTotal = (order) => {
    return Object.values(order).reduce((total, item) => {
      return total + (item.price * item.count);
    }, 0);
  };

  // İstatistikleri hesapla - Waiter ile aynı sistem
  const allTables = [1, 2].flatMap(floor => 
    Array.from({ length: 8 }, (_, i) => `${floor}-${i + 1}`)
  );
  const emptyTables = allTables.filter(tableId => (tableStatus[tableId] || 'empty') === 'empty').length;
  const occupiedTables = allTables.filter(tableId => (tableStatus[tableId] || 'empty') === 'occupied').length;
  const reservedTables = allTables.filter(tableId => (tableStatus[tableId] || 'empty') === 'reserved').length;
  const totalTables = allTables.length;

  // Waiter ile aynı status sistemi
  const statusInfo = {
    "empty": { text: "Boş", color: "#4caf50", textColor: "#fff" },
    "bos": { text: "Boş", color: "#4caf50", textColor: "#fff" },
    "occupied": { text: "Dolu", color: "#dc3545", textColor: "#fff" },
    "dolu": { text: "Dolu", color: "#dc3545", textColor: "#fff" },
    "reserved": { text: "Rezerve", color: "#ffc107", textColor: "#212529" },
  };

  const getStatus = (tableId) => {
    const status = tableStatus[tableId] || "empty";
    return statusInfo[status] || statusInfo["empty"];
  };

  return (
    <div style={{ padding: "2rem", display: "flex", gap: "2rem", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      {/* Ana İçerik */}
      <div style={{ flex: 1 }}>
        {/* Kontrol Butonları */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
                     <button
             onClick={() => {
               setShowReservationMode(!showReservationMode);
             }}
            style={{
              background: showReservationMode ? '#f44336' : '#4caf50',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
          >
            {showReservationMode ? 'Rezervasyon Modunu Kapat' : 'Rezervasyon Yap'}
          </button>

          

          {/* Debug: Tüm rezervasyonları temizle */}
          <button
            onClick={() => {
              clearAllReservations();
              alert('Tüm rezervasyonlar temizlendi!');
            }}
            style={{
              background: '#9c27b0',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
          >
            🧹 Rezervasyonları Temizle
          </button>
        </div>
        
        {/* İstatistikler */}
        <div style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '30px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{
            background: '#4caf50',
            color: 'white',
            padding: '15px 25px',
            borderRadius: '10px',
            textAlign: 'center',
            minWidth: '120px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{emptyTables}</div>
            <div style={{ fontSize: '14px' }}>Boş Masa</div>
          </div>
          
          <div style={{
            background: '#f44336',
            color: 'white',
            padding: '15px 25px',
            borderRadius: '10px',
            textAlign: 'center',
            minWidth: '120px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{occupiedTables}</div>
            <div style={{ fontSize: '14px' }}>Dolu Masa</div>
          </div>
          
          <div style={{
            background: '#ffeb3b',
            color: '#222',
            padding: '15px 25px',
            borderRadius: '10px',
            textAlign: 'center',
            minWidth: '120px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{reservedTables}</div>
            <div style={{ fontSize: '14px' }}>Rezerve</div>
          </div>
          
          <div style={{
            background: '#2196f3',
            color: 'white',
            padding: '15px 25px',
            borderRadius: '10px',
            textAlign: 'center',
            minWidth: '120px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalTables}</div>
            <div style={{ fontSize: '14px' }}>Toplam Masa</div>
          </div>
        </div>

        {/* Kat Başlığı */}
        <h2 style={{ fontSize: "2rem", color: "#343a40", marginBottom: "1.5rem" }}>
          Kat {selectedFloor} - Masa Seçimi
          {showReservationMode && (
            <span style={{
              background: '#4caf50',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '1rem',
              marginLeft: '15px',
              fontWeight: 'bold'
            }}>
              📅 Rezervasyon Modu Aktif
            </span>
          )}
        </h2>

                 {/* Masalar Grid */}
         <div style={{
           display: "grid",
           gridTemplateColumns: "repeat(4, 1fr)",
           gap: "1.5rem"
         }}>
           {tables.map((tableId) => {
             const status = getStatus(tableId);
             const order = orders[tableId] || {};
             const reservation = reservations[tableId];
             
             return (
               <div
                 key={tableId}
                 style={{
                   backgroundColor: status.color,
                   color: status.textColor,
                   height: "140px",
                   display: "flex",
                   flexDirection: "column",
                   justifyContent: "center",
                   alignItems: "center",
                   borderRadius: "12px",
                   cursor: (status.text === 'Dolu' || status.text === 'Rezerve' || (showReservationMode && status.text === 'Boş')) ? 'pointer' : 'default',
                   userSelect: "none",
                   transition: "transform 0.2s ease, box-shadow 0.2s ease",
                   boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                   position: 'relative'
                 }}
                 onClick={() => handleTableClick({ id: tableId, name: tableId.split("-")[1], status: tableStatus[tableId] || 'empty', orderCount: Object.keys(order).length, reservation: reservation })}
                 onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                 onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                 title={showReservationMode && status.text === 'Boş' ? `Masa ${tableId.split("-")[1]} - Rezervasyon Yap` : `Masa ${tableId.split("-")[1]}`}
               >
                 {/* Rezervasyon modunda + işareti */}
                 {showReservationMode && status.text === 'Boş' && (
                   <div style={{
                     position: 'absolute',
                     top: '5px',
                     right: '5px',
                     background: 'rgba(255,255,255,0.9)',
                     color: '#333',
                     borderRadius: '50%',
                     width: '24px',
                     height: '24px',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     fontSize: '16px',
                     fontWeight: 'bold',
                     cursor: 'pointer',
                     animation: 'pulse 2s infinite'
                   }}>
                     +
                   </div>
                 )}



                 <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
                   {tableId.split("-")[1]}
                 </div>
                 <div style={{ fontSize: "1rem", marginTop: "0.5rem", fontWeight: "500" }}>
                   {status.text}
                   {Object.keys(order).length > 0 && (
                     <span style={{
                       background: 'rgba(255,255,255,0.2)',
                       borderRadius: '50%',
                       width: '20px',
                       height: '20px',
                       display: 'inline-flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       fontSize: '12px',
                       marginLeft: '8px'
                     }}>
                       {Object.keys(order).length}
                     </span>
                   )}
                 </div>
                 {reservation && (
                   <div style={{
                     fontSize: '10px',
                     marginTop: '4px',
                     opacity: 0.8
                   }}>
                     {reservation.adSoyad} - {reservation.saat}
                   </div>
                 )}
               </div>
             );
           })}

          
        </div>
      </div>

      {/* Sağ Panel - Kat Seçimi */}
      <div style={{ width: "150px", flexShrink: 0 }}>
        <h3 style={{ fontSize: "1.25rem", color: "#495057", marginBottom: "1rem" }}>Katlar</h3>
        {[1, 2].map((floor) => (
          <div
            key={floor}
            onClick={() => setSelectedFloor(floor)}
            style={{
              padding: "1rem",
              marginBottom: "1rem",
              borderRadius: "8px",
              backgroundColor: selectedFloor === floor ? "#007bff" : "#e9ecef",
              color: selectedFloor === floor ? "white" : "#495057",
              textAlign: "center",
              cursor: "pointer",
              fontWeight: "bold",
              userSelect: "none",
              transition: "background-color 0.2s ease",
            }}
          >
            Kat {floor}
          </div>
        ))}

        
      </div>

      {/* Rezervasyon Modal */}
      <ReservationModal
        visible={showReservationModal}
        masaNo={selectedTable}
        onClose={handleReservationClose}
        onSubmit={handleReservationSubmit}
        defaultDate={getTodayDate()}
      />

      {/* Masa Detayları Modal */}
      {showTableDetailsModal && selectedTableDetails && (
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
            backgroundColor: '#513653',
            padding: '2rem',
            borderRadius: '15px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            zIndex: 9999,
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            border: '2px solid #473653'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ color: '#ffffff', margin: 0 }}>
                Masa {selectedTableDetails.name} - {selectedTableDetails.status === 'occupied' ? 'Sipariş Detayları' : 'Rezervasyon Detayları'}
              </h2>
              <button
                onClick={handleTableDetailsClose}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: '#F08080',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(224, 25, 15, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'none';
                }}
              >
                ✕
              </button>
            </div>

            {selectedTableDetails.status === 'occupied' && orders[selectedTableDetails.id] && (
              <div>
                <h3 style={{ color: '#ffffff', marginBottom: '15px' }}>Sipariş Detayları:</h3>
                {Object.entries(orders[selectedTableDetails.id]).map(([itemId, item]) => (
                  <div key={itemId} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px',
                    marginBottom: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}>
                    <span style={{ color: '#ffffff' }}>{item.name}</span>
                    <span style={{ color: '#ffffff' }}>{item.count} x {item.price}₺ = {item.count * item.price}₺</span>
                  </div>
                ))}
                <div style={{
                  borderTop: '2px solid #473653',
                  paddingTop: '15px',
                  marginTop: '15px',
                  textAlign: 'right'
                }}>
                  <h4 style={{ color: '#ffffff', margin: 0 }}>
                    Toplam: {calculateTotal(orders[selectedTableDetails.id])}₺
                  </h4>
                </div>
              </div>
            )}

            {selectedTableDetails.status === 'reserved' && selectedTableDetails.reservation && (
              <div>
                <h3 style={{ color: '#ffffff', marginBottom: '15px' }}>Rezervasyon Detayları:</h3>
                <div style={{
                  background: 'rgba(255,255,255,0.1)',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '15px'
                }}>
                  <p style={{ color: '#ffffff', margin: '5px 0' }}>
                    <strong>Müşteri:</strong> {selectedTableDetails.reservation.adSoyad}
                  </p>
                  <p style={{ color: '#ffffff', margin: '5px 0' }}>
                    <strong>Tarih:</strong> {selectedTableDetails.reservation.tarih}
                  </p>
                  <p style={{ color: '#ffffff', margin: '5px 0' }}>
                    <strong>Saat:</strong> {selectedTableDetails.reservation.saat}
                  </p>
                  <p style={{ color: '#ffffff', margin: '5px 0' }}>
                    <strong>Kişi Sayısı:</strong> {selectedTableDetails.reservation.kisiSayisi}
                  </p>
                </div>
                <button
                  onClick={handleReservationDelete}
                  style={{
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    width: '100%'
                  }}
                >
                  🗑️ Rezervasyonu İptal Et
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      
    </div>
  );
};

export default Dashboard;
