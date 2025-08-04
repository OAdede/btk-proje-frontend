import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from 'react';
import { TableProvider } from './context/TableContext.jsx';
import { AuthContext } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

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
import StokUpdate from './components/stock/StokUpdate.jsx';
import MenuUpdate from './components/menu/MenuUpdate.jsx';
import PersonnelPage from './pages/personnel/PersonnelPage.jsx';

// Shared Staff Pages (Garson/Kasiyer)
import WaiterHome from './components/pelin/pages/WaiterHome.jsx';
import OrderPage from './components/pelin/pages/OrderPage.jsx';
import SummaryPage from './components/pelin/pages/SummaryPage.jsx';

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
    // Gerekli rol bir dizi ise içinde olup olmadığını kontrol et
    if (Array.isArray(requiredRole)) {
      if (!requiredRole.includes(userRole)) {
        return <Navigate to={`/${user.baseRole}/home`} replace />;
      }
    } else {
      // Gerekli rol tek bir string ise eşit olup olmadığını kontrol et
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
            <Route path="menu" element={<MenuUpdate />} />
            <Route path="personnel" element={<PersonnelPage />} />
          </Route>

          {/* Garson Paneli */}
          <Route
            path="/garson/*"
            element={
              <ProtectedRoute requiredRole="garson">
                <StaffLayout />
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
            <Route path="home" element={<WaiterHome />} />
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
