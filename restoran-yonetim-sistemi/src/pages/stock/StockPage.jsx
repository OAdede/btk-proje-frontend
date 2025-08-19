import React, { useState, useContext } from 'react';
import { TableContext } from '../../context/TableContext';
import './StockPage.css'; // Stil dosyasını import et

const StockPage = () => {
    const { ingredients, updateIngredientStock, deleteIngredient, isLoading } = useContext(TableContext);
    const [amountToAdd, setAmountToAdd] = useState({});
    const [isUpdating, setIsUpdating] = useState({});
    const [isDeleting, setIsDeleting] = useState({});

    const handleAddStock = async (itemId) => {
        const amount = parseInt(amountToAdd[itemId], 10);
        if (isNaN(amount) || amount <= 0) {
            alert('Lütfen geçerli bir miktar girin.');
            return;
        }

        setIsUpdating(prev => ({ ...prev, [itemId]: true }));
        try {
            await updateIngredientStock(itemId, amount, "PURCHASE", "Stok ekleme");
            setAmountToAdd(prev => ({ ...prev, [itemId]: '' }));
            alert('Stok başarıyla güncellendi!');
        } catch (error) {
            alert(`Stok güncellenirken hata oluştu: ${error.message}`);
        } finally {
            setIsUpdating(prev => ({ ...prev, [itemId]: false }));
        }
    };

    const handleAmountChange = (itemId, value) => {
        setAmountToAdd(prev => ({ ...prev, [itemId]: value }));
    };

    const handleDeleteStock = async (item) => {
        const confirmMessage = `"${item.name}" malzemesini silmek istediğinizden emin misiniz?\n\nBu işlem:\n• Malzemeyi kalıcı olarak silecek\n• İlgili tüm stok hareketlerini silecek\n• Geri alınamaz\n\nDevam etmek istiyor musunuz?`;
        
        if (!window.confirm(confirmMessage)) {
            return;
        }

        setIsDeleting(prev => ({ ...prev, [item.id]: true }));
        try {
            const result = await deleteIngredient(item.id);
            if (result && result.success) {
                alert(result.message || "Malzeme başarıyla silindi!");
            }
        } catch (error) {
            alert(`Malzeme silinirken hata oluştu: ${error.message}`);
        } finally {
            setIsDeleting(prev => ({ ...prev, [item.id]: false }));
        }
    };

    if (isLoading) {
        return (
            <div className="stock-page-container">
                <h2 className="stock-page-title">Stok Yönetimi</h2>
                <p>Yükleniyor...</p>
            </div>
        );
    }

    const stockItems = Object.values(ingredients || {});

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
                            <th>Min. Stok</th>
                            <th>Durum</th>
                            <th>Stok Ekle</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stockItems.length > 0 ? (
                            stockItems.map((item) => {
                                const isLowStock = item.stockQuantity <= item.minStock;
                                const isOutOfStock = item.stockQuantity === 0;
                                
                                return (
                                    <tr key={item.id || crypto.randomUUID()}>
                                        <td>{item.name}</td>
                                        <td>{item.stockQuantity}</td>
                                        <td>{item.unit}</td>
                                        <td>{item.minStock}</td>
                                        <td>
                                            <span 
                                                className={`stock-status ${
                                                    isOutOfStock ? 'out-of-stock' : 
                                                    isLowStock ? 'low-stock' : 'normal-stock'
                                                }`}
                                            >
                                                {isOutOfStock ? 'Tükendi' : 
                                                 isLowStock ? 'Kritik' : 'Yeterli'}
                                            </span>
                                        </td>
                                        <td className="stock-actions-cell">
                                            <input
                                                type="number"
                                                min="1"
                                                className="stock-input"
                                                value={amountToAdd[item.id] || ''}
                                                onChange={(e) => handleAmountChange(item.id, e.target.value)}
                                                placeholder="Miktar"
                                                disabled={isUpdating[item.id]}
                                            />
                                            <button
                                                className="stock-add-button"
                                                onClick={() => handleAddStock(item.id)}
                                                disabled={isUpdating[item.id]}
                                            >
                                                {isUpdating[item.id] ? 'Güncelleniyor...' : 'Stok Ekle'}
                                            </button>
                                        </td>
                                        <td className="stock-actions-cell">
                                            <button
                                                className="stock-delete-button"
                                                onClick={() => handleDeleteStock(item)}
                                                disabled={isDeleting[item.id]}
                                            >
                                                {isDeleting[item.id] ? 'Siliniyor...' : 'Sil'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center' }}>
                                    Henüz stok malzemesi bulunmamaktadır.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockPage;
