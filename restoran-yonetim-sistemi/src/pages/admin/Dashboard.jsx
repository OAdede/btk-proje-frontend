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

const Dashboard = () => {
  const { tableStatus, orders, reservations, addReservation, removeReservation } = useContext(TableContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [showReservationMode, setShowReservationMode] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showTableDetailsModal, setShowTableDetailsModal] = useState(false);
  const [selectedTableDetails, setSelectedTableDetails] = useState(null);

  // Kat başlıkları için tema renkleri
  const katHeadingColor = isDarkMode ? '#e0e0e0' : '#4a5568';

  // Bugünün tarihini al (sadece gün-ay formatında)
  const getTodayDate = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}`;
  };

  // 1. Kat masaları (1-1'den 1-8'e kadar)
  const kat1Tables = Array.from({ length: 8 }, (_, i) => {
    const tableId = `1-${i + 1}`;
    const status = tableStatus[tableId] || 'empty';
    const hasOrder = orders[tableId] && Object.keys(orders[tableId]).length > 0;
    const hasReservation = reservations[tableId];
    
    return {
      id: tableId,
      name: `${i + 1}`,
      status: hasOrder ? 'occupied' : hasReservation ? 'reserved' : status,
      orderCount: hasOrder ? Object.keys(orders[tableId]).length : 0,
      reservation: hasReservation,
      order: hasOrder ? orders[tableId] : null
    };
  });

  // 2. Kat masaları (2-1'den 2-8'e kadar)
  const kat2Tables = Array.from({ length: 8 }, (_, i) => {
    const tableId = `2-${i + 1}`;
    const status = tableStatus[tableId] || 'empty';
    const hasOrder = orders[tableId] && Object.keys(orders[tableId]).length > 0;
    const hasReservation = reservations[tableId];
    
    return {
      id: tableId,
      name: `${i + 9}`,
      status: hasOrder ? 'occupied' : hasReservation ? 'reserved' : status,
      orderCount: hasOrder ? Object.keys(orders[tableId]).length : 0,
      reservation: hasReservation,
      order: hasOrder ? orders[tableId] : null
    };
  });

  // İstatistikler
  const totalTables = kat1Tables.length + kat2Tables.length;
  const occupiedTables = [...kat1Tables, ...kat2Tables].filter(table => table.status === 'occupied').length;
  const emptyTables = [...kat1Tables, ...kat2Tables].filter(table => table.status === 'empty').length;
  const reservedTables = [...kat1Tables, ...kat2Tables].filter(table => table.status === 'reserved').length;

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
      
      {/* Rezervasyon Yap Butonu */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '0 20px'
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
        <div className="kat">
          <h2 style={{ color: katHeadingColor }}>1. Kat</h2>
          <div className="tables-list-home">
            {kat1Tables.map((table) => (
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
          </div>
        </div>
        
        <div className="kat">
          <h2 style={{ color: katHeadingColor }}>2. Kat</h2>
          <div className="tables-list-home">
            {kat2Tables.map((table) => (
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
          </div>
        </div>
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
    </div>
  );
};

export default Dashboard;
