// Order API Service - Backend communication layer for orders and order items
const API_BASE_URL = (import.meta?.env?.VITE_API_BASE_URL) || '/api';

export const orderService = {
    // Get all orders
    async getAllOrders() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    },

    // Get orders by table ID (filters from all orders)
    async getOrdersByTableId(tableId) {
        try {
            const token = localStorage.getItem('token');
            
            // First try to get the open order for this table
            try {
                const openOrderResponse = await fetch(`${API_BASE_URL}/orders/table/${tableId}/open`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });

                if (openOrderResponse.ok) {
                    const openOrder = await openOrderResponse.json();
                    return [openOrder]; // Return as array for consistency
                } else if (openOrderResponse.status === 204) {
                    // No open order found, return empty array
                    return [];
                }
            } catch (openOrderError) {
                console.warn('Could not fetch open order, falling back to all orders:', openOrderError);
            }

            // Fallback: get all orders and filter by table ID
            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const allOrders = await response.json();
            
            // Filter orders by table ID
            const tableOrders = (allOrders || []).filter(order => 
                order && order.tableId && String(order.tableId) === String(tableId)
            );

            return tableOrders;
        } catch (error) {
            console.error('Error fetching orders by table:', error);
            throw error;
        }
    },

    // Get order by ID
    async getOrderById(orderId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching order:', error);
            throw error;
        }
    },

    // Create new order
    async createOrder(orderData) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/orders/make-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    },

    // Update existing order
    async updateOrder(orderId, orderData) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating order:', error);
            throw error;
        }
    },

    // Delete order
    async deleteOrder(orderId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
            }

            return true;
        } catch (error) {
            console.error('Error deleting order:', error);
            throw error;
        }
    },

    // Get order items by order ID
    async getOrderItems(orderId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const order = await response.json();
            return order.items || [];
        } catch (error) {
            console.error('Error fetching order items:', error);
            throw error;
        }
    },

    // Add item to order
    async addOrderItem(orderId, itemData) {
        try {
            const token = localStorage.getItem('token');
            
            // First get the current order
            const currentOrderResponse = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });

            if (!currentOrderResponse.ok) {
                throw new Error(`HTTP ${currentOrderResponse.status}: ${currentOrderResponse.statusText}`);
            }

            const currentOrder = await currentOrderResponse.json();
            
            // Add the new item to the existing items
            const updatedItems = [...(currentOrder.items || []), itemData];
            
            // Update the order with new items
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    tableId: currentOrder.tableId,
                    items: updatedItems
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error adding order item:', error);
            throw error;
        }
    },

    // Update order item
    async updateOrderItem(orderId, itemId, itemData) {
        try {
            const token = localStorage.getItem('token');
            
            // First get the current order
            const currentOrderResponse = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });

            if (!currentOrderResponse.ok) {
                throw new Error(`HTTP ${currentOrderResponse.status}: ${currentOrderResponse.statusText}`);
            }

            const currentOrder = await currentOrderResponse.json();
            
            // Update the specific item in the items array
            const updatedItems = (currentOrder.items || []).map(item => 
                item.productId === itemId ? { ...item, ...itemData } : item
            );
            
            // Update the order with updated items
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    tableId: currentOrder.tableId,
                    items: updatedItems
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating order item:', error);
            throw error;
        }
    },

    // Remove order item
    async removeOrderItem(orderId, itemId) {
        try {
            const token = localStorage.getItem('token');
            
            // First get the current order
            const currentOrderResponse = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });

            if (!currentOrderResponse.ok) {
                throw new Error(`HTTP ${currentOrderResponse.status}: ${currentOrderResponse.statusText}`);
            }

            const currentOrder = await currentOrderResponse.json();
            
            // Remove the specific item from the items array
            const updatedItems = (currentOrder.items || []).filter(item => item.productId !== itemId);
            
            // Update the order with updated items
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    tableId: currentOrder.tableId,
                    items: updatedItems
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
            }

            return true;
        } catch (error) {
            console.error('Error removing order item:', error);
            throw error;
        }
    },

    // Get current user's orders (for waiters)
    async getMyOrders() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/orders/my`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Raw API Response:', JSON.stringify(data, null, 2));
            return data;
        } catch (error) {
            console.error('Error fetching my orders:', error);
            throw error;
        }
    },

    // Delete order
    async deleteOrder(orderId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
            }

            return true;
        } catch (error) {
            console.error('Error deleting order:', error);
            throw error;
        }
    }
};
