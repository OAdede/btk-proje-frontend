import React, { createContext, useState, useEffect, useCallback, useRef } from "react";
import { getRoleInfoFromToken } from "../utils/jwt.js";
import { reservationService } from "../services/reservationService";
import { orderService } from "../services/orderService";

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
    const [timestamps, setTimestamps] = useState({});
    const [orderHistory, setOrderHistory] = useState(() => readFromLocalStorage('orderHistory', []));

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRefreshingAvailability, setIsRefreshingAvailability] = useState(false);
    const [availabilityNotification, setAvailabilityNotification] = useState(null);

    const apiCall = useCallback(async (endpoint, options = {}) => {
        try {

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
                
                // 500 Internal Server Error için özel işlem
                if (response.status === 500) {
                    const errorData = await response.text().catch(() => '')
                        .then(t => { try { return JSON.parse(t); } catch { return { message: t || 'Sunucu hatası' }; } });
                    console.error(`API çağrısı sunucu hatası: ${endpoint}`, errorData);
                    
                    // JPA transaction hatası kontrolü
                    if (errorData.message && errorData.message.includes("JPA transaction")) {
                        throw new Error(`Veritabanı işlemi hatası: ${errorData.message}`);
                    }
                    
                    throw new Error(errorData.message || "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.");
                }
                
                const errorData = await response.text().catch(() => '')
                    .then(t => { try { return JSON.parse(t); } catch { return { message: t || 'Sunucu hatası' }; } });
                console.error(`API çağrısı hatası: ${endpoint}`, errorData);
                console.error(`Response status: ${response.status}`);
                console.error(`Response statusText: ${response.statusText}`);
                console.error(`Full error response:`, errorData);
                
                // Detaylı hata mesajı oluştur
                let detailedMessage = `HTTP ${response.status}: `;
                if (errorData.details) {
                    detailedMessage += JSON.stringify(errorData.details);
                } else if (errorData.message) {
                    detailedMessage += errorData.message;
                } else {
                    detailedMessage += response.statusText || "Beklenmedik bir hata oluştu.";
                }
                
                const error = new Error(detailedMessage);
                error.details = errorData;
                error.status = response.status;
                throw error;
            }

            if (response.status === 204) {
                return null;
            }

            const data = await response.json();
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
        return finalStock;
    };

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

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
                        return [];
                    }
                    throw error; // Diğer hataları yukarı fırlat
                }
            };


            
            const tasks = [
                apiCall('/products'),                // 0
                safeStocksCall(),                   // 1 - tüm roller için dene
                apiCall('/product-ingredients'),     // 2
                apiCall('/dining-tables'),           // 3
                safeOrdersCall(),                   // 4 - güvenli orders çağrısı
                apiCall('/salons'),                  // 5
                apiCall('/reservations'),            // 6 - rezervasyonları getir
                apiCall('/products/available-quantities'), // 7 - ürün müsaitlik miktarları
            ];

            const results = await Promise.allSettled(tasks);


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
            const reservationsData = safe(6, []);
            const availableQuantitiesData = safe(7, []);

            if (!productsData || productsData.length === 0) {
                console.warn("API'den ürün verisi gelmedi veya liste boş.");
            }

            setTables(diningTablesData || []);
            setSalons(salonsData || []);

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

            // API'den gelen gerçek müsaitlik miktarlarını ürünlere uygula
            if (availableQuantitiesData && availableQuantitiesData.length > 0) {
    
                
                // Her ürün için gerçek müsaitlik miktarını güncelle
                availableQuantitiesData.forEach(availabilityItem => {
                    const productId = availabilityItem.productId;
                    const availableAmount = availabilityItem.amount;
                    
                    // ProductsById objesinde güncelle
                    if (productsByIdTemp[productId]) {
                        productsByIdTemp[productId].stock = availableAmount;
    
                    }
                    
                    // Kategori bazlı products objesinde de güncelle
                    Object.keys(newProductsByCategory).forEach(categoryName => {
                        newProductsByCategory[categoryName].forEach(product => {
                            if (product.id === productId) {
                                product.stock = availableAmount;
        
                            }
                        });
                    });
                });
            } else {

            }



            setProducts(newProductsByCategory);
            setProductsById(productsByIdTemp);

            // Siparişleri hem backend masa ID'si hem de masa numarası ile indeksle
            try {
                const ordersByTable = {};
                
                (ordersData || []).forEach(order => {
                    if (!order || !order.tableId) return; // Geçersiz order'ları atla
                    
                    // Tamamlanmış siparişleri masalarda gösterme (isCompleted=true olanlar)
                    if (order.isCompleted === true) {
        
                        return;
                    }
                    
                    const orderData = {
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
                    
                    // Backend table ID ile indeksle
                    const keyBackendId = String(order.tableId);
                    ordersByTable[keyBackendId] = orderData;
                    
                    // Masa numarası ile de indeksle (eğer bulunabilirse)
                    const table = (diningTablesData || []).find(t => t.id === order.tableId);
                    if (table && table.tableNumber) {
                        const keyTableNumber = String(table.tableNumber);
                        ordersByTable[keyTableNumber] = orderData;
                    }
                });
                
                setOrders(ordersByTable);

                const completedOrdersData = (ordersData || []).filter(order => 
                    order && order.status === "paid"
                );
                setCompletedOrders(completedOrdersData || {});

                // Process reservations from proper API endpoint
                
                
                const reservationsById = (reservationsData || []).reduce((acc, reservation) => {
                    if (reservation && reservation.id) {
                        // Transform backend reservation to frontend format
                        const frontendReservation = {
                            id: reservation.id,
                            tableId: reservation.tableId,
                            statusId: reservation.statusId,
                            statusName: reservation.statusName || reservation.statusNameInTurkish,
                            ad: reservation.customerName ? reservation.customerName.split(' ')[0] : '',
                            soyad: reservation.customerName ? reservation.customerName.split(' ').slice(1).join(' ') : '',
                            telefon: reservation.customerPhone,
                            email: reservation.email,
                            tarih: reservation.reservationDate,
                            saat: reservation.reservationTime,
                            kisiSayisi: reservation.personCount,
                            not: reservation.specialRequests,
                            createdAt: reservation.createdAt,
                            backendId: reservation.id,
                        };
                        
                        acc[reservation.id] = frontendReservation;
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

    // Periyodik olarak ürün müsaitlik miktarlarını güncelle (her 2 dakikada bir)
    useEffect(() => {
        if (!isLoading) {
            const interval = setInterval(() => {
                refreshProductAvailability();
            }, 2 * 60 * 1000); // 2 dakika

            return () => clearInterval(interval);
        }
    }, [isLoading]);

    // Bildirimleri otomatik olarak temizle
    useEffect(() => {
        if (availabilityNotification) {
            const timer = setTimeout(() => {
                setAvailabilityNotification(null);
            }, 3000); // 3 saniye sonra temizle

            return () => clearTimeout(timer);
        }
    }, [availabilityNotification]);

    useEffect(() => {
        const onRefreshTables = async () => {
            try { await loadTablesAndSalons(); } catch {}
        };
        if (typeof window !== 'undefined') {
            window.addEventListener('refresh-tables', onRefreshTables);
        }
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('refresh-tables', onRefreshTables);
            }
        };
    }, [loadTablesAndSalons]);

    const findProductById = (productId) => {
        const parsedProductId = typeof productId === 'string' ? parseInt(productId, 10) : productId;
        return productsById[parsedProductId] || null;
    };

    const findProductRecipe = (productId) => {
        const product = findProductById(productId);
        if (!product?.recipe) return [];
        
        // Sıfır miktar olan malzemeleri filtrele
        return product.recipe.filter(ingredient => 
            ingredient.quantity && ingredient.quantity > 0
        );
    };

    const checkIngredientStock = (orderItems, isIncrease = false) => {

        
        // Eğer ingredients boşsa, stok kontrolünü atla
        if (!ingredients || Object.keys(ingredients).length === 0) {
            console.warn("Stok verileri yüklenmemiş, stok kontrolü atlanıyor");
            return true;
        }
        
        const tempIngredients = { ...ingredients };
        const invalidProducts = [];
        let hasInsufficientStock = false;
        
        for (const [id, item] of Object.entries(orderItems)) {
            const recipe = findProductRecipe(id);

            
            if (!recipe.length) {

                continue;
            }
            
            for (const ingredient of recipe) {

                
                // Sıfır miktar kontrolü ekle
                if (!ingredient.quantity || ingredient.quantity <= 0) {
                    console.warn(`Ürün ${id} için geçersiz malzeme miktarı: ${ingredient.quantity}`);
                    invalidProducts.push({ productId: id, ingredientId: ingredient.ingredientId, quantity: ingredient.quantity });
                    continue;
                }
                
                const required = ingredient.quantity * item.count;
                
                
                // Stok verisi erişilemiyorsa kontrol et
                if (!tempIngredients[ingredient.ingredientId]) {
                    console.warn(`Malzeme ${ingredient.ingredientId} için stok verisi bulunamadı - kontrol atlanıyor`);
                    continue;
                }
                
                const availableStock = tempIngredients[ingredient.ingredientId].stockQuantity;
                
                
                if (availableStock < required) {
                    console.error(`Yetersiz stok! Malzeme: ${tempIngredients[ingredient.ingredientId].name}, Mevcut: ${availableStock}, Gerekli: ${required}`);
                    hasInsufficientStock = true;
                    // Hata mesajını daha detaylı göster
                    alert(`Yetersiz stok!\n\nMalzeme: ${tempIngredients[ingredient.ingredientId].name}\nMevcut: ${availableStock} ${tempIngredients[ingredient.ingredientId].unit}\nGerekli: ${required} ${tempIngredients[ingredient.ingredientId].unit}`);
                    return false;
                }
                
                tempIngredients[ingredient.ingredientId].stockQuantity -= required;
            }
        }
        
        // Geçersiz ürünler varsa log
        if (invalidProducts.length > 0) {
            console.warn("Geçersiz malzeme miktarları olan ürünler:", invalidProducts);
        }
        
        if (hasInsufficientStock) {
            return false;
        }
        

        return true;
    };

    // Ürün müsaitlik miktarlarını güncelle
    const refreshProductAvailability = async () => {
        try {
            setIsRefreshingAvailability(true);
    
            const availableQuantitiesData = await apiCall('/products/available-quantities');
            
            if (availableQuantitiesData && availableQuantitiesData.length > 0) {
    
                
                // ProductsById objesini güncelle
                setProductsById(prevProductsById => {
                    const updated = { ...prevProductsById };
                    availableQuantitiesData.forEach(availabilityItem => {
                        const productId = availabilityItem.productId;
                        const availableAmount = availabilityItem.amount;
                        
                        if (updated[productId]) {
                            updated[productId].stock = availableAmount;
                        }
                    });
                    return updated;
                });
                
                // Kategori bazlı products objesini güncelle
                setProducts(prevProducts => {
                    const updated = { ...prevProducts };
                    Object.keys(updated).forEach(categoryName => {
                        updated[categoryName] = updated[categoryName].map(product => {
                            const availabilityItem = availableQuantitiesData.find(item => item.productId === product.id);
                            if (availabilityItem) {
                                return { ...product, stock: availabilityItem.amount };
                            }
                            return product;
                        });
                    });
                    return updated;
                });
                
        
                setAvailabilityNotification({
                    type: 'success',
                    message: 'Stok durumu başarıyla güncellendi!',
                    timestamp: Date.now()
                });
            }
        } catch (error) {
            console.error("Ürün müsaitlik miktarları güncellenirken hata:", error);
            setAvailabilityNotification({
                type: 'error',
                message: 'Stok durumu güncellenirken hata oluştu!',
                timestamp: Date.now()
            });
        } finally {
            setIsRefreshingAvailability(false);
        }
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
    
                return;
            }

            // Sırasıyla patch et (bağımsızlar)
            if (willChangeNumber) {
    
                await apiCall(`/dining-tables/${tableId}/table-number/${nextNumber}`, {
                    method: 'PATCH'
                });
            }

            if (willChangeCapacity) {
    
                await apiCall(`/dining-tables/${tableId}/capacity/${nextCapacity}`, {
                    method: 'PATCH'
                });
            }

            // Güncel verileri yükle
            await loadTablesAndSalons();

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
        // Loading state başlat
        setError(null);
        
        const isOrderEmpty = Object.keys(finalItems).length === 0;
        
        // Stok kontrolü - sadece admin rolü için aktif
        const token = localStorage.getItem('token');
        const roleInfo = getRoleInfoFromToken(token || '');
        const isAdmin = (roleInfo.roleId === 0) || (String(roleInfo.role || '').toLowerCase() === 'admin');
        
        if (!isOrderEmpty && isAdmin) {
            console.log("Admin rolü için stok kontrolü yapılıyor...");
            console.log("Stok verileri durumu:", {
                ingredientsCount: Object.keys(ingredients).length,
                ingredients: ingredients,
                finalItems: finalItems
            });
            if (!checkIngredientStock(finalItems)) {
                return;
            }
        } else if (!isOrderEmpty) {
            console.log("Admin olmayan rol için stok kontrolü atlanıyor...");
        }

        // Malzeme miktarlarını kontrol et ve sıfır olanları filtrele
        const validItems = {};
        for (const [id, item] of Object.entries(finalItems)) {
            const recipe = findProductRecipe(id);
            if (recipe.length > 0) {
                // Tarifte sıfır miktar olan malzeme var mı kontrol et
                const hasValidIngredients = recipe.every(ingredient => 
                    ingredient.quantity && ingredient.quantity > 0
                );
                
                if (hasValidIngredients) {
                    validItems[id] = item;
                } else {
                    console.warn(`Ürün ${id} için geçersiz malzeme miktarları bulundu, siparişten çıkarıldı`);
                }
            } else {
                // Tarifi olmayan ürünler için direkt ekle
                validItems[id] = item;
            }
        }

        // Geçerli ürün yoksa hata ver
        if (Object.keys(validItems).length === 0) {
            alert("Sipariş edilebilir geçerli ürün bulunamadı!");
            return;
        }

        // Filtrelenen ürünler hakkında log
        if (Object.keys(validItems).length !== Object.keys(finalItems).length) {
            console.log("Filtrelenen ürünler:", {
                original: Object.keys(finalItems),
                filtered: Object.keys(validItems),
                removed: Object.keys(finalItems).filter(id => !validItems[id])
            });
        }

        // Sipariş verilerini doğrula
        const orderItemsForBackend = Object.entries(validItems).map(([id, item]) => {
            const product = findProductById(id);
            if (!product) {
                throw new Error(`Ürün ID'si bulunamadı: ${id}`);
            }
            
            // Ürün miktarını kontrol et
            if (!item.count || item.count <= 0) {
                throw new Error(`Ürün ${product.name} için geçersiz miktar: ${item.count}`);
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

        // Masa ID kontrolü
        if (!toBackendTableId || isNaN(toBackendTableId)) {
            setError("Geçersiz masa numarası. Lütfen sayfayı yenileyin ve tekrar deneyin.");
            return;
        }

        // Veri bütünlüğü kontrolü
        if (!numericUserId || numericUserId <= 0) {
            setError("Kullanıcı kimlik bilgisi geçersiz. Lütfen tekrar giriş yapın.");
            return;
        }

        if (!orderItemsForBackend || orderItemsForBackend.length === 0) {
            setError("Sipariş edilebilir ürün bulunamadı. Lütfen siparişinizi kontrol edin.");
            return;
        }

        // Her ürün için ek kontrol
        for (const item of orderItemsForBackend) {
            if (!item.productId || item.productId <= 0) {
                setError(`Geçersiz ürün ID'si: ${item.productId}`);
                return;
            }
            if (!item.quantity || item.quantity <= 0) {
                setError(`Ürün ${item.productName} için geçersiz miktar: ${item.quantity}`);
                return;
            }
        }

        const orderData = {
            tableId: toBackendTableId,
            items: orderItemsForBackend.map(i => ({ productId: i.productId, quantity: i.quantity })),
        };

        try {
            const currentOrder = orders[String(tableId)];
            let retryCount = 0;
            const maxRetries = 2;
            
            while (retryCount <= maxRetries) {
                try {
                    if (currentOrder && currentOrder.id) {
                        await apiCall(`/orders/${currentOrder.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(orderData),
                        });
                    } else {
                        // upsertOrderSync endpoint'ini kullan (authentication'dan user'ı alır)
                        await apiCall('/orders/upsert-sync', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(orderData),
                        });
                    }

                    break; // Başarılı olursa döngüden çık
                } catch (retryError) {
                    retryCount++;
                    console.warn(`Sipariş kaydetme denemesi ${retryCount} başarısız:`, retryError.message);
                    
                    // JPA transaction hatası ise ve retry hakkı varsa tekrar dene
                    if (retryError.message && retryError.message.includes("JPA transaction") && retryCount <= maxRetries) {
                        console.warn(`JPA transaction hatası, ${retryCount}. deneme yapılıyor...`);
                        // Kısa bir bekleme süresi (her denemede artan süre)
                        const waitTime = 1000 * retryCount;

                        await new Promise(resolve => setTimeout(resolve, waitTime));
                        continue;
                    }
                    
                    // Diğer hatalar veya max retry aşıldıysa hatayı fırlat
                    if (retryCount > maxRetries) {
                        console.error(`Maksimum retry sayısı (${maxRetries}) aşıldı. Hata fırlatılıyor.`);
                    }
                    throw retryError;
                }
            }

            // Sadece admin rolleri stok hareketi oluşturabilir
            // Not: Yeni siparişlerde '/orders/make-order' stok düşümünü kendisi yapar.
            // Güncelleme durumlarında backend stok düşmüyor; burada manuel hareket eklemeyi tercih etmiyoruz.


            await fetchData();
            updateTableStatus(tableId, "occupied");
            
            // Masa için aktif rezervasyonları tamamla
            try {
                await completeActiveReservationsForTable(tableId);
            } catch (error) {
                console.warn('Rezervasyon tamamlama sırasında hata (sipariş kaydedildi):', error);
            }
            
            // Sipariş sonrası ürün müsaitlik miktarlarını güncelle
            await refreshProductAvailability();
            


        } catch (error) {
            console.error("Sipariş kaydedilirken hata:", error);
            
            // Hata mesajını daha detaylı hale getir
            let errorMessage = "Sipariş kaydedilirken hata oluştu";
            let userGuidance = "";
            
            if (error.message && error.message.includes("Miktar değişimi sıfır olamaz")) {
                errorMessage = "Bazı ürünlerin malzeme miktarları geçersiz. Lütfen ürün tariflerini kontrol edin.";
                userGuidance = "Ürün tariflerinde sıfır miktar değeri olan malzemeler bulundu. Lütfen admin panelinden ürün tariflerini kontrol edin.";
            } else if (error.message && error.message.includes("Validation failed")) {
                errorMessage = "Sipariş verilerinde doğrulama hatası. Lütfen tekrar deneyin.";
                userGuidance = "Sipariş verileri geçersiz. Lütfen sayfayı yenileyin ve tekrar deneyin.";
            } else if (error.message && error.message.includes("Could not commit JPA transaction")) {
                errorMessage = "Veritabanı işlemi tamamlanamadı. Bu genellikle geçici bir sistem hatasıdır.";
                userGuidance = "Bu hata genellikle geçici bir sistem sorunudur. Lütfen birkaç dakika bekleyin ve tekrar deneyin. Sorun devam ederse sistem yöneticisi ile iletişime geçin.";
            } else if (error.message && error.message.includes("JPA transaction")) {
                errorMessage = "Veritabanı işlemi sırasında hata oluştu. Lütfen daha sonra tekrar deneyin.";
                userGuidance = "Veritabanı işlemi sırasında teknik bir sorun oluştu. Lütfen daha sonra tekrar deneyin.";
            } else if (error.message) {
                errorMessage += `: ${error.message}`;
            }
            
            // Detaylı hata loglaması
            console.error("Hata detayları:", {
                errorType: "JPA Transaction Error",
                errorMessage: error.message,
                userGuidance: userGuidance,
                timestamp: new Date().toISOString(),
                tableId: tableId,
                orderItems: finalItems
            });
            
            // Kullanıcıya hem hata mesajını hem de rehberliği göster
            if (userGuidance) {
                setError(`${errorMessage}\n\n${userGuidance}`);
            } else {
                setError(errorMessage);
            }
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
                            // Sıfır miktar kontrolü ekle
                            if (!ingredient.quantity || ingredient.quantity <= 0) {
                                console.warn(`Ürün ${item.id} için geçersiz malzeme miktarı: ${ingredient.quantity}`);
                                continue;
                            }
                            
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
            
            // Sipariş iptali sonrası ürün müsaitlik miktarlarını güncelle
            await refreshProductAvailability();
        } catch (error) {
            console.error("Sipariş iptal edilirken hata:", error);
            
            // Hata mesajını daha detaylı hale getir
            let errorMessage = "Sipariş iptal edilirken hata oluştu";
            let userGuidance = "";
            
            if (error.message && error.message.includes("Miktar değişimi sıfır olamaz")) {
                errorMessage = "Bazı ürünlerin malzeme miktarları geçersiz. Stok iade işlemi yapılamadı.";
                userGuidance = "Ürün tariflerinde sıfır miktar değeri olan malzemeler bulundu. Stok iade işlemi yapılamadı.";
            } else if (error.message && error.message.includes("Validation failed")) {
                errorMessage = "Stok iade verilerinde doğrulama hatası. Lütfen tekrar deneyin.";
                userGuidance = "Stok iade verileri geçersiz. Lütfen sayfayı yenileyin ve tekrar deneyin.";
            } else if (error.message && error.message.includes("Could not commit JPA transaction")) {
                errorMessage = "Veritabanı işlemi tamamlanamadı. Bu genellikle geçici bir sistem hatasıdır.";
                userGuidance = "Bu hata genellikle geçici bir sistem sorunudur. Lütfen birkaç dakika bekleyin ve tekrar deneyin. Sorun devam ederse sistem yöneticisi ile iletişime geçin.";
            } else if (error.message && error.message.includes("JPA transaction")) {
                errorMessage = "Veritabanı işlemi sırasında hata oluştu. Lütfen daha sonra tekrar deneyin.";
                userGuidance = "Veritabanı işlemi sırasında teknik bir sorun oluştu. Lütfen daha sonra tekrar deneyin.";
            } else if (error.message) {
                errorMessage += `: ${error.message}`;
            }
            
            // Detaylı hata loglaması
            console.error("Sipariş iptal hatası detayları:", {
                errorType: "JPA Transaction Error",
                errorMessage: error.message,
                userGuidance: userGuidance,
                timestamp: new Date().toISOString(),
                tableId: tableId,
                orderToCancel: orderToCancel
            });
            
            // Kullanıcıya hem hata mesajını hem de rehberliği göster
            if (userGuidance) {
                setError(`${errorMessage}\n\n${userGuidance}`);
            } else {
                setError(errorMessage);
            }
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
            
            // Ödeme sonrası ürün müsaitlik miktarlarını güncelle
            await refreshProductAvailability();
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

            // Get user ID from token
            const roleInfo = getRoleInfoFromToken(localStorage.getItem('token') || '');
            const numericUserId = typeof roleInfo?.userId === 'string' && /^\d+$/.test(roleInfo.userId)
                ? parseInt(roleInfo.userId, 10)
                : (typeof roleInfo?.userId === 'number' ? roleInfo.userId : 1);
            
            // Get backend table ID
            const backendTableId = (() => {
                const numeric = Number(tableId);
                const byNumber = (tables || []).find(t => Number(t?.tableNumber ?? t?.number) === numeric);
                if (byNumber?.id != null) return Number(byNumber.id);
                const byId = (tables || []).find(t => Number(t?.id) === numeric);
                if (byId?.id != null) return Number(byId.id);
                return parseInt(tableId);
            })();

            // Prepare complete order data for backend
            const orderData = {
                tableId: backendTableId,
                userId: numericUserId,
                items: Object.values(updatedItems).map(item => ({
                    productId: item.id,
                    quantity: item.count,
                })),
            };

            // Update the complete order
            await apiCall(`/orders/${currentOrder.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });
            
            await fetchData();
            
            // Sipariş güncellemesi sonrası ürün müsaitlik miktarlarını güncelle
            await refreshProductAvailability();

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

            // Get user ID from token
            const roleInfo = getRoleInfoFromToken(localStorage.getItem('token') || '');
            const numericUserId = typeof roleInfo?.userId === 'string' && /^\d+$/.test(roleInfo.userId)
                ? parseInt(roleInfo.userId, 10)
                : (typeof roleInfo?.userId === 'number' ? roleInfo.userId : 1);
            
            // Get backend table ID
            const backendTableId = (() => {
                const numeric = Number(tableId);
                const byNumber = (tables || []).find(t => Number(t?.tableNumber ?? t?.number) === numeric);
                if (byNumber?.id != null) return Number(byNumber.id);
                const byId = (tables || []).find(t => Number(t?.id) === numeric);
                if (byId?.id != null) return Number(byId.id);
                return parseInt(tableId);
            })();

            // Prepare complete order data for backend
            const orderData = {
                tableId: backendTableId,
                userId: numericUserId,
                items: Object.values(updatedItems).map(item => ({
                    productId: item.id,
                    quantity: item.count,
                })),
            };

            // Update the complete order
            await apiCall(`/orders/${currentOrder.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });
            
            await fetchData();
            
            // Sipariş güncellemesi sonrası ürün müsaitlik miktarlarını güncelle
            await refreshProductAvailability();

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

            if (Object.keys(updatedItems).length === 0) {
                // Eğer hiç ürün kalmadıysa siparişi sil
                await apiCall(`/orders/${currentOrder.id}`, {
                    method: 'DELETE',
                });
                await updateTableStatus(tableId, "empty");
            } else {
                // Get user ID from token
                const roleInfo = getRoleInfoFromToken(localStorage.getItem('token') || '');
                const numericUserId = typeof roleInfo?.userId === 'string' && /^\d+$/.test(roleInfo.userId)
                    ? parseInt(roleInfo.userId, 10)
                    : (typeof roleInfo?.userId === 'number' ? roleInfo.userId : 1);
                
                // Get backend table ID
                const backendTableId = (() => {
                    const numeric = Number(tableId);
                    const byNumber = (tables || []).find(t => Number(t?.tableNumber ?? t?.number) === numeric);
                    if (byNumber?.id != null) return Number(byNumber.id);
                    const byId = (tables || []).find(t => Number(t?.id) === numeric);
                    if (byId?.id != null) return Number(byId.id);
                    return parseInt(tableId);
                })();

                // Prepare complete order data for backend
                const orderData = {
                    tableId: backendTableId,
                    userId: numericUserId,
                    items: Object.values(updatedItems).map(item => ({
                        productId: item.id,
                        quantity: item.count,
                    })),
                };

                // Update the complete order
                await apiCall(`/orders/${currentOrder.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData),
                });
            }
            
            await fetchData();
            
            // Sipariş güncellemesi sonrası ürün müsaitlik miktarlarını güncelle
            await refreshProductAvailability();

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
            
            // Sipariş güncellemesi sonrası ürün müsaitlik miktarlarını güncelle
            await refreshProductAvailability();
            
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
            // Get user ID from token
            const roleInfo = getRoleInfoFromToken(localStorage.getItem('token') || '');
            const numericUserId = typeof roleInfo?.userId === 'string' && /^\d+$/.test(roleInfo.userId)
                ? parseInt(roleInfo.userId, 10)
                : (typeof roleInfo?.userId === 'number' ? roleInfo.userId : 1);

            // Normalize date (yyyy-MM-dd) and time (HH:mm) to satisfy backend LocalDate/LocalTime expectations
            const normalizedDate = (() => {
                const raw = String(reservationData?.tarih || '').trim();
                if (!raw) return '';
                const dateOnly = raw.includes('T') ? raw.split('T')[0] : raw;
                const m = dateOnly.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
                if (!m) return dateOnly;
                const [, y, mo, d] = m;
                return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            })();

            const normalizedTime = (() => {
                let t = String(reservationData?.saat || '').trim();
                if (!t) return '';
                // If accidentally a datetime like 2025-08-19T12:00 or 12:00:00Z, reduce to HH:mm
                if (t.includes('T')) t = t.split('T')[1];
                t = t.replace('Z', '');
                if (t.includes('.')) t = t.split('.')[0];
                const parts = t.split(':');
                if (parts.length >= 2) {
                    const hh = String(parts[0]).padStart(2, '0');
                    const mm = String(parts[1]).padStart(2, '0');
                    return `${hh}:${mm}`;
                }
                return t;
            })();

            // Telefon numarasını temizle
            const cleanPhone = reservationData.telefon.replace(/[^0-9]/g, ''); // Sadece rakamlar
            const formattedPhone = cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone; // Başındaki 0'ı kaldır
            
            // Transform frontend data to backend format
            const backendData = {
                tableId: parseInt(tableId),
                customerName: `${reservationData.ad} ${reservationData.soyad}`,
                customerPhone: formattedPhone,
                email: reservationData.email || null,
                // Preferred keys for backend transformer (supports both TR and EN names)
                tarih: normalizedDate,
                saat: normalizedTime,
                reservationDate: normalizedDate,
                reservationTime: normalizedTime,
                personCount: parseInt(reservationData.kisiSayisi),
                // Both keys for compatibility
                not: reservationData.not || null,
                specialRequests: reservationData.not || null,
                statusId: 1, // Default to active reservation
                createdBy: numericUserId
            };

            console.log('Sending reservation data to backend:', backendData);

            const backendReservation = await apiCall('/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(backendData)
            });

            const reservationId = backendReservation.id || crypto.randomUUID();
            const newReservation = {
                id: reservationId,
                tableId,
                ad: reservationData.ad,
                soyad: reservationData.soyad,
                telefon: reservationData.telefon,
                email: reservationData.email,
                tarih: reservationData.tarih,
                saat: reservationData.saat,
                kisiSayisi: reservationData.kisiSayisi,
                not: reservationData.not,
                createdAt: backendReservation.createdAt || new Date().toISOString(),
                backendId: backendReservation.id,
            };

            setReservations(prev => ({
                ...prev,
                [reservationId]: newReservation
            }));
            await updateTableStatus(tableId, "reserved");

            // Refresh reservations data from backend to get the latest state
            try {
                const updatedReservations = await apiCall('/reservations');
                const reservationsById = (updatedReservations || []).reduce((acc, reservation) => {
                    if (reservation && reservation.id) {
                        const frontendReservation = {
                            id: reservation.id,
                            tableId: reservation.tableId,
                            ad: reservation.customerName ? reservation.customerName.split(' ')[0] : '',
                            soyad: reservation.customerName ? reservation.customerName.split(' ').slice(1).join(' ') : '',
                            telefon: reservation.customerPhone,
                            email: reservation.email,
                            tarih: reservation.reservationDate,
                            saat: reservation.reservationTime,
                            kisiSayisi: reservation.personCount,
                            not: reservation.specialRequests,
                            createdAt: reservation.createdAt,
                            backendId: reservation.id,
                        };
                        acc[reservation.id] = frontendReservation;
                    }
                    return acc;
                }, {});
                setReservations(reservationsById);
            } catch (refreshError) {
                console.warn('Failed to refresh reservations after creation:', refreshError);
            }

            return reservationId;
        } catch (error) {
            console.error('Failed to create reservation in backend:', error);
            setError(`Rezervasyon oluşturulurken hata oluştu: ${error.message}`);
            throw error; // Hatayı yukarı fırlat ki Dashboard'da yakalanabilsin
        }
    };

    const removeReservation = async (reservationId) => {
        try {
            setIsLoading(true);
            setError(null);
            
            const reservation = reservations[reservationId];
            const tableIdOfReservation = reservation?.tableId;

            await reservationService.deleteReservation(reservationId);
            
            // Local state: dictionary'den kaldır
            setReservations(prev => {
                const next = { ...prev };
                delete next[reservationId];
                return next;
            });

            // UI: Masa durumunu anında yeşile çek
            if (tableIdOfReservation) {
                setTableStatus(prev => ({ ...prev, [tableIdOfReservation]: 'empty' }));
            }

            // Backend'den güncel masaları çek (server truth)
            await loadTablesAndSalons();
        } catch (error) {
            console.error('Rezervasyon silme hatası:', error);
            setError(error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const updateReservation = async (reservationId, updatedData) => {
        try {
            const reservation = reservations[reservationId];
            if (reservation && reservation.backendId) {
                const cleanPhone = String(updatedData.telefon || '').replace(/[^0-9]/g, '');
                const formattedPhone = cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone;
                const safePersonCount = Number.parseInt(updatedData.kisiSayisi, 10);

                // DB tableId
                let dbTableId = null;
                try {
                    const backendRes = await apiCall(`/reservations/${reservation.backendId}`, { method: 'GET' });
                    dbTableId = backendRes?.tableId ?? null;
                } catch {}
                if (dbTableId == null) dbTableId = Number.parseInt(reservation.tableId, 10);

                const backendData = {
                    tableId: dbTableId,
                    customerName: `${updatedData.ad} ${updatedData.soyad}`.trim(),
                    customerPhone: formattedPhone,
                    email: updatedData.email || '',
                    reservationDate: updatedData.tarih,
                    reservationTime: updatedData.saat,
                    personCount: Number.isFinite(safePersonCount) ? safePersonCount : 1,
                    specialRequests: updatedData.not || '',
                    statusId: 1,
                    createdBy: Number.parseInt(localStorage.getItem('userId'), 10) || 1
                };

                // PUT
                await apiCall(`/reservations/${reservation.backendId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(backendData)
                });

                // Masaları anında tazele (masa boşalmış gibi görünmesin)
                await loadTablesAndSalons();

                // Local state
                setReservations(prev => ({
                    ...prev,
                    [reservationId]: {
                        ...prev[reservationId],
                        ...updatedData,
                        updatedAt: new Date().toISOString()
                    }
                }));
            }
        } catch (error) {
            console.error('Failed to update reservation in backend:', error);
            setError(`Rezervasyon güncellenirken hata oluştu: ${error.message}`);
            throw error;
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

    // Backend'den günlük sipariş sayısını al
    const [dailyCount, setDailyCount] = useState(0);
    const [monthlyCount, setMonthlyCount] = useState(0);
    const [yearlyCount, setYearlyCount] = useState(0);

    // Backend'den günlük sipariş sayısını al
    const fetchDailyOrderCount = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Accept': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(`${API_BASE_URL}/analytics/revenue/realtime?period=DAILY`, {
                method: 'GET',
                headers: headers
            });

            if (response.ok) {
                const data = await response.json();
                setDailyCount(data.totalOrders || 0);
            } else {
                console.warn('Failed to fetch daily order count from backend, using local calculation');
                // Fallback to local calculation
                let localDailyCount = 0;
                Object.values(completedOrders).forEach((order) => {
                    const d = new Date(order.creationDate);
                    if (d.toLocaleDateString() === todayStr) localDailyCount++;
                });
                setDailyCount(localDailyCount);
            }
        } catch (error) {
            console.error('Error fetching daily order count:', error);
            // Fallback to local calculation
            let localDailyCount = 0;
            Object.values(completedOrders).forEach((order) => {
                const d = new Date(order.creationDate);
                if (d.toLocaleDateString() === todayStr) localDailyCount++;
            });
            setDailyCount(localDailyCount);
        }
    }, [completedOrders, todayStr]);

    // Aylık ve yıllık sipariş sayılarını hesapla (şimdilik local)
    useEffect(() => {
        let localMonthlyCount = 0;
        let localYearlyCount = 0;

        Object.values(completedOrders).forEach((order) => {
            const d = new Date(order.creationDate);
            if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) localMonthlyCount++;
            if (d.getFullYear() === currentYear) localYearlyCount++;
        });

        setMonthlyCount(localMonthlyCount);
        setYearlyCount(localYearlyCount);
    }, [completedOrders, currentMonth, currentYear]);

    // Günlük sipariş sayısını al
    useEffect(() => {
        fetchDailyOrderCount();
    }, [fetchDailyOrderCount]);

    // Masa için aktif rezervasyonları tamamla (sipariş alındığında)
    const completeActiveReservationsForTable = async (tableId) => {
        try {
            // Backend table ID'sini bul
            const findBackendTableId = () => {
                const numeric = Number(tableId);
                const byId = (tables || []).find(t => Number(t?.id) === numeric);
                if (byId?.id != null) return byId.id;
                const byNumber = (tables || []).find(t => String(t?.tableNumber ?? t?.number) === String(tableId));
                if (byNumber?.id != null) return byNumber.id;
                return tableId;
            };
            const backendTableId = findBackendTableId();

            console.log(`Completing active reservations for table: ${tableId} (backend ID: ${backendTableId})`);

            await apiCall(`/reservations/${backendTableId}/complete-active`, {
                method: 'POST'
            });

            // Rezervasyon listesini yenile
            await fetchData();

            console.log(`Active reservations completed for table: ${tableId}`);

        } catch (error) {
            console.error('Failed to complete active reservations:', error);
            throw error;
        }
    };

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
                reservations,
                orderHistory,
                isLoading,
                error,
                isRefreshingAvailability,
                availabilityNotification,
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
                completeActiveReservationsForTable,
                addOrderHistoryEntry,
                getOrderContent,
                calculateFinancialImpact,
                removeConfirmedOrderItem,
                decreaseConfirmedOrderItem,
                increaseConfirmedOrderItem,
                addOrderItem,
                refreshProductAvailability
            }}
        >
            {children}
        </TableContext.Provider>
    );
}