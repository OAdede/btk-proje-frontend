import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from 'react';
import { TableProvider } from './context/TableContext.jsx';
import { AuthContext } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

// Layouts
import AdminLayout from './components/layout/AdminLayout.jsx';
import StaffLayout from './components/layout/StaffLayout.jsx';
import WaiterLayout from './components/layout/WaiterLayout.jsx'; // 🔸 EKLENDİ

// Auth Pages
import Login from './pages/auth/Login.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard.jsx';
import ReportsPage from './pages/reports/ReportsPage.jsx';
import ProductsPage from './pages/products/ProductsPage.jsx';
import StokUpdate from './components/stock/StokUpdate.jsx';
import PersonnelPage from './pages/personnel/PersonnelPage.jsx';
import MenuPage from './pages/menu/MenuPage.jsx';
import Kasiyer from "./pages/Kasiyer/Kasiyer.jsx";
import Rezervasyon from './pages/admin/Rezervasyon.jsx';

// Shared Staff Pages (Garson/Kasiyer)
import WaiterHome from './pages/staff/WaiterHome.jsx';
import OrderPage from './pages/staff/OrderPage.jsx';
import SummaryPage from './pages/staff/SummaryPage.jsx';

// Stil dosyaları
import "./App.css";

// Yetkilendirme için korumalı rota bileşeni
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Eğer belirli bir rol veya roller gerekiyorsa kontrol et
  if (requiredRole) {
    const userRole = user.role;
    if (Array.isArray(requiredRole)) {
      if (!requiredRole.includes(userRole)) {
        return <Navigate to={`/${user.baseRole}/home`} replace />;
      }
    } else {
      if (userRole !== requiredRole) {
        return <Navigate to={`/${user.baseRole}/home`} replace />;
      }
    }
  }

  return children;
};

function App() {
  const { user } = useContext(AuthContext);

  return (
    <ThemeProvider>
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
            <Route path="products" element={<ProductsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="stock" element={<StokUpdate />} />
            <Route path="personnel" element={<PersonnelPage />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="rezervasyon" element={<Rezervasyon />} />
          </Route>

          {/* Garson Paneli */}
          <Route
            path="/garson/*"
            element={
              <ProtectedRoute requiredRole="garson">
                <WaiterLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<WaiterHome />} />
            <Route path="order/:tableId" element={<OrderPage />} />
            <Route path="summary/:tableId" element={<SummaryPage />} />
          </Route>

          {/* Kasiyer Paneli */}
          <Route
            path="/kasiyer/*"
            element={
              <ProtectedRoute requiredRole="kasiyer">
                <StaffLayout />
              </ProtectedRoute>
            }
          >

            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<Kasiyer />} />
            <Route path="order/:tableId" element={<OrderPage />} />
            <Route path="summary/:tableId" element={<SummaryPage />} />

          </Route>

          {/* Varsayılan Rota */}
          <Route
            path="*"
            element={
              user ? (
                <Navigate
                  to={`/${user.baseRole === 'admin' ? 'admin/dashboard' : user.baseRole + '/home'}`}
                  replace
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </TableProvider>
    </ThemeProvider>
  );
}

export default App;
