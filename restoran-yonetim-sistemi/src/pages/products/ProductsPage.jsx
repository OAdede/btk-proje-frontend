import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

// Örnek ürün verileri - görüntüdeki gibi
const sampleProducts = [
    { id: 1, name: 'Et Döner', category: 'Ana Yemek', price: 535, stock: 50, minStock: 10, status: 'Yeterli', description: 'Tarif:Tarif bulunamadı.' },
    { id: 2, name: 'Döner Beyti Sarma', category: 'Ana Yemek', price: 545, stock: 30, minStock: 5, status: 'Yeterli', description: 'Tarif:Tarif bulunamadı.' },
    { id: 3, name: 'Tereyağlı İskender', category: 'Ana Yemek', price: 560, stock: 25, minStock: 8, status: 'Yeterli', description: 'Tarif:Tarif bulunamadı.' },
    { id: 4, name: 'Pilav Üstü Döner', category: 'Ana Yemek', price: 550, stock: 40, minStock: 12, status: 'Yeterli', description: 'Tarif:Tarif bulunamadı.' },
    { id: 5, name: 'SSK Dürüm Döner', category: 'Ana Yemek', price: 560, stock: 35, minStock: 7, status: 'Yeterli', description: 'Tarif:Tarif bulunamadı.' },
    { id: 6, name: 'Çiğköfte', category: 'Aparatifler', price: 140, stock: 20, minStock: 5, status: 'Yeterli', description: 'Tarif:Tarif bulunamadı.' },
    { id: 7, name: 'Soğan Halkası', category: 'Aparatifler', price: 130, stock: 15, minStock: 3, status: 'Yeterli', description: 'Tarif:Tarif bulunamadı.' },
    { id: 8, name: 'Patates Kızartması', category: 'Aparatifler', price: 140, stock: 30, minStock: 8, status: 'Yeterli', description: 'Tarif:Tarif bulunamadı.' },
    { id: 9, name: 'Börek Çeşitleri', category: 'Fırın', price: 140, stock: 25, minStock: 6, status: 'Yeterli', description: 'Tarif:Tarif bulunamadı.' },
    { id: 10, name: 'Salata Çeşitleri', category: 'Aparatifler', price: 120, stock: 18, minStock: 4, status: 'Yeterli', description: 'Tarif:Tarif bulunamadı.' },
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
            maxWidth: '1400px',
            margin: '32px auto',
            background: colors.cardBackground,
            borderRadius: '16px',
            boxShadow: `0 8px 32px ${colors.shadow}`,
            padding: '32px',
            border: `1px solid ${colors.border}`
        }}>
            <h2 style={{
                margin: '0px 0px 24px',
                color: colors.text,
                fontWeight: 700,
                fontSize: '28px',
                textAlign: 'center'
            }}>
                Ürün & Stok Yönetimi
            </h2>

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
                            background: selectedCategory === category ? colors.primary : colors.accentBackground,
                            color: colors.text,
                            border: `1px solid ${selectedCategory === category ? colors.primary : colors.border}`,
                            borderRadius: '12px',
                            padding: '12px 20px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            fontSize: '14px',
                            minWidth: '120px',
                            textAlign: 'center'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = selectedCategory === category ? colors.primary : colors.hover;
                            e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = selectedCategory === category ? colors.primary : colors.accentBackground;
                            e.target.style.transform = 'translateY(0)';
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
                gap: '16px',
                marginTop: '16px',
                minHeight: '600px'
            }}>
                {filteredProducts.map((product) => (
                    <div
                        key={product.id || crypto.randomUUID()}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: colors.surfaceBackground,
                            borderRadius: '12px',
                            boxShadow: `0 4px 16px ${colors.shadow}`,
                            padding: '20px 24px',
                            gap: '24px',
                            border: `1px solid ${colors.border}`,
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = `0 8px 24px ${colors.shadow}`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = `0 4px 16px ${colors.shadow}`;
                        }}
                    >
                        {/* Ürün Adı */}
                        <div style={{
                            flex: '2 1 0%',
                            fontWeight: 600,
                            color: colors.text,
                            fontSize: '16px'
                        }}>
                            {product.name}
                        </div>
                        
                        {/* Açıklama */}
                        <div style={{
                            flex: '2 1 0%',
                            fontWeight: 500,
                            color: colors.textSecondary,
                            fontSize: '14px',
                            fontStyle: 'italic'
                        }}>
                            {product.description}
                        </div>
                        
                        {/* Fiyat */}
                        <div style={{
                            flex: '1 1 0%',
                            fontWeight: 600,
                            color: colors.primary,
                            fontSize: '16px',
                            textAlign: 'center'
                        }}>
                            {product.price} ₺
                        </div>
                        
                        {/* Stok */}
                        <div style={{
                            flex: '1 1 0%',
                            fontWeight: 500,
                            color: colors.textSecondary,
                            fontSize: '14px',
                            textAlign: 'center'
                        }}>
                            {product.stock} adet
                        </div>
                        
                        {/* Min Stok */}
                        <div style={{
                            flex: '1 1 0%',
                            fontWeight: 500,
                            color: colors.textSecondary,
                            fontSize: '14px',
                            textAlign: 'center'
                        }}>
                            Min: {product.minStock}
                        </div>
                        
                        {/* Durum */}
                        <div style={{
                            flex: '1.5 1 0%',
                            textAlign: 'center',
                            fontWeight: 600,
                            color: colors.text,
                            background: colors.success,
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontSize: '14px',
                            minWidth: '100px'
                        }}>
                            {product.status}
                        </div>
                        
                        {/* Düzenle Butonu */}
                        <button
                            onClick={() => handleEditProduct(product.id)}
                            style={{
                                background: colors.warning,
                                color: colors.text,
                                border: 'none',
                                borderRadius: '8px',
                                padding: '10px 20px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                fontSize: '14px',
                                minWidth: '100px'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = '#f59e0b';
                                e.target.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = colors.warning;
                                e.target.style.transform = 'scale(1)';
                            }}
                        >
                            Düzenle
                        </button>
                        
                        {/* Sil Butonu */}
                        <button
                            onClick={() => handleDeleteProduct(product.id)}
                            style={{
                                background: colors.danger,
                                color: colors.text,
                                border: 'none',
                                borderRadius: '8px',
                                padding: '10px 20px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                fontSize: '14px',
                                minWidth: '80px'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = '#dc2626';
                                e.target.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = colors.danger;
                                e.target.style.transform = 'scale(1)';
                            }}
                        >
                            Sil
                        </button>
                    </div>
                ))}
            </div>

            {/* Yeni Ürün Ekleme Butonu */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                marginTop: '32px'
            }}>
                <button
                    onClick={handleAddProduct}
                    style={{
                        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accentBackground} 100%)`,
                        color: colors.text,
                        border: 'none',
                        borderRadius: '16px',
                        padding: '18px 36px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '16px',
                        boxShadow: `0 8px 24px ${colors.shadow}`,
                        transition: 'all 0.3s ease',
                        minWidth: '200px'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-4px)';
                        e.target.style.boxShadow = `0 12px 32px ${colors.shadow}`;
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = `0 8px 24px ${colors.shadow}`;
                    }}
                >
                    + Yeni Ürün Ekle
                </button>
            </div>
        </div>
    );
};

export default ProductsPage;
