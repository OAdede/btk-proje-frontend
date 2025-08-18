import React, { useContext, useMemo } from 'react';
import { TableContext } from '../../context/TableContext';
import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';

export default function StockWarning() {
    const { ingredients } = useContext(TableContext);
    const { isDarkMode } = useContext(ThemeContext);
    const { user } = useContext(AuthContext);

    // Sadece admin rolü stok bilgilerine erişebilir
    const isAdmin = user?.role === 'admin';
    
    // Eğer admin değilse veya ingredients boşsa hiçbir şey gösterme
    if (!isAdmin || !ingredients || Object.keys(ingredients).length === 0) {
        return null;
    }

    // Kritik stok durumundaki malzemeleri bul
    const stockAlerts = useMemo(() => {
        const alerts = [];
        
        Object.values(ingredients || {}).forEach(ingredient => {
            if (ingredient.stockQuantity === 0) {
                alerts.push({
                    ...ingredient,
                    status: 'out',
                    message: `${ingredient.name} tükendi`,
                    color: '#dc3545',
                    priority: 3
                });
            } else if (ingredient.stockQuantity <= ingredient.minStock) {
                alerts.push({
                    ...ingredient,
                    status: 'low',
                    message: `${ingredient.name} kritik seviyede (${ingredient.stockQuantity} ${ingredient.unit})`,
                    color: '#ffc107',
                    priority: 2
                });
            }
        });

        // Önceliğe göre sırala (tükenenler önce)
        return alerts.sort((a, b) => b.priority - a.priority);
    }, [ingredients]);

    if (stockAlerts.length === 0) {
        return null; // Uyarı yoksa hiçbir şey gösterme
    }

    return (
        <div
            style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                maxWidth: '300px',
                zIndex: 1000,
                backgroundColor: isDarkMode ? '#2d3748' : '#ffffff',
                border: `2px solid ${stockAlerts[0].color}`,
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                overflow: 'hidden'
            }}
        >
            <div
                style={{
                    backgroundColor: stockAlerts[0].color,
                    color: '#ffffff',
                    padding: '12px 16px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
            >
                <span style={{ fontSize: '16px' }}>⚠️</span>
                Stok Uyarısı ({stockAlerts.length})
            </div>
            <div
                style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    padding: '0'
                }}
            >
                {stockAlerts.slice(0, 5).map((alert, index) => (
                    <div
                        key={alert.id}
                        style={{
                            padding: '12px 16px',
                            borderBottom: index < Math.min(stockAlerts.length, 5) - 1 ? 
                                `1px solid ${isDarkMode ? '#4a5568' : '#e2e8f0'}` : 'none',
                            backgroundColor: isDarkMode ? '#2d3748' : '#ffffff',
                            fontSize: '13px',
                            lineHeight: '1.4'
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: isDarkMode ? '#e2e8f0' : '#2d3748'
                            }}
                        >
                            <div
                                style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: alert.color,
                                    flexShrink: 0
                                }}
                            />
                            <div>
                                <div style={{ fontWeight: '500' }}>
                                    {alert.name}
                                </div>
                                <div style={{ 
                                    fontSize: '12px', 
                                    color: isDarkMode ? '#a0aec0' : '#718096',
                                    marginTop: '2px'
                                }}>
                                    {alert.status === 'out' ? 
                                        'Stok tükendi' : 
                                        `Kalan: ${alert.stockQuantity} ${alert.unit} (Min: ${alert.minStock} ${alert.unit})`
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {stockAlerts.length > 5 && (
                    <div
                        style={{
                            padding: '8px 16px',
                            fontSize: '12px',
                            color: isDarkMode ? '#a0aec0' : '#718096',
                            textAlign: 'center',
                            fontStyle: 'italic'
                        }}
                    >
                        +{stockAlerts.length - 5} diğer uyarı
                    </div>
                )}
            </div>
        </div>
    );
}
