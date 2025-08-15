import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const BootstrapContext = createContext();

export const useBootstrap = () => {
    const context = useContext(BootstrapContext);
    if (!context) {
        throw new Error('useBootstrap must be used within a BootstrapProvider');
    }
    return context;
};

export const BootstrapProvider = ({ children }) => {
    const [needsBootstrap, setNeedsBootstrap] = useState(false);
    const [bootstrapLoading, setBootstrapLoading] = useState(true);
    const [bootstrapError, setBootstrapError] = useState(null);

    const checkBootstrapStatus = async () => {
        try {
            setBootstrapLoading(true);
            setBootstrapError(null);
            
            // Check if bootstrap was just completed (temporary override)
            const bootstrapCompleted = sessionStorage.getItem('bootstrapCompleted');
            if (bootstrapCompleted === 'true') {
                console.log('Bootstrap was recently completed, skipping check');
                setNeedsBootstrap(false);
                // Remove the flag after using it
                sessionStorage.removeItem('bootstrapCompleted');
                return;
            }
            
            const response = await authService.getUserCount();
            console.log('User count response:', response);
            
            // Handle different response formats from backend
            let userCount = 0;
            if (typeof response === 'number') {
                // Backend returns count directly as number
                userCount = response;
            } else if (response?.userCount !== undefined) {
                // Backend returns {userCount: number}
                userCount = response.userCount;
            } else if (response?.count !== undefined) {
                // Backend returns {count: number}
                userCount = response.count;
            } else {
                // Fallback - try to parse as number
                userCount = parseInt(response) || 0;
            }
            
            console.log('Determined user count:', userCount);
            setNeedsBootstrap(userCount === 0);
            
        } catch (error) {
            console.error('Bootstrap status check failed:', error);
            setBootstrapError(error.message);
            // If we can't check user count, assume we don't need bootstrap
            // This prevents blocking the app if the endpoint is not available
            setNeedsBootstrap(false);
        } finally {
            setBootstrapLoading(false);
        }
    };

    useEffect(() => {
        // Only check bootstrap status if user is not authenticated
        const token = localStorage.getItem('token');
        if (!token) {
            checkBootstrapStatus();
        } else {
            // If user is authenticated, no need for bootstrap
            setNeedsBootstrap(false);
            setBootstrapLoading(false);
        }
    }, []);

    const value = {
        needsBootstrap,
        bootstrapLoading,
        bootstrapError,
        checkBootstrapStatus,
        setNeedsBootstrap,
        // Debug method to force refresh bootstrap status
        forceRefreshBootstrap: () => {
            const token = localStorage.getItem('token');
            if (!token) {
                checkBootstrapStatus();
            } else {
                setNeedsBootstrap(false);
            }
        },
        // Method to completely reset application state
        resetApplicationState: () => {
            // Set flag before clearing storage to indicate bootstrap was completed
            sessionStorage.setItem('bootstrapCompleted', 'true');
            
            // Clear all storage (except the flag we just set)
            localStorage.clear();
            // Note: We don't clear sessionStorage here because we need the flag
            
            // Clear cookies
            document.cookie.split(";").forEach(function(c) { 
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
            });
            
            // Reset bootstrap state
            setNeedsBootstrap(false);
            setBootstrapLoading(false);
            setBootstrapError(null);
            
            // Force page reload after short delay
            setTimeout(() => {
                window.location.href = '/login';
            }, 100);
        }
    };

    return (
        <BootstrapContext.Provider value={value}>
            {children}
        </BootstrapContext.Provider>
    );
};

export default BootstrapProvider;
