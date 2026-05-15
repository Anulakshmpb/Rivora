import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from './AuthContext';
import { useToast } from '../Toast/ToastContext';

const CartContext = createContext();

export function CartProvider({ children }) {
    const { showToast } = useToast();
    const { user, loading: authLoading } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [appliedCoupon, setAppliedCoupon] = useState(() => {
        const saved = localStorage.getItem('applied_coupon');
        return saved ? JSON.parse(saved) : null;
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const loadCart = async () => {
            if (authLoading) return;

            const token = localStorage.getItem('user_token') || localStorage.getItem('token');
            if (user && token && user.role === 'user') {
                setIsLoading(true);
                try {
                    const res = await axiosInstance.get('/api/cart');
                    const success = res.success || res.data?.success;
                    const data = res.data?.items ? res.data : (res.items ? res : res.data);

                    if (success && data.items) {
                        const items = data.items
                            .filter(item => item.product)
                            .map(item => ({
                                id: `${item.product._id}-${item.size}-${item.color || 'default'}`,
                                product: item.product,
                                quantity: item.quantity,
                                size: item.size,
                                color: item.color || 'default'
                            }));
                        setCartItems(items);
                    }
                } catch (error) {
                    console.error('Error fetching cart from backend:', error);
                    if (error.statusCode === 401 || error.status === 401) {
                        const savedCart = localStorage.getItem('atelier_cart');
                        if (savedCart) {
                            try {
                                setCartItems(JSON.parse(savedCart));
                            } catch (e) {}
                        }
                    }
                } finally {
                    setIsLoading(false);
                    setIsInitialized(true);
                }
            } else {
                const savedCart = localStorage.getItem('atelier_cart');
                if (savedCart) {
                    try {
                        setCartItems(JSON.parse(savedCart));
                    } catch (e) {
                        console.error('Error parsing cart from localStorage');
                    }
                }
                setIsInitialized(true);
            }
        };
        loadCart();
    }, [user, authLoading]);

    useEffect(() => {
        if (isInitialized) {
            if (!user || user.role === 'admin') {
                localStorage.setItem('atelier_cart', JSON.stringify(cartItems));
            }
            if (appliedCoupon) {
                localStorage.setItem('applied_coupon', JSON.stringify(appliedCoupon));
            } else {
                localStorage.removeItem('applied_coupon');
            }
        }
    }, [cartItems, appliedCoupon, user, isInitialized]);

    const addToGuestCart = (product, quantity, size, itemColor) => {
        const newItem = { 
            id: `${product._id}-${size}-${itemColor}`, 
            product, 
            quantity, 
            size, 
            color: itemColor 
        };

        setCartItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(
                item => item.product._id === product._id && 
                        item.size === size && 
                        (item.color || 'default') === itemColor
            );

            if (existingItemIndex >= 0) {
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex].quantity += quantity;
                return updatedItems;
            } else {
                return [...prevItems, newItem];
            }
        });
    };

    const addToCart = async (product, quantity, size, color = 'default') => {
        const itemColor = color || 'default';
        const isNormalUser = user && user.role === 'user';

        if (isNormalUser) {
            try {
                const res = await axiosInstance.post('/api/cart/add', {
                    productId: product._id,
                    quantity,
                    size,
                    color: itemColor
                });
                const success = res.success || res.data?.success;
                const data = res.data?.items ? res.data : (res.items ? res : res.data);

                if (success && data.items) {
                    const items = data.items
                        .filter(item => item.product)
                        .map(item => ({
                            id: `${item.product._id}-${item.size}-${item.color || 'default'}`,
                            product: item.product,
                            quantity: item.quantity,
                            size: item.size,
                            color: item.color || 'default'
                        }));
                    setCartItems(items);
                    showToast("Product added to cart successfully", "success");
                }
            } catch (error) {
                const isAuthError = error.error?.statusCode === 401 || error.statusCode === 401 || error.message?.includes('token') || error.message?.toLowerCase().includes('authorized');
                
                if (!isAuthError) {
                    showToast(error.message, "error");  
                } else {
                    // Fallback to guest cart if token expired
                    addToGuestCart(product, quantity, size, itemColor);
                }
            }
        } else {
            addToGuestCart(product, quantity, size, itemColor);
        }
    };

    const removeFromCart = async (itemId) => {
        const itemToRemove = cartItems.find(item => item.id === itemId);
        if (!itemToRemove) return;

        if (user && user.role === 'user') {
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
                    showToast("Product removed from cart successfully", "success");
                }
            } catch (error) {
                showToast(error.message, "error");
            }
        } else {
            setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
        }
    };

    const updateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        const itemToUpdate = cartItems.find(item => item.id === itemId);
        if (!itemToUpdate) return;

        if (user && user.role === 'user') {
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
                showToast(error.message, "error");
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
        if (user && user.role === 'user') {
            try {
                await axiosInstance.delete('/api/cart/clear');
                setCartItems([]);
            } catch (error) {
                showToast(error.message, "error");
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
            appliedCoupon,
            setAppliedCoupon,
            isLoading
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
