import React, { createContext, useState, useEffect } from "react";

export const TableContext = createContext();

const initialProducts = {
    yemekler: [
        { id: 1, name: "Pizza", price: 120, stock: 10 },
        { id: 2, name: "Hamburger", price: 90, stock: 8 },
        { id: 3, name: "Salata", price: 50, stock: 12 },
        { id: 4, name: "Makarna", price: 80, stock: 7 },
        { id: 5, name: "Köfte", price: 95, stock: 6 },
        { id: 6, name: "Lahmacun", price: 40, stock: 15 },
        { id: 7, name: "Adana Kebap", price: 130, stock: 5 },
        { id: 8, name: "Tavuk Şiş", price: 100, stock: 9 },
        { id: 9, name: "İskender", price: 110, stock: 4 },
        { id: 10, name: "Döner", price: 85, stock: 8 },
        { id: 11, name: "Balık", price: 140, stock: 6 },
        { id: 12, name: "Mantı", price: 70, stock: 10 },
        { id: 13, name: "Çorba", price: 35, stock: 20 },
        { id: 14, name: "Pilav", price: 30, stock: 14 },
        { id: 15, name: "Zeytinyağlı", price: 60, stock: 13 },
    ],
    icecekler: [
        { id: 101, name: "Kola", price: 20, stock: 15 },
        { id: 102, name: "Ayran", price: 10, stock: 12 },
        { id: 103, name: "Su", price: 5, stock: 25 },
        { id: 104, name: "Fanta", price: 20, stock: 10 },
        { id: 105, name: "Sprite", price: 20, stock: 10 },
        { id: 106, name: "Meyve Suyu", price: 18, stock: 11 },
        { id: 107, name: "Soda", price: 8, stock: 14 },
        { id: 108, name: "Ice Tea", price: 15, stock: 9 },
        { id: 109, name: "Kahve", price: 25, stock: 10 },
        { id: 110, name: "Çay", price: 6, stock: 30 },
        { id: 111, name: "Limonata", price: 16, stock: 13 },
        { id: 112, name: "Milkshake", price: 22, stock: 7 },
        { id: 113, name: "Karpuz Suyu", price: 17, stock: 5 },
        { id: 114, name: "Buzlu Kahve", price: 28, stock: 8 },
        { id: 115, name: "Türk Kahvesi", price: 20, stock: 12 },
    ],
    tatlilar: [
        { id: 201, name: "Baklava", price: 50, stock: 10 },
        { id: 202, name: "Künefe", price: 55, stock: 8 },
        { id: 203, name: "Sütlaç", price: 30, stock: 12 },
        { id: 204, name: "Kazandibi", price: 35, stock: 9 },
        { id: 205, name: "Dondurma", price: 20, stock: 15 },
        { id: 206, name: "Profiterol", price: 40, stock: 11 },
        { id: 207, name: "Tiramisu", price: 45, stock: 7 },
        { id: 208, name: "Cheesecake", price: 48, stock: 6 },
        { id: 209, name: "Mousse", price: 42, stock: 10 },
        { id: 210, name: "Magnolia", price: 38, stock: 9 },
        { id: 211, name: "Revani", price: 36, stock: 13 },
        { id: 212, name: "İrmik Helvası", price: 34, stock: 14 },
        { id: 213, name: "Şekerpare", price: 33, stock: 11 },
        { id: 214, name: "Trileçe", price: 44, stock: 10 },
        { id: 215, name: "Meyve Tabağı", price: 25, stock: 16 },
    ],
};

const initialTableStatus = {};

function readFromLocalStorage(key, defaultValue) {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch {
        return defaultValue;
    }
}

export function TableProvider({ children }) {
    const [tableStatus, setTableStatus] = useState(() => readFromLocalStorage('tableStatus', initialTableStatus));
    const [orders, setOrders] = useState(() => readFromLocalStorage('orders', {}));
    const [lastOrders, setLastOrders] = useState(() => readFromLocalStorage('lastOrders', {}));
    const [products, setProducts] = useState(() => readFromLocalStorage('products', initialProducts));
    const [reservations, setReservations] = useState(() => readFromLocalStorage('reservations', {}));
    const [timestamps, setTimestamps] = useState({}); // Sipariş zamanları

    const [dailyOrderCount, setDailyOrderCount] = useState(0);
    const [monthlyOrderCount, setMonthlyOrderCount] = useState(0);
    const [yearlyOrderCount, setYearlyOrderCount] = useState(0);

    // Masa durumunu güncelle
    const updateTableStatus = (tableId, status) => {
        setTableStatus(prev => ({ ...prev, [tableId]: status }));
    };

    // Siparişi kaydet (ürün stoklarını güncelle ve sipariş durumunu ayarla)
    const saveFinalOrder = (tableId, finalItems) => {
        const prevOrder = orders[tableId] || {};
        const updatedProducts = { ...products };

        const totalPrice = Object.values(finalItems).reduce(
            (sum, item) => sum + item.price * item.count,
            0
        );
        const isOrderEmpty = totalPrice === 0;

        // Stok farklarını güncelle
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

        // Önceki siparişten kalan ürünleri stok olarak geri ekle
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

            // Sipariş zamanını güncelle
            setTimestamps(prev => ({
                ...prev,
                [tableId]: Date.now(),
            }));

            updateTableStatus(tableId, "occupied");
        }
    };

    // Siparişi iptal et ve stokları geri yükle
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

    // Ödeme işlemi
    const processPayment = (tableId) => {
        setTableStatus(prev => ({ ...prev, [tableId]: 'empty' }));
        setOrders(prev => {
            const newOrders = { ...prev };
            delete newOrders[tableId];
            return newOrders;
        });
    };

    // Sipariş kalemini kaldır
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

    // Sipariş kalemi adet azalt
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

    // Sipariş kalemi adet artır
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

    // Rezervasyon ekle
    const addReservation = (tableId, reservationData) => {
        const reservationId = crypto.randomUUID();
        const newReservation = {
            id: reservationId,
            tableId,
            ...reservationData,
            createdAt: new Date().toISOString()
        };

        setReservations(prev => ({
            ...prev,
            [tableId]: newReservation
        }));

        setTableStatus(prev => ({ ...prev, [tableId]: 'reserved' }));

        return reservationId;
    };

    // Rezervasyon kaldır
    const removeReservation = (tableId) => {
        setReservations(prev => {
            const newReservations = { ...prev };
            delete newReservations[tableId];
            return newReservations;
        });

        setTableStatus(prev => ({ ...prev, [tableId]: 'empty' }));
    };

    // Ürün ekle
    const addProduct = (category, newProduct) => {
        setProducts(prevProducts => {
            const newProducts = { ...prevProducts };
            if (!newProducts[category]) newProducts[category] = [];
            const newId = crypto.randomUUID();
            newProducts[category].push({ ...newProduct, id: newId, category });
            return newProducts;
        });
    };

    // Ürün sil
    const deleteProduct = (category, productId) => {
        setProducts(prevProducts => {
            const newProducts = { ...prevProducts };
            newProducts[category] = newProducts[category].filter(p => p.id !== productId);
            return newProducts;
        });
    };

    // Ürün güncelle
    const updateProduct = (category, updatedProduct) => {
        setProducts(prevProducts => {
            const newProducts = { ...prevProducts };
            const productIndex = newProducts[category].findIndex(p => p.id === updatedProduct.id);
            if (productIndex > -1) newProducts[category][productIndex] = updatedProduct;
            return newProducts;
        });
    };

    // Sipariş sayaçlarını hesapla
    useEffect(() => {
        const now = new Date();
        const todayStr = now.toDateString();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let daily = 0, monthly = 0, yearly = 0;

        Object.values(timestamps).forEach((ts) => {
            const d = new Date(ts);
            if (d.toDateString() === todayStr) daily++;
            if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) monthly++;
            if (d.getFullYear() === currentYear) yearly++;
        });

        setDailyOrderCount(daily);
        setMonthlyOrderCount(monthly);
        setYearlyOrderCount(yearly);
    }, [timestamps]);

    // LocalStorage'a kaydet
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
                dailyOrderCount,
                monthlyOrderCount,
                yearlyOrderCount,
                updateTableStatus,
                saveFinalOrder,
                cancelOrder,
                processPayment,
                removeConfirmedOrderItem,
                decreaseConfirmedOrderItem,
                increaseConfirmedOrderItem,
                addReservation,
                removeReservation,
                addProduct,
                deleteProduct,
                updateProduct,
            }}
        >
            {children}
        </TableContext.Provider>
    );
}
