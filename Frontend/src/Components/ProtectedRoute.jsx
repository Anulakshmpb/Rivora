import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * A wrapper component for routes that require authentication
 * @param {Array} allowedRoles - List of roles that can access this route (e.g. ['admin', 'user'])
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    const location = useLocation();
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
        // Redirect to login if not authenticated
        // Store the current location to redirect back after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        // If role is not allowed, redirect to home or unauthorized page
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
