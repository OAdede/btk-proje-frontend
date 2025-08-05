import React, { useState, useContext, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TableContext } from "../../context/TableContext.jsx";


export default function OrderPage() {
    const { tableId } = useParams();
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState("yemekler");
    const [cart, setCart] = useState({});
    const { orders, products, cancelOrder, updateLastOrder } = useContext(TableContext);

    useEffect(() => {
        // Sayfa yüklendiğinde mevcut siparişi (varsa) sepete aktar
        const existingOrder = orders[tableId] || {};
        setCart(existingOrder);
    }, [tableId, orders]);

    const handleQuantityChange = (product, delta) => {
        setCart(prevCart => {
            const currentItem = prevCart[product.id] || { ...product, count: 0 };
            let newCount = currentItem.count + delta;

            // Miktarın sıfırın altına düşmesini engelle
            if (newCount < 0) newCount = 0;

            // Stok kontrolü
            if (newCount > product.stock) {
                alert("Stok yetersiz!");
                newCount = product.stock;
            }

            const newCart = { ...prevCart, [product.id]: { ...product, count: newCount } };

            // Eğer ürün miktarı 0'a düşerse sepetten kaldır
            if (newCart[product.id].count === 0) {
                delete newCart[product.id];
            }

            return newCart;
        });
    };

    const handleNext = () => {
        // Onaylanmış siparişleri ve yeni eklenenleri ayırt et
        const existingOrder = orders[tableId] || {};
        const newItems = {};

        Object.keys(cart).forEach(id => {
            if (!existingOrder[id] || cart[id].count !== existingOrder[id].count) {
                // Yeni eklenen veya miktarı değişen ürünler
                const change = cart[id].count - (existingOrder[id]?.count || 0);
                if (change > 0) {
                    newItems[id] = { ...cart[id], count: change };
                }
            }
        });

        // Sadece yeni eklenenleri `lastOrders`'a kaydet
        updateLastOrder(tableId, newItems);
        navigate(`/staff/summary/${tableId}`);
    };

    const handleBack = () => {
        navigate("/garson/home");
    };

    const calculateTotal = (items) => {
        return Object.values(items).reduce((sum, item) => sum + item.price * item.count, 0);
    };

    const cartTotal = calculateTotal(cart);

    return (
        <div style={styles.container}>
            {/* Sol Panel: Ürünler */}
            <div style={styles.leftPanel}>
                <h2 style={styles.title}>Masa {tableId} - Sipariş Ekranı</h2>

                {/* Kategori Butonları */}
                <div style={styles.categoryContainer}>
                    {["yemekler", "icecekler", "tatlilar"].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            style={activeCategory === cat ? styles.activeCategoryButton : styles.categoryButton}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Ürün Listesi */}
                <div style={styles.productList}>
                    {products[activeCategory]?.map((product) => (
                        <div key={product.id} style={styles.productCard}>
                            <h3>{product.name}</h3>
                            <p>{product.price.toFixed(2)}₺ | Stok: {product.stock}</p>
                            <div style={styles.quantityControl}>
                                <button onClick={() => handleQuantityChange(product, -1)} style={styles.quantityButton}>-</button>
                                <span>{cart[product.id]?.count || 0}</span>
                                <button onClick={() => handleQuantityChange(product, 1)} style={styles.quantityButton}>+</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sağ Panel: Sepet Özeti */}
            <div style={styles.rightPanel}>
                <h3 style={styles.summaryTitle}>Sipariş Özeti</h3>
                <div style={styles.cartItems}>
                    {Object.keys(cart).length > 0 ? (
                        Object.values(cart).map(item => (
                            <div key={item.id} style={styles.cartItem}>
                                <span>{item.name} x {item.count}</span>
                                <span>{(item.price * item.count).toFixed(2)}₺</span>
                            </div>
                        ))
                    ) : (
                        <p>Sepetiniz boş.</p>
                    )}
                </div>
                <div style={styles.summaryTotal}>
                    <strong>Toplam: {cartTotal.toFixed(2)}₺</strong>
                </div>
                <div style={styles.actions}>
                    <button onClick={handleBack} style={{ ...styles.button, ...styles.backButton }}>
                        Geri
                    </button>
                    <button onClick={handleNext} style={{ ...styles.button, ...styles.nextButton }}>
                        Özeti Gör ve Onayla
                    </button>
                </div>
            </div>
        </div>
    );
}

// Stil Tanımları
const styles = {
    container: {
        display: 'flex',
        padding: '2rem',
        gap: '2rem',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    leftPanel: {
        flex: 3,
    },
    rightPanel: {
        flex: 2,
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '1.5rem',
        backgroundColor: '#f9f9f9',
        display: 'flex',
        flexDirection: 'column'
    },
    title: {
        marginBottom: '1.5rem',
    },
    categoryContainer: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem'
    },
    categoryButton: {
        padding: '0.8rem 1.5rem',
        border: '1px solid #ddd',
        borderRadius: '20px',
        backgroundColor: 'white',
        cursor: 'pointer',
        fontSize: '1rem'
    },
    activeCategoryButton: {
        padding: '0.8rem 1.5rem',
        border: '1px solid #007bff',
        borderRadius: '20px',
        backgroundColor: '#007bff',
        color: 'white',
        cursor: 'pointer',
        fontSize: '1rem'
    },
    productList: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '1.5rem'
    },
    productCard: {
        border: '1px solid #eee',
        borderRadius: '8px',
        padding: '1rem',
        textAlign: 'center',
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    },
    quantityControl: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        marginTop: '0.5rem'
    },
    quantityButton: {
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        border: '1px solid #ddd',
        backgroundColor: '#f0f0f0',
        cursor: 'pointer',
        fontSize: '1.2rem',
        lineHeight: '1'
    },
    summaryTitle: {
        marginBottom: '1rem',
        borderBottom: '1px solid #eee',
        paddingBottom: '0.5rem'
    },
    cartItems: {
        flexGrow: 1,
        overflowY: 'auto'
    },
    cartItem: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0.5rem 0'
    },
    summaryTotal: {
        marginTop: '1rem',
        paddingTop: '1rem',
        borderTop: '1px solid #eee',
        textAlign: 'right',
        fontSize: '1.2rem'
    },
    actions: {
        marginTop: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        gap: '1rem'
    },
    button: {
        padding: '0.8rem 1.5rem',
        borderRadius: '8px',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        fontSize: '1rem'
    },
    backButton: {
        backgroundColor: '#6c757d',
    },
    nextButton: {
        backgroundColor: '#28a745',
    }
};