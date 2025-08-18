import React, { useContext, useMemo, useState } from 'react';
import { TableContext } from '../../context/TableContext';
import { AuthContext } from '../../context/AuthContext.jsx';
import '../../components/stock/StokUpdate.css';

const ProductsPage = () => {
    const { products, ingredients, updateProduct, deleteProduct } = useContext(TableContext);
    const { user } = useContext(AuthContext);
    const isAdmin = user?.role === 'admin';

    const categories = useMemo(() => ['Tümü', ...Object.keys(products)], [products]);
    const allProducts = useMemo(() => Object.values(products).flat(), [products]);
    const [selectedCategory, setSelectedCategory] = useState('Tümü');

    const filteredProducts = useMemo(() => {
        return selectedCategory === 'Tümü' ? allProducts : (products[selectedCategory] || []);
    }, [allProducts, products, selectedCategory]);

    const getProductStockStatus = (product) => {
        if (!product.recipe || product.recipe.length === 0) {
            return { text: 'Reçete Yok', color: 'var(--info)' };
        }
        let isCritical = false;
        for (const item of product.recipe) {
            const ingredient = ingredients[item.ingredientId];
            if (!ingredient) return { text: 'Stok Bilgisi Yok', color: 'var(--info)' };
            if (ingredient.stockQuantity < item.quantity) return { text: 'Tükendi', color: 'var(--danger)' };
            if (ingredient.stockQuantity <= ingredient.minStock) isCritical = true;
        }
        if (isCritical) return { text: 'Kritik', color: 'var(--warning)' };
        return { text: 'Yeterli', color: 'var(--success)' };
    };

    const handleEditProductPrice = async (product) => {
        const input = prompt('Yeni fiyat (₺):', String(product.price ?? ''));
        if (input == null) return;
        const newPrice = Number(input);
        if (!Number.isFinite(newPrice) || newPrice < 0) {
            alert('Geçerli bir fiyat giriniz.');
            return;
        }
        try {
            await updateProduct(product.category, { ...product, price: newPrice });
        } catch (e) {
            alert(`Ürün güncellenemedi: ${e.message}`);
        }
    };

    const handleDelete = async (product) => {
        if (!confirm(`${product.name} ürününü silmek istediğinize emin misiniz?`)) return;
        try {
            await deleteProduct(product.id);
        } catch (e) {
            alert(`Ürün silinemedi: ${e.message}`);
        }
    };

    return (
        <div className="stok-update-container">
            <h2 className="stok-update-title">Ürün & Stok Yönetimi</h2>

            <div className="category-filter-buttons">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`category-filter-button ${selectedCategory === category ? 'active' : ''}`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className="product-list">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => {
                        const status = getProductStockStatus(product);
                        return (
                            <div key={product.id} className="product-list-item">
                                <div className="item-details">
                                    <div className="item-name">{product.name}</div>
                                    <div className="item-price">{product.price} ₺</div>
                                    <div className="item-description">{product.description || 'Açıklama yok'}</div>
                                    <div className="item-recipe">
                                        <strong>Reçete:</strong>
                                        {product.recipe && product.recipe.length > 0 ? (
                                            <ul>
                                                {product.recipe.map((item, i) => {
                                                    // Debug: Önce item.name'i kontrol et, yoksa ingredients'dan al
                                                    const ingredientName = item.name || ingredients[item.ingredientId]?.name || 'Bilinmeyen malzeme';
                                                    const ingredientUnit = ingredients[item.ingredientId]?.unit || '';
                                                    
                                                    return (
                                                        <li key={i}>
                                                            {ingredientName}: {item.quantity} {ingredientUnit}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        ) : (
                                            <span>Reçete bulunamadı.</span>
                                        )}
                                    </div>
                                </div>
                                <div className="item-status-and-actions">
                                    <div className="item-status" style={{ backgroundColor: status.color }}>
                                        {status.text}
                                    </div>
                                    {isAdmin && (
                                        <div className="item-actions">
                                            <button className="edit-button" onClick={() => handleEditProductPrice(product)}>Fiyat</button>
                                            <button className="delete-button" onClick={() => handleDelete(product)}>Sil</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="no-products-message">Bu kategoride ürün bulunamadı.</p>
                )}
            </div>
        </div>
    );
};

export default ProductsPage;
