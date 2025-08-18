import React, { createContext, useState, useEffect, useCallback, useRef } from "react";
import { getRoleInfoFromToken } from "../utils/jwt.js";

export const TableContext = createContext();

const API_BASE_URL = (import.meta?.env?.VITE_API_BASE_URL) || "/api";

const readFromLocalStorage = (key, initialValue) => {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
    } catch (error) {
        console.error(`Error reading from localStorage for key "${key}"`, error);
        return initialValue;
    }
};

const saveToLocalStorage = (key, value) => {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving to localStorage for key "${key}"`, error);
    }
};

export function TableProvider({ children }) {
    const [products, setProducts] = useState({});
    const [productsById, setProductsById] = useState({});
    const [ingredients, setIngredients] = useState({});
    const [tables, setTables] = useState([]);
    const [tableStatus, setTableStatus] = useState(() => readFromLocalStorage('tableStatus', {}));
    const [orders, setOrders] = useState(() => readFromLocalStorage('orders', {}));
    const [completedOrders, setCompletedOrders] = useState(() => readFromLocalStorage('completedOrders', {}));

    const [reservations, setReservations] = useState(() => readFromLocalStorage('reservations', {}));
    const [salons, setSalons] = useState([]);
    const [tableStatuses, setTableStatuses] = useState([]);
    const [activeTableIds, setActiveTableIds] = useState([]);
    const [timestamps, setTimestamps] = useState({});
    const [orderHistory, setOrderHistory] = useState(() => readFromLocalStorage('orderHistory', []));

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const apiCall = useCallback(async (endpoint, options = {}) => {
        try {
            console.log(`API çağrısı yapılıyor: ${endpoint}`);
            const token = localStorage.getItem('token');
            const mergedOptions = { ...options };
            const defaultHeaders = {
                'Accept': 'application/json'
            };
            if (token) defaultHeaders['Authorization'] = `Bearer ${token}`;
            mergedOptions.headers = { ...defaultHeaders, ...(options.headers || {}) };
            const response = await fetch(`${API_BASE_URL}${endpoint}`, mergedOptions);

            if (!response.ok) {
                // 401 ise (ör. stocks için admin olmayan roller) gürültüyü azalt
                if (response.status === 401) {
                    console.warn(`API çağrısı yetkisiz: ${endpoint} (401)`);
                    throw new Error('Unauthorized');
                }
                const errorData = await response.text().catch(() => '')
                    .then(t => { try { return JSON.parse(t); } catch { return { message: t || 'Sunucu hatası' }; } });
                console.error(`API çağrısı hatası: ${endpoint}`, errorData);
                throw new Error(errorData.message || "Beklenmedik bir hata oluştu.");
            }

            if (response.status === 204) {
                console.log(`API çağrısı başarılı (boş yanıt): ${endpoint}`);
                return null;
            }

            const data = await response.json();

            console.log(`API çağrısı başarılı: ${endpoint}`, data);
            return data;

        } catch (err) {
            // Stocks endpoint'i için 401 hatasını sessizce geç
            if (endpoint === '/stocks' && err.message === 'Unauthorized') {
                throw err; // Hatayı yukarı fırlat ama loglama
            } else {
                console.error(`API çağrısı başarısız: ${endpoint}`, err);
            }
            throw err;
        }
    }, []);

    // Stock calculation function to determine how many units of a product can be made from available ingredients
    const calculateProductStock = (product, ingredients) => {
        if (!product.recipe || product.recipe.length === 0) {
            return 0; // No recipe means no stock
        }

        let maxPossibleUnits = Infinity;

        for (const recipeItem of product.recipe) {
            const ingredient = ingredients[recipeItem.ingredientId];
            if (!ingredient) {
                console.warn(`Missing ingredient data for product ${product.name} (ID: ${product.id}), ingredient ID: ${recipeItem.ingredientId}`);
                return 0; // Missing ingredient data
            }

            if (typeof ingredient.stockQuantity !== 'number' || isNaN(ingredient.stockQuantity)) {
                console.warn(`Invalid stock quantity for ingredient ${ingredient.name} (ID: ${ingredient.id}): ${ingredient.stockQuantity}`);
                return 0; // Invalid stock quantity
            }

            if (typeof recipeItem.quantity !== 'number' || isNaN(recipeItem.quantity) || recipeItem.quantity <= 0) {
                console.warn(`Invalid recipe quantity for product ${product.name} (ID: ${product.id}), ingredient ${ingredient.name}: ${recipeItem.quantity}`);
                return 0; // Invalid recipe quantity
            }

            // Calculate how many units can be made with this ingredient
            const unitsPossible = Math.floor(ingredient.stockQuantity / recipeItem.quantity);
            maxPossibleUnits = Math.min(maxPossibleUnits, unitsPossible);
        }

        const finalStock = maxPossibleUnits === Infinity ? 0 : maxPossibleUnits;
        if (finalStock === 0 && product.recipe.length > 0) {
            console.log(`Product ${product.name} (ID: ${product.id}) has 0 stock due to insufficient ingredients`);
        }

        return finalStock;
    };

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        console.log("Veriler sunucudan alınıyor...");

        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const roleInfo = token ? getRoleInfoFromToken(token) : {};
            const isAdmin = (roleInfo.roleId === 0) || (String(roleInfo.role || '').toLowerCase() === 'admin');

            // API çağrıları - stocks için tüm rollerde dene, 401 alırsan boş döndür
            const safeStocksCall = async () => {
                try {
                    return await apiCall('/stocks');
                } catch (error) {
                    console.warn("Stocks API hatası yakalandı:", error.message || error);
                    // 401 Unauthorized kontrolü - birden fazla format kontrol et
                    const errorMsg = String(error.message || '').toLowerCase();
                    if (errorMsg.includes('unauthorized') || 
                        errorMsg.includes('401') || 
                        errorMsg.includes('403') || 
                        errorMsg.includes('forbidden')) {
                        console.log("Stocks API yetkisiz erişim - boş array döndürülüyor");
                        return [];
                    }
                    throw error; // Diğer hataları yukarı fırlat
                }
            };

            // Orders API çağrısı için güvenli wrapper
            const safeOrdersCall = async () => {
                try {
                    return await apiCall('/orders');
                } catch (error) {
                    console.warn("Orders endpoint hatası:", error.message || error);
                    if (error.message && (
                        error.message.includes('500') ||
                        error.message.includes('Internal Server Error') ||
                        error.message.includes('isCompleted')
                    )) {
                        console.log("Orders endpoint'inde backend hatası, boş array döndürülüyor");
                        return [];
                    }
                    throw error; // Diğer hataları yukarı fırlat
                }
            };

            console.log("API çağrıları başlatılıyor, kullanıcı rolü:", roleInfo);
            
            const tasks = [
                apiCall('/products'),                // 0
                safeStocksCall(),                   // 1 - tüm roller için dene
                apiCall('/product-ingredients'),     // 2
                apiCall('/dining-tables'),           // 3
                safeOrdersCall(),                   // 4 - güvenli orders çağrısı
                apiCall('/salons'),                  // 5
                apiCall('/orders/active-table-ids'), // 6 - aktif table ID'leri
            ];

            const results = await Promise.allSettled(tasks);
            console.log("API çağrıları tamamlandı, sonuçlar:", results.map((r, i) => ({ index: i, status: r.status, error: r.reason?.message })));

            const safe = (idx, fallback) => {
                if (results[idx]?.status === 'fulfilled') {
                    return results[idx].value;
                } else if (results[idx]?.status === 'rejected') {
                    const error = results[idx].reason;
                    console.warn(`API çağrısı başarısız (index ${idx}):`, error.message || error);
                    return fallback;
                }
                return fallback;
            };
            
            const productsData = safe(0, []);
            const stocksData = safe(1, []);
            const productIngredientsData = safe(2, []);
            const diningTablesData = safe(3, []);
            const ordersData = safe(4, []);
            const salonsData = safe(5, []);
            const activeTableIdsData = safe(6, []);

            if (!productsData || productsData.length === 0) {
                console.warn("API'den ürün verisi gelmedi veya liste boş.");
            }

            setTables(diningTablesData || []);
            setSalons(salonsData || []);
            setActiveTableIds(activeTableIdsData || []);

            const newTableStatus = (diningTablesData || []).reduce((acc, table) => {
                acc[table.tableNumber] = table.statusName.toLowerCase();
                return acc;
            }, {});
            setTableStatus(newTableStatus);

            const newIngredients = (stocksData || []).reduce((acc, item) => {
                if (item && item.id) {
                    acc[item.id] = {
                        id: item.id,
                        name: item.name || 'Bilinmeyen Malzeme',
                        unit: item.unit || '',
                        stockQuantity: item.stockQuantity || 0,
                        minStock: item.minQuantity || item.minStock || 0  // Backend'de minQuantity olarak geliyor
                    };
                }
                return acc;
            }, {});
            console.log("Stocks'tan ingredient verisi:", newIngredients);
            console.log("Kullanıcı rolü:", roleInfo);
            console.log("Admin kontrolü:", isAdmin);

            const newProductsByCategory = {};
            const productsByIdTemp = {};

            (productsData || []).forEach(item => {
                const categoryName = item.category || 'Diğer';
                if (!newProductsByCategory[categoryName]) {
                    newProductsByCategory[categoryName] = [];
                }
                const productWithRecipe = {
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    category: categoryName,
                    description: item.description,
                    isActive: item.isActive !== false,
                    recipe: []
                };
                newProductsByCategory[categoryName].push(productWithRecipe);
                productsByIdTemp[item.id] = productWithRecipe;
            });

            // Eğer stocks API'den ingredient verileri gelmemişse, product-ingredients'dan doldur
            const ingredientsFromProductIngredients = {};
            
            (productIngredientsData || []).forEach(item => {
                const productId = item.product?.id;
                
                // Ingredient bilgilerini topla (stocks API'den gelmemişse)
                if (item.ingredient && item.ingredient.id) {
                    const ingredientId = item.ingredient.id;
                    if (!newIngredients[ingredientId]) {
                        ingredientsFromProductIngredients[ingredientId] = {
                            id: ingredientId,
                            name: item.ingredient.name || 'Bilinmeyen Malzeme',
                            unit: item.ingredient.unit || '',
                            stockQuantity: item.ingredient.stockQuantity || 0,
                            minStock: item.ingredient.minQuantity || item.ingredient.minStock || 0  // Backend'de minQuantity
                        };
                    }
                }
                
                if (productsByIdTemp[productId]) {
                    // Ensure quantityPerUnit is a valid number
                    const quantity = Number(item.quantityPerUnit);
                    if (isNaN(quantity) || quantity <= 0) {
                        console.warn(`Invalid recipe quantity for product ${productsByIdTemp[productId].name} (ID: ${productId}), ingredient ${item.ingredient.name}: ${item.quantityPerUnit}, setting to 1`);
                    }

                    productsByIdTemp[productId].recipe.push({
                        ingredientId: item.ingredient.id,
                        quantity: isNaN(quantity) || quantity <= 0 ? 1 : quantity,
                        name: item.ingredient.name
                    });
                } else {
                    console.warn(`Tarif için ürün bulunamadı. Muhtemelen API'den gelmeyen bir ürünün tarifi var. Ürün ID: ${productId}`);
                }
            });

            // Ingredients state'ini güncelle - stocks ve product-ingredients verilerini birleştir
            const finalIngredients = { ...newIngredients, ...ingredientsFromProductIngredients };
            console.log("Product-ingredients'dan ek ingredient verileri:", ingredientsFromProductIngredients);
            console.log("Final ingredients:", finalIngredients);
            setIngredients(finalIngredients);

            // Reçete verilerini products array'ine de kopyala ve stok hesapla
            Object.keys(newProductsByCategory).forEach(categoryName => {
                newProductsByCategory[categoryName].forEach(product => {
                    if (productsByIdTemp[product.id] && productsByIdTemp[product.id].recipe) {
                        product.recipe = productsByIdTemp[product.id].recipe;
                    }
                    // Her ürün için stok hesapla
                    product.stock = calculateProductStock(product, finalIngredients);
                });
            });

            // ProductsById objesine de stok bilgisini ekle
            Object.keys(productsByIdTemp).forEach(productId => {
                const product = productsByIdTemp[productId];
                product.stock = calculateProductStock(product, finalIngredients);
            });

            console.log("İşlenen ürün verileri (kategoriye göre):", newProductsByCategory);
            console.log("İşlenen ürün verileri (ID'ye göre):", productsByIdTemp);

            setProducts(newProductsByCategory);
            setProductsById(productsByIdTemp);

            // Siparişleri backend masa ID'si ile indeksle (çakışmayı önler)
            try {
                const ordersByTable = (ordersData || []).reduce((acc, order) => {
                    if (!order || !order.tableId) return acc; // Geçersiz order'ları atla
                    
                    const keyBackendId = String(order.tableId);
                    acc[keyBackendId] = {
                        id: order.orderId ?? order.id,
                        ...order,
                        items: (order.items || []).reduce((itemAcc, item) => {
                            if (!item || !item.productId) return itemAcc; // Geçersiz item'ları atla
                            
                            itemAcc[item.productId] = {
                                id: item.productId,
                                name: item.productName || 'Bilinmeyen Ürün',
                                price: item.unitPrice || 0,
                                count: item.quantity || 0,
                                note: item.note || ''
                            };
                            return itemAcc;
                        }, {})
                    };
                    return acc;
                }, {});
                setOrders(ordersByTable);

                const completedOrdersData = (ordersData || []).filter(order => 
                    order && order.status === "paid"
                );
                setCompletedOrders(completedOrdersData || {});

                const reservationsById = (ordersData || [])
                    .filter(order => order && order.status === "reserved")
                    .reduce((acc, res) => {
                        if (res && res.id) {
                            acc[res.id] = res;
                        }
                        return acc;
                    }, {});
                setReservations(reservationsById);
            } catch (orderProcessingError) {
                console.error("Sipariş verileri işlenirken hata:", orderProcessingError);
                // Fallback: boş verilerle devam et
                setOrders({});
                setCompletedOrders({});
                setReservations({});
            }

            console.log("Veriler başarıyla alındı ve işlendi.");

        } catch (err) {
            console.error("Veriler alınırken hata:", err);
            setError("Veriler sunucudan alınırken bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    }, [apiCall]);

    // Yalnızca salonlar ve masalar için hafif yükleyici (grid'ler için kritik)
    const loadTablesAndSalons = useCallback(async () => {
        try {
            const [salonsData, diningTablesData] = await Promise.all([
                apiCall('/salons'),
                apiCall('/dining-tables')
            ]);
            setSalons(salonsData || []);
            setTables(diningTablesData || []);
            const newTableStatus = (diningTablesData || []).reduce((acc, table) => {
                const statusName = (table?.status?.name || table?.statusName || '').toLowerCase();
                acc[table.tableNumber] = statusName || 'empty';
                return acc;
            }, {});
            setTableStatus(newTableStatus);
        } catch (err) {
            console.error('loadTablesAndSalons hata:', err);
        }
    }, [apiCall]);


    const initializedRef = useRef(false);
    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
            // Login sayfasında gereksiz çağrıları atla
            setIsLoading(false);
            return;
        }
        // Önce kritik verileri hızlıca çek
        loadTablesAndSalons();
        // Ardından kapsamlı verileri arka planda çek
        fetchData();
    }, [loadTablesAndSalons, fetchData]);

    useEffect(() => {
        saveToLocalStorage('tableStatus', tableStatus);
        saveToLocalStorage('orders', orders);
        saveToLocalStorage('completedOrders', completedOrders);
        saveToLocalStorage('reservations', reservations);
        saveToLocalStorage('orderHistory', orderHistory);
    }, [tableStatus, orders, completedOrders, reservations, orderHistory]);

    const findProductById = (productId) => {
        const parsedProductId = typeof productId === 'string' ? parseInt(productId, 10) : productId;
        return productsById[parsedProductId] || null;
    };

    const findProductRecipe = (productId) => {
        const product = findProductById(productId);
        return product?.recipe || [];
    };

    const checkIngredientStock = (orderItems, isIncrease = false) => {
        const tempIngredients = { ...ingredients };
        for (const [id, item] of Object.entries(orderItems)) {
            const recipe = findProductRecipe(id);
            if (!recipe.length) continue;
            for (const ingredient of recipe) {
                const required = ingredient.quantity * item.count;
                // Stok verisi erişilemiyorsa (ör. admin olmayan roller) stok kontrolünü atla
                if (!tempIngredients[ingredient.ingredientId]) continue;
                if (tempIngredients[ingredient.ingredientId].stockQuantity < required) return false;
                tempIngredients[ingredient.ingredientId].stockQuantity -= required;
            }
        }
        return true;
    };

    const updateTableStatus = async (tableId, status) => {
        try {
            const mapStatus = (s) => {
                if (!s) return 'AVAILABLE';
                const v = String(s).toLowerCase();
                if (v === 'empty' || v === 'bos' || v === 'available') return 'AVAILABLE';
                if (v === 'occupied' || v === 'dolu') return 'OCCUPIED';
                if (v === 'reserved' || v === 'rezerve') return 'RESERVED';
                return String(s).toUpperCase();
            };
            const backendStatus = mapStatus(status);
            // UI'de tableId masa numarası olabilir; backend gerçek ID ister
            const findBackendTableId = () => {
                const numeric = Number(tableId);
                // Önce id eşleşmesi
                const byId = (tables || []).find(t => Number(t?.id) === numeric);
                if (byId?.id != null) return byId.id;
                // Sonra tableNumber eşleşmesi
                const byNumber = (tables || []).find(t => String(t?.tableNumber ?? t?.number) === String(tableId));
                if (byNumber?.id != null) return byNumber.id;
                return tableId; // son çare: verilen değeri kullan
            };
            const backendTableId = findBackendTableId();

            await apiCall(`/dining-tables/${backendTableId}/status/${backendStatus}`, {
                method: 'PATCH'
            });
            await fetchData();
        } catch (error) {
            console.error('Error updating table status:', error);
            setError('Masa durumu güncellenirken bir hata oluştu.');
        }
    };

    // Masa güncelleme fonksiyonu (PATCH uçlarına bölünmüş)
    const updateTable = async (tableId, updateData) => {
        try {
            const table = tables.find(t => t.id === tableId);
            if (!table) {
                console.warn(`Table with id ${tableId} not found`);
                throw new Error('Masa bulunamadı');
            }

            console.log('Updating table with ID (PATCH mode):', tableId, 'Update data:', updateData, 'Current table:', table);

            // Yardımcı: isim/numaradan sayısal masa numarası çıkar
            const extractTableNumber = (value, fallback) => {
                if (value == null) return fallback;
                if (typeof value === 'number') return value;
                const text = String(value);
                const match = text.match(/\d+/);
                if (match) {
                    const n = parseInt(match[0], 10);
                    return Number.isNaN(n) ? fallback : n;
                }
                const n = Number(text);
                return Number.isNaN(n) ? fallback : n;
            };

            const currentNumber = Number(table.tableNumber ?? table.number ?? 0);
            const nextNumber = (updateData.tableNumber != null)
                ? extractTableNumber(updateData.tableNumber, currentNumber)
                : extractTableNumber(updateData.name, currentNumber);
            const willChangeNumber = Number(nextNumber) !== Number(currentNumber);

            const currentCapacity = Number(table.capacity ?? 0);
            const nextCapacity = (updateData.capacity != null) ? Number(updateData.capacity) : currentCapacity;
            const willChangeCapacity = Number(nextCapacity) !== Number(currentCapacity);

            // Değişiklik yoksa erken çık
            if (!willChangeNumber && !willChangeCapacity) {
                console.log('No changes detected for table', tableId);
                return;
            }

            // Sırasıyla patch et (bağımsızlar)
            if (willChangeNumber) {
                console.log('PATCH table-number ->', nextNumber);
                await apiCall(`/dining-tables/${tableId}/table-number/${nextNumber}`, {
                    method: 'PATCH'
                });
            }

            if (willChangeCapacity) {
                console.log('PATCH capacity ->', nextCapacity);
                await apiCall(`/dining-tables/${tableId}/capacity/${nextCapacity}`, {
                    method: 'PATCH'
                });
            }

            // Güncel verileri yükle
            await loadTablesAndSalons();
            console.log(`Table ${tableId} updated successfully via PATCH.`);
        } catch (error) {
            console.error(`Error updating table ${tableId} (PATCH):`, error);
            throw error;
        }
    };

    // Masa silme fonksiyonu
    const deleteTable = async (tableId) => {
        try {
            const table = tables.find(t => t.id === tableId);
            if (!table) {
                console.warn(`Table with id ${tableId} not found`);
                throw new Error('Masa bulunamadı');
            }

            const statusLower = String(table?.status?.name || table?.statusName || '').toLowerCase();

            // Masada aktif sipariş var mı kontrol et
            const backendTableKey = String(table.id);
            const activeOrder = orders[backendTableKey];
            if (activeOrder && Object.keys(activeOrder).length > 0) {
                if (statusLower === 'available') {
                    // Masa boşaltılmış ama sipariş kaydı kalmış olabilir; otomatik iptal etmeyi dene
                    try {
                        if (activeOrder.id) {
                            await apiCall(`/orders/${activeOrder.id}`, { method: 'DELETE' });
                        }
                        // Yerel durumu temizle
                        setOrders(prev => { const next = { ...prev }; delete next[backendTableKey]; return next; });
                    } catch (e) {
                        console.warn('Boş masadaki artakalan sipariş silinemedi, silme işlemine devam ediliyor:', e);
                    }
                } else {
                    throw new Error('Bu masada aktif sipariş bulunuyor. Önce siparişi tamamlayın.');
                }
            }

            // Masada rezervasyon var mı kontrol et
            const hasReservation = Object.values(reservations).some(res => String(res.tableId) === String(table.id));
            if (hasReservation) {
                throw new Error('Bu masada rezervasyon bulunuyor. Önce rezervasyonu iptal edin.');
            }

            await apiCall(`/dining-tables/${tableId}`, { method: 'DELETE' });

            // Backend'den güncel veriyi al
            await loadTablesAndSalons();

            console.log(`Table ${tableId} deleted successfully`);
        } catch (error) {
            console.error(`Error deleting table ${tableId}:`, error);
            throw error;
        }
    };

    // Zorla masa sil (rezervasyon ve siparişleri otomatik temizler)
    const deleteTableForce = async (tableId) => {
        try {
            const table = tables.find(t => t.id === tableId);
            if (!table) {
                console.warn(`Table with id ${tableId} not found`);
                throw new Error('Masa bulunamadı');
            }

            const backendTableKey = String(table.id);

            // 1) Rezervasyonları topla ve sil
            try {
                const reservationsOfTable = await apiCall(`/reservations/table/${table.id}`, { method: 'GET' });
                if (Array.isArray(reservationsOfTable)) {
                    for (const res of reservationsOfTable) {
                        try {
                            await apiCall(`/reservations/${res.id}`, { method: 'DELETE' });
                        } catch (e) {
                            console.warn('Rezervasyon silinemedi (force):', res.id, e);
                        }
                    }
                }
                // Yerel rezervasyon deposunu da temizlemeyi dene (fallback)
                const localReservations = Object.values(reservations || {}).filter(r => {
                    return String(r.tableId) === String(table.id) || String(r.tableId) === String(table.tableNumber);
                });
                for (const r of localReservations) {
                    try {
                        const rid = r.backendId || r.id;
                        if (rid != null) {
                            await apiCall(`/reservations/${rid}`, { method: 'DELETE' });
                        }
                    } catch (e) {
                        console.warn('Yerel rezervasyon silinemedi (force):', r, e);
                    }
                }
            } catch (e) {
                console.warn('Rezervasyonlar getirilemedi (force):', e);
            }

            // 2) Aktif sipariş varsa sil
            try {
                const activeOrder = orders[backendTableKey];
                if (activeOrder && activeOrder.id) {
                    await apiCall(`/orders/${activeOrder.id}`, { method: 'DELETE' });
                    setOrders(prev => { const next = { ...prev }; delete next[backendTableKey]; return next; });
                }
            } catch (e) {
                console.warn('Aktif sipariş silinemedi (force), devam ediliyor:', e);
            }

            // 3) Masayı boş olarak işaretle (backend) ve yereli güncelle
            try {
                await apiCall(`/dining-tables/${table.id}/status/AVAILABLE`, { method: 'PATCH' });
                setTableStatus(prev => ({ ...prev, [table.tableNumber]: 'empty' }));
            } catch (e) {
                console.warn('Masa durumu AVAILABLE yapılırken hata (force):', e);
            }

            // 4) Masayı sil
            await apiCall(`/dining-tables/${tableId}`, { method: 'DELETE' });

            // 5) Güncel verileri yükle
            await loadTablesAndSalons();
        } catch (error) {
            console.error(`Error force deleting table ${tableId}:`, error);
            throw error;
        }
    };

    // Masa oluşturma fonksiyonu
    const createTable = async ({ tableNumber, capacity, salonId }) => {
        try {
            if (tableNumber == null || capacity == null || salonId == null) {
                throw new Error('Eksik alan: tableNumber, capacity ve salonId zorunludur');
            }

            const payload = {
                tableNumber: Number(tableNumber),
                capacity: Number(capacity),
                salonId: Number(salonId),
                statusId: 1 // AVAILABLE
            };

            await apiCall('/dining-tables', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            await loadTablesAndSalons();
        } catch (error) {
            console.error('Masa eklenirken hata:', error);
            throw error;
        }
    };

    // Dışarıdan manuel yenileme: sadece salon+masa hafif yüklemesi
    // Not: fetchData ayrıca tüm verileri getirir; burada hızlı grid güncellemesi sağlanır

    const saveFinalOrder = async (tableId, finalItems) => {
        const isOrderEmpty = Object.keys(finalItems).length === 0;
        if (!isOrderEmpty && !checkIngredientStock(finalItems)) {
            alert("Maalesef stokta yeterli içerik yok!");
            return;
        }

        const orderItemsForBackend = Object.entries(finalItems).map(([id, item]) => {
            const product = findProductById(id);
            if (!product) {
                throw new Error(`Ürün ID'si bulunamadı: ${id}`);
            }
            return {
                productId: product.id,
                productName: product.name,
                quantity: item.count,
                unitPrice: product.price,
                totalPrice: item.count * product.price,
                note: item.note || ''
            };
        });

        // Backend OrderRequestDTO: { userId: int, tableId: int, items: [{productId, quantity}] }
        const roleInfo = getRoleInfoFromToken(localStorage.getItem('token') || '');
        const numericUserId = typeof roleInfo?.userId === 'string' && /^\d+$/.test(roleInfo.userId)
            ? parseInt(roleInfo.userId, 10)
            : (typeof roleInfo?.userId === 'number' ? roleInfo.userId : 1);

        // UI'deki tableId masa numarası olabilir; backend gerçek masa ID'si ister
        const toBackendTableId = (() => {
            const numeric = Number(tableId);
            const byNumber = (tables || []).find(t => Number(t?.tableNumber ?? t?.number) === numeric);
            if (byNumber?.id != null) return Number(byNumber.id);
            const byId = (tables || []).find(t => Number(t?.id) === numeric);
            if (byId?.id != null) return Number(byId.id);
            return parseInt(tableId);
        })();

        const orderData = {
            tableId: toBackendTableId,
            userId: numericUserId,
            items: orderItemsForBackend.map(i => ({ productId: i.productId, quantity: i.quantity })),
        };

        try {
            const currentOrder = orders[String(tableId)];
            if (currentOrder && currentOrder.id) {
                await apiCall(`/orders/${currentOrder.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData),
                });
            } else {
                // Yeni siparişlerde stok düşümü için backend iş mantığını tetikle
                await apiCall('/orders/make-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData),
                });
            }

            // Sadece admin rolleri stok hareketi oluşturabilir
            // Not: Yeni siparişlerde '/orders/make-order' stok düşümünü kendisi yapar.
            // Güncelleme durumlarında backend stok düşmüyor; burada manuel hareket eklemeyi tercih etmiyoruz.

            await fetchData();
            updateTableStatus(tableId, "occupied");

        } catch (error) {
            console.error("Sipariş kaydedilirken hata:", error);
            setError(`Sipariş kaydedilirken hata oluştu: ${error.message}`);
        }
    };

    const cancelOrder = async (tableId) => {
        try {
            const orderToCancel = orders[tableId];
            if (!orderToCancel || !orderToCancel.id) return;

            await apiCall(`/orders/${orderToCancel.id}`, { method: 'DELETE' });

            // Sadece admin rolleri stok iade hareketi oluşturabilir
            {
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                const roleInfo = token ? getRoleInfoFromToken(token) : {};
                const isAdmin = (roleInfo.roleId === 0) || (String(roleInfo.role || '').toLowerCase() === 'admin');
                if (isAdmin) {
                    for (const item of Object.values(orderToCancel.items)) {
                        const recipe = findProductRecipe(item.id);
                        for (const ingredient of recipe) {
                            const movement = {
                                id: 0,
                                stockId: ingredient.ingredientId,
                                change: ingredient.quantity * item.count,
                                reason: "RETURN",
                                note: "Sipariş İptali",
                                timestamp: new Date().toISOString()
                            };
                            await apiCall('/stock-movements', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(movement)
                            });
                        }
                    }
                }
            }
            await fetchData();
            updateTableStatus(tableId, "empty");
        } catch (error) {
            console.error("Sipariş iptal edilirken hata:", error);
            setError(`Sipariş iptal edilirken hata oluştu: ${error.message}`);
        }
    };

    const processPayment = async (tableId) => {
        try {
            const orderToPay = orders[tableId];
            if (!orderToPay || !orderToPay.id) return;

            // Tutarı hesapla (fallback: backend totalPrice yoksa local hesap)
            const amount = (() => {
                const items = Object.values(orderToPay.items || {});
                if (typeof orderToPay.totalPrice === 'number') return orderToPay.totalPrice;
                return items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.count) || 0), 0);
            })();

            // Kasiyer ID'sini JWT'den sayıya çevir
            const roleInfo = getRoleInfoFromToken(localStorage.getItem('token') || '');
            const numericUserId = typeof roleInfo?.userId === 'string' && /^\d+$/.test(roleInfo.userId)
                ? parseInt(roleInfo.userId, 10)
                : (typeof roleInfo?.userId === 'number' ? roleInfo.userId : 1);

            // 1) Ödeme kaydı oluştur (yetki yoksa atla)
            let paymentSuccessful = false;
            try {
                // Debug: Token ve rol bilgilerini kontrol et
                const token = localStorage.getItem('token') || '';
                console.log('DEBUG - Token:', token.substring(0, 50) + '...');
                console.log('DEBUG - Role Info:', roleInfo);
                console.log('DEBUG - User ID:', numericUserId);
                
                console.log('Payment API çağrısı yapılıyor:', {
                    orderId: orderToPay.id,
                    cashierId: numericUserId,
                    amount: amount,
                    method: 'CASH'
                });
                
                await apiCall('/payments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
                    body: JSON.stringify({
                        orderId: orderToPay.id,
                        cashierId: numericUserId,
                        amount: amount,
                        method: 'CASH'
                    })
                });
                
                paymentSuccessful = true;
                console.log('Payment API başarılı - order otomatik olarak completed=true yapılmalı');
                
            } catch (e) {
                console.error('Payment API hatası:', e);
                if (String(e?.message || '').toLowerCase().includes('unauthorized')) {
                    console.warn('Payments API unauthorized for this role. Skipping payment record and proceeding to close order.');
                } else {
                    throw e;
                }
            }

            // 2) Sipariş artık backend'de otomatik olarak tamamlanmış (is_completed=true) olarak işaretleniyor
            // DELETE işlemi kaldırıldı - order veritabanında kalacak ama completed=true olacak

            // 3) Masayı boşalt ve yerel durumu temizle
            await updateTableStatus(tableId, 'empty');
            setOrders(prev => { const next = { ...prev }; delete next[tableId]; return next; });
            setCompletedOrders(prev => ({ ...prev, [orderToPay.id]: orderToPay }));
            await fetchData();
        } catch (error) {
            console.error("Ödeme alınırken hata:", error);
            setError(`Ödeme alınırken hata oluştu: ${error.message}`);
        }
    };

    const decreaseConfirmedOrderItem = async (tableId, itemToDecrease) => {
        try {
            const currentOrder = orders[tableId];
            if (!currentOrder || !currentOrder.id) return;

            const updatedItems = { ...currentOrder.items };
            if (updatedItems[itemToDecrease.id].count > 1) {
                updatedItems[itemToDecrease.id].count -= 1;
            } else {
                delete updatedItems[itemToDecrease.id];
            }

            const roleInfo2 = getRoleInfoFromToken(localStorage.getItem('token') || '');
            const numericUserId2 = typeof roleInfo2?.userId === 'string' && /^\d+$/.test(roleInfo2.userId)
                ? parseInt(roleInfo2.userId, 10)
                : (typeof roleInfo2?.userId === 'number' ? roleInfo2.userId : 1);
            const backendTableId2 = (() => {
                const numeric = Number(tableId);
                const byNumber = (tables || []).find(t => Number(t?.tableNumber ?? t?.number) === numeric);
                if (byNumber?.id != null) return Number(byNumber.id);
                const byId = (tables || []).find(t => Number(t?.id) === numeric);
                if (byId?.id != null) return Number(byId.id);
                return parseInt(tableId);
            })();
            const orderData = {
                tableId: backendTableId2,
                userId: numericUserId2,
                items: Object.values(updatedItems).map(item => ({
                    productId: item.id,
                    quantity: item.count,
                })),
            };

            await apiCall(`/orders/${currentOrder.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...orderData, orderId: currentOrder.id }),
            });
            await fetchData();

        } catch (error) {
            console.error('Onaylanmış ürün azaltılırken hata:', error);
            setError(`Sipariş ürünü azaltılırken bir hata oluştu: ${error.message}`);
        }
    };

    const increaseConfirmedOrderItem = async (tableId, itemToIncrease) => {
        try {
            const currentOrder = orders[tableId];
            if (!currentOrder || !currentOrder.id) return;

            const updatedItems = { ...currentOrder.items };
            updatedItems[itemToIncrease.id].count += 1;

            const roleInfo3 = getRoleInfoFromToken(localStorage.getItem('token') || '');
            const numericUserId3 = typeof roleInfo3?.userId === 'string' && /^\d+$/.test(roleInfo3.userId)
                ? parseInt(roleInfo3.userId, 10)
                : (typeof roleInfo3?.userId === 'number' ? roleInfo3.userId : 1);
            const backendTableId3 = (() => {
                const numeric = Number(tableId);
                const byNumber = (tables || []).find(t => Number(t?.tableNumber ?? t?.number) === numeric);
                if (byNumber?.id != null) return Number(byNumber.id);
                const byId = (tables || []).find(t => Number(t?.id) === numeric);
                if (byId?.id != null) return Number(byId.id);
                return parseInt(tableId);
            })();
            const orderData = {
                tableId: backendTableId3,
                userId: numericUserId3,
                items: Object.values(updatedItems).map(item => ({
                    productId: item.id,
                    quantity: item.count,
                })),
            };

            await apiCall(`/orders/${currentOrder.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...orderData, orderId: currentOrder.id }),
            });
            await fetchData();

        } catch (error) {
            console.error('Onaylanmış ürün artırılırken hata:', error);
            setError(`Sipariş ürünü artırılırken bir hata oluştu: ${error.message}`);
        }
    };

    const removeConfirmedOrderItem = async (tableId, itemToRemove) => {
        try {
            const currentOrder = orders[tableId];
            if (!currentOrder || !currentOrder.id) return;

            const updatedItems = { ...currentOrder.items };
            delete updatedItems[itemToRemove.id];

            const roleInfo4 = getRoleInfoFromToken(localStorage.getItem('token') || '');
            const numericUserId4 = typeof roleInfo4?.userId === 'string' && /^\d+$/.test(roleInfo4.userId)
                ? parseInt(roleInfo4?.userId, 10)
                : (typeof roleInfo4?.userId === 'number' ? roleInfo4?.userId : 1);
            const backendTableId4 = (() => {
                const numeric = Number(tableId);
                const byNumber = (tables || []).find(t => Number(t?.tableNumber ?? t?.number) === numeric);
                if (byNumber?.id != null) return Number(byNumber.id);
                const byId = (tables || []).find(t => Number(t?.id) === numeric);
                if (byId?.id != null) return Number(byId.id);
                return parseInt(tableId);
            })();
            const orderData = {
                tableId: backendTableId4,
                userId: numericUserId4,
                items: Object.values(updatedItems).map(item => ({
                    productId: item.id,
                    quantity: item.count,
                })),
            };

            if (Object.keys(updatedItems).length === 0) {
                await apiCall(`/orders/${currentOrder.id}`, { method: 'DELETE' });
                await updateTableStatus(tableId, "empty");
            } else {
                await apiCall(`/orders/${currentOrder.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...orderData, orderId: currentOrder.id }),
                });
            }
            await fetchData();

        } catch (error) {
            console.error('Onaylanmış ürün kaldırılırken hata:', error);
            setError(`Sipariş ürünü kaldırılırken bir hata oluştu: ${error.message}`);
        }
    };

    // Add new item to existing order
    const addOrderItem = async (tableId, productId, quantity = 1, note = '') => {
        try {
            const currentOrder = orders[tableId];
            if (!currentOrder || !currentOrder.id) {
                console.warn('No existing order found for table:', tableId);
                return;
            }

            const product = findProductById(productId);
            if (!product) {
                throw new Error('Product not found');
            }

            // Update local state immediately for better UX
            const updatedItems = { ...currentOrder.items };
            if (updatedItems[productId]) {
                updatedItems[productId].count += quantity;
            } else {
                updatedItems[productId] = {
                    id: productId,
                    name: product.name,
                    price: product.price,
                    count: quantity,
                    note: note
                };
            }

            // Update local state first
            setOrders(prev => ({
                ...prev,
                [tableId]: {
                    ...prev[tableId],
                    items: updatedItems
                }
            }));

            // Get backend table ID
            const backendTableId = (() => {
                const numeric = Number(tableId);
                const byNumber = (tables || []).find(t => Number(t?.tableNumber ?? t?.number) === numeric);
                if (byNumber?.id != null) return Number(byNumber.id);
                const byId = (tables || []).find(t => Number(t?.id) === numeric);
                if (byId?.id != null) return Number(byId.id);
                return parseInt(tableId);
            })();

            // Get user ID from token
            const roleInfo = getRoleInfoFromToken(localStorage.getItem('token') || '');
            const numericUserId = typeof roleInfo?.userId === 'string' && /^\d+$/.test(roleInfo.userId)
                ? parseInt(roleInfo.userId, 10)
                : (typeof roleInfo?.userId === 'number' ? roleInfo.userId : 1);

            // Update backend immediately
            const orderData = {
                tableId: backendTableId,
                userId: numericUserId,
                items: Object.values(updatedItems).map(item => ({
                    productId: item.id,
                    quantity: item.count,
                })),
            };

            await apiCall(`/orders/${currentOrder.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...orderData, orderId: currentOrder.id }),
            });

            // Don't call fetchData() here - it overwrites local state
            // Instead, just refresh the specific order data
            try {
                const updatedOrderData = await apiCall(`/orders/${currentOrder.id}`);
                if (updatedOrderData) {
                    // Update only this specific order in local state
                    const orderItems = (updatedOrderData.items || []).reduce((itemAcc, item) => {
                        itemAcc[item.productId] = {
                            id: item.productId,
                            name: item.productName,
                            price: item.unitPrice,
                            count: item.quantity,
                            note: item.note || ''
                        };
                        return itemAcc;
                    }, {});

                    setOrders(prev => ({
                        ...prev,
                        [tableId]: {
                            ...prev[tableId],
                            ...updatedOrderData,
                            items: orderItems
                        }
                    }));
                }
            } catch (refreshError) {
                console.warn('Could not refresh order data, using local state:', refreshError);
            }
            
            console.log(`Item ${product.name} added to order for table ${tableId}`);

        } catch (error) {
            console.error('Error adding order item:', error);
            setError(`Sipariş ürünü eklenirken bir hata oluştu: ${error.message}`);
            
            // Revert local state on error
            await fetchData();
        }
    };

    const saveProductRecipe = async (productId, recipe) => {
        if (!recipe || recipe.length === 0) return;

        for (const recipeItem of recipe) {
            await apiCall('/product-ingredients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: productId,
                    ingredientId: recipeItem.ingredientId,
                    quantityPerUnit: recipeItem.quantity,
                })
            });
        }
    };

    const addProduct = async (category, productData) => {
        try {
            const newProduct = await apiCall('/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: productData.name,
                    price: productData.price,
                    description: productData.description,
                    category: category
                }),
            });

            await saveProductRecipe(newProduct.id, productData.recipe);
            await fetchData();

        } catch (error) {
            console.error("Ürün eklenirken hata:", error);
            setError(`Ürün eklenirken hata oluştu: ${error.message}`);
        }
    };

    const deleteProduct = async (productId) => {
        try {
            const existingRecipe = await apiCall(`/product-ingredients/product/${productId}`);
            if (existingRecipe && existingRecipe.length > 0) {
                for (const item of existingRecipe) {
                    await apiCall(`/product-ingredients/${productId}/${item.ingredient.id}`, { method: 'DELETE' });
                }
            }

            await apiCall(`/products/${productId}`, { method: 'DELETE' });
            await fetchData();
        } catch (error) {
            // Eğer ürün siparişlerde referanslıysa silme yerine arşivle (isActive=false)
            const msg = String(error?.message || '').toLowerCase();
            if (msg.includes('referenced') || msg.includes('cannot be deleted')) {
                const product = findProductById(productId);
                if (product) {
                    try {
                        await updateProduct(product.category, { ...product, isActive: false });
                        alert(`Ürün siparişlerde kullanıldığı için silinemedi. Ürün pasif hale getirildi: ${product.name}`);
                        return;
                    } catch (e) {
                        console.error('Ürün pasif edilirken hata:', e);
                    }
                }
            }
            console.error("Ürün silinirken hata:", error);
            setError(`Ürün silinirken hata oluştu: ${error.message}`);
        }
    };

    const updateProduct = async (category, updatedProduct) => {
        try {
            await apiCall(`/products/${updatedProduct.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: updatedProduct.id,
                    name: updatedProduct.name,
                    price: updatedProduct.price,
                    description: updatedProduct.description,
                    category: category,
                    isActive: updatedProduct.isActive !== false
                }),
            });

            const existingRecipe = await apiCall(`/product-ingredients/product/${updatedProduct.id}`);
            if (existingRecipe && existingRecipe.length > 0) {
                for (const item of existingRecipe) {
                    await apiCall(`/product-ingredients/${updatedProduct.id}/${item.ingredient.id}`, { method: 'DELETE' });
                }
            }

            await saveProductRecipe(updatedProduct.id, updatedProduct.recipe);
            await fetchData();

        } catch (error) {
            console.error("Ürün güncellenirken hata:", error);
            setError(`Ürün güncellenirken bir hata oluştu: ${error.message}`);
        }
    };

    const deleteProductIngredient = async (productId, ingredientId) => {
        try {
            await apiCall(`/product-ingredients/${productId}/${Number(ingredientId)}`, {
                method: 'DELETE',
            });
            await fetchData();
        } catch (error) {
            console.error('Reçete içerik silinirken beklenmedik bir hata oluştu:', error);
            setError(`Reçete içeriği silinirken bir hata oluştu: ${error.message}`);
            throw error;
        }
    };

    const addProductIngredient = async (productId, newIngredientData) => {
        try {
            await apiCall('/product-ingredients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: productId,
                    ingredientId: Number(newIngredientData.ingredientId),
                    quantityPerUnit: Number(newIngredientData.quantity),
                }),
            });
            await fetchData();
        } catch (error) {
            console.error('Reçeteye içerik eklenirken hata:', error);
            setError(`Reçeteye içerik eklenirken bir hata oluştu: ${error.message}`);
            throw error;
        }
    };

    const addIngredient = async (ingredientData) => {
        try {
            console.log("Yeni bir stok malzemesi ekleniyor:", ingredientData);

            // Girdi doğrulama
            if (!ingredientData.name || !ingredientData.name.trim()) {
                throw new Error("İçerik adı boş olamaz.");
            }
            if (!ingredientData.unit || !ingredientData.unit.trim()) {
                throw new Error("Birim boş olamaz.");
            }
            
            const validUnits = ["KG", "ADET", "L"];
            if (!validUnits.includes(ingredientData.unit.trim().toUpperCase())) {
                throw new Error("Geçerli birim seçin: KG, ADET veya L");
            }
            
            const stockQuantity = Number(ingredientData.stockQuantity);
            const minStock = Number(ingredientData.minStock);
            
            if (isNaN(stockQuantity) || stockQuantity < 0) {
                throw new Error("Başlangıç stoğu geçerli bir pozitif sayı olmalıdır.");
            }
            if (isNaN(minStock) || minStock < 0) {
                throw new Error("Minimum stok geçerli bir pozitif sayı olmalıdır.");
            }

            const payload = {
                name: ingredientData.name.trim(),
                unit: ingredientData.unit.trim().toUpperCase(), // Birim her zaman büyük harfle
                stockQuantity: parseFloat(stockQuantity), // Double type için parseFloat
                minQuantity: parseFloat(minStock), // Double type için parseFloat
            };

            const newIngredient = await apiCall('/stocks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!newIngredient || !newIngredient.id) {
                throw new Error("API'den geçerli bir stok malzemesi yanıtı alınamadı.");
            }

            console.log("Stok malzemesi başarıyla eklendi, stok hareketi oluşturuluyor:", newIngredient);

            // Sadece pozitif başlangıç stoğu varsa stok hareketi kaydet
            if (stockQuantity > 0) {
                const movement = {
                    stockId: newIngredient.id,
                    change: stockQuantity,
                    reason: "ADJUSTMENT",
                    note: "Yeni içerik eklendi (Başlangıç Stoğu)",
                };

                await apiCall('/stock-movements', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(movement)
                });
            }

            console.log("fetchData fonksiyonu çağrılıyor...");
            await fetchData();
            console.log("fetchData fonksiyonu tamamlandı.");

            return { success: true, message: "İçerik başarıyla eklendi!" };

        } catch (error) {
            console.error("İçerik eklenirken hata:", error);
            const errorMessage = error.message || "Bilinmeyen bir hata oluştu";
            setError(`İçerik eklenirken hata oluştu: ${errorMessage}`);
            throw new Error(errorMessage);
        }
    };

    const updateIngredientStock = async (stockId, change, reason, note = "") => {
        try {
            if (change === 0) {
                console.log("Stok miktarında değişiklik yok. İşlem atlanıyor.");
                return;
            }

            await apiCall('/stock-movements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stockId: Number(stockId),
                    change: parseFloat(change), // Double type için parseFloat
                    reason: reason,
                    note: note,
                })
            });
            await fetchData();
        } catch (error) {
            console.error("Stok güncellenirken hata:", error);
            setError(`Stok güncellenirken hata oluştu: ${error.message}`);
            throw error;
        }
    };

    const updateIngredientMinQuantity = async (stockId, minQuantity) => {
        try {
            console.log(`Minimum stok güncelleniyor - ID: ${stockId}, Min Quantity: ${minQuantity}`);
            
            // Girdi doğrulama
            const minQty = Number(minQuantity);
            if (isNaN(minQty) || minQty < 0) {
                throw new Error("Minimum stok geçerli bir pozitif sayı olmalıdır.");
            }

            await apiCall(`/stocks/${stockId}/min-quantity?minQuantity=${parseFloat(minQty)}`, {
                method: 'PATCH',  // API dokümantasyonuna göre PATCH method
                headers: { 'Content-Type': 'application/json' }
                // minQuantity query parameter olarak gönderiliyor
            });

            await fetchData();
            return { success: true, message: "Minimum stok başarıyla güncellendi!" };

        } catch (error) {
            console.error('Minimum stok güncellenirken hata:', error);
            setError(`Minimum stok güncellenirken bir hata oluştu: ${error.message}`);
            throw error;
        }
    };

    const deleteIngredient = async (ingredientId) => {
        try {
            console.log("Stok malzemesi siliniyor:", ingredientId);

            // Önce bu malzemeyi kullanan ürünleri kontrol et
            const productsUsingIngredient = Object.values(productsById).filter(product => 
                product.recipe && product.recipe.some(item => item.ingredientId === Number(ingredientId))
            );

            if (productsUsingIngredient.length > 0) {
                const productNames = productsUsingIngredient.map(p => p.name).join(', ');
                throw new Error(`Bu malzeme şu ürünlerde kullanılıyor: ${productNames}. Önce bu ürünlerden malzemeyi kaldırın.`);
            }

            // Önce bu malzemeyle ilgili tüm stok hareketlerini sil
            try {
                console.log("Stok hareketleri siliniyor...");
                
                // Backend'de bulk delete endpoint'i çalışmıyor, direkt alternatif yöntem kullan
                console.log("Bulk delete endpoint backend'de mevcut değil, alternatif yöntem kullanılıyor");
                
                // Tüm stok hareketlerini çek ve ilgili olanları tek tek sil
                const allMovements = await apiCall('/stock-movements');
                const movementsToDelete = allMovements.filter(movement => 
                    movement.stockId === Number(ingredientId) || movement.stock?.id === Number(ingredientId)
                );
                
                console.log(`${movementsToDelete.length} adet stok hareketi bulundu, tek tek siliniyor...`);
                
                for (const movement of movementsToDelete) {
                    try {
                        await apiCall(`/stock-movements/${movement.id}`, {
                            method: 'DELETE'
                        });
                        console.log(`Stok hareketi ${movement.id} başarıyla silindi`);
                    } catch (individualError) {
                        console.warn(`Stok hareketi ${movement.id} silinirken hata:`, individualError.message || individualError);
                    }
                }
                console.log("Stok hareketleri tek tek silme ile tamamlandı");
                
            } catch (movementError) {
                console.warn("Stok hareketleri silinirken hata:", movementError.message || movementError);
                console.log("Stok hareketi silme başarısız, yine de malzeme silme işlemine devam ediliyor...");
            }

            // Şimdi stok malzemesini sil
            try {
                await apiCall(`/stocks/${ingredientId}`, {
                    method: 'DELETE'
                });
                console.log("Malzeme başarıyla silindi");
                
                await fetchData();
                return { success: true, message: "Malzeme başarıyla silindi!" };
                
            } catch (deleteError) {
                console.error("Malzeme silinirken hata:", deleteError);
                
                // Spesifik hata mesajları
                if (deleteError.message && deleteError.message.includes('foreign key')) {
                    throw new Error("Bu malzeme başka kayıtlarda kullanıldığı için silinemiyor. Önce bu malzemeyi kullanan tüm kayıtları temizleyin.");
                } else if (deleteError.message && (deleteError.message.includes('403') || deleteError.message.includes('Forbidden'))) {
                    throw new Error("Bu işlem için yetkiniz bulunmuyor. Lütfen sistem yöneticisi ile iletişime geçin.");
                } else if (deleteError.message && deleteError.message.includes('404')) {
                    throw new Error("Silinmeye çalışılan malzeme bulunamadı. Sayfa yenilenerek güncel veriler alınıyor...");
                } else {
                    throw new Error(`Malzeme silinirken beklenmedik bir hata oluştu: ${deleteError.message || deleteError}`);
                }
            }

        } catch (error) {
            console.error("Malzeme silinirken hata:", error);
            let errorMessage = error.message || "Malzeme silinirken bir hata oluştu";
            
            // Foreign key constraint hatası için özel mesaj
            if (errorMessage.includes('foreign key constraint') || errorMessage.includes('still referenced')) {
                errorMessage = "Bu malzeme sistem kayıtlarında kullanıldığı için silinemiyor. Lütfen sistem yöneticisi ile iletişime geçin.";
            }
            
            setError(`Malzeme silinirken hata oluştu: ${errorMessage}`);
            throw new Error(errorMessage);
        }
    };

    const addReservation = async (tableId, reservationData) => {
        try {
            const backendReservation = await apiCall('/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...reservationData, tableId })
            });

            const reservationId = backendReservation.id || crypto.randomUUID();
            const newReservation = {
                id: reservationId,
                tableId,
                ...reservationData,
                createdAt: backendReservation.createdAt || new Date().toISOString(),
                backendId: backendReservation.id,
            };

            setReservations(prev => ({
                ...prev,
                [reservationId]: newReservation
            }));
            await updateTableStatus(tableId, "reserved");

            return reservationId;
        } catch (error) {
            console.error('Failed to create reservation in backend:', error);
            setError(`Rezervasyon oluşturulurken hata oluştu: ${error.message}`);
        }
    };

    const removeReservation = async (reservationId) => {
        try {
            const reservation = reservations[reservationId];
            if (reservation && reservation.backendId) {
                await apiCall(`/reservations/${reservation.backendId}`, {
                    method: 'DELETE'
                });
            }
            setReservations(prev => {
                const newReservations = { ...prev };
                const reservation = newReservations[reservationId];
                if (reservation) {
                    delete newReservations[reservationId];
                    if (reservation.tableId) {
                        setTableStatus(prevStatus => ({ ...prevStatus, [reservation.tableId]: 'empty' }));
                    }
                }
                return newReservations;
            });
        } catch (error) {
            console.error('Failed to delete reservation from backend:', error);
            setError(`Rezervasyon silinirken hata oluştu: ${error.message}`);
        }
    };

    const updateReservation = async (reservationId, updatedData) => {
        try {
            const reservation = reservations[reservationId];
            if (reservation && reservation.backendId) {
                await apiCall(`/reservations/${reservation.backendId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData)
                });
            }
            setReservations(prev => ({
                ...prev,
                [reservationId]: {
                    ...prev[reservationId],
                    ...updatedData,
                    updatedAt: new Date().toISOString()
                }
            }));
        } catch (error) {
            console.error('Failed to update reservation in backend:', error);
            setError(`Rezervasyon güncellenirken hata oluştu: ${error.message}`);
        }
    };

    const loadTableStatuses = useCallback(async () => {
        try {
            // Raw fetch to tolerate non-JSON responses gracefully
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/table-statuses`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            const text = await res.text();
            let data;
            try {
                data = text ? JSON.parse(text) : [];
            } catch (e) {
                console.error('Failed to parse /table-statuses JSON. Returning empty list. Raw:', text);
                data = [];
            }
            if (!Array.isArray(data)) {
                console.warn('Unexpected /table-statuses format, coercing to array');
                data = [];
            }
            setTableStatuses(data);
        } catch (error) {
            console.error('Failed to load table statuses:', error);
            setError(`Masa durumları yüklenirken hata oluştu: ${error.message}`);
        }
    }, []);

    const addOrderHistoryEntry = (orderData, action, personnelName, personnelRole) => {
        const timestamp = new Date().toLocaleString('tr-TR');
        const newEntry = {
            id: crypto.randomUUID(),
            orderContent: orderData.orderContent,
            action: action,
            personnelName: personnelName,
            personnelRole: personnelRole,
            financialImpact: orderData.financialImpact,
            timestamp: timestamp,
            tableId: orderData.tableId
        };
        setOrderHistory(prev => [newEntry, ...prev]);
    };

    const getOrderContent = (orderItems) => {
        if (!orderItems || Object.keys(orderItems).length === 0) return "Boş sipariş";
        return Object.values(orderItems).map(item => `${item.name} x${item.count}`).join(', ');
    };

    const calculateFinancialImpact = (orderItems, action) => {
        if (!orderItems || Object.keys(orderItems).length === 0) return "0 TL";
        const total = Object.values(orderItems).reduce((sum, item) => sum + (item.price * item.count), 0);
        return (action === "Sipariş Eklendi" || action === "Sipariş Onaylandı") ? `+${total} TL` : `-${total} TL`;
    };

    const now = new Date();
    const todayStr = now.toLocaleDateString();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let dailyCount = 0;
    let monthlyCount = 0;
    let yearlyCount = 0;

    Object.values(completedOrders).forEach((order) => {
        const d = new Date(order.creationDate);
        if (d.toLocaleDateString() === todayStr) dailyCount++;
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) monthlyCount++;
        if (d.getFullYear() === currentYear) yearlyCount++;
    });

    return (
        <TableContext.Provider
            value={{
                products,
                productsById,
                ingredients,
                tableStatus,
                orders,
                completedOrders,
                tables,
                salons,
                tableStatuses,
                activeTableIds,
                reservations,
                orderHistory,
                isLoading,
                error,
                dailyOrderCount: dailyCount,
                monthlyOrderCount: monthlyCount,
                yearlyOrderCount: yearlyCount,
                updateTableStatus,
                updateTable,
                deleteTable,
                deleteTableForce,
                createTable,
                saveFinalOrder,
                cancelOrder,
                processPayment,
                loadTablesAndSalons,
                loadTableStatuses,
                addProduct,
                deleteProduct,
                updateProduct,
                updateIngredientStock,
                updateIngredientMinQuantity,
                findProductById,
                addIngredient,
                deleteIngredient,
                deleteProductIngredient,
                addProductIngredient,
                addReservation,
                removeReservation,
                updateReservation,
                addOrderHistoryEntry,
                getOrderContent,
                calculateFinancialImpact,
                removeConfirmedOrderItem,
                decreaseConfirmedOrderItem,
                increaseConfirmedOrderItem,
                addOrderItem
            }}
        >
            {children}
        </TableContext.Provider>
    );
}