import React, { createContext, useState, useEffect } from "react";

export const TableContext = createContext();

const initialProducts = {
    yemekler: [
        { id: 1, name: "Pizza", price: 120, stock: 10 },
        { id: 2, name: "Hamburger", price: 90, stock: 8 },
        { id: 3, name: "Salata", price: 50, stock: 12 },
        { id: 4, name: "Makarna", price: 80, stock: 7 },
    ],
    icecekler: [
        { id: 101, name: "Kola", price: 20, stock: 15 },
        { id: 102, name: "Ayran", price: 10, stock: 12 },
        { id: 103, name: "Su", price: 5, stock: 25 },
    ],
    tatlilar: [
        { id: 201, name: "Baklava", price: 50, stock: 10 },
        { id: 202, name: "Künefe", price: 55, stock: 8 },
        { id: 203, name: "Sütlaç", price: 30, stock: 12 },
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

    // Sipariş onaylama mantığını merkezileştir
    const confirmOrder = (tableId) => {
        const newItems = lastOrders[tableId] || {};
        if (Object.keys(newItems).length === 0) return;

        // 1. Stokları Güncelle
        setProducts(prevProducts => {
            const updatedProducts = JSON.parse(JSON.stringify(prevProducts)); // Deep copy
            Object.values(newItems).forEach(item => {
                for (const category in updatedProducts) {
                    const productIndex = updatedProducts[category].findIndex(p => p.id === item.id);
                    if (productIndex !== -1) {
                        updatedProducts[category][productIndex].stock -= item.count;
                        break;
                    }
                }
            });
            return updatedProducts;
        });

        // 2. Siparişleri Birleştir
        setOrders(prevOrders => {
            const updatedOrders = { ...prevOrders };
            const currentOrder = updatedOrders[tableId] || {};
            Object.values(newItems).forEach(newItem => {
                if (currentOrder[newItem.id]) {
                    currentOrder[newItem.id].count += newItem.count;
                } else {
                    currentOrder[newItem.id] = newItem;
                }
            });
            updatedOrders[tableId] = currentOrder;
            return updatedOrders;
        });

        // 3. Onaylanan siparişleri temizle
        clearLastOrder(tableId);

        // 4. Masa durumunu güncelle
        updateTableStatus(tableId, "occupied");
    };

    const updateLastOrder = (tableId, items) => {
        setLastOrders(prev => ({ ...prev, [tableId]: items }));
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

    // Ödeme sonrası masayı temizle
    const processPayment = (tableId) => {
        // Ödenen siparişin stokları geri eklenmez.
        setTableStatus(prev => ({ ...prev, [tableId]: 'empty' }));
        setOrders(prev => {
            const newOrders = { ...prev };
            delete newOrders[tableId];
            return newOrders;
        });
    };

    // Diğer fonksiyonlar (addProduct, vb.) buraya eklenebilir.
    // ...

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
                clearLastOrder
                // Diğer fonksiyonları da buraya ekleyin
            }}
        >
            {children}
        </TableContext.Provider>
    );
}