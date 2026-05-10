import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Initial load: from localStorage or Backend
    useEffect(() => {
        const loadCart = async () => {
            if (user) {
                setIsLoading(true);
                try {
                    const res = await axiosInstance.get('/api/cart');
                    if (res.success) {
                        // Transform backend items to frontend format if needed
                        const items = res.data.items.map(item => ({
                            id: `${item.product._id}-${item.size}-${item.color || 'default'}`,
                            product: item.product,
                            quantity: item.quantity,
                            size: item.size,
                            color: item.color
                        }));
                        setCartItems(items);
                    }
                } catch (error) {
                    console.error('Error fetching cart from backend:', error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                const savedCart = localStorage.getItem('atelier_cart');
                if (savedCart) setCartItems(JSON.parse(savedCart));
            }
        };
        loadCart();
    }, [user]);

    // Save guest cart to localStorage
    useEffect(() => {
        if (!user) {
            localStorage.setItem('atelier_cart', JSON.stringify(cartItems));
        }
    }, [cartItems, user]);

    const addToCart = async (product, quantity, size, color) => {
        const newItem = { 
            id: `${product._id}-${size}-${color || 'default'}`, 
            product, 
            quantity, 
            size, 
            color 
        };

        if (user) {
            try {
                const res = await axiosInstance.post('/api/cart/add', {
                    productId: product._id,
                    quantity,
                    size,
                    color
                });
                if (res.success) {
                    const items = res.data.items.map(item => ({
                        id: `${item.product._id}-${item.size}-${item.color || 'default'}`,
                        product: item.product,
                        quantity: item.quantity,
                        size: item.size,
                        color: item.color
                    }));
                    setCartItems(items);
                }
            } catch (error) {
                console.error('Error adding to cart:', error);
            }
        } else {
            setCartItems(prevItems => {
                const existingItemIndex = prevItems.findIndex(
                    item => item.product._id === product._id && item.size === size && item.color === color
                );

                if (existingItemIndex >= 0) {
                    const updatedItems = [...prevItems];
                    updatedItems[existingItemIndex].quantity += quantity;
                    return updatedItems;
                } else {
                    return [...prevItems, newItem];
                }
            });
        }
    };

    const removeFromCart = async (itemId) => {
        const itemToRemove = cartItems.find(item => item.id === itemId);
        if (!itemToRemove) return;

        if (user) {
            try {
                const res = await axiosInstance.delete('/api/cart/remove', {
                    data: {
                        productId: itemToRemove.product._id,
                        size: itemToRemove.size,
                        color: itemToRemove.color
                    }
                });
                if (res.success) {
                    const items = res.data.items.map(item => ({
                        id: `${item.product._id}-${item.size}-${item.color || 'default'}`,
                        product: item.product,
                        quantity: item.quantity,
                        size: item.size,
                        color: item.color
                    }));
                    setCartItems(items);
                }
            } catch (error) {
                console.error('Error removing from cart:', error);
            }
        } else {
            setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
        }
    };

    const updateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        const itemToUpdate = cartItems.find(item => item.id === itemId);
        if (!itemToUpdate) return;

        if (user) {
            try {
                const res = await axiosInstance.put('/api/cart/update', {
                    productId: itemToUpdate.product._id,
                    quantity: newQuantity,
                    size: itemToUpdate.size,
                    color: itemToUpdate.color
                });
                if (res.success) {
                    const items = res.data.items.map(item => ({
                        id: `${item.product._id}-${item.size}-${item.color || 'default'}`,
                        product: item.product,
                        quantity: item.quantity,
                        size: item.size,
                        color: item.color
                    }));
                    setCartItems(items);
                }
            } catch (error) {
                console.error('Error updating quantity:', error);
            }
        } else {
            setCartItems(prevItems => 
                prevItems.map(item => 
                    item.id === itemId ? { ...item, quantity: newQuantity } : item
                )
            );
        }
    };

    const clearCart = async () => {
        if (user) {
            try {
                await axiosInstance.delete('/api/cart/clear');
                setCartItems([]);
            } catch (error) {
                console.error('Error clearing cart:', error);
            }
        } else {
            setCartItems([]);
        }
    };

    const cartTotalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    const cartTotalPrice = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotalItems,
            cartTotalPrice,
            isLoading
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
