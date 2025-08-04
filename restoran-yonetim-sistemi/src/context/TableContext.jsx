import React, { createContext, useState } from "react";

export const TableContext = createContext();

const initialProducts = {
  yemekler: [
    { id: 1, name: "Pizza", price: 120, stock: 10 },
    { id: 2, name: "Hamburger", price: 90, stock: 8 },
    { id: 3, name: "Salata", price: 50, stock: 12 },
    { id: 4, name: "Makarna", price: 80, stock: 7 },
    { id: 5, name: "Köfte", price: 95, stock: 6 },
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

export function TableProvider({ children }) {
  const [tableStatus, setTableStatus] = useState({});
  const [orders, setOrders] = useState({});
  const [lastOrders, setLastOrders] = useState({});
  const [products, setProducts] = useState(initialProducts);

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
        updatedTotalOrder[id] = {
          ...newItem,
          count: updatedTotalOrder[id].count + newItem.count,
        };
      } else {
        updatedTotalOrder[id] = newItem;
      }
    });

    setProducts((prevProducts) => {
      const updatedProducts = { ...prevProducts };
      ["yemekler", "icecekler", "tatlilar"].forEach((category) => {
        updatedProducts[category] = updatedProducts[category].map((product) => {
          const idStr = product.id.toString();
          const newCount = newOrderItems[idStr]?.count || 0;
          let newStock = product.stock - newCount;
          if (newStock < 0) newStock = 0;
          return { ...product, stock: newStock };
        });
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

  const clearTable = (tableId) => {
    setOrders((prev) => {
      const newOrders = { ...prev };
      delete newOrders[tableId];
      return newOrders;
    });
    updateTableStatus(tableId, "empty");
  }

  return (
    <TableContext.Provider
      value={{
        tableStatus,
        updateTableStatus,
        orders,
        lastOrders,
        saveOrder,
        products,
        setProducts, // Admin panelinde ürünleri yönetmek için eklendi
        confirmOrder,
        clearTable
      }}
    >
      {children}
    </TableContext.Provider>
  );
}
