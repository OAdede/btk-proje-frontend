import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { TableProvider } from './context/TableContext';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import StaffLayout from './components/layout/StaffLayout';

// Pages
import Login from './pages/auth/Login';
import StockPage from './pages/stock/StockPage';
import MenuUpdate from './components/menu/MenuUpdate';
import PersonnelPage from './pages/personnel/PersonnelPage';
import ReportsPage from './pages/reports/ReportsPage';
import TablesPage from './pages/tables/TablesPage';
import ProductsPage from './pages/products/ProductsPage';
import ReservationsPage from './pages/reservations/ReservationsPage';
import OrderPage from './pages/orders/OrderPage';
import SummaryPage from './pages/orders/SummaryPage';

// Yeni Admin Sayfaları
import Anasayfa from './pages/admin/Anasayfa';
import Rezervasyon from './pages/admin/Rezervasyon';
import SiparisGecmisi from './pages/admin/SiparisGecmisi';

function App() {
  return (
    <>
      {/* Geçici Navigasyon Menüsü (Test için) */}
      <nav style={{ marginBottom: '20px', padding: '10px', background: '#f0f0f0', display: 'flex', gap: '15px' }}>
        <Link to="/login">Login</Link>
        <Link to="/admin">Admin Paneli</Link>
        <Link to="/garson">Garson Paneli</Link>
        <Link to="/kasiyer">Kasiyer Paneli</Link>
      </nav>

      <Routes>
        {/* Standalone Sayfalar */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Admin Paneli */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Anasayfa />} />
          <Route path="anasayfa" element={<Anasayfa />} />
          <Route path="rezervasyon" element={<Rezervasyon />} />
          <Route path="menu" element={<MenuUpdate />} />
          <Route path="stok" element={<StockPage />} />
          <Route path="personel" element={<PersonnelPage />} />
          <Route path="siparis-gecmisi" element={<SiparisGecmisi />} />
          <Route path="raporlar" element={<ReportsPage />} />
        </Route>

        {/* Personel Paneli (Garson ve Kasiyer için ortak yapı) */}
        {/* TableProvider'ı burada kullanarak tüm alt bileşenlerin context'e erişmesini sağlıyoruz */}
        <Route
          path="/garson"
          element={
            <TableProvider>
              <StaffLayout />
            </TableProvider>
          }
        >
          <Route index element={<TablesPage />} />
          <Route path="masalar" element={<TablesPage />} />
          <Route path="urunler" element={<ProductsPage />} />
          <Route path="rezervasyonlar" element={<ReservationsPage />} />
          <Route path="order/:tableId" element={<OrderPage />} />
          <Route path="summary/:tableId" element={<SummaryPage />} />
        </Route>

        <Route
          path="/kasiyer"
          element={
            <TableProvider>
              <StaffLayout />
            </TableProvider>
          }
        >
          <Route index element={<TablesPage />} /> {/* Kasiyer de masalar sayfasından başlar */}
          <Route path="order/:tableId" element={<OrderPage />} />
          <Route path="summary/:tableId" element={<SummaryPage />} />
          {/* Kasiyere özel başka sayfalar varsa buraya eklenebilir */}
        </Route>

      </Routes>
    </>
  );
}

export default App;
