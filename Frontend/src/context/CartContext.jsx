import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const savedCart = localStorage.getItem('atelier_cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error('Error loading cart from local storage:', error);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('atelier_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, quantity, size, color) => {
        setCartItems(prevItems => {
            // Check if exact variant already exists in cart
            const existingItemIndex = prevItems.findIndex(
                item => item.product._id === product._id && item.size === size && item.color === color
            );

            if (existingItemIndex >= 0) {
                // If it exists, increment the quantity
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex].quantity += quantity;
                return updatedItems;
            } else {
                // Otherwise, add new item
                return [...prevItems, { 
                    id: `${product._id}-${size}-${color || 'default'}`, 
                    product, 
                    quantity, 
                    size, 
                    color 
                }];
            }
        });
    };

    const removeFromCart = (itemId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    };

    const updateQuantity = (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        setCartItems(prevItems => 
            prevItems.map(item => 
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
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
            cartTotalPrice
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
