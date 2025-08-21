import React, { useState, useEffect, useContext } from "react";
import { useTheme } from "../../context/ThemeContext.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";
import { orderService } from "../../services/orderService.js";
import "./StaffLayout.css";

// Aylık siparişler için bileşen
import MonthlyOrdersView from "./MonthlyOrdersView.jsx";

function OrdersPage() {
    const { colors } = useTheme();
    const { user } = useContext(AuthContext);
    const [viewMode, setViewMode] = useState('daily');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'completed'

    const today = new Date();

    // Fetch waiter's orders from backend
    useEffect(() => {
        const fetchMyOrders = async () => {
            try {
                setLoading(true);
                setError(null);
                const ordersData = await orderService.getMyOrders();
                console.log('Backend\'den gelen siparişler:', ordersData);
                setOrders(ordersData || []);
            } catch (err) {
                console.error('Error fetching my orders:', err);
                setError('Siparişleriniz yüklenirken bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        };

        fetchMyOrders();
    }, []);

    // Filter orders based on status and date
    const filteredOrders = orders
        .filter(order => {
            // Filter by status
            if (filterStatus === 'active') return !order.isCompleted;
            if (filterStatus === 'completed') return order.isCompleted;
            return true; // 'all'
        })
        .filter(order => {
            // Filter by date for daily view
            if (viewMode === 'daily') {
                const orderDate = new Date(order.createdAt);
                return orderDate.getDate() === today.getDate() &&
                       orderDate.getMonth() === today.getMonth() &&
                       orderDate.getFullYear() === today.getFullYear();
            }
            return true; // Show all orders for monthly view
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(amount);
    };

    const getStatusBadge = (isCompleted) => {
        // Console logging for testing
        console.log(`Sipariş durumu: isCompleted = ${isCompleted}, Durum: ${isCompleted ? 'Tamamlandı' : 'Devam Ediyor'}`);
        
        if (isCompleted) {
            return (
                <span style={{
                    backgroundColor: 'var(--success)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    display: 'inline-block'
                }}>
                    ✅ Tamamlandı
                </span>
            );
        } else {
            return (
                <span style={{
                    backgroundColor: 'var(--warning)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    display: 'inline-block'
                }}>
                    ⏳ Devam Ediyor
                </span>
            );
        }
    };

    const getOrderItemsText = (items) => {
        if (!items || items.length === 0) return 'Ürün bilgisi yok';
        return items.map(item => `${item.productName} x${item.quantity}`).join(', ');
    };

    if (loading) {
        return (
            <div className="orders-page-container" style={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}>
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <div style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Siparişleriniz yükleniyor...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="orders-page-container" style={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}>
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <div style={{ fontSize: '1.2rem', marginBottom: '10px', color: 'var(--error)' }}>{error}</div>
                    <button 
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Tekrar Dene
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-page-container" style={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}>
            {/* Butonlar */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <div style={{
                    display: 'flex',
                    gap: '10px'
                }}>
                    <button
                        onClick={() => setViewMode('daily')}
                        className={`view-mode-button ${viewMode === 'daily' ? 'active' : ''}`}
                    >
                        Günlük Siparişler
                    </button>
                    <button
                        onClick={() => setViewMode('monthly')}
                        className={`view-mode-button ${viewMode === 'monthly' ? 'active' : ''}`}
                    >
                        Aylık Siparişler
                    </button>
                </div>

                {/* Status Filter */}
                <div style={{
                    display: 'flex',
                    gap: '10px'
                }}>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '5px',
                            border: '1px solid var(--border)',
                            backgroundColor: 'var(--card)',
                            color: 'var(--text)'
                        }}
                    >
                        <option value="all">Tüm Siparişler</option>
                        <option value="active">Aktif Siparişler</option>
                        <option value="completed">Tamamlanan Siparişler</option>
                    </select>
                </div>
            </div>

            {/* Günlük Siparişler Görünümü */}
            {viewMode === 'daily' && (
                <>
                    <h2 className="orders-page-title" style={{ color: 'var(--text)' }}>
                        Güncel Siparişlerim ({today.toLocaleDateString('tr-TR')})
                    </h2>
                    <div className="total-orders-info">
                        Toplam Günlük Sipariş Sayısı: <span>{filteredOrders.length}</span>
                    </div>

                    <div className="orders-list-container">
                        {filteredOrders.length === 0 ? (
                            <div className="no-orders-message" style={{ color: 'var(--text-secondary)' }}>
                                {filterStatus === 'all' && 'Bugüne ait henüz siparişiniz yok.'}
                                {filterStatus === 'active' && 'Bugüne ait aktif siparişiniz yok.'}
                                {filterStatus === 'completed' && 'Bugüne ait tamamlanmış siparişiniz yok.'}
                            </div>
                        ) : (
                            filteredOrders.map((order) => {
                                console.log('Sipariş detayı:', order);
                                return (
                                <div
                                    key={order.orderId || order.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        backgroundColor: 'var(--card)',
                                        borderRadius: '10px',
                                        boxShadow: '0 1px 6px var(--shadow)',
                                        padding: '12px 20px',
                                        gap: '10px',
                                        border: '1px solid var(--border)',
                                        color: 'var(--text)',
                                        marginBottom: '10px',
                                        flexWrap: 'nowrap'
                                    }}
                                >
                                    <div style={{ flex: '0 0 12%', minWidth: '70px', fontWeight: 600, color: 'var(--text)' }}>
                                        Masa {order.tableNumber || order.tableId || 'N/A'}
                                    </div>
                                    <div style={{ flex: '0 0 12%', minWidth: '80px', fontWeight: 500, color: 'var(--success)' }}>
                                        {formatCurrency(order.totalPrice || 0)}
                                    </div>
                                    <div style={{ flex: '0 0 16%', minWidth: '100px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                                        Sipariş ID: #{order.orderId || order.id}
                                    </div>
                                    <div style={{ flex: '1 1 30%', minWidth: '120px', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {getOrderItemsText(order.items)}
                                    </div>
                                    <div style={{ flex: '0 0 15%', minWidth: '110px', textAlign: 'center' }}>
                                        {getStatusBadge(order.isCompleted)}
                                    </div>
                                    <div style={{ flex: '0 0 15%', minWidth: '120px', fontWeight: 500, color: 'var(--text-secondary)', textAlign: 'right', fontSize: '0.9rem' }}>
                                        {formatDate(order.createdAt)}
                                    </div>
                                </div>
                            );
                            })
                        )}
                    </div>
                </>
            )}

            {/* Aylık Siparişler Görünümü */}
            {viewMode === 'monthly' && (
                <MonthlyOrdersView />
            )}
        </div>
    );
}

export default OrdersPage;