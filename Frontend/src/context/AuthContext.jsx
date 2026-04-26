import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await axiosInstance.get('/auth/get-profile');
                setUser(res.data.data.user);
            } catch (err) {
                // If token is invalid or expired, clear it
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (userData) => {
        // Assume the backend now sets the cookie
        // We still get user data back in the response
        setUser(userData);
    };

    const logout = async () => {
        try {
            await axiosInstance.post('/auth/logout');
            setUser(null);
        } catch (err) {
            console.error('Logout failed', err);
            // Even if backend fails, clear local state
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
