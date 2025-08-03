import React from "react";
import { Routes, Route } from "react-router-dom";
import WaiterHome from "./pages/WaiterHome";
import OrderPage from "./pages/OrderPage";
import SummaryPage from "./pages/SummaryPage";

// Bu dosya artık ana yönlendirici (Router) veya Provider içermemeli,
// çünkü bu görevler projenin en tepesindeki ana App.jsx tarafından yapılıyor.
// Bu bileşen, sadece kendi içindeki sayfaları yönlendirmekle sorumlu.

function KasiyerPanel() {
  return (
    <Routes>
      {/* 
        Bu rotalar artık /kasiyer yolunun altında çalışacak.
        Örneğin, /kasiyer/ anasayfayı, /kasiyer/order/1 ise sipariş sayfasını açacak.
        Ancak bu iç içe yapıyı şimdilik basitleştirip direkt ana rotada bırakıyoruz.
        Ana App.jsx'teki yol tanımları geçerli olacak. Bu dosyadaki yönlendirme
        mantığını şimdilik devre dışı bırakıp, sadece ana bileşeni gösterelim.
        Bu nedenle, bu dosya doğrudan WaiterHome bileşenini render etmeli.
      */}
      <Route path="/*" element={<WaiterHome />} />
      <Route path="/order/:tableId" element={<OrderPage />} />
      <Route path="/summary/:tableId" element={<SummaryPage />} />
    </Routes>
  );
}

export default KasiyerPanel;
