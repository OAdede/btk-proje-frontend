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
  
  if (requiredRole) {
    // Array kontrolü
    if (Array.isArray(requiredRole)) {
      if (!requiredRole.includes(user.role)) {
        const homePath = user.role === 'admin' ? '/admin/dashboard' : '/staff/home';
        return <Navigate to={homePath} replace />;
      }
    } else {
      // String kontrolü
      if (user.role !== requiredRole) {
        const homePath = user.role === 'admin' ? '/admin/dashboard' : '/staff/home';
        return <Navigate to={homePath} replace />;
      }
    }
  }
  
  return children;
};


function App() {
  return (
    <TableProvider>
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
            <ProtectedRoute requiredRole={['garson', 'kasiyer']}>
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
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </TableProvider>
  );
}

export default App;
