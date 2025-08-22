import React, { useContext, useMemo, useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TableContext } from "../../context/TableContext";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { orderService } from "../../services/orderService";

export default function SummaryPage() {
    const { tableId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { orders, saveFinalOrder, tables } = useContext(TableContext);
    const { colors } = useTheme();

    // State for order data
    const [orderData, setOrderData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get backend table ID from table number - memoized to prevent recalculation
    const getBackendTableId = useCallback(() => {
        const numeric = Number(tableId);
        const byNumber = (tables || []).find(t => Number(t?.tableNumber ?? t?.number) === numeric);
        if (byNumber?.id != null) return Number(byNumber.id);
        const byId = (tables || []).find(t => Number(t?.id) === numeric);
        if (byId?.id != null) return Number(byId.id);
        return numeric;
    }, [tableId, tables]);

    // Masa ID'sinden orders verilerini almak için yardımcı fonksiyon
    const getOrderForTable = useCallback((tableId) => {
        // Önce backend table ID'sini bul
        const backendTable = tables.find(t => String(t?.tableNumber ?? t?.id) === tableId);
        if (!backendTable) return null;
        
        // Backend table ID'si ile orders'dan sipariş ara
        const backendTableId = String(backendTable.id);
        const order = orders[backendTableId];
        
        // Tamamlanmış siparişleri döndürme
        if (order && order.isCompleted === true) {
            return null;
        }
        
        return order || null;
    }, [tables, orders]);

    // Check if we have local data immediately
    const hasLocalData = useMemo(() => {
        const order = getOrderForTable(tableId);
        const localOrder = order?.items || {};
        return Object.keys(localOrder).length > 0;
    }, [getOrderForTable, tableId]);

    // Initialize with local data if available
    useEffect(() => {
        if (hasLocalData && !orderData) {
            const order = getOrderForTable(tableId);
            const localOrder = order?.items || {};
            setOrderData({
                items: localOrder,
                id: order?.id
            });
        }
    }, [hasLocalData, orderData, getOrderForTable, tableId]);

    // Fetch order data from backend only when needed
    useEffect(() => {
        // Skip if we already have data or if we have local data
        if (orderData || hasLocalData) {
            return;
        }

        const fetchOrderData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const backendTableId = getBackendTableId();
                if (backendTableId && !isNaN(backendTableId)) {
                    try {
                        const backendOrders = await orderService.getOrdersByTableId(backendTableId);
                        
                        if (backendOrders && backendOrders.length > 0) {
                            // Find the most recent active order (not completed)
                            const activeOrder = backendOrders.find(order => 
                                !order.isCompleted && order.status !== 'paid' && order.status !== 'cancelled'
                            ) || backendOrders[0];

                            if (activeOrder && activeOrder.items && activeOrder.items.length > 0) {
                                // Transform backend order items to frontend format
                                const transformedItems = (activeOrder.items || []).reduce((acc, item) => {
                                    if (item && item.productId) {
                                        acc[item.productId] = {
                                            id: item.productId,
                                            name: item.productName || 'Bilinmeyen Ürün',
                                            price: item.unitPrice || 0,
                                            count: item.quantity || 0,
                                            note: item.note || ''
                                        };
                                    }
                                    return acc;
                                }, {});

                                setOrderData({
                                    items: transformedItems,
                                    id: activeOrder.orderId || activeOrder.id
                                });

                            } else {
                                setOrderData({ items: {}, id: null });
                            }
                        } else {
                            setOrderData({ items: {}, id: null });
                        }
                    } catch (backendError) {
                        console.warn('Could not fetch from backend, using local state:', backendError);
                        // Fallback to empty order
                        setOrderData({ items: {}, id: null });
                    }
                } else {
                    setOrderData({ items: {}, id: null });
                }
            } catch (error) {
                console.error('Error fetching order data:', error);
                setError('Sipariş verileri alınırken hata oluştu');
                setOrderData({ items: {}, id: null });
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderData();
    }, [getBackendTableId, hasLocalData, orderData]);

    const currentOrder = orderData?.items || {};

    const totalPrice = useMemo(() =>
        Object.values(currentOrder).reduce(
            (sum, item) => sum + (Number(item.price) || 0) * (Number(item.count) || 0),
            0
        ), [currentOrder]);

    const handleConfirm = () => {
        if (orderData?.id) {
            // If we have a backend order ID, update the existing order
            saveFinalOrder(tableId, currentOrder);
        } else {
            // If no backend order ID, create a new order
            saveFinalOrder(tableId, currentOrder);
        }
        alert('Sipariş başarıyla onaylandı!');
        navigate(`/${user.role}/home`);
    };

    const handleGoBack = () => {
        navigate(`/${user.role}/order/${tableId}`);
    };

    const pageTitle = `Masa ${tableId} - Sipariş Özeti`;

    // Show loading only when actually fetching from backend and no data exists
    if (isLoading && !orderData && !hasLocalData) {
        return (
            <div style={{
                padding: 30,
                maxWidth: '600px',
                margin: 'auto',
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                backgroundColor: colors.cardBackground,
                border: `1px solid ${colors.border}`,
                borderRadius: '10px',
                color: colors.text,
                boxShadow: `0 4px 12px ${colors.shadow}`,
                textAlign: 'center'
            }}>
                <p>Yükleniyor...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                padding: 30,
                maxWidth: '600px',
                margin: 'auto',
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                backgroundColor: colors.cardBackground,
                border: `1px solid ${colors.border}`,
                borderRadius: '10px',
                color: colors.text,
                boxShadow: `0 4px 12px ${colors.shadow}`,
                textAlign: 'center'
            }}>
                <p style={{ color: '#dc3545' }}>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: "10px 20px",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: colors.primary,
                        color: "white",
                        cursor: "pointer",
                        marginTop: "20px"
                    }}
                >
                    Tekrar Dene
                </button>
            </div>
        );
    }

    return (
        <div style={{
            padding: 30,
            maxWidth: '600px',
            margin: 'auto',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            backgroundColor: colors.cardBackground,
            border: `1px solid ${colors.border}`,
            borderRadius: '10px',
            color: colors.text,
            boxShadow: `0 4px 12px ${colors.shadow}`
        }}>
            <h1 style={{
                textAlign: 'center',
                marginBottom: '30px',
                color: colors.text
            }}>{pageTitle}</h1>

            {Object.keys(currentOrder).length === 0 ? (
                <div style={{ textAlign: "center" }}>
                    <p style={{ color: colors.text }}>Bu masaya ait görüntülenecek bir sipariş yok.</p>
                    <button
                        onClick={() => navigate(`/${user.role}/home`)}
                        style={{
                            padding: "10px 20px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: colors.primary,
                            color: "white",
                            cursor: "pointer",
                            transition: "all 0.3s ease"
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = colors.buttonHover;
                            e.target.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = colors.primary;
                            e.target.style.transform = "translateY(0)";
                        }}
                    >
                        Masalara Dön
                    </button>
                </div>
            ) : (
                <>
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        {Object.entries(currentOrder).map(([id, item]) => (
                            <li key={id} style={{
                                padding: '15px 0',
                                borderBottom: `1px solid ${colors.border}`,
                                color: colors.text
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '600', color: colors.text }}>{item.name} x {item.count}</span>
                                    <span style={{ fontWeight: '500', color: colors.success }}>{item.count * item.price}₺</span>
                                </div>
                                {item.note && (
                                    <p style={{
                                        fontSize: '0.9em',
                                        color: colors.textSecondary,
                                        marginTop: '8px',
                                        paddingLeft: '10px',
                                        borderLeft: `3px solid ${colors.primary}`,
                                        background: colors.surfaceBackground,
                                        padding: '8px',
                                        borderRadius: '4px'
                                    }}>
                                        <strong>Not:</strong> {item.note}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                    <p style={{
                        textAlign: 'right',
                        fontSize: '1.2em',
                        fontWeight: 'bold',
                        marginTop: '20px',
                        color: colors.text
                    }}>
                        <strong>Toplam: <span style={{ color: colors.success }}>{totalPrice}₺</span></strong>
                    </p>
                    <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
                        <button
                            onClick={handleGoBack}
                            style={{
                                backgroundColor: "#6c757d",
                                color: "white",
                                padding: "15px 30px",
                                borderRadius: "8px",
                                border: "none",
                                cursor: "pointer",
                                fontSize: '16px',
                                transition: "all 0.3s ease"
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = "#5a6268";
                                e.target.style.transform = "translateY(-1px)";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = "#6c757d";
                                e.target.style.transform = "translateY(0)";
                            }}
                        >
                            Geri
                        </button>
                        <button
                            onClick={handleConfirm}
                            style={{
                                backgroundColor: colors.success,
                                color: "white",
                                padding: "15px 30px",
                                borderRadius: "8px",
                                border: "none",
                                cursor: "pointer",
                                fontSize: '16px',
                                transition: "all 0.3s ease"
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = "#059669";
                                e.target.style.transform = "translateY(-1px)";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = colors.success;
                                e.target.style.transform = "translateY(0)";
                            }}
                        >
                            Siparişleri Onayla
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
