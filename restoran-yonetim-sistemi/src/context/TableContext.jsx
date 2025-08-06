import React, { createContext, useState, useEffect } from "react";

export const TableContext = createContext();

// ... initialProducts, initialTableStatus ve readFromLocalStorage kısmı değişmedi

export function TableProvider({ children }) {
    // State tanımlamaları
    const [tableStatus, setTableStatus] = useState(() => readFromLocalStorage('tableStatus', initialTableStatus));
    const [orders, setOrders] = useState(() => readFromLocalStorage('orders', {}));
    const [lastOrders, setLastOrders] = useState(() => readFromLocalStorage('lastOrders', {}));
    const [products, setProducts] = useState(() => readFromLocalStorage('products', initialProducts));
    const [reservations, setReservations] = useState(() => readFromLocalStorage('reservations', {}));
    const [timestamps, setTimestamps] = useState({});

    const [dailyOrderCount, setDailyOrderCount] = useState(() => {
        const stored = localStorage.getItem('dailyOrderCount');
        if (stored) {
            const data = JSON.parse(stored);
            const today = new Date().toDateString();
            if (data.date !== today) return 0;
            return data.count;
        }
        return 0;
    });
    const [monthlyOrderCount, setMonthlyOrderCount] = useState(0);
    const [yearlyOrderCount, setYearlyOrderCount] = useState(0);

    const updateTableStatus = (tableId, status) => {
        setTableStatus(prev => ({ ...prev, [tableId]: status }));
    };

    const isWorkingHours = () => {
        const now = new Date();
        const currentHour = now.getHours();
        return currentHour >= 9 && currentHour < 22;
    };

    const incrementDailyOrderCount = () => {
        if (!isWorkingHours()) return;
        const today = new Date().toDateString();
        const newCount = dailyOrderCount + 1;
        setDailyOrderCount(newCount);
        localStorage.setItem('dailyOrderCount', JSON.stringify({
            date: today,
            count: newCount
        }));
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
            if (!prevOrder || Object.keys(prevOrder).length === 0) {
                incrementDailyOrderCount();
            }

            setOrders(prev => ({ ...prev, [tableId]: finalItems }));

            setTimestamps(prev => ({
                ...prev,
                [tableId]: Date.now(),
            }));

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

    const removeReservation = (tableId) => {
        setReservations(prev => {
            const newReservations = { ...prev };
            delete newReservations[tableId];
            return newReservations;
        });
        setTableStatus(prev => ({ ...prev, [tableId]: 'empty' }));
    };

    const clearAllReservations = () => {
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
                clearAllReservations,
                addProduct,
                deleteProduct,
                updateProduct
            }}
        >
            {children}
        </TableContext.Provider>
    );
}
