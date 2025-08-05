import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

// Örnek ürün verileri - görüntüdeki gibi
const sampleProducts = [
    { id: 1, name: 'Burger', category: 'Ana Yemek', price: 250, stock: 15, minStock: 10, status: 'Yeterli' },
    { id: 2, name: 'Pizza', category: 'Ana Yemek', price: 300, stock: 19, minStock: 15, status: 'Yeterli' },
    { id: 3, name: 'Makarna', category: 'Ana Yemek', price: 200, stock: 23, minStock: 12, status: 'Yeterli' },
    { id: 4, name: 'Kola', category: 'İçecek', price: 50, stock: 50, minStock: 20, status: 'Yeterli' },
    { id: 5, name: 'Ayran', category: 'İçecek', price: 40, stock: 40, minStock: 25, status: 'Yeterli' },
    { id: 6, name: 'Su', category: 'İçecek', price: 20, stock: 100, minStock: 30, status: 'Yeterli' },
];

const categories = [
    'Tümü', 'Ana Yemek', 'Aparatifler', 'Fırın', 'Izgaralar', 'Kahvaltılıklar', 'İçecekler', 'Tatlılar'
];

const ProductsPage = () => {
    const [products, setProducts] = useState(sampleProducts);
    const [selectedCategory, setSelectedCategory] = useState('Tümü');
    const { colors } = useTheme();

    const handleAddProduct = () => {
        console.log('Yeni ürün ekleme formu açılacak.');
    };

    const handleEditProduct = (id) => {
        console.log(`Ürün ${id} düzenlenecek.`);
    };

    const handleDeleteProduct = (id) => {
        setProducts(products.filter(p => p.id !== id));
        console.log(`Ürün ${id} silindi.`);
    };

    const filteredProducts = selectedCategory === 'Tümü' 
        ? products 
        : products.filter(product => product.category === selectedCategory);

    return (
        <div style={{
            padding: '24px',
            background: 'var(--background)',
            color: 'var(--text)',
            minHeight: '100vh'
        }}>
            {/* Başlık */}
            <h1 style={{
                fontSize: '2rem',
                color: 'var(--text)',
                fontWeight: 700,
                textAlign: 'center',
                marginBottom: '32px',
                marginTop: '0'
            }}>
                Ürün & Stok Yönetimi
            </h1>

            {/* Kategori Filtreleri */}
            <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '32px',
                flexWrap: 'wrap',
                justifyContent: 'center'
            }}>
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        style={{
                            background: selectedCategory === category ? 'var(--primary)' : 'var(--surface)',
                            color: selectedCategory === category ? '#ffffff' : 'var(--text)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            padding: '12px 20px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '14px',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Ürün Listesi */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            }}>
                {filteredProducts.map((product) => (
                    <div
                        key={product.id}
                        style={{
                            background: 'var(--surface)',
                            borderRadius: '12px',
                            padding: '20px',
                            border: '1px solid var(--border)',
                            boxShadow: '0 2px 8px var(--shadow)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '16px',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {/* Ürün Bilgileri */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '24px',
                            flex: 1,
                            minWidth: '300px'
                        }}>
                            <div style={{
                                fontWeight: 600,
                                fontSize: '16px',
                                color: 'var(--text)',
                                minWidth: '120px'
                            }}>
                                {product.name}
                            </div>
                            
                            <div style={{
                                color: 'var(--text)',
                                fontWeight: 600,
                                minWidth: '80px'
                            }}>
                                {product.price} ₺
                            </div>
                            
                            <div style={{
                                color: 'var(--text)',
                                minWidth: '80px'
                            }}>
                                {product.stock} adet
                            </div>
                            
                            <div style={{
                                color: 'var(--text)',
                                minWidth: '60px'
                            }}>
                                Min: {product.minStock}
                            </div>
                        </div>

                        {/* Durum ve Butonlar */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            flexWrap: 'wrap'
                        }}>
                            <span style={{
                                background: 'var(--success)',
                                color: '#ffffff',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 600
                            }}>
                                {product.status}
                            </span>
                            
                            <button
                                onClick={() => handleEditProduct(product.id)}
                                style={{
                                    background: 'var(--primary)',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '8px 16px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '12px',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Düzenle
                            </button>
                            
                            <button
                                onClick={() => handleDeleteProduct(product.id)}
                                style={{
                                    background: 'var(--danger)',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '8px 16px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '12px',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Sil
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Yeni Ürün Ekleme Butonu */}
            <div style={{
                textAlign: 'center',
                marginTop: '32px'
            }}>
                <button
                    onClick={handleAddProduct}
                    style={{
                        background: 'linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '16px 32px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '16px',
                        boxShadow: '0 4px 12px var(--shadow)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    + Yeni Ürün Ekle
                </button>
            </div>
        </div>
    );
};

export default ProductsPage;
