
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import './OrderHistoryPage.css';
import { fetchAllOrders } from '../../../services/orderHistoryService';

const OrderHistoryPage = () => {

    const { isDarkMode, colors } = useTheme();
    const [orderHistory, setOrderHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAction, setSelectedAction] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    // Backend'den sipariş geçmişini çek
    useEffect(() => {
        setLoading(true);
        fetchAllOrders()
            .then(data => {
                // Backend datasını UI'da kullanılacak formata dönüştür
                const mapped = (data || []).map(order => ({
                    id: order.orderId,
                    orderContent: order.items.map(i => `${i.productName} x${i.quantity}`).join(', '),
                    action: 'Sipariş Onaylandı', // Backend'den gelmiyor, örnek olarak sabit
                    personnelName: order.waiterName || '-',
                    personnelRole: '', // Eğer backend'den rol gelirse ekle
                    tableId: order.tableId ? order.tableId.toString() : '-',
                    timestamp: new Date(order.createdAt).toLocaleString('tr-TR'),
                    financialImpact: `+${order.totalPrice}₺`,
                }));
                setOrderHistory(mapped);
                setLoading(false);
            })
            .catch(err => {
                setError('Sipariş geçmişi alınamadı.');
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        let filtered = orderHistory || [];
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.orderContent.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.personnelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.tableId.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (selectedAction !== 'all') {
            filtered = filtered.filter(item => item.action === selectedAction);
        }
        setFilteredHistory(filtered);
    }, [searchTerm, selectedAction, orderHistory]);

    const getStyles = () => ({
        container: {
            padding: '2rem',
            backgroundColor: isDarkMode ? '#32263A' : '#F5EFFF',
            minHeight: '100vh',
            color: isDarkMode ? '#ffffff' : '#333333'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem'
        },
        title: {
            fontSize: '2rem',
            fontWeight: 'bold',
            color: isDarkMode ? '#ffffff' : '#513653',
            margin: 0
        },
        filters: {
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center'
        },
        searchInput: {
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: `1px solid ${isDarkMode ? '#473653' : '#CDC1FF'}`,
            backgroundColor: isDarkMode ? '#473653' : '#E5D9F2',
            color: isDarkMode ? '#ffffff' : '#513653',
            fontSize: '1rem',
            minWidth: '250px'
        },
        select: {
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: `1px solid ${isDarkMode ? '#473653' : '#CDC1FF'}`,
            backgroundColor: isDarkMode ? '#473653' : '#E5D9F2',
            color: isDarkMode ? '#ffffff' : '#513653',
            fontSize: '1rem',
            cursor: 'pointer'
        },
        table: {
            width: '100%',
            backgroundColor: isDarkMode ? '#473653' : '#ffffff',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: `1px solid ${isDarkMode ? '#513653' : '#CDC1FF'}`
        },
        tableHeader: {
            backgroundColor: isDarkMode ? '#513653' : '#E5D9F2',
            padding: '1rem',
            fontWeight: 'bold',
            textAlign: 'left',
            borderBottom: `1px solid ${isDarkMode ? '#473653' : '#CDC1FF'}`,
            color: isDarkMode ? '#ffffff' : '#513653'
        },
        tableCell: {
            padding: '1rem',
            borderBottom: `1px solid ${isDarkMode ? '#473653' : '#CDC1FF'}`,
            color: isDarkMode ? '#ffffff' : '#513653'
        },
        actionBadge: {
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            fontSize: '0.875rem',
            fontWeight: '600',
            display: 'inline-block'
        },
        financialImpact: {
            fontWeight: 'bold',
            fontSize: '1.1rem'
        },
        emptyState: {
            textAlign: 'center',
            padding: '3rem',
            color: isDarkMode ? '#A294F9' : '#513653',
            fontSize: '1.1rem'
        }
    });

    const getActionBadgeStyle = (action) => {
        const baseStyle = getStyles().actionBadge;
        switch (action) {
            case 'Sipariş Eklendi':
                return { ...baseStyle, backgroundColor: isDarkMode ? '#32263A' : '#E5D9F2', color: isDarkMode ? '#A294F9' : '#513653', border: `1px solid ${isDarkMode ? '#473653' : '#CDC1FF'}` };
            case 'Sipariş Onaylandı':
                return { ...baseStyle, backgroundColor: isDarkMode ? '#473653' : '#F5EFFF', color: isDarkMode ? '#ffffff' : '#513653', border: `1px solid ${isDarkMode ? '#513653' : '#A294F9'}` };
            case 'Sipariş İptal Edildi':
                return { ...baseStyle, backgroundColor: isDarkMode ? '#32263A' : '#E5D9F2', color: isDarkMode ? '#A294F9' : '#513653', border: `1px solid ${isDarkMode ? '#473653' : '#CDC1FF'}` };
            case 'Sipariş Silindi':
                return { ...baseStyle, backgroundColor: isDarkMode ? '#473653' : '#F5EFFF', color: isDarkMode ? '#ffffff' : '#513653', border: `1px solid ${isDarkMode ? '#513653' : '#A294F9'}` };
            default:
                return { ...baseStyle, backgroundColor: isDarkMode ? '#32263A' : '#E5D9F2', color: isDarkMode ? '#A294F9' : '#513653', border: `1px solid ${isDarkMode ? '#473653' : '#CDC1FF'}` };
        }
    };

    const getFinancialImpactStyle = (impact) => {
        const baseStyle = getStyles().financialImpact;
        if (impact.startsWith('+')) {
            return { ...baseStyle, color: isDarkMode ? '#A294F9' : '#513653' };
        } else if (impact.startsWith('-')) {
            return { ...baseStyle, color: isDarkMode ? '#A294F9' : '#513653' };
        }
        return { ...baseStyle, color: isDarkMode ? '#ffffff' : '#513653' };
    };

    const styles = getStyles();

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>📋 Sipariş Geçmişi</h1>
                <div style={styles.filters}>
                    <input
                        type="text"
                        placeholder="Sipariş, personel veya masa ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                    <select
                        value={selectedAction}
                        onChange={(e) => setSelectedAction(e.target.value)}
                        style={styles.select}
                    >
                        <option value="all">Tüm İşlemler</option>
                        <option value="Sipariş Eklendi">Sipariş Eklendi</option>
                        <option value="Sipariş Onaylandı">Sipariş Onaylandı</option>
                        <option value="Sipariş İptal Edildi">Sipariş İptal Edildi</option>
                        <option value="Sipariş Silindi">Sipariş Silindi</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div style={styles.emptyState}>Yükleniyor...</div>
            ) : error ? (
                <div style={styles.emptyState}>{error}</div>
            ) : (
                <div style={styles.table}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={styles.tableHeader}>Sipariş İçeriği</th>
                                <th style={styles.tableHeader}>İşlem</th>
                                <th style={styles.tableHeader}>Personel</th>
                                <th style={styles.tableHeader}>Masa</th>
                                <th style={styles.tableHeader}>Tarih/Saat</th>
                                <th style={styles.tableHeader}>Finansal Etki</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHistory.length > 0 ? (
                                filteredHistory.map((item) => (
                                    <tr key={item.id || crypto.randomUUID()}>
                                        <td style={styles.tableCell}>
                                            <div style={{ fontWeight: '500' }}>
                                                {item.orderContent}
                                            </div>
                                        </td>
                                        <td style={styles.tableCell}>
                                            <span style={getActionBadgeStyle(item.action)}>
                                                {item.action}
                                            </span>
                                        </td>
                                        <td style={styles.tableCell}>
                                            <div>
                                                <div style={{ fontWeight: '500' }}>
                                                    {item.personnelName}
                                                </div>
                                                <div style={{ 
                                                    fontSize: '0.875rem', 
                                                    color: isDarkMode ? '#A294F9' : '#513653' 
                                                }}>
                                                    {item.personnelRole}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={styles.tableCell}>
                                            <span style={{
                                                backgroundColor: isDarkMode ? '#513653' : '#E5D9F2',
                                                color: isDarkMode ? '#ffffff' : '#513653',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '12px',
                                                fontSize: '0.875rem',
                                                fontWeight: '500',
                                                border: `1px solid ${isDarkMode ? '#473653' : '#CDC1FF'}`
                                            }}>
                                                {item.tableId}
                                            </span>
                                        </td>
                                        <td style={styles.tableCell}>
                                            {item.timestamp}
                                        </td>
                                        <td style={styles.tableCell}>
                                            <span style={getFinancialImpactStyle(item.financialImpact)}>
                                                {item.financialImpact}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={styles.emptyState}>
                                        {searchTerm || selectedAction !== 'all' 
                                            ? 'Arama kriterlerinize uygun sipariş geçmişi bulunamadı.'
                                            : 'Henüz sipariş geçmişi bulunmuyor.'
                                        }
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default OrderHistoryPage;
