import React, { useContext, useState, useEffect, useMemo } from "react";
import { getTableNumber } from "../../utils/tableUtils";
import { TableContext } from "../../context/TableContext";
import { ThemeContext } from "../../context/ThemeContext";
import ReservationModal from "../../components/reservations/ReservationModal";
import SuccessNotification from "../../components/reservations/SuccessNotification";
import WarningModal from "../../components/common/WarningModal";
import TableManagementModal from "../../components/tables/TableManagementModal";
import "./Dashboard.css";
import { settingsService } from '../../services/settingsService';
import { diningTableService } from '../../services/diningTableService';
import { salonService } from '../../services/salonService';
import { useNavigate } from 'react-router-dom';





const Dashboard = () => {
  const { tableStatus, orders, reservations, addReservation, removeReservation, updateTableStatus, tables, salons, tableStatuses, activeTableIds, loadTablesAndSalons, loadTableStatuses, createTable, deleteTable: deleteTableFromCtx, deleteTableForce } = useContext(TableContext);
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
  const [newTableNumber, setNewTableNumber] = useState('');
  const [showTableManagementModal, setShowTableManagementModal] = useState(false);
  const [selectedTableForManagement, setSelectedTableForManagement] = useState(null);
  const navigate = useNavigate();
  const [showAddSalonModal, setShowAddSalonModal] = useState(false);
  const [showEditSalonModal, setShowEditSalonModal] = useState(false);
  const [editingSalon, setEditingSalon] = useState(null);
  const [newSalonName, setNewSalonName] = useState('');
  const [newSalonDescription, setNewSalonDescription] = useState('');
  const [newSalonTableCount, setNewSalonTableCount] = useState(0);
  const [newSalonTableStartNumber, setNewSalonTableStartNumber] = useState(0);
  
  // Occupancy data state
  const [occupancyData, setOccupancyData] = useState(null);
  const [loadingOccupancy, setLoadingOccupancy] = useState(false);

  // Restoran ismini backend'den al
  useEffect(() => {
    const loadRestaurantName = async () => {
      try {
        const settings = await settingsService.getRestaurantSettings();
        if (settings.restaurantName) {
          setRestaurantName(settings.restaurantName);
          localStorage.setItem('restaurantName', settings.restaurantName);
        }
      } catch (error) {
        console.error('Error loading restaurant name:', error);
        // Fallback to localStorage if API fails
        const cachedName = localStorage.getItem('restaurantName');
        if (cachedName) setRestaurantName(cachedName);
      }
    };

    loadRestaurantName();
  }, []);

  // Restoran ismi değişikliklerini dinle
  useEffect(() => {
    const handleRestaurantNameChange = (event) => {
      setRestaurantName(event.detail.name);
    };

    window.addEventListener('restaurantNameChanged', handleRestaurantNameChange);
    return () => window.removeEventListener('restaurantNameChanged', handleRestaurantNameChange);
  }, []);

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

  // No external table-statuses dependency; occupancy computed locally



  // Bugünün tarihini al (sadece gün-ay formatında)
  const getTodayDate = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}`;
  };

  // Kat adını döndüren fonksiyon
  const getFloorName = (floorNumber) => {
    // Silme/onay gibi durumlarda hedef kat (salon) id'sine göre adı bul
    const salon = (derivedSalons || []).find(s => String(s.id) === String(floorNumber));
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
    return String(tableNum);
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

  // Drag and Drop state'leri
  const [draggedTable, setDraggedTable] = useState(null);
  const [dragOverTable, setDragOverTable] = useState(null);
  const [tablePositions, setTablePositions] = useState(() => {
    const saved = localStorage.getItem('tablePositions');
    return saved ? JSON.parse(saved) : {};
  });

  // Calculate occupancy for a table using current backend tables and reservations
  const getTableOccupancy = (tableId) => {
    const backendTable = (tables || []).find(t => String(t?.tableNumber ?? t?.id) === String(tableId));
    if (!backendTable) return null;
    const capacity = backendTable?.capacity || 4;
    const statusName = String(
      backendTable?.status?.name ?? backendTable?.statusName ?? backendTable?.status_name ?? ''
    ).toLowerCase();
    if (statusName === 'reserved') {
      const res = Object.values(reservations || {}).find(r => String(r.tableId) === String(tableId));
      const people = Number(res?.kisiSayisi ?? res?.personCount);
      if (Number.isFinite(people) && people > 0) {
        const rate = Math.min((people / capacity) * 100, 100);
        return { rate, people, capacity };
      }
      return { rate: 60, people: null, capacity };
    }
    if (statusName === 'occupied') return { rate: 100, people: null, capacity };
    return { rate: 0, people: null, capacity };
  };

  // Backend'den gelen masaları seçili salona göre göster
  const displayTables = useMemo(() => {
    if (!Array.isArray(tables) || tables.length === 0) return [];
    const filtered = selectedSalonId ? tables.filter(t => (t?.salon?.id ?? t?.salonId) === selectedSalonId) : tables;
    const mapped = filtered.map(t => ({
      id: String(t?.tableNumber ?? t?.id),
      displayNumber: getAdminDisplayFor(t),
      capacity: t?.capacity || 4,
      backendId: t?.id,
      salonId: t?.salon?.id ?? t?.salonId
    }));
    
    // Pozisyona göre sırala
    return mapped.sort((a, b) => {
      const aPos = tablePositions[a.id]?.order ?? parseInt(a.id) ?? 0;
      const bPos = tablePositions[b.id]?.order ?? parseInt(b.id) ?? 0;
      return aPos - bPos;
    });
  }, [tables, selectedSalonId, derivedSalons, tablePositions]);

  // Masa kapasitelerini localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('tableCapacities', JSON.stringify(tableCapacities));
  }, [tableCapacities]);

  // Masa pozisyonlarını localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('tablePositions', JSON.stringify(tablePositions));
  }, [tablePositions]);
  

  const handleReservationClick = (tableId) => {
    setSelectedTable(tableId);
    setShowReservationModal(true);
  };

  // Drag and Drop fonksiyonları
  const handleDragStart = (e, table) => {
    if (!showTableLayoutMode) return; // Sadece masa düzeni modunda aktif
    setDraggedTable(table);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', table.id);
    // Drag görsel efekti için
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedTable(null);
    setDragOverTable(null);
  };

  const handleDragOver = (e, table) => {
    if (!showTableLayoutMode || !draggedTable) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverTable(table.id);
  };

  const handleDragLeave = (e) => {
    if (!showTableLayoutMode) return;
    setDragOverTable(null);
  };

  const handleDrop = (e, targetTable) => {
    if (!showTableLayoutMode || !draggedTable || draggedTable.id === targetTable.id) return;
    e.preventDefault();
    
    // İki masanın pozisyonlarını değiştir
    const sourceTableId = draggedTable.id;
    const targetTableId = targetTable.id;
    

    
    // Başarı mesajı göster - DEVRE DIŞI
    // setSuccessData({
    //   message: `Masa ${draggedTable.displayNumber} ile Masa ${targetTable.displayNumber} pozisyonları değiştirildi!`,
    //   details: 'Yeni düzen otomatik olarak kaydedildi.'
    // });
    // setShowSuccess(true);
    
    // Pozisyon değişimini localStorage'a kaydet
    setTablePositions(prev => {
      const newPositions = { ...prev };
      const sourcePos = newPositions[sourceTableId] || { order: parseInt(sourceTableId) };
      const targetPos = newPositions[targetTableId] || { order: parseInt(targetTableId) };
      
      // Pozisyonları takas et
      newPositions[sourceTableId] = targetPos;
      newPositions[targetTableId] = sourcePos;
      
      return newPositions;
    });

    setDraggedTable(null);
    setDragOverTable(null);
  };

  const handleTableClick = (table) => {
    if (showReservationMode && table.status === 'empty') {
      // Rezervasyon modunda boş masaya tıklandığında rezervasyon modalını aç
      setSelectedTable(table.id);
      setShowReservationModal(true);
    } else if (showTableLayoutMode) {
      // Masa düzeni modunda masa yönetimi modalını aç
      const tableData = tables?.find(t => String(t.tableNumber ?? t.id) === String(table.id)) || table;

      setSelectedTableForManagement({
        id: tableData?.id || table.backendId,  // Backend ID'sini kullan
        tableNumber: tableData?.tableNumber ?? table.id,
        name: String(tableData?.tableNumber ?? table.id),
        capacity: tableData?.capacity || table.capacity || 4,
        salon: tableData?.salon,
        salonId: tableData?.salonId || tableData?.salon?.id
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

  const handleReservationSubmit = async (formData) => {
    try {
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

      await addReservation(selectedTable, formData);
      setShowReservationModal(false);
      setSelectedTable(null);
      setShowReservationMode(false); // Rezervasyon modunu kapat
      setModalKey(prev => prev + 1); // Modal key'ini artırarak form verilerini temizle

      // Başarı bildirimi göster - DEVRE DIŞI
      // setSuccessData({ ...formData, masaNo: selectedTable });
      // setShowSuccess(true);
    } catch (error) {
      console.error('Rezervasyon oluşturma hatası:', error);
      
      // Backend'ten gelen hata mesajlarını kullanıcıya göster
      let errorMessage = 'Rezervasyon oluşturulurken bir hata oluştu.';
      
      if (error.message) {
        if (error.message.includes('Geçmiş saatlerde rezervasyon yapılamaz')) {
          errorMessage = '⚠️ Geçmiş saatlerde rezervasyon yapılamaz! Lütfen gelecekteki bir saat seçin.';
        } else if (error.message.includes('Geçmiş tarihlerde rezervasyon yapılamaz')) {
          errorMessage = '⚠️ Geçmiş tarihlerde rezervasyon yapılamaz! Lütfen bugün veya gelecekteki bir tarih seçin.';
        } else if (error.message.includes('Rezervasyon saati')) {
          errorMessage = '⚠️ ' + error.message.replace(/.*message:\s*/, '');
        } else {
          errorMessage = error.message;
        }
      }
      
      setWarningMessage(errorMessage);
      setShowWarningModal(true);
    }
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

  // Kat yoğunluğu (kullanılan/kapasite)
  const totalCapacityInSalon = useMemo(() => {
    return (backendTablesForStats || []).reduce((sum, t) => sum + (Number(t?.capacity) || 4), 0);
  }, [backendTablesForStats]);

  const usedCapacityInSalon = useMemo(() => {
    let used = 0;
    (backendTablesForStats || []).forEach(t => {
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
    return used;
  }, [backendTablesForStats, reservations]);

  // Waiter ile aynı status sistemi
  const statusInfo = {
    "empty": { text: "Boş", color: "#22c55e", textColor: "#ffffff" },
    "bos": { text: "Boş", color: "#22c55e", textColor: "#ffffff" },
    "occupied": { text: "Dolu", color: "#ef4444", textColor: "#ffffff" },
    "dolu": { text: "Dolu", color: "#ef4444", textColor: "#ffffff" },
    "reserved": { text: "Rezerve", color: "#fbbf24", textColor: "#ffffff" },
    "reserved-future": { text: "Rezerve", color: "#22c55e", textColor: "#ffffff" },
    "reserved-special": { text: "Özel Rezerve", color: "#f59e0b", textColor: "#ffffff" },
  };

    const getStatus = (tableId) => {
    // Backend'den gelen masa verisini bul
    const backendTable = (tables || []).find(t => Number(t?.id) === Number(tableId));
    
    // Hibrit yaklaşım: Önce order items'a bak, sonra backend status'üne bak
    if (backendTable && backendTable.activeOrderItemsCount > 0) {
      return statusInfo["occupied"]; // Kırmızı - aktif order var ve items var
    }
    
    // Eğer order items yok ama backend'de masa OCCUPIED ise, backend status'ünü kullan
    if (backendTable && backendTable.statusName && backendTable.statusName.toLowerCase() === 'occupied') {
      return statusInfo["occupied"]; // Kırmızı - backend'de manuel olarak occupied yapılmış
    }

    // Diğer durumlar için eski sistem
    const status = tableStatus[tableId] || "empty";

    if (status === 'reserved') {
      const reservation = Object.values(reservations).find(res => res.tableId === tableId);
      if (reservation) {
        const reservationTime = new Date(`${reservation.tarih}T${reservation.saat}`);
        const now = new Date();
        const oneHour = 60 * 60 * 1000;
        const fiftyNineMinutes = 59 * 60 * 1000;
        const twentyFourHours = 24 * 60 * 60 * 1000;

        // Rezervasyon geçmiş mi kontrol et
        if (reservationTime < now) {
          // Rezervasyon geçmiş, masayı boş yap

          updateTableStatus(tableId, 'empty');
          return statusInfo["empty"];
        }

        // Özel rezervasyon kontrolü
        if (reservation.specialReservation) {
          const delta = reservationTime.getTime() - now.getTime();
          if (reservationTime > now && delta <= fiftyNineMinutes) {
            return statusInfo["reserved-special"]; // 59 dakika içinde sarı
          }
          if (reservationTime > now && delta <= twentyFourHours) {
            return statusInfo["reserved"]; // 24 saat içinde sarı
          }
          if (reservationTime > now && delta > twentyFourHours) {
            return statusInfo["reserved-future"]; // 24 saatten uzak yeşil
          }
        } else {
          // Normal rezervasyon kontrolü: 24 saat içinde sarı, aksi halde yeşil
          const delta = reservationTime.getTime() - now.getTime();
          if (reservationTime > now && delta <= twentyFourHours) {
            return statusInfo["reserved"]; // 24 saat içinde sarı
          }
          if (reservationTime > now && delta > twentyFourHours) {
            return statusInfo["reserved-future"]; // 24 saatten uzak yeşil
          }
        }
      } else {
        // Rezervasyon kaydı bulunamadıysa bile backend 'reserved' olabilir; boş yapma

        return statusInfo["reserved"];
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
    setNewTableNumber('');
  };

  // Masa yönetimi modalını kapatma fonksiyonu
  const handleTableManagementClose = () => {
    setShowTableManagementModal(false);
    setSelectedTableForManagement(null);
  };

  // Masa ekleme onaylama fonksiyonu (backend'e kaydeder)
  const handleAddTableConfirm = async () => {
    try {
      // Seçili salon
      const currentSalonId = selectedSalonId || (derivedSalons[0]?.id);
      if (!currentSalonId) {
        alert('Önce bir salon seçin');
        return;
      }

      // Masa numarası kullanıcıdan
      if (!newTableNumber || String(newTableNumber).trim() === '') {
        alert('Lütfen masa numarası girin');
        return;
      }
      const desiredNumber = parseInt(String(newTableNumber).trim(), 10);
      if (Number.isNaN(desiredNumber) || desiredNumber <= 0) {
        alert('Geçerli bir masa numarası girin (pozitif sayı)');
        return;
      }

      // Bu salonda çakışma kontrolü
      const inSalon = (tables || []).filter(t => (t?.salon?.id ?? t?.salonId) === currentSalonId);
      const exists = inSalon.some(t => Number(t.tableNumber) === desiredNumber);
      if (exists) {
        alert(`Bu salonda ${desiredNumber} numaralı masa zaten var.`);
        return;
      }

      await createTable({
        tableNumber: desiredNumber,
        capacity: newTableCapacity,
        salonId: currentSalonId
      });

      setShowAddTableModal(false);
      setNewTableCapacity(4);
      setNewTableNumber('');
    } catch (e) {
      alert(`Masa eklenirken hata: ${e.message}`);
    }
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
  const deleteFloor = async () => {

    if (floorToDelete !== null) {
      try {
        // 1) Önce bu salona ait tüm masaları sil
        const salonTables = tables.filter(t => (t?.salon?.id ?? t?.salonId) === floorToDelete);

        for (const table of salonTables) {
          try {
            // Önce normal silmeyi dene
            await deleteTableFromCtx(table.id);

          } catch (error) {
            const msg = String(error.message || '');
            if (msg.includes('404')) {
              console.warn(`Masa ${table.tableNumber || table.id} zaten silinmiş.`);
              continue;
            }
            console.warn('Masa silme hatası, force silinmek üzere tekrar denenecek:', error);
            // Force delete dene
            try {
              await deleteTableForce(table.id);

            } catch (e2) {
              console.error('Masa force silme de başarısız oldu:', e2);
              throw new Error(`Masa ${table.tableNumber || table.id} silinemedi: ${e2.message}`);
            }
          }
        }
        // 2) Şimdi salonu sil

        await salonService.deleteSalon(floorToDelete);
        // 3) Verileri tazele
        await loadTablesAndSalons();
        // 4) Modal'ı kapat (başarı bildirimi gösterme)
        setShowDeleteFloorModal(false);
        setFloorToDelete(null);

      } catch (error) {
        console.error('Kat silme hatası:', error);
        setWarningMessage(`Kat silinirken hata oluştu: ${error.message}`);
        setShowWarningModal(true);
      }
    } else {
      console.warn('deleteFloor: floorToDelete null!');
    }
  };

  // Kat silme modalını aç
  const openDeleteFloorModal = (floorNumber) => {
    setFloorToDelete(floorNumber);
    setShowDeleteFloorModal(true);
  };

  // Masa silme fonksiyonu
  const deleteTable = async () => {
    if (tableToDelete && (tableToDelete.id != null)) {
      try {
        // Ön kontrol: backend tablosunu bul
        const backendTable = (tables || []).find(t => String(t.id) === String(tableToDelete.id));

        if (!backendTable) {
          alert('Masa bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.');
          return;
        }

        // 1) Durum kontrolü – kırmızı (occupied) veya sarı (reserved) ise engelle
        const statusName = String(
          backendTable?.status?.name ?? backendTable?.statusName ?? backendTable?.status_name ?? ''
        ).toLowerCase();
        if (statusName && statusName !== 'available') {
          if (statusName === 'occupied') {
            alert('Bu masa dolu. Silmeden önce masayı boşaltın.');
          } else if (statusName === 'reserved') {
            alert('Bu masa rezerve. Silmeden önce rezervasyonu iptal edin.');
          } else {
            alert(`Bu masa (${statusName}) durumunda. Silmeden önce masayı boşaltın.`);
          }
          return;
        }

        // Not: Yeşil (available) masalar için sipariş/rezervasyon kontrolü atlanır.
        // Bazı durumlarda backend'den eski sipariş kaydı gelebilir; yeşil masalar silinebilmeli.

        // Tüm kontroller geçti, sil (Context fonksiyonu)
        await deleteTableFromCtx(tableToDelete.id);

        // Başarılı silme sonrası masaları yeniden yükle
        if (loadTablesAndSalons) {
          await loadTablesAndSalons();
        }

        setShowDeleteTableModal(false);
        setTableToDelete(null);

        // Başarı mesajı göster
        setSuccessData({
          message: `Masa başarıyla silindi`,
          type: 'table_deleted'
        });
        setShowSuccess(true);

      } catch (error) {
        console.error('Error deleting table:', error);
        alert(`Masa silinirken hata oluştu: ${error.message}`);
      }
    }
  };

  // Masa silme modalını aç
  const openDeleteTableModal = (tableInfo) => {
    setTableToDelete(tableInfo);
    setShowDeleteTableModal(true);
  };

  return (
    <>
      {/* top-right floor occupancy badge removed */}
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
                🏠 Masa Düzeni Modu Aktif - Masaları Sürükleyerek Taşıyın
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
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "1.75rem"
          }}>
            {displayTables.map((table) => {
              const status = getStatus(table.id);
              const order = orders[table.id] || {};
              const tableReservations = Object.values(reservations).filter(res => {
                const statusId = res.statusId || res.status;
                return res.tableId === table.id && statusId !== 3 && statusId !== 2; // 3=COMPLETED, 2=CANCELLED
              });
              // occupancy badge removed

              return (
                <div
                  key={table.id || crypto.randomUUID()}
                  draggable={showTableLayoutMode}
                  onDragStart={(e) => handleDragStart(e, table)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, table)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, table)}
                  style={{
                    backgroundColor: status.color,
                    color: status.textColor,
                    height: "150px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "16px",
                    cursor: showTableLayoutMode ? 'move' : 'pointer',
                    userSelect: "none",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
                    position: 'relative',
                    border: dragOverTable === table.id ? '3px solid #2196f3' : '2px solid rgba(0,0,0,0.08)',
                    transform: draggedTable?.id === table.id ? 'scale(0.95)' : 'scale(1)'
                  }}
                  onClick={() => !showTableLayoutMode && handleTableClick({ id: table.id, name: table.displayNumber, status: tableStatus[table.id] || 'empty', orderCount: table.activeOrderItemsCount || 0, reservation: tableReservations[0] })}
                  onMouseEnter={(e) => {
                    if (!draggedTable) {
                      e.currentTarget.style.transform = showTableLayoutMode ? 'scale(1.02)' : 'scale(1.04)';
                      e.currentTarget.style.boxShadow = '0 16px 28px rgba(0,0,0,0.18)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!draggedTable) {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                    }
                  }}
                  title={showTableLayoutMode ? `Masa ${table.displayNumber} - Sürükleyerek Taşı` : (showReservationMode && status.text === 'Boş' ? `Masa ${table.displayNumber} - Rezervasyon Yap` : `Masa ${table.displayNumber}`)}
                >
                  {/* per-table occupancy removed */}
                  {/* Ahşap süsler kaldırıldı, sade renkli kart */}
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
                        openDeleteTableModal({ id: table.backendId || table.id, displayNumber: table.displayNumber, tableNumber: table.id });
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

                  {/* Masa düzeni modunda sürükle işareti */}
                  {showTableLayoutMode && (
                    <div style={{
                      position: 'absolute',
                      top: '5px',
                      left: '5px',
                      background: 'rgba(33, 150, 243, 0.8)',
                      color: 'white',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      pointerEvents: 'none',
                      zIndex: 5
                    }}>
                      ⟷
                    </div>
                  )}

                  {/* Masa kapasitesi */}
                  <div style={{
                    fontSize: "0.9rem",
                    color: status.textColor,
                    marginBottom: 4,
                    fontWeight: 700
                  }}>
                    {table.capacity} Kişilik
                  </div>
                  <div style={{ 
                    fontSize: 35, 
                    fontWeight: 500, 
                    letterSpacing: 1,
                    color: status.textColor
                  }}>
                    {table.displayNumber}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, fontSize: 14, marginTop: 8, fontWeight: 600 }}>
                    <span style={{
                      background: 'rgba(255,255,255,0.9)',
                      color: '#111',
                      borderRadius: 12,
                      padding: '3px 12px',
                      border: '1px solid rgba(255,255,255,0.6)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>{status.text}</span>
                    {/* Backend'den gelen aktif order items sayısını kullan */}
                    {table.activeOrderItemsCount > 0 && (
                      <span style={{
                        background: 'rgba(0,0,0,0.45)',
                        color: '#fff',
                        borderRadius: 12,
                        padding: '2px 8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12
                      }}>
                        {table.activeOrderItemsCount}
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
                    e.target.style.color = selectedSalonId === salon.id ? 'white' : (isDarkMode ? '#e0e0e0' : '#495057');
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
                    setEditingSalon(salon);
                    setNewSalonName(salon.name || '');
                    setNewSalonDescription(salon.description || '');
                    setShowEditSalonModal(true);
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
                    e.target.style.color = selectedSalonId === salon.id ? 'white' : (isDarkMode ? '#e0e0e0' : '#495057');
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
              onClick={() => setShowAddSalonModal(true)}
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

        {/* Yeni Salon Ekle Modal */}
        {showAddSalonModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              backgroundColor: isDarkMode ? '#513653' : '#ffffff', padding: '2rem', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', maxWidth: '420px', width: '90%', textAlign: 'center', border: `2px solid ${isDarkMode ? '#473653' : '#e0e0e0'}`
            }}>
              <h3 style={{ color: isDarkMode ? '#ffffff' : '#333333', marginBottom: '16px' }}>🏢 Yeni Salon Ekle</h3>
              <div style={{ textAlign: 'left', marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: 6, color: isDarkMode ? '#fff' : '#333', fontWeight: 600 }}>Salon Adı</label>
                <input value={newSalonName} onChange={(e)=>setNewSalonName(e.target.value)} placeholder="Örn: ANA SALON" style={{ width:'100%', padding:10, borderRadius:8, border:`2px solid ${isDarkMode?'#473653':'#e0e0e0'}`, background:isDarkMode?'#473653':'#fff', color:isDarkMode?'#fff':'#333', fontSize:16 }} />
              </div>
              <div style={{ textAlign: 'left', marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: 6, color: isDarkMode ? '#fff' : '#333', fontWeight: 600 }}>Salon Açıklaması</label>
                <textarea value={newSalonDescription} onChange={(e)=>setNewSalonDescription(e.target.value)} placeholder="Örn: Ana yemek salonu" style={{ width:'100%', padding:10, borderRadius:8, border:`2px solid ${isDarkMode?'#473653':'#e0e0e0'}`, background:isDarkMode?'#473653':'#fff', color:isDarkMode?'#fff':'#333', fontSize:16, minHeight:'60px', resize:'vertical' }} />
              </div>
                              <div style={{ textAlign: 'left', marginBottom: '14px', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:12 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, color: isDarkMode ? '#fff' : '#333', fontWeight: 600 }}>Masa Sayısı</label>
                  <input type="number" min={0} value={newSalonTableCount} onChange={(e)=>setNewSalonTableCount(parseInt(e.target.value || '0', 10))} placeholder="Örn: 10" style={{ width:'100%', padding:10, borderRadius:8, border:`2px solid ${isDarkMode?'#473653':'#e0e0e0'}`, background:isDarkMode?'#473653':'#fff', color:isDarkMode?'#fff':'#333', fontSize:16 }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, color: isDarkMode ? '#fff' : '#333', fontWeight: 600 }}>Masa Başlangıç Numarası</label>
                  <input type="number" min={0} value={newSalonTableStartNumber} onChange={(e)=>setNewSalonTableStartNumber(parseInt(e.target.value || '0', 10))} placeholder="Örn: 150" style={{ width:'100%', padding:10, borderRadius:8, border:`2px solid ${isDarkMode?'#473653':'#e0e0e0'}`, background:isDarkMode?'#473653':'#fff', color:isDarkMode?'#fff':'#333', fontSize:16 }} />
                </div>
              </div>
              
              <div style={{ display:'flex', gap:15, justifyContent:'center' }}>
                <button onClick={async ()=>{
                  const name = (newSalonName||'').trim();
                  if (!name) { alert('Salon adı zorunlu'); return; }
                  if (name.length < 3) { alert('Salon adı en az 3 karakter olmalı'); return; }
                  const duplicate = (derivedSalons||[]).some(s => String(s.name||'').toLowerCase() === name.toLowerCase());
                  if (duplicate) { alert('Bu isimde bir salon zaten var'); return; }
                  try {
                    const description = (newSalonDescription||'').trim();
                    const createdSalon = await salonService.createSalon({ name, description });
                    // Eğer masa sayısı > 0 ise, 1..N arası masa oluştur
                    const count = Number.isFinite(newSalonTableCount) && newSalonTableCount > 0 ? newSalonTableCount : 0;
                    const base = Number.isFinite(newSalonTableStartNumber) ? newSalonTableStartNumber : 0;
                    if (count > 0 && createdSalon?.id) {
                      for (let i = 1; i <= count; i++) {
                        try {
                          await createTable({ tableNumber: base + i, capacity: 4, salonId: createdSalon.id });
                        } catch(err) {
                          console.error('Masa oluşturulamadı:', i, err);
                        }
                      }
                    }
                    await loadTablesAndSalons?.();
                    setShowAddSalonModal(false);
                    setNewSalonName('');
                    setNewSalonDescription('');
                    setNewSalonTableCount(0);
                    setNewSalonTableStartNumber(0);
                  } catch(err){
                    alert(`Salon eklenirken hata: ${err.message}`);
                  }
                }} style={{ background:'#4CAF50', color:'#fff', border:'none', padding:'12px 24px', borderRadius:8, cursor:'pointer', fontWeight:'bold' }}>Ekle</button>
                <button onClick={()=>{ setShowAddSalonModal(false); setNewSalonName(''); setNewSalonDescription(''); setNewSalonTableCount(0); setNewSalonTableStartNumber(0); }} style={{ background:isDarkMode?'#473653':'#f5f5f5', color:isDarkMode?'#fff':'#333', border:'none', padding:'12px 24px', borderRadius:8, cursor:'pointer', fontWeight:'bold' }}>İptal</button>
              </div>
            </div>
          </div>
        )}

        {/* Salon Düzenleme Modal */}
        {showEditSalonModal && editingSalon && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              backgroundColor: isDarkMode ? '#513653' : '#ffffff', padding: '2rem', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', maxWidth: '420px', width: '90%', textAlign: 'center', border: `2px solid ${isDarkMode ? '#473653' : '#e0e0e0'}`
            }}>
              <h3 style={{ color: isDarkMode ? '#ffffff' : '#333333', marginBottom: '16px' }}>🏢 Salon Düzenle</h3>
              <div style={{ textAlign: 'left', marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: 6, color: isDarkMode ? '#fff' : '#333', fontWeight: 600 }}>Salon Adı</label>
                <input value={newSalonName} onChange={(e)=>setNewSalonName(e.target.value)} placeholder="Örn: ANA SALON" style={{ width:'100%', padding:10, borderRadius:8, border:`2px solid ${isDarkMode?'#473653':'#e0e0e0'}`, background:isDarkMode?'#473653':'#fff', color:isDarkMode?'#fff':'#333', fontSize:16 }} />
              </div>
              <div style={{ textAlign: 'left', marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: 6, color: isDarkMode ? '#fff' : '#333', fontWeight: 600 }}>Salon Açıklaması</label>
                <textarea value={newSalonDescription} onChange={(e)=>setNewSalonDescription(e.target.value)} placeholder="Örn: Ana yemek salonu" style={{ width:'100%', padding:10, borderRadius:8, border:`2px solid ${isDarkMode?'#473653':'#e0e0e0'}`, background:isDarkMode?'#473653':'#fff', color:isDarkMode?'#fff':'#333', fontSize:16, minHeight:'60px', resize:'vertical' }} />
              </div>

              
              <div style={{ display:'flex', gap:15, justifyContent:'center' }}>
                <button onClick={async ()=>{
                  const name = (newSalonName||'').trim();
                  if (!name) { alert('Salon adı zorunlu'); return; }
                  if (name.length < 3) { alert('Salon adı en az 3 karakter olmalı'); return; }
                  const duplicate = (derivedSalons||[]).some(s => s.id !== editingSalon.id && String(s.name||'').toLowerCase() === name.toLowerCase());
                  if (duplicate) { alert('Bu isimde bir salon zaten var'); return; }
                  try {
                    const description = (newSalonDescription||'').trim();
                    await salonService.updateSalon(editingSalon.id, { name, description });
                    await loadTablesAndSalons?.();
                    setShowEditSalonModal(false);
                    setEditingSalon(null);
                    setNewSalonName('');
                    setNewSalonDescription('');
                  } catch(err){
                    alert(`Salon güncellenirken hata: ${err.message}`);
                  }
                }} style={{ background:'#4CAF50', color:'#fff', border:'none', padding:'12px 24px', borderRadius:8, cursor:'pointer', fontWeight:'bold' }}>Güncelle</button>
                <button onClick={()=>{ setShowEditSalonModal(false); setEditingSalon(null); setNewSalonName(''); setNewSalonDescription(''); }} style={{ background:isDarkMode?'#473653':'#f5f5f5', color:isDarkMode?'#fff':'#333', border:'none', padding:'12px 24px', borderRadius:8, cursor:'pointer', fontWeight:'bold' }}>İptal</button>
              </div>
            </div>
          </div>
        )}

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
                <strong>Masa {tableToDelete?.displayNumber || tableToDelete?.tableNumber || ''}</strong> masasını silmek istediğinizden emin misiniz?
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

                  {/* Mevcut rezervasyonları göster - COMPLETED ve CANCELLED olanları hariç tut */}
                  {Object.values(reservations).filter(res => {
                    const statusId = res.statusId || res.status;
                    return res.tableId === selectedTableDetails.id && statusId !== 3 && statusId !== 2; // 3=COMPLETED, 2=CANCELLED
                  }).map((reservation, index) => (
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
                marginBottom: '12px',
                fontSize: '1rem'
              }}>
                Masa numarasını ve kapasiteyi seçin:
              </p>
              <div style={{
                textAlign: 'left',
                marginBottom: '16px'
              }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  color: isDarkMode ? '#ffffff' : '#333333',
                  fontWeight: 600
                }}>Masa Numarası</label>
                <input
                  type="number"
                  min="1"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  placeholder="Örn: 97"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: `2px solid ${isDarkMode ? '#473653' : '#e0e0e0'}`,
                    background: isDarkMode ? '#473653' : '#ffffff',
                    color: isDarkMode ? '#ffffff' : '#333333',
                    fontSize: '16px'
                  }}
                />
              </div>
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
