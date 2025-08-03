import React, { createContext, useState } from "react";

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
  const [tableStatus, setTableStatus] = useState({}); // "empty", "occupied", "reserved"
  const [orders, setOrders] = useState({}); // Toplam onaylanmış siparişler
  const [lastOrders, setLastOrders] = useState({}); // Henüz onaylanmamış yeni siparişler
  const [products, setProducts] = useState(initialProducts); // Ürünler ve stokları

  // Masa durumunu güncelle
  const updateTableStatus = (tableId, status) => {
    setTableStatus((prev) => ({ ...prev, [tableId]: status }));
  };

  // Yeni siparişi kaydet (henüz onaylanmamış)
  const saveOrder = (tableId, items) => {
    setLastOrders((prev) => ({ ...prev, [tableId]: items }));
  };

  // Sipariş onaylandığında stokları güncelle, toplam siparişi güncelle, son siparişi temizle
  const confirmOrder = (tableId) => {
    const newOrderItems = lastOrders[tableId];
    if (!newOrderItems) return;

    const totalOrderItems = orders[tableId] || {};

    // Toplam siparişi güncelle
    const updatedTotalOrder = { ...totalOrderItems };

    Object.entries(newOrderItems).forEach(([id, newItem]) => {
      if (updatedTotalOrder[id]) {
        updatedTotalOrder[id] = {
          ...newItem,
          count: updatedTotalOrder[id].count + newItem.count,
          price: newItem.price,
          name: newItem.name,
        };
      } else {
        updatedTotalOrder[id] = newItem;
      }
    });

    // Stokları güncelle
    setProducts((prevProducts) => {
      const updatedProducts = { ...prevProducts };

      ["yemekler", "icecekler", "tatlilar"].forEach((category) => {
        updatedProducts[category] = updatedProducts[category].map((product) => {
          const idStr = product.id.toString();
          const newCount = newOrderItems[idStr]?.count || 0;
          let newStock = product.stock - newCount;
          if (newStock < 0) newStock = 0;

          return {
            ...product,
            stock: newStock,
          };
        });
      });

      return updatedProducts;
    });

    // Toplam siparişi güncelle
    setOrders((prev) => ({ ...prev, [tableId]: updatedTotalOrder }));

    // Son onaylanmamış siparişi temizle
    setLastOrders((prev) => {
      const copy = { ...prev };
      delete copy[tableId];
      return copy;
    });

    updateTableStatus(tableId, "occupied");
  };

  return (
    <TableContext.Provider
      value={{
        tableStatus,
        updateTableStatus,
        orders,      // Toplam onaylanmış siparişler
        lastOrders,  // Henüz onaylanmamış siparişler
        saveOrder,   // Yeni siparişi kaydet (henüz onaylanmamış)
        products,
        confirmOrder,
      }}
    >
      {children}
    </TableContext.Provider>
  );
}
