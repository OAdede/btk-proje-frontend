import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableContext } from '../../context/TableContext';
import { useTheme } from '../../context/ThemeContext';
import ReservationModal from '../../components/reservations/ReservationModal';
import WarningModal from '../../components/common/WarningModal';
import SpecialReservationModal from '../../components/reservations/SpecialReservationModal';

const ReservationsPage = () => {
    const navigate = useNavigate();
    const { reservations, addReservation, addSpecialReservation, removeReservation, tableStatus } = useContext(TableContext);
    const { isDarkMode, colors } = useTheme();
    const [filter, setFilter] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [reservationToDelete, setReservationToDelete] = useState(null);
    const [showReservationModal, setShowReservationModal] = useState(false);
    const [showSpecialReservationModal, setShowSpecialReservationModal] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);
    const [showTableSelectionModal, setShowTableSelectionModal] = useState(false);
    const [selectedFloor, setSelectedFloor] = useState(0);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
    const [modalKey, setModalKey] = useState(0);

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

    // Table ID'yi masa numarasına çevir (örn: "1" -> "Z1", "9" -> "A1")
    const getTableNameFromId = (tableId) => {
        if (!tableId || typeof tableId !== 'string') return tableId;
        
        const id = parseInt(tableId);
        if (id <= 8) {
            return `Z${id}`;
        } else if (id <= 16) {
            return `A${id - 8}`;
        } else if (id <= 24) {
            return `B${id - 16}`;
        }
        return tableId;
    };

    // Masa numarasını Table ID'ye çevir (örn: "Z1" -> "1", "A1" -> "9", "B1" -> "17")
    const getTableIdFromName = (tableName) => {
        if (!tableName || typeof tableName !== 'string') return tableName;
        
        // Z1, Z2, ... -> 1, 2, ...
        if (tableName.startsWith('Z')) {
            return tableName.substring(1);
        }
        
        // A1, A2, ... -> 9, 10, ...
        // B1, B2, ... -> 17, 18, ...
        const floorChar = tableName.charAt(0);
        const tableIndex = parseInt(tableName.substring(1));
        const floorNumber = floorChar.charCodeAt(0) - 64; // A=1, B=2, C=3, ...
        
        return (floorNumber * 8) + tableIndex;
    };

    // Masa kapasitesini al (localStorage'dan)
    const getTableCapacity = (tableNumber) => {
        const capacities = JSON.parse(localStorage.getItem('tableCapacities') || '{}');
        return capacities[tableNumber] || 4; // Varsayılan 4 kişilik
    };

    // Kat kapasitesini hesapla
    const getFloorCapacity = (floorNumber) => {
        let totalCapacity = 0;
        for (let tableIndex = 0; tableIndex < 8; tableIndex++) {
            const tableNumber = getTableNumber(floorNumber, tableIndex);
            const tableStatus = getTableStatus(tableNumber);
            if (tableStatus.status === 'empty') {
                totalCapacity += getTableCapacity(tableNumber);
            }
        }
        return totalCapacity;
    };

    // En uygun katı bul
    const findBestFloor = (personCount) => {
        let bestFloor = null;
        let bestCapacity = 0;
        
        for (let floor = 0; floor <= 2; floor++) {
            const floorCapacity = getFloorCapacity(floor);
            if (floorCapacity >= personCount && (bestFloor === null || floorCapacity < bestCapacity)) {
                bestFloor = floor;
                bestCapacity = floorCapacity;
            }
        }
        
        return bestFloor;
    };

    // Masa kapasitesi kontrolü
    const checkTableCapacity = (tableNumber, personCount) => {
        const tableCapacity = getTableCapacity(tableNumber);
        return personCount <= tableCapacity;
    };

    // Özel rezervasyon için uygun masaları bul
    const findSuitableTables = (personCount, selectedFloor = null) => {
        const suitableTables = [];
        const allTables = [];
        
        // Tüm masaları topla
        for (let floor = 0; floor <= 2; floor++) {
            if (selectedFloor !== null && floor !== selectedFloor) continue;
            
            for (let tableIndex = 0; tableIndex < 8; tableIndex++) {
                const tableNumber = getTableNumber(floor, tableIndex);
                const tableStatusInfo = getTableStatus(tableNumber);
                const tableCapacity = getTableCapacity(tableNumber);
                
                if (tableStatusInfo.status === 'empty') {
                    allTables.push({
                        tableNumber,
                        capacity: tableCapacity,
                        floor,
                        tableIndex
                    });
                }
            }
        }
        
        // Eğer hiç boş masa bulunamazsa, tüm masaları "empty" olarak işaretle
        if (allTables.length === 0) {
            
            for (let floor = 0; floor <= 2; floor++) {
                if (selectedFloor !== null && floor !== selectedFloor) continue;
                
                for (let tableIndex = 0; tableIndex < 8; tableIndex++) {
                    const tableNumber = getTableNumber(floor, tableIndex);
                    const tableCapacity = getTableCapacity(tableNumber);
                    
                    // Bu masayı boş olarak işaretle
                    allTables.push({
                        tableNumber,
                        capacity: tableCapacity,
                        floor,
                        tableIndex
                    });
                }
            }
        }
        
        // Masaları kapasiteye göre sırala (büyükten küçüğe)
        allTables.sort((a, b) => b.capacity - a.capacity);
        
        // En uygun masaları bul
        let remainingPeople = personCount;
        let selectedTables = [];
        
        for (const table of allTables) {
            if (remainingPeople <= 0) break;
            
            if (table.capacity <= remainingPeople) {
                selectedTables.push(table);
                remainingPeople -= table.capacity;
            }
        }
        
        // Eğer tam eşleşme bulunamazsa, en yakın kombinasyonu bul
        if (remainingPeople > 0) {
            selectedTables = [];
            remainingPeople = personCount;
            
            for (const table of allTables) {
                if (remainingPeople <= 0) break;
                selectedTables.push(table);
                remainingPeople -= table.capacity;
            }
        }
        
        return {
            tables: selectedTables,
            totalCapacity: selectedTables.reduce((sum, table) => sum + table.capacity, 0),
            remainingPeople: Math.max(0, remainingPeople)
        };
    };

    const handleAddReservation = () => {
        setShowTableSelectionModal(true);
    };

    const handleAddSpecialReservation = () => {
        setShowSpecialReservationModal(true);
    };

    // Masa durumunu kontrol eden fonksiyon
    const getTableStatus = (tableNumber) => {
        // tableNumber'ı tableId formatına çevir (örn: "Z1" -> "0-0")
        const tableId = getTableIdFromName(tableNumber);
        
        // tableStatus context'ini kontrol et
        let contextStatus = tableStatus[tableId];
        
        // Eğer context'te masa 'empty' olarak işaretliyse, boş kabul et
        if (contextStatus === 'empty' || contextStatus === 'bos') {
            return { status: 'empty', reservations: [] };
        }
        
        // Context'te 'reserved' ise, rezervasyonları kontrol et
        if (contextStatus === 'reserved') {
            const tableReservations = Object.values(reservations).filter(res => res.tableId === tableId);
            
            // Eğer rezervasyon bulunamazsa ama masa hala 'reserved' olarak işaretliyse
            if (tableReservations.length === 0) {
                return { status: 'empty', reservations: [] };
            }
            
            // Rezervasyon bulundu, geçerliliğini kontrol et
            const now = new Date();
            const validReservations = tableReservations.filter(res => {
                const reservationTime = new Date(`${res.tarih}T${res.saat}`);
                return reservationTime > now; // Sadece gelecekteki rezervasyonları kabul et
            });
            
            if (validReservations.length === 0) {
                return { status: 'empty', reservations: [] };
            }
            
            return { status: 'reserved', reservations: validReservations };
        }
        
        // Eğer context'te hiçbir durum yoksa, reservations array'ini kontrol et
        if (!contextStatus) {
            const tableReservations = Object.values(reservations).filter(res => res.tableId === tableId);
            if (tableReservations.length > 0) {
                // Rezervasyon var ama context'te durum yok, geçerliliğini kontrol et
                const now = new Date();
                const validReservations = tableReservations.filter(res => {
                    const reservationTime = new Date(`${res.tarih}T${res.saat}`);
                    return reservationTime > now;
                });
                
                if (validReservations.length > 0) {
                    return { status: 'reserved', reservations: validReservations };
                }
            }
        }
        
        // Diğer durumlar için (occupied, dolu vb.)
        return { status: contextStatus || 'empty', reservations: [] };
    };

    // 5 saat kısıtlamasını kontrol eden fonksiyon
    const canMakeReservation = (existingReservations, newTime) => {
        if (existingReservations.length === 0) return true;
        
        const newTimeHour = parseInt(newTime.split(':')[0]);
        
        for (const reservation of existingReservations) {
            const existingTimeHour = parseInt(reservation.saat.split(':')[0]);
            const timeDifference = Math.abs(newTimeHour - existingTimeHour);
            
            if (timeDifference < 5) {
                return false;
            }
        }
        return true;
    };

    const handleTableSelection = (floorNumber, tableIndex) => {
        const tableNumber = getTableNumber(floorNumber, tableIndex);
        const tableStatus = getTableStatus(tableNumber);
        
        if (tableStatus.status === 'reserved') {
            // Rezerve masaya tıklandığında rezervasyon bilgilerini göster
            setSelectedTable(tableNumber);
            setShowTableSelectionModal(false);
            setShowReservationModal(true);
        } else {
            // Boş masaya tıklandığında normal rezervasyon ekleme
            setSelectedTable(tableNumber);
            setShowTableSelectionModal(false);
            setShowReservationModal(true);
        }
    };

    const handleReservationClose = () => {
        setShowReservationModal(false);
        setSelectedTable(null);
    };

    const handleSpecialReservationClose = () => {
        setShowSpecialReservationModal(false);
    };

    const handleReservationSubmit = (formData) => {
        const tableStatus = getTableStatus(selectedTable);
        
        // Masa kapasitesi kontrolü
        if (!checkTableCapacity(selectedTable, parseInt(formData.kisiSayisi))) {
            const tableCapacity = getTableCapacity(selectedTable);
            setWarningMessage(`Bu masa ${tableCapacity} kişilik. ${formData.kisiSayisi} kişilik rezervasyon yapılamaz.`);
            setShowWarningModal(true);
            return;
        }
        
        if (tableStatus.status === 'reserved') {
            // Rezerve masaya yeni rezervasyon ekleme
            if (!canMakeReservation(tableStatus.reservations, formData.saat)) {
                setWarningMessage('Bu masaya 5 saat arayla rezervasyon yapabilirsiniz. Mevcut rezervasyonlardan en az 5 saat sonra rezervasyon yapabilirsiniz.');
                setShowWarningModal(true);
                return;
            }
        }
        
        addReservation(selectedTable, formData);
        setShowReservationModal(false);
        setSelectedTable(null);
        setModalKey(prev => prev + 1); // Modal key'ini artırarak form verilerini temizle
    };

    const handleSpecialReservationSubmit = (formData) => {
        const { personCount, selectedFloor, reservationReason, wholeFloorOption } = formData;
        
        // Kat seçimi kontrolü ve otomatik seçim
        let finalSelectedFloor = selectedFloor;
        if (selectedFloor === null || selectedFloor === "") {
            finalSelectedFloor = findBestFloor(personCount);
            if (finalSelectedFloor === null) {
                setWarningMessage('Hiçbir katta yeterli kapasite bulunamadı. Lütfen kişi sayısını azaltın veya farklı bir tarih seçin.');
                setShowWarningModal(true);
                return;
            }
        } else {
            // Seçilen katın kapasitesini kontrol et
            const floorCapacity = getFloorCapacity(selectedFloor);
            if (floorCapacity < personCount) {
                setWarningMessage(`${getFloorName(selectedFloor)} kapasitesi (${floorCapacity} kişi) yetersiz. Bu kat için maksimum ${floorCapacity} kişilik rezervasyon yapabilirsiniz.`);
                setShowWarningModal(true);
                return;
            }
        }
        
        // Eğer tüm katı kapatma seçeneği seçilmişse
        if (wholeFloorOption && finalSelectedFloor !== null) {
            // Seçilen katın tüm masalarını al
            const floorTables = [];
            for (let tableIndex = 0; tableIndex < 8; tableIndex++) {
                const tableNumber = getTableNumber(finalSelectedFloor, tableIndex);
                const tableStatus = getTableStatus(tableNumber);
                const tableCapacity = getTableCapacity(tableNumber);
                
                if (tableStatus.status === 'empty') {
                    floorTables.push({
                        tableNumber,
                        capacity: tableCapacity,
                        floor: finalSelectedFloor,
                        tableIndex
                    });
                }
            }
            
            if (floorTables.length === 0) {
                setWarningMessage('Seçilen katta boş masa bulunamadı.');
                setShowWarningModal(true);
                return;
            }
            
            // Tüm katı kapatma rezervasyonu oluştur
            addSpecialReservation(floorTables, formData);
            
            // Başarı mesajı
            const floorName = getFloorName(finalSelectedFloor);
            const tableNames = floorTables.map(t => getTableNumber(t.floor, t.tableIndex)).join(', ');
            
            // Yeni fiyat hesaplama (100₺ kişi başına + kat kapatma ücreti)
            const basePrice = personCount * 100;
            let floorClosingPrice = 0;
            
            if (formData.floorClosingAllDay) {
                floorClosingPrice = 8000; // Tüm gün
            } else {
                const hours = parseInt(formData.floorClosingHours) || 4;
                floorClosingPrice = hours * 1000; // Saatlik ücret
            }
            
            const totalPrice = basePrice + floorClosingPrice;
            
            setWarningMessage(`🎉 Tüm katı kapatma rezervasyonu başarıyla oluşturuldu!\n\n📍 ${floorName} tamamen sizin grubunuz için ayrıldı.\n\n🪑 Ayrılan masalar: ${tableNames}\n\n👥 Toplam kapasite: ${floorTables.reduce((sum, t) => sum + t.capacity, 0)} kişi\n\n💰 Toplam ücret: ${totalPrice}₺`);
            setShowWarningModal(true);
        } else {
            // Normal özel rezervasyon - uygun masaları bul
            const suitableTables = findSuitableTables(personCount, finalSelectedFloor);
            
            if (suitableTables.tables.length === 0) {
                setWarningMessage('Uygun masa bulunamadı. Lütfen farklı bir tarih veya saat seçin.');
                setShowWarningModal(true);
                return;
            }
            
                    // Özel rezervasyon oluştur
        addSpecialReservation(suitableTables.tables, formData);
        
        // Başarı mesajı
        const tableNames = suitableTables.tables.map(t => getTableNumber(t.floor, t.tableIndex)).join(', ');
        const totalPrice = personCount * 100; // Kişi başına 100₺
        setWarningMessage(`🎉 Özel rezervasyon başarıyla oluşturuldu!\n\n👥 ${personCount} kişilik rezervasyonunuz şu masalar için ayrıldı:\n\n🪑 ${tableNames}\n\n📊 Toplam kapasite: ${suitableTables.totalCapacity} kişi\n\n💰 Toplam ücret: ${totalPrice}₺`);
        setShowWarningModal(true);
    }
    
    setShowSpecialReservationModal(false);
    setModalKey(prev => prev + 1);
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

    // Özel rezervasyonları grupla
    const groupSpecialReservations = (reservations) => {
        const specialGroups = {};
        const normalReservations = [];
        
        Object.entries(reservations).forEach(([reservationId, reservation]) => {
            if (reservation.specialReservation && reservation.relatedTables) {
                // Özel rezervasyonları grupla
                const groupKey = `${reservation.ad}_${reservation.soyad}_${reservation.telefon}_${reservation.tarih}_${reservation.saat}`;
                if (!specialGroups[groupKey]) {
                    specialGroups[groupKey] = {
                        id: reservationId || crypto.randomUUID(),
                        ad: reservation.ad,
                        soyad: reservation.soyad,
                        telefon: reservation.telefon,
                        email: reservation.email,
                        tarih: reservation.tarih,
                        saat: reservation.saat,
                        personCount: reservation.personCount,
                        reservationReason: reservation.reservationReason,
                        specialReservation: true,
                        relatedTables: reservation.relatedTables,
                        wholeFloorOption: reservation.wholeFloorOption,
                        selectedFloor: reservation.selectedFloor,
                        floorClosingHours: reservation.floorClosingHours,
                        floorClosingAllDay: reservation.floorClosingAllDay,
                        specialRequests: reservation.specialRequests,
                        createdAt: reservation.createdAt,
                        tableIds: []
                    };
                }
                if (reservation.tableId) {
                    specialGroups[groupKey].tableIds.push(getTableNameFromId(reservation.tableId));
                }
            } else {
                // Normal rezervasyonları ekle
                if (reservation.tableId) {
                    normalReservations.push({
                        id: reservationId || crypto.randomUUID(),
                        masaNo: getTableNameFromId(reservation.tableId),
                        ...reservation
                    });
                }
            }
        });
        
        // Özel rezervasyon gruplarını normal rezervasyon formatına çevir
        const specialReservations = Object.values(specialGroups).map(group => ({
            id: group.id || crypto.randomUUID(),
            masaNo: group.tableIds.join(', '),
            ...group
        }));
        
        return [...specialReservations, ...normalReservations];
    };

    // Rezervasyonları masa numarası ve rezervasyon verileriyle birlikte düzenle
    const reservationsList = groupSpecialReservations(actualReservations);



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
            backgroundColor: isDarkMode ? "#4a4a4a" : "#A294F9",
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
                <button 
                    onClick={handleAddSpecialReservation} 
                    style={{
                        ...styles.addButton,
                        backgroundColor: isDarkMode ? '#8B4513' : '#D2691E',
                        border: '2px solid #FFD700'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = isDarkMode ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 4px 12px rgba(0, 0, 0, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                    }}
                >
                    🎉 Özel Rezervasyonlar (10+ Kişi)
                </button>
                <button
                    onClick={() => setShowDeleteAllModal(true)}
                    style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        marginLeft: '10px'
                    }}
                    title="Rezervasyon verilerini temizle"
                >
                    🗑️ Temizle
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
                        <div key={res.id || crypto.randomUUID()} style={{
                            ...styles.card,
                            ...(res.specialReservation && {
                                backgroundColor: isDarkMode ? '#2d4a3e' : '#e8f5e8',
                                border: `2px solid ${isDarkMode ? '#4CAF50' : '#4CAF50'}`,
                                boxShadow: isDarkMode ? '0 4px 12px rgba(76, 175, 80, 0.3)' : '0 4px 12px rgba(76, 175, 80, 0.2)'
                            })
                        }}>
                            <div style={styles.cardHeader}>
                                <strong style={{ color: colors.text }}>
                                    {res.specialReservation ? (
                                        <>
                                            🎉 Özel Rezervasyon - {res.ad || ''} {res.soyad || res.soy || ''}
                                            {res.selectedFloor !== null && res.selectedFloor !== "" && (
                                                <span style={{ 
                                                    color: '#4CAF50', 
                                                    fontSize: '0.9em',
                                                    marginLeft: '10px',
                                                    fontWeight: 'normal'
                                                }}>
                                                    ({getFloorName(res.selectedFloor)})
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <>Masa {res.masaNo} - {res.ad || ''} {res.soyad || res.soy || ''}</>
                                    )}
                                </strong>
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
                                <p>👥 {res.personCount || res.kisiSayisi || '0'} Kişi</p>
                                {res.specialReservation && (
                                    <>
                                        <p style={{
                                            color: '#4CAF50',
                                            fontWeight: 'bold',
                                            fontSize: '14px',
                                            marginBottom: '5px'
                                        }}>
                                            🎉 Özel Rezervasyon
                                        </p>
                                        <p style={{
                                            color: colors.textSecondary,
                                            fontSize: '13px',
                                            marginBottom: '5px'
                                        }}>
                                            📋 Sebep: {res.reservationReason}
                                        </p>
                                        {res.selectedFloor !== null && res.selectedFloor !== "" && (
                                            <p style={{
                                                color: '#4CAF50',
                                                fontSize: '13px',
                                                marginBottom: '5px',
                                                fontWeight: 'bold'
                                            }}>
                                                🏢 Kat: {getFloorName(res.selectedFloor)}
                                            </p>
                                        )}
                                        <p style={{
                                            color: colors.textSecondary,
                                            fontSize: '13px',
                                            marginBottom: '5px'
                                        }}>
                                            🪑 Masalar: {res.masaNo}
                                        </p>
                                        {res.wholeFloorOption && (
                                            <p style={{
                                                color: '#FFD700',
                                                fontWeight: 'bold',
                                                fontSize: '13px',
                                                marginBottom: '5px'
                                            }}>
                                                🏢 Tüm Kat Kapatma
                                                {res.floorClosingAllDay ? ' (Tüm Gün)' : ` (${res.floorClosingHours} Saat)`}
                                            </p>
                                        )}
                                        {res.specialRequests && (
                                            <p style={{
                                                color: colors.textSecondary,
                                                fontSize: '12px',
                                                fontStyle: 'italic',
                                                marginBottom: '5px'
                                            }}>
                                                💬 Özel İstekler: {res.specialRequests}
                                            </p>
                                        )}
                                    </>
                                )}
                                {!res.specialReservation && res.not && <p>📝 Not: {res.not}</p>}
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
                                 backgroundColor: isDarkMode ? '#473653' : '#E5D9F2',
                                 padding: '10px',
                                 borderRadius: '8px',
                                 marginBottom: '15px',
                                 border: `1px solid ${colors.border}`
                             }}>
                                 <p style={{
                                     color: isDarkMode ? '#ffffff' : '#333333',
                                     fontSize: '14px',
                                     margin: 0,
                                     textAlign: 'center'
                                 }}>
                                     ⚠️ Masa kapasitesi kontrol edilecektir. Seçilen masanın kapasitesinden fazla kişi rezervasyonu yapılamaz.
                                 </p>
                             </div>
                             <div style={{
                                 display: 'grid',
                                 gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                                 gap: '10px',
                                 maxWidth: '400px',
                                 margin: '0 auto'
                             }}>
                                 {[0, 1, 2, 3, 4, 5, 6, 7].map((tableIndex) => {
                                     const tableNumber = getTableNumber(selectedFloor, tableIndex);
                                     const tableStatus = getTableStatus(tableNumber);
                                     const isReserved = tableStatus.status === 'reserved';
                                     const tableCapacity = getTableCapacity(tableNumber);
                                     
                                     return (
                                         <button
                                             key={tableIndex}
                                             onClick={() => handleTableSelection(selectedFloor, tableIndex)}
                                             style={{
                                                 background: isReserved ? '#ffc107' : colors.success,
                                                 color: isReserved ? '#212529' : 'white',
                                                 border: 'none',
                                                 padding: '15px 10px',
                                                 borderRadius: '8px',
                                                 cursor: 'pointer',
                                                 fontSize: '14px',
                                                 fontWeight: 'bold',
                                                 transition: 'all 0.3s ease',
                                                 position: 'relative'
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
                                             {/* Masa kapasitesi */}
                                             <div style={{
                                                 fontSize: '11px',
                                                 color: 'rgba(255,255,255,0.9)',
                                                 marginBottom: '3px',
                                                 fontWeight: 'bold',
                                                 backgroundColor: 'rgba(0,0,0,0.3)',
                                                 padding: '2px 4px',
                                                 borderRadius: '3px'
                                             }}>
                                                 {tableCapacity} Kişilik
                                             </div>
                                             <div>{tableNumber}</div>
                                             {isReserved && (
                                                 <div style={{
                                                     fontSize: '10px',
                                                     marginTop: '2px',
                                                     fontWeight: 'normal'
                                                 }}>
                                                     {tableStatus.reservations.map((res, index) => (
                                                         <div key={`${tableNumber}-${index}-${res.ad}-${res.saat}`} style={{ marginBottom: '1px' }}>
                                                             {res.ad} {res.soyad} - {res.saat}
                                                         </div>
                                                     ))}
                                                 </div>
                                             )}
                                         </button>
                                     );
                                 })}
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
                 key={modalKey}
                 visible={showReservationModal}
                 masaNo={selectedTable}
                 onClose={handleReservationClose}
                 onSubmit={handleReservationSubmit}
                 defaultDate={getTodayDate()}
                 existingReservations={selectedTable ? getTableStatus(selectedTable).reservations : []}
                 shouldClearForm={false}
             />

             {/* Özel Rezervasyon Modal */}
             <SpecialReservationModal
                 key={modalKey}
                 visible={showSpecialReservationModal}
                 onClose={handleSpecialReservationClose}
                 onSubmit={handleSpecialReservationSubmit}
                 defaultDate={getTodayDate()}
                 existingReservations={actualReservations} // Tüm rezervasyonları gönder
                 shouldClearForm={false}
             />

             {/* Uyarı Modal */}
             <WarningModal
                 visible={showWarningModal}
                 message={warningMessage}
                 onClose={() => setShowWarningModal(false)}
             />

             {/* Tüm Rezervasyonları Silme Onay Modalı */}
             {showDeleteAllModal && (
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
                         <div style={{
                             textAlign: 'center',
                             marginBottom: '25px'
                         }}>
                             <div style={{
                                 fontSize: '48px',
                                 marginBottom: '15px'
                             }}>
                                 ⚠️
                             </div>
                             <h3 style={{
                                 color: colors.text,
                                 marginBottom: '10px',
                                 fontSize: '1.3rem'
                             }}>
                                 Dikkat!
                             </h3>
                             <p style={{
                                 color: colors.textSecondary,
                                 lineHeight: '1.5',
                                 fontSize: '1rem'
                             }}>
                                 Gerçekten bütün rezervasyonları silmek istiyor musunuz?<br/>
                                 <strong>Bu işlem geri alınamaz.</strong>
                             </p>
                         </div>
                         <div style={{
                             display: 'flex',
                             gap: '15px',
                             justifyContent: 'center'
                         }}>
                             <button
                                 onClick={() => {
                                     localStorage.removeItem('reservations');
                                     setShowDeleteAllModal(false);
                                     window.location.reload();
                                 }}
                                 style={{
                                     background: '#dc3545',
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
                                     e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)';
                                 }}
                                 onMouseLeave={(e) => {
                                     e.target.style.transform = 'translateY(0)';
                                     e.target.style.boxShadow = 'none';
                                 }}
                             >
                                 Evet, Sil
                             </button>
                             <button
                                 onClick={() => setShowDeleteAllModal(false)}
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
                                 Hayır, İptal
                             </button>
                         </div>
                     </div>
                 </div>
             )}
        </div>
    );
};

export default ReservationsPage;
