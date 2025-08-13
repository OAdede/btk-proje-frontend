import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableContext } from '../../context/TableContext';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';

// A unified admin-style tables grid for all roles
// - For admin: this component can be reused later with custom handlers
// - For staff (garson/kasiyer): clicking a table navigates to order/summary

export default function AdminStyleTables({ roleOverride }) {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const effectiveRole = roleOverride || user?.role;
    const { tableStatus, reservations, updateTableStatus, orders, tables, salons, loading, error } = useContext(TableContext);
    const { isDarkMode } = useContext(ThemeContext);

    const [selectedFloor, setSelectedFloor] = useState(0); // 0: Zemin, 1: Kat1, 2: Kat2
    const floors = [0, 1, 2];

    const getFloorName = (floorNumber) => (floorNumber === 0 ? 'Zemin' : `Kat ${floorNumber}`);
    const getTableNumber = (floorNumber, tableIndex) => {
        if (floorNumber === 0) return `Z${tableIndex + 1}`;
        const letter = String.fromCharCode(65 + floorNumber - 1);
        return `${letter}${tableIndex + 1}`;
    };

    // Capacities from localStorage
    const [tableCapacities, setTableCapacities] = useState(() => {
        try {
            const saved = localStorage.getItem('tableCapacities');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });

    const getCapacity = (tableNumber) => {
        // Backend'den gelen masa kapasitesini kullan
        const backendTable = tables.find(t => t.tableNumber.toString() === tableNumber);
        if (backendTable && backendTable.capacity) {
            return backendTable.capacity;
        }
        
        // Fallback: localStorage'dan kapasite al
        return tableCapacities?.[tableNumber] || 4;
    };

    const filteredTables = useMemo(() => {
        // Backend'den veri gelirse onu kullan
        if (tables && tables.length > 0) {
            const filtered = tables.filter(table => {
                if (table.salon) {
                    // Salon ID'sine göre filtrele (1: Zemin, 2: Kat1, 3: Kat2)
                    const salonId = table.salon.id;
                    if (selectedFloor === 0 && salonId === 1) return true; // Zemin
                    if (selectedFloor === 1 && salonId === 2) return true; // Kat1
                    if (selectedFloor === 2 && salonId === 3) return true; // Kat2
                }
                return false;
            });
            
            // Eğer filtrelenmiş masalar varsa onları döndür
            if (filtered.length > 0) {
                return filtered.map(table => ({
                    id: table.tableNumber.toString(),
                    displayNumber: `Masa ${table.tableNumber}`,
                    capacity: table.capacity || 4,
                    backendId: table.id,
                    salonId: table.salon?.id,
                    salonName: table.salon?.name,
                    originalTableNumber: table.tableNumber
                }));
            }
        }
        
        // Backend'den veri gelmezse veya filtrelenmiş masalar yoksa fallback olarak hardcoded masalar
        const fallbackTables = [];
        for (let i = 0; i < 8; i++) {
            const tableId = getTableNumber(selectedFloor, i);
            fallbackTables.push({
                id: tableId,
                displayNumber: `Masa ${i + 1}`,
                capacity: getCapacity(tableId),
                isFallback: true
            });
        }
        
        return fallbackTables;
    }, [selectedFloor, tables, tableCapacities]);

    const statusInfo = {
        empty: { text: 'Boş', color: '#4caf50', textColor: '#fff' },
        bos: { text: 'Boş', color: '#4caf50', textColor: '#fff' },
        occupied: { text: 'Dolu', color: '#dc3545', textColor: '#fff' },
        dolu: { text: 'Dolu', color: '#dc3545', textColor: '#fff' },
        reserved: { text: 'Rezerve', color: '#ffc107', textColor: '#212529' },
        'reserved-future': { text: 'Rezerve', color: '#4caf50', textColor: '#fff' },
        'reserved-special': { text: 'Özel Rezerve', color: '#ffc107', textColor: '#212529' },
    };

    const getStatus = (tableId) => {
        // Backend'den gelen masa durumunu kullan
        const backendTable = tables.find(t => t.tableNumber.toString() === tableId);
        if (backendTable && backendTable.status) {
            const backendStatus = backendTable.status.name.toLowerCase();
            
            // Backend durumunu frontend durumuna çevir
            if (backendStatus === 'available') return statusInfo['empty'];
            if (backendStatus === 'occupied') return statusInfo['occupied'];
            if (backendStatus === 'reserved') return statusInfo['reserved'];
        }
        
        // Fallback: localStorage'dan durum al
        const status = tableStatus[tableId] || 'empty';
        if (status === 'reserved') {
            const reservation = Object.values(reservations).find((res) => res.tableId === tableId);
            if (reservation) {
                const reservationTime = new Date(`${reservation.tarih}T${reservation.saat}`);
                const now = new Date();
                const oneHour = 60 * 60 * 1000;
                const fiftyNineMinutes = 59 * 60 * 1000;

                if (reservationTime < now) {
                    updateTableStatus(tableId, 'empty');
                    return statusInfo['empty'];
                }

                if (reservation.specialReservation) {
                    if (reservationTime > now && reservationTime.getTime() - now.getTime() <= fiftyNineMinutes) {
                        return statusInfo['reserved-special'];
                    }
                    if (reservationTime > now && reservationTime.getTime() - now.getTime() > oneHour) {
                        return statusInfo['reserved-future'];
                    }
                } else {
                    if (reservationTime > now && reservationTime.getTime() - now.getTime() > oneHour) {
                        return statusInfo['reserved-future'];
                    }
                }
            } else {
                updateTableStatus(tableId, 'empty');
                return statusInfo['empty'];
            }
        }
        return statusInfo[status] || statusInfo['empty'];
    };

    // Staff click behavior: go to order/summary
    const handleStaffClick = (tableId) => {
        const status = tableStatus[tableId] || 'empty';
        if (status === 'occupied') {
            navigate(`/${effectiveRole}/summary/${tableId}`);
        } else {
            navigate(`/${effectiveRole}/order/${tableId}`);
        }
    };

    // Re-render every minute to keep timers fresh
    const [, setTick] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setTick((p) => p + 1), 60000);
        return () => clearInterval(t);
    }, []);

    return (
        <div
            style={{
                padding: '2rem',
                display: 'flex',
                gap: '2rem',
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            }}
        >
            <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '2rem', color: isDarkMode ? '#e0e0e0' : '#343a40', marginBottom: '1.5rem' }}>
                    {getFloorName(selectedFloor)} - Masa Seçimi
                </h2>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                        gap: '1.5rem',
                    }}
                >
                    {filteredTables.map((table) => {
                        const status = getStatus(table.id);
                        const order = orders?.[table.id] || {};
                        const tableReservations = Object.values(reservations).filter((res) => res.tableId === table.id);
                        return (
                            <div
                                key={table.id}
                                style={{
                                    backgroundColor: status.color,
                                    color: status.textColor,
                                    height: '140px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    position: 'relative',
                                }}
                                onClick={() => handleStaffClick(table.id)}
                                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                title={`Masa ${table.displayNumber}`}
                            >
                                <div
                                    style={{
                                        fontSize: '0.8rem',
                                        color: 'rgba(255,255,255,0.85)',
                                        marginBottom: '2px',
                                        fontWeight: 500,
                                    }}
                                >
                                    {table.capacity} Kişilik
                                </div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{table.displayNumber}</div>
                                <div style={{ fontSize: '1rem', marginTop: '0.5rem', fontWeight: 500 }}>
                                    {status.text}
                                    {Object.keys(order).length > 0 && (
                                        <span
                                            style={{
                                                background: 'rgba(255,255,255,0.2)',
                                                borderRadius: '50%',
                                                width: '20px',
                                                height: '20px',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '12px',
                                                marginLeft: '8px',
                                            }}
                                        >
                                            {Object.keys(order).length}
                                        </span>
                                    )}
                                </div>
                                {tableReservations.length > 0 && (
                                    <div
                                        style={{
                                            fontSize: '9px',
                                            marginTop: '4px',
                                            opacity: 0.85,
                                            textAlign: 'center',
                                            lineHeight: 1.2,
                                        }}
                                    >
                                        {tableReservations.map((res, index) => (
                                            <div key={`${table.id}-${index}`} style={{ marginBottom: 1 }}>
                                                {res.ad} {res.soyad} - {res.saat}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div style={{ width: '150px', flexShrink: 0 }}>
                <h3 style={{ fontSize: '1.25rem', color: isDarkMode ? '#e0e0e0' : '#495057', marginBottom: '1rem' }}>Katlar</h3>
                
                {floors.map((floor) => (
                    <div
                        key={floor}
                        onClick={() => setSelectedFloor(floor)}
                        style={{
                            padding: '1rem',
                            marginBottom: '1rem',
                            borderRadius: '8px',
                            backgroundColor: selectedFloor === floor ? (isDarkMode ? '#007bff' : '#513653') : (isDarkMode ? '#4a4a4a' : '#e9ecef'),
                            color: selectedFloor === floor ? 'white' : isDarkMode ? '#e0e0e0' : '#495057',
                            textAlign: 'center',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            userSelect: 'none',
                            transition: 'background-color 0.2s ease',
                            position: 'relative',
                        }}
                    >
                        {getFloorName(floor)}
                    </div>
                ))}
            </div>
        </div>
    );
}


