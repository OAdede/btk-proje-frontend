import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableContext } from '../../context/TableContext';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import StockWarning from '../common/StockWarning';

// A unified admin-style tables grid for all roles
// - For admin: this component can be reused later with custom handlers
// - For staff (garson/kasiyer): clicking a table navigates to order/summary

export default function AdminStyleTables({ roleOverride }) {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const effectiveRole = roleOverride || user?.role;
    const { tableStatus, reservations, updateTableStatus, orders, tables, salons, loading, error, loadTablesAndSalons } = useContext(TableContext);
    const { isDarkMode } = useContext(ThemeContext);
    
    // Occupancy data state
    const [occupancyData, setOccupancyData] = useState(null);
    const [loadingOccupancy, setLoadingOccupancy] = useState(false);

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

    // Occupancy API'sini çağır
    const fetchOccupancyData = async () => {
        try {
            setLoadingOccupancy(true);
            const token = localStorage.getItem('token');
            const response = await fetch('/api/salons/occupancy', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setOccupancyData(data);
            } else {
                console.error('Failed to fetch occupancy data:', response.status);
            }
        } catch (error) {
            console.error('Error fetching occupancy data:', error);
        } finally {
            setLoadingOccupancy(false);
        }
    };

    // Occupancy verilerini yükle
    useEffect(() => {
        fetchOccupancyData();
        // Her 30 saniyede bir güncelle
        const interval = setInterval(fetchOccupancyData, 30000);
        return () => clearInterval(interval);
    }, []);

    // (Per-table occupancy badge removed; only floor badge remains)

    const statusInfo = {
        empty: { text: 'Boş', color: '#4caf50', textColor: '#fff' },
        bos: { text: 'Boş', color: '#4caf50', textColor: '#fff' },
        occupied: { text: 'Dolu', color: '#dc3545', textColor: '#fff' },
        dolu: { text: 'Dolu', color: '#dc3545', textColor: '#fff' },
        reserved: { text: 'Rezerve', color: '#ffc107', textColor: '#fff' },
        'reserved-future': { text: 'Rezerve', color: '#4caf50', textColor: '#fff' },
        'reserved-special': { text: 'Özel Rezerve', color: '#ffc107', textColor: '#fff' },
    };

    // Masa ID'sinden orders verilerini almak için yardımcı fonksiyon
    const getOrderForTable = (tableId) => {
        // Önce backend table ID'sini bul
        const backendTable = tables.find(t => String(t?.tableNumber ?? t?.id) === tableId);
        if (!backendTable) return null;
        
        // Backend table ID'si ile orders'dan sipariş ara
        const backendTableId = String(backendTable.id);
        const order = orders[backendTableId];
        
        // Tamamlanmış siparişleri döndürme
        if (order && order.isCompleted === true) {
            console.log(`Tamamlanmış sipariş ${order.id} masada gösterilmeyecek`);
            return null;
        }
        
        return order || null;
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
            if (backendStatus === 'reserved') {
                // 24 saat kuralını uygula
                const res = Object.values(reservations || {}).find(r => {
                    const rid = String(r.tableId);
                    const candidates = [String(tableId), String(backendTable?.tableNumber ?? ''), String(backendTable?.id ?? '')];
                    return candidates.includes(rid);
                });
                if (res && res.tarih && res.saat) {
                    const reservationTime = new Date(`${res.tarih}T${res.saat}`);
                    const now = new Date();
                    const fiftyNineMinutes = 59 * 60 * 1000;
                    const twentyFourHours = 24 * 60 * 60 * 1000;
                    const delta = reservationTime.getTime() - now.getTime();
                    if (reservationTime > now && delta <= fiftyNineMinutes && res.specialReservation) {
                        return statusInfo['reserved-special'];
                    }
                    if (reservationTime > now && delta <= twentyFourHours) {
                        return statusInfo['reserved'];
                    }
                    if (reservationTime > now && delta > twentyFourHours) {
                        return statusInfo['reserved-future'];
                    }
                    if (reservationTime < now) {
                        // Rezervasyon geçmişse yeşile dön
                        updateTableStatus(tableId, 'empty');
                        return statusInfo['empty'];
                    }
                }
                return statusInfo['reserved'];
            }
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
                const twentyFourHours = 24 * 60 * 60 * 1000;

                if (reservationTime < now) {
                    updateTableStatus(tableId, 'empty');
                    return statusInfo['empty'];
                }

                const delta = reservationTime.getTime() - now.getTime();
                if (reservation.specialReservation) {
                    if (reservationTime > now && delta <= fiftyNineMinutes) {
                        return statusInfo['reserved-special'];
                    }
                    if (reservationTime > now && delta <= twentyFourHours) {
                        return statusInfo['reserved'];
                    }
                    if (reservationTime > now && delta > twentyFourHours) {
                        return statusInfo['reserved-future'];
                    }
                } else {
                    if (reservationTime > now && delta <= twentyFourHours) {
                        return statusInfo['reserved'];
                    }
                    if (reservationTime > now && delta > twentyFourHours) {
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

    // Floor (kat) occupancy computed from current salon selection
    const calculateFloorOccupancy = () => {
        if (!selectedSalonId) return { used: 0, total: 0 };
        const inSalon = (tables || []).filter(t => String(t?.salon?.id ?? t?.salonId) === String(selectedSalonId));
        const totalCapacity = inSalon.reduce((s, t) => s + (Number(t?.capacity) || 4), 0);
        if (totalCapacity <= 0) return { used: 0, total: 0 };
        let used = 0;
        inSalon.forEach(t => {
            const statusName = String(t?.status?.name ?? t?.statusName ?? t?.status_name ?? '').toLowerCase();
            const cap = Number(t?.capacity) || 4;
            if (statusName === 'occupied') {
                used += cap;
            } else if (statusName === 'reserved') {
                const res = Object.values(reservations || {}).find(r => String(r.tableId) === String(t?.tableNumber ?? t?.id));
                const ppl = Number(res?.kisiSayisi ?? res?.personCount);
                used += Number.isFinite(ppl) && ppl > 0 ? Math.min(ppl, cap) : Math.ceil(cap / 2);
            }
        });
        return { used, total: totalCapacity };
    };

    const floorOccupancy = calculateFloorOccupancy();

    // İstatistikleri hesapla
    const backendTablesForStats = useMemo(() => {
        const list = selectedSalonId ? (tables || []).filter(t => (t?.salon?.id ?? t?.salonId) === selectedSalonId) : (tables || []);
        return list;
    }, [tables, selectedSalonId]);
    
    const totalTables = backendTablesForStats.length;
    
    // Hibrit yaklaşım: Order items'ı olan VEYA backend'de occupied olan masalar
    const occupiedTables = backendTablesForStats.filter(t => 
        t.activeOrderItemsCount > 0 || String(t?.statusName ?? '').toLowerCase() === 'occupied'
    ).length;
    
    // Rezerveli masalar sarı (reserved)
    const reservedTables = backendTablesForStats.filter(t => 
        String(t?.status?.name ?? t?.statusName ?? '').toLowerCase() === 'reserved'
    ).length;
    
    // Geri kalan masalar yeşil (available/empty)
    const emptyTables = totalTables - occupiedTables - reservedTables;

    return (
        <>
            {/* Sadece admin için stok uyarısını göster */}
            {effectiveRole === 'admin' && <StockWarning />}
            
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
                
                {/* İstatistikler */}
                <div style={{
                    display: 'flex',
                    gap: '20px',
                    marginBottom: '30px',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                }}>
                    <div style={{
                        background: '#3949ab',
                        color: 'white',
                        padding: '15px 25px',
                        borderRadius: '10px',
                        textAlign: 'center',
                        minWidth: '120px'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                            {(() => {
                                if (loadingOccupancy) return '...';
                                if (!occupancyData || !occupancyData.salons) return '0%';
                                
                                const currentSalon = occupancyData.salons.find(s => String(s.id) === String(selectedSalonId));
                                if (!currentSalon) return '0%';
                                
                                return `${Math.round(currentSalon.occupancyRate)}%`;
                            })()}
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: 4 }}>Kat Doluluk Oranı</div>
                    </div>
                    <div style={{
                        background: '#ff9800',
                        color: 'white',
                        padding: '15px 25px',
                        borderRadius: '10px',
                        textAlign: 'center',
                        minWidth: '120px'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                            {(() => {
                                if (loadingOccupancy) return '...';
                                if (!occupancyData || !occupancyData.salons) return '0';
                                
                                const currentSalon = occupancyData.salons.find(s => String(s.id) === String(selectedSalonId));
                                if (!currentSalon) return '0';
                                
                                return currentSalon.capacity;
                            })()}
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: 4 }}>Kapasite</div>
                    </div>
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
                    <div style={{
                        background: '#9c27b0',
                        color: 'white',
                        padding: '15px 25px',
                        borderRadius: '10px',
                        textAlign: 'center',
                        minWidth: '120px'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                            {(() => {
                                if (loadingOccupancy) return '...';
                                if (!occupancyData || !occupancyData.totalRestaurantOccupancy) return '0%';
                                
                                return `${Math.round(occupancyData.totalRestaurantOccupancy)}%`;
                            })()}
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: 4 }}>Genel Doluluk</div>
                    </div>
                </div>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                        gap: '1.5rem',
                    }}
                >
                    {filteredTables.map((table) => {
                        const status = getStatus(table.id);
                        const order = getOrderForTable(table.id) || {};
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
                                {/* Per-table occupancy badge removed */}
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
                                <div style={{ fontSize: '2.5rem', fontWeight: '500' }}>{table.displayNumber}</div>
                                <div style={{ fontSize: '1rem', marginTop: '0.5rem', fontWeight: 500 }}>
                                    {status.text}
                                    {order.items && Object.keys(order.items).length > 0 && (
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
                                            {Object.keys(order.items).length}
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
        </>
    );
}


