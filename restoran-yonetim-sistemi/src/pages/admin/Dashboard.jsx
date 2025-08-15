import React, { useContext, useState, useEffect, useMemo } from "react";
import { TableContext } from "../../context/TableContext";
import { ThemeContext } from "../../context/ThemeContext";
import ReservationModal from "../../components/reservations/ReservationModal";
import SuccessNotification from "../../components/reservations/SuccessNotification";
import WarningModal from "../../components/common/WarningModal";
import TableManagementModal from "../../components/tables/TableManagementModal";
import "./Dashboard.css";





const Dashboard = () => {
  const { tableStatus, orders, reservations, addReservation, removeReservation, updateTableStatus, tables, salons, loadTablesAndSalons } = useContext(TableContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [showReservationMode, setShowReservationMode] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showTableDetailsModal, setShowTableDetailsModal] = useState(false);
  const [selectedTableDetails, setSelectedTableDetails] = useState(null);
  // Backend salonları ile çalış: seçili salon
  const derivedSalons = useMemo(() => {
    if (Array.isArray(salons) && salons.length > 0) return salons;
    const map = new Map();
    (tables || []).forEach(t => {
      const s = t?.salon || { id: t?.salonId, name: t?.salonName };
      if (s?.id && !map.has(s.id)) map.set(s.id, { id: s.id, name: s.name || `Salon ${s.id}` });
    });
    return Array.from(map.values());
  }, [salons, tables]);

  const initialSalonId = useMemo(() => (derivedSalons.length > 0 ? derivedSalons[0].id : null), [derivedSalons]);
  const [selectedSalonId, setSelectedSalonId] = useState(initialSalonId);
  useEffect(() => {
    if (!selectedSalonId && derivedSalons.length > 0) setSelectedSalonId(derivedSalons[0].id);
  }, [derivedSalons]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [showTableLayoutMode, setShowTableLayoutMode] = useState(false);
  const [showFloorLayoutMode, setShowFloorLayoutMode] = useState(false);
  // Yerel düzenleme durumları korunuyor, fakat görünüm backend'den geliyor
  const [tableCounts, setTableCounts] = useState({});
  const [floors, setFloors] = useState([]);
  const [showDeleteFloorModal, setShowDeleteFloorModal] = useState(false);
  const [floorToDelete, setFloorToDelete] = useState(null);
  const [showDeleteTableModal, setShowDeleteTableModal] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);
  const [editingFloor, setEditingFloor] = useState(null);
  const [floorNames, setFloorNames] = useState({
    0: "Zemin",
    1: "Kat 1",
    2: "Kat 2"
  });
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [modalKey, setModalKey] = useState(0);
  const [restaurantName, setRestaurantName] = useState(localStorage.getItem('restaurantName') || 'Restoran Yönetim Sistemi');
  const [showEditReservationModal, setShowEditReservationModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [editReservationFormData, setEditReservationFormData] = useState({});
  const [showDeleteReservationModal, setShowDeleteReservationModal] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState(null);
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [newTableCapacity, setNewTableCapacity] = useState(4);
  const [showTableManagementModal, setShowTableManagementModal] = useState(false);
  const [selectedTableForManagement, setSelectedTableForManagement] = useState(null);

  // Restoran ismini localStorage'dan al
  useEffect(() => {
    const name = localStorage.getItem('restaurantName') || 'Restoran Yönetim Sistemi';
    setRestaurantName(name);
  }, []);

  // Restoran ismi değişikliklerini dinle
  useEffect(() => {
    const handleRestaurantNameChange = (event) => {
      setRestaurantName(event.detail.name);
    };

    window.addEventListener('restaurantNameChanged', handleRestaurantNameChange);
    return () => window.removeEventListener('restaurantNameChanged', handleRestaurantNameChange);
  }, []);



  // Bugünün tarihini al (sadece gün-ay formatında)
  const getTodayDate = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}`;
  };

  // Kat adını döndüren fonksiyon
  const getFloorName = (floorNumber) => {
    // Yönetim başlığında backend salon adını göster
    const salon = (derivedSalons || []).find(s => String(s.id) === String(selectedSalonId));
    return salon?.name || (floorNumber === 0 ? "Zemin" : `Kat ${floorNumber}`);
  };

  // Kat ismi düzenleme fonksiyonu
  const handleFloorNameEdit = (floorNumber) => {
    setEditingFloor(floorNumber);
  };

  // Kat ismi kaydetme fonksiyonu
  const handleFloorNameSave = (floorNumber, newName) => {
    if (newName.trim()) {
      setFloorNames(prev => ({
        ...prev,
        [floorNumber]: newName.trim()
      }));
    }
    setEditingFloor(null);
  };

  // Kat ismi iptal etme fonksiyonu
  const handleFloorNameCancel = () => {
    setEditingFloor(null);
  };

  // Masa numarasını oluşturan fonksiyon
  // Admin görsel etiketi: salon sırasına göre Z/A/B + tableNumber
  const getSalonIndexById = (sid) => (derivedSalons || []).findIndex(s => String(s.id) === String(sid));
  const getAdminPrefixByIndex = (idx) => (idx <= 0 ? 'Z' : String.fromCharCode(65 + (idx - 1)));
  const getAdminDisplayFor = (table) => {
    const tableNum = table?.tableNumber ?? table?.id;
    const salonId = table?.salon?.id ?? table?.salonId;
    const idx = getSalonIndexById(salonId);
    const prefix = getAdminPrefixByIndex(idx);
    return `${prefix}${tableNum}`;
  };

  // Masa kapasitelerini yöneten state
  const [tableCapacities, setTableCapacities] = useState(() => {
    // localStorage'dan mevcut kapasiteleri al
    const savedCapacities = JSON.parse(localStorage.getItem('tableCapacities') || '{}');

    // Eğer localStorage'da kapasite yoksa, mevcut masalar için rastgele atama yap
    if (Object.keys(savedCapacities).length === 0) {
      const capacities = {};
      for (let floor = 0; floor <= 2; floor++) {
        for (let i = 0; i < 8; i++) {
          const tableId = getTableNumber(floor, i);
          capacities[tableId] = Math.floor(Math.random() * 4) + 2; // 2-6 kişilik arası rastgele
        }
      }
      // localStorage'a kaydet
      localStorage.setItem('tableCapacities', JSON.stringify(capacities));
      return capacities;
    }

    return savedCapacities;
  });

  // Backend'den gelen masaları seçili salona göre göster
  const displayTables = useMemo(() => {
    if (!Array.isArray(tables) || tables.length === 0) return [];
    const filtered = selectedSalonId ? tables.filter(t => (t?.salon?.id ?? t?.salonId) === selectedSalonId) : tables;
    return filtered.map(t => ({
      id: String(t?.tableNumber ?? t?.id),
      displayNumber: getAdminDisplayFor(t),
      capacity: t?.capacity || 4,
      backendId: t?.id,
      salonId: t?.salon?.id ?? t?.salonId
    }));
  }, [tables, selectedSalonId, derivedSalons]);

  // Masa kapasitelerini localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('tableCapacities', JSON.stringify(tableCapacities));
  }, [tableCapacities]);

  const handleReservationClick = (tableId) => {
    setSelectedTable(tableId);
    setShowReservationModal(true);
  };

  const handleTableClick = (table) => {
    if (showReservationMode && table.status === 'empty') {
      // Rezervasyon modunda boş masaya tıklandığında rezervasyon modalını aç
      setSelectedTable(table.id);
      setShowReservationModal(true);
    } else if (showTableLayoutMode) {
      // Masa düzeni modunda masa yönetimi modalını aç
      const tableData = tables?.find(t => t.id === table.id) || table;
      setSelectedTableForManagement({
        ...tableData,
        name: tableData.displayNumber || table.name || `Masa ${table.id}`,
        capacity: tableData.capacity || 4
      });
      setShowTableManagementModal(true);
    } else {
      // Normal modda masa detaylarını göster
      // Eğer masada rezervasyon varsa, rezervasyon detaylarını göster
      const tableReservations = Object.values(reservations).filter(res => res.tableId === table.id);
      if (tableReservations.length > 0) {
        // Masada rezervasyon varsa, rezervasyon detaylarını göster
        setSelectedTableDetails({ ...table, status: 'reserved' });
        setShowTableDetailsModal(true);
      } else {
        // Masada rezervasyon yoksa, normal masa detaylarını göster
        setSelectedTableDetails(table);
        setShowTableDetailsModal(true);
      }
    }
  };

  const handleReservationSubmit = (formData) => {
    // 3 saat kısıtlamasını kontrol et
    const tableReservations = Object.values(reservations).filter(res => res.tableId === selectedTable);

    if (tableReservations.length > 0) {
      const newTimeHour = parseInt(formData.saat.split(':')[0]);

      for (const reservation of tableReservations) {
        const existingTimeHour = parseInt(reservation.saat.split(':')[0]);
        const timeDifference = Math.abs(newTimeHour - existingTimeHour);

        if (timeDifference < 3) {
          setWarningMessage('Bu masaya 3 saat arayla rezervasyon yapabilirsiniz. Mevcut rezervasyonlardan en az 3 saat sonra rezervasyon yapabilirsiniz.');
          setShowWarningModal(true);
          return;
        }
      }
    }

    addReservation(selectedTable, formData);
    setShowReservationModal(false);
    setSelectedTable(null);
    setShowReservationMode(false); // Rezervasyon modunu kapat
    setModalKey(prev => prev + 1); // Modal key'ini artırarak form verilerini temizle

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
  const handleReservationDelete = (reservationToDelete) => {
    // Rezervasyonu bul ve sil
    const reservationEntry = Object.entries(reservations).find(([id, reservation]) =>
      reservation.id === reservationToDelete.id
    );

    if (reservationEntry) {
      const [reservationId] = reservationEntry;
      removeReservation(reservationId);
      setShowDeleteReservationModal(false);
      setReservationToDelete(null);
    }
  };

  // Rezervasyon düzenleme fonksiyonu
  const handleEditReservation = (reservation) => {
    // Önce rezervasyon detayları modalını kapat
    setShowTableDetailsModal(false);
    setSelectedTableDetails(null);

    // Sonra düzenleme modalını aç
    setEditingReservation(reservation);
    setEditReservationFormData({
      ad: reservation.ad,
      soyad: reservation.soyad,
      telefon: reservation.telefon,
      email: reservation.email,
      tarih: reservation.tarih,
      saat: reservation.saat,
      kisiSayisi: reservation.kisiSayisi,
      not: reservation.not || ""
    });
    setShowEditReservationModal(true);
  };

  // Rezervasyon düzenleme kaydetme fonksiyonu
  const handleEditReservationSubmit = (formData) => {
    if (editingReservation) {
      // Rezervasyonu bul ve güncelle
      const reservationEntry = Object.entries(reservations).find(([id, reservation]) =>
        reservation.id === editingReservation.id
      );

      if (reservationEntry) {
        const [reservationId] = reservationEntry;
        // Mevcut rezervasyonu sil
        removeReservation(reservationId);
        // Yeni rezervasyonu ekle
        addReservation(editingReservation.tableId, formData);
        setShowEditReservationModal(false);
        setEditingReservation(null);
        setEditReservationFormData({});

        // Başarı bildirimi göster
        setSuccessData({ ...formData, masaNo: editingReservation.tableId, isEdit: true });
        setShowSuccess(true);
      }
    }
  };

  // Rezervasyon düzenleme modalını kapatma fonksiyonu
  const handleEditReservationClose = () => {
    setShowEditReservationModal(false);
    setEditingReservation(null);
    setEditReservationFormData({});
  };

  // Rezervasyon silme onay modalını açma fonksiyonu
  const handleDeleteReservationClick = (reservation) => {
    setReservationToDelete(reservation);
    setShowDeleteReservationModal(true);
  };

  // Rezervasyon silme onay modalını kapatma fonksiyonu
  const handleDeleteReservationClose = () => {
    setShowDeleteReservationModal(false);
    setReservationToDelete(null);
  };



  const calculateTotal = (order) => {
    return Object.values(order).reduce((total, item) => {
      return total + (item.price * item.count);
    }, 0);
  };

  // İstatistikleri hesapla - Yeni kat sistemi ile
  const backendTablesForStats = useMemo(() => {
    const list = selectedSalonId ? (tables || []).filter(t => (t?.salon?.id ?? t?.salonId) === selectedSalonId) : (tables || []);
    return list;
  }, [tables, selectedSalonId]);
  const totalTables = backendTablesForStats.length;
  const emptyTables = backendTablesForStats.filter(t => String(t?.status?.name ?? t?.statusName ?? '').toLowerCase() === 'available').length;
  const occupiedTables = backendTablesForStats.filter(t => String(t?.status?.name ?? t?.statusName ?? '').toLowerCase() === 'occupied').length;
  const reservedTables = backendTablesForStats.filter(t => String(t?.status?.name ?? t?.statusName ?? '').toLowerCase() === 'reserved').length;

  // Waiter ile aynı status sistemi
  const statusInfo = {
    "empty": { text: "Boş", color: "#4caf50", textColor: "#fff" },
    "bos": { text: "Boş", color: "#4caf50", textColor: "#fff" },
    "occupied": { text: "Dolu", color: "#dc3545", textColor: "#fff" },
    "dolu": { text: "Dolu", color: "#dc3545", textColor: "#fff" },
    "reserved": { text: "Rezerve", color: "#ffc107", textColor: "#212529" },
    "reserved-future": { text: "Rezerve", color: "#4caf50", textColor: "#fff" }, // Uzak rezervasyon için yeşil
    "reserved-special": { text: "Özel Rezerve", color: "#ffc107", textColor: "#212529" }, // Özel rezervasyon için sarı
  };

  const getStatus = (tableId) => {
    const status = tableStatus[tableId] || "empty";

    if (status === 'reserved') {
      const reservation = Object.values(reservations).find(res => res.tableId === tableId);
      if (reservation) {
        const reservationTime = new Date(`${reservation.tarih}T${reservation.saat}`);
        const now = new Date();
        const oneHour = 60 * 60 * 1000;
        const fiftyNineMinutes = 59 * 60 * 1000;

        // Rezervasyon geçmiş mi kontrol et
        if (reservationTime < now) {
          // Rezervasyon geçmiş, masayı boş yap
          console.log(`Reservation for table ${tableId} has passed, marking as empty`);
          updateTableStatus(tableId, 'empty');
          return statusInfo["empty"];
        }

        // Özel rezervasyon kontrolü
        if (reservation.specialReservation) {
          if (reservationTime > now && (reservationTime.getTime() - now.getTime()) <= fiftyNineMinutes) {
            return statusInfo["reserved-special"]; // 59 dakika içinde sarı
          } else if (reservationTime > now && (reservationTime.getTime() - now.getTime()) > oneHour) {
            return statusInfo["reserved-future"]; // 1 saatten uzak yeşil
          }
        } else {
          // Normal rezervasyon kontrolü
          if (reservationTime > now && (reservationTime.getTime() - now.getTime()) > oneHour) {
            return statusInfo["reserved-future"];
          }
        }
      } else {
        // Rezervasyon bulunamadı ama masa hala reserved olarak işaretli
        console.log(`No reservation found for table ${tableId}, marking as empty`);
        updateTableStatus(tableId, 'empty');
        return statusInfo["empty"];
      }
    }

    return statusInfo[status] || statusInfo["empty"];
  };

  // Periyodik olarak durumu yeniden render etmek için
  const [, setForceRender] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setForceRender(prev => prev + 1);
    }, 60000); // Her dakika kontrol et
    return () => clearInterval(interval);
  }, []);

  // Masa ekleme fonksiyonu
  const addTable = () => {
    setShowAddTableModal(true);
  };

  // Masa ekleme modalını kapatma fonksiyonu
  const handleAddTableClose = () => {
    setShowAddTableModal(false);
    setNewTableCapacity(4);
  };

  // Masa yönetimi modalını kapatma fonksiyonu
  const handleTableManagementClose = () => {
    setShowTableManagementModal(false);
    setSelectedTableForManagement(null);
  };

  // Masa ekleme onaylama fonksiyonu
  const handleAddTableConfirm = () => {
    const newTableIndex = tableCounts[selectedFloor];
    const newTableId = getTableNumber(selectedFloor, newTableIndex);

    // Yeni masayı ekle
    setTableCounts(prev => ({
      ...prev,
      [selectedFloor]: prev[selectedFloor] + 1
    }));

    // Yeni masanın kapasitesini kaydet
    const newCapacities = {
      ...tableCapacities,
      [newTableId]: newTableCapacity
    };
    setTableCapacities(newCapacities);
    localStorage.setItem('tableCapacities', JSON.stringify(newCapacities));

    setShowAddTableModal(false);
    setNewTableCapacity(4);
  };

  // Kat ekleme fonksiyonu
  const addFloor = () => {
    const newFloorNumber = Math.max(...floors) + 1;
    setFloors(prev => [...prev, newFloorNumber]);
    setTableCounts(prev => ({
      ...prev,
      [newFloorNumber]: 0 // Yeni katta başlangıçta 0 masa
    }));
    setFloorNames(prev => ({
      ...prev,
      [newFloorNumber]: `Kat ${newFloorNumber}`
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
      setFloorNames(prev => {
        const newNames = { ...prev };
        delete newNames[floorToDelete];
        return newNames;
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

      // Silinen masanın kapasitesini de kaldır
      const newCapacities = { ...tableCapacities };
      delete newCapacities[tableToDelete];
      setTableCapacities(newCapacities);
      localStorage.setItem('tableCapacities', JSON.stringify(newCapacities));

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
            {(derivedSalons.find(s => String(s.id) === String(selectedSalonId))?.name || 'Salon')} - Masa Seçimi
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
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "1.5rem"
          }}>
            {displayTables.map((table) => {
              const status = getStatus(table.id);
              const order = orders[table.id] || {};
              const tableReservations = Object.values(reservations).filter(res => res.tableId === table.id);

              return (
                <div
                  key={table.id || crypto.randomUUID()}
                  style={{
                    backgroundColor: status.color,
                    color: status.textColor,
                    height: "140px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "12px",
                    cursor: (status.text === 'Dolu' || status.text === 'Rezerve' || tableReservations.length > 0 || (showReservationMode && status.text === 'Boş')) ? 'pointer' : 'default',
                    userSelect: "none",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    position: 'relative'
                  }}
                  onClick={() => handleTableClick({ id: table.id, name: table.displayNumber, status: tableStatus[table.id] || 'empty', orderCount: Object.keys(order).length, reservation: tableReservations[0] })}
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

                  {/* Masa kapasitesi */}
                  <div style={{
                    fontSize: "0.8rem",
                    color: "rgba(255,255,255,0.7)",
                    marginBottom: "2px",
                    fontWeight: "400"
                  }}>
                    {table.capacity} Kişilik
                  </div>
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
                  {tableReservations.length > 0 && (
                    <div style={{
                      fontSize: '9px',
                      marginTop: '4px',
                      opacity: 0.8,
                      textAlign: 'center',
                      lineHeight: '1.2'
                    }}>
                      {tableReservations.map((res, index) => (
                        <div key={index} style={{ marginBottom: '1px' }}>
                          {res.ad} {res.soyad} - {res.saat}
                        </div>
                      ))}
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
          {(derivedSalons || []).map((salon) => (
            <div
              key={salon.id}
              onClick={() => setSelectedSalonId(salon.id)}
              style={{
                padding: "1rem",
                marginBottom: "1rem",
                borderRadius: "8px",
                backgroundColor: selectedSalonId === salon.id ? (isDarkMode ? "#007bff" : "#513653") : (isDarkMode ? "#4a4a4a" : "#e9ecef"),
                color: selectedSalonId === salon.id ? "white" : (isDarkMode ? "#e0e0e0" : "#495057"),
                textAlign: "center",
                cursor: "pointer",
                fontWeight: "bold",
                userSelect: "none",
                transition: "background-color 0.2s ease",
                position: 'relative'
              }}
            >
              <div style={{ cursor: 'pointer' }}>
                {editingFloor === salon.id ? (
                  <input
                    type="text"
                    defaultValue={salon.name}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'inherit',
                      fontSize: 'inherit',
                      fontWeight: 'inherit',
                      textAlign: 'center',
                      width: '100%',
                      outline: 'none'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleFloorNameSave(salon.id, e.target.value);
                      } else if (e.key === 'Escape') {
                        handleFloorNameCancel();
                      }
                    }}
                    onBlur={(e) => handleFloorNameSave(salon.id, e.target.value)}
                    autoFocus
                  />
                ) : (
                  salon.name
                )}
              </div>

              {/* Kat düzeni modunda silme butonu */}
              {showFloorLayoutMode && (derivedSalons || []).length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteFloorModal(salon.id);
                  }}
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    background: 'rgba(255,255,255,0.2)',
                    color: selectedSalonId === salon.id ? 'white' : (isDarkMode ? '#e0e0e0' : '#495057'),
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
                    transition: 'all 0.3s ease',
                    zIndex: 10
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255,0,0,0.3)';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.2)';
                    e.target.style.color = selectedFloor === floor ? 'white' : (isDarkMode ? '#e0e0e0' : '#495057');
                  }}
                  title={`${salon.name} Katını Sil`}
                >
                  ✕
                </button>
              )}

              {/* Kat düzeni modunda düzenleme butonu (kalem işareti) */}
              {showFloorLayoutMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFloorNameEdit(salon.id);
                  }}
                  style={{
                    position: 'absolute',
                    bottom: '5px',
                    right: '5px',
                    background: 'rgba(255,255,255,0.2)',
                    color: selectedSalonId === salon.id ? 'white' : (isDarkMode ? '#e0e0e0' : '#495057'),
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
                    transition: 'all 0.3s ease',
                    zIndex: 10
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(0,123,255,0.3)';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.2)';
                    e.target.style.color = selectedFloor === floor ? 'white' : (isDarkMode ? '#e0e0e0' : '#495057');
                  }}
                  title={`${salon.name} İsmini Düzenle`}
                >
                  ✏️
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
          key={modalKey}
          visible={showReservationModal}
          masaNo={selectedTable}
          onClose={handleReservationClose}
          onSubmit={handleReservationSubmit}
          defaultDate={getTodayDate()}
          shouldClearForm={false}
        />

        {/* Uyarı Modal */}
        <WarningModal
          visible={showWarningModal}
          message={warningMessage}
          onClose={() => setShowWarningModal(false)}
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

              {/* Rezervasyon Yap Butonu - Tüm masalar için */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '2px solid #473653'
              }}>
                <button
                  onClick={() => {
                    setSelectedTable(selectedTableDetails.id);
                    setShowTableDetailsModal(false);
                    setShowReservationModal(true);
                  }}
                  style={{
                    background: '#4caf50',
                    color: 'white',
                    border: 'none',
                    padding: '15px 30px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#45a049';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#4caf50';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.3)';
                  }}
                >
                  📅 Rezervasyon Yap
                </button>
              </div>

              {selectedTableDetails.status === 'reserved' && (
                <div>
                  <h3 style={{ color: '#ffffff', marginBottom: '15px' }}>Rezervasyon Detayları:</h3>

                  {/* Mevcut rezervasyonları göster */}
                  {Object.values(reservations).filter(res => res.tableId === selectedTableDetails.id).map((reservation, index) => (
                    <div key={index} style={{
                      background: 'rgba(255,255,255,0.1)',
                      padding: '15px',
                      borderRadius: '8px',
                      marginBottom: '15px',
                      position: 'relative'
                    }}>
                      {/* Düzenleme butonu */}
                      <button
                        onClick={() => handleEditReservation(reservation)}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'rgba(255,255,255,0.2)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '30px',
                          height: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          color: '#ffffff',
                          fontSize: '14px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(255,255,255,0.3)';
                          e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(255,255,255,0.2)';
                          e.target.style.transform = 'scale(1)';
                        }}
                        title="Rezervasyonu Düzenle"
                      >
                        ✏️
                      </button>

                      {/* Silme butonu */}
                      <button
                        onClick={() => handleDeleteReservationClick(reservation)}
                        style={{
                          position: 'absolute',
                          top: '45px',
                          right: '10px',
                          background: 'rgba(255,0,0,0.2)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '30px',
                          height: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          color: '#ffffff',
                          fontSize: '14px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(255,0,0,0.3)';
                          e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(255,0,0,0.2)';
                          e.target.style.transform = 'scale(1)';
                        }}
                        title="Rezervasyonu Sil"
                      >
                        🗑️
                      </button>

                      <p style={{ color: '#ffffff', margin: '5px 0' }}>
                        <strong>Müşteri:</strong> {reservation.ad} {reservation.soyad}
                      </p>
                      <p style={{ color: '#ffffff', margin: '5px 0' }}>
                        <strong>Tarih:</strong> {reservation.tarih}
                      </p>
                      <p style={{ color: '#ffffff', margin: '5px 0' }}>
                        <strong>Saat:</strong> {reservation.saat}
                      </p>
                      <p style={{ color: '#ffffff', margin: '5px 0' }}>
                        <strong>Kişi Sayısı:</strong> {reservation.kisiSayisi}
                      </p>
                      {reservation.not && (
                        <p style={{ color: '#ffffff', margin: '5px 0' }}>
                          <strong>Not:</strong> {reservation.not}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rezervasyon Düzenleme Modal */}
        {showEditReservationModal && editingReservation && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 10001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              backgroundColor: '#513653',
              padding: '2rem',
              borderRadius: '15px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              maxWidth: '500px',
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
                  ✏️ Rezervasyon Düzenle
                </h2>
                <button
                  onClick={handleEditReservationClose}
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

              <form onSubmit={(e) => {
                e.preventDefault();
                handleEditReservationSubmit(editReservationFormData);
              }}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', color: '#ffffff', marginBottom: '5px', fontWeight: '500' }}>
                    Ad:
                  </label>
                  <input
                    type="text"
                    value={editReservationFormData.ad || ''}
                    onChange={(e) => setEditReservationFormData(prev => ({ ...prev, ad: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #473653',
                      backgroundColor: '#32263A',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', color: '#ffffff', marginBottom: '5px', fontWeight: '500' }}>
                    Soyad:
                  </label>
                  <input
                    type="text"
                    value={editReservationFormData.soyad || ''}
                    onChange={(e) => setEditReservationFormData(prev => ({ ...prev, soyad: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #473653',
                      backgroundColor: '#32263A',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', color: '#ffffff', marginBottom: '5px', fontWeight: '500' }}>
                    Telefon:
                  </label>
                  <input
                    type="tel"
                    value={editReservationFormData.telefon || ''}
                    onChange={(e) => setEditReservationFormData(prev => ({ ...prev, telefon: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #473653',
                      backgroundColor: '#32263A',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', color: '#ffffff', marginBottom: '5px', fontWeight: '500' }}>
                    Email (İsteğe bağlı):
                  </label>
                  <input
                    type="email"
                    value={editReservationFormData.email || ''}
                    onChange={(e) => setEditReservationFormData(prev => ({ ...prev, email: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #473653',
                      backgroundColor: '#32263A',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', color: '#ffffff', marginBottom: '5px', fontWeight: '500' }}>
                    Tarih:
                  </label>
                  <input
                    type="date"
                    value={editReservationFormData.tarih || ''}
                    onChange={(e) => setEditReservationFormData(prev => ({ ...prev, tarih: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #473653',
                      backgroundColor: '#32263A',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', color: '#ffffff', marginBottom: '5px', fontWeight: '500' }}>
                    Saat:
                  </label>
                  <input
                    type="time"
                    value={editReservationFormData.saat || ''}
                    onChange={(e) => setEditReservationFormData(prev => ({ ...prev, saat: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #473653',
                      backgroundColor: '#32263A',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', color: '#ffffff', marginBottom: '5px', fontWeight: '500' }}>
                    Kişi Sayısı:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editReservationFormData.kisiSayisi || ''}
                    onChange={(e) => setEditReservationFormData(prev => ({ ...prev, kisiSayisi: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #473653',
                      backgroundColor: '#32263A',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', color: '#ffffff', marginBottom: '5px', fontWeight: '500' }}>
                    Not (İsteğe bağlı):
                  </label>
                  <textarea
                    value={editReservationFormData.not || ''}
                    onChange={(e) => setEditReservationFormData(prev => ({ ...prev, not: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #473653',
                      backgroundColor: '#32263A',
                      color: '#ffffff',
                      fontSize: '14px',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                    placeholder="Özel istekler veya notlar..."
                  />
                </div>

                <div style={{
                  display: 'flex',
                  gap: '15px',
                  justifyContent: 'center'
                }}>
                  <button
                    type="button"
                    onClick={handleEditReservationClose}
                    style={{
                      background: '#473653',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 25px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      fontWeight: '500'
                    }}
                  >
                    ❌ İptal
                  </button>
                  <button
                    type="submit"
                    style={{
                      background: '#4caf50',
                      color: 'white',
                      border: 'none',
                      padding: '12px 25px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      fontWeight: '500'
                    }}
                  >
                    ✅ Kaydet
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Rezervasyon Silme Onay Modal */}
        {showDeleteReservationModal && reservationToDelete && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              backgroundColor: '#513653',
              padding: '2rem',
              borderRadius: '15px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              maxWidth: '400px',
              width: '90%',
              textAlign: 'center',
              border: '2px solid #473653'
            }}>
              <h3 style={{
                color: '#ffffff',
                marginBottom: '20px',
                fontSize: '1.5rem'
              }}>
                🗑️ Rezervasyon Silme Onayı
              </h3>
              <p style={{
                color: '#cccccc',
                marginBottom: '30px',
                fontSize: '1rem'
              }}>
                <strong>{reservationToDelete.ad} {reservationToDelete.soyad}</strong> adlı müşterinin rezervasyonunu silmek istediğinizden emin misiniz?
                <br />
                <br />
                <strong>Tarih:</strong> {reservationToDelete.tarih}
                <br />
                <strong>Saat:</strong> {reservationToDelete.saat}
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
                  onClick={() => handleReservationDelete(reservationToDelete)}
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
                  onClick={handleDeleteReservationClose}
                  style={{
                    background: '#473653',
                    color: '#ffffff',
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

        {/* Masa Ekleme Modal */}
        {showAddTableModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              backgroundColor: isDarkMode ? '#513653' : '#ffffff',
              padding: '2rem',
              borderRadius: '15px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              maxWidth: '400px',
              width: '90%',
              textAlign: 'center',
              border: `2px solid ${isDarkMode ? '#473653' : '#e0e0e0'}`
            }}>
              <h3 style={{
                color: isDarkMode ? '#ffffff' : '#333333',
                marginBottom: '20px',
                fontSize: '1.5rem'
              }}>
                🍽️ Yeni Masa Ekle
              </h3>
              <p style={{
                color: isDarkMode ? '#cccccc' : '#666666',
                marginBottom: '20px',
                fontSize: '1rem'
              }}>
                Yeni masanın kaç kişilik olacağını seçin:
              </p>
              <div style={{
                display: 'flex',
                gap: '10px',
                justifyContent: 'center',
                marginBottom: '30px',
                flexWrap: 'wrap'
              }}>
                {[2, 3, 4, 5, 6, 8, 10].map(capacity => (
                  <button
                    key={capacity}
                    onClick={() => setNewTableCapacity(capacity)}
                    style={{
                      background: newTableCapacity === capacity
                        ? (isDarkMode ? '#A294F9' : '#A294F9')
                        : (isDarkMode ? '#473653' : '#f5f5f5'),
                      color: newTableCapacity === capacity
                        ? '#ffffff'
                        : (isDarkMode ? '#ffffff' : '#333333'),
                      border: `2px solid ${newTableCapacity === capacity
                        ? '#A294F9'
                        : (isDarkMode ? '#473653' : '#e0e0e0')}`,
                      padding: '10px 15px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease',
                      minWidth: '50px'
                    }}
                    onMouseEnter={(e) => {
                      if (newTableCapacity !== capacity) {
                        e.target.style.background = isDarkMode ? '#53364D' : '#E5D9F2';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (newTableCapacity !== capacity) {
                        e.target.style.background = isDarkMode ? '#473653' : '#f5f5f5';
                      }
                    }}
                  >
                    {capacity}
                  </button>
                ))}
              </div>
              <div style={{
                display: 'flex',
                gap: '15px',
                justifyContent: 'center'
              }}>
                <button
                  onClick={handleAddTableConfirm}
                  style={{
                    background: '#4CAF50',
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
                  Masa Ekle
                </button>
                <button
                  onClick={handleAddTableClose}
                  style={{
                    background: isDarkMode ? '#473653' : '#f5f5f5',
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
                  İptal
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Masa Yönetimi Modalı */}
      <TableManagementModal
        show={showTableManagementModal}
        onHide={handleTableManagementClose}
        table={selectedTableForManagement}
      />
    </>
  );
};

export default Dashboard;
