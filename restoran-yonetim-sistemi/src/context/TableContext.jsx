import React, { createContext, useState, useEffect } from "react";

export const TableContext = createContext();

const initialProducts = {
  "Ana Yemek": [
    { id: 1, name: "Et Döner", price: 150, stock: 50 },
    { id: 2, name: "Döner Beyti Sarma", price: 180, stock: 30 },
    { id: 3, name: "Tereyağlı İskender", price: 200, stock: 25 },
    { id: 4, name: "Pilav Üstü Döner", price: 140, stock: 40 },
    { id: 5, name: "SSK Dürüm Döner", price: 120, stock: 35 },
  ],
  "Aparatifler": [
    { id: 6, name: "Çiğköfte", price: 60, stock: 20 },
    { id: 7, name: "Soğan Halkası", price: 50, stock: 15 },
    { id: 8, name: "Patates Kızartması", price: 40, stock: 30 },
    { id: 9, name: "Börek Çeşitleri", price: 70, stock: 25 },
    { id: 10, name: "Salata Çeşitleri", price: 55, stock: 18 },
  ],
  "Fırın": [
    { id: 11, name: "Kuşbaşılı Pide", price: 130, stock: 12 },
    { id: 12, name: "Karışık Pide", price: 140, stock: 15 },
    { id: 13, name: "Kaşarlı Pide", price: 120, stock: 20 },
    { id: 14, name: "Kıymalı Pide", price: 125, stock: 18 },
    { id: 15, name: "Lahmacun", price: 50, stock: 30 },
  ],
  "Izgaralar": [
    { id: 16, name: "Patlıcan Kebap", price: 160, stock: 15 },
    { id: 17, name: "Special Kebap", price: 220, stock: 20 },
    { id: 18, name: "Beyti Sarma", price: 190, stock: 18 },
    { id: 19, name: "Tavuk Pirzola", price: 150, stock: 22 },
    { id: 20, name: "Izgara Köfte", price: 140, stock: 25 },
  ],
  "Kahvaltılıklar": [
    { id: 21, name: "Kahvaltı Tabağı", price: 150, stock: 10 },
    { id: 22, name: "Serpme Kahvaltı", price: 250, stock: 8 },
    { id: 23, name: "Menemen", price: 80, stock: 15 },
    { id: 24, name: "Kuymak", price: 90, stock: 12 },
    { id: 25, name: "Avakado yumurta", price: 110, stock: 20 },
  ],
  "İçecekler": [
    { id: 101, name: "Kola", price: 30, stock: 48 },
    { id: 102, name: "Fanta", price: 30, stock: 45 },
    { id: 103, name: "Sprite", price: 30, stock: 42 },
    { id: 104, name: "Ice Tea", price: 30, stock: 60 },
    { id: 105, name: "Ayran", price: 20, stock: 35 },
    { id: 106, name: "Su", price: 10, stock: 100 },
  ],
  "Tatlılar": [
    { id: 201, name: "Künefe", price: 80, stock: 15 },
    { id: 202, name: "Baklava", price: 90, stock: 20 },
    { id: 203, name: "Sütlaç", price: 60, stock: 25 },
    { id: 204, name: "Kazandibi", price: 65, stock: 18 },
    { id: 205, name: "Tiramisu", price: 85, stock: 12 },
    { id: 206, name: "Cheesecake", price: 95, stock: 10 },
  ],
};

const initialTables = [
  { id: '1-1', name: 'Masa 1-1' },
  { id: '1-2', name: 'Masa 1-2' },
  { id: '2-1', name: 'Masa 2-1' },
  { id: '2-2', name: 'Masa 2-2' },
  { id: '3-1', name: 'Masa 3-1' },
  { id: '3-2', name: 'Masa 3-2' },
];

export function TableProvider({ children }) {
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem('products');
    return savedProducts ? JSON.parse(savedProducts) : initialProducts;
  });

  const [tables, setTables] = useState(() => {
    const savedTables = localStorage.getItem('tables');
    return savedTables ? JSON.parse(savedTables) : initialTables;
  });

  const [tableStatus, setTableStatus] = useState({});
  const [orders, setOrders] = useState({});
  const [lastOrders, setLastOrders] = useState({});

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('tables', JSON.stringify(tables));
  }, [tables]);

  const addTable = (tableName) => {
    setTables(prevTables => {
      const newTable = {
        id: Date.now().toString(), // Benzersiz ID
        name: tableName
      };
      return [...prevTables, newTable];
    });
  };

  const deleteTable = (tableId) => {
    setTables(prevTables => prevTables.filter(table => table.id !== tableId));
  };

  const updateTableStatus = (tableId, status) => {
    setTableStatus((prev) => ({ ...prev, [tableId]: status }));
  };

  const saveOrder = (tableId, items) => {
    setLastOrders((prev) => ({ ...prev, [tableId]: items }));
  };

  const confirmOrder = (tableId) => {
    const newOrderItems = lastOrders[tableId];
    if (!newOrderItems) return;

    const totalOrderItems = orders[tableId] || {};
    const updatedTotalOrder = { ...totalOrderItems };

    Object.entries(newOrderItems).forEach(([id, newItem]) => {
      if (updatedTotalOrder[id]) {
        updatedTotalOrder[id].count += newItem.count;
      } else {
        updatedTotalOrder[id] = newItem;
      }
    });

    setProducts((prevProducts) => {
      const updatedProducts = JSON.parse(JSON.stringify(prevProducts));
      Object.values(newOrderItems).forEach(item => {
        for (const category in updatedProducts) {
          const productIndex = updatedProducts[category].findIndex(p => p.id === item.id);
          if (productIndex !== -1) {
            updatedProducts[category][productIndex].stock -= item.count;
          }
        }
      });
      return updatedProducts;
    });

    setOrders((prev) => ({ ...prev, [tableId]: updatedTotalOrder }));
    setLastOrders((prev) => {
      const copy = { ...prev };
      delete copy[tableId];
      return copy;
    });
    updateTableStatus(tableId, "occupied");
  };

  const payAndClearTable = (tableId) => {
    setOrders((prev) => {
      const newOrders = { ...prev };
      delete newOrders[tableId];
      return newOrders;
    });
    updateTableStatus(tableId, "empty");
  };

  return (
    <TableContext.Provider
      value={{
        products,
        setProducts,
        tables,
        addTable,
        deleteTable,
        tableStatus,
        updateTableStatus,
        orders,
        lastOrders,
        saveOrder,
        confirmOrder,
        payAndClearTable,
      }}
    >
      {children}
    </TableContext.Provider>
  );
}