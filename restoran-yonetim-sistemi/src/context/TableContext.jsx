import React, { createContext, useState, useEffect } from "react";

export const TableContext = createContext();

const API_BASE_URL = 'http://localhost:5174/api';

export function TableProvider({ children }) {
    const [tableStatus, setTableStatus] = useState({});
    const [orders, setOrders] = useState({});
    const [products, setProducts] = useState({});
    const [ingredients, setIngredients] = useState({});
    const [reservations, setReservations] = useState({});
    const [orderHistory, setOrderHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const [
                productsRes,
                productIngredientsRes,
                diningTablesRes,
                ordersRes,
                reservationsRes,
                stocksRes
            ] = await Promise.all([
                fetch(`${API_BASE_URL}/products`),
                fetch(`${API_BASE_URL}/product-ingredients`),
                fetch(`${API_BASE_URL}/dining-tables`),
                fetch(`${API_BASE_URL}/orders`),
                fetch(`${API_BASE_URL}/reservations`),
                fetch(`${API_BASE_URL}/stocks`)
            ]);
            
            if (!productsRes.ok || !productIngredientsRes.ok || !diningTablesRes.ok || !ordersRes.ok || !reservationsRes.ok || !stocksRes.ok) {
                throw new Error("API'lerden veri çekilirken hata oluştu.");
            }

            const productsData = await productsRes.json();
            const productIngredientsData = await productIngredientsRes.json();
            const diningTablesData = await diningTablesRes.json();
            const ordersData = await ordersRes.json();
            const reservationsData = await reservationsRes.json();
            const stocksData = await stocksRes.json();
            
            const newProducts = {};
            const newIngredients = {};
            
            if (Array.isArray(stocksData)) {
                 stocksData.forEach(item => {
                    newIngredients[item.id] = {
                        id: item.id,
                        name: item.name,
                        unit: item.unit,
                        stockQuantity: item.stockQuantity,
                        minStock: item.minStock || 0
                    };
                 });
            }

            if (Array.isArray(productsData)) {
                productsData.forEach(item => {
                    const categoryName = item.category;
                    if (!newProducts[categoryName]) {
                        newProducts[categoryName] = [];
                    }
                    newProducts[categoryName].push({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        category: categoryName,
                        description: item.description,
                        recipe: []
                    });
                });
            }

            if (Array.isArray(productIngredientsData)) {
                productIngredientsData.forEach(item => {
                    const categoryName = item.product.category;
                    const productId = item.product.id;
                    
                    const productToUpdate = newProducts[categoryName]?.find(p => p.id === productId);
                    if (productToUpdate) {
                        productToUpdate.recipe.push({
                            ingredientId: item.ingredient.id,
                            quantity: item.quantityPerUnit
                        });
                    }
                });
            }
            
            setProducts(newProducts);
            setIngredients(newIngredients);
            setTableStatus(diningTablesData);
            setOrders(ordersData);
            setReservations(reservationsData);

        } catch (err) {
            setError(err.message);
            console.error("Backend'den veri çekme hatası:", err);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, []);
    
    const apiCall = async (endpoint, options) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Sunucu hatası' }));
            throw new Error(errorData.message || "Beklenmedik bir hata oluştu.");
        }

        if (response.status === 204) {
            return null;
        }

        return await response.json();
    };
    
    const updateTableStatus = (tableId, status) => { setTableStatus(prev => ({ ...prev, [tableId]: status })); };
    
    const findProductById = (productId) => {
        for (const category in products) {
            const foundProduct = products[category].find(p => p.id === parseInt(productId, 10));
            if (foundProduct) {
                return foundProduct;
            }
        }
        return null;
    };
    
    const findProductRecipe = (productId) => { 
        let foundProduct = null;
        const parsedProductId = typeof productId === 'string' ? parseInt(productId, 10) : productId;
        Object.keys(products).forEach(category => {
            const product = products[category].find(p => p.id === parsedProductId);
            if (product) {
                foundProduct = product;
            }
        });
        return foundProduct?.recipe || [];
    };

    const checkIngredientStock = (orderItems) => { 
        const tempIngredients = JSON.parse(JSON.stringify(ingredients)); 
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
                totalPrice: item.count * product.price
            };
        });
        
        const orderData = {
            tableId: tableId,
            userId: 1, 
            waiterName: "Garson Adı", 
            totalPrice: orderItemsForBackend.reduce((sum, item) => sum + item.totalPrice, 0),
            items: orderItemsForBackend,
        };

        try {
            const result = await apiCall('/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });
            
            setOrders(result.updatedOrders);
            setIngredients(result.updatedIngredients);
            updateTableStatus(tableId, "occupied");
            
        } catch (error) {
            console.error("Sipariş kaydedilirken hata:", error);
            alert(`Sipariş kaydedilirken hata oluştu: ${error.message}`);
        }
    };
    
    const cancelOrder = async (tableId) => {
        try {
            const result = await apiCall('/orders/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tableId }),
            });
            
            setOrders(result.updatedOrders);
            setIngredients(result.updatedIngredients);
            updateTableStatus(tableId, "empty");
            
        } catch (error) {
            console.error("Sipariş iptal edilirken hata:", error);
            alert(`Sipariş iptal edilirken hata oluştu: ${error.message}`);
        }
    };
    
    const processPayment = async (tableId) => {
        try {
            const result = await apiCall('/orders/pay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tableId }),
            });
            
            setOrders(result.updatedOrders);
            setCompletedOrders(result.newCompletedOrder);
            updateTableStatus(tableId, "empty");
            
        } catch (error) {
            console.error("Ödeme alınırken hata:", error);
            alert(`Ödeme alınırken hata oluştu: ${error.message}`);
        }
    };

    const updateIngredientStock = async (ingredientId, amount) => {
        try {
            const result = await apiCall('/ingredients/update-stock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ingredientId, amount }),
            });
            setIngredients(result.updatedIngredients);
        } catch (error) {
            console.error("Stok güncellenirken hata:", error);
            alert(`Stok güncellenirken hata oluştu: ${error.message}`);
        }
    };
    
    const addProduct = async (category, productData) => {
        try {
            console.log("Ürün ekleme işlemi başladı.");
            
            const productDetails = {
                name: productData.name,
                price: productData.price,
                description: productData.description,
                category: category
            };
            
            console.log("Adım 1: Ürünü ekliyor...", productDetails);
            const newProduct = await apiCall('/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productDetails),
            });
            
            console.log("Adım 1 Başarılı. Yeni ürün ID:", newProduct.id);
            
            if (productData.recipe && productData.recipe.length > 0) {
                console.log("Adım 2: Tarif bilgilerini tek tek ekliyor...");
                for (const item of productData.recipe) {
                    const recipeItemForBackend = {
                        productId: newProduct.id,
                        ingredientId: item.ingredientId,
                        quantityPerUnit: item.quantity
                    };
                    
                    console.log(`Tarif öğesi ekleniyor: ${JSON.stringify(recipeItemForBackend)}`);
                    await apiCall('/product-ingredients', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(recipeItemForBackend),
                    });
                    console.log(`Tarif öğesi başarıyla eklendi.`);
                }
                
                console.log("Adım 2 Başarılı. Tüm tarif öğeleri eklendi.");
            } else {
                console.log("Tarif bulunamadı, bu adım atlanıyor.");
            }

            console.log("Adım 3: Veriler yeniden çekiliyor...");
            await fetchData();
            console.log("Ürün ekleme işlemi başarıyla tamamlandı.");

        } catch (error) {
            console.error("Ürün eklenirken genel bir hata oluştu:", error);
            alert(`Ürün eklenirken hata: ${error.message}`);
        }
    };

    const deleteProduct = async (category, productId) => {
        try {
            await apiCall(`/products/${productId}`, {
                method: 'DELETE',
            });
            
            await fetchData();
            
        } catch (error) {
            console.error('Hata detay:', error);
            alert(`Ürün silinirken hata: ${error.message}`);
        }
    };

    const updateProductAndRecipe = async (category, productData) => {
    try {
        console.log("Ürün bilgilerini güncelliyor...");
        await apiCall(`/products/${productData.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: productData.name,
                price: productData.price,
                description: productData.description
            }),
        });
        console.log("Ürün bilgileri güncellendi.");

        console.log("Mevcut tarifi siliyor...");
        await apiCall(`/product-ingredients/${productData.id}`, {
            method: 'DELETE',
        });
        console.log("Mevcut tarif başarıyla silindi.");

        if (productData.recipe && productData.recipe.length > 0) {
            console.log("Yeni tarif bilgilerini ekliyor...");
            for (const item of productData.recipe) {
                const recipeItemForBackend = {
                    productId: productData.id,
                    ingredientId: item.ingredientId,
                    quantityPerUnit: item.quantity
                };
                await apiCall('/product-ingredients', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(recipeItemForBackend),
                });
            }
            console.log("Yeni tarif başarıyla eklendi.");
        }
        
        console.log("Tüm işlemler tamamlandı. Veriler yeniden çekiliyor...");
        await fetchData();

    } catch (error) {
        console.error("Ürün ve tarifi güncellenirken hata:", error);
        alert(`Ürün ve tarifi güncellenirken hata: ${error.message}`);
    }
};

    const deleteProductIngredient = async (productId, ingredientId) => {
        try {
            console.log(`Tariften malzeme siliniyor: Ürün ID: ${productId}, Malzeme ID: ${ingredientId}`);
            await apiCall(`/product-ingredients/${productId}/${ingredientId}`, {
                method: 'DELETE',
            });
            console.log("Malzeme başarıyla silindi. Veriler yeniden çekiliyor...");
            await fetchData();
        } catch (error) {
            console.error("Tarif malzemesi silinirken hata:", error);
            alert(`Tarif malzemesi silinirken hata: ${error.message}`);
        }
    };

    // YENİ FONKSİYON: Tarif malzemesi ekleme
    const addProductIngredient = async (productId, newIngredientData) => {
        try {
            console.log(`Tarife malzeme ekleniyor: Ürün ID: ${productId}, Malzeme ID: ${newIngredientData.ingredientId}`);
            await apiCall('/product-ingredients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: newIngredientData.productId,
                    ingredientId: newIngredientData.ingredientId,
                    quantityPerUnit: newIngredientData.quantity
                }),
            });
            console.log("Malzeme başarıyla eklendi. Veriler yeniden çekiliyor...");
            await fetchData();
        } catch (error) {
            console.error("Tarife malzeme eklenirken hata:", error);
            alert(`Tarife malzeme eklenirken hata: ${error.message}`);
        }
    };
    
    const addReservation = () => {};
    const addSpecialReservation = () => {};
    const removeReservation = () => {};
    const updateReservation = () => {};
    const clearAllReservations = () => {};
    const addOrderHistoryEntry = () => {};
    const getOrderContent = () => {};
    const calculateFinancialImpact = () => {};
    
    return (
        <TableContext.Provider
            value={{
                tableStatus, orders, products, ingredients,
                reservations, orderHistory,
                isLoading, error,
                updateTableStatus, saveFinalOrder, cancelOrder, processPayment,
                updateIngredientStock,
                addReservation, addSpecialReservation, removeReservation, updateReservation, clearAllReservations,
                addProduct, deleteProduct, updateProduct: updateProductAndRecipe, deleteProductIngredient,
                addProductIngredient, // BURAYA EKLENDİ
                addOrderHistoryEntry, getOrderContent, calculateFinancialImpact,
            }}
        >
            {children}
        </TableContext.Provider>
    );
}