import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

// Örnek ürün verileri - görüntüdeki gibi
const sampleProducts = [
    { id: 1, name: 'Et Döner', category: 'Ana Yemek', price: 535, stock: 50, minStock: 10, status: 'Yeterli' },
    { id: 2, name: 'Döner Beyti Sarma', category: 'Ana Yemek', price: 545, stock: 30, minStock: 5, status: 'Yeterli' },
    { id: 3, name: 'Tereyağlı İskender', category: 'Ana Yemek', price: 560, stock: 25, minStock: 8, status: 'Yeterli' },
    { id: 4, name: 'Pilav Üstü Döner', category: 'Ana Yemek', price: 550, stock: 40, minStock: 12, status: 'Yeterli' },
    { id: 5, name: 'SSK Dürüm Döner', category: 'Ana Yemek', price: 560, stock: 35, minStock: 7, status: 'Yeterli' },
    { id: 6, name: 'Çiğköfte', category: 'Aparatifler', price: 140, stock: 20, minStock: 5, status: 'Yeterli' },
    { id: 7, name: 'Soğan Halkası', category: 'Aparatifler', price: 130, stock: 15, minStock: 3, status: 'Yeterli' },
    { id: 8, name: 'Patates Kızartması', category: 'Aparatifler', price: 140, stock: 30, minStock: 8, status: 'Yeterli' },
    { id: 9, name: 'Börek Çeşitleri', category: 'Fırın', price: 140, stock: 25, minStock: 6, status: 'Yeterli' },
    { id: 10, name: 'Salata Çeşitleri', category: 'Aparatifler', price: 120, stock: 18, minStock: 4, status: 'Yeterli' },
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
            maxWidth: '1000px',
            margin: '32px auto',
            background: '#473653',
            borderRadius: '16px',
            boxShadow: 'rgba(0, 0, 0, 0.3) 0px 2px 12px',
            padding: '32px'
        }}>
            <h2 style={{
                margin: '0px 0px 16px',
                color: '#ffffff',
                fontWeight: 700
            }}>
                Ürün & Stok Yönetimi
            </h2>

            {/* Kategori Filtreleri */}
            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '24px',
                flexWrap: 'wrap'
            }}>
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        style={{
                            background: selectedCategory === category ? '#10B981' : '#53364D',
                            color: selectedCategory === category ? '#ffffff' : '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 18px',
                            fontWeight: 700,
                            cursor: 'pointer'
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
                gap: '14px',
                marginTop: '8px',
                minHeight: '550px'
            }}>
                {filteredProducts.map((product) => (
                    <div
                        key={product.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: '#513653',
                            borderRadius: '10px',
                            boxShadow: 'rgba(0, 0, 0, 0.3) 0px 1px 6px',
                            padding: '12px 20px',
                            gap: '20px'
                        }}
                    >
                        <div style={{
                            flex: '3 1 0%',
                            fontWeight: 600,
                            color: '#ffffff'
                        }}>
                            {product.name}
                        </div>
                        
                        <div style={{
                            flex: '1 1 0%',
                            fontWeight: 500,
                            color: '#ffffff'
                        }}>
                            {product.price} ₺
                        </div>
                        
                        <div style={{
                            flex: '1 1 0%',
                            fontWeight: 500,
                            color: '#ffffff'
                        }}>
                            {product.stock} adet
                        </div>
                        
                        <div style={{
                            flex: '1 1 0%',
                            fontWeight: 500,
                            color: '#ffffff'
                        }}>
                            Min: {product.minStock}
                        </div>
                        
                        <div style={{
                            flex: '1.5 1 0%',
                            textAlign: 'center',
                            fontWeight: 600,
                            color: '#ffffff',
                            background: '#10B981',
                            padding: '4px 12px',
                            borderRadius: '12px'
                        }}>
                            {product.status}
                        </div>
                        
                        <button
                            onClick={() => handleEditProduct(product.id)}
                            style={{
                                background: '#A294F9',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '7px 18px',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Düzenle
                        </button>
                        
                        <button
                            onClick={() => handleDeleteProduct(product.id)}
                            style={{
                                background: '#EF4444',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '7px 18px',
                                fontWeight: 600,
                                cursor: 'pointer'
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
                marginTop: '24px'
            }}>
                <button
                    onClick={handleAddProduct}
                    style={{
                        background: 'linear-gradient(90deg, #A294F9 0%, #CDC1FF 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '16px 32px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '16px',
                        boxShadow: '0 4px 12px rgba(162, 148, 249, 0.3)',
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
