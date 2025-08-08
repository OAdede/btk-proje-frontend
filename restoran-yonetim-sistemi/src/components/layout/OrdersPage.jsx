import React, { useContext, useState } from "react";
import { TableContext } from "../../context/TableContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import "./StaffLayout.css";

// Aylık siparişler için bileşen
import MonthlyOrdersView from "./MonthlyOrdersView.jsx";

function OrdersPage() {
    const { completedOrders } = useContext(TableContext);
    const { colors } = useTheme();
    const [viewMode, setViewMode] = useState('daily');

    const today = new Date();
    const allOrders = Object.entries(completedOrders)
        .filter(([orderId, orderDetails]) => {
            const orderDate = new Date(orderDetails.creationDate);
            return orderDate.getDate() === today.getDate() &&
                   orderDate.getMonth() === today.getMonth() &&
                   orderDate.getFullYear() === today.getFullYear();
        })
        .map(([orderId, orderDetails]) => {
            const total = Object.values(orderDetails).reduce((acc, item) => {
                if (item && item.price && item.count) {
                    return acc + (item.price * item.count);
                }
                return acc;
            }, 0);
            return {
                table: orderDetails.tableId,
                orderId: orderId,
                total,
                creationDate: orderDetails.creationDate
            };
        })
        .sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));

    const dailyTotalOrders = allOrders.length;

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
            </div>

            {/* Günlük Siparişler Görünümü */}
            {viewMode === 'daily' && (
                <>
                    <h2 className="orders-page-title" style={{ color: 'var(--text)' }}>
                        Güncel Siparişlerim ({today.toLocaleDateString('tr-TR')})
                    </h2>
                    <div className="total-orders-info">
                        Toplam Günlük Sipariş Sayısı: <span>{dailyTotalOrders}</span>
                    </div>

                    <div className="orders-list-container">
                        {allOrders.length === 0 ? (
                            <div className="no-orders-message" style={{ color: 'var(--text-secondary)' }}>
                                Bugüne ait henüz tamamlanmış siparişiniz yok.
                            </div>
                        ) : (
                            allOrders.map((order) => (
                                <div
                                    key={order.orderId}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        backgroundColor: 'var(--card)',
                                        borderRadius: '10px',
                                        boxShadow: '0 1px 6px var(--shadow)',
                                        padding: '12px 20px',
                                        gap: '20px',
                                        border: '1px solid var(--border)',
                                        color: 'var(--text)'
                                    }}
                                >
                                    <div style={{ flex: 2, fontWeight: 600, color: 'var(--text)' }}>Masa {order.table}</div>
                                    <div style={{ flex: 1, fontWeight: 500, color: 'var(--success)' }}>{order.total.toFixed(2)} TL</div>
                                    <div style={{ flex: 2, fontWeight: 500, color: 'var(--text-secondary)' }}>Sipariş ID: #{order.orderId}</div>
                                    <div style={{ flex: 3, fontWeight: 500, color: 'var(--text-secondary)', textAlign: 'right', fontSize: '0.9rem' }}>
                                        {formatDate(order.creationDate)}
                                    </div>
                                </div>
                            ))
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