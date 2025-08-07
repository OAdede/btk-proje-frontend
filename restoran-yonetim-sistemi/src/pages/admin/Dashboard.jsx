import React, { useContext, useState } from "react";
import { TableContext } from "../../context/TableContext";
import { ThemeContext } from "../../context/ThemeContext";
import ReservationModal from "../../components/reservations/ReservationModal";
import SuccessNotification from "../../components/reservations/SuccessNotification";
import "./Dashboard.css";





const Dashboard = () => {
  const { tableStatus, orders, reservations, addReservation, removeReservation } = useContext(TableContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [showReservationMode, setShowReservationMode] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showTableDetailsModal, setShowTableDetailsModal] = useState(false);
  const [selectedTableDetails, setSelectedTableDetails] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(0); // 0 = Zemin kat, 1 = 1. kat, 2 = 2. kat
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [showTableLayoutMode, setShowTableLayoutMode] = useState(false);
  const [showFloorLayoutMode, setShowFloorLayoutMode] = useState(false);
  const [tableCounts, setTableCounts] = useState({ 0: 8, 1: 8, 2: 8 }); // Her kattaki masa sayısı
  const [floors, setFloors] = useState([0, 1, 2]); // Mevcut katlar
  const [showDeleteFloorModal, setShowDeleteFloorModal] = useState(false);
  const [floorToDelete, setFloorToDelete] = useState(null);
  const [showDeleteTableModal, setShowDeleteTableModal] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);





  // Bugünün tarihini al (sadece gün-ay formatında)
  const getTodayDate = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}`;
  };

  // Kat adını döndüren fonksiyon
  const getFloorName = (floorNumber) => {
    if (floorNumber === 0) return "Zemin";
    return `Kat ${floorNumber}`;
  };

  // Masa numarasını oluşturan fonksiyon
  const getTableNumber = (floorNumber, tableIndex) => {
    if (floorNumber === 0) return `Z${tableIndex + 1}`;
    const letter = String.fromCharCode(65 + floorNumber - 1); // A, B, C, ...
    return `${letter}${tableIndex + 1}`;
  };

  // Mevcut kattaki masaları oluştur
  const tables = Array.from({ length: tableCounts[selectedFloor] }, (_, i) => ({
    id: `${selectedFloor}-${i + 1}`,
    displayNumber: getTableNumber(selectedFloor, i)
  }));

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
    
    // Başarı bildirimi göster
    setSuccessData({ ...formData, masaNo: selectedTable });
    setShowSuccess(true);
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
      // Rezervasyonu bul
      const reservationEntry = Object.entries(reservations).find(([id, reservation]) => 
        reservation.tableId === selectedTableDetails.id
      );
      
      if (reservationEntry) {
        const [reservationId] = reservationEntry;
        removeReservation(reservationId);
        setShowTableDetailsModal(false);
        setSelectedTableDetails(null);
      }
    }
  };



  const calculateTotal = (order) => {
    return Object.values(order).reduce((total, item) => {
      return total + (item.price * item.count);
    }, 0);
  };

  // İstatistikleri hesapla - Yeni kat sistemi ile
  const allTables = floors.flatMap(floor => 
    Array.from({ length: tableCounts[floor] || 0 }, (_, i) => `${floor}-${i + 1}`)
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

  // Masa ekleme fonksiyonu
  const addTable = () => {
    setTableCounts(prev => ({
      ...prev,
      [selectedFloor]: prev[selectedFloor] + 1
    }));
  };

  // Kat ekleme fonksiyonu
  const addFloor = () => {
    const newFloorNumber = Math.max(...floors) + 1;
    setFloors(prev => [...prev, newFloorNumber]);
    setTableCounts(prev => ({
      ...prev,
      [newFloorNumber]: 0 // Yeni katta başlangıçta 0 masa
    }));
  };

  // Kat silme fonksiyonu
  const deleteFloor = () => {
    if (floorToDelete !== null) {
      setFloors(prev => prev.filter(floor => floor !== floorToDelete));
      setTableCounts(prev => {
        const newCounts = { ...prev };
        delete newCounts[floorToDelete];
        return newCounts;
      });
      
      // Eğer silinen kat seçili kattaysa, ilk kata geç
      if (selectedFloor === floorToDelete) {
        setSelectedFloor(floors[0]);
      }
      
      setShowDeleteFloorModal(false);
      setFloorToDelete(null);
    }
  };

  // Kat silme modalını aç
  const openDeleteFloorModal = (floorNumber) => {
    setFloorToDelete(floorNumber);
    setShowDeleteFloorModal(true);
  };

  // Masa silme fonksiyonu
  const deleteTable = () => {
    if (tableToDelete !== null) {
      setTableCounts(prev => ({
        ...prev,
        [selectedFloor]: Math.max(0, prev[selectedFloor] - 1)
      }));
      setShowDeleteTableModal(false);
      setTableToDelete(null);
    }
  };

  // Masa silme modalını aç
  const openDeleteTableModal = (tableId) => {
    setTableToDelete(tableId);
    setShowDeleteTableModal(true);
  };

  return (
    <>
      <SuccessNotification 
        visible={showSuccess}
        onClose={() => setShowSuccess(false)}
        reservationData={successData}
      />
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
          
          <button
            onClick={() => {
              setShowTableLayoutMode(!showTableLayoutMode);
              setShowFloorLayoutMode(false);
            }}
            style={{
              background: showTableLayoutMode ? '#ff9800' : '#2196f3',
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
            {showTableLayoutMode ? 'Masa Düzenini Kapat' : 'Masa Düzeni'}
          </button>
          
          <button
            onClick={() => {
              setShowFloorLayoutMode(!showFloorLayoutMode);
              setShowTableLayoutMode(false);
            }}
            style={{
              background: showFloorLayoutMode ? '#9c27b0' : '#673ab7',
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
            {showFloorLayoutMode ? 'Kat Düzenini Kapat' : 'Kat Düzeni'}
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
        <h2 style={{ fontSize: "2rem", color: isDarkMode ? "#e0e0e0" : "#343a40", marginBottom: "1.5rem" }}>
          {getFloorName(selectedFloor)} - Masa Seçimi
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
          {showTableLayoutMode && (
            <span style={{
              background: '#2196f3',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '1rem',
              marginLeft: '15px',
              fontWeight: 'bold'
            }}>
              🏠 Masa Düzeni Modu Aktif
            </span>
          )}
          {showFloorLayoutMode && (
            <span style={{
              background: '#673ab7',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '1rem',
              marginLeft: '15px',
              fontWeight: 'bold'
            }}>
              🏢 Kat Düzeni Modu Aktif
            </span>
          )}
        </h2>

                         {/* Masalar Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1.5rem"
        }}>
          {tables.map((table) => {
            const status = getStatus(table.id);
            const order = orders[table.id] || {};
            const reservation = reservations[table.id];
            
            return (
              <div
                key={table.id}
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
                onClick={() => handleTableClick({ id: table.id, name: table.displayNumber, status: tableStatus[table.id] || 'empty', orderCount: Object.keys(order).length, reservation: reservation })}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                title={showReservationMode && status.text === 'Boş' ? `Masa ${table.displayNumber} - Rezervasyon Yap` : `Masa ${table.displayNumber}`}
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

                {/* Masa düzeni modunda çarpı işareti */}
                {showTableLayoutMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteTableModal(table.id);
                    }}
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      background: 'rgba(255,0,0,0.8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease',
                      zIndex: 10
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255,0,0,1)';
                      e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255,0,0,0.8)';
                      e.target.style.transform = 'scale(1)';
                    }}
                    title={`Masa ${table.displayNumber} Sil`}
                  >
                    ✕
                  </button>
                )}

                <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
                  {table.displayNumber}
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
                    {reservation.ad} {reservation.soyad} - {reservation.saat}
                  </div>
                )}
              </div>
            );
          })}

          {/* Masa düzeni modunda + butonu */}
          {showTableLayoutMode && (
            <div
              onClick={addTable}
              style={{
                backgroundColor: '#2196f3',
                color: 'white',
                height: "140px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "12px",
                cursor: 'pointer',
                userSelect: "none",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                border: '2px dashed rgba(255,255,255,0.5)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              title="Yeni Masa Ekle"
            >
              <div style={{ fontSize: "3rem", fontWeight: "bold" }}>+</div>
              <div style={{ fontSize: "1rem", marginTop: "0.5rem", fontWeight: "500" }}>
                Masa Ekle
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sağ Panel - Kat Seçimi */}
      <div style={{ width: "150px", flexShrink: 0 }}>
        <h3 style={{ fontSize: "1.25rem", color: isDarkMode ? "#e0e0e0" : "#495057", marginBottom: "1rem" }}>Katlar</h3>
        {floors.map((floor) => (
          <div
            key={floor}
            style={{
              padding: "1rem",
              marginBottom: "1rem",
              borderRadius: "8px",
              backgroundColor: selectedFloor === floor ? "#007bff" : (isDarkMode ? "#4a4a4a" : "#e9ecef"),
              color: selectedFloor === floor ? "white" : (isDarkMode ? "#e0e0e0" : "#495057"),
              textAlign: "center",
              cursor: "pointer",
              fontWeight: "bold",
              userSelect: "none",
              transition: "background-color 0.2s ease",
              position: 'relative'
            }}
          >
            <div
              onClick={() => setSelectedFloor(floor)}
              style={{ cursor: 'pointer' }}
            >
              {getFloorName(floor)}
            </div>
            
            {/* Kat düzeni modunda silme butonu */}
            {showFloorLayoutMode && floors.length > 1 && (
              <button
                onClick={() => openDeleteFloorModal(floor)}
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  background: 'rgba(255,255,255,0.2)',
                  color: selectedFloor === floor ? 'white' : (isDarkMode ? '#e0e0e0' : '#495057'),
                  border: 'none',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255,0,0,0.3)';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.2)';
                  e.target.style.color = selectedFloor === floor ? 'white' : (isDarkMode ? '#e0e0e0' : '#495057');
                }}
                title={`${getFloorName(floor)} Katını Sil`}
              >
                ✕
              </button>
            )}
          </div>
        ))}

        {/* Kat düzeni modunda + butonu */}
        {showFloorLayoutMode && (
          <div
            onClick={addFloor}
            style={{
              padding: "1rem",
              marginBottom: "1rem",
              borderRadius: "8px",
              backgroundColor: '#673ab7',
              color: 'white',
              textAlign: "center",
              cursor: "pointer",
              fontWeight: "bold",
              userSelect: "none",
              transition: "all 0.3s ease",
              border: '2px dashed rgba(255,255,255,0.5)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            title="Yeni Kat Ekle"
          >
            + Yeni Kat
          </div>
        )}
      </div>

      {/* Rezervasyon Modal */}
      <ReservationModal
        visible={showReservationModal}
        masaNo={selectedTable}
        onClose={handleReservationClose}
        onSubmit={handleReservationSubmit}
        defaultDate={getTodayDate()}
      />

             {/* Masa Silme Modal */}
       {showDeleteTableModal && (
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
             maxWidth: '400px',
             width: '90%',
             textAlign: 'center',
             border: `1px solid ${isDarkMode ? '#4a4a4a' : '#e0e0e0'}`
           }}>
             <h3 style={{ 
               color: isDarkMode ? '#ffffff' : '#333333', 
               marginBottom: '20px',
               fontSize: '1.5rem'
             }}>
               Masa Silme Onayı
             </h3>
             <p style={{ 
               color: isDarkMode ? '#cccccc' : '#666666', 
               marginBottom: '30px',
               fontSize: '1rem'
             }}>
               <strong>Masa {tableToDelete ? getTableNumber(selectedFloor, parseInt(tableToDelete.split('-')[1]) - 1) : ''}</strong> masasını silmek istediğinizden emin misiniz?
               <br />
               <small style={{ color: '#ff6b6b' }}>
                 Bu işlem geri alınamaz!
               </small>
             </p>
             <div style={{
               display: 'flex',
               gap: '15px',
               justifyContent: 'center'
             }}>
               <button
                 onClick={deleteTable}
                 style={{
                   background: '#f44336',
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
                 Evet, Sil
               </button>
               <button
                 onClick={() => {
                   setShowDeleteTableModal(false);
                   setTableToDelete(null);
                 }}
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
                 Hayır, İptal
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Kat Silme Modal */}
       {showDeleteFloorModal && (
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
             maxWidth: '400px',
             width: '90%',
             textAlign: 'center',
             border: `1px solid ${isDarkMode ? '#4a4a4a' : '#e0e0e0'}`
           }}>
             <h3 style={{ 
               color: isDarkMode ? '#ffffff' : '#333333', 
               marginBottom: '20px',
               fontSize: '1.5rem'
             }}>
               Kat Silme Onayı
             </h3>
             <p style={{ 
               color: isDarkMode ? '#cccccc' : '#666666', 
               marginBottom: '30px',
               fontSize: '1rem'
             }}>
               <strong>{getFloorName(floorToDelete)}</strong> katını silmek istediğinizden emin misiniz?
               <br />
               <small style={{ color: '#ff6b6b' }}>
                 Bu işlem geri alınamaz!
               </small>
             </p>
             <div style={{
               display: 'flex',
               gap: '15px',
               justifyContent: 'center'
             }}>
               <button
                 onClick={deleteFloor}
                 style={{
                   background: '#f44336',
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
                 Evet, Sil
               </button>
               <button
                 onClick={() => {
                   setShowDeleteFloorModal(false);
                   setFloorToDelete(null);
                 }}
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
                 Hayır, İptal
               </button>
             </div>
           </div>
         </div>
       )}

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
                    <strong>Müşteri:</strong> {selectedTableDetails.reservation.ad} {selectedTableDetails.reservation.soyad}
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
    </>
  );
};

export default Dashboard;
