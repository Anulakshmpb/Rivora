import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
    const [wishlistItems, setWishlistItems] = useState(() => {
        try {
            const savedWishlist = localStorage.getItem('atelier_wishlist');
            return savedWishlist ? JSON.parse(savedWishlist) : [];
        } catch (error) {
            console.error('Error loading wishlist from local storage:', error);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('atelier_wishlist', JSON.stringify(wishlistItems));
    }, [wishlistItems]);

    const addToWishlist = (product) => {
        setWishlistItems(prevItems => {
            const exists = prevItems.some(item => item._id === product._id);
            if (!exists) {
                return [...prevItems, product];
            }
            return prevItems;
        });
    };

    const removeFromWishlist = (productId) => {
        setWishlistItems(prevItems => prevItems.filter(item => item._id !== productId));
    };

    const clearWishlist = () => {
        setWishlistItems([]);
    };
    const wishlisttotal = wishlistItems.length;

    return (
        <WishlistContext.Provider value={{
            wishlistItems,
            addToWishlist,
            removeFromWishlist,
            clearWishlist,
            wishlisttotal
        }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    return useContext(WishlistContext);
}
