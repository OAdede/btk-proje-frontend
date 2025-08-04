import React, { createContext, useState, useEffect } from 'react';

export const TableContext = createContext();

// TEK VE MERKEZİ ÜRÜN LİSTESİ
// StokUpdate.jsx'teki detaylı liste ile birleştirildi ve eksik alanlar (id, price) eklendi.
const initialProducts = {
    "Ana Yemek": [
        { id: 1, name: "Et Döner", price: 280, stock: 50, minStock: 10, category: "Ana Yemek" },
        { id: 2, name: "Döner Beyti Sarma", price: 320, stock: 30, minStock: 5, category: "Ana Yemek" },
        { id: 3, name: "Tereyağlı İskender", price: 300, stock: 25, minStock: 8, category: "Ana Yemek" },
        { id: 4, name: "Pilav Üstü Döner", price: 260, stock: 40, minStock: 12, category: "Ana Yemek" },
        { id: 5, name: "SSK Dürüm Döner", price: 240, stock: 35, minStock: 7, category: "Ana Yemek" },
    ],
    "Aparatifler": [
        { id: 6, name: "Çiğköfte", price: 100, stock: 20, minStock: 5, category: "Aparatifler" },
        { id: 7, name: "Soğan Halkası", price: 120, stock: 15, minStock: 3, category: "Aparatifler" },
        { id: 8, name: "Patates Kızartması", price: 90, stock: 30, minStock: 8, category: "Aparatifler" },
        { id: 9, name: "Börek Çeşitleri", price: 150, stock: 25, minStock: 6, category: "Aparatifler" },
        { id: 10, name: "Salata Çeşitleri", price: 130, stock: 18, minStock: 4, category: "Aparatifler" },
    ],
    "Fırın": [
        { id: 11, name: "Kuşbaşılı Pide", price: 250, stock: 12, minStock: 3, category: "Fırın" },
        { id: 12, name: "Karışık Pide", price: 270, stock: 15, minStock: 4, category: "Fırın" },
        { id: 13, name: "Kaşarlı Pide", price: 230, stock: 20, minStock: 5, category: "Fırın" },
        { id: 14, name: "Kıymalı Pide", price: 240, stock: 18, minStock: 4, category: "Fırın" },
        { id: 15, name: "Lahmacun", price: 80, stock: 30, minStock: 8, category: "Fırın" },
    ],
    "Izgaralar": [
        { id: 16, name: "Patlıcan Kebap", price: 350, stock: 15, minStock: 5, category: "Izgaralar" },
        { id: 17, name: "Special Kebap", price: 400, stock: 20, minStock: 6, category: "Izgaralar" },
        { id: 18, name: "Beyti Sarma", price: 330, stock: 18, minStock: 5, category: "Izgaralar" },
        { id: 19, name: "Tavuk Pirzola", price: 280, stock: 22, minStock: 7, category: "Izgaralar" },
        { id: 20, name: "Izgara Köfte", price: 290, stock: 25, minStock: 8, category: "Izgaralar" },
    ],
    "Kahvaltılıklar": [
        { id: 21, name: "Kahvaltı Tabağı", price: 250, stock: 10, minStock: 3, category: "Kahvaltılıklar" },
        { id: 22, name: "Serpme Kahvaltı", price: 500, stock: 8, minStock: 2, category: "Kahvaltılıklar" },
        { id: 23, name: "Menemen", price: 150, stock: 15, minStock: 5, category: "Kahvaltılıklar" },
        { id: 24, name: "Kuymak", price: 180, stock: 12, minStock: 4, category: "Kahvaltılıklar" },
        { id: 25, name: "Avakado yumurta", price: 190, stock: 20, minStock: 6, category: "Kahvaltılıklar" },
    ],
    "İçecekler": [
        { id: 26, name: "Kola", price: 50, stock: 48, minStock: 12, category: "İçecekler" },
        { id: 27, name: "Fanta", price: 50, stock: 45, minStock: 10, category: "İçecekler" },
        { id: 28, name: "Sprite", price: 50, stock: 42, minStock: 10, category: "İçecekler" },
        { id: 29, name: "Tea", price: 40, stock: 60, minStock: 15, category: "İçecekler" },
        { id: 30, name: "Ayran", price: 40, stock: 35, minStock: 8, category: "İçecekler" },
        { id: 31, name: "Su", price: 20, stock: 100, minStock: 20, category: "İçecekler" },
    ],
    "Tatlılar": [
        { id: 32, name: "Künefe", price: 180, stock: 15, minStock: 5, category: "Tatlılar" },
        { id: 33, name: "Baklava", price: 200, stock: 20, minStock: 6, category: "Tatlılar" },
        { id: 34, name: "Sütlaç", price: 120, stock: 25, minStock: 8, category: "Tatlılar" },
        { id: 35, name: "Kazandibi", price: 120, stock: 18, minStock: 5, category: "Tatlılar" },
        { id: 36, name: "Tiramisu", price: 160, stock: 12, minStock: 4, category: "Tatlılar" },
        { id: 37, name: "Cheesecake", price: 170, stock: 10, minStock: 3, category: "Tatlılar" },
    ],
};

const initialTableStatus = {
    '1-1': 'empty', '1-2': 'empty', '1-3': 'empty', '1-4': 'empty', '1-5': 'empty', '1-6': 'empty', '1-7': 'empty', '1-8': 'empty',
    '2-1': 'empty', '2-2': 'empty', '2-3': 'empty', '2-4': 'empty', '2-5': 'empty', '2-6': 'empty', '2-7': 'empty', '2-8': 'empty'
};

export const TableProvider = ({ children }) => {
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

    const saveOrder = (tableId, cart) => {
        setLastOrders(prev => ({ ...prev, [tableId]: cart }));
    };

    const confirmOrder = (tableId) => {
        const newOrder = lastOrders[tableId];
        if (!newOrder) return;

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

        setProducts(prevProducts => {
            const newProducts = JSON.parse(JSON.stringify(prevProducts));
            Object.values(newOrder).forEach(item => {
                const category = Object.keys(newProducts).find(cat => newProducts[cat].some(p => p.id === item.id));
                if (category) {
                    const productIndex = newProducts[category].findIndex(p => p.id === item.id);
                    if (productIndex > -1) {
                        newProducts[category][productIndex].stock -= item.count;
                    }
                }
            });
            return newProducts;
        });

        setTableStatus(prev => ({ ...prev, [tableId]: 'occupied' }));

        setLastOrders(prev => {
            const newLastOrders = { ...prev };
            delete newLastOrders[tableId];
            return newLastOrders;
        });
    };

    const processPayment = (tableId) => {
        setTableStatus(prev => ({ ...prev, [tableId]: 'empty' }));
        setOrders(prev => {
            const newOrders = { ...prev };
            delete newOrders[tableId];
            return newOrders;
        });
    };

    // Admin paneli için yeni fonksiyonlar
    const addProduct = (category, newProduct) => {
        setProducts(prevProducts => {
            const newProducts = { ...prevProducts };
            if (!newProducts[category]) {
                newProducts[category] = [];
            }
            const newId = crypto.randomUUID(); // Gerçek benzersiz ID üretimi
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
            if (productIndex > -1) {
                newProducts[category][productIndex] = updatedProduct;
            }
            return newProducts;
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
            processPayment,
            addProduct,
            deleteProduct,
            updateProduct
        }}>
            {children}
        </TableContext.Provider>
    );
};
