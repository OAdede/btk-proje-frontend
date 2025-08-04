import React, { createContext, useState, useEffect } from 'react';

export const TableContext = createContext();

const initialProducts = {
    "Ana Yemek": [
        { id: 1, name: "Et Döner", price: 535, stock: 50, minStock: 10, category: "Ana Yemek" },
        { id: 2, name: "Döner Beyti Sarma", price: 545, stock: 30, minStock: 5, category: "Ana Yemek" },
        { id: 3, name: "Tereyağlı İskender", price: 560, stock: 25, minStock: 8, category: "Ana Yemek" },
        { id: 4, name: "Pilav Üstü Döner", price: 550, stock: 40, minStock: 12, category: "Ana Yemek" },
        { id: 5, name: "SSK Dürüm Döner", price: 560, stock: 35, minStock: 7, category: "Ana Yemek" },
    ],
    "Aparatifler": [
        { id: 6, name: "Çiğköfte", price: 140, stock: 20, minStock: 5, category: "Aparatifler" },
        { id: 7, name: "Soğan Halkası", price: 130, stock: 15, minStock: 3, category: "Aparatifler" },
        { id: 8, name: "Patates Kızartması", price: 140, stock: 30, minStock: 8, category: "Aparatifler" },
        { id: 9, name: "Börek Çeşitleri", price: 140, stock: 25, minStock: 6, category: "Aparatifler" },
        { id: 10, name: "Salata Çeşitleri", price: 120, stock: 18, minStock: 4, category: "Aparatifler" },
    ],
    "Fırın": [
        { id: 11, name: "Kuşbaşılı Pide", price: 540, stock: 12, minStock: 3, category: "Fırın" },
        { id: 12, name: "Karışık Pide", price: 550, stock: 15, minStock: 4, category: "Fırın" },
        { id: 13, name: "Kaşarlı Pide", price: 470, stock: 20, minStock: 5, category: "Fırın" },
        { id: 14, name: "Kıymalı Pide", price: 490, stock: 18, minStock: 4, category: "Fırın" },
        { id: 15, name: "Lahmacun", price: 170, stock: 30, minStock: 8, category: "Fırın" },
    ],
    "Izgaralar": [
        { id: 16, name: "Patlıcan Kebap", price: 610, stock: 15, minStock: 5, category: "Izgaralar" },
        { id: 17, name: "Special Kebap", price: 570, stock: 20, minStock: 6, category: "Izgaralar" },
        { id: 18, name: "Beyti Sarma", price: 560, stock: 18, minStock: 5, category: "Izgaralar" },
        { id: 19, name: "Tavuk Pirzola", price: 540, stock: 22, minStock: 7, category: "Izgaralar" },
        { id: 20, name: "Izgara Köfte", price: 550, stock: 25, minStock: 8, category: "Izgaralar" },
    ],
    "Kahvaltılıklar": [
        { id: 21, name: "Kahvaltı Tabağı", price: 450, stock: 10, minStock: 3, category: "Kahvaltılıklar" },
        { id: 22, name: "Serpme Kahvaltı", price: 600, stock: 8, minStock: 2, category: "Kahvaltılıklar" },
        { id: 23, name: "Menemen", price: 200, stock: 15, minStock: 5, category: "Kahvaltılıklar" },
        { id: 24, name: "Kuymak", price: 250, stock: 12, minStock: 4, category: "Kahvaltılıklar" },
        { id: 25, name: "Avakado yumurta", price: 130, stock: 20, minStock: 6, category: "Kahvaltılıklar" },
    ],
    "İçecekler": [
        { id: 26, name: "Kola", price: 85, stock: 48, minStock: 12, category: "İçecekler" },
        { id: 27, name: "Fanta", price: 85, stock: 45, minStock: 10, category: "İçecekler" },
        { id: 28, name: "Sprite", price: 85, stock: 42, minStock: 10, category: "İçecekler" },
        { id: 29, name: "Tea", price: 85, stock: 60, minStock: 15, category: "İçecekler" },
        { id: 30, name: "Ayran", price: 75, stock: 35, minStock: 8, category: "İçecekler" },
        { id: 31, name: "Su", price: 30, stock: 100, minStock: 20, category: "İçecekler" },
    ],
    "Tatlılar": [
        { id: 32, name: "Künefe", price: 120, stock: 15, minStock: 5, category: "Tatlılar" },
        { id: 33, name: "Baklava", price: 150, stock: 20, minStock: 6, category: "Tatlılar" },
        { id: 34, name: "Sütlaç", price: 80, stock: 25, minStock: 8, category: "Tatlılar" },
        { id: 35, name: "Kazandibi", price: 100, stock: 18, minStock: 5, category: "Tatlılar" },
        { id: 36, name: "Tiramisu", price: 130, stock: 12, minStock: 4, category: "Tatlılar" },
        { id: 37, name: "Cheesecake", price: 140, stock: 10, minStock: 3, category: "Tatlılar" },
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
                if (category && newProducts[category]) {
                    const productIndex = newProducts[category].findIndex(p => p.id === itemToDecrease.id);
                    if (productIndex > -1) {
                        newProducts[category][productIndex].stock += 1;
                    }
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

    return (
        <TableContext.Provider value={{
            tableStatus, orders, lastOrders, products,
            saveOrder, confirmOrder, processPayment, removeConfirmedOrderItem,
            addProduct, deleteProduct, updateProduct,
            decreaseConfirmedOrderItem, increaseConfirmedOrderItem
        }}>
            {children}
        </TableContext.Provider>
    );
};
