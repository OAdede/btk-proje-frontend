import React, { useState } from 'react';

// Örnek stok verisi (daha sonra API'den veya context'ten gelecek)
const initialStockData = [
    { id: 1, name: 'Domates', quantity: 50, unit: 'kg' },
    { id: 2, name: 'Marul', quantity: 20, unit: 'adet' },
    { id: 3, name: 'Tavuk Göğsü', quantity: 30, unit: 'kg' },
    { id: 4, name: 'Kola', quantity: 100, unit: 'kutu' },
    { id: 5, name: 'Patates', quantity: 80, unit: 'kg' },
];

const StockPage = () => {
    const [stock, setStock] = useState(initialStockData);
    const [amountToAdd, setAmountToAdd] = useState({});

    const handleAddStock = (itemId) => {
        const amount = parseInt(amountToAdd[itemId], 10);
        if (isNaN(amount) || amount <= 0) {
            alert('Lütfen geçerli bir miktar girin.');
            return;
        }

        setStock(currentStock =>
            currentStock.map(item =>
                item.id === itemId
                    ? { ...item, quantity: item.quantity + amount }
                    : item
            )
        );

        // Input'u temizle
        setAmountToAdd(prev => ({ ...prev, [itemId]: '' }));
    };

    const handleAmountChange = (itemId, value) => {
        setAmountToAdd(prev => ({ ...prev, [itemId]: value }));
    };

    // Basit bir stil nesnesi
    const styles = {
        container: { padding: '2rem', fontFamily: 'Arial, sans-serif' },
        header: { marginBottom: '2rem', borderBottom: '2px solid #ccc', paddingBottom: '1rem' },
        table: { width: '100%', borderCollapse: 'collapse' },
        th: { background: '#f2f2f2', padding: '12px', border: '1px solid #ddd', textAlign: 'left' },
        td: { padding: '12px', border: '1px solid #ddd' },
        input: { padding: '8px', marginRight: '10px', width: '80px' },
        button: { padding: '8px 12px', cursor: 'pointer', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Stok Yönetimi</h1>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Ürün Adı</th>
                        <th style={styles.th}>Mevcut Miktar</th>
                        <th style={styles.th}>Birim</th>
                        <th style={styles.th}>İşlemler</th>
                    </tr>
                </thead>
                <tbody>
                    {stock.map(item => (
                        <tr key={item.id}>
                            <td style={styles.td}>{item.name}</td>
                            <td style={styles.td}>{item.quantity}</td>
                            <td style={styles.td}>{item.unit}</td>
                            <td style={styles.td}>
                                <input
                                    type="number"
                                    min="1"
                                    style={styles.input}
                                    value={amountToAdd[item.id] || ''}
                                    onChange={(e) => handleAmountChange(item.id, e.target.value)}
                                    placeholder="Miktar"
                                />
                                <button
                                    style={styles.button}
                                    onClick={() => handleAddStock(item.id)}
                                >
                                    Stok Ekle
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StockPage;
