import React, { createContext, useState, useEffect } from 'react';

export const TableContext = createContext();

// Örnek başlangıç verileri
const initialProducts = {
    yemekler: [
        { id: 1, name: 'Burger', price: 250, stock: 15, category: "yemekler" },
        { id: 2, name: 'Pizza', price: 300, stock: 20, category: "yemekler" },
        { id: 3, name: 'Makarna', price: 200, stock: 25, category: "yemekler" },
    ],
    icecekler: [
        { id: 4, name: 'Kola', price: 50, stock: 50, category: "icecekler" },
        { id: 5, name: 'Ayran', price: 40, stock: 40, category: "icecekler" },
        { id: 6, name: 'Su', price: 20, stock: 100, category: "icecekler" },
    ],
    tatlilar: [
        { id: 7, name: 'Sufle', price: 150, stock: 10, category: "tatlilar" },
        { id: 8, name: 'Cheesecake', price: 180, stock: 8, category: "tatlilar" },
    ],
};

const initialTableStatus = {
    '1-1': 'empty', '1-2': 'empty', '1-3': 'empty', '1-4': 'empty', '1-5': 'empty', '1-6': 'empty', '1-7': 'empty', '1-8': 'empty',
    '2-1': 'empty', '2-2': 'empty', '2-3': 'empty', '2-4': 'empty', '2-5': 'empty', '2-6': 'empty', '2-7': 'empty', '2-8': 'empty'
};

export const TableProvider = ({ children }) => {
    // LocalStorage'dan veri okuma fonksiyonu
    const readFromLocalStorage = (key, defaultValue) => {
        try {
            const savedData = localStorage.getItem(key);
            return savedData ? JSON.parse(savedData) : defaultValue;
        } catch (error) {
            console.error(`Error reading ${key} from localStorage`, error);
            return defaultValue;
        }
    };

    const [tableStatus, setTableStatus] = useState(() => readFromLocalStorage('tableStatus', initialTableStatus));
    const [orders, setOrders] = useState(() => readFromLocalStorage('orders', {}));
    const [lastOrders, setLastOrders] = useState(() => readFromLocalStorage('lastOrders', {}));
    const [products, setProducts] = useState(() => readFromLocalStorage('products', initialProducts));

    useEffect(() => {
        localStorage.setItem('tableStatus', JSON.stringify(tableStatus));
        localStorage.setItem('orders', JSON.stringify(orders));
        localStorage.setItem('lastOrders', JSON.stringify(lastOrders));
        localStorage.setItem('products', JSON.stringify(products));
    }, [tableStatus, orders, lastOrders, products]);

    // Siparişi kaydet (onaylanmamış)
    const saveOrder = (tableId, cart) => {
        setLastOrders(prev => ({ ...prev, [tableId]: cart }));
    };

    // Siparişi onayla
    const confirmOrder = (tableId) => {
        const newOrder = lastOrders[tableId];
        if (!newOrder) return;

        // Siparişi ana listeye ekle/güncelle
        setOrders(prev => {
            const existingOrder = prev[tableId] || {};
            const updatedOrder = { ...existingOrder };

            Object.keys(newOrder).forEach(key => {
                if (updatedOrder[key]) {
                    updatedOrder[key].count += newOrder[key].count;
                } else {
                    updatedOrder[key] = newOrder[key];
                }
            });
            return { ...prev, [tableId]: updatedOrder };
        });

        // Stoktan düş
        setProducts(prevProducts => {
            const newProducts = JSON.parse(JSON.stringify(prevProducts)); // Deep copy
            Object.values(newOrder).forEach(item => {
                const category = Object.keys(newProducts).find(cat => newProducts[cat].some(p => p.name === item.name));
                if (category) {
                    const product = newProducts[category].find(p => p.name === item.name);
                    if (product) {
                        product.stock -= item.count;
                    }
                }
            });
            return newProducts;
        });

        // Masa durumunu güncelle
        setTableStatus(prev => ({ ...prev, [tableId]: 'occupied' }));

        // Onaylanan siparişi temizle
        setLastOrders(prev => {
            const newLastOrders = { ...prev };
            delete newLastOrders[tableId];
            return newLastOrders;
        });
    };

    // Ödeme al ve masayı temizle
    const processPayment = (tableId) => {
        setTableStatus(prev => ({ ...prev, [tableId]: 'empty' }));
        setOrders(prev => {
            const newOrders = { ...prev };
            delete newOrders[tableId];
            return newOrders;
        });
    };

    return (
        <TableContext.Provider value={{
            tableStatus,
            orders,
            lastOrders,
            products,
            saveOrder,
            confirmOrder,
            processPayment
        }}>
            {children}
        </TableContext.Provider>
    );
};
