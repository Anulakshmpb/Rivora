import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await axiosInstance.get('/api/auth/get-profile');
                if (res.success && res.data && res.data.user) {
                    setUser(res.data.user);
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.error('Check auth failed:', err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    useEffect(() => {
        const handleAuthError = () => {
            setUser(null);
            localStorage.removeItem('token');
        };

        window.addEventListener('auth-error', handleAuthError);
        return () => window.removeEventListener('auth-error', handleAuthError);
    }, []);

    const login = async (userData, token) => {
        setUser(userData);
        if (token) localStorage.setItem('token', token);
    };

    const logout = async () => {
        try {
            await axiosInstance.post('/api/auth/logout');
            setUser(null);
            localStorage.removeItem('token');
        } catch (err) {
            console.error('Logout failed', err);
            setUser(null);
            localStorage.removeItem('token');
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
