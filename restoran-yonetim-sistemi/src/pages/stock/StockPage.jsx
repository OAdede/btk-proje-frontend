import React, { useState } from 'react';
import './StockPage.css'; // Stil dosyasını import et

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

        setAmountToAdd(prev => ({ ...prev, [itemId]: '' }));
    };

    const handleAmountChange = (itemId, value) => {
        setAmountToAdd(prev => ({ ...prev, [itemId]: value }));
    };

    return (
        <div className="stock-page-container">
            <h2 className="stock-page-title">
                Stok Yönetimi
            </h2>

            <div className="stock-table-wrapper">
                <table className="stock-table">
                    <thead>
                        <tr>
                            <th>Ürün Adı</th>
                            <th>Mevcut Miktar</th>
                            <th>Birim</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stock.map((item) => (
                            <tr key={item.id}>
                                <td>{item.name}</td>
                                <td>{item.quantity}</td>
                                <td>{item.unit}</td>
                                <td className="stock-actions-cell">
                                    <input
                                        type="number"
                                        min="1"
                                        className="stock-input"
                                        value={amountToAdd[item.id] || ''}
                                        onChange={(e) => handleAmountChange(item.id, e.target.value)}
                                        placeholder="Miktar"
                                    />
                                    <button
                                        className="stock-add-button"
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
        </div>
    );
};

export default StockPage;
