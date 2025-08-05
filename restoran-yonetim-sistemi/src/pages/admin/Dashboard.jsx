import React, { useContext, useState } from "react";
import { TableContext } from "../../context/TableContext";
import { ThemeContext } from "../../context/ThemeContext";
import ReservationModal from "../../components/reservations/ReservationModal";
import "./Dashboard.css";

const statusColors = {
  "empty": "#4caf50", // Yeşil - Boş
  "occupied": "#f44336", // Kırmızı - Dolu
  "reserved": "#ffeb3b" // Sarı - Rezerve
};

const statusTextColor = {
  "empty": "#fff",
  "occupied": "#fff",
  "reserved": "#222"
};

const statusText = {
  "empty": "Boş",
  "occupied": "Dolu",
  "reserved": "Rezerve"
};

// Kat harflerini belirle
const getFloorLetter = (floorIndex) => {
  if (floorIndex === 0) return 'Z'; // Zemin kat
  return String.fromCharCode(64 + floorIndex); // A, B, C, D...
};

// Kat adını belirle
const getFloorName = (floorIndex) => {
  if (floorIndex === 0) return 'Zemin Kat';
  return `${floorIndex}. Kat`;
};

const Dashboard = () => {
  const { tableStatus, orders, reservations, addReservation, removeReservation } = useContext(TableContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [showReservationMode, setShowReservationMode] = useState(false);
  const [showTableManagementMode, setShowTableManagementMode] = useState(false);
  const [showFloorManagementMode, setShowFloorManagementMode] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showTableDetailsModal, setShowTableDetailsModal] = useState(false);
  const [selectedTableDetails, setSelectedTableDetails] = useState(null);
  const [showDeleteFloorModal, setShowDeleteFloorModal] = useState(false);
  const [floorToDelete, setFloorToDelete] = useState(null);

  // Kat başlıkları için tema renkleri
  const katHeadingColor = isDarkMode ? '#e0e0e0' : '#4a5568';

  // Katları localStorage'dan al veya varsayılan değerleri kullan
  const [floors, setFloors] = useState(() => {
    const savedFloors = localStorage.getItem('dashboardFloors');
    return savedFloors ? JSON.parse(savedFloors) : [
      { id: 0, name: 'Zemin Kat', tableCount: 8 },
      { id: 1, name: '1. Kat', tableCount: 8 }
    ];
  });

  // Floors değiştiğinde localStorage'a kaydet
  React.useEffect(() => {
    localStorage.setItem('dashboardFloors', JSON.stringify(floors));
  }, [floors]);

  // Bugünün tarihini al (sadece gün-ay formatında)
  const getTodayDate = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}`;
  };

  // Dinamik kat masalarını oluştur
  const createFloorTables = (floor) => {
    const floorLetter = getFloorLetter(floor.id);
    return Array.from({ length: floor.tableCount }, (_, i) => {
      const tableId = `${floor.id}-${i + 1}`;
      const status = tableStatus[tableId] || 'empty';
      const hasOrder = orders[tableId] && Object.keys(orders[tableId]).length > 0;
      const hasReservation = reservations[tableId];
      
      return {
        id: tableId,
        name: `${floorLetter}${i + 1}`,
        status: hasOrder ? 'occupied' : hasReservation ? 'reserved' : status,
        orderCount: hasOrder ? Object.keys(orders[tableId]).length : 0,
        reservation: hasReservation,
        order: hasOrder ? orders[tableId] : null
      };
    });
  };

  // Tüm masaları oluştur
  const allTables = floors.flatMap(floor => createFloorTables(floor));

  // İstatistikler
  const totalTables = allTables.length;
  const occupiedTables = allTables.filter(table => table.status === 'occupied').length;
  const emptyTables = allTables.filter(table => table.status === 'empty').length;
  const reservedTables = allTables.filter(table => table.status === 'reserved').length;

  const handleReservationClick = (tableId) => {
    setSelectedTable(tableId);
    setShowReservationModal(true);
  };

  const handleTableClick = (table) => {
    if (table.status === 'occupied' || table.status === 'reserved') {
      setSelectedTableDetails(table);
      setShowTableDetailsModal(true);
    } else if (showReservationMode && table.status === 'empty') {
      handleReservationClick(table.id);
    }
  };

  const handleReservationSubmit = (formData) => {
    if (selectedTable) {
      addReservation(selectedTable, formData);
      setShowReservationModal(false);
      setSelectedTable(null);
      setShowReservationMode(false); // Rezervasyon modunu kapat
    }
  };

  const handleReservationClose = () => {
    setShowReservationModal(false);
    setSelectedTable(null);
  };

  const handleTableDetailsClose = () => {
    setShowTableDetailsModal(false);
    setSelectedTableDetails(null);
  };

  // Masa ekleme fonksiyonu
  const addTableToFloor = (floorId) => {
    setFloors(prevFloors => 
      prevFloors.map(floor => 
        floor.id === floorId 
          ? { ...floor, tableCount: floor.tableCount + 1 }
          : floor
      )
    );
  };

  // Masa silme fonksiyonu
  const removeTableFromFloor = (floorId) => {
    setFloors(prevFloors => 
      prevFloors.map(floor => 
        floor.id === floorId 
          ? { ...floor, tableCount: Math.max(1, floor.tableCount - 1) }
          : floor
      )
    );
  };

  // Kat ekleme fonksiyonu
  const addFloor = () => {
    const newFloorId = Math.max(...floors.map(f => f.id)) + 1;
    const newFloor = {
      id: newFloorId,
      name: getFloorName(newFloorId),
      tableCount: 8
    };
    setFloors(prev => [...prev, newFloor]);
  };

  // Kat silme fonksiyonu
  const removeFloor = () => {
    if (floorToDelete !== null) {
      setFloors(prev => prev.filter(floor => floor.id !== floorToDelete));
      setShowDeleteFloorModal(false);
      setFloorToDelete(null);
    }
  };

  // Kat silme modalını aç
  const openDeleteFloorModal = (floorId) => {
    const floor = floors.find(f => f.id === floorId);
    setFloorToDelete(floorId);
    setShowDeleteFloorModal(true);
  };

  // Toplam tutarı hesapla
  const calculateTotal = (order) => {
    if (!order) return 0;
    return Object.values(order).reduce((total, item) => {
      return total + (item.price * item.count);
    }, 0);
  };

  return (
    <div className="home-page">
      <h1>Hoşgeldiniz, Admin!</h1>
      
      {/* Kontrol Butonları */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        padding: '0 20px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setShowReservationMode(!showReservationMode)}
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
          onClick={() => setShowTableManagementMode(!showTableManagementMode)}
          style={{
            background: showTableManagementMode ? '#f44336' : '#2196f3',
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
          {showTableManagementMode ? 'Masa Düzenini Kapat' : 'Masa Düzeni'}
        </button>

        <button
          onClick={() => setShowFloorManagementMode(!showFloorManagementMode)}
          style={{
            background: showFloorManagementMode ? '#f44336' : '#ff9800',
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
          {showFloorManagementMode ? 'Kat Düzenini Kapat' : 'Kat Düzeni'}
        </button>

        {/* Kat düzeni modunda + - butonları */}
        {showFloorManagementMode && (
          <div style={{ display: 'flex', gap: '5px' }}>
            <button
              onClick={() => addFloor()}
              style={{
                background: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              +
            </button>
            {floors.length > 1 && (
              <button
                onClick={() => openDeleteFloorModal(Math.max(...floors.map(f => f.id)))}
                style={{
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                -
              </button>
            )}
          </div>
        )}
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

      <div className="katlar-wrapper">
        {floors.map((floor) => {
          const floorTables = createFloorTables(floor);
          return (
            <div key={floor.id} className="kat">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '15px'
              }}>
                <h2 style={{ color: katHeadingColor, margin: 0 }}>{floor.name}</h2>
                
                {/* Kat düzeni modunda - butonları */}
                {showFloorManagementMode && floors.length > 1 && (
                  <button
                    onClick={() => openDeleteFloorModal(floor.id)}
                    style={{
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    -
                  </button>
                )}
              </div>
              
              <div className="tables-list-home">
                {floorTables.map((table) => (
                  <div
                    key={table.id}
                    className="table-card-home"
                    style={{
                      background: statusColors[table.status],
                      color: statusTextColor[table.status],
                      position: 'relative',
                      cursor: (table.status === 'occupied' || table.status === 'reserved' || (showReservationMode && table.status === 'empty')) ? 'pointer' : 'default'
                    }}
                    onClick={() => handleTableClick(table)}
                  >
                    {/* Rezervasyon modunda + işareti */}
                    {showReservationMode && table.status === 'empty' && (
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
                        cursor: 'pointer'
                      }}>
                        +
                      </div>
                    )}

                    {/* Masa düzeni modunda - işareti */}
                    {showTableManagementMode && (
                      <div style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        background: 'rgba(255,0,0,0.9)',
                        color: 'white',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTableFromFloor(floor.id);
                      }}
                      >
                        -
                      </div>
                    )}

                    <div className="table-number-home">{table.name}</div>
                    <div className="table-status-home">
                      {statusText[table.status]}
                      {table.orderCount > 0 && (
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
                          {table.orderCount}
                        </span>
                      )}
                    </div>
                    {table.reservation && (
                      <div style={{
                        fontSize: '10px',
                        marginTop: '4px',
                        opacity: 0.8
                      }}>
                        {table.reservation.adSoyad} - {table.reservation.saat}
                      </div>
                    )}
                  </div>
                ))}

                {/* Masa düzeni modunda son masanın yanında + işareti */}
                {showTableManagementMode && (
                  <div
                    style={{
                      background: '#4caf50',
                      color: 'white',
                      width: '80px',
                      height: '80px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      border: '2px dashed rgba(255,255,255,0.5)'
                    }}
                    onClick={() => addTableToFloor(floor.id)}
                  >
                    +
                  </div>
                )}
              </div>
            </div>
          );
        })}
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
              >
                ✕
              </button>
            </div>

            {selectedTableDetails.status === 'occupied' && selectedTableDetails.order && (
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: '#ffffff', marginBottom: '10px' }}>Sipariş Edilen Ürünler:</h3>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {Object.values(selectedTableDetails.order).map((item, index) => (
                      <div key={index} style={{
                        background: '#473653',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ color: '#ffffff', fontWeight: 'bold' }}>{item.name}</div>
                          <div style={{ color: '#e0e0e0', fontSize: '14px' }}>Adet: {item.count}</div>
                        </div>
                        <div style={{ color: '#ffffff', fontWeight: 'bold' }}>
                          ₺{(item.price * item.count).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{
                  background: '#473653',
                  padding: '15px',
                  borderRadius: '8px',
                  textAlign: 'right'
                }}>
                  <div style={{ color: '#ffffff', fontSize: '18px', fontWeight: 'bold' }}>
                    Toplam: ₺{calculateTotal(selectedTableDetails.order).toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            {selectedTableDetails.status === 'reserved' && selectedTableDetails.reservation && (
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: '#ffffff', marginBottom: '15px' }}>Rezervasyon Bilgileri:</h3>
                  <div style={{ background: '#473653', padding: '20px', borderRadius: '8px' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <span style={{ color: '#e0e0e0', fontWeight: 'bold' }}>Ad Soyad:</span>
                      <span style={{ color: '#ffffff', marginLeft: '10px' }}>{selectedTableDetails.reservation.adSoyad}</span>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <span style={{ color: '#e0e0e0', fontWeight: 'bold' }}>Telefon:</span>
                      <span style={{ color: '#ffffff', marginLeft: '10px' }}>{selectedTableDetails.reservation.telefon}</span>
                    </div>
                    {selectedTableDetails.reservation.email && (
                      <div style={{ marginBottom: '10px' }}>
                        <span style={{ color: '#e0e0e0', fontWeight: 'bold' }}>E-mail:</span>
                        <span style={{ color: '#ffffff', marginLeft: '10px' }}>{selectedTableDetails.reservation.email}</span>
                      </div>
                    )}
                    <div style={{ marginBottom: '10px' }}>
                      <span style={{ color: '#e0e0e0', fontWeight: 'bold' }}>Tarih:</span>
                      <span style={{ color: '#ffffff', marginLeft: '10px' }}>{selectedTableDetails.reservation.tarih}</span>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <span style={{ color: '#e0e0e0', fontWeight: 'bold' }}>Saat:</span>
                      <span style={{ color: '#ffffff', marginLeft: '10px' }}>{selectedTableDetails.reservation.saat}</span>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <span style={{ color: '#e0e0e0', fontWeight: 'bold' }}>Kişi Sayısı:</span>
                      <span style={{ color: '#ffffff', marginLeft: '10px' }}>{selectedTableDetails.reservation.kisiSayisi}</span>
                    </div>
                    {selectedTableDetails.reservation.not && (
                      <div style={{ marginBottom: '10px' }}>
                        <span style={{ color: '#e0e0e0', fontWeight: 'bold' }}>Not:</span>
                        <span style={{ color: '#ffffff', marginLeft: '10px' }}>{selectedTableDetails.reservation.not}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Kat Silme Onay Modal */}
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
            backgroundColor: isDarkMode ? '#513653' : '#F5EFFF',
            padding: '2rem',
            borderRadius: '15px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            zIndex: 9999,
            maxWidth: '400px',
            width: '90%',
            border: `2px solid ${isDarkMode ? '#473653' : '#CDC1FF'}`
          }}>
            <h3 style={{ 
              color: isDarkMode ? '#ffffff' : '#2D1B69', 
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              Kat Silme Onayı
            </h3>
            <p style={{ 
              color: isDarkMode ? '#e0e0e0' : '#4A3B76',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {floors.find(f => f.id === floorToDelete)?.name} katını silmek istediğinize emin misiniz?
            </p>
            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center'
            }}>
              <button
                onClick={removeFloor}
                style={{
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
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
                  background: isDarkMode ? '#473653' : '#A294F9',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
