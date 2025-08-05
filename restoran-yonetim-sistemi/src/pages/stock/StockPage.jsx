import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

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
    const { colors } = useTheme();

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

    return (
        <div style={{
            maxWidth: '1000px',
            margin: '32px auto',
            background: '#473653',
            borderRadius: '16px',
            boxShadow: 'rgba(0, 0, 0, 0.3) 0px 2px 12px',
            padding: '32px'
        }}>
            <h2 style={{
                margin: '0px 0px 16px',
                color: '#f6e9ff',
                fontWeight: 700
            }}>
                Stok Yönetimi
            </h2>

            <div style={{
                background: '#513653',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                border: '1px solid #32263a'
            }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse'
                }}>
                    <thead>
                        <tr style={{
                            background: '#32263a'
                        }}>
                            <th style={{
                                padding: '16px',
                                textAlign: 'left',
                                borderBottom: '1px solid #473653',
                                fontWeight: 600,
                                color: '#f6e9ff'
                            }}>
                                Ürün Adı
                            </th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'left',
                                borderBottom: '1px solid #473653',
                                fontWeight: 600,
                                color: '#f6e9ff'
                            }}>
                                Mevcut Miktar
                            </th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'left',
                                borderBottom: '1px solid #473653',
                                fontWeight: 600,
                                color: '#f6e9ff'
                            }}>
                                Birim
                            </th>
                            <th style={{
                                padding: '16px',
                                textAlign: 'left',
                                borderBottom: '1px solid #473653',
                                fontWeight: 600,
                                color: '#f6e9ff'
                            }}>
                                İşlemler
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {stock.map((item, index) => (
                            <tr key={item.id} style={{
                                background: index % 2 === 0 ? '#513653' : '#473653',
                                color: '#f6e9ff'
                            }}>
                                <td style={{
                                    padding: '16px',
                                    borderBottom: '1px solid #32263a',
                                    color: '#f6e9ff'
                                }}>
                                    {item.name}
                                </td>
                                <td style={{
                                    padding: '16px',
                                    borderBottom: '1px solid #32263a',
                                    color: '#f6e9ff'
                                }}>
                                    {item.quantity}
                                </td>
                                <td style={{
                                    padding: '16px',
                                    borderBottom: '1px solid #32263a',
                                    color: '#f6e9ff'
                                }}>
                                    {item.unit}
                                </td>
                                <td style={{
                                    padding: '16px',
                                    borderBottom: '1px solid #32263a',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    <input
                                        type="number"
                                        min="1"
                                        style={{
                                            padding: '8px 12px',
                                            borderRadius: '6px',
                                            border: '1px solid #32263a',
                                            background: '#473653',
                                            color: '#f6e9ff',
                                            width: '80px'
                                        }}
                                        value={amountToAdd[item.id] || ''}
                                        onChange={(e) => handleAmountChange(item.id, e.target.value)}
                                        placeholder="Miktar"
                                    />
                                    <button
                                        style={{
                                            padding: '8px 16px',
                                            cursor: 'pointer',
                                            background: '#edd2ff',
                                            color: '#32263a',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontWeight: 600,
                                            transition: 'all 0.3s ease'
                                        }}
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
