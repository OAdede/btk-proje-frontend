import { Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import { useContext } from 'react';
import { TableProvider } from './context/TableContext.jsx';
import { AuthContext } from './context/AuthContext.jsx';

// Layouts
import AdminLayout from './components/layout/AdminLayout.jsx';
import StaffLayout from './components/layout/StaffLayout.jsx';

// Auth Pages
import Login from './pages/auth/Login.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard.jsx';
import ReportsPage from './pages/reports/ReportsPage.jsx';
import ProductsPage from './pages/products/ProductsPage.jsx';
import ReservationsPage from './pages/reservations/ReservationsPage.jsx';
import StockPage from './pages/stock/StockPage.jsx';
import PersonnelPage from './pages/personnel/PersonnelPage.jsx'; // Yeni personel sayfası

// Staff & Shared Pages
import TablesPage from './pages/tables/TablesPage.jsx';
import TablesGridPage from './pages/tables/TablesGridPage.jsx';
import OrderPage from './pages/orders/OrderPage.jsx';
import SummaryPage from './pages/orders/SummaryPage.jsx';

// Stil dosyaları
import "./App.css";

// Yetkilendirme için korumalı rota bileşeni
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) {
    const homePath = user.role === 'admin' ? '/admin/dashboard' : '/staff/home';
    return <Navigate to={homePath} replace />;
  }
  return children;
};


function App() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Test butonları için handle fonksiyonu
  const handleTestLogin = async (role) => {
    // Not: Bu test kullanıcılarının AuthContext'teki mockUsers listesinde olması gerekir.
    const testUsers = {
      admin: { email: 'admin@restoran.com', password: '123' },
      garson: { email: 'garson@restoran.com', password: '123' },
      kasiyer: { email: 'kasiyer@restoran.com', password: '123' }
    };

    const { email, password } = testUsers[role];

    try {
      const loggedInRole = await login(email, password);
      if (loggedInRole) {
        if (loggedInRole === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/staff/home');
        }
      }
    } catch (error) {
      console.error("Test girişi başarısız:", error);
      alert("Test kullanıcısı ile giriş yapılamadı. Lütfen AuthContext'teki mockUsers listesini kontrol edin.");
    }
  };

  // Test paneli için stiller
  const navStyle = {
    padding: '10px 20px',
    background: '#2c3e50',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'wrap',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    position: 'relative',
    zIndex: 1001
  };

  const linkStyle = {
    color: '#ecf0f1',
    textDecoration: 'none',
    fontWeight: '500',
    padding: '5px 10px',
    borderRadius: '5px',
    transition: 'background-color 0.2s',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 'inherit'
  };

  return (
    <TableProvider>
      <nav style={navStyle}>
        <strong>Test Paneli:</strong>
        <Link to="/login" style={linkStyle} >Gerçek Giriş Sayfası</Link>
        <button onClick={() => handleTestLogin('garson')} style={linkStyle}>Garson Paneli</button>
        <button onClick={() => handleTestLogin('kasiyer')} style={linkStyle}>Kasiyer Paneli</button>
        <button onClick={() => handleTestLogin('admin')} style={linkStyle}>Admin Paneli</button>
      </nav>

      <Routes>
        {/* Layout Olmayan Sayfalar */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />


        {/* Admin Paneli */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="tables" element={<TablesPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="reservations" element={<ReservationsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="stock" element={<StockPage />} />
          <Route path="personnel" element={<PersonnelPage />} /> {/* Yeni personel rota */}
        </Route>

        {/* Personel Paneli (Garson/Kasiyer) */}
        <Route
          path="/staff/*"
          element={
            <ProtectedRoute>
              <StaffLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<TablesGridPage />} />
          <Route path="tables" element={<TablesGridPage />} />
          <Route path="order/:tableId" element={<OrderPage />} />
          <Route path="summary/:tableId" element={<SummaryPage />} />
        </Route>

        {/* Varsayılan Rota */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </TableProvider>
  );
}

export default App;
