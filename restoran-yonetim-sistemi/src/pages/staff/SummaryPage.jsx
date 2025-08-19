import React, { useContext, useMemo, useState, useEffect } from "react";
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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get backend table ID from table number
    const getBackendTableId = () => {
        const numeric = Number(tableId);
        const byNumber = (tables || []).find(t => Number(t?.tableNumber ?? t?.number) === numeric);
        if (byNumber?.id != null) return Number(byNumber.id);
        const byId = (tables || []).find(t => Number(t?.id) === numeric);
        if (byId?.id != null) return Number(byId.id);
        return numeric;
    };

    // Fetch order data from backend
    useEffect(() => {
        const fetchOrderData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // First try to get order from local state
                const localOrder = orders?.[tableId]?.items || {};
                
                if (Object.keys(localOrder).length > 0) {
                    // Use local order data if available
                    setOrderData({
                        items: localOrder,
                        id: orders[tableId]?.id
                    });
                    setIsLoading(false);
                    return;
                }

                // If no local data, try to fetch from backend
                const backendTableId = getBackendTableId();
                if (backendTableId && !isNaN(backendTableId)) {
                    try {
                        console.log('Fetching orders for table ID:', backendTableId);
                        const backendOrders = await orderService.getOrdersByTableId(backendTableId);
                        console.log('Backend orders received:', backendOrders);
                        
                        if (backendOrders && backendOrders.length > 0) {
                            // Find the most recent active order
                            const activeOrder = backendOrders.find(order => 
                                order.status !== 'paid' && order.status !== 'cancelled'
                            ) || backendOrders[0];

                            if (activeOrder && activeOrder.items) {
                                // Transform backend order items to frontend format
                                const transformedItems = (activeOrder.items || []).reduce((acc, item) => {
                                    acc[item.productId] = {
                                        id: item.productId,
                                        name: item.productName || 'Bilinmeyen Ürün',
                                        price: item.unitPrice || 0,
                                        count: item.quantity || 0,
                                        note: item.note || ''
                                    };
                                    return acc;
                                }, {});

                                setOrderData({
                                    items: transformedItems,
                                    id: activeOrder.id
                                });
                                console.log('Order data set from backend:', transformedItems);
                            } else {
                                console.log('No items found in active order');
                                setOrderData({ items: {}, id: null });
                            }
                        } else {
                            console.log('No orders found for table');
                            setOrderData({ items: {}, id: null });
                        }
                    } catch (backendError) {
                        console.warn('Could not fetch from backend, using local state:', backendError);
                        // Fallback to local state
                        setOrderData({
                            items: localOrder,
                            id: orders[tableId]?.id
                        });
                    }
                } else {
                    console.log('Invalid backend table ID, using local state');
                    // Fallback to local state
                    setOrderData({
                        items: localOrder,
                        id: orders[tableId]?.id
                    });
                }
            } catch (error) {
                console.error('Error fetching order data:', error);
                setError('Sipariş verileri alınırken hata oluştu');
                // Fallback to local state
                const localOrder = orders?.[tableId]?.items || {};
                setOrderData({
                    items: localOrder,
                    id: orders[tableId]?.id
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderData();
    }, [tableId, orders, tables]);

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

    if (isLoading) {
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
