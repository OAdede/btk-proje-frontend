import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from 'react';
import { TableProvider } from './context/TableContext.jsx';
import { AuthContext } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { useBootstrap } from './context/BootstrapContext.jsx';
import { getRoleInfoFromToken, isTokenExpired } from './utils/jwt.js';


// Layouts
import AdminLayout from './components/layout/AdminLayout.jsx';
import StaffLayout from './components/layout/StaffLayout.jsx';

// Auth Pages
import Login from './pages/auth/Login.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';
import BootstrapAdmin from './pages/auth/BootstrapAdmin.jsx';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard.jsx';
import ReportsPage from './pages/reports/ReportsPage.jsx';
import ProductsPage from './pages/products/ProductsPage.jsx';
import StokUpdate from './components/stock/StokUpdate.jsx'; // Tek dosyayı kullanıyoruz
import PersonnelPage from './pages/personnel/PersonnelPage.jsx';
import MenuPage from './pages/menu/MenuPage.jsx';
import Rezervasyon from './pages/admin/Rezervasyon.jsx';
import ReservationsPage from './pages/reservations/ReservationsPage.jsx';
import EditReservationPage from './pages/reservations/EditReservationPage.jsx';
import OrderHistoryPage from './pages/orders/OrderHistoryPage.jsx';
import RestaurantSettings from './pages/admin/RestaurantSettings.jsx';
import BackendTest from './components/dev/BackendTest.jsx';
import ActivityLogs from './pages/admin/ActivityLogs.jsx';

// Staff Pages
import WaiterHome from './pages/staff/WaiterHome.jsx';
import CashierHome from './pages/staff/CashierHome.jsx';
import OrderPage from './pages/staff/OrderPage.jsx';
import SummaryPage from './pages/staff/SummaryPage.jsx';
import OrdersPage from "./components/layout/OrdersPage.jsx";
import FastOrderPage from "./pages/staff/FastOrderPage";


// Stil dosyaları
import "./App.css";

// Yetkilendirme için korumalı rota bileşeni
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const roleInfo = token ? getRoleInfoFromToken(token) : {};
  const effectiveRole = roleInfo.role ?? user?.role;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isTokenExpired(token)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !effectiveRole) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && effectiveRole !== requiredRole) {
    const homePath = effectiveRole === 'admin' ? '/admin/dashboard' : `/${effectiveRole}/home`;
    return <Navigate to={homePath} replace />;
  }

  return children;
};


function App() {
  const { user } = useContext(AuthContext);
  const { needsBootstrap, bootstrapLoading, forceRefreshBootstrap } = useBootstrap();

  // Show loading while checking bootstrap status
  if (bootstrapLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border" role="status" aria-hidden="true"></div>
          <div className="mt-2">Sistem kontrol ediliyor...</div>
          <div className="mt-3">
            <button 
              onClick={forceRefreshBootstrap}
              className="btn btn-sm btn-outline-primary"
            >
              Yenile
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Debug: Add manual override for bootstrap (temporary)
  const isDebugMode = window.location.search.includes('debug=true');
  const overrideBootstrap = window.location.search.includes('bootstrap=false');
  
  const actualNeedsBootstrap = overrideBootstrap ? false : needsBootstrap;
  


  return (
    <ThemeProvider>
      {isDebugMode && (
        <div style={{ 
          position: 'fixed', 
          top: '10px', 
          right: '10px', 
          background: 'yellow', 
          padding: '10px', 
          border: '1px solid black', 
          zIndex: 9999,
          fontSize: '12px',
          maxWidth: '300px'
        }}>
          <strong>Debug Mode</strong><br/>
          needsBootstrap: {String(needsBootstrap)}<br/>
          Override: {String(overrideBootstrap)}<br/>
          hasToken: {String(!!localStorage.getItem('token'))}<br/>
          bootstrapCompleted: {sessionStorage.getItem('bootstrapCompleted') || 'null'}<br/>
          <button onClick={() => window.location.href = '/?bootstrap=false'}>Force Login</button><br/>
          <button onClick={() => {sessionStorage.removeItem('bootstrapCompleted'); window.location.reload()}}>Clear Flag</button>
        </div>
      )}
      <Routes>
        {/* Bootstrap Routes - Only accessible when no users exist */}
        {actualNeedsBootstrap ? (
          <>
            <Route path="/bootstrap-admin" element={<BootstrapAdmin />} />
            <Route path="*" element={<Navigate to="/bootstrap-admin" replace />} />
          </>
        ) : (
          <>
            {/* Layout Olmayan Sayfalar */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/backend-test" element={<BackendTest />} />
            
            {/* Prevent access to bootstrap routes when users exist */}
            <Route path="/bootstrap-admin" element={<Navigate to="/login" replace />} />

            {/* Admin Paneli */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requiredRole="admin">
                  <TableProvider>
                    <AdminLayout />
                  </TableProvider>
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
              <Route path="reservations" element={<ReservationsPage />} />
              <Route path="reservations/edit/:reservationId" element={<EditReservationPage />} />
              <Route path="order-history" element={<OrderHistoryPage />} />
              <Route path="restaurant-settings" element={<RestaurantSettings />} />
              <Route path="activity-logs" element={<ActivityLogs />} />
            </Route>

            {/* Garson Paneli */}
            <Route
              path="/garson/*"
              element={
                <ProtectedRoute requiredRole="garson">
                  <TableProvider>
                    <StaffLayout />
                  </TableProvider>
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="home" replace />} />
              <Route path="home" element={<WaiterHome />} />
              <Route path="order/:tableId" element={<OrderPage />} />
              <Route path="summary/:tableId" element={<SummaryPage />} />
              <Route path="stock" element={<StokUpdate />} />
              <Route path="orders" element={<OrdersPage />} />
              {/* YENİ EKLENEN ROUTE */}
              <Route path="reservations" element={<ReservationsPage />} />
            </Route>

            {/* Kasiyer Paneli */}
            {/* DİKKAT: Hızlı sipariş rotası StaffLayout içine taşındı */}
            <Route
              path="/kasiyer/*"
              element={
                <ProtectedRoute requiredRole="kasiyer">
                  <TableProvider>
                    <StaffLayout />
                  </TableProvider>
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="home" replace />} />
              <Route path="home" element={<CashierHome />} />
              <Route path="order/:tableId" element={<OrderPage />} />
              <Route path="summary/:tableId" element={<SummaryPage />} />
              <Route path="stock" element={<StokUpdate />} />
              <Route path="orders" element={<OrdersPage />} />
              {/* Kasiyer Hızlı Sipariş rotası artık burada */}
              <Route path="fast-order" element={<FastOrderPage />} />
              {/* YENİ EKLENEN ROUTE */}
              <Route path="reservations" element={<ReservationsPage />} />
            </Route>

            {/* Varsayılan Rota */}
            <Route
              path="*"
              element={
                <ProtectedRoute>
                  {(() => {
                    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                    if (!token) return <Navigate to="/login" replace />;
                    const info = getRoleInfoFromToken(token);
                    const role = info.role ?? user?.role;
                    if (!role) return <Navigate to="/login" replace />;
                    const path = role === 'admin' ? '/admin/dashboard' : `/${role}/home`;
                    return <Navigate to={path} replace />;
                  })()}
                </ProtectedRoute>
              }
            />
          </>
        )}
      </Routes>
    </ThemeProvider>
  );
}

export default App;
