import { Routes, Route, Link } from 'react-router-dom';
import { useContext } from 'react';
import Login from './components/ibovs/Login';
import Raporlar from './components/selin/pages/Reports';
import { TableProvider } from './context/TableContext';
import { AuthContext } from './context/AuthContext';
import ForgotPassword from './components/ibovs/ForgotPassword';
import ResetPassword from './components/ibovs/ResetPassword';

// Admin Layout ve Sayfaları
import AdminLayout from './components/layout/AdminLayout';
import StokUpdate from './components/betul/StokUpdate';
import MenuUpdate from './components/betul/MenuUpdate';
import PersonelEkleme from './components/betul/PersonelEkleme';
import MasaYonetimi from './components/betul/MasaYonetimi'; // YENİ

// Yeni Birleşik Staff Layout ve Sayfaları
import StaffLayout from './components/layout/StaffLayout';
// Ortak Kullanılacak Sayfalar
import TablesPage from './components/kubra/pages/TablesPage';
import ProductsPage from './components/kubra/pages/ProductsPage';
import ReservationsPage from './components/kubra/pages/ReservationsPage';
// Sipariş Akışı Sayfaları (pelin)
import OrderPage from './components/pelin/pages/OrderPage';
import SummaryPage from './components/pelin/pages/SummaryPage';

function App() {
  const { login } = useContext(AuthContext);

  const navStyle = {
    padding: '10px',
    marginBottom: '20px',
    background: '#f0f0f0',
    borderBottom: '1px solid #ccc',
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    flexWrap: 'wrap'
  };

  const handleTestLogin = (role) => {
    const testUsers = { admin: 'admin', kasiyer: 'kasiyer', garson: 'garson' };
    login(testUsers[role], '123');
  };

  return (
    <TableProvider>
      <nav style={navStyle}>
        <strong>Sayfalar Arası Geçiş (Test):</strong>
        <Link to="/login">Giriş</Link>
        <Link to="/garson" onClick={() => handleTestLogin('garson')}>Garson Paneli</Link>
        <Link to="/kasiyer" onClick={() => handleTestLogin('kasiyer')}>Kasiyer Paneli</Link>
        <Link to="/admin" onClick={() => handleTestLogin('admin')}>Admin Paneli</Link>
      </nav>

      <Routes>
        {/* Ana ve Kimlik Doğrulama Yolları */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Admin Paneli Yolları */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<StokUpdate />} />
          <Route path="stok" element={<StokUpdate />} />
          <Route path="menu" element={<MenuUpdate />} />
          <Route path="personel" element={<PersonelEkleme />} />
          <Route path="masalar" element={<MasaYonetimi />} /> {/* YENİ YOL */}
          <Route path="raporlar" element={<Raporlar />} />
        </Route>

        {/* Garson Paneli Yolları */}
        <Route path="/garson" element={<StaffLayout />}>
          <Route index element={<TablesPage />} />
          <Route path="masalar" element={<TablesPage />} />
          <Route path="urunler" element={<ProductsPage />} />
          <Route path="rezervasyonlar" element={<ReservationsPage />} />
          <Route path="order/:tableId" element={<OrderPage />} />
          <Route path="summary/:tableId" element={<SummaryPage />} />
        </Route>

        {/* Kasiyer Paneli Yolları */}
        <Route path="/kasiyer" element={<StaffLayout />}>
          <Route index element={<TablesPage />} />
          <Route path="order/:tableId" element={<OrderPage />} />
          <Route path="summary/:tableId" element={<SummaryPage />} />
        </Route>
      </Routes>
    </TableProvider>
  );
}

export default App;