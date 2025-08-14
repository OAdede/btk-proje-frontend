import React, { createContext, useState, useEffect, useCallback } from "react";

export const TableContext = createContext();

const API_BASE_URL = "http://localhost:5174/api";

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
    const [timestamps, setTimestamps] = useState({});
    const [orderHistory, setOrderHistory] = useState(() => readFromLocalStorage('orderHistory', []));
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const apiCall = async (endpoint, options) => {
        try {
            console.log(`API çağrısı yapılıyor: ${endpoint}`);
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Sunucu hatası' }));
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
            console.error(`API çağrısı başarısız: ${endpoint}`, err);
            throw err;
        }
    };

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        console.log("Veriler sunucudan alınıyor...");

        try {
            const [productsData, stocksData, productIngredientsData, diningTablesData, ordersData, salonsData] = await Promise.all([
                apiCall('/products'),
                apiCall('/stocks'),
                apiCall('/product-ingredients'),
                apiCall('/dining-tables'),
                apiCall('/orders'),
                apiCall('/salons'),
            ]);
        
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
                acc[item.id] = {
                    id: item.id,
                    name: item.name,
                    unit: item.unit,
                    stockQuantity: item.stockQuantity,
                    minStock: item.minStock || 0
                };
                return acc;
            }, {});
            console.log("İçerik verisi güncellendi:", newIngredients);
            setIngredients(newIngredients);
        
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
                    recipe: []
                };
                newProductsByCategory[categoryName].push(productWithRecipe);
                productsByIdTemp[item.id] = productWithRecipe;
            });
        
            (productIngredientsData || []).forEach(item => {
                const productId = item.product?.id;
                if (productsByIdTemp[productId]) {
                    productsByIdTemp[productId].recipe.push({
                        ingredientId: item.ingredient.id,
                        quantity: item.quantityPerUnit,
                        name: item.ingredient.name
                    });
                } else {
                    console.warn(`Tarif için ürün bulunamadı. Muhtemelen API'den gelmeyen bir ürünün tarifi var. Ürün ID: ${productId}`);
                }
            });
        
            console.log("İşlenen ürün verileri (kategoriye göre):", newProductsByCategory);
            console.log("İşlenen ürün verileri (ID'ye göre):", productsByIdTemp);
            
            setProducts(newProductsByCategory);
            setProductsById(productsByIdTemp);
            
            const ordersByTable = (ordersData || []).reduce((acc, order) => {
                const tableId = order.tableId;
                acc[tableId] = {
                    ...order,
                    items: (order.items || []).reduce((itemAcc, item) => {
                        itemAcc[item.productId] = {
                            id: item.productId,
                            name: item.productName,
                            price: item.unitPrice,
                            count: item.quantity,
                            note: item.note || ''
                        };
                        return itemAcc;
                    }, {})
                };
                return acc;
            }, {});
            setOrders(ordersByTable);

            const completedOrdersData = (ordersData || []).filter(order => order.status === "paid");
            setCompletedOrders(completedOrdersData || {});
            
            const reservationsById = (ordersData || []).filter(order => order.status === "reserved").reduce((acc, res) => {
                acc[res.id] = res;
                return acc;
            }, {});
            setReservations(reservationsById);

            console.log("Veriler başarıyla alındı ve işlendi.");
            
        } catch (err) {
            console.error("Veriler alınırken hata:", err);
            setError("Veriler sunucudan alınırken bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    }, [apiCall]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
                if (!tempIngredients[ingredient.ingredientId] || tempIngredients[ingredient.ingredientId].stockQuantity < required) {
                    return false;
                }
                tempIngredients[ingredient.ingredientId].stockQuantity -= required;
            }
        }
        return true;
    };
    
    const updateTableStatus = async (tableId, status) => {
        try {
            await apiCall(`/dining-tables/${tableId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ statusName: status })
            });
            await fetchData();
        } catch (error) {
            console.error('Error updating table status:', error);
            setError('Masa durumu güncellenirken bir hata oluştu.');
        }
    };

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

        const orderData = {
            tableId: parseInt(tableId),
            userId: 1, 
            waiterName: "Garson Adı", 
            totalPrice: orderItemsForBackend.reduce((sum, item) => sum + item.totalPrice, 0),
            items: orderItemsForBackend,
        };
        
        try {
            const currentOrder = orders[tableId];
            if (currentOrder && currentOrder.id) {
                 await apiCall(`/orders/${currentOrder.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...orderData, orderId: currentOrder.id }),
                 });
            } else {
                 await apiCall('/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData),
                });
            }
            
            for (const [id, item] of Object.entries(finalItems)) {
                const recipe = findProductRecipe(id);
                for (const ingredient of recipe) {
                    const movement = {
                        id: 0,
                        stockId: ingredient.ingredientId,
                        change: -(ingredient.quantity * item.count),
                        reason: "ORDER",
                        note: "Sipariş",
                        timestamp: new Date().toISOString()
                    };
                    await apiCall('/stock-movements', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(movement)
                    });
                }
            }
            
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
            
            await apiCall(`/orders/${orderToCancel.id}/cancel`, {
                method: 'POST',
            });
            
            for (const item of Object.values(orderToCancel.items)) {
                const recipe = findProductRecipe(item.productId);
                for (const ingredient of recipe) {
                    const movement = {
                        id: 0,
                        stockId: ingredient.ingredientId,
                        change: ingredient.quantity * item.quantity,
                        reason: "CANCELLED_ORDER",
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

            await apiCall(`/orders/${orderToPay.id}/pay`, {
                method: 'POST',
            });
            await fetchData();
            updateTableStatus(tableId, "empty");
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
    
            const orderData = {
                tableId: parseInt(tableId),
                userId: 1, 
                waiterName: "Garson Adı", 
                totalPrice: Object.values(updatedItems).reduce((sum, item) => sum + item.unitPrice * item.count, 0),
                items: Object.values(updatedItems).map(item => ({
                    productId: item.id,
                    productName: item.name,
                    quantity: item.count,
                    unitPrice: item.price,
                    totalPrice: item.count * item.price,
                    note: item.note || ''
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
    
            const orderData = {
                tableId: parseInt(tableId),
                userId: 1, 
                waiterName: "Garson Adı", 
                totalPrice: Object.values(updatedItems).reduce((sum, item) => sum + item.unitPrice * item.count, 0),
                items: Object.values(updatedItems).map(item => ({
                    productId: item.id,
                    productName: item.name,
                    quantity: item.count,
                    unitPrice: item.price,
                    totalPrice: item.count * item.price,
                    note: item.note || ''
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
    
            const orderData = {
                tableId: parseInt(tableId),
                userId: 1, 
                waiterName: "Garson Adı", 
                totalPrice: Object.values(updatedItems).reduce((sum, item) => sum + item.unitPrice * item.count, 0),
                items: Object.values(updatedItems).map(item => ({
                    productId: item.id,
                    productName: item.name,
                    quantity: item.count,
                    unitPrice: item.price,
                    totalPrice: item.count * item.price,
                    note: item.note || ''
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
            
            await apiCall(`/products/${productId}`, {
                method: 'DELETE',
            });
            await fetchData();
        } catch (error) {
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
                    category: category
                }),
            });
            
            const existingRecipe = await apiCall(`/product-ingredients/product/${updatedProduct.id}`);
            if (existingRecipe && existingRecipe.length > 0) {
                for (const item of existingRecipe) {
                    await apiCall(`/product-ingredients/product/${updatedProduct.id}/ingredient/${item.ingredient.id}`, { method: 'DELETE' });
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

            const newIngredient = await apiCall('/stocks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: ingredientData.name,
                    unit: ingredientData.unit,
                    stockQuantity: Number(ingredientData.stockQuantity),
                    minStock: Number(ingredientData.minStock) || 0,
                })
            });

            if (!newIngredient || !newIngredient.id) {
                throw new Error("API'den geçerli bir stok malzemesi yanıtı alınamadı.");
            }

            console.log("Stok malzemesi başarıyla eklendi, stok hareketi oluşturuluyor:", newIngredient);

            // Yeni eklenen stok malzemesi için başlangıç stok hareketini kaydediyoruz
            const movement = {
                stockId: newIngredient.id,
                change: newIngredient.stockQuantity,
                reason: "MANUAL_ADJUSTMENT",
                note: "Yeni içerik eklendi (Başlangıç Stoğu)",
            };
            
            await apiCall('/stock-movements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(movement)
            });
            
            console.log("fetchData fonksiyonu çağrılıyor...");
            await fetchData();
            console.log("fetchData fonksiyonu tamamlandı.");

            alert("İçerik başarıyla eklendi!");
            
        } catch (error) {
            console.error("İçerik eklenirken hata:", error);
            setError(`İçerik eklenirken hata oluştu: ${error.message}`);
            alert(`Hata: İçerik eklenirken bir sorun oluştu. Detaylar için konsolu kontrol edin.`);
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
                    stockId: stockId,
                    change: change, 
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
                reservations,
                orderHistory,
                isLoading,
                error,
                dailyOrderCount: dailyCount,
                monthlyOrderCount: monthlyCount,
                yearlyOrderCount: yearlyCount,
                updateTableStatus,
                saveFinalOrder,
                cancelOrder,
                processPayment,
                addProduct,
                deleteProduct,
                updateProduct,
                updateIngredientStock,
                findProductById,
                addIngredient,
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
                increaseConfirmedOrderItem
            }}
        >
            {children}
        </TableContext.Provider>
    );
}