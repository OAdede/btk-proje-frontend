import React, { createContext, useState, useEffect } from 'react';

export const TableContext = createContext();

// Örnek başlangıç verileri
const initialProducts = {
    yemekler: [
        { id: 1, name: 'Burger', price: 250, stock: 15 },
        { id: 2, name: 'Pizza', price: 300, stock: 20 },
        { id: 3, name: 'Makarna', price: 200, stock: 25 },
    ],
    icecekler: [
        { id: 4, name: 'Kola', price: 50, stock: 50 },
        { id: 5, name: 'Ayran', price: 40, stock: 40 },
        { id: 6, name: 'Su', price: 20, stock: 100 },
    ],
    tatlilar: [
        { id: 7, name: 'Sufle', price: 150, stock: 10 },
        { id: 8, name: 'Cheesecake', price: 180, stock: 8 },
    ],
};

const initialTableStatus = {
    '1': 'bos', '2': 'bos', '3': 'bos', '4': 'bos', '5': 'bos',
    '6': 'bos', '7': 'bos', '8': 'bos', '9': 'bos', '10': 'bos',
};


export const TableProvider = ({ children }) => {
    const [tableStatus, setTableStatus] = useState(() => {
        try {
            const savedStatus = localStorage.getItem('tableStatus');
            return savedStatus ? JSON.parse(savedStatus) : initialTableStatus;
        } catch (error) {
            return initialTableStatus;
        }
    });

    const [orders, setOrders] = useState(() => {
        try {
            const savedOrders = localStorage.getItem('orders');
            return savedOrders ? JSON.parse(savedOrders) : {};
        } catch (error) {
            return {};
        }
    });

    const [products, setProducts] = useState(initialProducts);

    useEffect(() => {
        localStorage.setItem('tableStatus', JSON.stringify(tableStatus));
        localStorage.setItem('orders', JSON.stringify(orders));
    }, [tableStatus, orders]);

    const saveOrder = (tableId, cart) => {
        // Siparişi onayla ve masanın durumunu 'dolu' yap
        setOrders(prev => ({ ...prev, [tableId]: { ...cart } }));
        setTableStatus(prev => ({ ...prev, [tableId]: 'dolu' }));

        // Stoktan düş
        setProducts(prevProducts => {
            const newProducts = JSON.parse(JSON.stringify(prevProducts)); // Deep copy
            Object.values(cart).forEach(item => {
                for (const category in newProducts) {
                    const product = newProducts[category].find(p => p.name === item.name);
                    if (product) {
                        product.stock -= item.count;
                        break;
                    }
                }
            });
            return newProducts;
        });
    };

    const payAndClearTable = (tableId) => {
        // Ödeme al, masayı 'bos' yap ve siparişi temizle
        setTableStatus(prev => ({ ...prev, [tableId]: 'bos' }));
        setOrders(prev => {
            const newOrders = { ...prev };
            delete newOrders[tableId];
            return newOrders;
        });
    };

    return (
        <TableContext.Provider value={{ tableStatus, orders, products, saveOrder, payAndClearTable }}>
            {children}
        </TableContext.Provider>
    );
};
