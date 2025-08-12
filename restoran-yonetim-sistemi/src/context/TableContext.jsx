import React, { createContext, useState, useEffect } from "react";
import { reservationService } from "../services/reservationService";
import { diningTableService } from "../services/diningTableService";
import { salonService } from "../services/salonService";

export const TableContext = createContext();

const initialProducts = {
    "Sıcak İçecekler": [
        { id: 101, name: "Türk Kahvesi", price: 50, stock: 100, category: "Sıcak İçecekler" },
        { id: 102, name: "Filtre Kahve", price: 70, stock: 100, category: "Sıcak İçecekler" },
        { id: 103, name: "Espresso", price: 60, stock: 100, category: "Sıcak İçecekler" },
        { id: 104, name: "Çay", price: 30, stock: 200, category: "Sıcak İçecekler" }
    ],
    "Soğuk İçecekler": [
        { id: 201, name: "Kola", price: 50, stock: 150, category: "Soğuk İçecekler" },
        { id: 202, name: "Ayran", price: 40, stock: 150, category: "Soğuk İçecekler" },
        { id: 203, name: "Su", price: 20, stock: 300, category: "Soğuk İçecekler" }
    ],
    "Tatlılar": [
        { id: 301, name: "Cheesecake", price: 120, stock: 50, category: "Tatlılar" },
        { id: 302, name: "Tiramisu", price: 110, stock: 50, category: "Tatlılar" },
        { id: 303, name: "Sufle", price: 130, stock: 40, category: "Tatlılar" }
    ]
};

const initialTableStatus = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    status: 'empty',
})).reduce((acc, table) => {
    acc[table.id] = table.status;
    return acc;
}, {});

const readFromLocalStorage = (key, initialValue) => {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
    } catch (error) {
        console.error("Error reading from localStorage", error);
        return initialValue;
    }
};

export function TableProvider({ children }) {
    const [tableStatus, setTableStatus] = useState(() => readFromLocalStorage('tableStatus', initialTableStatus));
    const [orders, setOrders] = useState(() => readFromLocalStorage('orders', {}));
    const [completedOrders, setCompletedOrders] = useState(() => readFromLocalStorage('completedOrders', {}));
    const [products, setProducts] = useState(() => readFromLocalStorage('products', initialProducts));
    const [reservations, setReservations] = useState(() => readFromLocalStorage('reservations', {}));
    const [timestamps, setTimestamps] = useState({});
    const [orderHistory, setOrderHistory] = useState(() => readFromLocalStorage('orderHistory', []));
    
    // Backend'den masa verilerini yükle
    const [tables, setTables] = useState([]);
    const [salons, setSalons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Backend'den masa ve salon verilerini yükle
    useEffect(() => {
        loadTablesAndSalons();
    }, []);

    const loadTablesAndSalons = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Salonları yükle
            const salonData = await salonService.getAllSalons();
            setSalons(salonData);
            
            // Masaları yükle
            const tableData = await diningTableService.getAllTables();
            setTables(tableData);
            
            // Masa durumlarını güncelle
            const newTableStatus = {};
            tableData.forEach(table => {
                newTableStatus[table.tableNumber] = table.status.name.toLowerCase();
            });
            setTableStatus(newTableStatus);
            
            console.log('Tables and salons loaded from backend:', { salonData, tableData });
        } catch (error) {
            console.error('Error loading tables and salons:', error);
            setError(error.message);
            // Hata durumunda localStorage'dan yükle
            console.log('Falling back to localStorage data');
        } finally {
            setLoading(false);
        }
    };

    const updateTableStatus = async (tableId, status) => {
        try {
            // Backend'de güncelle
            await diningTableService.updateTableStatus(tableId, status);
            
            // Local state'i güncelle
            setTableStatus(prev => ({ ...prev, [tableId]: status }));
        } catch (error) {
            console.error('Error updating table status in backend:', error);
            // Hata durumunda sadece local state'i güncelle
            setTableStatus(prev => ({ ...prev, [tableId]: status }));
        }
    };

    const saveFinalOrder = (tableId, finalItems) => {
        const prevOrder = orders[tableId] || {};
        const updatedProducts = { ...products };

        const totalPrice = Object.values(finalItems).reduce(
            (sum, item) => sum + item.price * item.count,
            0
        );
        const isOrderEmpty = totalPrice === 0;

        Object.entries(finalItems).forEach(([id, newItem]) => {
            const prevItem = prevOrder[id];
            const quantityDifference = (newItem.count || 0) - (prevItem?.count || 0);
            Object.keys(updatedProducts).forEach(category => {
                const productIndex = updatedProducts[category].findIndex(p => p.id === parseInt(id));
                if (productIndex !== -1) {
                    const newStock = updatedProducts[category][productIndex].stock - quantityDifference;
                    updatedProducts[category][productIndex].stock = newStock >= 0 ? newStock : 0;
                }
            });
        });

        Object.keys(prevOrder).forEach(id => {
            if (!finalItems[id]) {
                const prevItem = prevOrder[id];
                Object.keys(updatedProducts).forEach(category => {
                    const productIndex = updatedProducts[category].findIndex(p => p.id === parseInt(id));
                    if (productIndex !== -1) {
                        updatedProducts[category][productIndex].stock += prevItem.count;
                    }
                });
            }
        });

        setProducts(updatedProducts);

        if (isOrderEmpty) {
            const updatedOrders = { ...orders };
            delete updatedOrders[tableId];
            setOrders(updatedOrders);
            setTimestamps(prev => {
                const copy = { ...prev };
                delete copy[tableId];
                return copy;
            });
            updateTableStatus(tableId, "empty");
        } else {
            setOrders(prev => ({ ...prev, [tableId]: finalItems }));
            setTimestamps(prev => ({ ...prev, [tableId]: Date.now() }));
            updateTableStatus(tableId, "occupied");
        }
    };

    const restoreStock = (order) => {
        const updatedProducts = { ...products };
        Object.entries(order).forEach(([id, item]) => {
            Object.keys(updatedProducts).forEach(category => {
                const productIndex = updatedProducts[category].findIndex(p => p.id === parseInt(id));
                if (productIndex !== -1) {
                    updatedProducts[category][productIndex].stock += item.count;
                }
            });
        });
        setProducts(updatedProducts);
    };

    const cancelOrder = (tableId) => {
        const currentOrder = orders[tableId];
        if (currentOrder) {
            restoreStock(currentOrder);
            const updatedOrders = { ...orders };
            delete updatedOrders[tableId];
            setOrders(updatedOrders);
            updateTableStatus(tableId, "empty");
            setTimestamps(prev => {
                const copy = { ...prev };
                delete copy[tableId];
                return copy;
            });
        }
    };

    const processPayment = (tableId) => {
        const orderToComplete = orders[tableId];
        if (orderToComplete) {
            const completedOrderId = `completed-${Date.now()}`;
            const completedOrderDetails = {
                ...orderToComplete,
                tableId: tableId,
                creationDate: new Date().toISOString()
            };
            setCompletedOrders(prev => ({
                ...prev,
                [completedOrderId]: completedOrderDetails
            }));
            setTableStatus(prev => ({ ...prev, [tableId]: 'empty' }));
            setOrders(prev => {
                const newOrders = { ...prev };
                delete newOrders[tableId];
                return newOrders;
            });
        }
    };

    const removeConfirmedOrderItem = (tableId, itemToRemove) => {
        setOrders(prevOrders => {
            const newOrders = { ...prevOrders };
            if (!newOrders[tableId]) return prevOrders;
            delete newOrders[tableId][itemToRemove.id];
            if (Object.keys(newOrders[tableId]).length === 0) {
                delete newOrders[tableId];
                setTableStatus(prevStatus => ({ ...prevStatus, [tableId]: 'empty' }));
            }
            return newOrders;
        });
        setProducts(prevProducts => {
            const newProducts = JSON.parse(JSON.stringify(prevProducts));
            const category = itemToRemove.category;
            if (category && newProducts[category]) {
                const productIndex = newProducts[category].findIndex(p => p.id === itemToRemove.id);
                if (productIndex > -1) {
                    newProducts[category][productIndex].stock += itemToRemove.count;
                }
            }
            return newProducts;
        });
    };

    const decreaseConfirmedOrderItem = (tableId, itemToDecrease) => {
        if (itemToDecrease.count <= 1) {
            removeConfirmedOrderItem(tableId, itemToDecrease);
        } else {
            setOrders(prevOrders => {
                const newOrders = { ...prevOrders };
                newOrders[tableId][itemToDecrease.id].count -= 1;
                return newOrders;
            });
            setProducts(prevProducts => {
                const newProducts = JSON.parse(JSON.stringify(prevProducts));
                const category = itemToDecrease.category;
                const productIndex = newProducts[category].findIndex(p => p.id === itemToDecrease.id);
                if (productIndex > -1) {
                    newProducts[category][productIndex].stock += 1;
                }
                return newProducts;
            });
        }
    };

    const increaseConfirmedOrderItem = (tableId, itemToIncrease) => {
        const category = itemToIncrease.category;
        const productInStock = products[category]?.find(p => p.id === itemToIncrease.id);
        if (productInStock && productInStock.stock > 0) {
            setOrders(prevOrders => {
                const newOrders = { ...prevOrders };
                newOrders[tableId][itemToIncrease.id].count += 1;
                return newOrders;
            });
            setProducts(prevProducts => {
                const newProducts = JSON.parse(JSON.stringify(prevProducts));
                const productIndex = newProducts[category].findIndex(p => p.id === itemToIncrease.id);
                if (productIndex > -1) {
                    newProducts[category][productIndex].stock -= 1;
                }
                return newProducts;
            });
        } else {
            alert("Stokta yeterli ürün yok!");
        }
    };

    const addReservation = async (tableId, reservationData) => {
        try {
            // Backend'e rezervasyon gönder
            const backendReservation = await reservationService.createReservation({
                ...reservationData,
                tableId
            });

            // Backend'den gelen ID'yi kullan
            const reservationId = backendReservation.id || crypto.randomUUID();
            const newReservation = {
                id: reservationId,
                tableId,
                ...reservationData,
                createdAt: backendReservation.createdAt || new Date().toISOString(),
                backendId: backendReservation.id, // Backend ID'sini sakla
                statusId: backendReservation.statusId,
                statusName: backendReservation.statusName,
                statusNameInTurkish: backendReservation.statusNameInTurkish,
                salonId: backendReservation.salonId,
                salonName: backendReservation.salonName
            };

            // Local state'i güncelle
            setReservations(prev => ({
                ...prev,
                [reservationId]: newReservation
            }));
            setTableStatus(prev => ({ ...prev, [tableId]: 'reserved' }));

            console.log('Reservation added successfully to backend and local state:', newReservation);
            return reservationId;
        } catch (error) {
            console.error('Failed to create reservation in backend:', error);
            
            // Backend hatası durumunda sadece local state'e ekle (fallback)
            const reservationId = crypto.randomUUID();
            const newReservation = {
                id: reservationId,
                tableId,
                ...reservationData,
                createdAt: new Date().toISOString(),
                backendError: true, // Backend hatası olduğunu işaretle
                statusId: 1, // Varsayılan: confirmed
                statusName: 'confirmed',
                statusNameInTurkish: 'Onaylandı'
            };
            
            setReservations(prev => ({
                ...prev,
                [reservationId]: newReservation
            }));
            setTableStatus(prev => ({ ...prev, [tableId]: 'reserved' }));
            
            // Kullanıcıya hata bildirimi göster
            alert('Rezervasyon oluşturuldu ancak veritabanına kaydedilemedi. Lütfen daha sonra tekrar deneyin.');
            
            return reservationId;
        }
    };

    const addSpecialReservation = async (tables, reservationData) => {
        const reservationIds = [];
        
        // Masa numarasını doğru formatta al (Z1, Z2, A1, A2 gibi)
        const getTableNumber = (floorNumber, tableIndex) => {
            const floorPrefix = floorNumber === 0 ? "Z" : String.fromCharCode(65 + floorNumber - 1);
            return `${floorPrefix}${tableIndex + 1}`;
        };
        
        for (const table of tables) {
            try {
                const tableReservationData = {
                    ...reservationData,
                    adSoyad: reservationData.adSoyad || `${reservationData.ad} ${reservationData.soyad}`.trim(),
                    kisiSayisi: Math.min(table.capacity, reservationData.personCount),
                    not: `${reservationData.reservationReason} (${tables.length} masa)`,
                    specialReservation: true,
                    relatedTables: tables.map(t => getTableNumber(t.floor, t.tableIndex)),
                    selectedFloor: reservationData.selectedFloor,
                    wholeFloorOption: reservationData.wholeFloorOption,
                    floorClosingHours: reservationData.floorClosingHours,
                    floorClosingAllDay: reservationData.floorClosingAllDay,
                    specialRequests: reservationData.specialRequests
                };
                
                // Backend'e gönder
                const backendReservation = await reservationService.createReservation({
                    ...tableReservationData,
                    tableId: table.tableNumber
                });
                
                const reservationId = backendReservation.id || crypto.randomUUID();
                const newReservation = {
                    id: reservationId,
                    tableId: table.tableNumber,
                    ...tableReservationData,
                    createdAt: backendReservation.createdAt || new Date().toISOString(),
                    backendId: backendReservation.id,
                    statusId: backendReservation.statusId,
                    statusName: backendReservation.statusName,
                    statusNameInTurkish: backendReservation.statusNameInTurkish,
                    salonId: backendReservation.salonId,
                    salonName: backendReservation.salonName
                };
                
                setReservations(prev => ({
                    ...prev,
                    [reservationId]: newReservation
                }));
                
                setTableStatus(prev => ({ ...prev, [table.tableNumber]: 'reserved' }));
                reservationIds.push(reservationId);
                
            } catch (error) {
                console.error(`Failed to create special reservation for table ${table.tableNumber}:`, error);
                // Hata durumunda sadece local state'e ekle
                const reservationId = crypto.randomUUID();
                const newReservation = {
                    id: reservationId,
                    tableId: table.tableNumber,
                    ...tableReservationData,
                    createdAt: new Date().toISOString(),
                    backendError: true,
                    statusId: 1, // Varsayılan: confirmed
                    statusName: 'confirmed',
                    statusNameInTurkish: 'Onaylandı'
                };
                
                setReservations(prev => ({
                    ...prev,
                    [reservationId]: newReservation
                }));
                
                setTableStatus(prev => ({ ...prev, [table.tableNumber]: 'reserved' }));
                reservationIds.push(reservationId);
            }
        }
        
        return reservationIds;
    };

    const removeReservation = async (reservationId) => {
        try {
            const reservation = reservations[reservationId];
            
            if (reservation && reservation.backendId) {
                // Backend'den de sil
                await reservationService.deleteReservation(reservation.backendId);
                console.log('Reservation deleted from backend successfully');
            }
        } catch (error) {
            console.error('Failed to delete reservation from backend:', error);
            // Backend hatası olsa bile local state'den silmeye devam et
        }

        // Local state'den sil
        setReservations(prev => {
            const newReservations = { ...prev };
            const reservation = newReservations[reservationId];
            
            if (reservation) {
                // Eğer özel rezervasyon ise, tüm ilgili rezervasyonları sil
                if (reservation.specialReservation && reservation.relatedTables) {
                    let deletedCount = 0;
                    
                    // Aynı kişi, tarih, saat olan tüm rezervasyonları bul ve sil
                    Object.entries(newReservations).forEach(([id, res]) => {
                        if (res.specialReservation && 
                            res.ad === reservation.ad && 
                            res.soyad === reservation.soyad && 
                            res.telefon === reservation.telefon && 
                            res.tarih === reservation.tarih && 
                            res.saat === reservation.saat) {
                            delete newReservations[id];
                            deletedCount++;
                            // Masa durumunu boş yap
                            if (res.tableId) {
                                setTableStatus(prevStatus => ({ ...prevStatus, [res.tableId]: 'empty' }));
                            }
                        }
                    });
                } else {
                    // Normal rezervasyon ise sadece bu rezervasyonu sil
                    delete newReservations[reservationId];
                    if (reservation.tableId) {
                        setTableStatus(prevStatus => ({ ...prevStatus, [reservation.tableId]: 'empty' }));
                    }
                }
            }
            
            return newReservations;
        });
    };



    const clearAllReservations = async () => {
        try {
            // Backend'deki tüm rezervasyonları sil
            const allReservations = Object.values(reservations);
            for (const reservation of allReservations) {
                if (reservation.backendId) {
                    try {
                        await reservationService.deleteReservation(reservation.backendId);
                    } catch (error) {
                        console.error(`Failed to delete reservation ${reservation.id} from backend:`, error);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to clear reservations from backend:', error);
        }

        // Local state'i temizle
        setReservations({});
        localStorage.setItem('reservations', JSON.stringify({}));
        setTableStatus(prev => {
            const newTableStatus = { ...prev };
            Object.keys(newTableStatus).forEach(tableId => {
                if (newTableStatus[tableId] === 'reserved') {
                    newTableStatus[tableId] = 'empty';
                }
            });
            return newTableStatus;
        });
    };

    const updateReservation = async (reservationId, updatedData) => {
        try {
            const reservation = reservations[reservationId];
            
            if (reservation && reservation.backendId) {
                // Backend'de güncelle
                await reservationService.updateReservation(reservation.backendId, updatedData);
                console.log('Reservation updated in backend successfully');
            }
        } catch (error) {
            console.error('Failed to update reservation in backend:', error);
        }

        // Local state'i güncelle
        setReservations(prev => ({
            ...prev,
            [reservationId]: {
                ...prev[reservationId],
                ...updatedData,
                updatedAt: new Date().toISOString()
            }
        }));
    };

    const addProduct = (category, newProduct) => {
        setProducts(prevProducts => {
            const newProducts = { ...prevProducts };
            if (!newProducts[category]) newProducts[category] = [];
            const newId = crypto.randomUUID();
            newProducts[category].push({ ...newProduct, id: newId, category });
            return newProducts;
        });
    };

    const deleteProduct = (category, productId) => {
        setProducts(prevProducts => {
            const newProducts = { ...prevProducts };
            newProducts[category] = newProducts[category].filter(p => p.id !== productId);
            return newProducts;
        });
    };

    const updateProduct = (category, updatedProduct) => {
        setProducts(prevProducts => {
            const newProducts = { ...prevProducts };
            const productIndex = newProducts[category].findIndex(p => p.id === updatedProduct.id);
            if (productIndex > -1) newProducts[category][productIndex] = updatedProduct;
            return newProducts;
        });
    };

    const addOrderHistoryEntry = (orderData, action, personnelName, personnelRole) => {
        const timestamp = new Date().toLocaleString('tr-TR');
        const newEntry = {
            id: crypto.randomUUID(),
            orderContent: orderData.orderContent,
            action: action,
            personnelName: personnelName,
            personnelRole: personnelRole,
            financialImpact: orderData.financialImpact,
            timestamp: timestamp,
            tableId: orderData.tableId
        };

        setOrderHistory(prev => {
            const newHistory = [newEntry, ...prev];
            localStorage.setItem('orderHistory', JSON.stringify(newHistory));
            return newHistory;
        });
    };

    const getOrderContent = (orderItems) => {
        if (!orderItems || Object.keys(orderItems).length === 0) return "Boş sipariş";
        return Object.values(orderItems).map(item => `${item.name} x${item.count}`).join(', ');
    };

    const calculateFinancialImpact = (orderItems, action) => {
        if (!orderItems || Object.keys(orderItems).length === 0) return "0 TL";
        const total = Object.values(orderItems).reduce((sum, item) => sum + (item.price * item.count), 0);
        return (action === "Sipariş Eklendi" || action === "Sipariş Onaylandı") ? `+${total} TL` : `-${total} TL`;
    };

    // localStorage'e verileri kaydet
    useEffect(() => {
        localStorage.setItem('tableStatus', JSON.stringify(tableStatus));
        localStorage.setItem('orders', JSON.stringify(orders));
        localStorage.setItem('completedOrders', JSON.stringify(completedOrders));
        localStorage.setItem('products', JSON.stringify(products));
        localStorage.setItem('reservations', JSON.stringify(reservations));
        localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
    }, [tableStatus, orders, completedOrders, products, reservations, orderHistory]);

    // Güncel sipariş sayımı hesapla
    const now = new Date();
    const todayStr = now.toLocaleDateString();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let dailyCount = 0;
    let monthlyCount = 0;
    let yearlyCount = 0;

    Object.values(completedOrders).forEach((order) => {
        const d = new Date(order.creationDate);
        if (d.toLocaleDateString() === todayStr) dailyCount++;
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) monthlyCount++;
        if (d.getFullYear() === currentYear) yearlyCount++;
    });

    return (
        <TableContext.Provider
            value={{
                // Existing state
                tableStatus,
                orders,
                completedOrders,
                products,
                reservations,
                orderHistory,
                dailyOrderCount: dailyCount,
                monthlyOrderCount: monthlyCount,
                yearlyOrderCount: yearlyCount,
                
                // New backend state
                tables,
                salons,
                loading,
                error,
                
                // Existing functions
                updateTableStatus,
                saveFinalOrder,
                cancelOrder,
                processPayment,
                removeConfirmedOrderItem,
                decreaseConfirmedOrderItem,
                increaseConfirmedOrderItem,
                addReservation,
                addSpecialReservation,
                removeReservation,
                updateReservation,
                clearAllReservations,
                addProduct,
                deleteProduct,
                updateProduct,
                addOrderHistoryEntry,
                getOrderContent,
                calculateFinancialImpact,
                
                // New backend functions
                loadTablesAndSalons
            }}
        >
            {children}
        </TableContext.Provider>
    );
}
