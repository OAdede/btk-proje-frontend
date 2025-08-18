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
    const { tableStatus, reservations, updateTableStatus, orders, tables, salons, loading, error, loadTablesAndSalons } = useContext(TableContext);
    const { isDarkMode } = useContext(ThemeContext);

    // Dinamik salon seçimi: backend salons listesinden veya tables'tan türet
    const derivedSalons = useMemo(() => {
        if (Array.isArray(salons) && salons.length > 0) return salons;
        // Fallback: tables içinden benzersiz salonları çıkar
        const set = new Map();
        (tables || []).forEach(t => {
            const s = t?.salon;
            if (s && !set.has(s.id)) set.set(s.id, { id: s.id, name: s.name || `Salon ${s.id}` });
        });
        return Array.from(set.values());
    }, [salons, tables]);

    const initialSalonId = useMemo(() => (derivedSalons.length > 0 ? derivedSalons[0].id : null), [derivedSalons]);
    const [selectedSalonId, setSelectedSalonId] = useState(initialSalonId);
    useEffect(() => {
        if (!selectedSalonId && derivedSalons.length > 0) {
            setSelectedSalonId(derivedSalons[0].id);
        }
    }, [derivedSalons]);

    // Admin tarzı adlandırma: 0 -> Zemin (Z), 1 -> Kat 1 (A), 2 -> Kat 2 (B) ...
    const getSalonIndexById = (sid) => (derivedSalons || []).findIndex(s => String(s.id) === String(sid));
    const getAdminFloorLabelByIndex = (idx) => (idx <= 0 ? 'Zemin' : `Kat ${idx}`);
    const getAdminPrefixByIndex = (idx) => (idx <= 0 ? 'Z' : String.fromCharCode(65 + (idx - 1))); // 1->A, 2->B
    const getAdminFloorLabelBySalonId = (sid) => getAdminFloorLabelByIndex(getSalonIndexById(sid));
    const getFloorName = (salon) => (salon?.name || getAdminFloorLabelBySalonId(salon?.id));
    const getSalonDisplayNameById = (sid) => {
        const s = (derivedSalons || []).find(x => String(x.id) === String(sid));
        return s?.name || getAdminFloorLabelBySalonId(sid);
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
        if (!Array.isArray(tables) || tables.length === 0) return [];

        const selectedSalon = (derivedSalons || []).find(s => s.id === selectedSalonId);

        const getTableSalonId = (t) => {
            // Desteklenen şekiller: t.salon.id, t.salonId, t.salonID
            return (
                t?.salon?.id ??
                t?.salonId ??
                t?.salonID ??
                null
            );
        };

        const getTableSalonName = (t) => t?.salon?.name ?? t?.salonName ?? null;

        const shouldInclude = (t) => {
            if (!selectedSalonId) return true;
            const sid = getTableSalonId(t);
            if (sid != null && String(sid) === String(selectedSalonId)) return true;
            if (
                selectedSalon &&
                getTableSalonName(t) &&
                String(getTableSalonName(t)) === String(selectedSalon.name)
            ) return true;
            return false;
        };

        const filtered = tables.filter(shouldInclude);
        const source = filtered.length > 0 ? filtered : tables; // fallback: eşleşme yoksa tüm masaları göster

        return source.map((table) => {
            const tableNum = table?.tableNumber ?? table?.number ?? table?.id;
            const idStr = tableNum != null ? String(tableNum) : String(table?.id ?? '');
            const salonId = getTableSalonId(table);
            return {
                id: idStr, // masa numarası (UI)
                backendId: String(table?.id), // backend masa id
                displayNumber: idStr, // sadece sayı göster
                capacity: table?.capacity || 4,
                salonId: salonId,
                salonName: getTableSalonName(table),
                originalTableNumber: tableNum
            };
        });
    }, [selectedSalonId, derivedSalons, tables]);

    // Eğer veri henüz gelmediyse güvenli bir tekrar yükleme denemesi
    useEffect(() => {
        if (!loading && (!tables || tables.length === 0)) {
            try { loadTablesAndSalons?.(); } catch { }
        }
    }, [loading, tables, loadTablesAndSalons]);

    // Calculate occupancy using current table status as a proxy
    const getTableOccupancy = (tableId) => {
        const backendTable = tables.find(t => String(t?.tableNumber ?? t?.id) === String(tableId));
        if (!backendTable) return null;
        const capacity = backendTable?.capacity || 4;
        const statusName = String(
            backendTable?.status?.name ?? backendTable?.statusName ?? backendTable?.status_name ?? ''
        ).toLowerCase();
        // If reserved, try to use reservation headcount
        if (statusName === 'reserved') {
            const res = Object.values(reservations || {}).find(r => String(r.tableId) === String(tableId));
            const people = Number(res?.kisiSayisi);
            if (Number.isFinite(people) && people > 0) {
                const rate = Math.min((people / capacity) * 100, 100);
                return { rate, people, capacity };
            }
            return { rate: 60, people: null, capacity };
        }
        if (statusName === 'occupied') return { rate: 100, people: null, capacity };
        return { rate: 0, people: null, capacity };
    };

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
        const backendTable = tables.find(t => String(t?.tableNumber ?? t?.id) === tableId);
        if (backendTable && (backendTable.status || backendTable.statusName || backendTable.status_name)) {
            const backendStatus = String(
                backendTable?.status?.name ??
                backendTable?.statusName ??
                backendTable?.status_name ??
                ''
            ).toLowerCase();

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
        // Öncelik: backend durumu
        const backendTable = tables.find(t => String(t?.tableNumber ?? t?.id) === tableId);
        const backendStatus = (
            backendTable?.status?.name ?? backendTable?.statusName ?? backendTable?.status_name
        )?.toLowerCase?.();
        const status = backendStatus || tableStatus[tableId] || 'empty';
        // Dolu masada da yeni ürün ekleme/düzenleme için sipariş ekranına git
        navigate(`/${effectiveRole}/order/${tableId}`);
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
                    {getSalonDisplayNameById(selectedSalonId)} - Masa Seçimi
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
                        const occupancy = getTableOccupancy(table.id);
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
                                {/* Occupancy Indicator */}
                                {occupancy && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            background: 'rgba(0, 0, 0, 0.7)',
                                            color: 'white',
                                            padding: '2px 6px',
                                            borderRadius: '10px',
                                            fontSize: '10px',
                                            fontWeight: 'bold',
                                            zIndex: 10,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '2px'
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                backgroundColor: occupancy.rate >= 80 ? '#ff4444' : 
                                                               occupancy.rate >= 60 ? '#ffaa00' : '#44ff44'
                                            }}
                                        />
                                        {Math.round(occupancy.rate)}%
                                    </div>
                                )}
                                <div
                                    style={{
                                        fontSize: '0.8rem',
                                        color: 'rgba(255,255,255,0.7)',
                                        marginBottom: '2px',
                                        fontWeight: 400,
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
                                            opacity: 0.8,
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

                {(derivedSalons || []).map((salon) => (
                    <div
                        key={salon.id}
                        onClick={() => setSelectedSalonId(salon.id)}
                        style={{
                            padding: '1rem',
                            marginBottom: '1rem',
                            borderRadius: '8px',
                            backgroundColor: selectedSalonId === salon.id ? (isDarkMode ? '#007bff' : '#513653') : (isDarkMode ? '#4a4a4a' : '#e9ecef'),
                            color: selectedSalonId === salon.id ? 'white' : isDarkMode ? '#e0e0e0' : '#495057',
                            textAlign: 'center',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            userSelect: 'none',
                            transition: 'background-color 0.2s ease',
                            position: 'relative',
                        }}
                    >
                        {getFloorName(salon)}
                    </div>
                ))}
            </div>
        </div>
    );
}


