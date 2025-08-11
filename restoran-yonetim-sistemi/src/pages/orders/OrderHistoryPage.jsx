import React, { useState, useContext, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';
import { TableContext } from '../../context/TableContext';
import './OrderHistoryPage.css';

const OrderHistoryPage = () => {
    const { isDarkMode, colors } = useTheme();
    const { user } = useContext(AuthContext);
    const { orderHistory } = useContext(TableContext);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAction, setSelectedAction] = useState('all');

    useEffect(() => {
        // Use real data from context
        let filtered = orderHistory || [];

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.orderContent.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.personnelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.tableId.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by action
        if (selectedAction !== 'all') {
            filtered = filtered.filter(item => item.action === selectedAction);
        }

        setFilteredHistory(filtered);
    }, [searchTerm, selectedAction, orderHistory]);

    const getStyles = () => ({
        container: {
            padding: '2rem',
            backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f9fa',
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
            color: isDarkMode ? '#ffffff' : '#333333',
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
            border: `1px solid ${isDarkMode ? '#4a4a4a' : '#ddd'}`,
            backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#333333',
            fontSize: '1rem',
            minWidth: '250px'
        },
        select: {
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: `1px solid ${isDarkMode ? '#4a4a4a' : '#ddd'}`,
            backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#333333',
            fontSize: '1rem',
            cursor: 'pointer'
        },
        table: {
            width: '100%',
            backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: `1px solid ${isDarkMode ? '#4a4a4a' : '#e0e0e0'}`
        },
        tableHeader: {
            backgroundColor: isDarkMode ? '#3a3a3a' : '#f8f9fa',
            padding: '1rem',
            fontWeight: 'bold',
            textAlign: 'left',
            borderBottom: `1px solid ${isDarkMode ? '#4a4a4a' : '#e0e0e0'}`,
            color: isDarkMode ? '#ffffff' : '#333333'
        },
        tableCell: {
            padding: '1rem',
            borderBottom: `1px solid ${isDarkMode ? '#4a4a4a' : '#e0e0e0'}`,
            color: isDarkMode ? '#ffffff' : '#333333'
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
            color: isDarkMode ? '#888888' : '#666666',
            fontSize: '1.1rem'
        }
    });

    const getActionBadgeStyle = (action) => {
        const baseStyle = getStyles().actionBadge;
        switch (action) {
            case 'Sipariş Eklendi':
                return { ...baseStyle, backgroundColor: '#d4edda', color: '#155724' };
            case 'Sipariş Onaylandı':
                return { ...baseStyle, backgroundColor: '#d1ecf1', color: '#0c5460' };
            case 'Sipariş İptal Edildi':
                return { ...baseStyle, backgroundColor: '#f8d7da', color: '#721c24' };
            case 'Sipariş Silindi':
                return { ...baseStyle, backgroundColor: '#fff3cd', color: '#856404' };
            default:
                return { ...baseStyle, backgroundColor: '#e2e3e5', color: '#383d41' };
        }
    };

    const getFinancialImpactStyle = (impact) => {
        const baseStyle = getStyles().financialImpact;
        if (impact.startsWith('+')) {
            return { ...baseStyle, color: '#28a745' };
        } else if (impact.startsWith('-')) {
            return { ...baseStyle, color: '#dc3545' };
        }
        return baseStyle;
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
                                                color: isDarkMode ? '#888888' : '#666666' 
                                            }}>
                                                {item.personnelRole}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={styles.tableCell}>
                                        <span style={{
                                            backgroundColor: isDarkMode ? '#4a4a4a' : '#f0f0f0',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px',
                                            fontSize: '0.875rem',
                                            fontWeight: '500'
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
        </div>
    );
};

export default OrderHistoryPage;
