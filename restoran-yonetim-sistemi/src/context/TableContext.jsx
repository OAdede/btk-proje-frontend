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

export function TableProvider({ children }) {
    const [tableStatus, setTableStatus] = useState({});
    const [orders, setOrders] = useState({});
    const [products, setProducts] = useState(initialProducts);
    const [timestamps, setTimestamps] = useState({}); // ğŸ•’ sipariÅŸ zamanlarÄ±

    const [dailyOrderCount, setDailyOrderCount] = useState(0);
    const [monthlyOrderCount, setMonthlyOrderCount] = useState(0);
    const [yearlyOrderCount, setYearlyOrderCount] = useState(0);

    const updateTableStatus = (tableId, status) => {
        setTableStatus((prev) => ({ ...prev, [tableId]: status }));
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

            // zaman damgasÄ±nÄ± da sil
            setTimestamps((prev) => {
                const copy = { ...prev };
                delete copy[tableId];
                return copy;
            });
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

            setTimestamps((prev) => {
                const copy = { ...prev };
                delete copy[tableId];
                return copy;
            });

            updateTableStatus(tableId, "empty");
        } else {
            setOrders((prev) => ({ ...prev, [tableId]: finalItems }));

            // â± sipariÅŸin zamanÄ±nÄ± gÃ¼ncelle
            setTimestamps((prev) => ({
                ...prev,
                [tableId]: Date.now(),
            }));

            updateTableStatus(tableId, "occupied");
        }
    };

    // ğŸ” SipariÅŸ sayaÃ§larÄ±nÄ± hesapla
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

    return (
        <TableContext.Provider
            value={{
                tableStatus,
                updateTableStatus,
                orders,
                products,
                saveFinalOrder,
                cancelOrder,
                dailyOrderCount,
                monthlyOrderCount,
                yearlyOrderCount,
            }}
        >
            {children}
        </TableContext.Provider>
    );
}
