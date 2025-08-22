import React, { useContext, useMemo, useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { TableContext } from "../../context/TableContext";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function Summary() {
    const { tableId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useContext(AuthContext);
    const { orders, saveFinalOrder, finalizeOrder, tables, isLoading: contextLoading, error: contextError } = useContext(TableContext);
    const { colors } = useTheme();

    // Debug flag for summary operations
    const DEBUG_SUMMARY = (import.meta?.env?.VITE_DEBUG_SUMMARY === 'true');

    // Get cart data from navigation state (from OrderPage)
    const cartDataFromNavigation = location.state?.cartData;
    const skipBackendSync = location.state?.skipBackendSync;

    // State for order data
    const [orderData, setOrderData] = useState(null);
    const [databaseOrder, setDatabaseOrder] = useState(null); // Original order from database
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
            if (DEBUG_SUMMARY) console.log(`Tamamlanmış sipariş ${order.id} masada gösterilmeyecek`);
            return null;
        }
        
        return order || null;
    }, [tables, orders]);

    // Check if we have local data immediately - memoized to prevent recalculation
    const hasLocalData = useMemo(() => {
        if (!tables || tables.length === 0) return false;
        const order = getOrderForTable(tableId);
        const localOrder = order?.items || {};
        return Object.keys(localOrder).length > 0;
    }, [tables, orders, tableId]); // Use primitive dependencies only

    // Initialize with local data if available
    useEffect(() => {
        // Prevent re-initialization if already set
        if (orderData) return;
        
        // Store original database order for comparison
        if (tables && tables.length > 0) {
            const backendTable = tables.find(t => String(t?.tableNumber ?? t?.id) === tableId);
            if (backendTable) {
                const backendTableId = String(backendTable.id);
                const order = orders[backendTableId];
                
                if (order && order.isCompleted !== true) {
                    const localOrder = order?.items || {};
                    setDatabaseOrder({
                        items: localOrder,
                        id: order?.id
                    });
                }
            }
        }
        
        // Öncelik: Navigation state'den gelen cart verisi
        if (cartDataFromNavigation && skipBackendSync) {
            if (DEBUG_SUMMARY) console.log("Summary: Using cart data from navigation");
            setOrderData({
                items: cartDataFromNavigation,
                id: null, // Yeni sipariş, henüz backend'de yok
                isFromCart: true
            });
            return;
        }
        
        // Alternatif: Backend'den mevcut sipariş verisi
        if (tables && tables.length > 0) {
            // Direct calculation without function calls
            const backendTable = tables.find(t => String(t?.tableNumber ?? t?.id) === tableId);
            if (backendTable) {
                const backendTableId = String(backendTable.id);
                const order = orders[backendTableId];
                
                if (order && order.isCompleted !== true) {
                    const localOrder = order?.items || {};
                    if (Object.keys(localOrder).length > 0) {
                        if (DEBUG_SUMMARY) console.log("Summary: Using backend order data", localOrder);
                        setOrderData({
                            items: localOrder,
                            id: order?.id,
                            isFromCart: false
                        });
                        return;
                    }
                }
            }
        }
        
        // If no data found, set empty order
        if (DEBUG_SUMMARY) console.log("Summary: No order data available, setting empty");
        setOrderData({ items: {}, id: null, isFromCart: false });
        
    }, [cartDataFromNavigation, skipBackendSync, tableId, tables, orders, orderData]);

    const currentOrder = orderData?.items || {};
    const originalOrder = databaseOrder?.items || {};

    // Calculate order differences
    const orderDifferences = useMemo(() => {
        const differences = {
            added: {}, // New items
            removed: {}, // Items removed from original
            modified: {}, // Items with quantity changes
            unchanged: {} // Items with no changes
        };

        // Get all unique product IDs from both orders
        const allProductIds = new Set([
            ...Object.keys(currentOrder),
            ...Object.keys(originalOrder)
        ]);

        allProductIds.forEach(productId => {
            const currentItem = currentOrder[productId];
            const originalItem = originalOrder[productId];
            const currentCount = currentItem?.count || 0;
            const originalCount = originalItem?.count || 0;

            if (originalCount === 0 && currentCount > 0) {
                // New item added
                differences.added[productId] = currentItem;
            } else if (originalCount > 0 && currentCount === 0) {
                // Item removed
                differences.removed[productId] = originalItem;
            } else if (originalCount > 0 && currentCount > 0 && originalCount !== currentCount) {
                // Item quantity modified
                differences.modified[productId] = {
                    ...currentItem,
                    originalCount,
                    countDifference: currentCount - originalCount
                };
            } else if (originalCount > 0 && currentCount > 0 && originalCount === currentCount) {
                // Item unchanged
                differences.unchanged[productId] = currentItem;
            }
        });

        return differences;
    }, [currentOrder, originalOrder]);

    // Check if there are any changes
    const hasChanges = useMemo(() => {
        return Object.keys(orderDifferences.added).length > 0 ||
               Object.keys(orderDifferences.removed).length > 0 ||
               Object.keys(orderDifferences.modified).length > 0;
    }, [orderDifferences]);

    const totalPrice = useMemo(() =>
        Object.values(currentOrder).reduce(
            (sum, item) => sum + (Number(item.price) || 0) * (Number(item.count) || 0),
            0
        ), [currentOrder]);

    const originalTotalPrice = useMemo(() =>
        Object.values(originalOrder).reduce(
            (sum, item) => sum + (Number(item.price) || 0) * (Number(item.count) || 0),
            0
        ), [originalOrder]);

    const priceDifference = totalPrice - originalTotalPrice;

    const handleConfirm = async () => {
        if (DEBUG_SUMMARY) console.log("Summary: Confirming order");
        
        try {
            setIsLoading(true);
            setError(null);
            
            // Only save/update the order - NO stock processing yet
            // Stock will be processed when cashier clicks "Ödeme Al ve Masayı Kapat"
            await saveFinalOrder(tableId, currentOrder);
            
            alert('Sipariş başarıyla kaydedildi! Ödeme için kasiyere başvurun.');
            navigate(`/${user.role}/home`);
        } catch (error) {
            console.error("Summary: Error saving order:", error);
            setError("Sipariş kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoBack = () => {
        if (DEBUG_SUMMARY) console.log("Summary: Navigating back");
        
        // Always navigate to the order page with current cart data
        navigate(`/${user.role}/order/${tableId}`, { 
            state: { 
                restoreCart: currentOrder 
            } 
        });
    };

    const pageTitle = `Masa ${tableId} - Sipariş Özeti`;

    // Debug logging - only in development and when needed
    useEffect(() => {
        const debugMode = import.meta.env.VITE_DEBUG_SUMMARY === 'true';
        if (debugMode) {
            console.log("=== SUMMARY PAGE DEBUG ===");
            console.log("Cart from navigation:", cartDataFromNavigation);
            console.log("Skip backend sync:", skipBackendSync);
            console.log("Current order data:", orderData);
            console.log("User role:", user?.role);
        }
    }, [cartDataFromNavigation, skipBackendSync, orderData, user?.role]);

    // Early return if user is not loaded
    if (!user || !user.role) {
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
                textAlign: 'center'
            }}>
                <p>Kullanıcı bilgileri yükleniyor...</p>
            </div>
        );
    }

    // Show loading only when context is loading
    if (contextLoading) {
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

    if (contextError || error) {
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
                <p style={{ color: '#dc3545' }}>{contextError || error}</p>
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

            {error && (
                <div style={{
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    border: '1px solid #f5c6cb'
                }}>
                    {error}
                </div>
            )}

            {Object.keys(currentOrder).length === 0 && !hasChanges ? (
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
                    {/* Show changes comparison if there are differences */}
                    {hasChanges && databaseOrder && (
                        <div style={{
                            marginBottom: '25px',
                            padding: '15px',
                            backgroundColor: colors.surfaceBackground,
                            borderRadius: '8px',
                            border: `1px solid ${colors.border}`
                        }}>
                            <h3 style={{ 
                                color: colors.text, 
                                marginBottom: '15px',
                                fontSize: '1.1em'
                            }}>📋 Değişiklik Özeti</h3>
                            
                            {Object.keys(orderDifferences.added).length > 0 && (
                                <div style={{ marginBottom: '10px' }}>
                                    <h4 style={{ color: '#059669', fontSize: '0.95em', marginBottom: '8px' }}>
                                        ➕ Eklenen Ürünler:
                                    </h4>
                                    {Object.entries(orderDifferences.added).map(([id, item]) => (
                                        <div key={`added-${id}`} style={{
                                            padding: '5px 10px',
                                            backgroundColor: '#d4edda',
                                            color: '#155724',
                                            borderRadius: '4px',
                                            marginBottom: '3px',
                                            fontSize: '0.9em'
                                        }}>
                                            {item.name} x {item.count} (+{item.count * item.price}₺)
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {Object.keys(orderDifferences.removed).length > 0 && (
                                <div style={{ marginBottom: '10px' }}>
                                    <h4 style={{ color: '#dc3545', fontSize: '0.95em', marginBottom: '8px' }}>
                                        ➖ Kaldırılan Ürünler:
                                    </h4>
                                    {Object.entries(orderDifferences.removed).map(([id, item]) => (
                                        <div key={`removed-${id}`} style={{
                                            padding: '5px 10px',
                                            backgroundColor: '#f8d7da',
                                            color: '#721c24',
                                            borderRadius: '4px',
                                            marginBottom: '3px',
                                            fontSize: '0.9em'
                                        }}>
                                            {item.name} x {item.count} (-{item.count * item.price}₺)
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {Object.keys(orderDifferences.modified).length > 0 && (
                                <div style={{ marginBottom: '10px' }}>
                                    <h4 style={{ color: '#ffc107', fontSize: '0.95em', marginBottom: '8px' }}>
                                        🔄 Miktarı Değişen Ürünler:
                                    </h4>
                                    {Object.entries(orderDifferences.modified).map(([id, item]) => (
                                        <div key={`modified-${id}`} style={{
                                            padding: '5px 10px',
                                            backgroundColor: '#fff3cd',
                                            color: '#856404',
                                            borderRadius: '4px',
                                            marginBottom: '3px',
                                            fontSize: '0.9em'
                                        }}>
                                            {item.name}: {item.originalCount} → {item.count} 
                                            ({item.countDifference > 0 ? '+' : ''}{item.countDifference} adet, 
                                            {item.countDifference > 0 ? '+' : ''}{item.countDifference * item.price}₺)
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {/* Price difference summary */}
                            <div style={{
                                marginTop: '15px',
                                padding: '10px',
                                backgroundColor: colors.cardBackground,
                                borderRadius: '6px',
                                borderLeft: `4px solid ${priceDifference >= 0 ? '#059669' : '#dc3545'}`
                            }}>
                                <div style={{ fontSize: '0.9em', color: colors.textSecondary }}>
                                    Önceki Toplam: {originalTotalPrice}₺
                                </div>
                                <div style={{ fontSize: '1em', fontWeight: 'bold', color: colors.text }}>
                                    Yeni Toplam: {totalPrice}₺
                                </div>
                                <div style={{ 
                                    fontSize: '0.9em', 
                                    color: priceDifference >= 0 ? '#059669' : '#dc3545',
                                    fontWeight: 'bold'
                                }}>
                                    Fark: {priceDifference >= 0 ? '+' : ''}{priceDifference}₺
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Current order summary - show even if empty when there are changes */}
                    {(Object.keys(currentOrder).length > 0 || hasChanges) && (
                        <div style={{
                            marginBottom: '20px'
                        }}>
                            <h3 style={{ 
                                color: colors.text, 
                                marginBottom: '15px',
                                fontSize: '1.1em'
                            }}>
                                {hasChanges ? '📝 Güncel Sipariş' : '📋 Sipariş Detayları'}
                            </h3>
                            
                            {Object.keys(currentOrder).length > 0 ? (
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
                            ) : (
                                <div style={{
                                    padding: '20px',
                                    backgroundColor: colors.surfaceBackground,
                                    borderRadius: '8px',
                                    border: `1px dashed ${colors.border}`,
                                    textAlign: 'center',
                                    color: colors.textSecondary
                                }}>
                                    <p>📝 Sipariş boş - Tüm ürünler kaldırıldı</p>
                                </div>
                            )}
                        </div>
                    )}
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
                            onClick={(e) => {
                                if (DEBUG_SUMMARY) console.log("Back button clicked");
                                e.preventDefault();
                                e.stopPropagation();
                                handleGoBack();
                            }}
                            disabled={isLoading}
                            style={{
                                backgroundColor: isLoading ? "#cccccc" : "#6c757d",
                                color: "white",
                                padding: "15px 30px",
                                borderRadius: "8px",
                                border: "none",
                                cursor: isLoading ? "not-allowed" : "pointer",
                                fontSize: '16px',
                                transition: "all 0.3s ease"
                            }}
                            onMouseEnter={(e) => {
                                if (!isLoading) {
                                    e.target.style.backgroundColor = "#5a6268";
                                    e.target.style.transform = "translateY(-1px)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isLoading) {
                                    e.target.style.backgroundColor = "#6c757d";
                                    e.target.style.transform = "translateY(0)";
                                }
                            }}
                        >
                            {isLoading ? "İşleniyor..." : "Geri"}
                        </button>
                        <button
                            onClick={(e) => {
                                if (DEBUG_SUMMARY) console.log("Confirm button clicked");
                                e.preventDefault();
                                e.stopPropagation();
                                handleConfirm();
                            }}
                            disabled={isLoading}
                            style={{
                                backgroundColor: isLoading ? "#cccccc" : colors.success,
                                color: "white",
                                padding: "15px 30px",
                                borderRadius: "8px",
                                border: "none",
                                cursor: isLoading ? "not-allowed" : "pointer",
                                fontSize: '16px',
                                transition: "all 0.3s ease"
                            }}
                            onMouseEnter={(e) => {
                                if (!isLoading) {
                                    e.target.style.backgroundColor = "#059669";
                                    e.target.style.transform = "translateY(-1px)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isLoading) {
                                    e.target.style.backgroundColor = colors.success;
                                    e.target.style.transform = "translateY(0)";
                                }
                            }}
                        >
                            {isLoading ? "Kaydediliyor..." : 
                             Object.keys(currentOrder).length === 0 && hasChanges ? "Değişiklikleri Kaydet" :
                             "Siparişi Kaydet"}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
