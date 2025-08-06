import React, { createContext, useState, useEffect } from "react";

export const TableContext = createContext();

const initialProducts = {
    "Ana Yemek": [
        { id: 1, name: "Pizza", price: 120, stock: 10, category: "Ana Yemek" },
        { id: 2, name: "Hamburger", price: 90, stock: 8, category: "Ana Yemek" },
    ],
    "İçecekler": [
        { id: 101, name: "Kola", price: 20, stock: 15, category: "İçecekler" },
        { id: 102, name: "Ayran", price: 10, stock: 12, category: "İçecekler" },
    ],
    "Tatlılar": [
        { id: 201, name: "Baklava", price: 50, stock: 10, category: "Tatlılar" },
        { id: 202, name: "Künefe", price: 55, stock: 8, category: "Tatlılar" },
    ],
};

function readFromLocalStorage(key, defaultValue) {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch {
        return defaultValue;
    }
}

export function TableProvider({ children }) {
    const [tableStatus, setTableStatus] = useState(() => readFromLocalStorage('tableStatus', {}));
    const [orders, setOrders] = useState(() => readFromLocalStorage('orders', {}));
    const [lastOrders, setLastOrders] = useState(() => readFromLocalStorage('lastOrders', {}));
    const [products, setProducts] = useState(() => readFromLocalStorage('products', initialProducts));
    const [reservations, setReservations] = useState(() => readFromLocalStorage('reservations', {}));

    const updateLastOrder = (tableId, finalCart, initialOrder) => {
        const changes = {};
        const allKeys = new Set([...Object.keys(finalCart), ...Object.keys(initialOrder)]);

        allKeys.forEach(id => {
            const finalCount = finalCart[id]?.count || 0;
            const initialCount = initialOrder[id]?.count || 0;
            if (finalCount !== initialCount) {
                changes[id] = { ...finalCart[id], count: finalCount - initialCount };
            }
        });
        setLastOrders(prev => ({ ...prev, [tableId]: changes }));
    };

    const confirmOrder = (tableId) => {
        const changes = lastOrders[tableId] || {};
        if (Object.keys(changes).length === 0) return;

        setProducts(prevProducts => {
            const updatedProducts = JSON.parse(JSON.stringify(prevProducts));
            Object.values(changes).forEach(item => {
                const category = item.category;
                if (category && updatedProducts[category]) {
                    const productIndex = updatedProducts[category].findIndex(p => p.id === item.id);
                    if (productIndex !== -1) {
                        updatedProducts[category][productIndex].stock -= item.count;
                    }
                }
            });
            return updatedProducts;
        });

        setOrders(prevOrders => {
            const updatedOrders = { ...prevOrders };
            const currentOrder = updatedOrders[tableId] || {};
            Object.entries(changes).forEach(([id, item]) => {
                const currentCount = currentOrder[id]?.count || 0;
                const newCount = currentCount + item.count;
                if (newCount > 0) {
                    currentOrder[id] = { ...item, count: newCount };
                } else {
                    delete currentOrder[id];
                }
            });
            if (Object.keys(currentOrder).length === 0) {
                delete updatedOrders[tableId];
            } else {
                updatedOrders[tableId] = currentOrder;
            }
            return updatedOrders;
        });

        clearLastOrder(tableId);
        updateTableStatus(tableId, Object.keys(orders[tableId] || {}).length > 0 ? "occupied" : "empty");
    };

    const clearLastOrder = (tableId) => {
        setLastOrders(prev => {
            const newLastOrders = { ...prev };
            delete newLastOrders[tableId];
            return newLastOrders;
        });
    };

    const updateTableStatus = (tableId, status) => {
        setTableStatus(prev => ({ ...prev, [tableId]: status }));
    };

    const processPayment = (tableId) => {
        setTableStatus(prev => ({ ...prev, [tableId]: 'empty' }));
        setOrders(prev => {
            const newOrders = { ...prev };
            delete newOrders[tableId];
            return newOrders;
        });
    };

    // Diğer fonksiyonlar...
    const decreaseConfirmedOrderItem = (tableId, itemToDecrease) => {
        // Bu fonksiyonun mantığı artık `updateLastOrder` ve `confirmOrder` içinde
        // ele alındığı için basitleştirilebilir veya kaldırılabilir.
        // Şimdilik doğrudan `orders`'ı değiştirmemesi için boş bırakıyorum.
    };

    const increaseConfirmedOrderItem = (tableId, itemToIncrease) => {
        // Benzer şekilde, bu da artık yeni akışla yönetiliyor.
    };

    // Rezervasyon ekleme fonksiyonu
    const addReservation = (tableId, reservationData) => {
        setReservations(prev => ({
            ...prev,
            [tableId]: reservationData
        }));
        // Rezervasyon eklendiğinde masa durumunu rezerve olarak güncelle
        updateTableStatus(tableId, 'reserved');
    };

    // Rezervasyon silme fonksiyonu
    const removeReservation = (tableId) => {
        console.log('Rezervasyon siliniyor:', tableId);

        setReservations(prev => {
            const newReservations = { ...prev };
            delete newReservations[tableId];
            console.log('Güncellenmiş rezervasyonlar:', newReservations);
            return newReservations;
        });

        // Rezervasyon silindiğinde masa durumunu boş olarak güncelle
        updateTableStatus(tableId, 'empty');

        // localStorage'ı da temizle
        const currentReservations = JSON.parse(localStorage.getItem('reservations') || '{}');
        delete currentReservations[tableId];
        localStorage.setItem('reservations', JSON.stringify(currentReservations));
    };

    // Tüm rezervasyonları temizleme fonksiyonu (debug için)
    const clearAllReservations = () => {
        setReservations({});
        localStorage.setItem('reservations', JSON.stringify({}));
        
        // Tüm masaları boş duruma getir
        setTableStatus(prev => {
            const newTableStatus = { ...prev };
            Object.keys(newTableStatus).forEach(tableId => {
                // Sadece rezerve olan masaları boş yap, dolu masaları etkileme
                if (newTableStatus[tableId] === 'reserved') {
                    newTableStatus[tableId] = 'empty';
                }
            });
            return newTableStatus;
        });
        
        console.log('Tüm rezervasyonlar temizlendi ve masalar boş duruma getirildi');
    };


    useEffect(() => {
        localStorage.setItem('tableStatus', JSON.stringify(tableStatus));
        localStorage.setItem('orders', JSON.stringify(orders));
        localStorage.setItem('lastOrders', JSON.stringify(lastOrders));
        localStorage.setItem('products', JSON.stringify(products));
        localStorage.setItem('reservations', JSON.stringify(reservations));
    }, [tableStatus, orders, lastOrders, products, reservations]);

    return (
        <TableContext.Provider
            value={{
                tableStatus,
                orders,
                lastOrders,
                products,
                reservations,
                updateTableStatus,
                processPayment,
                confirmOrder,
                updateLastOrder,
                clearLastOrder,
                decreaseConfirmedOrderItem,
                increaseConfirmedOrderItem,
                addReservation,
                removeReservation,
                clearAllReservations,
            }}
        >
            {children}
        </TableContext.Provider>
    );
}