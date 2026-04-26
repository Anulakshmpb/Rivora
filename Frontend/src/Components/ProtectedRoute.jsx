import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles, guestOnly = false, redirectTo = "/login" }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
            </div>
        );
    }

    if (guestOnly && isAuthenticated) {
        // Redirect authenticated users away from guest-only pages (like Login/Register)
        return <Navigate to="/" replace />;
    }

    if (!guestOnly && !isAuthenticated) {
        // Redirect unauthenticated users to login
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Redirect unauthorized users to home
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
