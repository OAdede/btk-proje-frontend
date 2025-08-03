import { Routes, Route, Link } from 'react-router-dom';
import Login from './components/ibovs/Login';
import Raporlar from './components/selin/pages/Reports';
import { TableProvider } from './components/pelin/context/TableContext';

// Admin Layout ve Sayfaları
import AdminLayout from './components/layout/AdminLayout';
import StokUpdate from './components/betul/StokUpdate';
import MenuUpdate from './components/betul/MenuUpdate';
import PersonelEkleme from './components/betul/PersonelEkleme';

// Yeni Birleşik Staff Layout ve Sayfaları
import StaffLayout from './components/layout/StaffLayout';
// Garson Sayfaları (kubra)
import TablesPage from './components/kubra/pages/TablesPage';
import ProductsPage from './components/kubra/pages/ProductsPage';
import ReservationsPage from './components/kubra/pages/ReservationsPage';
// Kasiyer Sayfaları (pelin)
import WaiterHome from './components/pelin/pages/WaiterHome';
import OrderPage from './components/pelin/pages/OrderPage';
import SummaryPage from './components/pelin/pages/SummaryPage';


function App() {
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

    return (
        <TableProvider>
            {/* Geçici Test Navigasyonu */}
            <nav style={navStyle}>
                <strong>Sayfalar Arası Geçiş (Test):</strong>
                <Link to="/login">Giriş</Link>
                <Link to="/garson">Garson Paneli</Link>
                <Link to="/kasiyer">Kasiyer Paneli</Link>
                <Link to="/admin/stok">Admin Paneli</Link>
            </nav>

            <Routes>
                {/* Standalone Sayfalar */}
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />

                {/* Admin Paneli */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<StokUpdate />} />
                    <Route path="stok" element={<StokUpdate />} />
                    <Route path="menu" element={<MenuUpdate />} />
                    <Route path="personel" element={<PersonelEkleme />} />
                    <Route path="raporlar" element={<Raporlar />} />
                </Route>

                {/* Yeni Birleşik Personel Paneli (Garson) */}
                <Route path="/garson" element={<StaffLayout />}>
                    <Route index element={<TablesPage />} /> {/* /garson'a gidilince Masalar sayfası */}
                    <Route path="masalar" element={<TablesPage />} />
                    <Route path="urunler" element={<ProductsPage />} />
                    <Route path="rezervasyonlar" element={<ReservationsPage />} />
                </Route>

                {/* Yeni Birleşik Personel Paneli (Kasiyer) */}
                <Route path="/kasiyer" element={<StaffLayout />}>
                    <Route index element={<WaiterHome />} /> {/* /kasiyer'e gidilince Kasa anasayfası */}
                    {/* Not: OrderPage ve SummaryPage link ile değil, programatik olarak (navigate) çağrıldığı için
                onları layout'un dışında, kendi yollarında bırakmak daha mantıklı. */}
                </Route>

                {/* Layout dışında kalması gereken, akışa özel sayfalar */}
                <Route path="/order/:tableId" element={<OrderPage />} />
                <Route path="/summary/:tableId" element={<SummaryPage />} />

            </Routes>
        </TableProvider>
    );
}

export default App;
