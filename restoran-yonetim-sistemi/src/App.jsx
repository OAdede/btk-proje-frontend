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
import StokUpdate from './components/stock/StokUpdate.jsx'; // Tek dosyayı kullanıyoruz
import PersonnelPage from './pages/personnel/PersonnelPage.jsx';
import MenuPage from './pages/menu/MenuPage.jsx';
import Rezervasyon from './pages/admin/Rezervasyon.jsx';

// Staff Pages
import WaiterHome from './pages/staff/WaiterHome.jsx';
import OrderPage from './pages/staff/OrderPage.jsx';
import SummaryPage from './pages/staff/SummaryPage.jsx';
// YENİ EKLENEN IMPORT (DOĞRU YOL İLE)
import OrdersPage from "./components/layout/OrdersPage.jsx";


// Stil dosyaları
import "./App.css";

// Yetkilendirme için korumalı rota bileşeni
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    const homePath = user.role === 'admin' ? '/admin/dashboard' : `/${user.role}/home`;
    return <Navigate to={homePath} replace />;
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
                <StaffLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<WaiterHome />} />
            <Route path="order/:tableId" element={<OrderPage />} />
            <Route path="summary/:tableId" element={<SummaryPage />} />
            <Route path="stock" element={<StokUpdate />} />
            {/* YENİ EKLENEN ROUTE */}
            <Route path="orders" element={<OrdersPage />} />
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
            <Route path="stock" element={<StokUpdate />} />
            {/* YENİ EKLENEN ROUTE */}
            <Route path="orders" element={<OrdersPage />} />
          </Route>

          {/* Varsayılan Rota */}
          <Route
            path="*"
            element={
              <ProtectedRoute>
                {user ? (
                  <Navigate
                    to={user.role === 'admin' ? '/admin/dashboard' : `/${user.role}/home`}
                    replace
                  />
                ) : (
                  <Navigate to="/login" replace />
                )}
              </ProtectedRoute>
            }
          />
        </Routes>
      </TableProvider>
    </ThemeProvider>
  );
}

export default App;
